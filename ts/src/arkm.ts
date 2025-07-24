
//  ---------------------------------------------------------------------------

import Exchange from './abstract/arkm.js';
import { Precise } from './base/Precise.js';
import { AuthenticationError, ArgumentsRequired, ExchangeError, InsufficientFunds, DDoSProtection, InvalidNonce, PermissionDenied, BadRequest, BadSymbol, NotSupported, AccountNotEnabled, OnMaintenance, InvalidOrder, RequestTimeout, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, Str, Ticker, OrderRequest, Balances, Transaction, OrderBook, Tickers, Strings, Currency, Currencies, Market, Num, Account, CancellationRequest, Dict, int, TradingFeeInterface, TradingFees, LedgerEntry, DepositAddress, Position } from './base/types.js';

/**
 * @class arkm
 * @augments Exchange
 */
export default class arkm extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'arkm',
            'name': 'ARKM',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 20 / 3, // 150 req/s
            'certified': false,
            'pro': false,
            'has': {
                'CORS': false,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
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
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': 'emulated',
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
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
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMarginMode': false,
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
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'v1': 'https://arkm.com/api',
                },
                'www': 'https://arkm.com/',
                'referral': {
                    'url': 'https://arkm.com',
                    'discount': 0,
                },
                'doc': [
                    'https://arkm.com/limits-api',
                    'https://info.arkm.com/api-platform',
                ],
                'fees': 'https://arkm.com/fees',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'public/pairs': 1,
                        },
                    },
                    'private': {
                        'post': {
                        },
                    },
                },
                'derivatives': {
                    'public': {
                        'get': {
                        },
                    },
                    'private': {
                        'post': {
                        },
                    },
                },
            },
            'options': {
                'networks': {
                    'BEP20': 'BSC',
                    'ERC20': 'ETH',
                    'TRC20': 'TRON',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        // todo: implementation fix
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
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
                        'selfTradePrevention': true, // todo: implement
                        'trailing': false,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': 1,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': 1,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 1,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name arkm#fetchMarkets
     * @see https://arkm.com/docs#get/public/pairs
     * @description retrieves data on all markets for cryptocom
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const promiseSpot = this.fetchSpotMarkets (params);
        const promiseSwap = this.fetchSwapMarkets (params);
        const [ spotMarkets, swapMarkets ] = await Promise.all ([ promiseSpot, promiseSwap ]);
        const all = this.arrayConcat (spotMarkets, swapMarkets);
        return all;
    }

    async fetchSpotMarkets (params = {}): Promise<Market[]> {
        const response = await this.v1PublicGetPublicPairs (params);
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT",
        //            "baseSymbol": "BTC",
        //            "baseImageUrl": "https://static.arkhamintelligence.com/tokens/bitcoin.png",
        //            "baseIsStablecoin": false,
        //            "baseName": "Bitcoin",
        //            "quoteSymbol": "USDT",
        //            "quoteImageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "quoteIsStablecoin": true,
        //            "quoteName": "Tether",
        //            "minTickPrice": "0.01",
        //            "minLotSize": "0.00001",
        //            "minSize": "0.00001",
        //            "maxSize": "9000",
        //            "minPrice": "0.01",
        //            "maxPrice": "1000000",
        //            "minNotional": "5",
        //            "maxPriceScalarUp": "1.8",
        //            "maxPriceScalarDown": "0.2",
        //            "pairType": "spot", // atm, always 'spot' value
        //            "maxLeverage": "0",
        //            "status": "listed"
        //        },
        //        ...
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseSymbol');
            const quoteId = this.safeString (market, 'quoteSymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeString (market, 'status') === 'listed',
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': this.safeNumber (market, 'minTickPrice'),
                    'amount': this.safeNumber (market, 'minLotSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minSize'),
                        'max': this.safeNumber (market, 'maxSize'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minPrice'),
                        'max': this.safeNumber (market, 'maxPrice'),
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
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString (api, 0);
        const access = this.safeString (api, 1);
        let url = this.urls['api'][type] + '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            // this.checkRequiredCredentials ();
            // const nonce = this.nonce ().toString ();
            // const requestParams = this.extend ({}, params);
            // const paramsKeys = Object.keys (requestParams);
            // const strSortKey = this.paramsToString (requestParams, 0);
            // const payload = path + nonce + this.apiKey + strSortKey + nonce;
            // const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            // body = this.json ({
            //     'id': nonce,
            //     'method': path,
            //     'params': params,
            //     'api_key': this.apiKey,
            //     'sig': signature,
            //     'nonce': nonce,
            // });
            // headers = {
            //     'Content-Type': 'application/json',
            // };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // response examples:
        //   {message: 'Not Found'}
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }
}
