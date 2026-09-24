//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/umx.js';
import { AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout, RestrictedLocation } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Bool, CrossBorrowRate, CrossBorrowRates, Currencies, Currency, DepositAddress, DepositAddresses, Dict, Endpoint, Fee, FundingRate, FundingRateHistory, FundingRates, Int, Leverage, List, MarginMode, Market, MarketInterface, NullableDict, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class umx
 * @augments Exchange
 */
export default class umx extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'umx',
            'name': 'UMX',
            'countries': [ ],
            'version': 'v1', // the api block carries the per-endpoint version prefix (v1 or v2)
            'rateLimit': 20, // 50 requests per second on most endpoints, 800 requests per second per ip overall
            'certified': false,
            'pro': false,
            'has': {
                // market types supported by the venue, businessType: spot | linear_perpetual | linear_futures
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                // nothing is implemented yet, flags are flipped on as the methods land
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': true,
                'closePosition': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': true,
                'fetchCurrencies': true, // private
                'fetchDepositAddress': true,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLedger': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchSettlementHistory': true,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false, // the venue has no testnet
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'hostname': 'umx.com',
            'urls': {
                'logo': 'https://fe-static.xcoin.com/web-public/favicon.ico', // todo: replace with an uploaded logo
                'api': {
                    'public': 'https://api.{hostname}/api',
                    'private': 'https://api.{hostname}/api',
                },
                'www': 'https://www.umx.com',
                'doc': [
                    'https://www.umx.com/docs/coin-apis/introduction/quick-start',
                ],
                'fees': 'https://www.umx.com/guide/spot-fee-rate',
            },
            // every endpoint answers with the same json object envelope, { code, msg, data, ts },
            // so each leaf is Endpoint<Dict> even when its data member is an array
            'api': {
                'public': {
                    'get': {
                        'v1/market/time': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/public/symbols': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/depth': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/ticker/mini': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/ticker/24hr': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/trade': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/kline': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/markPriceKline': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/index': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/indexPriceKline': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/deliveryExercise/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/fundingRate': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/fundingRate/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/public/baseRates': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/public/spotMarginCollateral': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/public/haircut': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/public/flexible/product': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/public/flexible/rateHistory': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        // account management
                        'v1/users/apikeys': { 'cost': 1 } as Endpoint<Dict>,
                        // trading
                        'v2/trade/openOrders': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/order/info': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/order/operations': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/openOrderComplex': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/orderComplexs': { 'cost': 1 } as Endpoint<Dict>,
                        // block spot rfq
                        'v1/account/convert/exchangeInfo': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/convert/orderStatus': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/convert/history/orders': { 'cost': 1 } as Endpoint<Dict>,
                        // trading account
                        'v2/trade/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/lever': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/balance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/transferBalance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/availableBalance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/interest/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/collateralInfo': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/history/bill': { 'cost': 1 } as Endpoint<Dict>,
                        // funding account
                        'v1/asset/account/info': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/balances': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/bill': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/asset/currencies': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/asset/chains': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/asset/fiatChannels': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/deposit/address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/deposit/record': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/record': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/transfer/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/accountMembers': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/crossTransfer/history': { 'cost': 1 } as Endpoint<Dict>,
                        // earn
                        'v1/earn/flexible/records': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        // account management
                        'v1/account/create-subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/account/deactivate-subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/account/reactivate-subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/users/create-apikey': { 'cost': 1 } as Endpoint<Dict>,
                        // trading, 500 orders per second shared across place and cancel
                        'v2/trade/order': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v2/trade/batchOrder': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v1/trade/cancelOrder': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v1/trade/batchCancelOrder': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v1/trade/cancelAllOrder': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/countdownCancelAll': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/close-positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/orderComplex': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/cancelComplex': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/cancelAllOrderComplexs': { 'cost': 1 } as Endpoint<Dict>,
                        // block spot rfq
                        'v1/account/convert/getQuote': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/convert/acceptQuote': { 'cost': 1 } as Endpoint<Dict>,
                        // trading account
                        'v1/trade/lever': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/stopPosition': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/marginModeSet': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/pm/detail': { 'cost': 1 } as Endpoint<Dict>,
                        // funding account
                        'v1/asset/deposit/provide-info': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/add-address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/update-address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/remove-address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/transfer': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/asset/crossTransfer': { 'cost': 1 } as Endpoint<Dict>,
                        // earn
                        'v1/earn/flexible/setFlexibleOnOff': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            // vip 0 rates and the tier table from https://www.umx.com/guide/spot-fee-rate, the
            // thresholds below are the 30 day volume in usdt, the venue grants the same tier for a
            // high enough asset value too, which a single dimension tier table cannot express.
            // contracts have a second tier group that only differs from vip 1 upwards, the table
            // below is group 1. the venue publishes no option schedule, so options reuse it
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'spot': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00067') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00018') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00015') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.00014') ],
                            [ this.parseNumber ('400000000'), this.parseNumber ('0.00012') ],
                            [ this.parseNumber ('800000000'), this.parseNumber ('0.00008') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00039') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00023') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00021') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.00021') ],
                            [ this.parseNumber ('400000000'), this.parseNumber ('0.00018') ],
                            [ this.parseNumber ('800000000'), this.parseNumber ('0.000175') ],
                        ],
                    },
                },
                'swap': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00016') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00014') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00009') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00007') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.00005') ],
                            [ this.parseNumber ('1200000000'), this.parseNumber ('0.00003') ],
                            [ this.parseNumber ('2500000000'), this.parseNumber ('0.00001') ],
                            [ this.parseNumber ('4000000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00028') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00027') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00024') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.00022') ],
                            [ this.parseNumber ('1200000000'), this.parseNumber ('0.00019') ],
                            [ this.parseNumber ('2500000000'), this.parseNumber ('0.00017') ],
                            [ this.parseNumber ('4000000000'), this.parseNumber ('0.00015') ],
                        ],
                    },
                },
                'future': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00016') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00014') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00009') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00007') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.00005') ],
                            [ this.parseNumber ('1200000000'), this.parseNumber ('0.00003') ],
                            [ this.parseNumber ('2500000000'), this.parseNumber ('0.00001') ],
                            [ this.parseNumber ('4000000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00028') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00027') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00024') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.00022') ],
                            [ this.parseNumber ('1200000000'), this.parseNumber ('0.00019') ],
                            [ this.parseNumber ('2500000000'), this.parseNumber ('0.00017') ],
                            [ this.parseNumber ('4000000000'), this.parseNumber ('0.00015') ],
                        ],
                    },
                },
                'option': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00016') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00014') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00009') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00007') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.00005') ],
                            [ this.parseNumber ('1200000000'), this.parseNumber ('0.00003') ],
                            [ this.parseNumber ('2500000000'), this.parseNumber ('0.00001') ],
                            [ this.parseNumber ('4000000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00028') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00027') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00024') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.00022') ],
                            [ this.parseNumber ('1200000000'), this.parseNumber ('0.00019') ],
                            [ this.parseNumber ('2500000000'), this.parseNumber ('0.00017') ],
                            [ this.parseNumber ('4000000000'), this.parseNumber ('0.00015') ],
                        ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'spot',
                'accountsByType': {
                    'funding': 'funding',
                    'trading': 'trading',
                    'spot': 'trading',
                    'margin': 'trading',
                    'swap': 'trading',
                    'future': 'trading',
                    'option': 'trading',
                },
                // every chainType the venue serves, collected live from /v2/asset/chains across
                // the whole currency universe on 2026-09-24. the bnb chain carries evm addresses,
                // so it is bsc and not the beacon chain, and cchainavax is the avalanche c-chain.
                // robinhood is the venue's tokenized stock chain and has no unified name
                'networks': {
                    'ADA': 'ada',
                    'APT': 'apt',
                    'ARBITRUM': 'arb',
                    'ATOM': 'atom',
                    'COSMOS': 'atom',
                    'BASE': 'base',
                    'BCH': 'bch',
                    'BEP20': 'bnb',
                    'BSC': 'bnb',
                    'BTC': 'btc',
                    'AVAXC': 'cchainavax',
                    'DOGE': 'doge',
                    'DOT': 'dot',
                    'ETC': 'etc',
                    'ERC20': 'eth',
                    'ETH': 'eth',
                    'FIL': 'fil',
                    'GRAM': 'gram',
                    'HYPE': 'hype',
                    'ICP': 'icp',
                    'INJ': 'inj',
                    'LTC': 'ltc',
                    'NEAR': 'near',
                    'OPTIMISM': 'op',
                    'OP': 'op',
                    'MATIC': 'pol',
                    'ROBINHOOD': 'robinhood',
                    'SEI': 'sei',
                    'SEIEVM': 'seievm',
                    'SOL': 'sol',
                    'SONIC': 'sonic',
                    'SUI': 'sui',
                    'TAO': 'tao',
                    'TIA': 'tia',
                    'TON': 'ton',
                    'TRC20': 'trx',
                    'TRX': 'trx',
                    'XLM': 'xlm',
                    'XRP': 'xrp',
                },
                'networksById': {
                    // the base inverts options.networks into networksById on its own, so only
                    // the ids with two aliases need pinning to their canonical unified code
                    'atom': 'ATOM',
                    'bnb': 'BEP20',
                    'eth': 'ERC20',
                    'op': 'OPTIMISM',
                    'pol': 'MATIC',
                    'trx': 'TRC20',
                },
                'recvWindow': 5000, // X-ACCESS-RECV-WINDOW, the exchange default
                'timeDifference': 0, // the difference between the system clock and the exchange server clock, set it with loadTimeDifference ()
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                // 'accountName': set it in params or options for institutional member api keys only
                'businessTypes': {
                    'spot': 'spot',
                    'margin': 'spot',
                    'swap': 'linear_perpetual',
                    'future': 'linear_futures',
                    'option': 'options',
                },
            },
            'features': {
                // keep this block in sync with the implemented methods, every entry below is
                // filled in when the corresponding method lands and is verified against the venue
                'default': {
                    'sandbox': false, // the venue has no testnet
                    'fetchCurrencies': {
                        'private': true, // /v2/asset/currencies requires an api key
                    },
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': true,
                            },
                            'price': true,
                        },
                        'timeInForce': {
                            'GTC': true,
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': true,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': undefined,
                        'limit': 100,
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
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000, // the venue rejects a bigger limit with error 40008
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined, // every instrument is settled in USDT
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '10000': BadRequest, // POST request body cannot be empty
                    '10001': BadRequest, // JSON syntax error
                    '10002': ExchangeNotAvailable, // Network error, please contact customer support
                    '10003': NotSupported, // API has been deprecated or is unavailable
                    '10005': RateLimitExceeded, // User triggered PID-level rate limit
                    '10006': ExchangeNotAvailable, // System busy, please try again later
                    '10008': RateLimitExceeded, // User triggered system-level gateway rate limit
                    '10010': PermissionDenied, // This API requires the APIKey to be bound to an IP
                    '10101': AuthenticationError, // APIKey does not exist
                    '10102': InvalidNonce, // Request timestamp expired
                    '10103': AuthenticationError, // Request header "X-ACCESS-APIKEY" cannot be empty
                    '10104': AuthenticationError, // Request header "X-ACCESS-SIGN" cannot be empty
                    '10105': AuthenticationError, // Request header "X-ACCESS-TIMESTAMP" cannot be empty
                    '10106': BadRequest, // Request header "Content-Type" cannot be empty
                    '10107': PermissionDenied, // Your ip is not in the APIKey's whitelist
                    '10109': AuthenticationError, // Invalid X-ACCESS-APIKEY
                    '10110': InvalidNonce, // Invalid X-ACCESS-TIMESTAMP
                    '10111': BadRequest, // Invalid Content-Type
                    '10112': AuthenticationError, // Invalid signature
                    '10113': BadRequest, // Invalid request method
                    '10114': PermissionDenied, // APIKey has no permission to call this API
                    '10115': AuthenticationError, // APIKey is disabled
                    '10116': PermissionDenied, // Operator associated with APIKey has no permission for this API
                    '10117': PermissionDenied, // Platform restricts this operation
                    '10118': RequestTimeout, // API request timed out
                    '10119': AccountSuspended, // Account is disabled
                    '10120': PermissionDenied, // Account permission prohibits this trade
                    '10121': PermissionDenied, // Account does not support deposits
                    '10122': PermissionDenied, // Only master account supports withdrawals
                    '10123': ArgumentsRequired, // For member-level APIKey, accountName cannot be empty
                    '10124': PermissionDenied, // Current APIKey has no permission to operate accountName
                    '10125': AccountSuspended, // Member is disabled
                    '10126': PermissionDenied, // Risk questionnaire required
                    '10127': PermissionDenied, // KYC not completed
                    '11004': RateLimitExceeded, // rate limit warning
                    '13000': RestrictedLocation, // Restrictions on conducting business due to IP location
                    '13002': RestrictedLocation, // Restrictions on conducting crypto business based on IP location
                    '13004': RestrictedLocation, // Restrictions based on the customer's registered location
                    '14001': RateLimitExceeded, // System traffic too high, system-level frequency limiting
                    '20001': ExchangeNotAvailable, // Service temporarily unavailable
                    '20002': ExchangeError, // System error, please try again later
                    '20003': ExchangeError, // System execution exception
                    '40001': ArgumentsRequired, // Required parameter cannot be empty
                    '40002': BadRequest, // endTime must be greater than startTime
                    '40004': BadRequest, // endTime - startTime must be less than 30 days
                    '40006': BadSymbol, // Symbol is not in tradable status
                    '40007': BadRequest, // This API businessType does not support the given dictionary value
                    '40008': BadRequest, // limit cannot exceed the maximum value for this API
                    '40009': BadSymbol, // Currency is not listed
                    '40013': OrderNotFound, // Order not found, the order does not exist
                    '40014': NotSupported, // Only spot instruments are supported
                    '40015': BadRequest, // parameter is invalid or does not exist
                    '50001': InvalidOrder, // For market order type, price must be empty
                    '50002': InvalidOrder, // For current orderType, price cannot be empty
                    '50004': InvalidOrder, // Price cannot be negative
                    '50006': InvalidOrder, // For market orders, timeInForce only supports IOC
                    '50007': DuplicateOrderId, // Duplicate clientId error
                    '50008': NotSupported, // Spot trading does not support reduce-only orders
                    '50026': InvalidOrder, // Order already completed, cancellation failed
                    '50032': InvalidOrder, // qty must be positive
                    '50101': NotSupported, // Spot instruments do not support setting leverage
                    '50102': NotSupported, // Option instruments do not support setting leverage
                    '50103': BadRequest, // Only one of symbol or currency can be provided
                    '50105': BadRequest, // Leverage cannot exceed the maximum
                    '50106': BadRequest, // Leverage must be a positive integer
                    '50113': InvalidOrder, // post_only orders can only be set to GTC
                    '50201': NotSupported, // currency does not support withdrawals
                    '50205': InvalidOrder, // Amount is below minimum withdrawal limit
                    '60100': InsufficientFunds, // Insufficient available balance, and auto-borrow is not enabled
                    '60101': InsufficientFunds, // Insufficient available balance (including borrowable)
                    '60103': InsufficientFunds, // Insufficient transferable balance in trading account
                    '60106': InsufficientFunds, // Insufficient available balance in the funding account
                    '60107': OperationRejected, // Exceeded maximum number of open orders
                    '60112': InvalidOrder, // Below minimum order quantity per order
                    '60113': InvalidOrder, // Below minimum order amount per order
                    '60116': InvalidOrder, // Price decimal places exceed limit
                    '60117': InvalidOrder, // Quantity decimal places exceed limit
                    '60122': OperationRejected, // Options trading is only available in portfolio margin mode
                    '60126': InvalidOrder, // No open positions, reduce-only order not allowed
                    '60136': InvalidOrder, // Input price is not a multiple of tickSize
                    '60142': OrderImmediatelyFillable, // Order price would execute immediately, does not meet post_only condition
                    '60143': OrderNotFillable, // Order price cannot be executed, does not meet IOC or FOK condition
                    '60153': BadSymbol, // Current trading pair not in tradable state
                    '70100': RequestTimeout, // Heartbeat check timed out, connection disconnected
                    '70101': InvalidNonce, // accessTimestamp has expired
                    '70106': RateLimitExceeded, // The number of connections exceeds the upper limit for a single ip
                    '70107': RateLimitExceeded, // Exceeding the upper limit of channels for a single connection
                    '70108': RateLimitExceeded, // The number of connections exceeds the maximum limit for a single user
                },
                'broad': {
                    'Invalid signature': AuthenticationError,
                    'Insufficient': InsufficientFunds,
                    'does not exist': BadRequest,
                    'rate limit': RateLimitExceeded,
                },
            },
        });
    }

    override nonce (): number {
        // the exchange rejects a request whose timestamp is more than one second ahead of its own
        // clock, and X-ACCESS-TIMESTAMP is in milliseconds, while the base nonce () is in seconds
        return this.milliseconds () - this.safeInteger (this.options, 'timeDifference', 0);
    }

    /**
     * @method
     * @name umx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.umx.com/docs/coin-apis/ticker/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params: Dict = {}): Promise<Int> {
        const response = await this.publicGetV1MarketTime (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": { "time": "1790161596695" },
        //         "ts": "1790161596695"
        //     }
        //
        // the docs show "data" as an array of one object, the live endpoint returns a plain object
        //
        const data = this.safeDict (response, 'data', {});
        return this.safeInteger (data, 'time');
    }

    /**
     * @method
     * @name umx#fetchMarkets
     * @description retrieves data on all markets for umx
     * @see https://www.umx.com/docs/coin-apis/ticker/get-the-basic-information-of-trading-products
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference'] === true) {
            await this.loadTimeDifference ();
        }
        const response = await this.publicGetV2PublicSymbols (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [ { ... } ],   // see parseMarket () below for a sample of every businessType
        //         "ts": "1790161596695"
        //     }
        //
        // businessType is documented as required, but the live endpoint returns every instrument
        // type when it is omitted, including "options", which the docs do not list at all
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    override parseMarket (market: Dict): Market {
        //
        // spot
        //
        //     {
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "0",
        //         "optType": null,
        //         "strikePrice": "0",
        //         "tickSize": "0.01",
        //         "status": "trading",
        //         "deliveryTime": null,
        //         "deliveryFeeRate": null,
        //         "pricePrecision": "2",
        //         "quantityPrecision": "5",
        //         "onlineTime": "1750068000000",
        //         "riskEngineRate": null,
        //         "maxLeverage": "10.000000000000000000",
        //         "contractType": null,
        //         "orderParameters": {
        //             "minOrderQty": "0.00001",
        //             "minOrderAmt": "5",
        //             "maxOrderNum": "500",
        //             "maxBaseNum": null,
        //             "maxComboleg": "0",
        //             "maxTriggerOrderNum": "30",
        //             "maxTpslOrderNum": "30",
        //             "maxLmtOrderAmt": "2000000",
        //             "maxMktOrderAmt": "1400000",
        //             "maxLmtOrderQty": null,
        //             "maxMktOrderQty": null,
        //             "basisLimitRatio": null,
        //             "minRfqQty": null,
        //             "minComboQty": null
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": "0.03",
        //             "minLmtPriceDown": "0.03",
        //             "maxMktPriceUp": "0.015",
        //             "minMktPriceDown": "0.015"
        //         },
        //         "positionParameters": null,
        //         "group": [
        //             "0.01",
        //             "0.1",
        //             "1",
        //             "10"
        //         ]
        //     }
        //
        // linear_perpetual
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "BTC-USDT-PERP",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "0.0001",
        //         "optType": null,
        //         "strikePrice": "0",
        //         "tickSize": "0.1",
        //         "status": "trading",
        //         "deliveryTime": null,
        //         "deliveryFeeRate": null,
        //         "pricePrecision": "1",
        //         "quantityPrecision": "4",
        //         "onlineTime": "1750127400000",
        //         "riskEngineRate": "0.0125",
        //         "maxLeverage": "75.000000000000000000",
        //         "contractType": null,
        //         "orderParameters": {
        //             "minOrderQty": "0.0001",
        //             "minOrderAmt": null,
        //             "maxOrderNum": "500",
        //             "maxBaseNum": null,
        //             "maxComboleg": "0",
        //             "maxTriggerOrderNum": "30",
        //             "maxTpslOrderNum": "30",
        //             "maxLmtOrderAmt": null,
        //             "maxMktOrderAmt": null,
        //             "maxLmtOrderQty": "1000",
        //             "maxMktOrderQty": "60",
        //             "basisLimitRatio": "0.1",
        //             "minRfqQty": null,
        //             "minComboQty": null
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": "0.05",
        //             "minLmtPriceDown": "0.05",
        //             "maxMktPriceUp": "0.015",
        //             "minMktPriceDown": "0.015"
        //         },
        //         "positionParameters": {
        //             "positionRatioThreshold": "-1",
        //             "positionMaxRatio": "0.1",
        //             "positionCidMaxRatio": "0.3",
        //             "defaultLeverRatio": "10",
        //             "maxShortQty": null
        //         },
        //         "group": [
        //             "0.1",
        //             "1",
        //             "10",
        //             "100"
        //         ]
        //     }
        //
        // linear_futures
        //
        //     {
        //         "businessType": "linear_futures",
        //         "symbol": "BTC-USDT-25SEP26",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "0.0001",
        //         "optType": null,
        //         "strikePrice": "0",
        //         "tickSize": "0.1",
        //         "status": "trading",
        //         "deliveryTime": "1790323200000",
        //         "deliveryFeeRate": "0.0002",
        //         "pricePrecision": "1",
        //         "quantityPrecision": "4",
        //         "onlineTime": null,
        //         "riskEngineRate": "0.0125",
        //         "maxLeverage": "50.000000000000000000",
        //         "contractType": "current_quarter",
        //         "orderParameters": {
        //             "minOrderQty": "0.0001",
        //             "minOrderAmt": null,
        //             "maxOrderNum": "200",
        //             "maxBaseNum": null,
        //             "maxComboleg": "0",
        //             "maxTriggerOrderNum": "30",
        //             "maxTpslOrderNum": "30",
        //             "maxLmtOrderAmt": null,
        //             "maxMktOrderAmt": null,
        //             "maxLmtOrderQty": "500",
        //             "maxMktOrderQty": "1",
        //             "basisLimitRatio": null,
        //             "minRfqQty": null,
        //             "minComboQty": null
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": "0.05",
        //             "minLmtPriceDown": "0.05",
        //             "maxMktPriceUp": "0.05",
        //             "minMktPriceDown": "0.05"
        //         },
        //         "positionParameters": {
        //             "positionRatioThreshold": "-1",
        //             "positionMaxRatio": "0.1",
        //             "positionCidMaxRatio": "0.3",
        //             "defaultLeverRatio": "5",
        //             "maxShortQty": null
        //         },
        //         "group": [
        //             "0.1",
        //             "1",
        //             "10",
        //             "100"
        //         ]
        //     }
        //
        // options
        //
        //     {
        //         "businessType": "options",
        //         "symbol": "BTC-USDT-27SEP26-96000-C",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "1",
        //         "optType": "call",
        //         "strikePrice": "96000",
        //         "tickSize": "5",
        //         "status": "trading",
        //         "deliveryTime": "1790496000000",
        //         "deliveryFeeRate": null,
        //         "pricePrecision": "0",
        //         "quantityPrecision": "2",
        //         "onlineTime": "1790151930208",
        //         "riskEngineRate": null,
        //         "maxLeverage": null,
        //         "contractType": null,
        //         "orderParameters": {
        //             "minOrderQty": "0.01",
        //             "minOrderAmt": null,
        //             "maxOrderNum": "8",
        //             "maxBaseNum": "4000",
        //             "maxComboleg": "20",
        //             "maxTriggerOrderNum": "8",
        //             "maxTpslOrderNum": "8",
        //             "maxLmtOrderAmt": null,
        //             "maxMktOrderAmt": null,
        //             "maxLmtOrderQty": null,
        //             "maxMktOrderQty": null,
        //             "basisLimitRatio": null,
        //             "minRfqQty": "0.01",
        //             "minComboQty": "0.01"
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": null,
        //             "minLmtPriceDown": null,
        //             "maxMktPriceUp": null,
        //             "minMktPriceDown": null
        //         },
        //         "positionParameters": {
        //             "positionRatioThreshold": null,
        //             "positionMaxRatio": null,
        //             "positionCidMaxRatio": null,
        //             "defaultLeverRatio": null,
        //             "maxShortQty": "1000"
        //         },
        //         "group": [
        //             "1"
        //         ]
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const businessType = this.safeString (market, 'businessType');
        const baseId = this.safeString (market, 'baseCurrency');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const spot = (businessType === 'spot');
        const swap = (businessType === 'linear_perpetual');
        const future = (businessType === 'linear_futures');
        const option = (businessType === 'options');
        const contract = !spot;
        // spot markets report a settleCurrency too, but a unified spot market has no settlement
        const settleId = (contract) ? this.safeString (market, 'settleCurrency') : undefined;
        const settle = this.safeCurrencyCode (settleId);
        const expiry = this.safeInteger (market, 'deliveryTime');
        const strikePrice = this.safeString (market, 'strikePrice');
        const maxLeverage = this.safeString (market, 'maxLeverage');
        const orderParameters = this.safeDict (market, 'orderParameters', {});
        let marketType = 'spot';
        let optionType: Str = undefined;
        let symbol = base + '/' + quote;
        if (contract) {
            symbol = symbol + ':' + settle;
            marketType = 'swap';
            if (expiry !== undefined) {
                symbol = symbol + '-' + this.yymmdd (expiry);
                marketType = 'future';
            }
            if (option) {
                marketType = 'option';
                optionType = this.safeString (market, 'optType');
                const letter = (optionType === 'call') ? 'C' : 'P';
                symbol = symbol + '-' + strikePrice + '-' + letter;
            }
        }
        // the regex transpiler mangles the first ternary of a return statement, and every one of
        // these reads better as a named value anyway, so they are all resolved before the literal
        const margin = (spot) ? (maxLeverage !== undefined) : undefined;
        // every instrument is quoted and settled in USDT, so there are no inverse contracts
        const linear = (contract) ? true : undefined;
        const inverse = (contract) ? false : undefined;
        // the venue quotes qty in the base currency on every contract market, so one contract is
        // one unit of base, ctVal is the nominal face value and not an order size multiplier,
        // verified live as fillAmount / fillQty == the base price across ctVal from 1e-4 to 1e6
        const contractSize = (contract) ? this.parseNumber ('1') : undefined;
        const strike = (option) ? this.parseNumber (strikePrice) : undefined;
        const fees = this.safeDict (this.fees, marketType, {});
        return this.safeMarketStructure ({
            'id': id,
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
            'future': future,
            'option': option,
            'active': (this.safeString (market, 'status') === 'trading'),
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': strike,
            'optionType': optionType,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityPrecision'))),
                'price': this.safeNumber (market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber (orderParameters, 'minOrderQty'),
                    'max': this.safeNumber (orderParameters, 'maxLmtOrderQty'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (orderParameters, 'minOrderAmt'),
                    'max': this.safeNumber (orderParameters, 'maxLmtOrderAmt'),
                },
            },
            'created': this.safeInteger (market, 'onlineTime'),
            'info': market,
        });
    }

    /**
     * @method
     * @name umx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.umx.com/docs/coin-apis/ticker/get-24-hour-ticker-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const marketType = market['type'];
        const businessType = this.safeString (businessTypes, marketType, marketType);
        // unlike fetchTickers, this endpoint answers for an option market once the symbol is given
        const request: Dict = {
            'businessType': businessType,
            'symbol': market['id'],
        };
        const response = await this.publicGetV1MarketTicker24hr (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "businessType": "spot",
        //                 "symbol": "ETH-USDT",
        //                 "priceChange": "-30.46",
        //                 "priceChangePercent": "-0.011",
        //                 "lastPrice": "2722.76",
        //                 "openPrice": "2753.22",
        //                 "highPrice": "2788.61",
        //                 "lowPrice": "2713.98",
        //                 "fillQty": "420.3057",
        //                 "fillAmount": "1155317.195959",
        //                 "count": "18853",
        //                 "baseCurrency": "ETH",
        //                 "indexPrice": "2722.73",
        //                 "markPrice": "0",
        //                 "fundingRate": "0",
        //                 "toNextFundRateTime": "0",
        //                 "markIv": null,
        //                 "underlyingPrice": null,
        //                 "delta": "0",
        //                 "gamma": "0",
        //                 "vega": "0",
        //                 "theta": "0"
        //             }
        //         ],
        //         "ts": "1790167770773"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // a listed market that has never traded answers with code 0 and an empty data array,
        // the parsed ticker then carries the symbol and the timestamp with empty values
        const first = this.safeDict (data, 0, {});
        const timestamp = this.safeInteger (response, 'ts');
        return this.parseTicker (this.extend (first, {
            'ts': timestamp,
        }), market);
    }

    /**
     * @method
     * @name umx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.umx.com/docs/coin-apis/ticker/get-24-hour-ticker-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all markets of one instrument type are returned if not given
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] the instrument type to query, one of 'spot', 'swap' or 'future', defaults to options['defaultType'], option markets are not supported
     * @param {string} [params.baseCurrency] *spot only* base currency id
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        let market: Market = undefined;
        if (symbols !== undefined) {
            market = this.getMarketFromSymbols (symbols);
        }
        let marketType: Str = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        if (marketType === 'option') {
            // the endpoint serves option tickers for one base currency per call and silently
            // defaults to btc, so the whole option universe cannot be returned by a single request
            // even with a base currency specified, the endpoint does not return tickers for all
            // of that currency's option markets, e.g. 9 tickers against 840 listed eth options
            throw new NotSupported (this.id + ' fetchTickers() does not support option markets');
        }
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const businessType = this.safeString (businessTypes, marketType, marketType);
        const request: Dict = {
            'businessType': businessType,
        };
        const response = await this.publicGetV1MarketTicker24hr (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "businessType": "linear_perpetual",
        //                 "symbol": "ETH-USDT-PERP",
        //                 "priceChange": "-30.3",
        //                 "priceChangePercent": "-0.011",
        //                 "lastPrice": "2721.27",
        //                 "openPrice": "2751.57",
        //                 "highPrice": "2787.63",
        //                 "lowPrice": "2709.91",
        //                 "fillQty": "7004.355",
        //                 "fillAmount": "19267598.6709",
        //                 "count": "26317",
        //                 "baseCurrency": "ETH",
        //                 "indexPrice": "2722.74",
        //                 "markPrice": "2721.27",
        //                 "fundingRate": "-0.000024",
        //                 "toNextFundRateTime": "11429182",
        //                 "markIv": null,
        //                 "underlyingPrice": null,
        //                 "delta": "0",
        //                 "gamma": "0",
        //                 "vega": "0",
        //                 "theta": "0"
        //             }
        //         ],
        //         "ts": "1790167771743"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // the entries carry no timestamp of their own, only the envelope does
        const timestamp = this.safeInteger (response, 'ts');
        const rawTickers: List = [];
        for (let i = 0; i < data.length; i++) {
            rawTickers.push (this.extend (this.safeDict (data, i, {}), {
                'ts': timestamp,
            }));
        }
        return this.parseTickers (rawTickers, symbols);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'ts');
        const last = this.safeString (ticker, 'lastPrice');
        // priceChangePercent is a ratio, e.g. "-0.011" for -1.1%
        const percentage = Precise.stringMul (this.safeString (ticker, 'priceChangePercent'), '100');
        // the endpoint reports no order book top, and it zero fills markPrice on spot markets
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'fillQty'),
            'quoteVolume': this.safeString (ticker, 'fillAmount'),
            'indexPrice': this.omitZero (this.safeString (ticker, 'indexPrice')),
            'markPrice': this.omitZero (this.safeString (ticker, 'markPrice')),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name umx#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://www.umx.com/docs/coin-apis/ticker/get-current-funding-rate
     * @param {string[]} [symbols] unified market symbols, every perpetual market is returned if not given
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        // only perpetual markets are funded, the venue answers 40015 for any other instrument
        symbols = this.marketSymbols (symbols, 'swap', true, true);
        const request: Dict = {};
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                // a single symbol is narrowed by the venue instead of pulling every perpetual
                const market = this.getMarketFromSymbols (symbols);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.publicGetV1MarketFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT-PERP",
        //                 "fundingRate": "0.000021",
        //                 "fundingTime": "1790179200000",
        //                 "fundingInterval": "8",
        //                 "upperFundingRate": "0.003",
        //                 "lowerFundingRate": "-0.003"
        //             }
        //         ],
        //         "ts": "1790178080281"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // the entries carry no timestamp of their own, only the envelope does
        const timestamp = this.safeInteger (response, 'ts');
        const rates: List = [];
        for (let i = 0; i < data.length; i++) {
            rates.push (this.extend (this.safeDict (data, i, {}), {
                'ts': timestamp,
            }));
        }
        return this.parseFundingRates (rates, symbols);
    }

    /**
     * @method
     * @name umx#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.umx.com/docs/coin-apis/ticker/get-current-funding-rate
     * @param {string} symbol unified market symbol, the venue only funds perpetual markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['swap'] !== true) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap markets only');
        }
        const rates = await this.fetchFundingRates ([ symbol ], params);
        return this.safeDict (rates, market['symbol']) as FundingRate;
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (contract, 'ts');
        // fundingInterval is reported in hours, and fundingRate is the rate of the upcoming funding
        const fundingInterval = this.safeString (contract, 'fundingInterval');
        let interval: Str = undefined;
        if (fundingInterval !== undefined) {
            interval = fundingInterval + 'h';
        }
        const fundingTimestamp = this.safeInteger (contract, 'fundingTime');
        // the endpoint carries no mark or index price, those live on the ticker endpoint
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    /**
     * @method
     * @name umx#fetchFundingRateHistory
     * @description fetches the history of funding rates paid on a perpetual market
     * @see https://www.umx.com/docs/coin-apis/ticker/get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for, the venue only funds perpetual markets
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch, the venue only accepts a bound inside the latest three months and reaches no further back than that, omit it to walk back over the whole history instead
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 1000 and publishes no upper bound
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch, the venue answers an empty list when it predates the three month bound
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['swap'] !== true) {
            throw new BadSymbol (this.id + ' fetchFundingRateHistory() supports swap markets only');
        }
        let request: Dict = {
            'symbol': market['id'],
        };
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            // without a lower bound the venue walks backwards from endTime over the whole history,
            // so limit is the number of entries of that walk and can be forwarded as it is
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // beginTime on its own is answered with error 10002, it only works paired with endTime
            const until = this.safeInteger (request, 'endTime');
            if (until === undefined) {
                request['endTime'] = this.milliseconds ();
            }
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead. the
            // venue default of 1000 entries covers the widest range it serves even on the four
            // hour funding interval, which is 552 entries over three months
        }
        const response = await this.publicGetV1MarketFundingRateHistory (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT-PERP",
        //                 "fundingRate": "0.000025812524441762",
        //                 "fundingTime": "1790179200000",
        //                 "markPrice": "2654.45"
        //             }
        //         ],
        //         "ts": "1790181415054"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRateHistories (data, market, since, limit) as FundingRateHistory[];
    }

    override parseFundingRateHistory (info: any, market: Market = undefined): FundingRateHistory {
        const marketId = this.safeString (info, 'symbol');
        // fundingTime is the moment the funding fee was charged, the entries carry no other time
        const timestamp = this.safeInteger (info, 'fundingTime');
        // the funding rate structure has no home for markPrice, it stays on info
        return {
            'info': info,
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'fundingRate': this.safeNumber (info, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        } as FundingRateHistory;
    }

    /**
     * @method
     * @name umx#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://www.umx.com/docs/coin-apis/ticker/get-delivery-and-exercise-history
     * @param {string} symbol unified symbol of an option or delivery future, it selects the instrument family whose settlements are returned, the settled instruments themselves are delisted and carry no unified symbol
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch, the venue only accepts a bound inside the latest three months and reaches no further back than that
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 1000 and publishes no upper bound
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest settlement to fetch, the venue answers an empty list when it predates the three month bound
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    async fetchSettlementHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Dict[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchSettlementHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType: Str = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchSettlementHistory', market, params);
        if ((marketType !== 'future') && (marketType !== 'option')) {
            throw new NotSupported (this.id + ' fetchSettlementHistory() supports future and option markets only');
        }
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const businessType = this.safeString (businessTypes, marketType, marketType);
        // the endpoint is scoped to an instrument family, a single instrument can be requested on
        // top of that but is never useful, the venue delists an instrument as soon as it settles
        // and a listed one has no settlement yet, so the symbol argument only selects the family
        const symbolFamily = this.safeString (market['info'], 'symbolFamily');
        let request: Dict = {
            'businessType': businessType,
            'symbolFamily': symbolFamily,
        };
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead. a
            // range that settles more instruments than the venue default of 1000 entries is still
            // answered with its newest 1000, which is as far back as one call can reach
        }
        const response = await this.publicGetV1MarketDeliveryExerciseHistory (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT-23SEP26-4100-C",
        //                 "type": "delivery",
        //                 "price": "2963.51",
        //                 "time": "1790150400000"
        //             }
        //         ],
        //         "ts": "1790183386955"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const settlements = this.parseSettlements (data);
        const sorted = this.sortBy (settlements, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit);
    }

    parseSettlement (settlement: Dict): Dict {
        const marketId = this.safeString (settlement, 'symbol');
        const timestamp = this.safeInteger (settlement, 'time');
        // the settled instrument is delisted at once, so safeSymbol () would answer either the
        // requested market, labelling the whole family with one symbol, or the bare exchange id.
        // the id carries every part the unified symbol needs, so it is rebuilt from it instead
        let symbol: Str = undefined;
        if (marketId !== undefined) {
            const market = this.createExpiredOptionMarket (marketId);
            symbol = market['symbol'];
        }
        return {
            'info': settlement,
            'symbol': symbol,
            'price': this.safeNumber (settlement, 'price'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    parseSettlements (settlements: any[]): List {
        const result: List = [];
        for (let i = 0; i < settlements.length; i++) {
            result.push (this.parseSettlement (settlements[i]));
        }
        return result;
    }

    override createExpiredOptionMarket (symbol: string): MarketInterface {
        // the venue delists an instrument as soon as it settles, so a settled instrument is in no
        // markets map and its unified symbol has to be rebuilt from the parts its id already
        // carries. dated futures settle through the same feed as options, so both shapes are
        // handled here, told apart by the strike and side segments the option ids add. the base
        // market () hands this method a unified symbol, parseSettlement () a market id
        const parts = symbol.split ('-');
        // the check has to read "found" and not "not found": php's strpos answers false rather
        // than -1 for a missing needle, so a transpiled "=== -1" is never true there
        const isUnifiedSymbol = (symbol.indexOf ('/') > -1);
        let baseId: Str = undefined;
        let quoteId: Str = undefined;
        let expiry: Str = undefined;
        let strikePrice: Str = undefined;
        let optionSide: Str = undefined;
        if (isUnifiedSymbol) {
            // ETH/USDT:USDT-260923-4100-C and ETH/USDT:USDT-260626, the expiry is already yymmdd
            const currencyPart = parts[0];
            const settled = currencyPart.split (':');
            const pair = settled[0];
            const pairParts = pair.split ('/');
            baseId = this.safeString (pairParts, 0);
            quoteId = this.safeString (pairParts, 1);
            expiry = this.safeString (parts, 1);
            strikePrice = this.safeString (parts, 2);
            optionSide = this.safeString (parts, 3);
        } else {
            // ETH-USDT-23SEP26-4100-C and ETH-USDT-26JUN26, the expiry is spelled ddMMMyy
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
            expiry = this.convertMarketIdExpireDate (this.safeString (parts, 2));
            strikePrice = this.safeString (parts, 3);
            optionSide = this.safeString (parts, 4);
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        // every instrument is quoted and settled in USDT, which parseMarket relies on as well
        const settle = quote;
        const option = (optionSide !== undefined);
        const marketIdDate = this.convertExpireDateToMarketIdDate (expiry);
        const datetime = this.convertExpireDate (expiry);
        const timestamp = this.parse8601 (datetime);
        let marketId = baseId + '-' + quoteId + '-' + marketIdDate;
        let unifiedSymbol = base + '/' + quote + ':' + settle + '-' + expiry;
        if (option) {
            marketId = marketId + '-' + strikePrice + '-' + optionSide;
            unifiedSymbol = unifiedSymbol + '-' + strikePrice + '-' + optionSide;
        }
        // the regex transpiler mangles the first ternary of a return statement, so every value the
        // literal below needs is resolved into a named one first, the same way parseMarket does it
        const marketType = (option) ? 'option' : 'future';
        let optionType: Str = undefined;
        if (option) {
            optionType = (optionSide === 'C') ? 'call' : 'put';
        }
        const strike = (option) ? this.parseNumber (strikePrice) : undefined;
        return {
            'id': marketId,
            'symbol': unifiedSymbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'active': false,
            'type': marketType,
            'linear': true,
            'inverse': false,
            'spot': false,
            'swap': false,
            'future': !option,
            'option': option,
            'margin': false,
            'contract': true,
            'contractSize': this.parseNumber ('1'),
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': optionType,
            'strike': strike,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
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
            'info': undefined,
        } as MarketInterface;
    }

    /**
     * @method
     * @name umx#fetchCrossBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://www.umx.com/docs/coin-apis/ticker/get-margin-interest-rates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currency] the exchange currency id to narrow the answer to a single currency, every spot margin currency is returned without it
     * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} indexed by the currency code
     */
    override async fetchCrossBorrowRates (params: Dict = {}): Promise<CrossBorrowRates> {
        await this.loadMarkets ();
        const response = await this.publicGetV1PublicBaseRates (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "currency": "BTC",
        //                 "borrowed": "0.246318718203698832",
        //                 "remainingQuota": "496.433781266085056973",
        //                 "rate": "0.015"
        //             }
        //         ],
        //         "ts": "1790184977577"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // the entries carry no timestamp of their own, only the envelope does
        const timestamp = this.safeInteger (response, 'ts');
        const rates: CrossBorrowRates = {};
        for (let i = 0; i < data.length; i++) {
            const entry = this.extend (this.safeDict (data, i, {}), {
                'ts': timestamp,
            });
            const rate = this.parseBorrowRate (entry) as CrossBorrowRate;
            const code = this.safeString (rate, 'currency');
            if (code !== undefined) {
                rates[code] = rate;
            }
        }
        return rates;
    }

    override parseBorrowRate (info: any, currency: Currency = undefined): Dict {
        const currencyId = this.safeString (info, 'currency');
        const timestamp = this.safeInteger (info, 'ts');
        // the venue publishes an annualised rate, which is what period describes. the borrowed
        // amount and the remaining quota the entry carries have no home in the structure
        return {
            'info': info,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': this.safeNumber (info, 'rate'),
            'period': 31536000000, // 365 days in milliseconds
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name umx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.umx.com/docs/coin-apis/ticker/get-kline-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents, default is '1m'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, the venue rejects more than 1000 and covers at most a 30 day range per call
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true fetches the candles in multiple calls
     * @param {string} [params.price] "mark" or "index" to fetch the mark price or index price candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const duration = this.parseTimeframe (timeframe) * 1000;
        // the venue rejects a range wider than 30 days with error 40004, which caps how many
        // candles one call can cover on the larger timeframes, 720 on 1h and 30 on 1d
        const maxSpan = 2592000000;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            let maxEntriesPerRequest = this.parseToInt (maxSpan / duration);
            if (maxEntriesPerRequest > 1000) {
                maxEntriesPerRequest = 1000;
            }
            if (maxEntriesPerRequest < 1) {
                maxEntriesPerRequest = 1;
            }
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxEntriesPerRequest) as OHLCV[];
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const period = this.safeString (this.timeframes, timeframe, timeframe);
        let price: Str = undefined;
        [ price, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'price');
        const isMark = (price === 'mark');
        const isIndex = (price === 'index');
        let request: Dict = {
            'period': period,
        };
        if (isIndex) {
            // the index series is keyed by the spot underlying of the contract, not by the market id
            request['symbolFamily'] = this.safeString (market['info'], 'symbolFamily');
        } else {
            request['symbol'] = marketId;
        }
        if (isMark && (market['contract'] !== true)) {
            // a spot symbol is accepted but answered with an empty series
            throw new BadSymbol (this.id + ' fetchOHLCV() can only fetch mark price candles for contract markets');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
            // limit keeps the newest entries inside the requested range, so a range wider than
            // limit answers with the tail of it instead of the candles that follow since. the end
            // is therefore always narrowed to the window that since and limit describe, and an
            // explicit until only applies while it is the closer of the two. this is also what
            // makes the deterministic pagination walk forward instead of repeating the same tail
            const count = (limit !== undefined) ? limit : 1000;
            let span = count * duration;
            if (span > maxSpan) {
                span = maxSpan;
            }
            const derivedEnd = this.sum (since, span);
            const until = this.safeInteger (request, 'endTime');
            if ((until === undefined) || (derivedEnd < until)) {
                request['endTime'] = derivedEnd;
            }
        }
        let response = undefined;
        if (isMark) {
            response = await this.publicGetV1MarketMarkPriceKline (this.extend (request, params));
        } else if (isIndex) {
            response = await this.publicGetV1MarketIndexPriceKline (this.extend (request, params));
        } else {
            response = await this.publicGetV1MarketKline (this.extend (request, params));
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             [
        //                 "1h",              // period
        //                 "1790172000000",   // start time
        //                 "1790173355584",   // close time
        //                 "2716.11",         // open
        //                 "2648.77",         // close
        //                 "2723.28",         // high
        //                 "2648.31",         // low
        //                 "83.3433",         // filled quantity
        //                 "223581.366604",   // filled amount
        //                 "585",             // trade count
        //                 "-67.34",          // price change
        //                 "-0.0247"          // price change ratio
        //             ]
        //         ],
        //         "ts": "1790173358552"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        // the row is ordered open, close, high, low, which is not the usual ohlc layout
        return [
            this.safeInteger (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 5),
            this.safeNumber (ohlcv, 6),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 7),
        ];
    }

    /**
     * @method
     * @name umx#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://www.umx.com/docs/coin-apis/ticker/get-recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] the endpoint has no time filter, the parameter only drops the older entries of the returned page
     * @param {int} [limit] the maximum amount of trades to fetch, the venue caps it at 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request: Dict = {
            'symbol': marketId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketTrade (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "id": "1962406371",
        //                 "symbol": "ETH-USDT",
        //                 "side": "buy",
        //                 "price": "2715.42",
        //                 "qty": "0.0035",
        //                 "time": "1790171929955",
        //                 "indexPrice": "2715.55",
        //                 "markPrice": "0",
        //                 "iv": null,
        //                 "markIv": null
        //             }
        //         ],
        //         "ts": "1790171930123"
        //     }
        //
        // the venue returns the newest trades first and honours no start or end time,
        // so since only filters the returned page, it cannot reach further back
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // the public rows carry id, side, price, qty and time. a private fetchMyTrades row is a
        // live capture below, with the account ids masked. the venue signs its fee the other way
        // around, a positive fee is a rebate
        //
        //     {
        //         "accountName": "1000000000000000000",
        //         "id": "3538114212218466306",
        //         "orderId": "3538114212218449920",
        //         "clientOrderId": "3538114212218449920",
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "pnl": "-0.00158",
        //         "orderType": "market",
        //         "side": "sell",
        //         "fillPrice": "2691.34",
        //         "tradeId": "3538114212218466306",
        //         "role": "taker",
        //         "fillQty": "0.001",
        //         "fillTime": "1790236963181",
        //         "lever": "10",
        //         "feeCurrency": "USDT",
        //         "fee": "-0.00134567",
        //         "eventId": "1",
        //         "quoteId": "",
        //         "quoteSetId": "",
        //         "indexPrice": "0",
        //         "markPrice": "0",
        //         "forwardPrice": "0",
        //         "markIv": "0",
        //         "riskReducing": false,
        //         "iv": "0",
        //         "matchId": "12513217912",
        //         "tag": "",
        //         "execType": "trade",
        //         "cid": "100000000000002",
        //         "pid": "1000000000000000000",
        //         "uid": "100000000000001"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (trade, 'time', 'fillTime');
        let fee = undefined;
        const feeString = this.safeString (trade, 'fee');
        if ((feeString !== undefined) && (!Precise.stringEq (feeString, '0'))) {
            fee = {
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
                'cost': Precise.stringNeg (feeString),
            };
        }
        // qty is denominated in the base currency on every instrument type
        return this.safeTrade ({
            'id': this.safeString2 (trade, 'tradeId', 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'orderId'),
            'type': this.safeString (trade, 'orderType'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'role'),
            'price': this.safeString2 (trade, 'price', 'fillPrice'),
            'amount': this.safeString2 (trade, 'qty', 'fillQty'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name umx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.umx.com/docs/coin-apis/ticker/get-order-book-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'], // businessType is accepted but not needed, every market id is unique across the venue
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketDepth (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": {
        //             "bids": [ [ "85496.65", "1.2485" ], [ "85490.24", "0.60673" ] ],
        //             "asks": [ [ "85496.66", "14.99583" ], [ "85500.08", "1.88534" ] ],
        //             "lastUpdateId": "2995940926"
        //         },
        //         "ts": "1790166895485"
        //     }
        //
        // the docs cap limit at 100, the endpoint actually returns every level it has
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (response, 'ts');
        const orderbook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks');
        orderbook['nonce'] = this.safeInteger (data, 'lastUpdateId');
        return orderbook;
    }

    /**
     * @method
     * @name umx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.umx.com/docs/coin-apis/funding-account/get-currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        // this endpoint requires authentication, while fetchCurrencies is a public method by design,
        // therefore we check the keys here and return an empty result when they are missing
        if (!this.checkRequiredCredentials (false)) {
            return {};
        }
        const response = await this.privateGetV2AssetCurrencies (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "accountName": "...",
        //                 "pid": "...",
        //                 "uid": "...",
        //                 "cid": "...",
        //                 "currency": "USDT",
        //                 "currencyType": "crypto",
        //                 "name": "Tether",
        //                 "icon": "https://static.xcoin.com/COIN/USDT.png",
        //                 "depositAuth": true,
        //                 "withdrawAuth": true,
        //                 "currencyPrecision": "6",
        //                 "transfer": {
        //                     "fundToTradeAuth": true,
        //                     "fundToSecuritiesAuth": false,
        //                     "securitiesToFundAuth": false,
        //                     "securitiesToTradeAuth": false,
        //                     "tradeToFundAuth": true,
        //                     "tradeToSecuritiesAuth": false
        //                 }
        //             }
        //         ],
        //         "ts": "1790164067624"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseCurrencies (data);
    }

    override parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'currency');
        // the venue reports "crypto", "fiat" and "ST" (tokenized stock), the latter has no unified name
        let currencyType = this.safeString (rawCurrency, 'currencyType');
        if (currencyType === 'ST') {
            currencyType = 'other';
        }
        return this.safeCurrencyStructure ({
            'id': id,
            'code': this.safeCurrencyCode (id),
            'name': this.safeString (rawCurrency, 'name'),
            'type': currencyType,
            // the endpoint has no trading status field, only deposit and withdrawal permissions
            'active': undefined,
            'deposit': this.safeBool (rawCurrency, 'depositAuth'),
            'withdraw': this.safeBool (rawCurrency, 'withdrawAuth'),
            'fee': undefined,
            'precision': this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'currencyPrecision'))),
            // per network data lives in /v2/asset/chains, which only accepts one currency per call
            'networks': {},
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
     * @name umx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.umx.com/docs/coin-apis/trading-account-information/asset-information/get-trading-account-balance
     * @see https://www.umx.com/docs/coin-apis/funding-account/get-funding-account-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] "funding" queries the funding account, any other value queries the trading account, which the venue shares across spot, margin and derivatives
     * @param {string} [params.currencyList] comma separated exchange currency ids to narrow the trading account answer, e.g. "BTC,USDT"
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let marketType: Str = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let response = undefined;
        if (marketType === 'funding') {
            response = await this.privateGetV1AssetBalances (params);
            //
            //     {
            //         "code": "0",
            //         "data": [
            //             {
            //                 "accountName": "1234567890123456789",
            //                 "pid": "1234567890123456789",
            //                 "uid": "123456789012345",
            //                 "cid": "123456789012345",
            //                 "currency": "USDT",
            //                 "accountType": "funding",
            //                 "balance": "70",
            //                 "freeze": "0",
            //                 "equity": "70",
            //                 "withdrawAble": "70"
            //             }
            //         ],
            //         "msg": "Success",
            //         "ts": "1790194851224",
            //         "traceId": "c6632b1e50da939c41e6011054a7258c"
            //     }
            //
        } else {
            response = await this.privateGetV1AccountBalance (params);
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "accountName": "1234567890123456789",
            //             "totalEquity": "30",
            //             "totalMarginBalance": "30",
            //             "totalAvailableBalance": "30",
            //             "totalEffectiveMargin": "30",
            //             "totalPositionValue": "0",
            //             "totalIm": "0",
            //             "totalMm": "0",
            //             "totalOpenLoss": "0",
            //             "mmr": "0",
            //             "imr": "0",
            //             "accountLeverage": "0",
            //             "contractUpl": "0",
            //             "flexibleEquity": "0",
            //             "flexiblePnl": "0",
            //             "autoSubscribe": false,
            //             "flexibleCurrency": null,
            //             "details": [
            //                 {
            //                     "currency": "USDT",
            //                     "equity": "30",
            //                     "totalBalance": "30",
            //                     "cashBalance": "30",
            //                     "savingBalance": "0",
            //                     "leftPersonalQuota": null,
            //                     "savingTotalPnl": null,
            //                     "savingLastPnl": null,
            //                     "savingHoldDays": null,
            //                     "savingTotalAPR": "0.023205470000000000",
            //                     "savingLastAPR": null,
            //                     "borrow": "0",
            //                     "frozen": "0",
            //                     "realLiability": "0",
            //                     "potentialLiability": "0",
            //                     "accruedInterest": "0",
            //                     "upl": "0",
            //                     "optionUpl": "0",
            //                     "positionInitialMargin": null,
            //                     "orderInitialMargin": null,
            //                     "liabilityInitialMargin": "0",
            //                     "initialMargin": "0",
            //                     "intLiability": "0",
            //                     "fixedBalance": "0"
            //                 }
            //             ],
            //             "cid": "123456789012345",
            //             "pid": "1234567890123456789",
            //             "uid": "123456789012345"
            //         },
            //         "ts": "1790195068770"
            //     }
            //
        }
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        const timestamp = this.safeInteger (response, 'ts');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        // the funding account answers a list of rows, the trading account a single object whose
        // details member carries the per currency rows, with different field names in each
        const fundingRows = this.safeList (response, 'data');
        if (fundingRows !== undefined) {
            for (let i = 0; i < fundingRows.length; i++) {
                const entry = this.safeDict (fundingRows, i, {});
                const currencyId = this.safeString (entry, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                if (code !== undefined) {
                    const account = this.account ();
                    account['free'] = this.safeString (entry, 'balance');
                    account['used'] = this.safeString (entry, 'freeze');
                    account['total'] = this.safeString (entry, 'equity');
                    result[code] = account;
                }
            }
        } else {
            const data = this.safeDict (response, 'data', {});
            const details = this.safeList (data, 'details', []);
            for (let i = 0; i < details.length; i++) {
                const entry = this.safeDict (details, i, {});
                const currencyId = this.safeString (entry, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                if (code !== undefined) {
                    const account = this.account ();
                    // the entry carries no available amount of its own. the margins a position, an
                    // open order and a liability hold are counted as used and the rest of the equity
                    // is derived as free, matching totalAvailableBalance on the account level.
                    // initialMargin already includes the position and the liability legs, the venue
                    // sends the unused margin fields as null, which the zero defaults paper over
                    let used: Str = this.safeString (entry, 'frozen', '0');
                    used = Precise.stringAdd (used, this.safeString (entry, 'initialMargin', '0'));
                    used = Precise.stringAdd (used, this.safeString (entry, 'orderInitialMargin', '0'));
                    account['used'] = used;
                    account['total'] = this.safeString (entry, 'equity');
                    account['debt'] = this.safeString (entry, 'realLiability');
                    result[code] = account;
                }
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name umx#transfer
     * @description transfer currency internally between the accounts of the same user
     * @see https://www.umx.com/docs/coin-apis/funding-account/transfer/internal-transfer-application
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from, "funding" or "trading", every market type maps onto the shared trading account
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientTransferId] a client supplied id for the transfer
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    override async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const amountString = this.currencyToPrecision (code, amount);
        const request: Dict = {
            'currency': currency['id'],
            'amount': amountString,
            'fromAccountType': fromId,
            'toAccountType': toId,
        };
        const response = await this.privatePostV1AssetTransfer (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "data": true,
        //         "msg": "Success",
        //         "ts": "1790195059978",
        //         "traceId": "20756a85d29b38fdd2565cb9ae3493db"
        //     }
        //
        // the answer carries no transfer id and echoes nothing back, the venue only assigns ids
        // in the transfer history, so everything but the status is filled from the request
        const transferEntry = this.parseTransfer (response, currency);
        transferEntry['amount'] = this.parseNumber (amountString);
        transferEntry['fromAccount'] = fromAccount;
        transferEntry['toAccount'] = toAccount;
        return transferEntry;
    }

    override parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transfer
        //     {
        //         "code": "0",
        //         "data": true,
        //         "msg": "Success",
        //         "ts": "1790195059978",
        //         "traceId": "20756a85d29b38fdd2565cb9ae3493db"
        //     }
        //
        // fetchTransfers
        //     {
        //         "id": "2008158167452857783",
        //         "clientTransferId": "2008158167452857783",
        //         "accountName": "1000000000000000000",
        //         "fromAccountType": "funding",
        //         "toAccountType": "trading",
        //         "amount": "30.000000",
        //         "currency": "USDT",
        //         "status": "success",
        //         "createTime": "1790195059877",
        //         "pid": "1000000000000000000",
        //         "uid": "100000000000001",
        //         "cid": "100000000000002",
        //         "source": "api",
        //         "multiplier": "1.000000000000000000",
        //         "stockAmount": "0.000"
        //     }
        //
        const rawStatus = this.safeString (transfer, 'status');
        let status = this.parseTransferStatus (rawStatus);
        if (status === undefined) {
            const msg = this.safeStringLower (transfer, 'msg');
            status = (msg === 'success') ? 'ok' : 'failed'; // response from transfer() endpoint
        }
        const timestamp = this.safeInteger2 (transfer, 'createTime', 'ts'); // ts - response timestamp from the transfer endpoint
        const currencyId = this.safeString (transfer, 'currency');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.safeString (transfer, 'fromAccountType'),
            'toAccount': this.safeString (transfer, 'toAccountType'),
            'status': status,
        } as TransferEntry;
    }

    /**
     * @method
     * @name umx#fetchTransfers
     * @description fetch the history of internal transfers between the accounts of the same user
     * @see https://www.umx.com/docs/coin-apis/funding-account/transfer/get-internal-transfer-history
     * @param {string} [code] unified currency code to narrow the answer to a single currency
     * @param {int} [since] timestamp in ms of the earliest transfer to fetch, the venue reaches back three months at most
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transfer to fetch
     * @param {boolean} [params.paginate] default false, when true fetches the transfers in multiple calls, walking backwards from the newest entry
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    override async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'paginate');
        if (paginate) {
            // the venue documents beginId and endId cursors on this endpoint, but endId is
            // ignored outright and beginId filters on values that do not match the id field, so
            // the pagination walks on endTime instead, backwards from the newest entry
            return await this.fetchPaginatedCallDynamic ('fetchTransfers', code, since, limit, params, 100) as TransferEntry[];
        }
        let currency: Currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead
        }
        const response = await this.privateGetV1AssetTransferHistory (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "id": "2008158167452857783",
        //                 "clientTransferId": "2008158167452857783",
        //                 "accountName": "1000000000000000000",
        //                 "fromAccountType": "funding",
        //                 "toAccountType": "trading",
        //                 "amount": "30.000000",
        //                 "currency": "USDT",
        //                 "status": "success",
        //                 "createTime": "1790195059877",
        //                 "pid": "1000000000000000000",
        //                 "uid": "100000000000001",
        //                 "cid": "100000000000002",
        //                 "source": "api",
        //                 "multiplier": "1.000000000000000000",
        //                 "stockAmount": "0.000"
        //             }
        //         ],
        //         "msg": "Success",
        //         "ts": "1790196179407",
        //         "traceId": "75af642acd5db64d40e8d33e17f92e43"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransfers (data, currency, since, limit);
    }

    parseTransferStatus (status: Str): Str {
        const statuses: Dict = {
            'success': 'ok',
            'pending': 'pending',
            'fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name umx#fetchDeposits
     * @description fetch all deposits made to an account, the venue keeps ninety days of history
     * @see https://www.umx.com/docs/coin-apis/funding-account/deposit/get-deposit-history
     * @param {string} [code] unified currency code to narrow the answer to a single currency
     * @param {int} [since] timestamp in ms of the earliest deposit to fetch
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest deposit to fetch
     * @param {string} [params.chainType] the exchange specific chain name to narrow the answer to a single chain, e.g. "eth"
     * @param {boolean} [params.paginate] default false, when true fetches the deposits in multiple calls, walking backwards from the newest entry
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'paginate');
        if (paginate) {
            // the documented beginId and endId cursors are broken venue side, see fetchTransfers
            return await this.fetchPaginatedCallDynamic ('fetchDeposits', code, since, limit, params, 100) as Transaction[];
        }
        let currency: Currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead
        }
        const response = await this.privateGetV1AssetDepositRecord (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accountName": "1000000000000000000",
        //                 "pid": "1000000000000000000",
        //                 "uid": "100000000000001",
        //                 "cid": "100000000000002",
        //                 "currency": "USDT",
        //                 "chainType": "eth",
        //                 "toAddress": "0x85af46a0b2d90a3d963f5384ffa6e07822caa5e6",
        //                 "memo": "",
        //                 "depositId": "2102362828770439168",
        //                 "amount": "70",
        //                 "status": "success",
        //                 "depositFee": "",
        //                 "fromAddress": "0x18e296053cbdf986196903e889b7dca7a73882f6",
        //                 "hash": "0x557620d7e8bd149da77d8521f70d4fb651b0d670a62af00902276596cc182160",
        //                 "createTime": "1790077333048",
        //                 "updateTime": "1790078080000"
        //             }
        //         ],
        //         "msg": "Success",
        //         "ts": "1790198097764",
        //         "traceId": "6da0afcf500a1c5b3693ae3fdc804a9c"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    /**
     * @method
     * @name umx#fetchWithdrawals
     * @description fetch all withdrawals made from an account, the venue keeps ninety days of history
     * @see https://www.umx.com/docs/coin-apis/funding-account/withdrawal/get-withdrawal-history
     * @param {string} [code] unified currency code to narrow the answer to a single currency
     * @param {int} [since] timestamp in ms of the earliest withdrawal to fetch
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest withdrawal to fetch
     * @param {string} [params.chainType] the exchange specific chain name to narrow the answer to a single chain, e.g. "eth"
     * @param {boolean} [params.paginate] default false, when true fetches the withdrawals in multiple calls, walking backwards from the newest entry
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            // the documented beginId and endId cursors are broken venue side, see fetchTransfers
            return await this.fetchPaginatedCallDynamic ('fetchWithdrawals', code, since, limit, params, 100) as Transaction[];
        }
        let currency: Currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead
        }
        const response = await this.privateGetV1AssetWithdrawalRecord (this.extend (request, params));
        //
        // the account has made no withdrawal yet, so the row below is the venue's own docs
        // sample, the live answer for an empty history is "data": []
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accountName": "1957689788565745664",
        //                 "address": "0xC7EBBBdc93293F61eF13053ED6B29F9247b9686c",
        //                 "amount": "881.111676696292134",
        //                 "chainType": "eth",
        //                 "cid": "175558458900900",
        //                 "createTime": "1755585008532",
        //                 "currency": "USDT",
        //                 "memo": "",
        //                 "pid": "1957689788565745664",
        //                 "status": "reviewing",
        //                 "uid": "175558458892100",
        //                 "txId": "0x35c******b360a174d"
        //             }
        //         ],
        //         "msg": "Success",
        //         "ts": "1790198100822"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits and fetchWithdrawals answer the rows the way the methods document them,
        // the deposit rows carry depositId, hash, toAddress and fromAddress, the withdrawal rows
        // carry withdrawalId, txId and address
        //
        const isDeposit = ('depositId' in transaction);
        const transactionType = (isDeposit) ? 'deposit' : 'withdrawal';
        // the withdraw acknowledgement carries the application time as timestamp instead
        const timestamp = this.safeInteger2 (transaction, 'createTime', 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const networkId = this.safeString (transaction, 'chainType');
        let tag = this.safeString (transaction, 'memo');
        if (tag === '') {
            tag = undefined;
        }
        const feeCost = this.safeNumber2 (transaction, 'depositFee', 'withdrawFee');
        let fee: Fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': code,
                'cost': feeCost,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'depositId', 'withdrawalId'),
            'txid': this.safeString2 (transaction, 'hash', 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId),
            'address': this.safeString2 (transaction, 'toAddress', 'address'),
            'addressTo': this.safeString2 (transaction, 'toAddress', 'address'),
            'addressFrom': this.safeString (transaction, 'fromAddress'),
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': transactionType,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.safeInteger (transaction, 'updateTime'),
            'internal': false,
            'comment': undefined,
            'fee': fee,
        } as Transaction;
    }

    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'pending': 'pending',
            'toBeVerified': 'pending',
            // a credited deposit is tradable already and only waits out the withdrawal unlock
            'credited': 'ok',
            'success': 'ok',
            'fail': 'failed',
            // a refunded deposit went back to the sender, so it never arrived
            'refunded': 'failed',
            'reviewing': 'pending',
            'verifying': 'pending',
            'approving': 'pending',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name umx#fetchDepositAddressesByNetwork
     * @description fetch the deposit addresses of a currency on every chain it deposits through
     * @see https://www.umx.com/docs/coin-apis/funding-account/deposit/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chainType] the exchange specific chain name to narrow the answer to a single chain, e.g. "trx"
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    override async fetchDepositAddressesByNetwork (code: string, params: Dict = {}): Promise<DepositAddresses> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const response = await this.privateGetV1AssetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accountName": "1000000000000000000",
        //                 "pid": "1000000000000000000",
        //                 "uid": "100000000000001",
        //                 "cid": "100000000000002",
        //                 "currency": "USDT",
        //                 "chainType": "eth",
        //                 "addressDeposit": "0x85af46a0b2d90a3d963f5384ffa6e07822caa5e6",
        //                 "memo": ""
        //             }
        //         ],
        //         "msg": "Success",
        //         "ts": "1790198097764",
        //         "traceId": "6da0afcf500a1c5b3693ae3fdc804a9c"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const parsed = this.parseDepositAddresses (data, [ currency['code'] ], false);
        return this.indexBy (parsed, 'network') as DepositAddresses;
    }

    override parseDepositAddress (depositAddress: any, currency: Currency = undefined): DepositAddress {
        const currencyId = this.safeString (depositAddress, 'currency');
        const address = this.safeString (depositAddress, 'addressDeposit');
        this.checkAddress (address);
        const networkId = this.safeString (depositAddress, 'chainType');
        let tag = this.safeString (depositAddress, 'memo');
        if (tag === '') {
            tag = undefined;
        }
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'network': this.networkIdToCode (networkId),
            'address': address,
            'tag': tag,
        } as DepositAddress;
    }

    /**
     * @method
     * @name umx#fetchPositions
     * @description fetch all open contract positions
     * @see https://www.umx.com/docs/coin-apis/trading-account-information/position-information/get-trading-account-positions
     * @param {string[]} [symbols] list of unified market symbols, the venue filter is applied when the list holds exactly one symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.businessType] the exchange instrument type to narrow the answer to, "linear_perpetual" or "linear_futures"
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.getMarketFromSymbols (symbols);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.privateGetV2TradePositions (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        // {
        //         "accountName": "1000000000000000000",
        //         "positionId": "3538140386621575168",
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "positionQty": "0.001",
        //         "avgPrice": "2638.1",
        //         "upl": "0.00068",
        //         "lever": "10",
        //         "liquidationPrice": "0",
        //         "markPrice": "2638.78",
        //         "im": "0.263878",
        //         "indexPrice": "2640",
        //         "createTime": "1790243203643",
        //         "updateTime": "1790243203643",
        //         "takeProfit": null,
        //         "stopLoss": null,
        //         "bePrice": "2640.739419709854927463",
        //         "delta": "0.001",
        //         "gamma": null,
        //         "theta": null,
        //         "vega": null,
        //         "pid": "1000000000000000000",
        //         "cid": "100000000000002",
        //         "uid": "100000000000001"
        // }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const qty = this.safeString (position, 'positionQty');
        let side: Str = undefined;
        let contracts = qty;
        if (qty !== undefined) {
            if (Precise.stringLt (qty, '0')) {
                side = 'short';
                contracts = Precise.stringNeg (qty);
            } else {
                side = 'long';
            }
        }
        const markPrice = this.safeString (position, 'markPrice');
        let notional: Str = undefined;
        if ((contracts !== undefined) && (markPrice !== undefined)) {
            notional = Precise.stringMul (contracts, markPrice);
        }
        const timestamp = this.safeInteger (position, 'createTime');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (position, 'updateTime'),
            'contracts': this.parseNumber (contracts),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'side': side,
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'lever'),
            'unrealizedPnl': this.safeNumber (position, 'upl'),
            'realizedPnl': undefined,
            'collateral': undefined,
            'entryPrice': this.safeNumber (position, 'avgPrice'),
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': undefined,
            'liquidationPrice': this.parseNumber (this.omitZero (this.safeString (position, 'liquidationPrice'))),
            'marginMode': undefined,
            'hedged': false,
            'maintenanceMargin': this.safeNumber (position, 'mm'),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeNumber (position, 'im'),
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
            'stopLossPrice': this.parseNumber (this.omitZero (this.safeString (position, 'stopLoss'))),
            'takeProfitPrice': this.parseNumber (this.omitZero (this.safeString (position, 'takeProfit'))),
        });
    }

    /**
     * @method
     * @name umx#fetchLeverage
     * @description fetch the leverage the account trades a contract market with
     * @see https://www.umx.com/docs/coin-apis/trading-account-information/position-information/get-current-leverage
     * @param {string} symbol unified symbol of a swap or future market, the venue rejects spot and option instruments, and keeps the spot margin leverage per currency instead, outside of this method
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    override async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isSwap = this.safeBool (market, 'swap', false);
        const isFuture = this.safeBool (market, 'future', false);
        if (!isSwap && !isFuture) {
            // the venue answers 50101 for spot and 50102 for options, this saves the round trip
            throw new NotSupported (this.id + ' fetchLeverage() supports swap and future markets only');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetV1TradeLever (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": {
        //             "accountName": "1000000000000000000",
        //             "symbol": "BTC-USDT-PERP",
        //             "currency": "",
        //             "lever": "10",
        //             "pid": "1000000000000000000",
        //             "cid": "100000000000002",
        //             "uid": "100000000000001"
        //         },
        //         "ts": "1790201234567"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    override parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        // the venue keeps one leverage per market, there are no separate long and short values
        const leverageValue = this.safeInteger (leverage, 'lever');
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': undefined,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        } as Leverage;
    }

    /**
     * @method
     * @name umx#setLeverage
     * @description set the leverage a contract market is traded with
     * @see https://www.umx.com/docs/coin-apis/trading-account-information/position-information/set-leverage
     * @param {int} leverage the rate of leverage, the venue caps it per market and rejects anything above with error 50105
     * @param {string} symbol unified symbol of a swap or future market, the venue rejects spot and option instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    override async setLeverage (leverage: int, symbol: Str = undefined, params: Dict = {}): Promise<Leverage> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isSwap = this.safeBool (market, 'swap', false);
        const isFuture = this.safeBool (market, 'future', false);
        if (!isSwap && !isFuture) {
            // the venue answers 50101 for spot and 50102 for options, this saves the round trip
            throw new NotSupported (this.id + ' setLeverage() supports swap and future markets only');
        }
        const leverageString = this.numberToString (leverage);
        const request: Dict = {
            'symbol': market['id'],
            'lever': leverageString,
        };
        const response = await this.privatePostV1TradeLever (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": {
        //             "accountName": "1000000000000000000",
        //             "symbol": "ETH-USDT-PERP",
        //             "currency": "",
        //             "lever": "5",
        //             "pid": "1000000000000000000",
        //             "cid": "100000000000002",
        //             "uid": "100000000000001"
        //         },
        //         "ts": "1790201234567"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    /**
     * @method
     * @name umx#setMarginMode
     * @description set the margin mode of the whole trading account, the venue keeps one mode per account rather than per market
     * @see https://www.umx.com/docs/coin-apis/trading-account-information/position-information/set-margin-mode
     * @param {string} marginMode "cross" for the cross currency margin mode or "portfolio" for the portfolio margin mode, the venue has no isolated margin at all
     * @param {string} [symbol] not used by umx.setMarginMode, the mode applies to the whole account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    override async setMarginMode (marginMode: string, symbol: Str = undefined, params: Dict = {}): Promise<Dict> {
        let accountMode: Str = undefined;
        if (marginMode === 'cross') {
            accountMode = 'multi_currency';
        } else if (marginMode === 'portfolio') {
            accountMode = 'portfolio';
        } else {
            throw new NotSupported (this.id + ' setMarginMode() marginMode must be either "cross" or "portfolio", the venue has no isolated margin');
        }
        const request: Dict = {
            'accountMode': accountMode,
        };
        const response = await this.privatePostV1AccountMarginModeSet (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": {
        //             "accountName": "1000000000000000000",
        //             "accountMode": "multi_currency"
        //         },
        //         "ts": "1790202048613"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name umx#fetchMarginMode
     * @description fetch the margin mode of the trading account, the venue keeps one mode per account rather than per market
     * @see https://www.umx.com/docs/coin-apis/funding-account/get-account-configuration-information
     * @param {string} symbol unified market symbol, it is only echoed into the answer, the mode applies to the whole account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure} whose marginMode is "cross" or "portfolio", the venue has no isolated margin
     */
    override async fetchMarginMode (symbol: string, params: Dict = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetV1AssetAccountInfo (params);
        //
        //     {
        //         "code": "0",
        //         "data": {
        //             "accountName": "1000000000000000000",
        //             "pid": "1000000000000000000",
        //             "uid": "100000000000001",
        //             "cid": "100000000000002",
        //             "accountStatus": "normal",
        //             "accountType": "main_account",
        //             "marginMode": "multi_currency",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "autoSubscribe": null,
        //             "depositCreditAccount": "funding",
        //             "createTime": "1790073492000"
        //         },
        //         "msg": "Success",
        //         "ts": "1790202048613",
        //         "traceId": "138193053799000a29b584872ad0d1ca"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const modes: Dict = {
            'multi_currency': 'cross',
        };
        const marginModeId = this.safeString (data, 'marginMode');
        // portfolio passes through the fallback unchanged, it is a unified value of its own
        const marginMode = this.safeString (modes, marginModeId, marginModeId);
        return {
            'info': data,
            'symbol': this.safeString (market, 'symbol'),
            'marginMode': marginMode,
        } as MarginMode;
    }

    /**
     * @method
     * @name umx#createOrderRequest
     * @ignore
     * @description build the request body of createOrder, choosing between the regular and the trigger endpoint shapes
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type "market" or "limit"
     * @param {string} side "buy" or "sell"
     * @param {float} amount how much of the base currency to trade
     * @param {float} [price] the price the order fills at, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the request body, carrying complexType when it belongs on the trigger endpoint
     */
    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        // a standalone protective order cannot be expressed on this venue: the trigger endpoint
        // has no reduceOnly, so such an order could grow the position instead of only closing it
        const protectivePrice = this.safeString2 (params, 'stopLossPrice', 'takeProfitPrice');
        if (protectivePrice !== undefined) {
            throw new NotSupported (this.id + ' createOrder() does not support standalone stopLossPrice or takeProfitPrice orders, attach the protection to an order with params.takeProfit and params.stopLoss instead');
        }
        const isMarket = (type === 'market');
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarket, false, params);
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        const takeProfitObject = this.safeDict (params, 'takeProfit');
        const stopLossObject = this.safeDict (params, 'stopLoss');
        const clientOrderId = this.safeString (params, 'clientOrderId');
        let cost: Str = undefined;
        [ cost, params ] = this.handleOptionAndParams (params, 'createOrder', 'cost');
        params = this.omit (params, [ 'timeInForce', 'triggerPrice', 'stopPrice', 'takeProfit', 'stopLoss', 'clientOrderId' ]);
        const priceTypes: Dict = {
            'last': 'last_price',
            'mark': 'mark_price',
            'index': 'index_price',
        };
        // the attached take profit and stop loss go into the venue's own tpslOrder object, which
        // both endpoints accept next to the main order
        const tpslOrder: Dict = {};
        if (takeProfitObject !== undefined) {
            const tpTriggerPrice = this.safeString (takeProfitObject, 'triggerPrice');
            const tpPriceType = this.safeString2 (takeProfitObject, 'triggerPriceType', 'priceType', 'last');
            const tpLimitPrice = this.safeString (takeProfitObject, 'price');
            tpslOrder['takeProfit'] = this.priceToPrecision (symbol, tpTriggerPrice);
            tpslOrder['takeProfitType'] = this.safeString (priceTypes, tpPriceType, tpPriceType);
            if (tpLimitPrice !== undefined) {
                tpslOrder['tpOrderType'] = 'limit';
                tpslOrder['tpLimitPrice'] = this.priceToPrecision (symbol, tpLimitPrice);
            } else {
                tpslOrder['tpOrderType'] = 'market';
            }
        }
        if (stopLossObject !== undefined) {
            const slTriggerPrice = this.safeString (stopLossObject, 'triggerPrice');
            const slPriceType = this.safeString2 (stopLossObject, 'triggerPriceType', 'priceType', 'last');
            const slLimitPrice = this.safeString (stopLossObject, 'price');
            tpslOrder['stopLoss'] = this.priceToPrecision (symbol, slTriggerPrice);
            tpslOrder['stopLossType'] = this.safeString (priceTypes, slPriceType, slPriceType);
            if (slLimitPrice !== undefined) {
                tpslOrder['slOrderType'] = 'limit';
                tpslOrder['slLimitPrice'] = this.priceToPrecision (symbol, slLimitPrice);
            } else {
                tpslOrder['slOrderType'] = 'market';
            }
        }
        const tpslKeys = Object.keys (tpslOrder);
        const tpslKeysLength = tpslKeys.length;
        const request: Dict = {
            'symbol': market['id'],
            'side': side,
        };
        if (triggerPrice !== undefined) {
            // the trigger endpoint knows no post only, no time in force, no cost and no reduce only
            if ((postOnly) || (timeInForce !== undefined)) {
                throw new NotSupported (this.id + ' createOrder() does not support postOnly or timeInForce on trigger orders');
            }
            if (cost !== undefined) {
                throw new NotSupported (this.id + ' createOrder() does not support the cost parameter on trigger orders');
            }
            const reduceOnly = this.safeBool (params, 'reduceOnly', false);
            if (reduceOnly) {
                throw new NotSupported (this.id + ' createOrder() does not support reduceOnly on trigger orders, the venue has no such flag there');
            }
            let triggerDirection: Str = undefined;
            [ triggerDirection, params ] = this.handleOptionAndParams (params, 'createOrder', 'triggerDirection');
            const directions: Dict = {
                'above': 'rising',
                'ascending': 'rising',
                'up': 'rising',
                'rising': 'rising',
                'below': 'falling',
                'descending': 'falling',
                'down': 'falling',
                'falling': 'falling',
            };
            const direction = this.safeString (directions, triggerDirection);
            if (direction === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires params.triggerDirection, "above" or "below", for a trigger order');
            }
            let triggerPriceType: Str = undefined;
            [ triggerPriceType, params ] = this.handleOptionAndParams (params, 'createOrder', 'triggerPriceType', 'last');
            const triggerOrder: Dict = {
                'triggerDirection': direction,
                'triggerPriceType': this.safeString (priceTypes, triggerPriceType, triggerPriceType),
                'triggerPrice': this.priceToPrecision (symbol, triggerPrice),
                'triggerOrderType': type,
            };
            if (!isMarket) {
                if (price === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' trigger order');
                }
                triggerOrder['triggerOrderPrice'] = this.priceToPrecision (symbol, price);
            }
            request['complexType'] = 'trigger';
            request['qty'] = this.amountToPrecision (symbol, amount);
            request['triggerOrder'] = triggerOrder;
            if (clientOrderId !== undefined) {
                request['complexClOrdId'] = clientOrderId;
            }
        } else {
            if (postOnly) {
                request['orderType'] = 'post_only';
            } else {
                request['orderType'] = type;
            }
            if ((timeInForce !== undefined) && (timeInForce !== 'po')) {
                request['timeInForce'] = timeInForce;
            }
            if (!isMarket) {
                if (price === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
                }
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (cost !== undefined) {
                if (!isMarket) {
                    throw new NotSupported (this.id + ' createOrder() supports the cost parameter for market orders only');
                }
                // the venue trades quote denominated market orders natively
                request['qty'] = this.costToPrecision (symbol, cost);
                request['marketUnit'] = 'quoteCoin';
            } else {
                request['qty'] = this.amountToPrecision (symbol, amount);
            }
            const isSpot = this.safeBool (market, 'spot', false);
            if (isSpot) {
                // the venue defaults isLeverage to true, which borrows on a shortfall on a margin
                // enabled account, so the flag is inverted here and margin has to be asked for
                let marginMode: Str = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
                let isMargin = false;
                [ isMargin, params ] = this.handleOptionAndParams (params, 'createOrder', 'margin', false);
                request['isLeverage'] = (isMargin) || (marginMode !== undefined);
            }
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
        }
        if (tpslKeysLength > 0) {
            request['tpslOrder'] = tpslOrder;
        }
        return this.extend (request, params);
    }

    /**
     * @method
     * @name umx#createOrder
     * @description create a regular or a trigger trade order
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/place-order
     * @see https://www.umx.com/docs/coin-apis/trading/complex-order-trading/place-complex-orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type "market" or "limit"
     * @param {string} side "buy" or "sell"
     * @param {float} amount how much of the base currency to trade
     * @param {float} [price] the price the order fills at, in units of the quote currency, market orders leave it out
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.postOnly] true to place a post only order, regular orders only
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK" or "PO", regular orders only, the venue fills market orders as "IOC"
     * @param {boolean} [params.reduceOnly] true to reduce a contract position only, regular orders only
     * @param {string} [params.clientOrderId] a client supplied order id, 1 to 32 letters and digits
     * @param {float} [params.cost] the quote currency quantity a market order trades, replaces amount, regular orders only
     * @param {boolean} [params.margin] true to place a leveraged spot margin order. the venue turns leverage on by default and borrows on a shortfall, so spot orders are sent unleveraged here unless this or params.marginMode asks otherwise
     * @param {string} [params.marginMode] "cross", the venue has no isolated margin, implies params.margin
     * @param {float} [params.triggerPrice] the price a trigger order activates at, sends the order to the trigger endpoint
     * @param {string} [params.triggerDirection] "above" or "below", required for a trigger order
     * @param {string} [params.triggerPriceType] "last", "mark" or "index", the price the trigger watches, default "last"
     * @param {object} [params.takeProfit] a take profit to attach, with triggerPrice, and optionally price for a limit execution and triggerPriceType
     * @param {object} [params.stopLoss] a stop loss to attach, with triggerPrice, and optionally price for a limit execution and triggerPriceType
     * @param {string} [params.stpMode] self trade prevention mode, "cancel_maker", "cancel_taker" or "cancel_both", the venue requires params.stpId with it
     * @param {string} [params.stpId] self trade prevention id, 6 to 8 letters and digits
     * @param {string} [params.tag] an order tag, 1 to 16 letters and digits
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const isTrigger = ('complexType' in request);
        let response = undefined;
        if (isTrigger) {
            response = await this.privatePostV2TradeOrderComplex (request);
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "accountName": "1000000000000000000",
            //             "complexOId": "1369970333708804096",
            //             "complexClOrdId": "66"
            //         },
            //         "ts": "1746667980576"
            //     }
            //
        } else {
            response = await this.privatePostV2TradeOrder (request);
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "orderId": "1322590062927904769",
            //             "tag": "",
            //             "clientOrderId": "Client1001"
            //         },
            //         "ts": "1732158178000"
            //     }
            //
        }
        const data = this.safeDict (response, 'data', {});
        const order = this.extend (data, {
            'ts': this.safeInteger (response, 'ts'),
        });
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name umx#createOrders
     * @description create a list of trade orders in one batch, regular orders only, the venue has no batch endpoint for the trigger family
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/place-batch-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params, at most 20 entries
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrders (orders: OrderRequest[], params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            const orderType = this.safeString (rawOrder, 'type');
            const orderSide = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest (symbol as string, orderType as OrderType, orderSide as OrderSide, amount, price, orderParams);
            if ('complexType' in orderRequest) {
                throw new NotSupported (this.id + ' createOrders() does not support trigger orders');
            }
            ordersRequests.push (orderRequest);
        }
        const request: Dict = {
            'orderReqList': ordersRequests,
        };
        const response = await this.privatePostV2TradeBatchOrder (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data);
    }

    /**
     * @method
     * @name umx#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and the cost in the quote currency
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createMarketBuyOrderWithCost (symbol: string, cost: number, params: Dict = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, this.extend (params, { 'cost': cost }));
    }

    /**
     * @method
     * @name umx#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and the cost in the quote currency
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createMarketSellOrderWithCost (symbol: string, cost: number, params: Dict = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', 'sell', cost, undefined, this.extend (params, { 'cost': cost }));
    }

    /**
     * @method
     * @name umx#createMarketOrderWithCost
     * @description create a market order by providing the symbol, the side and the cost in the quote currency
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side "buy" or "sell"
     * @param {float} cost how much to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createMarketOrderWithCost (symbol: string, side: OrderSide, cost: number, params: Dict = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', side, cost, undefined, this.extend (params, { 'cost': cost }));
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder and cancelOrder answer bare id acknowledgements, the fetch methods answer
        // full rows, and the trigger rows nest their prices inside a triggerOrder object. every
        // sample below is a live capture with the account ids masked
        //
        // createOrder
        //
        //     {
        //         "orderId": "3538113582066216960",
        //         "clientOrderId": "3538113582066216960",
        //         "tag": ""
        //     }
        //
        // createOrder, trigger
        //
        //     {
        //         "accountName": "1000000000000000000",
        //         "complexOId": "1552711983719727104",
        //         "complexClOrdId": "1552711983719727104",
        //         "tag": null
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "orderId": "3538113582066216960"
        //     }
        //
        // fetchOrder, fetchOpenOrders
        //
        //     {
        //         "accountName": "1000000000000000000",
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "orderId": "3538113582066216960",
        //         "clientOrderId": "3538113582066216960",
        //         "price": "1900",
        //         "qty": "0.001",
        //         "pnl": "",
        //         "orderType": "limit",
        //         "side": "buy",
        //         "totalFillQty": "",
        //         "avgPrice": "",
        //         "status": "new",
        //         "lever": "10",
        //         "baseFee": "",
        //         "quoteFee": "",
        //         "uid": "100000000000001",
        //         "source": "api",
        //         "cancelSource": null,
        //         "cancelUid": null,
        //         "createTime": "1790236812939",
        //         "updateTime": "1790236812940",
        //         "reduceOnly": false,
        //         "timeInForce": "gtc",
        //         "category": "normal",
        //         "massQuoteOrder": {
        //             "quoteId": "",
        //             "quote": false,
        //             "mmpGroup": "",
        //             "quoteSetId": "",
        //             "priceAdjustment": false
        //         },
        //         "eventId": "0",
        //         "parentOrderId": "",
        //         "tpslOrder": null,
        //         "orderFilter": "order",
        //         "riskReducing": false,
        //         "isLeverage": "",
        //         "tag": "",
        //         "stpId": "",
        //         "stpMode": "",
        //         "marketUnit": "baseCoin",
        //         "cid": "100000000000002",
        //         "pid": "1000000000000000000"
        //     }
        //
        // fetchOpenOrders, trigger
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "complexOId": "1552711983719727104",
        //         "complexClOrdId": "1552711983719727104",
        //         "side": "buy",
        //         "complexType": "trigger",
        //         "qty": "0.001",
        //         "triggerOrder": {
        //             "triggerClOrdId": "1552711983719727104",
        //             "triggerDirection": "rising",
        //             "triggerPriceType": "last_price",
        //             "triggerPrice": "3500.00",
        //             "triggerOrderType": "limit",
        //             "triggerOrderPrice": "3400.00"
        //         },
        //         "tpslOrder": null,
        //         "status": "live",
        //         "accountName": "1000000000000000000",
        //         "pid": "1000000000000000000",
        //         "uid": "100000000000001",
        //         "cid": "100000000000002",
        //         "createTime": "1790236984996",
        //         "updateTime": "1790236984996",
        //         "tag": null,
        //         "positionId": null,
        //         "parentOrderId": null
        //     }
        //
        const timestamp = this.safeInteger2 (order, 'createTime', 'ts');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const ackCode = this.omitZero (this.safeString (order, 'code'));
        if (ackCode !== undefined) {
            // the batch endpoints answer with one acknowledgement row per requested
            // order and a per-row code, a non-zero one means the venue refused the row
            status = 'rejected';
        }
        const triggerOrder = this.safeDict (order, 'triggerOrder', {});
        let type = this.safeString (order, 'orderType');
        if (type === undefined) {
            type = this.safeString (triggerOrder, 'triggerOrderType');
        }
        let postOnly: Bool = undefined;
        if (type !== undefined) {
            postOnly = (type === 'post_only');
            if (postOnly) {
                type = 'limit';
            }
        }
        let timeInForce = this.safeStringUpper (order, 'timeInForce');
        if (postOnly === true) {
            timeInForce = 'PO';
        }
        let price = this.omitZero (this.safeString (order, 'price'));
        if (price === undefined) {
            price = this.safeString (triggerOrder, 'triggerOrderPrice');
        }
        // the venue reports qty in the quote currency when the order traded by cost
        const marketUnit = this.safeString (order, 'marketUnit', 'baseCoin');
        const qty = this.safeString (order, 'qty');
        let amount: Str = undefined;
        let cost: Str = undefined;
        if (marketUnit === 'quoteCoin') {
            cost = qty;
        } else {
            amount = qty;
        }
        // the venue signs fees the other way around, a positive fee is a rebate
        let fee = undefined;
        const quoteFee = this.safeString (order, 'quoteFee');
        const baseFee = this.safeString (order, 'baseFee');
        if ((quoteFee !== undefined) && (!Precise.stringEq (quoteFee, '0'))) {
            fee = {
                'currency': market['quote'],
                'cost': this.parseNumber (Precise.stringNeg (quoteFee)),
            };
        } else if ((baseFee !== undefined) && (!Precise.stringEq (baseFee, '0'))) {
            fee = {
                'currency': market['base'],
                'cost': this.parseNumber (Precise.stringNeg (baseFee)),
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'orderId', 'complexOId'),
            'clientOrderId': this.safeString2 (order, 'clientOrderId', 'complexClOrdId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'updateTime'),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': this.safeString (order, 'side'),
            'price': price,
            'triggerPrice': this.safeString (triggerOrder, 'triggerPrice'),
            'amount': amount,
            'cost': cost,
            'average': this.omitZero (this.safeString (order, 'avgPrice')),
            'filled': this.safeString (order, 'totalFillQty'),
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name umx#fetchOrder
     * @description fetch a regular order by its id, the venue serves trigger orders through fetchOpenOrders with params.trigger instead
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/get-order-information
     * @param {string} id the order id, params.clientOrderId replaces it when given
     * @param {string} [symbol] not used by umx.fetchOrder, the venue resolves the order by its id alone
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] fetch the order by the client order id instead, the newest one when several share it
     * @param {string} [params.orderFilter] "order" (default) or "oco"
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop', false);
        if (isTrigger) {
            throw new NotSupported (this.id + ' fetchOrder() does not support trigger orders, the venue only lists them, use fetchOpenOrders() with params.trigger set to true');
        }
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            request['orderId'] = id;
        }
        const response = await this.privateGetV2TradeOrderInfo (this.extend (request, params));
        //
        // the row below is a live capture, with the account ids masked
        //
        //     {
        //         "accountName": "1000000000000000000",
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "orderId": "3538113582066216960",
        //         "clientOrderId": "3538113582066216960",
        //         "price": "1900",
        //         "qty": "0.001",
        //         "pnl": "",
        //         "orderType": "limit",
        //         "side": "buy",
        //         "totalFillQty": "",
        //         "avgPrice": "",
        //         "status": "new",
        //         "lever": "10",
        //         "baseFee": "",
        //         "quoteFee": "",
        //         "uid": "100000000000001",
        //         "source": "api",
        //         "cancelSource": null,
        //         "cancelUid": null,
        //         "createTime": "1790236812939",
        //         "updateTime": "1790236812940",
        //         "reduceOnly": false,
        //         "timeInForce": "gtc",
        //         "category": "normal",
        //         "massQuoteOrder": {
        //             "quoteId": "",
        //             "quote": false,
        //             "mmpGroup": "",
        //             "quoteSetId": "",
        //             "priceAdjustment": false
        //         },
        //         "eventId": "0",
        //         "parentOrderId": "",
        //         "tpslOrder": null,
        //         "orderFilter": "order",
        //         "riskReducing": false,
        //         "isLeverage": "",
        //         "tag": "",
        //         "stpId": "",
        //         "stpMode": "",
        //         "marketUnit": "baseCoin",
        //         "cid": "100000000000002",
        //         "pid": "1000000000000000000"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name umx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/get-current-open-orders
     * @see https://www.umx.com/docs/coin-apis/trading/complex-order-trading/get-current-complex-orders
     * @param {string} [symbol] unified market symbol to narrow the answer to a single market
     * @param {int} [since] timestamp in ms of the earliest order to keep, the endpoint itself has no time filter
     * @param {int} [limit] the maximum amount of entries to return, applied to the parsed result, the endpoint has no limit of its own
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true fetches the open trigger orders instead
     * @param {string} [params.complexType] "trigger" (default) or "tpsl", the flavour the trigger listing serves
     * @param {string} [params.orderFilter] "order" (default) or "oco", regular orders only
     * @param {string} [params.businessType] the exchange instrument type to narrow the answer to, e.g. "spot"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'fetchOpenOrders', 'trigger', 'stop', false);
        let response = undefined;
        if (isTrigger) {
            let complexType: Str = undefined;
            [ complexType, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'complexType', 'trigger');
            request['complexType'] = complexType;
            response = await this.privateGetV2TradeOpenOrderComplex (this.extend (request, params));
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": [
            //             {
            //                 "businessType": "linear_perpetual",
            //                 "symbol": "BTC-USDT-PERP",
            //                 "complexOId": "1509944814962728960",
            //                 "complexClOrdId": "1509944814962728960",
            //                 "side": "buy",
            //                 "complexType": "trigger",
            //                 "qty": "0.01",
            //                 "triggerOrder": {
            //                     "triggerClOrdId": "1509944814962728960",
            //                     "triggerDirection": "rising",
            //                     "triggerPriceType": "last_price",
            //                     "triggerPrice": "100000.0",
            //                     "triggerOrderType": "limit",
            //                     "triggerOrderPrice": "100000.0"
            //                 },
            //                 "tpslOrder": null,
            //                 "status": "live",
            //                 "accountName": "1000000000000000000",
            //                 "pid": "1000000000000000000",
            //                 "uid": "100000000000001",
            //                 "cid": "100000000000002",
            //                 "createTime": "1780040497317",
            //                 "updateTime": "1780040497317",
            //                 "positionId": null,
            //                 "parentOrderId": null
            //             }
            //         ],
            //         "ts": "1790235602460"
            //     }
            //
        } else {
            response = await this.privateGetV2TradeOpenOrders (this.extend (request, params));
            // the rows share the shape fetchOrder documents
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name umx#cancelOrder
     * @description cancel an open order. the venue only acknowledges that the cancellation was accepted, confirm it through fetchOrder or fetchOpenOrders
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/cancel-order
     * @see https://www.umx.com/docs/coin-apis/trading/complex-order-trading/cancel-complex-orders
     * @param {string} id the order id, params.clientOrderId replaces it when given
     * @param {string} symbol unified symbol of the market the order was placed in, required for regular orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true cancels a trigger order instead
     * @param {string} [params.complexType] "trigger" (default) or "tpsl" when cancelling a trigger order
     * @param {string} [params.clientOrderId] cancel by the client order id instead of the order id
     * @param {string} [params.orderFilter] "order" (default) or "oco", regular orders only
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'cancelOrder', 'trigger', 'stop', false);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, 'clientOrderId');
        const request: Dict = {};
        let response = undefined;
        if (isTrigger) {
            if (clientOrderId !== undefined) {
                request['complexClOrdId'] = clientOrderId;
            } else {
                request['complexOId'] = id;
            }
            if (market !== undefined) {
                request['symbol'] = market['id'];
            }
            response = await this.privatePostV1TradeCancelComplex (this.extend (request, params));
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "accountName": "1000000000000000000",
            //             "complexOId": "1370410319314329600",
            //             "complexClOrdId": ""
            //         },
            //         "ts": "1732158178000"
            //     }
            //
        } else {
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument for a regular order');
            }
            request['symbol'] = market['id'];
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            } else {
                request['orderId'] = id;
            }
            response = await this.privatePostV1TradeCancelOrder (this.extend (request, params));
            //
            //     {
            //         "code": "0",
            //         "msg": "Success",
            //         "data": {
            //             "orderId": "1322590062927904769"
            //         },
            //         "ts": "1732158178000"
            //     }
            //
        }
        const data = this.safeDict (response, 'data', {});
        const order = this.extend (data, {
            'ts': this.safeInteger (response, 'ts'),
        });
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name umx#cancelAllOrders
     * @description cancel every open order, of one market or of the whole account. the venue only acknowledges that the cancellation was accepted
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/cancel-all-orders
     * @see https://www.umx.com/docs/coin-apis/trading/complex-order-trading/cancel-all-strategy-orders
     * @param {string} [symbol] unified symbol of the market to cancel the orders of, every market without it
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true cancels the open trigger orders instead
     * @param {string} [params.complexType] "trigger" (default) or "tpsl" when cancelling trigger orders
     * @param {string} [params.orderFilter] "order" (default) or "oco", regular orders only
     * @param {string} [params.businessType] the exchange instrument type to narrow the sweep to, e.g. "spot"
     * @returns {object[]} a list with the raw response, the venue answers no order details
     */
    override async cancelAllOrders (symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'cancelAllOrders', 'trigger', 'stop', false);
        let response = undefined;
        if (isTrigger) {
            let complexType: Str = undefined;
            [ complexType, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'complexType', 'trigger');
            request['complexType'] = complexType;
            response = await this.privatePostV1TradeCancelAllOrderComplexs (this.extend (request, params));
        } else {
            response = await this.privatePostV1TradeCancelAllOrder (this.extend (request, params));
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": "",
        //         "ts": "1732158178000"
        //     }
        //
        return [ this.safeOrder ({ 'info': response }) ];
    }

    /**
     * @method
     * @name umx#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/count-down-cancel-all
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer, the venue accepts 0 or the 10-120 seconds range
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tag] arm the switch only for the orders carrying this tag, the venue allows at most 20 armed tags
     * @returns {object} the api result
     */
    override async cancelAllOrdersAfter (timeout: Int, params: Dict = {}): Promise<Dict> {
        await this.loadMarkets ();
        let countdown = 0;
        if ((timeout !== undefined) && (timeout > 0)) {
            countdown = this.parseToInt (timeout / 1000);
        }
        const countdownString = this.numberToString (countdown);
        const request: Dict = {
            'countdown': countdownString,
        };
        return await this.privatePostV1TradeCountdownCancelAll (this.extend (request, params));
    }

    /**
     * @method
     * @name umx#closePosition
     * @description close the open position of a contract market with a market order
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/close-all-positions
     * @param {string} symbol unified market symbol of the position, a dated futures symbol closes every position of its symbol family
     * @param {string} [side] not used by umx.closePosition, the venue always closes the whole position
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async closePosition (symbol: string, side: OrderSide = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((market['swap'] !== true) && (market['future'] !== true)) {
            throw new NotSupported (this.id + ' closePosition() supports swap and future markets only');
        }
        const symbolFamily = market['base'] + '-' + market['quote'];
        const businessType = (market['future'] === true) ? 'linear_futures' : 'linear_perpetual';
        const request: Dict = {
            'symbolFamily': symbolFamily,
            'businessType': businessType,
        };
        const response = await this.privatePostV2TradeClosePositions (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const first = this.safeDict (data, 0, {});
        return this.parseOrder (first, market);
    }

    /**
     * @method
     * @name umx#closeAllPositions
     * @description close every open contract position with market orders
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/close-all-positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.businessType] close only this instrument type, "linear_perpetual" or "linear_futures"
     * @param {string} [params.symbolFamily] close only this symbol family, e.g. "BTC-USDT"
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async closeAllPositions (params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.privatePostV2TradeClosePositions (params);
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, undefined, params);
    }

    /**
     * @method
     * @name umx#fetchCanceledAndClosedOrders
     * @description fetch the history of settled orders, the venue keeps the open ones out of this history entirely, which is why the unified fetchOrders cannot be served
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/get-historical-orders
     * @see https://www.umx.com/docs/coin-apis/trading/complex-order-trading/get-historical-complex-orders
     * @param {string} [symbol] unified market symbol to narrow the answer to a single market
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order to fetch
     * @param {boolean} [params.trigger] true fetches the trigger order history instead
     * @param {string} [params.complexType] "trigger" (default) or "tpsl", the flavour the trigger history serves
     * @param {string} [params.orderFilter] "order" (default) or "oco", regular orders only
     * @param {string} [params.businessType] the exchange instrument type to narrow the answer to, e.g. "spot"
     * @param {boolean} [params.paginate] default false, when true fetches the orders in multiple calls, walking backwards from the newest entry
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchCanceledAndClosedOrders', 'paginate');
        if (paginate) {
            // the venue documents beginId and endId cursors, but the transfer history proved the
            // family broken venue side, so the pagination walks on endTime, see fetchTransfers
            return await this.fetchPaginatedCallDynamic ('fetchCanceledAndClosedOrders', symbol, since, limit, params, 100) as Order[];
        }
        let market: Market = undefined;
        let request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead
        }
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'fetchCanceledAndClosedOrders', 'trigger', 'stop', false);
        let response = undefined;
        if (isTrigger) {
            let complexType: Str = undefined;
            [ complexType, params ] = this.handleOptionAndParams (params, 'fetchCanceledAndClosedOrders', 'complexType', 'trigger');
            request['complexType'] = complexType;
            response = await this.privateGetV2HistoryOrderComplexs (this.extend (request, params));
            // the rows share the shape fetchOpenOrders documents for trigger orders
        } else {
            response = await this.privateGetV2HistoryOrders (this.extend (request, params));
            // the rows share the shape fetchOrder documents
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name umx#fetchClosedOrders
     * @description fetch the filled orders, a filtered view of fetchCanceledAndClosedOrders, the venue has no history of its own for them
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/get-historical-orders
     * @param {string} [symbol] unified market symbol to narrow the answer to a single market
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum amount of entries the underlying history call returns before the closed ones are filtered out of it
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed') as Order[];
    }

    /**
     * @method
     * @name umx#fetchMyTrades
     * @description fetch the trades made by the account
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/get-account-trade-history
     * @param {string} [symbol] unified market symbol to narrow the answer to a single market
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of entries to return, the venue defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.businessType] the exchange instrument type to narrow the answer to, e.g. "spot"
     * @param {boolean} [params.paginate] default false, when true fetches the trades in multiple calls, walking backwards from the newest entry
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params, 100) as Trade[];
        }
        let market: Market = undefined;
        let request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['beginTime'] = since;
            // limit keeps the newest entries of the requested range rather than the ones that
            // follow since, so it is left out here and applied to the parsed result instead
        }
        const response = await this.privateGetV2HistoryTrades (this.extend (request, params));
        // the private rows extend the public trade shape, parseTrade carries a live sample
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name umx#cancelOrders
     * @description cancel several open orders in one call. the venue only acknowledges that each cancellation was accepted
     * @see https://www.umx.com/docs/coin-apis/trading/regular-trading/batch-cancel
     * @param {string[]} ids the order ids
     * @param {string} [symbol] unified symbol of the market the orders were placed in, required, every order of the batch lives there
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] cancel by the client order ids instead of the order ids
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrders (ids: string[], symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const clientOrderIds = this.safeList (params, 'clientOrderIds');
        params = this.omit (params, 'clientOrderIds');
        const items = [];
        if (clientOrderIds !== undefined) {
            for (let i = 0; i < clientOrderIds.length; i++) {
                items.push ({
                    'symbol': market['id'],
                    'clientOrderId': clientOrderIds[i],
                });
            }
        } else {
            for (let i = 0; i < ids.length; i++) {
                items.push ({
                    'symbol': market['id'],
                    'orderId': ids[i],
                });
            }
        }
        const request: Dict = {
            'orderCreateReq': items,
        };
        const response = await this.privatePostV1TradeBatchCancelOrder (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "orderId": "1322577577491374080",
        //                 "code": "0",
        //                 "msg": "success",
        //                 "ts": "1732158178000"
        //             }
        //         ],
        //         "ts": "1732158178000"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            // an untriggered conditional order and a live complex order sit in the book waiting
            'untrigger': 'open',
            'live': 'open',
            'new': 'open',
            'partially_filled': 'open',
            'partially_canceled': 'canceled',
            'canceled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name umx#withdraw
     * @description make a withdrawal to an address the venue has already verified, unverified addresses are rejected
     * @see https://www.umx.com/docs/coin-apis/funding-account/withdrawal/withdrawal-application
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to, it has to be on the account's verified withdrawal address list
     * @param {string} [tag] the address memo where the chain requires one
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network unified network code, the venue requires one and sends it as its chainType
     * @param {string} [params.clientWithdrawalId] a client supplied id for the withdrawal, unique among the ones being processed
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params: Dict = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        let networkCode: Str = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a "network" parameter');
        }
        const networkId = this.networkCodeToId (networkCode);
        const amountString = this.currencyToPrecision (code, amount);
        // the body timestamp is the application time the venue deduplicates requests by
        const timestamp = this.numberToString (this.milliseconds ());
        const request: Dict = {
            'currency': currency['id'],
            'chainType': networkId,
            'address': address,
            'amount': amountString,
            'timestamp': timestamp,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostV1AssetWithdrawal (this.extend (request, params));
        //
        // the sample is the venue's own docs example, the account ids are masked. live withdraw
        // calls are forbidden by the hard safety rules, so the shape was never verified live,
        // and the docs contradict themselves on it, the parameter table promises an array while
        // the example answers a single object, which is why both shapes are accepted below
        //
        //     {
        //         "code": "0",
        //         "data": {
        //             "accountName": "1000000000000000000",
        //             "address": "0xC7EBBBdc93293F61eF13053ED6B29F9247b9686c",
        //             "amount": "123.89",
        //             "chainType": "eth",
        //             "cid": "100000000000002",
        //             "currency": "USDT",
        //             "pid": "1000000000000000000",
        //             "timestamp": "1755586041673",
        //             "uid": "100000000000001",
        //             "withdrawFee": "6.888323303707866",
        //             "withdrawalId": "1957695861084831746"
        //         },
        //         "msg": "Success",
        //         "ts": "1755586041673"
        //     }
        //
        let data = this.safeDict (response, 'data');
        if (data === undefined) {
            const rows = this.safeList (response, 'data', []);
            data = this.safeDict (rows, 0, {});
        }
        return this.parseTransaction (data, currency);
    }

    override sign (path: any, api = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + request;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                // the signature covers the query string exactly as it is sent, and the official sdks
                // join the parameters without percent encoding, e.g. currencyList=BTC,USDT
                queryString = '?' + this.rawencode (query);
                url += queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString (); // the exchange allows same timestamps, so incrementingNonce is not necessary
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length > 0) {
                    payload = this.json (query);
                } else {
                    // this fix for PHP is required otherwise it generates
                    // '[]' on empty arrays even when forced to use objects
                    payload = '{}';
                }
                body = payload;
            }
            const auth = timestamp + method + request + queryString + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'hex');
            headers = {
                'Content-Type': 'application/json',
                'X-ACCESS-APIKEY': this.apiKey,
                'X-ACCESS-TIMESTAMP': timestamp,
                'X-ACCESS-SIGN': signature,
            };
            const recvWindow = this.safeInteger (this.options, 'recvWindow');
            if (recvWindow !== undefined) {
                headers['X-ACCESS-RECV-WINDOW'] = recvWindow.toString ();
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler, the waf rejects blocked requests with a non json 403 page
        }
        // every response carries a string code, "0" means success
        //
        //     { "code": "0", "msg": "Success", "ts": "...", "data": ... }
        //
        const errorCode = this.safeString (response, 'code');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            if (errorCode === '50022') {
                // "Batch orders partially failed", sent with an http 400: the batch endpoints keep
                // the verdict of every row in data with a per-row code, parseOrder marks the refused
                // rows as rejected, so the answer is handed over instead of throwing
                return response;
            }
            const message = this.safeString2 (response, 'msg', 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
