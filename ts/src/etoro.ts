
//  ---------------------------------------------------------------------------

import Exchange from './abstract/etoro.js';
import { ExchangeError, AuthenticationError, PermissionDenied, ArgumentsRequired, BadRequest, BadSymbol, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound, RateLimitExceeded, ExchangeNotAvailable, MarketClosed, OperationRejected, DuplicateOrderId } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Account, Balances, Currency, Dict, Endpoint, Int, LedgerEntry, List, Market, MarketInterface, NullableDict, Num, OHLCV, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class etoro
 * @augments Exchange
 */
export default class etoro extends Exchange {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'id': 'etoro',
            'name': 'eToro',
            'countries': [ 'IL', 'CY', 'GB', 'US', 'AU' ],
            'version': 'v1',
            'rateLimit': 1000, // default shared quota: 60 requests per 60 seconds
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
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
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfer': true,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://etoro-cdn.etorostatic.com/web-client/img/logo/etoro-logo-green.svg',
                'api': {
                    'public': 'https://public-api.etoro.com',
                    'private': 'https://public-api.etoro.com',
                },
                'test': {
                    'public': 'https://public-api.etoro.com',
                    'private': 'https://public-api.etoro.com',
                },
                'demo': {
                    'public': 'https://public-api.etoro.com',
                    'private': 'https://public-api.etoro.com',
                },
                'www': 'https://www.etoro.com',
                'doc': [
                    'https://api-portal.etoro.com/',
                ],
                'fees': 'https://www.etoro.com/trading/fees/',
            },
            'api': {
                'public': {
                    'get': {
                        // Market Data (120 req / 60s shared quota -> cost 0.5)
                        'api/v1/market-data/exchanges': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/market-data/instrument-types': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/market-data/instruments': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/market-data/instruments/history/closing-price': { 'cost': 0.5 } as Endpoint<List>,
                        'api/v1/market-data/instruments/rates': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/market-data/instruments/{instrumentId}/history/candles/{direction}/{interval}/{candlesCount}': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/market-data/search': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/market-data/stocks-industries': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v2/market-data/instruments': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v2/market-data/instruments/search': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v2/market-data/rates': { 'cost': 0.5 } as Endpoint<Dict>,
                        // Data - Candles & Public Catalog (120 req / 60s for candles, 60 req / 60s default)
                        'api/v1/data/instruments/{instrumentId}/candles': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/data/instruments/{instrumentId}/candles/coverage': { 'cost': 0.5 } as Endpoint<Dict>,
                        'api/v1/data/strategy-prompts': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/data/strategy-prompts/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        // Curated / Discovery / Rankings / User Stats
                        'api/v1/curated-lists': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/market-recommendations/{itemsCount}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/pi-data/copiers': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/portfolios/search': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/user-info/people': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/user-info/people/search': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/user-info/people/{username}/daily-gain': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/user-info/people/{username}/gain': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/user-info/people/{username}/portfolio/live': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/user-info/people/{username}/tradeinfo': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/rankings': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/rankings/presets': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/rankings/presets/{type}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/rankings/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/rankings/tags': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/{username}/assets/history': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/{username}/copiers': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/{username}/exposure/history': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/{username}/gain/{granularity}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/portfolios/{username}/rankings': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'api/v2/portfolios/rankings/multiple': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        // Identity & Clubs & Notifications
                        'api/v1/me': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/clubs': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/notifications/messages': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/impressions/topassets/user/{gcid}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/keydata/{application}': { 'cost': 1 } as Endpoint<Dict>,
                        // Balances
                        'api/v1/balances': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/balances/history': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/balances/{accountType}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/balances/{accountType}/history': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/balances/{accountType}/{accountId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/balances/{accountType}/{accountId}/history': { 'cost': 1 } as Endpoint<Dict>,
                        // Data (User-scoped)
                        'api/v1/data/positions/closed-events/history': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/data/stockback/payments': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/data/stockback/promo-status': { 'cost': 1 } as Endpoint<Dict>,
                        // Cash Accounts & Transfers
                        'api/v1/money/accounts/cash/{accountId}/transactions': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/money/transfer-eligibility': { 'cost': 1 } as Endpoint<List>,
                        'api/v1/money/transfer-fee-configurations': { 'cost': 1 } as Endpoint<List>,
                        'api/v1/money/transfer-limits': { 'cost': 1 } as Endpoint<List>,
                        'api/v1/money/transferable-balance': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/money/transfers/{transferId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/money/transfers:lookup': { 'cost': 1 } as Endpoint<Dict>,
                        // Sub-Accounts & Agent Portfolios
                        'api/v1/sub-accounts/me/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/etoro-trading/user-tokens': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/etoro-trading/user-tokens/scopes': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/agent-portfolios': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/agent-portfolios/user-tokens/scopes': { 'cost': 1 } as Endpoint<Dict>,
                        // Trading Info - Real
                        'api/v1/trading/info/aggregate-portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/real/close-orders/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/real/pnl': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/trade/history': { 'cost': 1 } as Endpoint<List>,
                        'api/v2/trading/info/instrument-breakdown': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/info/orders:lookup': { 'cost': 1 } as Endpoint<Dict>,
                        // Trading Info - Demo
                        'api/v1/trading/info/demo/aggregate-portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/demo/close-orders/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/demo/pnl': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/demo/portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/trading/info/trade/demo/history': { 'cost': 1 } as Endpoint<List>,
                        'api/v2/trading/info/demo/instrument-breakdown': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/info/demo/orders:lookup': { 'cost': 1 } as Endpoint<Dict>,
                        // Copy Trading Status
                        'api/v2/trading/copy/{referenceId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/demo/{referenceId}': { 'cost': 1 } as Endpoint<Dict>,
                        // Price Alerts & Watchlists & SSO
                        'api/v1/price-alerts': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists/default-watchlists/items': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists/public/{userId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists/public/{userId}/{watchlistId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists/{watchlistId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sso/applications': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sso/scopes': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        // Trading Execution - Real (20 req / 60s shared quota -> cost 3)
                        'api/v1/trading/execution/market-close-orders/positions/{positionId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/trading/execution/orders': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v3/trading/execution/orders': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/trading/info/aggregate-portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/info/costs': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/trading/info/eligibility': { 'cost': 3 } as Endpoint<Dict>,
                        // Trading Execution - Demo (20 req / 60s shared quota -> cost 3)
                        'api/v1/trading/execution/demo/market-close-orders/positions/{positionId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/trading/execution/demo/orders': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v3/trading/execution/demo/orders': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/trading/info/demo/aggregate-portfolio': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/info/demo/costs': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/trading/info/demo/eligibility': { 'cost': 3 } as Endpoint<Dict>,
                        // Transfers & Sub-Accounts & Agent Portfolios
                        'api/v1/money/transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/etoro-trading/money-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/etoro-trading/user-tokens': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/me/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/agent-portfolios': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/agent-portfolios/{agentPortfolioId}/user-tokens': { 'cost': 1 } as Endpoint<Dict>,
                        // Copy Trading
                        'api/v2/trading/copy': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/close': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/eligibility': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/demo': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/demo/close': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/demo/eligibility': { 'cost': 1 } as Endpoint<Dict>,
                        // Price Alerts & Watchlists & SSO
                        'api/v1/price-alerts': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/default-watchlist/selected-items': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/newasdefault-watchlist': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/{watchlistId}/items': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/watchlists': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sso/applications': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sso/applications/{clientId}/client-secret': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'put': {
                        'api/v1/watchlists/rank/{watchlistId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/setUserSelectedUserDefault/{watchlistId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/{watchlistId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/{watchlistId}/items': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/sso/applications/{clientId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'patch': {
                        'api/v2/trading/positions/{positionId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/demo/positions/{positionId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/notifications/messages': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/price-alerts/{alertId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/etoro-trading/user-tokens/{userTokenId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/agent-portfolios/{agentPortfolioId}/user-tokens/{userTokenId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        // Trading Execution - Real (20 req / 60s shared quota -> cost 3)
                        'api/v1/trading/execution/market-close-orders/{orderId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/trading/execution/orders/{orderId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v3/trading/execution/orders/{orderId}': { 'cost': 3 } as Endpoint<Dict>,
                        // Trading Execution - Demo (20 req / 60s shared quota -> cost 3)
                        'api/v1/trading/execution/demo/market-close-orders/{orderId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v2/trading/execution/demo/orders/{orderId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v3/trading/execution/demo/orders/{orderId}': { 'cost': 3 } as Endpoint<Dict>,
                        // Copy Trading, Price Alerts, Watchlists, Sub-Accounts, Agent Portfolios, SSO
                        'api/v2/trading/copy': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v2/trading/copy/demo': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/price-alerts/{alertId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/watchlists/{watchlistId}': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/watchlists/{watchlistId}/items': { 'cost': 3 } as Endpoint<Dict>,
                        'api/v1/sub-accounts/etoro-trading/user-tokens/{userTokenId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/agent-portfolios/{agentPortfolioId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/agent-portfolios/{agentPortfolioId}/user-tokens/{userTokenId}': { 'cost': 1 } as Endpoint<Dict>,
                        'api/v1/sso/applications/{clientId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    // stocks, etfs, cfds and futures are commission-free (cost is in the spread); crypto has a 1% fee per side
                    'maker': this.parseNumber ('0'),
                    'taker': this.parseNumber ('0'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': undefined,
                            'price': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': true,
                        'trailing': true,
                        'leverage': true,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 364,
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
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 2000,
                    },
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
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
            'options': {
                'enableDemoTrading': false,
                'sandboxMode': false,
                'defaultOrderCurrency': 'usd',
                'spotInstrumentTypes': [ 5, 6, 10 ],
                'futuresExchangeId': 40,
                'futuresTemplateIds': [ 998, 999 ],
                'pricePrecision': {
                    '1': '0.00001',
                    '10': '0.00000001',
                    'default': '0.0001',
                },
                'amountPrecision': {
                    'future': '1',
                    'default': '0.000001',
                },
                'fetchMarkets': {
                    'includeInternal': false,
                    'instrumentTypeIds': undefined,
                    'types': [ 1, 2, 3, 4, 5, 6, 10 ],
                    'futures': true,
                    'fetchSearchData': true,
                    'exchangeCurrencies': {
                        '1': 'USD', // FX
                        '2': 'USD', // Commodity
                        '3': 'USD', // CFD
                        '4': 'USD', // Nasdaq
                        '5': 'USD', // NYSE
                        '6': 'EUR', // FRA
                        '7': 'GBX', // LSE
                        '8': 'USD', // Digital Currency
                        '9': 'EUR', // Euronext Paris
                        '10': 'EUR', // Bolsa De Madrid
                        '11': 'EUR', // Borsa Italiana
                        '12': 'CHF', // SIX
                        '13': 'JPY', // TYO
                        '14': 'NOK', // Oslo Stock Exchange
                        '15': 'SEK', // Stockholm Stock Exchange
                        '16': 'DKK', // Copenhagen Stock Exchange
                        '17': 'EUR', // Helsinki Stock Exchange
                        '18': 'CAD', // Toronto Stock Exchange
                        '19': 'USD', // OTC Markets
                        '20': 'USD', // CBOE
                        '21': 'HKD', // Hong Kong Exchanges
                        '22': 'EUR', // Euronext Lisbon
                        '23': 'EUR', // Euronext Brussels
                        '24': 'SAR', // Tadawul
                        '30': 'EUR', // Euronext Amsterdam
                        '31': 'AUD', // Sydney
                        '32': 'EUR', // Vienna
                        '33': 'USD', // Regular Trading Hours - RTH
                        '34': 'EUR', // Dublin EN
                        '35': 'CZK', // Prague SE
                        '36': 'PLN', // Warsaw
                        '37': 'HUF', // Budapest
                        '38': 'EUR', // Xetra ETFs
                        '39': 'AED', // Dubai Financial Market
                        '40': 'USD', // CME
                        '41': 'AED', // Abu Dhabi
                        '42': 'GBX', // LSE_AIM
                        '43': 'GBX', // LSE AIM Auction
                        '44': 'GBX', // LSE Auction
                        '45': 'CNY', // Shenzhen Stock Exchange
                        '46': 'CNY', // Shanghai Stock Exchange
                        '47': 'INR', // National Stock Exchange of India
                        '48': 'CAD', // TSX Venture Exchange
                        '49': 'SGD', // Singapore Exchange
                        '50': 'ISK', // Nasdaq Iceland
                        '51': 'EUR', // Nasdaq Tallinn
                        '52': 'EUR', // Nasdaq Vilnius
                        '53': 'EUR', // Nasdaq Riga
                        '54': 'KRW', // Korea Exchange
                        '55': 'TWD', // Taiwan Stock Exchange
                        '56': 'JPY', // Tokyo Stock Exchange
                        '57': 'USD', // Texas Stock Exchange
                        '58': 'ILS', // TASE
                    },
                    'cryptoQuoteSuffixes': [
                        'DASH', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'CNH', 'USD',
                        'BTC', 'ETH', 'LTC', 'BCH', 'XRP', 'XLM', 'A',
                    ],
                },
                'fetchOHLCV': {
                    'method': undefined, // 'data' or 'marketData' (auto-selected when undefined)
                    'side': 'bid', // 'bid' or 'ask' for /api/v1/data/instruments/{instrumentId}/candles
                },
                'fetchBalance': {
                    'method': 'aggregatePortfolio', // 'aggregatePortfolio', 'pnl', 'portfolio', or 'balances'
                },
                'fetchPositions': {
                    'method': 'instrumentBreakdown', // 'instrumentBreakdown', 'pnl', or 'portfolio'
                },
                'createOrder': {
                    'version': 'v2', // 'v2' or 'v3'
                },
                'cancelOrder': {
                    'version': 'v2', // 'v2' or 'v3'
                },
                'marketDataIntervals': {
                    '1m': 'OneMinute',
                    '5m': 'FiveMinutes',
                    '10m': 'TenMinutes',
                    '15m': 'FifteenMinutes',
                    '30m': 'ThirtyMinutes',
                    '1h': 'OneHour',
                    '4h': 'FourHours',
                    '1d': 'OneDay',
                    '1w': 'OneWeek',
                },
                'orderStatusById': {
                    '0': 'open', // Open / Pending (instrument-breakdown MIT orders)
                    '1': 'open', // Received
                    '2': 'open', // Placed
                    '3': 'closed', // Filled
                    '4': 'rejected', // Rejected
                    '5': 'open', // PartiallyFilled
                    '6': 'open', // PendingCancel
                    '7': 'canceled', // Canceled
                    '8': 'expired', // Expired
                    '9': 'canceled', // CanceledPartiallyFilled
                    '10': 'rejected', // RejectedPartiallyFilled
                    '11': 'open', // WaitingForMarket
                    '12': 'open', // PendingTriggeredRate
                },
                'orderStatusByName': {
                    'received': 'open',
                    'placed': 'open',
                    'pendingtriggerrate': 'open',
                    'pendingtriggeredrate': 'open',
                    'waitingformarket': 'open',
                    'partiallyfilled': 'open',
                    'pendingcancel': 'open',
                    'filled': 'closed',
                    'rejected': 'rejected',
                    'rejectedpartiallyfilled': 'rejected',
                    'canceled': 'canceled',
                    'cancelled': 'canceled',
                    'canceledpartiallyfilled': 'canceled',
                    'expired': 'expired',
                },
                'transferStatus': {
                    'inprocess': 'pending',
                    'pending': 'pending',
                    'success': 'ok',
                    'completed': 'ok',
                    'decline': 'failed',
                    'declined': 'failed',
                    'technical': 'failed',
                    'failed': 'failed',
                    'canceled': 'canceled',
                    'cancelled': 'canceled',
                },
            },
            'exceptions': {
                'exact': {
                    'Unauthorized': AuthenticationError,
                    'InvalidKey': AuthenticationError,
                    'GCID_REQUIRED': AuthenticationError,
                    'InsufficientPermissions': PermissionDenied,
                    'Forbidden': PermissionDenied,
                    'ScopeNameNotAllowed': PermissionDenied,
                    'TooManyRequests': RateLimitExceeded,
                    'MoneyTransferThrottled': RateLimitExceeded,
                    'MaxUserTokensExceeded': RateLimitExceeded,
                    'INSTRUMENT_NOT_FOUND': BadSymbol,
                    'NOT_FOUND': BadRequest,
                    'NotFound': BadRequest,
                    'INVALID_REQUEST': BadRequest,
                    'INVALID_PARAMETER': BadRequest,
                    'INVALID_TIME_RANGE': BadRequest,
                    'VALIDATION_ERROR': BadRequest,
                    'ValidationFailed': BadRequest,
                    'RequestBodyIsRequired': BadRequest,
                    'RequestIdRequired': BadRequest,
                    'InvalidAmountInUsd': InvalidOrder,
                    'InvalidDirection': BadRequest,
                    'NoChangesDetected': BadRequest,
                    '720': InvalidOrder,
                    '741': InvalidOrder,
                    '759': PermissionDenied,
                    'DEPENDENCY_UNAVAILABLE': ExchangeNotAvailable,
                    'UnhandledException': ExchangeError,
                    'DATA_INTEGRITY_ERROR': ExchangeError,
                    'MoneyTransferFailed': ExchangeError,
                },
                'broad': {
                    'insufficient funds': InsufficientFunds,
                    'insufficient balance': InsufficientFunds,
                    'insufficient': InsufficientFunds,
                    'not enough available': InsufficientFunds,
                    'exceeds available': InsufficientFunds,
                    'market is closed': MarketClosed,
                    'market closed': MarketClosed,
                    'order not found': OrderNotFound,
                    'no order found': OrderNotFound,
                    'order category for': OrderNotFound,
                    'instrument not found': BadSymbol,
                    'unknown instrument': BadSymbol,
                    'no instrument found': BadSymbol,
                    'duplicate': DuplicateOrderId,
                    'already exists': DuplicateOrderId,
                    'rate limit': RateLimitExceeded,
                    'too many requests': RateLimitExceeded,
                    'unauthorized': AuthenticationError,
                    'invalid api key': AuthenticationError,
                    'invalid user key': AuthenticationError,
                    'permission': PermissionDenied,
                    'forbidden': PermissionDenied,
                    'not allowed': OperationRejected,
                    'not eligible': OperationRejected,
                    'exactly one of amount, units, or contracts': InvalidOrder,
                    'stop loss': InvalidOrder,
                    'stoploss': InvalidOrder,
                    'take profit': InvalidOrder,
                    'takeprofit': InvalidOrder,
                    'minimum': InvalidOrder,
                    'leverage': InvalidOrder,
                    'one or more validation errors occurred': BadRequest,
                    'invalid': BadRequest,
                },
            },
        });
    }

    /**
     * @method
     * @name etoro#setSandboxMode
     * @description switches between real and demo trading endpoints
     * @param {boolean} enabled true to use demo trading endpoints, false for real
     */
    override setSandboxMode (enabled: boolean) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    /**
     * @method
     * @name etoro#enableDemoTrading
     * @description enables or disables eToro demo trading mode
     * @param {boolean} enable true to use demo trading endpoints, false for real
     */
    override enableDemoTrading (enable: boolean) {
        super.enableDemoTrading (enable);
        this.options['enableDemoTrading'] = enable;
    }

    /**
     * @ignore
     * @method
     * @name etoro#isDemoMode
     * @description determines whether demo trading endpoints should be used for the request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true if demo mode is active
     */
    isDemoMode (params: Dict = {}): boolean {
        const paramDemo = this.safeBool (params, 'demo');
        if (paramDemo !== undefined) {
            return paramDemo;
        }
        if (this.isSandboxModeEnabled) {
            return true;
        }
        const optionDemo = this.safeBool (this.options, 'enableDemoTrading', false);
        const optionSandbox = this.safeBool (this.options, 'sandboxMode', false);
        return optionDemo || optionSandbox;
    }

    /**
     * @ignore
     * @method
     * @name etoro#parseUtcIsoTimestamp
     * @description parses an ISO 8601 timestamp string into milliseconds, treating strings without a timezone suffix as UTC
     * @param {string} isoString ISO 8601 datetime string
     * @returns {int|undefined} timestamp in milliseconds
     */
    parseUtcIsoTimestamp (isoString: Str): Int {
        if (isoString === undefined) {
            return undefined;
        }
        let normalized = isoString;
        if ((normalized.indexOf ('Z') === -1) && (normalized.indexOf ('+') === -1) && (normalized.indexOf ('T') !== -1)) {
            const tIndex = normalized.indexOf ('T');
            const timePart = normalized.slice (tIndex + 1);
            if (timePart.indexOf ('-') === -1) {
                normalized = normalized + 'Z';
            }
        }
        return this.parse8601 (normalized);
    }

    /**
     * @method
     * @name etoro#fetchMarkets
     * @description retrieves data on all markets for etoro
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-display-data
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-instruments
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-securities-instruments-by-id-or-symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.instrumentTypeIds] comma-separated instrument type IDs to filter by (1=Forex, 2=Commodity, 4=Indices, 5=Stocks, 6=ETF, 10=Crypto)
     * @param {string} [params.exchangeIds] comma-separated exchange IDs to filter by
     * @param {string} [params.instrumentIds] comma-separated instrument IDs to filter by
     * @param {boolean} [params.includeInternal] whether to include restricted internal instruments (default false)
     * @param {boolean} [params.futures] whether to include CME futures instruments (default true)
     * @param {boolean} [params.fetchSearchData] whether to enrich markets with search conversion rates and listing status (default true)
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const options = this.safeDict (this.options, 'fetchMarkets', {});
        const includeInternal = this.safeBool (params, 'includeInternal', this.safeBool (options, 'includeInternal', false));
        const fetchFutures = this.safeBool (params, 'futures', this.safeBool (options, 'futures', true));
        const fetchSearchData = this.safeBool (params, 'fetchSearchData', this.safeBool (options, 'fetchSearchData', true));
        const request: Dict = {};
        const defaultTypeIds = this.safeString (options, 'instrumentTypeIds');
        if (defaultTypeIds !== undefined) {
            request['instrumentTypeIds'] = defaultTypeIds;
        }
        const query = this.omit (params, [ 'includeInternal', 'futures', 'fetchSearchData' ]);
        const promises: Promise<any>[] = [
            this.publicGetApiV1MarketDataInstruments (this.extend (request, query)),
        ];
        if (fetchSearchData) {
            promises.push (this.fetchInstrumentsSearchData ());
        }
        if (fetchFutures) {
            promises.push (this.fetchFuturesInstruments ());
        }
        const results = await Promise.all (promises);
        //
        //     {
        //         "instrumentDisplayDatas": [
        //             {
        //                 "instrumentID": 100000,
        //                 "instrumentDisplayName": "Bitcoin",
        //                 "instrumentTypeID": 10,
        //                 "exchangeID": 8,
        //                 "images": [ ... ],
        //                 "symbolFull": "BTC",
        //                 "instrumentTypeSubCategoryID": 1001,
        //                 "priceSource": "eToro",
        //                 "hasExpirationDate": false,
        //                 "isInternalInstrument": false,
        //                 "distributionType": 5
        //             }
        //         ]
        //     }
        //
        const instrumentsResponse = this.safeDict (results, 0, {});
        const instruments = this.safeList (instrumentsResponse, 'instrumentDisplayDatas', []);
        let searchById: Dict = {};
        let futuresById: Dict = {};
        let nextIndex = 1;
        if (fetchSearchData) {
            searchById = this.safeDict (results, nextIndex, {});
            nextIndex += 1;
        }
        if (fetchFutures) {
            futuresById = this.safeDict (results, nextIndex, {});
        }
        const allowedTypes = this.safeList (options, 'types', [ 1, 2, 3, 4, 5, 6, 10 ]);
        const futuresExchangeId = this.safeString (this.options, 'futuresExchangeId', '40');
        const templateIds = this.safeList (this.options, 'futuresTemplateIds', [ 998, 999 ]);
        const spotTypes = this.safeList (this.options, 'spotInstrumentTypes', [ 5, 6, 10 ]);
        const hasSearchData = Object.keys (searchById).length > 0;
        const publicInstruments: List = [];
        for (let i = 0; i < instruments.length; i++) {
            const item = instruments[i];
            const symbolFull = this.safeString (item, 'symbolFull');
            if ((symbolFull === undefined) || (symbolFull === '')) {
                continue;
            }
            const isInternal = this.safeBool (item, 'isInternalInstrument', false);
            const instrumentIdInt = this.safeInteger (item, 'instrumentID');
            if ((isInternal && !includeInternal) || this.inArray (instrumentIdInt, templateIds)) {
                continue;
            }
            publicInstruments.push (item);
        }
        const rates = this.getConversionReferenceRates (publicInstruments, searchById);
        const cryptoSymbols: Dict = {};
        for (let i = 0; i < publicInstruments.length; i++) {
            const item = publicInstruments[i];
            if (this.safeInteger (item, 'instrumentTypeID') === 10) {
                const sym = this.safeString (item, 'symbolFull', '');
                cryptoSymbols[sym.toUpperCase ()] = true;
            }
        }
        const result: Market[] = [];
        for (let i = 0; i < publicInstruments.length; i++) {
            const instrument = publicInstruments[i];
            const instrumentId = this.safeString (instrument, 'instrumentID');
            const typeId = this.safeInteger (instrument, 'instrumentTypeID');
            const exchangeId = this.safeString (instrument, 'exchangeID');
            const searchEntry = this.safeDict (searchById, instrumentId);
            const extended = (searchEntry !== undefined) ? this.extend (instrument, { 'search': searchEntry }) : instrument;
            if (exchangeId === futuresExchangeId) {
                if (fetchFutures) {
                    const futureMarket = this.parseFutureMarket (extended, this.safeDict (futuresById, instrumentId, {}), hasSearchData);
                    if (futureMarket !== undefined) {
                        result.push (futureMarket);
                    }
                }
                continue;
            }
            if (!this.inArray (typeId, allowedTypes)) {
                continue;
            }
            const baseAndQuote = this.getMarketBaseAndQuote (extended, rates, cryptoSymbols);
            if (this.inArray (typeId, spotTypes)) {
                result.push (this.parseEtoroMarket (extended, baseAndQuote, 'spot', hasSearchData));
            }
            result.push (this.parseEtoroMarket (extended, baseAndQuote, 'swap', hasSearchData));
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name etoro#fetchInstrumentsSearchData
     * @description fetches conversion rates and listing status of all instruments, indexed by instrument id
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-instruments
     * @returns {object} a dictionary of search entries indexed by instrument id
     */
    async fetchInstrumentsSearchData (): Promise<Dict> {
        const pageSize = 5000;
        const maxPages = 10;
        const result: Dict = {};
        for (let page = 1; page <= maxPages; page++) {
            const request: Dict = {
                'fields': 'instrumentId,cvtBid,currentRate,isDelisted,isCurrentlyTradable',
                'pageSize': pageSize,
                'page': page,
            };
            const response = await this.publicGetApiV1MarketDataSearch (request);
            //
            //     {
            //         "page": 1,
            //         "pageSize": 5000,
            //         "totalItems": 13465,
            //         "items": [
            //             {
            //                 "instrumentId": 1001,
            //                 "cvtBid": 1,
            //                 "currentRate": 230.1,
            //                 "isDelisted": false,
            //                 "isCurrentlyTradable": true
            //             }
            //         ]
            //     }
            //
            const items = this.safeList (response, 'items', []);
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const id = this.safeString (item, 'instrumentId', '');
                if (id !== '') {
                    result[id] = item;
                }
            }
            const itemsLength = items.length;
            if (itemsLength < pageSize) {
                break;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name etoro#fetchFuturesInstruments
     * @description fetches the expiry and multiplier of CME futures instruments, indexed by instrument id
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-securities-instruments-by-id-or-symbol
     * @returns {object} a dictionary of futures instruments indexed by instrument id
     */
    async fetchFuturesInstruments (): Promise<Dict> {
        const result: Dict = {};
        let pageToken: Str = undefined;
        const maxPages = 10;
        for (let i = 0; i < maxPages; i++) {
            const request: Dict = {
                'exchangeId': this.safeInteger (this.options, 'futuresExchangeId', 40),
                'pageSize': 1000,
            };
            if (pageToken !== undefined) {
                request['pageToken'] = pageToken;
            }
            const response = await this.publicGetApiV2MarketDataInstruments (request);
            //
            //     {
            //         "results": [
            //             {
            //                 "instrumentId": 100123,
            //                 "displayName": "S&P 500 Futures",
            //                 "type": "Indices",
            //                 "symbol": "SP500.MAR28",
            //                 "exchangeId": 40,
            //                 "multiplier": 50,
            //                 "lastTradingDateTime": "2221-12-31T23:00:00Z",
            //                 "expirationDateTime": "2221-12-31T23:00:00Z"
            //             }
            //         ],
            //         "pagination": { "pageSize": 1000, "nextPageToken": "ODM4", "hasNext": false }
            //     }
            //
            const items = this.safeList (response, 'results', []);
            for (let j = 0; j < items.length; j++) {
                const item = items[j];
                const id = this.safeString (item, 'instrumentId', '');
                if (id !== '') {
                    result[id] = item;
                }
            }
            const pagination = this.safeDict (response, 'pagination', {});
            const hasNext = this.safeBool (pagination, 'hasNext', false);
            pageToken = this.safeString (pagination, 'nextPageToken');
            if (!hasNext || (pageToken === undefined)) {
                break;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name etoro#getConversionReferenceRates
     * @description builds the USD conversion rate of each currency from the forex pairs
     * @param {object[]} instruments the instrument display data
     * @param {object} searchById the search entries indexed by instrument id
     * @returns {object} a dictionary of conversion rates indexed by currency code
     */
    getConversionReferenceRates (instruments: List, searchById: Dict): Dict {
        const rates: Dict = {
            'USD': '1',
        };
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const symbolFull = this.safeString (instrument, 'symbolFull', '');
            const typeId = this.safeInteger (instrument, 'instrumentTypeID');
            if ((typeId !== 1) || (symbolFull.length !== 6)) {
                continue;
            }
            const entry = this.safeDict (searchById, this.safeString (instrument, 'instrumentID'), {});
            const baseId = symbolFull.slice (0, 3);
            const quoteId = symbolFull.slice (3, 6);
            const cvtBid = this.safeString (entry, 'cvtBid');
            if ((cvtBid !== undefined) && Precise.stringGt (cvtBid, '0') && !(quoteId in rates)) {
                rates[quoteId] = cvtBid;
            }
            const currentRate = this.safeString (entry, 'currentRate');
            if ((quoteId === 'USD') && (currentRate !== undefined) && Precise.stringGt (currentRate, '0') && !(baseId in rates)) {
                rates[baseId] = currentRate;
            }
        }
        if ('GBP' in rates) {
            rates['GBX'] = Precise.stringDiv (rates['GBP'], '100');
        }
        return rates;
    }

    isCloseConversionRate (a: Str, b: Str): boolean {
        if ((a === undefined) || (b === undefined) || Precise.stringEq (b, '0')) {
            return false;
        }
        const ratio = Precise.stringDiv (a, b, 10);
        const diff = Precise.stringAbs (Precise.stringSub (ratio, '1'));
        return Precise.stringLt (diff, '0.02');
    }

    /**
     * @ignore
     * @method
     * @name etoro#getMarketBaseAndQuote
     * @description resolves the base and quote currency ids of an instrument
     * @param {object} instrument the instrument display data extended with its search entry
     * @param {object} rates the USD conversion rates indexed by currency code
     * @param {object} cryptoSymbols the crypto symbols indexed by uppercase symbol
     * @returns {string[]} the base and quote currency ids
     */
    getMarketBaseAndQuote (instrument: Dict, rates: Dict, cryptoSymbols: Dict): string[] {
        const symbolFull = this.safeString2 (instrument, 'symbolFull', 'symbol', '');
        const displayName = this.safeString2 (instrument, 'instrumentDisplayName', 'displayName', '');
        const typeId = this.safeInteger (instrument, 'instrumentTypeID');
        const options = this.safeDict (this.options, 'fetchMarkets', {});
        if ((typeId === 1) && (symbolFull.indexOf ('.') === -1) && (symbolFull.length === 6)) {
            return [ symbolFull.slice (0, 3), symbolFull.slice (3, 6) ];
        }
        if (typeId === 10) {
            if (displayName.indexOf ('/') !== -1) {
                const upperSymbol = symbolFull.toUpperCase ();
                const suffixes = this.safeList (options, 'cryptoQuoteSuffixes', []);
                for (let i = 0; i < suffixes.length; i++) {
                    const suffix = suffixes[i];
                    if (suffix === 'USD') {
                        continue;
                    }
                    const suffixLength = suffix.length;
                    const symbolLength = upperSymbol.length;
                    if ((symbolLength > suffixLength) && upperSymbol.endsWith (suffix)) {
                        const baseId = upperSymbol.slice (0, symbolLength - suffixLength);
                        if ((baseId in cryptoSymbols) || (baseId === 'GOLD')) {
                            return [ baseId, suffix ];
                        }
                    }
                }
            }
            return [ symbolFull, 'USD' ];
        }
        const exchangeCurrencies = this.safeDict (options, 'exchangeCurrencies', {});
        const exchangeId = this.safeString2 (instrument, 'exchangeID', 'exchangeId');
        const defaultQuote = this.safeString (exchangeCurrencies, exchangeId, 'USD');
        let quoteId = defaultQuote;
        const searchEntry = this.safeDict (instrument, 'search', {});
        const cvtBid = this.safeString (searchEntry, 'cvtBid');
        if ((cvtBid !== undefined) && Precise.stringGt (cvtBid, '0')) {
            const defaultRate = this.safeString (rates, defaultQuote);
            if (!this.isCloseConversionRate (cvtBid, defaultRate)) {
                const codes = Object.keys (rates);
                const found: string[] = [];
                for (let i = 0; i < codes.length; i++) {
                    const code = codes[i];
                    if (this.isCloseConversionRate (cvtBid, rates[code])) {
                        found.push (code);
                    }
                }
                const foundLength = found.length;
                if (foundLength === 1) {
                    quoteId = found[0];
                }
            }
        }
        return [ symbolFull, quoteId ];
    }

    safeEtoroCurrencyCode (currencyId: Str): Str {
        if (currencyId === undefined) {
            return undefined;
        }
        let code = currencyId.toUpperCase ();
        code = code.split ('/').join ('-');
        code = code.split (' ').join ('-');
        return this.safeCurrencyCode (code);
    }

    safeEtoroMarket (instrumentId: Str, settlementType: Str = undefined, market: Market = undefined): MarketInterface {
        if ((settlementType === undefined) && (market !== undefined)) {
            return market;
        }
        let marketType: Str = undefined;
        if (settlementType !== undefined) {
            const lower = settlementType.toLowerCase ();
            if (lower === 'real') {
                marketType = 'spot';
            } else if (lower === 'realfutures') {
                marketType = 'future';
            } else if ((lower === 'cfd') || (lower === 'margintrade')) {
                marketType = 'swap';
            }
        }
        if ((marketType === undefined) && (market !== undefined)) {
            return market;
        }
        if (marketType === undefined) {
            marketType = 'swap';
        }
        return this.safeMarket (instrumentId, market, undefined, marketType);
    }

    getSettlementType (market: MarketInterface): string {
        if (market['spot']) {
            return 'real';
        } else if (market['future']) {
            return 'realFutures';
        }
        return 'cfd';
    }

    override parseMarket (market: Dict): Market {
        const typeId = this.safeInteger (market, 'instrumentTypeID');
        const exchangeId = this.safeString2 (market, 'exchangeID', 'exchangeId');
        const futuresExchangeId = this.safeString (this.options, 'futuresExchangeId', '40');
        if (exchangeId === futuresExchangeId) {
            const futureInfo = this.safeDict (market, 'future', {});
            const parsedFuture = this.parseFutureMarket (market, futureInfo, false);
            if (parsedFuture !== undefined) {
                return parsedFuture;
            }
        }
        const spotTypes = this.safeList (this.options, 'spotInstrumentTypes', [ 5, 6, 10 ]);
        const baseAndQuote = this.getMarketBaseAndQuote (market, {}, {});
        const marketType = this.inArray (typeId, spotTypes) ? 'spot' : 'swap';
        return this.parseEtoroMarket (market, baseAndQuote, marketType, false);
    }

    parseEtoroMarket (instrument: Dict, baseAndQuote: string[], marketType: string, hasSearchData: boolean = false): Market {
        //
        //     {
        //         "instrumentID": 100000,
        //         "instrumentDisplayName": "Bitcoin",
        //         "instrumentTypeID": 10,
        //         "exchangeID": 8,
        //         "symbolFull": "BTC",
        //         "priceSource": "eToro",
        //         "hasExpirationDate": false,
        //         "isInternalInstrument": false,
        //         "distributionType": 5,
        //         "search": { "instrumentId": 100000, "cvtBid": 1, "currentRate": 60473.23, "isDelisted": false, "isCurrentlyTradable": true }
        //     }
        //
        const id = this.safeString2 (instrument, 'instrumentID', 'instrumentId');
        const typeId = this.safeString (instrument, 'instrumentTypeID');
        const isInternal = this.safeBool (instrument, 'isInternalInstrument', false);
        const base = this.safeEtoroCurrencyCode (baseAndQuote[0]);
        const quote = this.safeEtoroCurrencyCode (baseAndQuote[1]);
        const isSpot = (marketType === 'spot');
        let symbol = base + '/' + quote;
        let settle: Str = undefined;
        if (!isSpot) {
            settle = this.safeCurrencyCode ('USD');
            symbol = symbol + ':' + settle;
        }
        const pricePrecisions = this.safeDict (this.options, 'pricePrecision', {});
        const amountPrecisions = this.safeDict (this.options, 'amountPrecision', {});
        const searchEntry = this.safeDict (instrument, 'search');
        let active = !isInternal;
        if (searchEntry !== undefined) {
            active = !this.safeBool (searchEntry, 'isDelisted', false) && !isInternal;
        } else if (hasSearchData) {
            active = false;
        }
        // crypto is charged a 1% fee per side; stocks, ETFs, and CFDs are commission-free
        const fee = (typeId === '10') ? this.parseNumber ('0.01') : this.parseNumber ('0');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'type': marketType,
            'subType': isSpot ? undefined : 'linear',
            'spot': isSpot,
            'margin': false,
            'swap': !isSpot,
            'future': false,
            'option': false,
            'active': active,
            'contract': !isSpot,
            'linear': isSpot ? undefined : true,
            'inverse': isSpot ? undefined : false,
            'contractSize': isSpot ? undefined : this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.safeString (amountPrecisions, 'default')),
                'price': this.parseNumber (this.safeString2 (pricePrecisions, typeId, 'default')),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.parseNumber ('10'),
                    'max': undefined,
                },
            },
            'taker': fee,
            'maker': fee,
            'created': undefined,
            'info': instrument,
        });
    }

    parseFutureMarket (instrument: Dict, futureInfo: Dict, hasSearchData: boolean = false): Market {
        //
        // instrument: v1 display data extended with search entry
        //
        //     {
        //         "instrumentID": 100123,
        //         "instrumentTypeID": 4,
        //         "exchangeID": 40,
        //         "symbolFull": "SP500.MAR28",
        //         ...
        //     }
        //
        // futureInfo: v2/market-data/instruments entry
        //
        //     {
        //         "instrumentId": 100123,
        //         "symbol": "SP500.MAR28",
        //         "exchangeId": 40,
        //         "multiplier": 50,
        //         "lastTradingDateTime": "2221-12-31T23:00:00Z",
        //         "expirationDateTime": "2221-12-31T23:00:00Z"
        //     }
        //
        const id = this.safeString2 (instrument, 'instrumentID', 'instrumentId');
        const symbolFull = this.safeString2 (instrument, 'symbolFull', 'symbol', '');
        const typeId = this.safeInteger (instrument, 'instrumentTypeID');
        const isInternal = this.safeBool (instrument, 'isInternalInstrument', false);
        const parts = symbolFull.split ('.');
        const partsLength = parts.length;
        if (partsLength < 2) {
            return undefined;
        }
        const suffix = parts[partsLength - 1].toUpperCase ();
        const baseParts: string[] = [];
        for (let i = 0; i < partsLength - 1; i++) {
            baseParts.push (parts[i]);
        }
        let baseId = baseParts.join ('.');
        let quoteId = 'USD';
        if ((typeId === 1) && (baseId.length === 6)) {
            quoteId = baseId.slice (3, 6);
            baseId = baseId.slice (0, 3);
        }
        let expiry: Int = undefined;
        const expirationDateTime = this.safeString (futureInfo, 'expirationDateTime');
        // placeholder expiries (year 2221/2222) are resolved from the symbol suffix, e.g. SP500.MAR28
        if ((expirationDateTime !== undefined) && !expirationDateTime.startsWith ('22')) {
            expiry = this.parseUtcIsoTimestamp (expirationDateTime);
        } else {
            const months: Dict = {
                'JAN': '01',
                'FEB': '02',
                'MAR': '03',
                'APR': '04',
                'MAY': '05',
                'JUN': '06',
                'JUL': '07',
                'AUG': '08',
                'SEP': '09',
                'OCT': '10',
                'NOV': '11',
                'DEC': '12',
            };
            const month = this.safeString (months, suffix.slice (0, 3));
            const year = suffix.slice (3);
            const digits = '0123456789';
            const isYear = (year.length === 2) && (digits.indexOf (year.slice (0, 1)) !== -1) && (digits.indexOf (year.slice (1, 2)) !== -1);
            if ((month !== undefined) && isYear) {
                expiry = this.parse8601 ('20' + year + '-' + month + '-01T00:00:00Z');
            }
        }
        if (expiry === undefined) {
            return undefined;
        }
        const base = this.safeEtoroCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode ('USD');
        const symbol = base + '/' + quote + ':' + settle + '-' + this.yymmdd (expiry);
        const searchEntry = this.safeDict (instrument, 'search');
        let active = !isInternal && (expiry > this.milliseconds ());
        if (searchEntry !== undefined) {
            active = !this.safeBool (searchEntry, 'isDelisted', false) && !isInternal && (expiry > this.milliseconds ());
        } else if (hasSearchData) {
            active = false;
        }
        const pricePrecisions = this.safeDict (this.options, 'pricePrecision', {});
        const amountPrecisions = this.safeDict (this.options, 'amountPrecision', {});
        const typeIdStr = (typeId !== undefined) ? this.numberToString (typeId) : 'default';
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'type': 'future',
            'subType': 'linear',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': true,
            'option': false,
            'active': active,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.safeNumber (futureInfo, 'multiplier', this.parseNumber ('1')),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.safeString (amountPrecisions, 'future')),
                'price': this.parseNumber (this.safeString2 (pricePrecisions, typeIdStr, 'default')),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.parseNumber ('10'),
                    'max': undefined,
                },
            },
            'taker': this.parseNumber ('0'),
            'maker': this.parseNumber ('0'),
            'created': undefined,
            'info': this.extend (instrument, {
                'future': futureInfo,
            }),
        });
    }

    /**
     * @method
     * @name etoro#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrumentIds': market['id'],
        };
        const response = await this.publicGetApiV1MarketDataInstrumentsRates (this.extend (request, params));
        //
        //     {
        //         "rates": [
        //             {
        //                 "instrumentID": 100000,
        //                 "ask": 60777.73,
        //                 "bid": 60777.72,
        //                 "lastExecution": 60777.72,
        //                 "conversionRateAsk": 1,
        //                 "conversionRateBid": 1,
        //                 "date": "2026-11-26T13:40:46.7817672Z",
        //                 "unitMargin": 60777.72,
        //                 "unitMarginAsk": 60777.73,
        //                 "unitMarginBid": 60777.72,
        //                 "priceRateID": 166283436918,
        //                 "bidDiscounted": 60777.72,
        //                 "askDiscounted": 60777.73,
        //                 "unitMarginBidDiscounted": 60777.72,
        //                 "unitMarginAskDiscounted": 60777.73
        //             }
        //         ]
        //     }
        //
        const rates = this.safeList (response, 'rates', []);
        const rate = this.safeDict (rates, 0, {});
        return this.parseTicker (rate, market);
    }

    /**
     * @method
     * @name etoro#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (normalizedSymbols !== undefined) {
            const rawMarketIds = this.marketIds (normalizedSymbols);
            const uniqueIds: string[] = [];
            for (let i = 0; i < rawMarketIds.length; i++) {
                const rawId = rawMarketIds[i];
                if (!this.inArray (rawId, uniqueIds)) {
                    uniqueIds.push (rawId);
                }
            }
            request['instrumentIds'] = uniqueIds.join (',');
        }
        const response = await this.publicGetApiV1MarketDataInstrumentsRates (this.extend (request, params));
        //
        //     {
        //         "rates": [
        //             {
        //                 "instrumentID": 100000,
        //                 "ask": 60777.73,
        //                 "bid": 60777.72,
        //                 "lastExecution": 60777.72,
        //                 "conversionRateAsk": 1,
        //                 "conversionRateBid": 1,
        //                 "date": "2026-11-26T13:40:46.7817672Z",
        //                 "priceRateID": 166283436918
        //             }
        //         ]
        //     }
        //
        const rates = this.safeList (response, 'rates', []);
        const result: Dict = {};
        for (let i = 0; i < rates.length; i++) {
            const rate = rates[i];
            const marketId = this.safeString2 (rate, 'instrumentID', 'instrumentId');
            if (marketId === undefined) {
                continue;
            }
            const marketsForId = this.safeList (this.markets_by_id, marketId, []);
            const marketsLength = marketsForId.length;
            if (marketsLength === 0) {
                if (normalizedSymbols === undefined) {
                    continue;
                }
                const fallbackMarket = this.safeMarket (marketId);
                const ticker = this.parseTicker (rate, fallbackMarket);
                const symbol = ticker['symbol'];
                if (symbol !== undefined) {
                    result[symbol] = ticker;
                }
                continue;
            }
            for (let j = 0; j < marketsLength; j++) {
                const market = marketsForId[j];
                const ticker = this.parseTicker (rate, market);
                const symbol = ticker['symbol'];
                if (symbol !== undefined) {
                    result[symbol] = ticker;
                }
            }
        }
        return this.filterByArrayTickers (result, 'symbol', normalizedSymbols);
    }

    /**
     * @method
     * @name etoro#fetchBidsAsks
     * @description fetches the bid and ask price for multiple markets
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        return await this.fetchTickers (symbols, params);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // REST v1/market-data/instruments/rates
        //
        //     {
        //         "instrumentID": 100000,
        //         "ask": 60777.73,
        //         "bid": 60777.72,
        //         "lastExecution": 60777.72,
        //         "conversionRateAsk": 1,
        //         "conversionRateBid": 1,
        //         "date": "2026-11-26T13:40:46.7817672Z",
        //         "unitMargin": 60777.72,
        //         "unitMarginAsk": 60777.73,
        //         "unitMarginBid": 60777.72,
        //         "priceRateID": 166283436918
        //     }
        //
        // REST v2/market-data/rates
        //
        //     {
        //         "instrumentId": 100000,
        //         "bid": 60766.75,
        //         "ask": 60766.76,
        //         "date": "2026-11-26T13:39:32.867",
        //         "quoteType": "realtime"
        //     }
        //
        // WS Trading.Instrument.Rate
        //
        //     {
        //         "Ask": "84917.73",
        //         "Bid": "83232.21",
        //         "LastExecution": "84072.94",
        //         "Date": "2025-04-01T08:36:02.8305456Z",
        //         "PriceRateID": "106439224591"
        //     }
        //
        const marketId = this.safeStringN (ticker, [ 'instrumentID', 'instrumentId', 'InstrumentID' ]);
        const resolvedMarket = this.safeEtoroMarket (marketId, undefined, market);
        const dateStr = this.safeString2 (ticker, 'date', 'Date');
        const timestamp = this.parseUtcIsoTimestamp (dateStr);
        const bid = this.omitZero (this.safeString2 (ticker, 'bid', 'Bid'));
        const ask = this.omitZero (this.safeString2 (ticker, 'ask', 'Ask'));
        const last = this.omitZero (this.safeString2 (ticker, 'lastExecution', 'LastExecution'));
        const previousClose = this.omitZero (this.safeString2 (ticker, 'OfficialClosingPrice', 'DailyClose'));
        return this.safeTicker ({
            'symbol': resolvedMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name etoro#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-portal.etoro.com/api-reference/data/get-price-candles-for-an-instrument
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-candle-history
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.side] price side for the data endpoint: 'bid' or 'ask' (default 'bid')
     * @param {string} [params.method] endpoint selection: 'data' or 'marketData'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        const options = this.safeDict (this.options, 'fetchOHLCV', {});
        const defaultMethod = this.safeString (options, 'method');
        let methodName = this.safeString (params, 'method', defaultMethod);
        const query = this.omit (params, [ 'until', 'method' ]);
        if (methodName === undefined) {
            // /api/v1/market-data/.../candles returns live up-to-the-minute candles without lag,
            // while /api/v1/data/instruments/{instrumentId}/candles supports arbitrary historical from/to windows
            methodName = ((since !== undefined) || (until !== undefined)) ? 'data' : 'marketData';
        }
        if (methodName === 'marketData') {
            const marketDataIntervals = this.safeDict (this.options, 'marketDataIntervals', {});
            const interval = this.safeString (marketDataIntervals, timeframe);
            if (interval === undefined) {
                throw new BadRequest (this.id + ' fetchOHLCV() does not support timeframe ' + timeframe);
            }
            const maxLimit = 1000;
            let candlesCount = (limit === undefined) ? 100 : limit;
            candlesCount = Math.min (candlesCount, maxLimit);
            const direction = this.safeString (query, 'direction', 'asc');
            const request: Dict = {
                'instrumentId': market['id'],
                'direction': direction,
                'interval': interval,
                'candlesCount': candlesCount,
            };
            const response = await this.publicGetApiV1MarketDataInstrumentsInstrumentIdHistoryCandlesDirectionIntervalCandlesCount (this.extend (request, this.omit (query, 'direction')));
            //
            //     {
            //         "interval": "OneHour",
            //         "candles": [
            //             {
            //                 "instrumentId": 100000,
            //                 "candles": [
            //                     {
            //                         "instrumentID": 100000,
            //                         "fromDate": "2026-11-26T11:00:00Z",
            //                         "open": 60433.29,
            //                         "high": 60710.79,
            //                         "low": 60409.06,
            //                         "close": 60635.55,
            //                         "volume": null
            //                     }
            //                 ]
            //             }
            //         ]
            //     }
            //
            const groups = this.safeList (response, 'candles', []);
            const firstGroup = this.safeDict (groups, 0, {});
            const candles = this.safeList (firstGroup, 'candles', []);
            return this.parseOHLCVs (candles, market, timeframe, since, limit);
        }
        const dataInterval = this.safeString (this.timeframes, timeframe);
        if (dataInterval === undefined) {
            throw new BadRequest (this.id + ' fetchOHLCV() does not support timeframe ' + timeframe);
        }
        const maxDataLimit = 2000;
        const durationMs = this.parseTimeframe (timeframe) * 1000;
        const dataRequest: Dict = {
            'instrumentId': market['id'],
            'interval': dataInterval,
            'side': this.safeString (options, 'side', 'bid'),
        };
        if (limit !== undefined) {
            dataRequest['limit'] = Math.min (limit, maxDataLimit);
        }
        if (since !== undefined) {
            dataRequest['from'] = this.iso8601 (since);
        }
        if (until !== undefined) {
            dataRequest['to'] = this.iso8601 (until);
        } else if ((since !== undefined) && (limit !== undefined)) {
            // /api/v1/data/... returns the newest `limit` bars in [from, to), so bound `to` by since + limit * duration
            const boundedLimit = Math.min (limit, maxDataLimit);
            const computedTo = this.sum (since, boundedLimit * durationMs);
            dataRequest['to'] = this.iso8601 (computedTo);
        }
        const dataResponse = await this.publicGetApiV1DataInstrumentsInstrumentIdCandles (this.extend (dataRequest, query));
        //
        //     {
        //         "instrumentId": 100000,
        //         "symbol": "BTC/USD",
        //         "interval": "1h",
        //         "side": "bid",
        //         "results": [
        //             {
        //                 "time": "2026-11-26T04:00:00Z",
        //                 "open": "60691.96",
        //                 "high": "61031.99",
        //                 "low": "60680",
        //                 "close": "60890.77",
        //                 "volume": null
        //             }
        //         ]
        //     }
        //
        const results = this.safeList (dataResponse, 'results', []);
        return this.parseOHLCVs (results, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        // v1/market-data/.../candles:
        //     {
        //         "instrumentID": 100000,
        //         "fromDate": "2026-11-26T11:00:00Z",
        //         "open": 60433.29,
        //         "high": 60710.79,
        //         "low": 60409.06,
        //         "close": 60635.55,
        //         "volume": null
        //     }
        //
        // v1/data/instruments/{instrumentId}/candles:
        //     {
        //         "time": "2026-11-26T04:00:00Z",
        //         "open": "60691.96",
        //         "high": "61031.99",
        //         "low": "60680",
        //         "close": "60890.77",
        //         "volume": null
        //     }
        //
        // WS Trading.Instrument.Candle:
        //     {
        //         "InstrumentID": 100000,
        //         "Interval": "1m",
        //         "Open": 83900.10,
        //         "High": 84200.55,
        //         "Low": 83850.00,
        //         "Close": 84072.94,
        //         "Volume": 12.348,
        //         "OpenTime": "2025-04-01T08:36:00Z",
        //         "CloseTime": "2025-04-01T08:37:00Z"
        //     }
        //
        const dateStr = this.safeStringN (ohlcv, [ 'fromDate', 'time', 'OpenTime', 'openTime' ]);
        return [
            this.parseUtcIsoTimestamp (dateStr),
            this.safeNumber2 (ohlcv, 'open', 'Open'),
            this.safeNumber2 (ohlcv, 'high', 'High'),
            this.safeNumber2 (ohlcv, 'low', 'Low'),
            this.safeNumber2 (ohlcv, 'close', 'Close'),
            this.safeNumber2 (ohlcv, 'volume', 'Volume'),
        ];
    }

    /**
     * @method
     * @name etoro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders and positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-aggregated-portfolio-snapshot
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-aggregated-portfolio-snapshot
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-account-pnl-and-portfolio-details
     * @see https://api-portal.etoro.com/api-reference/balances/get-aggregated-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to query the demo account balance, false for real
     * @param {string} [params.method] endpoint to use: 'aggregatePortfolio' (default), 'pnl', 'portfolio', or 'balances'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const isDemo = this.isDemoMode (params);
        const options = this.safeDict (this.options, 'fetchBalance', {});
        const defaultMethod = this.safeString (options, 'method', 'aggregatePortfolio');
        const methodName = this.safeString (params, 'method', defaultMethod);
        const query = this.omit (params, [ 'demo', 'method' ]);
        let response: NullableDict = undefined;
        if (methodName === 'balances') {
            response = await this.privateGetApiV1Balances (this.extend ({ 'expand': 'equityDetails' }, query));
        } else if (methodName === 'pnl') {
            response = (isDemo) ? await this.privateGetApiV1TradingInfoDemoPnl (query) : await this.privateGetApiV1TradingInfoRealPnl (query);
        } else if (methodName === 'portfolio') {
            response = (isDemo) ? await this.privateGetApiV1TradingInfoDemoPortfolio (query) : await this.privateGetApiV1TradingInfoPortfolio (query);
        } else {
            response = (isDemo) ? await this.privateGetApiV1TradingInfoDemoAggregatePortfolio (query) : await this.privateGetApiV1TradingInfoAggregatePortfolio (query);
        }
        return this.parseBalance (response);
    }

    override parseBalance (response: Dict): Balances {
        //
        // aggregate-portfolio:
        //     {
        //         "cid": 34374239,
        //         "timestamp": "2026-11-26T13:40:51.133",
        //         "accountCurrency": "USD",
        //         "accountTotals": {
        //             "accountAvailableCash": 100000,
        //             "accountAvailableMargin": 100000,
        //             "cryptoAvailableMargin": 100000,
        //             "accountFrozenCash": 0,
        //             "accountCurrentPnl": 0,
        //             "accountTotalValue": 100000,
        //             "accountTotalUsedMargin": 0,
        //             "accountBalance": 100000
        //         },
        //         "instrumentAggregates": [],
        //         "mirrors": []
        //     }
        //
        // pnl / portfolio:
        //     {
        //         "clientPortfolio": {
        //             "positions": [],
        //             "unrealizedPnL": 0.0,
        //             "mirrors": [],
        //             "accountCurrencyId": 1,
        //             "credit": 100000.0,
        //             "orders": [],
        //             "ordersForOpen": [],
        //             "bonusCredit": 0.0
        //         }
        //     }
        //
        // v1/balances:
        //     {
        //         "gcid": 33171043,
        //         "totalBalance": 0,
        //         "displayCurrency": "USD",
        //         "balances": []
        //     }
        //
        const result: Dict = {
            'info': response,
        };
        const timestamp = this.parseUtcIsoTimestamp (this.safeString (response, 'timestamp'));
        if (timestamp !== undefined) {
            result['timestamp'] = timestamp;
            result['datetime'] = this.iso8601 (timestamp);
        }
        const accountTotals = this.safeDict (response, 'accountTotals');
        if (accountTotals !== undefined) {
            const currencyId = this.safeString (response, 'accountCurrency', 'USD');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (accountTotals, 'accountAvailableCash');
            account['used'] = this.safeString (accountTotals, 'accountTotalUsedMargin');
            if (code !== undefined) {
                result[code] = account;
            }
            return this.safeBalance (result);
        }
        const clientPortfolio = this.safeDict (response, 'clientPortfolio');
        if (clientPortfolio !== undefined) {
            const credit = this.safeString (clientPortfolio, 'credit', '0');
            const orders = this.safeList (clientPortfolio, 'orders', []);
            const ordersForOpen = this.safeList (clientPortfolio, 'ordersForOpen', []);
            const positions = this.safeList (clientPortfolio, 'positions', []);
            let pendingUsed: Str = '0';
            for (let i = 0; i < orders.length; i++) {
                pendingUsed = Precise.stringAdd (pendingUsed, this.safeString (orders[i], 'amount', '0'));
            }
            for (let i = 0; i < ordersForOpen.length; i++) {
                const mirrorId = this.safeInteger2 (ordersForOpen[i], 'mirrorID', 'mirrorId', 0);
                if (mirrorId === 0) {
                    pendingUsed = Precise.stringAdd (pendingUsed, this.safeString (ordersForOpen[i], 'amount', '0'));
                }
            }
            let positionsUsed: Str = '0';
            for (let i = 0; i < positions.length; i++) {
                positionsUsed = Precise.stringAdd (positionsUsed, this.safeString (positions[i], 'amount', '0'));
            }
            const free = Precise.stringMax ('0', Precise.stringSub (credit, pendingUsed));
            const used = Precise.stringAdd (pendingUsed, positionsUsed);
            const code = this.safeCurrencyCode ('USD');
            const account = this.account ();
            account['free'] = free;
            account['used'] = used;
            if (code !== undefined) {
                result[code] = account;
            }
            return this.safeBalance (result);
        }
        const balances = this.safeList (response, 'balances');
        if (balances !== undefined) {
            const balancesLength = balances.length;
            if (balancesLength === 0) {
                const displayCurrency = this.safeString (response, 'displayCurrency', 'USD');
                const code = this.safeCurrencyCode (displayCurrency);
                const account = this.account ();
                account['total'] = this.safeString (response, 'totalBalance', '0');
                account['free'] = account['total'];
                account['used'] = '0';
                if (code !== undefined) {
                    result[code] = account;
                }
            } else {
                for (let i = 0; i < balances.length; i++) {
                    const entry = balances[i];
                    const currencyId = this.safeString (entry, 'currency', 'USD');
                    const code = this.safeCurrencyCode (currencyId);
                    if (code === undefined) {
                        continue;
                    }
                    const equityDetails = this.safeDict (entry, 'equityDetails', {});
                    const total = this.safeString (entry, 'balance');
                    const free = this.safeString2 (equityDetails, 'available', 'spendableBalanceInFiat');
                    const account = this.account ();
                    if (code in result) {
                        const existing = result[code];
                        account['total'] = Precise.stringAdd (this.safeString (existing, 'total', '0'), (total !== undefined) ? total : '0');
                        if (free !== undefined) {
                            account['free'] = Precise.stringAdd (this.safeString (existing, 'free', '0'), free);
                        }
                    } else {
                        account['total'] = total;
                        account['free'] = free;
                    }
                    result[code] = account;
                }
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name etoro#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://api-portal.etoro.com/api-reference/identity/get-authenticated-user-profile
     * @see https://api-portal.etoro.com/api-reference/sub-accounts/get-my-sub-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        await this.loadMarkets ();
        const profile = await this.privateGetApiV1Me (params);
        //
        //     {
        //         "gcid": 33171043,
        //         "realCid": 32932628,
        //         "demoCid": 34374239,
        //         "username": "...",
        //         "scopes": [ ... ]
        //     }
        //
        const accounts: List = [];
        const realCid = this.safeString (profile, 'realCid');
        if (realCid !== undefined) {
            accounts.push ({
                'id': realCid,
                'type': 'trading',
                'currency': 'USD',
                'raw': profile,
            });
        }
        const demoCid = this.safeString (profile, 'demoCid');
        if (demoCid !== undefined) {
            accounts.push ({
                'id': demoCid,
                'type': 'demo',
                'currency': 'USD',
                'raw': profile,
            });
        }
        const subAccountsResponse = await this.privateGetApiV1SubAccountsMeAccounts ({});
        //
        //     {
        //         "accounts": [ ... ],
        //         "subAccountTypes": [ ... ]
        //     }
        //
        const subAccounts = this.safeList (subAccountsResponse, 'accounts', []);
        for (let i = 0; i < subAccounts.length; i++) {
            accounts.push (subAccounts[i]);
        }
        return this.parseAccounts (accounts, params);
    }

    override parseAccount (account: Dict): Account {
        const id = this.safeStringN (account, [ 'id', 'accountId', 'cid', 'subAccountId' ]);
        const accountType = this.safeStringN (account, [ 'type', 'accountType', 'provider' ], 'trading');
        const currencyId = this.safeString (account, 'currency', 'USD');
        const raw = this.safeDict (account, 'raw', account);
        return {
            'id': id,
            'type': accountType,
            'code': this.safeCurrencyCode (currencyId),
            'info': raw,
        };
    }

    /**
     * @method
     * @name etoro#fetchPositions
     * @description fetch all open positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-instrument-breakdown
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-instrument-breakdown-demo
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-account-pnl-and-portfolio-details
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to query the demo account, false for real
     * @param {string} [params.method] endpoint to use: 'instrumentBreakdown' (default), 'pnl', or 'portfolio'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols);
        const isDemo = this.isDemoMode (params);
        const options = this.safeDict (this.options, 'fetchPositions', {});
        const defaultMethod = this.safeString (options, 'method', 'instrumentBreakdown');
        const methodName = this.safeString (params, 'method', defaultMethod);
        const query = this.omit (params, [ 'demo', 'method' ]);
        const rawPositions: List = [];
        if (methodName === 'instrumentBreakdown') {
            const request: Dict = {
                'positionLevel': 'Normal',
                'orderLevel': 'None',
            };
            if (normalizedSymbols !== undefined) {
                const marketIds = this.marketIds (normalizedSymbols);
                request['instrumentIds'] = marketIds.join (',');
            }
            const response = (isDemo)
                ? await this.privateGetApiV2TradingInfoDemoInstrumentBreakdown (this.extend (request, query))
                : await this.privateGetApiV2TradingInfoInstrumentBreakdown (this.extend (request, query));
            //
            //     {
            //         "accountCurrency": "USD",
            //         "timestamp": "2026-11-26T13:40:51.3449021Z",
            //         "instruments": [
            //             {
            //                 "instrumentId": 100000,
            //                 "symbol": "BTC",
            //                 "positions": [ ... ]
            //             }
            //         ]
            //     }
            //
            const instruments = this.safeList (response, 'instruments', []);
            for (let i = 0; i < instruments.length; i++) {
                const group = instruments[i];
                const positions = this.safeList (group, 'positions', []);
                for (let j = 0; j < positions.length; j++) {
                    rawPositions.push (positions[j]);
                }
            }
        } else {
            let response: NullableDict = undefined;
            if (methodName === 'portfolio') {
                response = (isDemo) ? await this.privateGetApiV1TradingInfoDemoPortfolio (query) : await this.privateGetApiV1TradingInfoPortfolio (query);
            } else {
                response = (isDemo) ? await this.privateGetApiV1TradingInfoDemoPnl (query) : await this.privateGetApiV1TradingInfoRealPnl (query);
            }
            const clientPortfolio = this.safeDict (response, 'clientPortfolio', {});
            const positions = this.safeList (clientPortfolio, 'positions', []);
            for (let i = 0; i < positions.length; i++) {
                rawPositions.push (positions[i]);
            }
        }
        return this.parsePositions (rawPositions, normalizedSymbols);
    }

    /**
     * @method
     * @name etoro#fetchPosition
     * @description fetch data on an open position for a specific market
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-instrument-breakdown
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-instrument-breakdown-demo
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] optional specific position ID to match
     * @param {boolean} [params.demo] true to query the demo account, false for real
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPosition (symbol: string, params: Dict = {}): Promise<Position> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionId = this.safeString (params, 'positionId');
        const query = this.omit (params, 'positionId');
        const positions = await this.fetchPositions ([ market['symbol'] ], query);
        if (positionId !== undefined) {
            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                if (this.safeString (pos, 'id') === positionId) {
                    return pos;
                }
            }
            return this.safeDict ([], 0) as Position;
        }
        return this.safeDict (positions, 0) as Position;
    }

    /**
     * @method
     * @name etoro#fetchPositionsHistory
     * @description fetches historical closed positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/list-trading-history
     * @see https://api-portal.etoro.com/api-reference/trading--demo/list-trading-history
     * @param {string[]} [symbols] unified market symbols
     * @param {int} [since] the earliest time in ms to fetch closed positions for (lookback must be less than 1 year)
     * @param {int} [limit] the maximum number of records to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to query the demo account, false for real
     * @param {int} [params.page] 1-based page number
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const normalizedSymbols = this.marketSymbols (symbols);
        const isDemo = this.isDemoMode (params);
        const query = this.omit (params, 'demo');
        const defaultSince = this.milliseconds () - (364 * 24 * 60 * 60 * 1000);
        const effectiveSince = (since !== undefined) ? since : defaultSince;
        const request: Dict = {
            'minDate': this.ymd (effectiveSince, '-'),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = (isDemo)
            ? await this.privateGetApiV1TradingInfoTradeDemoHistory (this.extend (request, query))
            : await this.privateGetApiV1TradingInfoTradeHistory (this.extend (request, query));
        const parsed = this.parsePositions (response, normalizedSymbols);
        const sorted = this.sortBy (parsed, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit, 'timestamp') as Position[];
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        // v2/trading/info/instrument-breakdown:
        //     {
        //         "positionId": 2980225895,
        //         "symbol": "BTC",
        //         "instrumentId": 100000,
        //         "assetCurrency": "USD",
        //         "settlementType": "real",
        //         "direction": "long",
        //         "leverage": 1,
        //         "isSettled": true,
        //         "openTime": "2026-11-26T14:00:00Z",
        //         "openRate": 60800.0,
        //         "openConversionRate": 1,
        //         "totalFeesAcctCcy": 0.49,
        //         "totalTaxesAcctCcy": 0,
        //         "takeProfitRate": 70000,
        //         "stopLossRate": 50000,
        //         "stopLossType": "fixed",
        //         "units": 0.000822,
        //         "contracts": 0,
        //         "marginAcctCcy": 50,
        //         "margin": 50,
        //         "currentRate": 60850.0,
        //         "currentExposureAcctCcy": 50.02,
        //         "acctCcyReturn": 0.02,
        //         "acctCcyRoePercent": 0.04,
        //         "liquidationValueAcctCcy": 50.02
        //     }
        //
        // v1/trading/info/real/pnl & portfolio:
        //     {
        //         "positionID": 2980225895,
        //         "openDateTime": "2026-11-26T14:00:00Z",
        //         "openRate": 60800.0,
        //         "instrumentID": 100000,
        //         "isBuy": true,
        //         "takeProfitRate": 70000,
        //         "stopLossRate": 50000,
        //         "amount": 50,
        //         "leverage": 1,
        //         "units": 0.000822,
        //         "unrealizedPnL": { "pnL": 0.02 }
        //     }
        //
        // v1/trading/info/trade/history (closed position):
        //     {
        //         "netProfit": -0.5,
        //         "closeRate": 60750,
        //         "closeTimestamp": "2026-11-26T14:05:00Z",
        //         "positionId": 2980225895,
        //         "instrumentId": 100000,
        //         "isBuy": true,
        //         "leverage": 1,
        //         "openRate": 60800,
        //         "openTimestamp": "2026-11-26T14:00:00Z",
        //         "stopLossRate": 50000,
        //         "takeProfitRate": 70000,
        //         "investment": 50,
        //         "initialInvestment": 50,
        //         "fees": 0.49,
        //         "units": 0.000822
        //     }
        //
        // WS Trading.Position.Opened / Trading.Position.Closed:
        //     {
        //         "PositionID": 2980225895,
        //         "InstrumentID": 1001,
        //         "IsBuy": true,
        //         "OpenRate": 182.30,
        //         "Amount": 500.0,
        //         "Leverage": 2,
        //         "OpenDateTime": "2025-04-01T08:55:53.6910145Z"
        //     }
        //
        const marketId = this.safeStringN (position, [ 'instrumentId', 'instrumentID', 'InstrumentID' ]);
        const settlementType = this.safeString (position, 'settlementType');
        let resolvedMarket: Market = undefined;
        if ((settlementType === undefined) && (market === undefined)) {
            resolvedMarket = this.marketFromHistoryEntry (position);
        } else {
            resolvedMarket = this.safeEtoroMarket (marketId, settlementType, market);
        }
        const id = this.safeStringN (position, [ 'positionId', 'positionID', 'PositionID' ]);
        const openTimeStr = this.safeStringN (position, [ 'openTime', 'openDateTime', 'openTimestamp', 'OpenDateTime', 'CloseDateTime' ]);
        const timestamp = this.parseUtcIsoTimestamp (openTimeStr);
        let side = this.safeStringLower (position, 'direction');
        if (side === undefined) {
            const isBuy = this.safeBool2 (position, 'isBuy', 'IsBuy');
            if (isBuy !== undefined) {
                side = (isBuy) ? 'long' : 'short';
            }
        }
        const units = this.omitZero (this.safeString2 (position, 'units', 'Units'));
        const rawContracts = this.omitZero (this.safeString (position, 'contracts'));
        let contracts: Str = undefined;
        if (resolvedMarket['future']) {
            contracts = (rawContracts !== undefined) ? rawContracts : units;
        } else {
            contracts = (units !== undefined) ? units : rawContracts;
        }
        const entryPrice = this.omitZero (this.safeString2 (position, 'openRate', 'OpenRate'));
        const pnlObj = this.safeDict (position, 'unrealizedPnL');
        let markPrice = this.omitZero (this.safeStringN (position, [ 'currentRate', 'closeRate', 'CloseRate', 'EndRate' ]));
        if ((markPrice === undefined) && (pnlObj !== undefined)) {
            markPrice = this.omitZero (this.safeString (pnlObj, 'closeRate'));
        }
        const leverage = this.omitZero (this.safeString2 (position, 'leverage', 'Leverage'));
        let initialMarginPercentage: Str = undefined;
        if ((leverage !== undefined) && Precise.stringGt (leverage, '0')) {
            initialMarginPercentage = Precise.stringDiv ('1', leverage);
        }
        let margin = this.omitZero (this.safeStringN (position, [ 'marginAcctCcy', 'margin', 'amount', 'Amount', 'PositionAmount', 'investment', 'initialInvestment' ]));
        if ((margin === undefined) && (pnlObj !== undefined)) {
            margin = this.omitZero (this.safeString2 (pnlObj, 'marginInAccountCurrency', 'marginInAssetCurrency'));
        }
        let unrealizedPnl = this.safeString2 (position, 'acctCcyReturn', 'pnl');
        if ((unrealizedPnl === undefined) && (pnlObj !== undefined)) {
            unrealizedPnl = this.safeString2 (pnlObj, 'pnL', 'pnl');
        }
        const realizedPnl = this.safeString2 (position, 'netProfit', 'NetProfit');
        let collateral = this.omitZero (this.safeString (position, 'liquidationValueAcctCcy'));
        if ((collateral === undefined) && (margin !== undefined)) {
            if (unrealizedPnl !== undefined) {
                collateral = this.omitZero (Precise.stringAdd (margin, unrealizedPnl));
            } else if (realizedPnl !== undefined) {
                collateral = this.omitZero (Precise.stringAdd (margin, realizedPnl));
            } else {
                collateral = margin;
            }
        }
        let rawExposure = this.safeString2 (position, 'currentExposureAcctCcy', 'currentExposure');
        if ((rawExposure === undefined) && (pnlObj !== undefined)) {
            rawExposure = this.safeString2 (pnlObj, 'exposureInAccountCurrency', 'exposureInAssetCurrency');
        }
        let notional: Str = undefined;
        if (rawExposure !== undefined) {
            notional = this.omitZero (Precise.stringAbs (rawExposure));
        } else if ((contracts !== undefined) && (markPrice !== undefined)) {
            notional = this.omitZero (Precise.stringMul (contracts, markPrice));
        } else if ((contracts !== undefined) && (entryPrice !== undefined)) {
            notional = this.omitZero (Precise.stringMul (contracts, entryPrice));
        } else if ((margin !== undefined) && (leverage !== undefined)) {
            notional = this.omitZero (Precise.stringMul (margin, leverage));
        }
        let percentage = this.safeStringN (position, [ 'acctCcyRoePercent', 'roePercent', 'NetProfitRatio' ]);
        if ((percentage === undefined) && (margin !== undefined) && Precise.stringGt (margin, '0')) {
            if (unrealizedPnl !== undefined) {
                percentage = Precise.stringMul (Precise.stringDiv (unrealizedPnl, margin), '100');
            } else if (realizedPnl !== undefined) {
                percentage = Precise.stringMul (Precise.stringDiv (realizedPnl, margin), '100');
            }
        }
        const isNoStopLoss = this.safeBool2 (position, 'isNoStopLoss', 'IsNoStopLoss', false);
        const isNoTakeProfit = this.safeBool2 (position, 'isNoTakeProfit', 'IsNoTakeProfit', false);
        const stopLossPrice = (isNoStopLoss) ? undefined : this.parseProtectionRate (this.safeString2 (position, 'stopLossRate', 'StopLossRate'));
        const takeProfitPrice = (isNoTakeProfit) ? undefined : this.parseProtectionRate (this.safeString2 (position, 'takeProfitRate', 'TakeProfitRate'));
        let lastUpdateStr = this.safeStringN (position, [ 'rateTimestamp', 'closeTimestamp', 'CloseDateTime', 'OccurredAt' ]);
        if ((lastUpdateStr === undefined) && (pnlObj !== undefined)) {
            lastUpdateStr = this.safeString (pnlObj, 'timestamp');
        }
        return this.safePosition ({
            'info': position,
            'id': id,
            'symbol': resolvedMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.parseUtcIsoTimestamp (lastUpdateStr),
            'initialMargin': this.parseNumber (margin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber (entryPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'realizedPnl': this.parseNumber (realizedPnl),
            'contracts': this.parseNumber (contracts),
            'contractSize': this.safeNumber (resolvedMarket, 'contractSize', 1),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': this.parseNumber (markPrice),
            'collateral': this.parseNumber (collateral),
            'marginMode': 'isolated',
            'side': side,
            'percentage': this.parseNumber (percentage),
            'stopLossPrice': this.parseNumber (stopLossPrice),
            'takeProfitPrice': this.parseNumber (takeProfitPrice),
            'hedged': true,
        });
    }

    /**
     * @method
     * @name etoro#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-instrument-breakdown
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-instrument-breakdown-demo
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to query the demo account, false for real
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const isDemo = this.isDemoMode (params);
        const query = this.omit (params, 'demo');
        const request: Dict = {
            'positionLevel': 'None',
            'orderLevel': 'Normal',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentIds'] = market['id'];
        }
        const response = (isDemo)
            ? await this.privateGetApiV2TradingInfoDemoInstrumentBreakdown (this.extend (request, query))
            : await this.privateGetApiV2TradingInfoInstrumentBreakdown (this.extend (request, query));
        //
        //     {
        //         "accountCurrency": "USD",
        //         "timestamp": "2026-11-26T13:40:51.3449021Z",
        //         "instruments": [
        //             {
        //                 "instrumentId": 100000,
        //                 "symbol": "BTC",
        //                 "orders": [ ... ]
        //             }
        //         ]
        //     }
        //
        const instruments = this.safeList (response, 'instruments', []);
        const rawOrders: List = [];
        for (let i = 0; i < instruments.length; i++) {
            const group = instruments[i];
            const instrumentId = this.safeString (group, 'instrumentId');
            const orders = this.safeList (group, 'orders', []);
            for (let j = 0; j < orders.length; j++) {
                const rawOrder = this.extend ({ 'instrumentId': instrumentId }, orders[j]);
                rawOrders.push (rawOrder);
            }
        }
        const parsed = this.parseOrders (rawOrders, undefined, since, limit);
        const result: Order[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const order = parsed[i];
            if ((order['status'] === 'open') && ((market === undefined) || (order['symbol'] === market['symbol']))) {
                result.push (order);
            }
        }
        return result;
    }

    /**
     * @method
     * @name etoro#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-order-information-and-position-details
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-order-information-and-position-details
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-close-order-information-and-closed-position-details
     * @param {string} id the order id (numeric orderId or UUID referenceId)
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to query the demo account, false for real
     * @param {string} [params.clientOrderId] UUID referenceId sent as x-request-id on order creation
     * @param {boolean} [params.isCloseOrder] true to fetch a position close order via the close-orders endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isDemo = this.isDemoMode (params);
        const isCloseOrder = this.safeBool (params, 'isCloseOrder', false);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'referenceId');
        const query = this.omit (params, [ 'demo', 'isCloseOrder', 'clientOrderId', 'referenceId' ]);
        if (isCloseOrder) {
            const closeReq: Dict = {
                'orderId': id,
            };
            const closeResp = (isDemo)
                ? await this.privateGetApiV1TradingInfoDemoCloseOrdersOrderId (this.extend (closeReq, query))
                : await this.privateGetApiV1TradingInfoRealCloseOrdersOrderId (this.extend (closeReq, query));
            return this.parseOrder (closeResp, market);
        }
        const request: Dict = {};
        if (clientOrderId !== undefined) {
            request['referenceId'] = clientOrderId;
        } else if ((id !== undefined) && (id.indexOf ('-') !== -1)) {
            request['referenceId'] = id;
        } else {
            request['orderId'] = id;
        }
        const response = (isDemo)
            ? await this.privateGetApiV2TradingInfoDemoOrdersLookup (this.extend (request, query))
            : await this.privateGetApiV2TradingInfoOrdersLookup (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name etoro#createOrder
     * @description create a trade order
     * @see https://api-portal.etoro.com/api-reference/trading--real/create-an-order
     * @see https://api-portal.etoro.com/api-reference/trading--demo/create-an-order
     * @see https://api-portal.etoro.com/api-reference/trading--real/submit-an-order-for-asynchronous-processing
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' (mapped to 'mkt', 'mit', or 'limitIOC' when timeInForce is 'IOC')
     * @param {string} side 'buy' (opens long) or 'sell' (opens short on swap/future markets via sellShort, or closes position when positionId/reduceOnly is set)
     * @param {float} amount how much of currency you want to trade in units of base currency (contracts for futures, or quote currency cost when createMarketBuyOrderRequiresPrice is false / cost param is set)
     * @param {float} [price] the trigger rate for MIT limit orders, or limitRate for limitIOC orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to place order on the demo account, false for real
     * @param {float} [params.cost] USD monetary amount to invest (mutually exclusive with units/contracts)
     * @param {int} [params.leverage] leverage multiplier (default 1; leverage > 1 requires stopLossPrice)
     * @param {float} [params.stopLossPrice] stop-loss trigger rate (required when leverage > 1, side is sell/sellShort, or trailing is true)
     * @param {float} [params.takeProfitPrice] take-profit trigger rate
     * @param {object} [params.stopLoss] *stopLoss object in params* containing triggerPrice or price
     * @param {object} [params.takeProfit] *takeProfit object in params* containing triggerPrice or price
     * @param {boolean} [params.trailing] true to enable trailing stop-loss (sets stopLossType to 'trailing')
     * @param {string} [params.settlementType] 'real', 'cfd', 'realFutures', or 'marginTrade'
     * @param {string} [params.timeInForce] set to 'IOC' with type 'limit' to submit a limitIOC order
     * @param {string} [params.clientOrderId] UUID sent as the x-request-id header, usable as referenceId in fetchOrder
     * @param {string} [params.positionId] if provided with reduceOnly or closing action, delegates to closePosition
     * @param {boolean} [params.reduceOnly] if true, closes an existing open position for this symbol
     * @param {string} [params.version] API version: 'v2' (default) or 'v3'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        const positionId = this.safeString (params, 'positionId');
        if (reduceOnly || (positionId !== undefined)) {
            const closeParams = this.omit (params, 'reduceOnly');
            if ((amount !== undefined) && !('units' in closeParams) && !('UnitsToDeduct' in closeParams)) {
                closeParams['units'] = amount;
            }
            return await this.closePosition (symbol, side, closeParams);
        }
        const isDemo = this.isDemoMode (params);
        const options = this.safeDict (this.options, 'createOrder', {});
        const defaultVersion = this.safeString (options, 'version', 'v2');
        const version = this.safeString (params, 'version', defaultVersion);
        const orderTypeLower = type.toLowerCase ();
        const sideLower = side.toLowerCase ();
        const quoteAmount = this.safeNumber (params, 'cost');
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response: NullableDict = undefined;
        if (version === 'v3') {
            response = (isDemo)
                ? await this.privatePostApiV3TradingExecutionDemoOrders (request)
                : await this.privatePostApiV3TradingExecutionOrders (request);
        } else {
            response = (isDemo)
                ? await this.privatePostApiV2TradingExecutionDemoOrders (request)
                : await this.privatePostApiV2TradingExecutionOrders (request);
        }
        //
        //     {
        //         "token": "066faaee-e1e9-49d2-a568-c6e1cc336ad8",
        //         "orderId": 13902598,
        //         "referenceId": "1c94300c-90aa-4303-9d00-dec376d74efb"
        //     }
        //
        const order = this.parseOrder (response, market);
        order['symbol'] = market['symbol'];
        order['type'] = orderTypeLower;
        order['side'] = sideLower;
        if (quoteAmount !== undefined) {
            order['cost'] = quoteAmount;
        } else if (amount !== undefined) {
            order['amount'] = amount;
        }
        if (price !== undefined) {
            order['price'] = price;
        }
        return order;
    }

    /**
     * @ignore
     * @method
     * @name etoro#createOrderRequest
     * @description helper function to build the request of createOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency or contracts to trade
     * @param {float} [price] the price for a limit order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} request to be sent to the exchange
     */
    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        const orderTypeLower = type.toLowerCase ();
        const sideLower = side.toLowerCase ();
        let transaction = 'buy';
        if (sideLower === 'sell') {
            if (market['spot']) {
                throw new NotSupported (this.id + ' createOrder() does not support selling spot markets, use closePosition() instead');
            }
            transaction = 'sellShort';
        }
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopPrice', 'triggerRate' ]);
        let etoroOrderType = 'mkt';
        if (triggerPrice !== undefined) {
            etoroOrderType = 'mit';
        } else if (orderTypeLower === 'limit') {
            etoroOrderType = (timeInForce === 'IOC') ? 'limitIOC' : 'mit';
        } else if (orderTypeLower === 'market') {
            etoroOrderType = 'mkt';
        } else {
            etoroOrderType = type;
        }
        const request: Dict = {
            'action': 'open',
            'transaction': transaction,
            'instrumentId': this.parseToInt (market['id']),
            'orderType': etoroOrderType,
            'settlementType': this.safeString (params, 'settlementType', this.getSettlementType (market)),
        };
        if (etoroOrderType === 'mit') {
            let triggerRate = triggerPrice;
            if ((triggerRate === undefined) && (price !== undefined)) {
                triggerRate = this.numberToString (price);
            }
            if (triggerRate === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price or triggerPrice argument for limit (mit) orders');
            }
            request['triggerRate'] = this.parseToNumeric (this.priceToPrecision (symbol, triggerRate));
        } else if (etoroOrderType === 'limitIOC') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limitIOC orders');
            }
            request['limitRate'] = this.parseToNumeric (this.priceToPrecision (symbol, price));
        }
        const quoteAmount = this.safeString (params, 'cost');
        const createMarketBuyOrderRequiresPrice = this.safeBool (this.options, 'createMarketBuyOrderRequiresPrice', true);
        const contractsParam = this.safeString (params, 'contracts');
        if (quoteAmount !== undefined) {
            request['amount'] = this.parseToNumeric (quoteAmount);
            request['orderCurrency'] = this.safeString (this.options, 'defaultOrderCurrency', 'usd');
        } else if ((orderTypeLower === 'market') && (sideLower === 'buy') && !createMarketBuyOrderRequiresPrice) {
            request['amount'] = amount;
            request['orderCurrency'] = this.safeString (this.options, 'defaultOrderCurrency', 'usd');
        } else if (contractsParam !== undefined) {
            request['contracts'] = this.parseToNumeric (this.amountToPrecision (symbol, contractsParam));
        } else if (market['future']) {
            if (amount !== undefined) {
                request['contracts'] = this.parseToNumeric (this.amountToPrecision (symbol, amount));
            }
        } else if (amount !== undefined) {
            request['units'] = this.parseToNumeric (this.amountToPrecision (symbol, amount));
        }
        const leverage = this.safeInteger (params, 'leverage');
        if (leverage !== undefined) {
            request['leverage'] = leverage;
        }
        const stopLoss = this.safeDict (params, 'stopLoss');
        const takeProfit = this.safeDict (params, 'takeProfit');
        let stopLossPrice = this.safeString2 (params, 'stopLossPrice', 'stopLossRate');
        if ((stopLossPrice === undefined) && (stopLoss !== undefined)) {
            stopLossPrice = this.safeString2 (stopLoss, 'triggerPrice', 'price');
        }
        let takeProfitPrice = this.safeString2 (params, 'takeProfitPrice', 'takeProfitRate');
        if ((takeProfitPrice === undefined) && (takeProfit !== undefined)) {
            takeProfitPrice = this.safeString2 (takeProfit, 'triggerPrice', 'price');
        }
        if (stopLossPrice !== undefined) {
            request['stopLossRate'] = this.parseToNumeric (this.priceToPrecision (symbol, stopLossPrice));
        }
        if (takeProfitPrice !== undefined) {
            request['takeProfitRate'] = this.parseToNumeric (this.priceToPrecision (symbol, takeProfitPrice));
        }
        const isTrailing = this.safeBool (params, 'trailing', false);
        const stopLossType = this.safeString (params, 'stopLossType');
        if (stopLossType !== undefined) {
            request['stopLossType'] = stopLossType;
        } else if (isTrailing) {
            request['stopLossType'] = 'trailing';
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['x-request-id'] = clientOrderId;
        }
        const query = this.omit (params, [
            'demo', 'version', 'timeInForce', 'triggerPrice', 'stopPrice', 'triggerRate',
            'cost', 'contracts', 'leverage', 'stopLoss', 'takeProfit',
            'stopLossPrice', 'stopLossRate', 'takeProfitPrice', 'takeProfitRate',
            'trailing', 'stopLossType', 'settlementType', 'reduceOnly', 'positionId', 'clientOrderId',
        ]);
        return this.extend (request, query);
    }

    /**
     * @method
     * @name etoro#cancelOrder
     * @description cancels an open order before it is executed
     * @see https://api-portal.etoro.com/api-reference/trading--real/cancels-an-order-before-it-is-executed
     * @see https://api-portal.etoro.com/api-reference/trading--demo/cancels-an-order-before-it-is-executed
     * @see https://api-portal.etoro.com/api-reference/trading--real/cancel-pending-close-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to cancel on the demo account, false for real
     * @param {boolean} [params.isCloseOrder] true to cancel a pending close order
     * @param {string} [params.version] API version: 'v2' (default) or 'v3'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isDemo = this.isDemoMode (params);
        const isCloseOrder = this.safeBool (params, 'isCloseOrder', false);
        const options = this.safeDict (this.options, 'cancelOrder', {});
        const defaultVersion = this.safeString (options, 'version', 'v2');
        const version = this.safeString (params, 'version', defaultVersion);
        const query = this.omit (params, [ 'demo', 'isCloseOrder', 'version' ]);
        const request: Dict = {
            'orderId': id,
        };
        let response: NullableDict = undefined;
        if (isCloseOrder) {
            response = (isDemo)
                ? await this.privateDeleteApiV1TradingExecutionDemoMarketCloseOrdersOrderId (this.extend (request, query))
                : await this.privateDeleteApiV1TradingExecutionMarketCloseOrdersOrderId (this.extend (request, query));
        } else if (version === 'v3') {
            response = (isDemo)
                ? await this.privateDeleteApiV3TradingExecutionDemoOrdersOrderId (this.extend (request, query))
                : await this.privateDeleteApiV3TradingExecutionOrdersOrderId (this.extend (request, query));
        } else {
            response = (isDemo)
                ? await this.privateDeleteApiV2TradingExecutionDemoOrdersOrderId (this.extend (request, query))
                : await this.privateDeleteApiV2TradingExecutionOrdersOrderId (this.extend (request, query));
        }
        //
        //     {
        //         "token": "066faaee-e1e9-49d2-a568-c6e1cc336ad8"
        //     }
        //
        const order = this.parseOrder (response, market);
        if (order['id'] === undefined) {
            order['id'] = id;
        }
        order['status'] = 'canceled';
        return order;
    }

    /**
     * @method
     * @name etoro#closePosition
     * @description closes an open position fully or partially at market price
     * @see https://api-portal.etoro.com/api-reference/trading--real/close-position-by-units
     * @see https://api-portal.etoro.com/api-reference/trading--demo/close-demo-position-by-units
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] 'buy' or 'sell' (optional filter when auto-resolving an open position without positionId)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the eToro positionId to close (auto-resolved from open positions for symbol if omitted)
     * @param {float} [params.units] partial number of units to close (omitted or null closes the full position)
     * @param {boolean} [params.demo] true to close on the demo account, false for real
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async closePosition (symbol: string, side: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isDemo = this.isDemoMode (params);
        let positionId = this.safeString2 (params, 'positionId', 'positionID');
        const unitsToDeduct = this.safeStringN (params, [ 'units', 'UnitsToDeduct', 'amount' ]);
        const query = this.omit (params, [ 'demo', 'positionId', 'positionID', 'units', 'UnitsToDeduct', 'amount' ]);
        let closeOrderSide: Str = undefined;
        let targetSide: Str = undefined;
        if (side !== undefined) {
            const sideLower = side.toLowerCase ();
            if (sideLower === 'buy') {
                targetSide = 'short';
                closeOrderSide = 'buy';
            } else if (sideLower === 'sell') {
                targetSide = 'long';
                closeOrderSide = 'sell';
            } else if (sideLower === 'long') {
                targetSide = 'long';
                closeOrderSide = 'sell';
            } else if (sideLower === 'short') {
                targetSide = 'short';
                closeOrderSide = 'buy';
            }
        }
        if (positionId === undefined) {
            const positions = await this.fetchPositions ([ market['symbol'] ], { 'demo': isDemo });
            const matching: Position[] = [];
            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                if ((targetSide === undefined) || (pos['side'] === targetSide)) {
                    matching.push (pos);
                }
            }
            const matchingLength = matching.length;
            if (matchingLength === 0) {
                throw new InvalidOrder (this.id + ' closePosition() could not find an open position for ' + symbol);
            }
            if (matchingLength > 1) {
                throw new ArgumentsRequired (this.id + ' closePosition() requires a positionId parameter, there is more than one open position for ' + symbol);
            }
            positionId = this.safeString (matching[0], 'id');
            if (closeOrderSide === undefined) {
                const posSide = this.safeString (matching[0], 'side');
                if (posSide === 'long') {
                    closeOrderSide = 'sell';
                } else if (posSide === 'short') {
                    closeOrderSide = 'buy';
                }
            }
        }
        const instrumentIdInt = this.parseToInt (market['id']);
        const request: Dict = {
            'positionId': positionId,
        };
        if (isDemo) {
            request['InstrumentID'] = instrumentIdInt;
        } else {
            request['InstrumentId'] = instrumentIdInt;
        }
        if (unitsToDeduct !== undefined) {
            request['UnitsToDeduct'] = this.parseToNumeric (this.amountToPrecision (symbol, unitsToDeduct));
        }
        const response = (isDemo)
            ? await this.privatePostApiV1TradingExecutionDemoMarketCloseOrdersPositionsPositionId (this.extend (request, query))
            : await this.privatePostApiV1TradingExecutionMarketCloseOrdersPositionsPositionId (this.extend (request, query));
        //
        //     {
        //         "orderForClose": {
        //             "positionID": 2980225895,
        //             "instrumentID": 100000,
        //             "unitsToDeduct": 0.000822,
        //             "orderID": 13902600,
        //             "orderType": 19,
        //             "statusID": 1,
        //             "CID": 34374239,
        //             "openDateTime": "2026-11-26T14:05:00Z",
        //             "lastUpdate": "2026-11-26T14:05:00Z"
        //         },
        //         "token": "066faaee-e1e9-49d2-a568-c6e1cc336ad8"
        //     }
        //
        const orderForClose = this.safeDict (response, 'orderForClose', response);
        const order = this.parseOrder (orderForClose, market);
        order['info'] = response;
        if (order['reduceOnly'] === undefined) {
            order['reduceOnly'] = true;
        }
        if (order['type'] === undefined) {
            order['type'] = 'market';
        }
        if ((order['side'] === undefined) && (closeOrderSide !== undefined)) {
            order['side'] = closeOrderSide;
        }
        return order;
    }

    /**
     * @method
     * @name etoro#editPosition
     * @description modifies stop-loss and take-profit settings on an open position
     * @see https://api-portal.etoro.com/api-reference/trading--real/modify-stop-loss-and-take-profit-settings-on-an-open-position
     * @see https://api-portal.etoro.com/api-reference/trading--demo/modify-stop-loss-and-take-profit-settings-on-an-open-position
     * @param {string} positionId the id of the open position
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to modify a demo position, false for real
     * @param {float} [params.stopLossPrice] the new stop-loss price
     * @param {float} [params.takeProfitPrice] the new take-profit price
     * @param {boolean} [params.trailing] true to enable trailing stop-loss, false for fixed
     * @param {string} [params.stopLossType] explicit stop-loss type: 'fixed' or 'trailing'
     * @returns {object} the exchange response dictionary
     */
    async editPosition (positionId: string, params: Dict = {}): Promise<Dict> {
        const isDemo = this.isDemoMode (params);
        const request: Dict = {
            'positionId': positionId,
        };
        const stopLossPrice = this.safeString2 (params, 'stopLossPrice', 'stopLossRate');
        if (stopLossPrice !== undefined) {
            request['stopLossRate'] = this.parseToNumeric (stopLossPrice);
        }
        const takeProfitPrice = this.safeString2 (params, 'takeProfitPrice', 'takeProfitRate');
        if (takeProfitPrice !== undefined) {
            request['takeProfitRate'] = this.parseToNumeric (takeProfitPrice);
        }
        const stopLossType = this.safeString (params, 'stopLossType');
        const trailing = this.safeBool (params, 'trailing');
        if (stopLossType !== undefined) {
            request['stopLossType'] = stopLossType;
        } else if (trailing !== undefined) {
            request['stopLossType'] = trailing ? 'trailing' : 'fixed';
        }
        const query = this.omit (params, [ 'demo', 'stopLossPrice', 'stopLossRate', 'takeProfitPrice', 'takeProfitRate', 'trailing', 'stopLossType' ]);
        const response = (isDemo)
            ? await this.privatePatchApiV2TradingDemoPositionsPositionId (this.extend (request, query))
            : await this.privatePatchApiV2TradingPositionsPositionId (this.extend (request, query));
        //
        //     {
        //         "operationId": "...",
        //         "positionId": 3650745937,
        //         "referenceId": "..."
        //     }
        //
        return response;
    }

    parseProtectionRate (rate: Str): Str {
        // eToro uses 0, 0.0001, and 0.01 as placeholders when stop-loss or take-profit is unset
        if ((rate === undefined) || Precise.stringLe (rate, '0.01')) {
            return undefined;
        }
        return rate;
    }

    /**
     * @ignore
     * @method
     * @name etoro#parseOrderStatus
     * @description maps eToro numeric or string order status to a unified CCXT order status
     * @param {string|undefined} status raw status string or id
     * @returns {string|undefined} unified CCXT order status
     */
    parseOrderStatus (status: Str): Str {
        if (status === undefined) {
            return undefined;
        }
        const statusById = this.safeDict (this.options, 'orderStatusById', {});
        const mappedById = this.safeString (statusById, status);
        if (mappedById !== undefined) {
            return mappedById;
        }
        const statusByName = this.safeDict (this.options, 'orderStatusByName', {});
        return this.safeString (statusByName, status.toLowerCase (), status.toLowerCase ());
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // v2/trading/info/orders:lookup:
        //     {
        //         "accountId": 34374239,
        //         "orderId": 13902598,
        //         "action": "open",
        //         "transaction": "buy",
        //         "type": "mkt",
        //         "status": { "id": 3, "name": "Filled", "errorCode": 0, "errorMessage": null },
        //         "asset": { "symbol": "BTC", "instrumentId": 100000, "currency": "USD", "settlementType": "real", "leverage": 1, "side": "long" },
        //         "orderCurrency": "USD",
        //         "requestedAmount": 50,
        //         "requestedUnits": null,
        //         "requestedTriggerRate": null,
        //         "openStopLossRate": 50000,
        //         "openTakeProfitRate": 70000,
        //         "totalCosts": 0.49,
        //         "positionExecutions": [
        //             {
        //                 "positionId": 2980225895,
        //                 "state": "open",
        //                 "investedAmountCurrency": 50,
        //                 "openingData": {
        //                     "openTime": "2026-11-26T14:00:00Z",
        //                     "executionTime": "2026-11-26T14:00:00Z",
        //                     "units": 0.000822,
        //                     "avgPrice": 60800,
        //                     "fees": 0.49
        //                 }
        //             }
        //         ],
        //         "requestTime": "2026-11-26T14:00:00Z",
        //         "lastUpdate": "2026-11-26T14:00:01Z"
        //     }
        //
        // v2/trading/info/instrument-breakdown order:
        //     {
        //         "orderId": 13902598,
        //         "instrumentId": 100000,
        //         "requestTime": "2026-11-26T14:00:00Z",
        //         "transaction": "buy",
        //         "action": "open",
        //         "status": "pendingTriggerRate",
        //         "type": "mit",
        //         "requestedTriggerRate": 55000,
        //         "requestedUnits": 0.001,
        //         "requestedAmountAcctCcy": 55,
        //         "openStopLossRate": 50000,
        //         "openTakeProfitRate": 70000,
        //         "asset": { "instrumentId": 100000, "symbol": "BTC", "direction": "long" }
        //     }
        //
        // v2/trading/execution/orders response:
        //     {
        //         "token": "066faaee-e1e9-49d2-a568-c6e1cc336ad8",
        //         "orderId": 13902598,
        //         "referenceId": "1c94300c-90aa-4303-9d00-dec376d74efb"
        //     }
        //
        // v1/trading/info/{real|demo}/close-orders/{orderId} & orderForClose & WS OrderUpdate:
        //     {
        //         "orderID": 981286176,
        //         "statusID": 3,
        //         "instrumentID": 100000,
        //         "requestOccurred": "2026-11-26T14:05:00Z",
        //         "proceeds": 50.0,
        //         "positions": [ { "positionID": 2980225895, "occurred": "...", "rate": 60750, "units": 0.000822, "amount": 50 } ]
        //     }
        //
        let asset = this.safeDict (order, 'asset');
        if (asset === undefined) {
            const assets = this.safeList (order, 'asset', []);
            asset = this.safeDict (assets, 0, {});
        }
        let marketId = this.safeStringN (order, [ 'instrumentId', 'instrumentID', 'InstrumentID' ]);
        if (marketId === undefined) {
            marketId = this.safeString2 (asset, 'instrumentId', 'instrumentID');
        }
        if (marketId === '0') {
            marketId = undefined;
        }
        const settlementType = this.safeString (asset, 'settlementType');
        const resolvedMarket = this.safeEtoroMarket (marketId, settlementType, market);
        const id = this.safeStringN (order, [ 'orderId', 'orderID', 'OrderID' ]);
        const clientOrderId = this.safeStringN (order, [ 'referenceId', 'referenceID', 'RequestGuid', 'RequestToken', 'token' ]);
        const timestampStr = this.safeStringN (order, [ 'requestTime', 'openDateTime', 'OpenDateTime', 'requestOccurred', 'RequestOccurred' ]);
        const lastUpdateStr = this.safeStringN (order, [ 'lastUpdate', 'LastUpdate', 'LastUpdated', 'updateTime' ]);
        const lastUpdateTimestamp = this.parseUtcIsoTimestamp (lastUpdateStr);
        let timestamp = this.parseUtcIsoTimestamp (timestampStr);
        if (timestamp === undefined) {
            timestamp = lastUpdateTimestamp;
        }
        // Status can be a nested object (orders:lookup), a string (instrument-breakdown / WS OrderEvent), or an integer statusID (v1/WS)
        const statusObj = this.safeDict (order, 'status');
        let rawStatus: Str = undefined;
        let rejectReason: Str = undefined;
        if (statusObj !== undefined) {
            rawStatus = this.safeString2 (statusObj, 'id', 'name');
            const errorCode = this.safeString (statusObj, 'errorCode');
            if ((errorCode !== undefined) && (errorCode !== '0')) {
                const errMsg = this.safeString (statusObj, 'errorMessage', '');
                rejectReason = (errMsg !== '') ? (errorCode + ' ' + errMsg) : errorCode;
            }
        } else {
            rawStatus = this.safeStringN (order, [ 'status', 'orderState', 'statusId', 'statusID', 'StatusID', 'StatusId' ]);
        }
        const status = this.parseOrderStatus (rawStatus);
        // Order type
        const rawType = this.safeStringLower2 (order, 'type', 'orderType');
        let orderType: Str = undefined;
        let timeInForce: Str = undefined;
        if (rawType === 'mkt') {
            orderType = 'market';
        } else if (rawType === 'mit') {
            orderType = 'limit';
        } else if (rawType === 'limitioc') {
            orderType = 'limit';
            timeInForce = 'IOC';
        }
        // Side
        let transaction = this.safeStringLower (order, 'transaction');
        if (transaction === 'na') {
            transaction = undefined;
        }
        let side: Str = undefined;
        if ((transaction === 'buy') || (transaction === 'buytocover')) {
            side = 'buy';
        } else if ((transaction === 'sell') || (transaction === 'sellshort')) {
            side = 'sell';
        } else {
            const isBuy = this.safeBool2 (order, 'isBuy', 'IsBuy');
            if (isBuy !== undefined) {
                side = (isBuy) ? 'buy' : 'sell';
            } else {
                const assetSide = this.safeStringLower2 (asset, 'side', 'direction');
                if (assetSide === 'long') {
                    side = 'buy';
                } else if (assetSide === 'short') {
                    side = 'sell';
                }
            }
        }
        const action = this.safeStringLower (order, 'action');
        let reduceOnly: boolean | undefined = (action === 'close') ? true : undefined;
        if (this.safeString (order, 'orderType') === '19') {
            reduceOnly = true;
        }
        const triggerPrice = this.omitZero (this.safeStringN (order, [ 'requestedTriggerRate', 'rate', 'Rate' ]));
        const isNoStopLoss = this.safeBool2 (order, 'isNoStopLoss', 'IsNoStopLoss', false);
        const isNoTakeProfit = this.safeBool2 (order, 'isNoTakeProfit', 'IsNoTakeProfit', false);
        const stopLossPrice = (isNoStopLoss) ? undefined : this.parseProtectionRate (this.safeStringN (order, [ 'openStopLossRate', 'stopLossRate', 'StopLossRate' ]));
        const takeProfitPrice = (isNoTakeProfit) ? undefined : this.parseProtectionRate (this.safeStringN (order, [ 'openTakeProfitRate', 'takeProfitRate', 'TakeProfitRate' ]));
        const isFuture = (resolvedMarket !== undefined) && resolvedMarket['future'];
        let amount = isFuture
            ? this.omitZero (this.safeStringN (order, [ 'requestedContracts', 'requestedUnits', 'RequestedUnits', 'units', 'Units', 'amountInUnits', 'AmountInUnits', 'unitsToDeduct', 'UnitsToDeduct' ]))
            : this.omitZero (this.safeStringN (order, [ 'requestedUnits', 'RequestedUnits', 'units', 'Units', 'amountInUnits', 'AmountInUnits', 'unitsToDeduct', 'UnitsToDeduct', 'requestedContracts' ]));
        let cost = this.omitZero (this.safeStringN (order, [ 'requestedAmount', 'requestedAmountAcctCcy', 'amount', 'Amount', 'proceeds', 'totalProceeds' ]));
        let filled = this.omitZero (this.safeString2 (order, 'ExecutedUnits', 'FilledAmountUnits'));
        let average = this.omitZero (this.safeString (order, 'EndRate'));
        let feeCost = this.safeStringN (order, [ 'totalFees', 'totalCosts', 'TotalExternalFees', 'TotalExternalCosts', 'estimatedExternalCosts' ]);
        let lastTradeTimestamp: Int = undefined;
        // Parse positionExecutions (REST orders:lookup) and positionsExecutions (WS OrderEvent)
        const executions = this.safeList2 (order, 'positionExecutions', 'positionsExecutions', []);
        const executionsLength = executions.length;
        if (executionsLength > 0) {
            let totalUnits: Str = '0';
            let totalNotional: Str = '0';
            let totalInvested: Str = '0';
            let totalFees: Str = '0';
            for (let i = 0; i < executions.length; i++) {
                const exec = executions[i];
                const execData = this.safeDict2 (exec, 'openingData', 'closingData', {});
                const execUnits = isFuture
                    ? this.safeString2 (execData, 'contracts', 'units')
                    : this.safeString2 (execData, 'units', 'contracts');
                const execPrice = this.safeString (execData, 'avgPrice');
                const execInvested = this.safeStringN (exec, [ 'initialExposureAssetCurrency', 'initialExposureAccountCurrency', 'marginAssetCurrency', 'marginAccountCurrency' ]);
                const execFees = this.safeString (execData, 'fees');
                const execTime = this.parseUtcIsoTimestamp (this.safeStringN (execData, [ 'executionTime', 'openTime', 'closeTime' ]));
                if (execTime !== undefined) {
                    lastTradeTimestamp = execTime;
                }
                if (execUnits !== undefined) {
                    totalUnits = Precise.stringAdd (totalUnits, execUnits);
                    if (execPrice !== undefined) {
                        totalNotional = Precise.stringAdd (totalNotional, Precise.stringMul (execUnits, execPrice));
                    }
                }
                if (execInvested !== undefined) {
                    totalInvested = Precise.stringAdd (totalInvested, execInvested);
                }
                if (execFees !== undefined) {
                    totalFees = Precise.stringAdd (totalFees, execFees);
                }
            }
            if (Precise.stringGt (totalUnits, '0')) {
                filled = totalUnits;
                if (amount === undefined) {
                    amount = totalUnits;
                }
                if (Precise.stringGt (totalNotional, '0')) {
                    average = Precise.stringDiv (totalNotional, totalUnits);
                }
            }
            if (Precise.stringGt (totalInvested, '0')) {
                cost = totalInvested;
            } else if (Precise.stringGt (totalNotional, '0')) {
                cost = totalNotional;
            }
            if (Precise.stringGt (totalFees, '0') && (feeCost === undefined)) {
                feeCost = totalFees;
            }
        }
        // Parse closed positions array from v1 close-orders/{orderId}
        const closedPositions = this.safeList (order, 'positions', []);
        const closedPositionsLength = closedPositions.length;
        if ((closedPositionsLength > 0) && (filled === undefined)) {
            let totalClosedUnits: Str = '0';
            let totalClosedNotional: Str = '0';
            for (let i = 0; i < closedPositions.length; i++) {
                const posExec = closedPositions[i];
                const posUnits = this.safeString (posExec, 'units');
                const posRate = this.safeString (posExec, 'rate');
                const posOccurred = this.parseUtcIsoTimestamp (this.safeString (posExec, 'occurred'));
                if (posOccurred !== undefined) {
                    lastTradeTimestamp = posOccurred;
                }
                if (posUnits !== undefined) {
                    totalClosedUnits = Precise.stringAdd (totalClosedUnits, posUnits);
                    if (posRate !== undefined) {
                        totalClosedNotional = Precise.stringAdd (totalClosedNotional, Precise.stringMul (posUnits, posRate));
                    }
                }
            }
            if (Precise.stringGt (totalClosedUnits, '0')) {
                filled = totalClosedUnits;
                if (amount === undefined) {
                    amount = totalClosedUnits;
                }
                if (Precise.stringGt (totalClosedNotional, '0')) {
                    average = Precise.stringDiv (totalClosedNotional, totalClosedUnits);
                    cost = totalClosedNotional;
                }
            }
        }
        const orderCurrency = this.safeCurrencyCode (this.safeString (order, 'orderCurrency', 'USD'));
        let fee: NullableDict = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': this.parseNumber (feeCost),
                'currency': orderCurrency,
            };
        }
        const parsedOrder: Dict = {
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': status,
            'symbol': this.safeString (resolvedMarket, 'symbol'),
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': triggerPrice,
            'triggerPrice': triggerPrice,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            'trades': undefined,
            'info': order,
        };
        if (rejectReason !== undefined) {
            parsedOrder['rejectReason'] = rejectReason;
        }
        return this.safeOrder (parsedOrder, resolvedMarket);
    }

    /**
     * @method
     * @name etoro#fetchMyTrades
     * @description fetch all closed trades made by the user
     * @see https://api-portal.etoro.com/api-reference/trading--real/list-trading-history
     * @see https://api-portal.etoro.com/api-reference/trading--demo/list-trading-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for (lookback must be less than 1 year)
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.demo] true to query the demo account, false for real
     * @param {int} [params.page] 1-based page number
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isDemo = this.isDemoMode (params);
        const query = this.omit (params, 'demo');
        const defaultSince = this.milliseconds () - (364 * 24 * 60 * 60 * 1000);
        const effectiveSince = (since !== undefined) ? since : defaultSince;
        const request: Dict = {
            'minDate': this.ymd (effectiveSince, '-'),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = (isDemo)
            ? await this.privateGetApiV1TradingInfoTradeDemoHistory (this.extend (request, query))
            : await this.privateGetApiV1TradingInfoTradeHistory (this.extend (request, query));
        //
        //     [
        //         {
        //             "netProfit": -0.5,
        //             "closeRate": 60750,
        //             "closeTimestamp": "2026-11-26T14:05:00Z",
        //             "positionId": 2980225895,
        //             "instrumentId": 100000,
        //             "isBuy": true,
        //             "leverage": 1,
        //             "openRate": 60800,
        //             "openTimestamp": "2026-11-26T14:00:00Z",
        //             "stopLossRate": 50000,
        //             "takeProfitRate": 70000,
        //             "trailingStopLoss": false,
        //             "orderId": 13902598,
        //             "socialTradeId": 0,
        //             "parentPositionId": 0,
        //             "investment": 50,
        //             "initialInvestment": 50,
        //             "fees": 0.49,
        //             "units": 0.000822
        //         }
        //     ]
        //
        const expanded: List = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            expanded.push (this.extend (entry, { 'tradeSide': 'open' }));
            expanded.push (this.extend (entry, { 'tradeSide': 'close' }));
        }
        const parsed = this.parseTrades (expanded, undefined, undefined, undefined);
        const sorted = this.sortBy (parsed, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, (market === undefined) ? undefined : market['symbol'], since, limit);
    }

    marketFromHistoryEntry (entry: Dict, market: Market = undefined): MarketInterface {
        if (market !== undefined) {
            return market;
        }
        const instrumentId = this.safeStringN (entry, [ 'instrumentId', 'instrumentID', 'InstrumentID' ]);
        const futureMarket = this.safeMarket (instrumentId, undefined, undefined, 'future');
        if (futureMarket['future']) {
            return futureMarket;
        }
        // trade/history and v1/pnl do not include settlementType; unleveraged long stocks, ETFs, and crypto are real spot assets
        const isBuy = this.safeBool2 (entry, 'isBuy', 'IsBuy');
        const leverage = this.safeString2 (entry, 'leverage', 'Leverage');
        let settlementType = 'cfd';
        if (isBuy && (leverage === '1')) {
            const spotMarket = this.safeMarket (instrumentId, undefined, undefined, 'spot');
            if (spotMarket['spot']) {
                settlementType = 'real';
            }
        }
        return this.safeEtoroMarket (instrumentId, settlementType);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "netProfit": -0.5,
        //         "closeRate": 60750,
        //         "closeTimestamp": "2026-11-26T14:05:00Z",
        //         "positionId": 2980225895,
        //         "instrumentId": 100000,
        //         "isBuy": true,
        //         "leverage": 1,
        //         "openRate": 60800,
        //         "openTimestamp": "2026-11-26T14:00:00Z",
        //         "orderId": 13902598,
        //         "investment": 50,
        //         "initialInvestment": 50,
        //         "fees": 0.49,
        //         "units": 0.000822,
        //         "tradeSide": "open" // or "close"
        //     }
        //
        const resolvedMarket = this.marketFromHistoryEntry (trade, market);
        const tradeSide = this.safeString (trade, 'tradeSide');
        const isOpen = (tradeSide === 'open');
        const isClose = (tradeSide === 'close');
        const positionId = this.safeString2 (trade, 'positionId', 'positionID');
        let id = positionId;
        if ((positionId !== undefined) && (tradeSide !== undefined)) {
            id = positionId + '-' + tradeSide;
        }
        const orderId = isClose ? undefined : this.safeString2 (trade, 'orderId', 'orderID');
        const isBuy = this.safeBool (trade, 'isBuy');
        let side: Str = undefined;
        let price: Str = undefined;
        let timestampStr: Str = undefined;
        if (isOpen) {
            if (isBuy !== undefined) {
                side = isBuy ? 'buy' : 'sell';
            }
            price = this.safeString (trade, 'openRate');
            timestampStr = this.safeString (trade, 'openTimestamp');
        } else {
            if (isBuy !== undefined) {
                if (isClose) {
                    side = isBuy ? 'sell' : 'buy';
                } else {
                    side = isBuy ? 'buy' : 'sell';
                }
            }
            price = this.safeString2 (trade, 'closeRate', 'openRate');
            timestampStr = this.safeString2 (trade, 'closeTimestamp', 'openTimestamp');
        }
        const timestamp = this.parseUtcIsoTimestamp (timestampStr);
        const amount = this.safeString (trade, 'units');
        let cost: Str = undefined;
        if ((price === undefined) || (amount === undefined)) {
            cost = this.safeString2 (trade, 'investment', 'initialInvestment');
        }
        let fee: NullableDict = undefined;
        if (!isOpen) {
            const feeCost = this.safeString (trade, 'fees');
            if (feeCost !== undefined) {
                fee = {
                    'cost': this.parseNumber (Precise.stringAbs (feeCost)),
                    'currency': 'USD',
                };
            }
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': resolvedMarket['symbol'],
            'order': orderId,
            'type': 'market',
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name etoro#transfer
     * @description transfer currency internally between eToro accounts belonging to the same user
     * @see https://api-portal.etoro.com/api-reference/transfer/execute-an-internal-account-to-account-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount source account type ('trading', 'cash', 'options') or 'accountType:accountId'
     * @param {string} toAccount destination account type ('trading', 'cash', 'options') or 'accountType:accountId'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.sourceAccountId] source account identifier (required if not embedded in fromAccount as 'type:id')
     * @param {string} [params.destinationAccountId] destination account identifier (required if not embedded in toAccount as 'type:id')
     * @param {string} [params.requestReferenceId] client idempotency reference ID (defaults to a generated UUID)
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    override async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params: Dict = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let sourceAccountType = fromAccount;
        let sourceAccountId = this.safeString (params, 'sourceAccountId');
        if (fromAccount.indexOf (':') !== -1) {
            const parts = fromAccount.split (':');
            sourceAccountType = parts[0];
            sourceAccountId = parts[1];
        }
        let destinationAccountType = toAccount;
        let destinationAccountId = this.safeString (params, 'destinationAccountId');
        if (toAccount.indexOf (':') !== -1) {
            const parts = toAccount.split (':');
            destinationAccountType = parts[0];
            destinationAccountId = parts[1];
        }
        if ((sourceAccountId === undefined) || (destinationAccountId === undefined)) {
            throw new ArgumentsRequired (this.id + ' transfer() requires sourceAccountId and destinationAccountId (either in params or as "accountType:accountId")');
        }
        const requestReferenceId = this.safeString (params, 'requestReferenceId', this.uuid ());
        const request: Dict = {
            'requestReferenceId': requestReferenceId,
            'sourceAccount': {
                'accountType': sourceAccountType.toLowerCase (),
                'accountId': sourceAccountId,
            },
            'destinationAccount': {
                'accountType': destinationAccountType.toLowerCase (),
                'accountId': destinationAccountId,
            },
            'amount': amount,
            'currency': currency['id'],
        };
        const query = this.omit (params, [ 'sourceAccountId', 'destinationAccountId', 'requestReferenceId' ]);
        const response = await this.privatePostApiV1MoneyTransfers (this.extend (request, query));
        //
        //     {
        //         "transferId": 12345678,
        //         "requestReferenceId": "client-ref-8f3a-001"
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        transfer['amount'] = amount;
        transfer['fromAccount'] = sourceAccountType;
        transfer['toAccount'] = destinationAccountType;
        return transfer;
    }

    /**
     * @method
     * @name etoro#fetchTransfer
     * @description fetch a transfer by its server transferId or client requestReferenceId
     * @see https://api-portal.etoro.com/api-reference/transfer/get-transfer-by-id
     * @see https://api-portal.etoro.com/api-reference/transfer/list-transfers-by-reference-id
     * @param {string} id transfer id or client requestReferenceId
     * @param {string} [code] unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.requestReferenceId] lookup by client reference ID instead of numeric transferId
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    override async fetchTransfer (id: string, code: Str = undefined, params: Dict = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const requestReferenceId = this.safeString (params, 'requestReferenceId');
        const query = this.omit (params, 'requestReferenceId');
        let response: NullableDict = undefined;
        if ((requestReferenceId !== undefined) || ((id !== undefined) && (id.indexOf ('-') !== -1))) {
            const refId = (requestReferenceId !== undefined) ? requestReferenceId : id;
            response = await this.privateGetApiV1MoneyTransfersLookup (this.extend ({ 'requestReferenceId': refId }, query));
        } else {
            response = await this.privateGetApiV1MoneyTransfersTransferId (this.extend ({ 'transferId': id }, query));
        }
        const results = this.safeList (response, 'results', []);
        const entry = this.safeDict (results, 0, response);
        return this.parseTransfer (entry, currency);
    }

    override parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // POST /api/v1/money/transfers:
        //     {
        //         "transferId": 12345678,
        //         "requestReferenceId": "client-ref-8f3a-001"
        //     }
        //
        // GET /api/v1/money/transfers/{transferId}:
        //     {
        //         "id": 12345678,
        //         "status": "Success",
        //         "statusReason": null,
        //         "referenceId": "client-ref-8f3a-001",
        //         "amount": 250.0,
        //         "currency": "USD",
        //         "created": "2026-11-26T14:00:00Z",
        //         "modified": "2026-11-26T14:00:05Z",
        //         "source": { "sourceAccount": { "accountType": "trading", "accountId": "1001" } },
        //         "destination": { "destinationAccount": { "accountType": "cash", "accountId": "x-5501" } }
        //     }
        //
        const id = this.safeString2 (transfer, 'id', 'transferId');
        const timestamp = this.parseUtcIsoTimestamp (this.safeString2 (transfer, 'created', 'modified'));
        const currencyId = this.safeString (transfer, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (transfer, 'amount');
        const rawStatus = this.safeStringLower (transfer, 'status');
        const statusMap = this.safeDict (this.options, 'transferStatus', {});
        const status = this.safeString (statusMap, rawStatus, rawStatus);
        const source = this.safeDict (transfer, 'source', {});
        const sourceAccount = this.safeDict (source, 'sourceAccount', {});
        const destination = this.safeDict (transfer, 'destination', {});
        const destinationAccount = this.safeDict (destination, 'destinationAccount', {});
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': this.safeString (sourceAccount, 'accountType'),
            'toAccount': this.safeString (destinationAccount, 'accountType'),
            'status': status,
        };
    }

    /**
     * @method
     * @name etoro#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of a cash account
     * @see https://api-portal.etoro.com/api-reference/cash-accounts/list-cash-account-transactions-paginated
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return (default 50, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] cash account UUID (auto-discovered from cash balances if omitted)
     * @param {string} [params.pageToken] pagination cursor from previous response
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-entry-structure}
     */
    override async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        let accountId = this.safeString (params, 'accountId');
        const query = this.omit (params, 'accountId');
        if (accountId === undefined) {
            const cashBalancesResp = await this.privateGetApiV1BalancesAccountType ({ 'accountType': 'cash', 'includeZeroBalances': true });
            const cashBalances = this.safeList (cashBalancesResp, 'balances', []);
            for (let i = 0; i < cashBalances.length; i++) {
                const bal = cashBalances[i];
                const balCurr = this.safeCurrencyCode (this.safeString (bal, 'currency'));
                if ((code === undefined) || (balCurr === code)) {
                    accountId = this.safeString (bal, 'accountId');
                    break;
                }
            }
            if (accountId === undefined) {
                return [];
            }
        }
        const request: Dict = {
            'accountId': accountId,
        };
        if (limit !== undefined) {
            request['pageSize'] = Math.min (limit, 500);
        }
        const response = await this.privateGetApiV1MoneyAccountsCashAccountIdTransactions (this.extend (request, query));
        const results = this.safeList (response, 'results', []);
        return this.parseLedger (results, currency, since, limit);
    }

    override parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        //     {
        //         "id": "tx-001",
        //         "accountId": "acc-uuid",
        //         "transactionType": "internalTransfer",
        //         "transactionSubtype": "transferReceived",
        //         "direction": "credit",
        //         "status": "settled",
        //         "amount": "250.00",
        //         "currency": "USD",
        //         "postedAt": "2026-11-26T14:00:00Z",
        //         "internalTransferTransactionDetails": { "transferId": "12345" }
        //     }
        //
        const id = this.safeString (item, 'id');
        const timestamp = this.parseUtcIsoTimestamp (this.safeString (item, 'postedAt'));
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (item, 'amount');
        const rawDirection = this.safeStringLower (item, 'direction');
        let direction: Str = undefined;
        if (rawDirection === 'credit') {
            direction = 'in';
        } else if (rawDirection === 'debit') {
            direction = 'out';
        }
        const rawType = this.safeStringLower (item, 'transactionType');
        let ledgerType = rawType;
        if (rawType === 'internaltransfer') {
            ledgerType = 'transfer';
        } else if ((rawType === 'banktransfer') || (rawType === 'balanceadjustment')) {
            ledgerType = 'transaction';
        }
        const rawStatus = this.safeStringLower (item, 'status');
        let status = rawStatus;
        if ((rawStatus === 'settled') || (rawStatus === 'authorized')) {
            status = 'ok';
        } else if ((rawStatus === 'failed') || (rawStatus === 'rejected') || (rawStatus === 'returned') || (rawStatus === 'expired')) {
            status = 'failed';
        }
        const internalDetails = this.safeDict (item, 'internalTransferTransactionDetails', {});
        const bankDetails = this.safeDict (item, 'bankTransferTransactionDetails', {});
        const referenceId = this.safeString (internalDetails, 'transferId', this.safeString (bankDetails, 'paymentReference'));
        return this.safeLedgerEntry ({
            'info': item,
            'id': id,
            'direction': direction,
            'account': this.safeString (item, 'accountId'),
            'referenceAccount': undefined,
            'referenceId': referenceId,
            'type': ledgerType,
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': undefined,
            'status': status,
            'fee': undefined,
        }, currency);
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined): Dict {
        const endpoint = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        const apiType = Array.isArray (api) ? api[0] : api;
        let url = this.urls['api'][apiType] + '/' + endpoint;
        const reqHeaders: Dict = (headers !== undefined) ? this.extend ({}, headers) : {};
        let reqBody: any = body;
        // x-request-id doubles as the clientOrderId (referenceId) for created orders
        const requestId = this.safeString (query, 'x-request-id');
        if (requestId !== undefined) {
            reqHeaders['x-request-id'] = requestId;
            query = this.omit (query, 'x-request-id');
        } else if (!('x-request-id' in reqHeaders)) {
            reqHeaders['x-request-id'] = this.uuid ();
        }
        // eToro Core API requires authentication on every request (either OAuth Bearer token OR x-api-key + x-user-key pair)
        if ((this.token !== undefined) && (this.token !== '') && ((this.apiKey === undefined) || (this.apiKey === ''))) {
            reqHeaders['Authorization'] = 'Bearer ' + this.token;
        } else {
            this.checkRequiredCredentials ();
            reqHeaders['x-api-key'] = this.apiKey;
            reqHeaders['x-user-key'] = this.secret;
        }
        if ((method === 'GET') || (method === 'DELETE')) {
            const queryKeys = Object.keys (query);
            if (queryKeys.length > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            reqHeaders['Content-Type'] = 'application/json';
            reqBody = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': reqBody, 'headers': reqHeaders };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str) {
        if (response === undefined) {
            return undefined;
        }
        //
        // Format 1: { "errorCode": "Unauthorized", "errorMessage": "Unauthorized" }
        // Format 2: { "success": false, "error": { "code": "INSTRUMENT_NOT_FOUND", "message": "..." } }
        // Format 3: { "code": "VALIDATION_ERROR", "message": "..." }
        // Format 4: { "error": "Amount must not be zero" }
        // Format 5: RFC 7807 ProblemDetails { "title": "...", "status": 400, "detail": "..." }
        //
        if (code < 400) {
            if (!this.isDictionary (response)) {
                return undefined;
            }
            const success = this.safeBool (response, 'success');
            if (success !== false) {
                return undefined;
            }
        }
        const feedback = this.id + ' ' + body;
        let errorCode: Str = undefined;
        let errorMessage: Str = undefined;
        if (this.isDictionary (response)) {
            errorCode = this.safeString2 (response, 'errorCode', 'code');
            errorMessage = this.safeStringN (response, [ 'errorMessage', 'message', 'detail', 'title' ]);
            const nestedError = this.safeDict (response, 'error');
            if (nestedError !== undefined) {
                errorCode = this.safeString2 (nestedError, 'code', 'errorCode', errorCode);
                errorMessage = this.safeString2 (nestedError, 'message', 'details', errorMessage);
            } else {
                const stringError = this.safeString (response, 'error');
                if ((stringError !== undefined) && (errorMessage === undefined)) {
                    errorMessage = stringError;
                }
            }
        }
        if (errorCode !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (errorMessage !== undefined) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage.toLowerCase (), feedback);
        }
        this.throwBroadlyMatchedException (this.exceptions['broad'], body.toLowerCase (), feedback);
        if (code === 401) {
            throw new AuthenticationError (feedback);
        }
        if (code === 403) {
            throw new PermissionDenied (feedback);
        }
        if (code === 404) {
            if (url.indexOf ('orders') !== -1) {
                throw new OrderNotFound (feedback);
            }
            throw new BadRequest (feedback);
        }
        if (code === 429) {
            throw new RateLimitExceeded (feedback);
        }
        if (code >= 500) {
            throw new ExchangeNotAvailable (feedback);
        }
        throw new ExchangeError (feedback);
    }
}

