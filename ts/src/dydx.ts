
// ---------------------------------------------------------------------------

import Exchange from './abstract/dydx.js';
import { AuthenticationError, RateLimitExceeded, BadRequest, OperationFailed, ExchangeError, InvalidOrder, ArgumentsRequired, NotSupported, OnMaintenance } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { TransferEntry, Balances, Conversion, Currency, FundingRateHistory, Int, Market, MarginModification, MarketType, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Dict, Bool, Strings, Trade, Transaction, Leverage, Account, Currencies, TradingFees, int, FundingHistory, LedgerEntry, FundingRate, FundingRates, DepositAddress, Position, TradingFeeInterface } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class dydx
 * @augments Exchange
 */
export default class dydx extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'dydx',
            'name': 'dYdX',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'version': 'v4',
            'certified': false,
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
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelWithdraw': false,
                'closeAllPositions': false,
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
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
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
                    'indexer': 'https://indexer.dydx.trade/v4',
                    'node': 'https://dydx-dao-api.polkachu.com',
                },
                'test': {
                    'indexer': 'https://indexer.v4testnet.dydx.exchange/v4',
                    'node': 'https://dydx-lcd-testnet.enigma-validator.com',
                },
                'www': 'https://www.dydx.xyz',
                'doc': [
                    'https://docs.dydx.xyz',
                ],
                'fees': [
                    'https://docs.dydx.exchange/introduction-trading_fees',
                ],
                'referral': {
                    'url': '',
                },
            },
            'api': {
                'indexer': {
                    'get': {
                        'time': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
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
                    'ARB': 'Arbitrum',
                },
                'networksById': {
                    'TRX': 'TRC20',
                    'TRON': 'TRC20',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                    // 'USDT': 'TRC20',
                    // 'BTC': 'BTC',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false, // todo by triggerPrice
                        'takeProfitPrice': false, // todo by triggerPrice
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': true, // todo implement
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 90,
                        'untilDays': 10000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'forSwap': {
                    'extends': 'default',
                    'createOrder': {
                        'hedged': true,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forSwap',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
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

    /**
     * @method
     * @name dydx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.dydx.xyz/indexer-client/http#get-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.indexerGetTime (params);
        //
        // {
        //     "iso": "2025-07-20T15:12:13.466Z",
        //     "epoch": 1753024333.466
        // }
        //
        return this.safeInteger (response, 'epoch');
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const pathWithParams = this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][section]);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (section === 'indexer') {
            url += '/' + pathWithParams;
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

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }
}
