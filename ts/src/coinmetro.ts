
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coinmetro.js';
// import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, InsufficientFunds, InvalidAddress, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, PermissionDenied } from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
// import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Market } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coinmetro
 * @extends Exchange
 */
export default class coinmetro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinmetro',
            'name': 'Coinmetro',
            'countries': [ 'EE' ], // Republic of Estonia todo: check
            'version': 'v1', // todo: check
            'rateLimit': 300, // todo: check
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false, // todo: check
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                // todo
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.coinmetro.com',
                    'private': 'https://api.coinmetro.com',
                    'test': 'https://api.coinmetro.com/open',
                },
                'www': 'https://coinmetro.com/',
                'doc': [
                    'https://documenter.getpostman.com/view/3653795/SVfWN6KS',
                ],
                'fees': 'https://help.coinmetro.com/hc/en-gb/articles/6844007317789-What-are-the-fees-on-Coinmetro-',
            },
            'api': {
                'public': {
                    'get': {
                        'exchange/candles/:pair/:timeframe/:from/:to': 1,
                        'exchange/prices': 1,
                        'exchange/ticks/:pair/:from': 1,
                        'assets': 1,
                        'markets': 1,
                        'exchange/book/:pair': 1,
                        'exchange/bookUpdates/:pair/:from': 1,
                    },
                },
                'private': {
                    'get': {
                    },
                    'post': {
                    },
                    'put': {
                    },
                },
            },
            'fees': {
                // todo: add swap and margin
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'precisionMode': DECIMAL_PLACES,
            // exchange-specific options
            'options': {
            },
            'exceptions': {
                // https://trade-docs.coinmetro.co/?javascript--nodejs#message-codes
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name coinmetro#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#d5876d43-a3fe-4479-8c58-24d0f044edfb
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "name": "Bitcoin",
        //             "color": "#FFA500",
        //             "type": "coin",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "canTrade": true,
        //             "notabeneDecimals": 8,
        //             "canMarket": true,
        //             "maxSwap": 10000,
        //             "digits": 6,
        //             "multiplier": 1000000,
        //             "bookDigits": 8,
        //             "bookMultiplier": 100000000,
        //             "sentimentData": {
        //                 "sentiment": 51.59555555555555,
        //                 "interest": 1.127511216044664
        //             },
        //             "minQty": 0.0001
        //         },
        //         {
        //             "symbol": "EUR",
        //             "name": "Euro",
        //             "color": "#1246FF",
        //             "type": "fiat",
        //             "canDeposit": true,
        //             "canWithdraw": true,
        //             "canTrade": true,
        //             "canMarket": true,
        //             "maxSwap": 10000,
        //             "digits": 2,
        //             "multiplier": 100,
        //             "bookDigits": 3,
        //             "bookMultiplier": 1000,
        //             "minQty": 5
        //         }
        //         ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const withdraw = this.safeValue (currency, 'canWithdraw');
            const deposit = this.safeValue (currency, 'canDeposit');
            const canTrade = this.safeValue (currency, 'canTrade');
            // todo: check active limits and precision (what are notabeneDecimals, digits and bookDigits?)
            const active = canTrade ? withdraw : true;
            const precision = this.safeInteger (currency, 'digits');
            const minAmount = this.safeNumber (currency, 'minQty');
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'info': currency,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': minAmount, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name coinmetro#fetchMarkets
         * @description retrieves data on all markets for coinmetro
         * @see https://documenter.getpostman.com/view/3653795/SVfWN6KS#9fd18008-338e-4863-b07d-722878a46832
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        // todo: check
        if (this.isEmpty (this.safeValue (this, 'currencies'))) {
            this['currenciesHelper'] = await this.fetchCurrencies ();
        }
        //
        //     [
        //         {
        //             "pair": "PERPEUR",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         {
        //             "pair": "PERPUSD",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         {
        //             "pair": "YFIEUR",
        //             "precision": 5,
        //             "margin": false
        //         },
        //         ...
        //     ]
        //
        return this.parseMarkets (response);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'pair');
        const parsedMarketId = this.parseMarketId (id);
        const baseId = this.safeString (parsedMarketId, 'baseId');
        const quoteId = this.safeString (parsedMarketId, 'quoteId');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const pricePrecision = this.safeInteger (market, 'precision');
        const margin = this.safeValue (market, 'margin', false);
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': margin,
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
                'amount': undefined,
                'price': this.parseNumber (pricePrecision), // todo: check
            },
            'limits': {
                'leverage': {
                    'min': undefined,
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
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    parseMarketId (marketId) {
        const result = {};
        const currencies = this.safeValue (this, 'currenciesHelper', {});
        const currencyCodes = Object.keys (currencies);
        for (let i = 0; i < currencyCodes.length; i++) {
            const currencyCode = currencyCodes[i];
            const currency = currencies[currencyCode];
            const currencyId = currency['id'];
            const index = marketId.indexOf (currencyId);
            if (index !== -1) {
                if (index === 0) {
                    result['baseId'] = currencyId;
                } else {
                    result['quoteId'] = currencyId;
                }
            }
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        url += '?' + query;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
