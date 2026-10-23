//  ---------------------------------------------------------------------------

import Exchange from './abstract/dotswap.js';
import { ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Market, Order, Ticker, Dict, int, Num } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class dotswap
 * @augments Exchange
 */
export default class dotswap extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dotswap',
            'name': 'DotSwap',
            'countries': [],
            'version': 'v1',
            'rateLimit': 50,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketOrder': true,
                'createOrder': true,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {},
            'urls': {
                'logo': '',
                'hostname': 'test-dex.ddpurse.com:18617',
                'api': {
                    'public': 'http://test-dex.ddpurse.com:18617',
                    'private': 'http://test-dex.ddpurse.com:18617',
                },
                'test': {
                    'public': 'http://test-dex.ddpurse.com:18617',
                    'private': 'http://test-dex.ddpurse.com:18617',
                },
                'www': 'https://www.dotswap.app',
                'doc': [],
            },
            'api': {
                'public': {
                    'get': {
                        'dotswap/api/fetch_ticker': 1,
                        'dotswap/api/fetch_markets': 1,
                        'dotswap/api/fetch_currencies': 1,
                    },
                },
                'private': {
                    'post': {
                        'taker/api/swap/quick': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {},
        });
    }

    /**
     * @method
     * @name dotswap#fetchMarkets
     * @description retrieves data on all markets for dotswap
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetDotswapApiFetchMarkets (params);
        //
        // {
        //     "code": 200,
        //     "data": [
        //         {
        //             "active": true,
        //             "base": "DOTSWAP",
        //             "id": "DOTSWAP_BTC",
        //             "limits": {
        //                 "amount": {},
        //                 "cost": {},
        //                 "leverage": {},
        //                 "price": {}
        //             },
        //             "margin_modes": {
        //                 "cross": false,
        //                 "isolated": false
        //             },
        //             "precision": {
        //                 "amount": 0.000001,
        //                 "price": 0.000001
        //             },
        //             "quote": "BTC",
        //             "symbol": "DOTSWAP/BTC",
        //             "type": "spot"
        //         }
        //     ],
        //     "msg": "success",
        //     "req_id": "...",
        //     "trace_id": "..."
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'id');
        const symbol = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const type = this.safeString (market, 'type');
        const active = this.safeBool (market, 'active');
        const precision = this.safeDict (market, 'precision', {});
        const limits = this.safeDict (market, 'limits', {});
        const amountLimits = this.safeDict (limits, 'amount', {});
        const priceLimits = this.safeDict (limits, 'price', {});
        const costLimits = this.safeDict (limits, 'cost', {});
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': type,
            'spot': type === 'spot',
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (precision, 'amount'),
                'price': this.safeNumber (precision, 'price'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (amountLimits, 'min'),
                    'max': this.safeNumber (amountLimits, 'max'),
                },
                'price': {
                    'min': this.safeNumber (priceLimits, 'min'),
                    'max': this.safeNumber (priceLimits, 'max'),
                },
                'cost': {
                    'min': this.safeNumber (costLimits, 'min'),
                    'max': this.safeNumber (costLimits, 'max'),
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name dotswap#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        const request: Dict = {
            'symbol': symbol,
        };
        const response = await this.publicGetDotswapApiFetchTicker (this.extend (request, params));
        //
        // {
        //     "code": 200,
        //     "data": {
        //         "average": 100,
        //         "change": 10,
        //         "close": 110,
        //         "datetime": "2024-01-01 00:00:00",
        //         "high": 120,
        //         "low": 90,
        //         "open": 100,
        //         "symbol": "DOTSWAP/BTC",
        //         "timestamp": 1704067200000
        //     },
        //     "msg": "success",
        //     ...
        // }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, undefined);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const symbol = this.safeString (ticker, 'symbol');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'close'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': undefined,
            'average': this.safeString (ticker, 'average'),
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name dotswap#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}) {
        const response = await this.publicGetDotswapApiFetchCurrencies (params);
        //
        // {
        //     "code": 0,
        //     "data": {
        //         "BTC": {
        //             "active": true,
        //             "code": "BTC",
        //             "deposit": true,
        //             "fee": 0.001,
        //             "id": "BTC",
        //             "name": "Bitcoin",
        //             "precision": 8,
        //             "type": "crypto",
        //             "withdraw": true,
        //             "limits": {
        //                 "amount": {},
        //                 "withdraw": {}
        //             }
        //         }
        //     },
        //     "msg": "success"
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const result: Dict = {};
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const entry = data[id];
            const code = this.safeCurrencyCode (this.safeString (entry, 'code'));
            const name = this.safeString (entry, 'name');
            const active = this.safeBool (entry, 'active');
            const fee = this.safeNumber (entry, 'fee');
            const precision = this.safeNumber (entry, 'precision');
            const deposit = this.safeBool (entry, 'deposit');
            const withdraw = this.safeBool (entry, 'withdraw');
            const limits = this.safeDict (entry, 'limits', {});
            const amountLimits = this.safeDict (limits, 'amount', {});
            const withdrawLimits = this.safeDict (limits, 'withdraw', {});
            result[code] = {
                'id': id,
                'code': code,
                'info': entry,
                'name': name,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (amountLimits, 'min'),
                        'max': this.safeNumber (amountLimits, 'max'),
                    },
                    'withdraw': {
                        'min': this.safeNumber (withdrawLimits, 'min'),
                        'max': this.safeNumber (withdrawLimits, 'max'),
                    },
                },
                'networks': this.safeDict (entry, 'networks'),
            };
        }
        return result;
    }

    /**
     * @method
     * @name dotswap#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.slippage] slippage tolerance
     * @param {boolean} [params.enable_channel] whether to use channel payment
     * @param {float} [params.fee_rate] fee rate
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: string, side: string, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        const request: Dict = {
            'symbol': symbol,
            'side': side.toLowerCase (),
            'quantity': String (amount),
            'slippage': this.safeString (params, 'slippage', '0.01'),
            'enable_channel': this.safeBool (params, 'enable_channel', false),
            'fee_rate': this.safeNumber (params, 'fee_rate'),
        };
        const response = await this.privatePostTakerApiSwapQuick (this.extend (request, params));
        return this.safeOrder ({
            'info': response,
        }, undefined);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        url += '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Id': this.apiKey,
                'Authorization': this.secret,
            };
            if (method === 'POST') {
                body = this.json (params);
            } else {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        // {
        //     "code": 500,
        //     "msg": "error message"
        // }
        //
        const errorCode = this.safeInteger (response, 'code');
        if (errorCode !== 0 && errorCode !== 200) {
            const message = this.safeString (response, 'msg');
            throw new ExchangeError (this.id + ' ' + message);
        }
        return undefined;
    }
}
