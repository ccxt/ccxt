'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class currencycom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'currencycom',
            'name': 'Currency.com',
            'countries': [ 'BY' ], // Belarus
            'rateLimit': 100,
            'certified': true,
            'pro': true,
            'version': 'v2',
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'editOrder': 'emulated',
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': true,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': true,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactions': true,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
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
            'hostname': 'backend.currency.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg',
                'api': {
                    'public': 'https://api-adapter.{hostname}/api',
                    'private': 'https://api-adapter.{hostname}/api',
                    'marketcap': 'https://marketcap.{hostname}/api',
                },
                'test': {
                    'public': 'https://demo-api-adapter.{hostname}/api',
                    'private': 'https://demo-api-adapter.{hostname}/api',
                },
                'www': 'https://www.currency.com',
                'referral': 'https://currency.com/trading/signup?c=362jaimv&pid=referral',
                'doc': [
                    'https://currency.com/api',
                ],
                'fees': 'https://currency.com/fees-charges',
            },
            // rate-limits are described at: https://currency.com/api-get-started
            'api': {
                'public': {
                    'get': {
                        'v1/time': 1,
                        'v1/exchangeInfo': 1,
                        'v1/depth': 1,
                        'v1/aggTrades': 1,
                        'v1/klines': 1,
                        'v1/ticker/24hr': 1,
                        'v2/time': 1,
                        'v2/exchangeInfo': 1,
                        'v2/depth': 1,
                        'v2/aggTrades': 1,
                        'v2/klines': 1,
                        'v2/ticker/24hr': 1,
                    },
                },
                'marketcap': {
                    'get': {
                        'v1/assets': 1,
                        'v1/candles': 1,
                        'v1/orderbook': 1,
                        'v1/summary': 1,
                        'v1/ticker': 1,
                        'v1/token/assets': 1,
                        'v1/token/orderbook': 1,
                        'v1/token/summary': 1,
                        'v1/token/ticker': 1,
                        'v1/token/trades': 1,
                        'v1/token_crypto/OHLC': 1,
                        'v1/token_crypto/assets': 1,
                        'v1/token_crypto/orderbook': 1,
                        'v1/token_crypto/summary': 1,
                        'v1/token_crypto/ticker': 1,
                        'v1/token_crypto/trades': 1,
                        'v1/trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'v1/account': 1,
                        'v1/currencies': 1,
                        'v1/deposits': 1,
                        'v1/depositAddress': 1,
                        'v1/ledger': 1,
                        'v1/leverageSettings': 1,
                        'v1/myTrades': 1,
                        'v1/openOrders': 1,
                        'v1/tradingPositions': 1,
                        'v1/tradingPositionsHistory': 1,
                        'v1/transactions': 1,
                        'v1/withdrawals': 1,
                        'v2/account': 1,
                        'v2/currencies': 1,
                        'v2/deposits': 1,
                        'v2/depositAddress': 1,
                        'v2/ledger': 1,
                        'v2/leverageSettings': 1,
                        'v2/myTrades': 1,
                        'v2/openOrders': 1,
                        'v2/tradingPositions': 1,
                        'v2/tradingPositionsHistory': 1,
                        'v2/transactions': 1,
                        'v2/withdrawals': 1,
                    },
                    'post': {
                        'v1/order': 1,
                        'v1/updateTradingPosition': 1,
                        'v1/updateTradingOrder': 1,
                        'v1/closeTradingPosition': 1,
                        'v2/order': 1,
                        'v2/updateTradingPosition': 1,
                        'v2/updateTradingOrder': 1,
                        'v2/closeTradingPosition': 1,
                    },
                    'delete': {
                        'v1/order': 1,
                        'v2/order': 1,
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
            // exchange-specific options
            'options': {
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel, 'FOK' = Fill Or Kill
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 5 sec, default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'RESULT', // we change it from 'ACK' by default to 'RESULT'
                    'stop': 'RESULT',
                },
                'leverage_markets_suffix': '_LEVERAGE',
                'collateralCurrencies': [ 'USD', 'EUR', 'USDT' ],
            },
            'exceptions': {
                'broad': {
                    'FIELD_VALIDATION_ERROR Cancel is available only for LIMIT order': InvalidOrder,
                    'API key does not exist': AuthenticationError,
                    'Order would trigger immediately.': InvalidOrder,
                    'Account has insufficient balance for requested action.': InsufficientFunds,
                    'Rest API trading is not enabled.': ExchangeNotAvailable,
                    'Combination of parameters invalid': BadRequest,
                    'Invalid limit price': BadRequest,
                    'Only leverage symbol allowed here:': BadSymbol, // when you fetchLeverage for non-leverage symbols, like 'BTC/USDT' instead of 'BTC/USDT_LEVERAGE': {"code":"-1128","msg":"Only leverage symbol allowed here: BTC/USDT"}
                },
                'exact': {
                    '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                    '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                    '-1021': InvalidNonce, // 'your time is ahead of server'
                    '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                    '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                    '-1104': ExchangeError, // Not all sent parameters were read, read 8 parameters but was sent 9
                    '-1025': AuthenticationError, // {"code":-1025,"msg":"Invalid API-key, IP, or permissions for action"}
                    '-1128': BadRequest, // {"code":-1128,"msg":"Combination of optional parameters invalid."} | {"code":"-1128","msg":"Combination of parameters invalid"} | {"code":"-1128","msg":"Invalid limit price"}
                    '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                    '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                    '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                    '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                    '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
                },
            },
            'commonCurrencies': {
                'ACN': 'Accenture',
                'AMC': 'AMC Entertainment Holdings',
                'BNS': 'Bank of Nova Scotia',
                'CAR': 'Avis Budget Group Inc',
                'CLR': 'Continental Resources',
                'EDU': 'New Oriental Education & Technology Group Inc',
                'ETN': 'Eaton',
                'FOX': 'Fox Corporation',
                'GM': 'General Motors Co',
                'IQ': 'iQIYI',
                'OSK': 'Oshkosh',
                'PLAY': "Dave & Buster's Entertainment",
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetV2Time (params);
        //
        //     {
        //         "serverTime": 1590998366609
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchCurrencies (params = {}) {
        // requires authentication
        if (!this.checkRequiredCredentials (false)) {
            return undefined;
        }
        const response = await this.privateGetV2Currencies (params);
        //
        //     [
        //         {
        //             "name": "Euro",
        //             "displaySymbol": "EUR.cx",
        //             "precision": "2",
        //             "type": "FIAT",
        //             "minWithdrawal": "90.0",
        //             "maxWithdrawal": "1.0E+8",
        //             "commissionMin": "0.02", // some instruments do not have this property
        //             "commissionPercent": "1.5", // some instruments do not have this property
        //             "minDeposit": "90.0",
        //         },
        //         {
        //             name: "Bitcoin",
        //             displaySymbol: "BTC",
        //             precision: "8",
        //             type: "CRYPTO", // only a few major currencies have this value, others like USDT have a value of "TOKEN"
        //             minWithdrawal: "0.00020",
        //             commissionFixed: "0.00010",
        //             minDeposit: "0.00010",
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'displaySymbol');
            const code = this.safeCurrencyCode (id);
            const fee = this.safeNumber (currency, 'commissionFixed');
            const precision = this.safeInteger (currency, 'precision');
            result[code] = {
                'id': id,
                'code': code,
                'address': this.safeString (currency, 'baseAddress'),
                'type': this.safeStringLower (currency, 'type'),
                'name': this.safeString (currency, 'name'),
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minWithdrawal'),
                        'max': this.safeNumber (currency, 'maxWithdrawal'),
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'minDeposit'),
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetV2ExchangeInfo (params);
        //
        //     {
        //         timezone: "UTC",
        //         serverTime: "1645186287261",
        //         rateLimits: [
        //             { rateLimitType: "REQUEST_WEIGHT", interval: "MINUTE", intervalNum: "1", limit: "1200" },
        //             { rateLimitType: "ORDERS", interval: "SECOND", intervalNum: "1", limit: "10" },
        //             { rateLimitType: "ORDERS", interval: "DAY", intervalNum: "1", limit: "864000" },
        //         ],
        //         exchangeFilters: [],
        //         symbols: [
        //             {
        //                 symbol: "BTC/USDT", // BTC/USDT, BTC/USDT_LEVERAGE
        //                 name: "Bitcoin / Tether",
        //                 status: "TRADING", // TRADING, BREAK, HALT
        //                 baseAsset: "BTC",
        //                 baseAssetPrecision: "4",
        //                 quoteAsset: "USDT",
        //                 quoteAssetId: "USDT", // USDT, USDT_LEVERAGE
        //                 quotePrecision: "4",
        //                 orderTypes: [ "LIMIT", "MARKET" ], // LIMIT, MARKET, STOP
        //                 filters: [
        //                     { filterType: "LOT_SIZE", minQty: "0.0001", maxQty: "100", stepSize: "0.0001", },
        //                     { filterType: "MIN_NOTIONAL", minNotional: "5", },
        //                 ],
        //                 marketModes: [ "REGULAR" ], // CLOSE_ONLY, LONG_ONLY, REGULAR
        //                 marketType: "SPOT", // SPOT, LEVERAGE
        //                 longRate: -0.0684932, // LEVERAGE only
        //                 shortRate: -0.0684932, // LEVERAGE only
        //                 swapChargeInterval: 1440, // LEVERAGE only
        //                 country: "",
        //                 sector: "",
        //                 industry: "",
        //                 tradingHours: "UTC; Mon - 22:00, 22:05 -; Tue - 22:00, 22:05 -; Wed - 22:00, 22:05 -; Thu - 22:00, 22:05 -; Fri - 22:00, 23:01 -; Sat - 22:00, 22:05 -; Sun - 21:00, 22:05 -",
        //                 tickSize: "0.01",
        //                 tickValue: "403.4405", // not available in BTC/USDT_LEVERAGE, but available in BTC/USD_LEVERAGE
        //                 exchangeFee: "0.2", // SPOT only
        //                 tradingFee: 0.075, // LEVERAGE only
        //                 makerFee: -0.025, // LEVERAGE only
        //                 takerFee: 0.06, // LEVERAGE only
        //                 maxSLGap: 50, // LEVERAGE only
        //                 minSLGap: 1, // LEVERAGE only
        //                 maxTPGap: 50, // LEVERAGE only
        //                 minTPGap: 0.5, // LEVERAGE only
        //                 assetType: "CRYPTOCURRENCY",
        //             },
        //         ]
        //     }
        //
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const markets = this.safeValue (response, 'symbols');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            const type = this.safeString (market, 'marketType');
            const spot = (type === 'SPOT');
            const futures = false;
            const swap = (type === 'LEVERAGE');
            const margin = swap; // as we decided to set
            if (swap) {
                symbol = symbol.replace (this.options['leverage_markets_suffix'], '');
                symbol += ':' + quote;
            }
            const active = this.safeString (market, 'status') === 'TRADING';
            // to set taker & maker fees, we use one from the below data - pairs either have 'exchangeFee' or 'tradingFee', if none of them (rare cases), then they should have 'takerFee & makerFee'
            const exchangeFee = this.safeString2 (market, 'exchangeFee', 'tradingFee');
            let makerFee = this.safeString (market, 'makerFee', exchangeFee);
            let takerFee = this.safeString (market, 'takerFee', exchangeFee);
            makerFee = Precise.stringDiv (makerFee, '100');
            takerFee = Precise.stringDiv (takerFee, '100');
            const filters = this.safeValue (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            let limitPriceMin = undefined;
            let limitPriceMax = undefined;
            let precisionPrice = this.safeNumber (market, 'tickSize');
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'PRICE_FILTER', {});
                precisionPrice = this.safeNumber (filter, 'tickSize');
                // PRICE_FILTER reports zero values for maxPrice
                // since they updated filter types in November 2018
                // https://github.com/ccxt/ccxt/issues/4286
                // therefore limits['price']['max'] doesn't have any meaningful value except undefined
                limitPriceMin = this.safeNumber (filter, 'minPrice');
                const maxPrice = this.safeNumber (filter, 'maxPrice');
                if ((maxPrice !== undefined) && (maxPrice > 0)) {
                    limitPriceMax = maxPrice;
                }
            }
            let precisionAmount = this.parseNumber (this.parsePrecision (this.safeString (market, 'baseAssetPrecision')));
            let limitAmount = {
                'min': undefined,
                'max': undefined,
            };
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'LOT_SIZE', {});
                precisionAmount = this.safeNumber (filter, 'stepSize');
                limitAmount = {
                    'min': this.safeNumber (filter, 'minQty'),
                    'max': this.safeNumber (filter, 'maxQty'),
                };
            }
            let limitMarket = {
                'min': undefined,
                'max': undefined,
            };
            if ('MARKET_LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'MARKET_LOT_SIZE', {});
                limitMarket = {
                    'min': this.safeNumber (filter, 'minQty'),
                    'max': this.safeNumber (filter, 'maxQty'),
                };
            }
            let costMin = undefined;
            if ('MIN_NOTIONAL' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'MIN_NOTIONAL', {});
                costMin = this.safeNumber (filter, 'minNotional');
            }
            const isContract = swap || futures;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': futures,
                'option': false,
                'active': active,
                'contract': isContract,
                'linear': isContract ? true : undefined,
                'inverse': undefined,
                'taker': this.parseNumber (takerFee),
                'maker': this.parseNumber (makerFee),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': precisionAmount,
                    'price': precisionPrice,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': limitAmount,
                    'market': limitMarket,
                    'price': {
                        'min': limitPriceMin,
                        'max': limitPriceMax,
                    },
                    'cost': {
                        'min': costMin,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetV2Account (params);
        //
        //     {
        //         "makerCommission": "0.20",
        //         "takerCommission": "0.20",
        //         "buyerCommission": "0.20",
        //         "sellerCommission": "0.20",
        //         "canTrade": true,
        //         "canWithdraw": true,
        //         "canDeposit": true,
        //         "updateTime": "1645266330",
        //         "userId": "644722",
        //         "balances": [
        //             {
        //                 "accountId": "120702016179403605",
        //                 "collateralCurrency": false,
        //                 "asset": "CAKE",
        //                 "free": "3.1",
        //                 "locked": "0.0",
        //                 "default": false,
        //             },
        //             {
        //                 "accountId": "109698017713125316",
        //                 "collateralCurrency": true,
        //                 "asset": "USD",
        //                 "free": "17.58632",
        //                 "locked": "0.0",
        //                 "default": true,
        //             }
        //         ]
        //     }
        //
        const accounts = this.safeValue (response, 'balances', []);
        const result = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const accountId = this.safeInteger (account, 'accountId');
            const currencyId = this.safeString (account, 'asset');
            const currencyCode = this.safeCurrencyCode (currencyId);
            result.push ({
                'id': accountId,
                'type': undefined,
                'currency': currencyCode,
                'info': account,
            });
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetV2Account (params);
        //
        //    {
        //        makerCommission: '0.20',
        //        takerCommission: '0.20',
        //        buyerCommission: '0.20',
        //        sellerCommission: '0.20',
        //        canTrade: true,
        //        canWithdraw: true,
        //        canDeposit: true,
        //        updateTime: '1645738976',
        //        userId: '-1924114235',
        //        balances: []
        //    }
        //
        const makerFee = this.safeNumber (response, 'makerCommission');
        const takerFee = this.safeNumber (response, 'takerCommission');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': makerFee,
                'taker': takerFee,
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    parseBalance (response, type = undefined) {
        //
        //     {
        //         "makerCommission":0.20,
        //         "takerCommission":0.20,
        //         "buyerCommission":0.20,
        //         "sellerCommission":0.20,
        //         "canTrade":true,
        //         "canWithdraw":true,
        //         "canDeposit":true,
        //         "updateTime":1591056268,
        //         "balances":[
        //             {
        //                 "accountId":5470306579272368,
        //                 "collateralCurrency":true,
        //                 "asset":"ETH",
        //                 "free":0.0,
        //                 "locked":0.0,
        //                 "default":false,
        //             },
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetV2Account (params);
        //
        //     {
        //         "makerCommission": "0.20",
        //         "takerCommission": "0.20",
        //         "buyerCommission": "0.20",
        //         "sellerCommission": "0.20",
        //         "canTrade": true,
        //         "canWithdraw": true,
        //         "canDeposit": true,
        //         "updateTime": "1645266330",
        //         "userId": "644722",
        //         "balances": [
        //             {
        //                 "accountId": "120702016179403605",
        //                 "collateralCurrency": false,
        //                 "asset": "CAKE",
        //                 "free": "1.784",
        //                 "locked": "0.0",
        //                 "default": false,
        //             },
        //             {
        //                 "accountId": "109698017413175316",
        //                 "collateralCurrency": true,
        //                 "asset": "USD",
        //                 "free": "7.58632",
        //                 "locked": "0.0",
        //                 "default": true,
        //             }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000, valid limits 5, 10, 20, 50, 100, 500, 1000, 5000
        }
        const response = await this.publicGetV2Depth (this.extend (request, params));
        //
        //     {
        //         "lastUpdateId":1590999849037,
        //         "asks":[
        //             [0.02495,60.0345],
        //             [0.02496,34.1],
        //             ...
        //         ],
        //         "bids":[
        //             [0.02487,72.4144854],
        //             [0.02486,24.043],
        //             ...
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "symbol":"ETH/BTC",
        //         "priceChange":"0.00030",
        //         "priceChangePercent":"1.21",
        //         "weightedAvgPrice":"0.02481",
        //         "prevClosePrice":"0.02447",
        //         "lastPrice":"0.02477",
        //         "lastQty":"60.0",
        //         "bidPrice":"0.02477",
        //         "askPrice":"0.02484",
        //         "openPrice":"0.02447",
        //         "highPrice":"0.02524",
        //         "lowPrice":"0.02438",
        //         "volume":"11.97",
        //         "quoteVolume":"0.298053",
        //         "openTime":1590969600000,
        //         "closeTime":1591000072693
        //     }
        //
        // fetchTickers
        //
        //     {
        //          "symbol": "SHIB/USD_LEVERAGE",
        //          "weightedAvgPrice": "0.000027595",
        //          "lastPrice": "0.00002737",
        //          "lastQty": "1.11111111E8",
        //          "bidPrice": "0.00002737",
        //          "askPrice": "0.00002782",
        //          "highPrice": "0.00002896",
        //          "lowPrice": "0.00002738",
        //          "volume": "16472160000",
        //          "quoteVolume": "454796.3376",
        //          "openTime": "1645187472000",
        //          "closeTime": "1645273872000",
        //     }
        //
        // ws:marketData.subscribe
        //
        //     {
        //          "symbolName":"TXN",
        //          "bid":139.85,
        //          "bidQty":2500,
        //          "ofr":139.92000000000002,
        //          "ofrQty":2500,
        //          "timestamp":1597850971558
        //      }
        //
        const timestamp = this.safeInteger2 (ticker, 'closeTime', 'timestamp');
        const marketId = this.safeString2 (ticker, 'symbol', 'symbolName');
        market = this.safeMarket (marketId, market, '/');
        const last = this.safeString (ticker, 'lastPrice');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': this.safeString2 (ticker, 'bidPrice', 'bid'),
            'bidVolume': this.safeString (ticker, 'bidQty'),
            'ask': this.safeString2 (ticker, 'askPrice', 'ofr'),
            'askVolume': this.safeString (ticker, 'ofrQty'),
            'vwap': this.safeString (ticker, 'weightedAvgPrice'),
            'open': this.safeString (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2Ticker24hr (this.extend (request, params));
        //
        //     {
        //         "symbol":"ETH/BTC",
        //         "priceChange":"0.00030",
        //         "priceChangePercent":"1.21",
        //         "weightedAvgPrice":"0.02481",
        //         "prevClosePrice":"0.02447",
        //         "lastPrice":"0.02477",
        //         "lastQty":"60.0",
        //         "bidPrice":"0.02477",
        //         "askPrice":"0.02484",
        //         "openPrice":"0.02447",
        //         "highPrice":"0.02524",
        //         "lowPrice":"0.02438",
        //         "volume":"11.97",
        //         "quoteVolume":"0.298053",
        //         "openTime":1590969600000,
        //         "closeTime":1591000072693
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetV2Ticker24hr (params);
        //
        //     [
        //         {
        //              "symbol": "SHIB/USD_LEVERAGE",
        //              "weightedAvgPrice": "0.000027595",
        //              "lastPrice": "0.00002737",
        //              "lastQty": "1.11111111E8",
        //              "bidPrice": "0.00002737",
        //              "askPrice": "0.00002782",
        //              "highPrice": "0.00002896",
        //              "lowPrice": "0.00002738",
        //              "volume": "16472160000",
        //              "quoteVolume": "454796.3376",
        //              "openTime": "1645187472000",
        //              "closeTime": "1645273872000",
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1590971040000,
        //         "0.02454",
        //         "0.02456",
        //         "0.02452",
        //         "0.02456",
        //         249
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.publicGetV2Klines (this.extend (request, params));
        //
        //     [
        //         [1590971040000,"0.02454","0.02456","0.02452","0.02456",249],
        //         [1590971100000,"0.02455","0.02457","0.02452","0.02456",300],
        //         [1590971160000,"0.02455","0.02456","0.02453","0.02454",286],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public aggregate trades)
        //
        //     {
        //         "a":"1658318071",    // Aggregate tradeId
        //         "p":"0.02476",       // Price
        //         "q":"0.0",           // Official doc says: "Quantity (should be ignored)"
        //         "T":"1591001423382", // Epoch timestamp in MS
        //         "m":false            // Was the buyer the maker
        //     }
        //
        // createOrder fills (private)
        //
        //     {
        //         "price": "9807.05",
        //         "qty": "0.01",
        //         "commission": "0",
        //         "commissionAsset": "dUSD"
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "symbol": "DOGE/USD",
        //         "id": "116046000",
        //         "orderId": "00000000-0000-0000-0000-000006dbb8ad",
        //         "price": "0.14094",
        //         "qty": "40.0",
        //         "commission": "0.01",
        //         "commissionAsset": "USD",
        //         "time": "1645283022351",
        //         "buyer": false,
        //         "maker": false,
        //         "isBuyer": false,
        //         "isMaker": false
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const priceString = this.safeString2 (trade, 'p', 'price');
        const amountString = this.safeString2 (trade, 'q', 'qty');
        const id = this.safeString2 (trade, 'a', 'id');
        let side = undefined;
        const orderId = this.safeString (trade, 'orderId');
        let takerOrMaker = undefined;
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally [TODO: needs reason to be mentioned]
            takerOrMaker = 'taker'; // in public trades, it's always taker
        } else if ('isBuyer' in trade) {
            side = (trade['isBuyer']) ? 'buy' : 'sell'; // this is a true side
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAsset')),
            };
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'limit': 500, // default 500, max 1000
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.publicGetV2AggTrades (this.extend (request, params));
        //
        // [
        //     {
        //         "a":"1658318071",    // Aggregate tradeId
        //         "p":"0.02476",       // Price
        //         "q":"0.0",           // Official doc says: "Quantity (should be ignored)"
        //         "T":"1591001423382", // Epoch timestamp in MS
        //         "m":false            // Was the buyer the maker
        //     },
        // ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        // limit
        //
        //     {
        //         "symbol": "BTC/USD",
        //         "orderId": "00000000-0000-0000-0000-000006eacaa0",
        //         "transactTime": "1645281669295",
        //         "price": "30000.00000000",
        //         "origQty": "0.0002",
        //         "executedQty": "0.0",  // positive for BUY, negative for SELL
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //     }
        //
        // market
        //
        //     {
        //         "symbol": "DOGE/USD",
        //         "orderId": "00000000-0000-0000-0000-000006eab2ad",
        //         "transactTime": "1645283022252",
        //         "price": "0.14066000",
        //         "origQty": "40",
        //         "executedQty": "40.0",  // positive for BUY, negative for SELL
        //         "status": "FILLED",
        //         "timeInForce": "FOK",
        //         "type": "MARKET",
        //         "side": "SELL",
        //         "fills": [
        //             {
        //                 "price": "0.14094",
        //                 "qty": "40.0",
        //                 "commission": "0",
        //                 "commissionAsset": "dUSD",
        //             },
        //         ],
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "symbol": "DOGE/USD",
        //         "orderId": "00000000-0000-0003-0000-000006db714c",
        //         "price": "0.13",
        //         "origQty": "30.0",
        //         "executedQty": "0.0",
        //         "status": "CANCELED",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //     }
        //
        // fetchOpenOrders
        //
        //   {
        //       "symbol": "DOGE/USD",
        //       "orderId": "00000000-0000-0003-0000-000004bcc27a",
        //       "price": "0.13",
        //       "origQty": "39.0",
        //       "executedQty": "0.0",
        //       "status": "NEW",
        //       "timeInForce": "GTC",
        //       "type": "LIMIT",
        //       "side": "BUY",
        //       "time": "1645284216240",
        //       "updateTime": "1645284216240",
        //       "leverage": false, // whether it's swap or not
        //       "working": true,
        //   }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '/');
        const id = this.safeString (order, 'orderId');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'origQty');
        const filledRaw = this.safeString (order, 'executedQty');
        const filled = Precise.stringAbs (filledRaw);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timeInForce = this.parseOrderTimeInForce (this.safeString (order, 'timeInForce'));
        const type = this.parseOrderType (this.safeString (order, 'type'));
        const side = this.parseOrderSide (this.safeString (order, 'side'));
        const timestamp = this.safeInteger2 (order, 'time', 'transactTime');
        const fills = this.safeValue (order, 'fills');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'STOP': 'stop',
            // temporarily we remove custom mappings
            // 'LIMIT_MAKER': '',
            // 'STOP_LOSS': 'stop-loss',
            // 'STOP_LOSS_LIMIT': 'stop-limit',
            // 'TAKE_PROFIT': 'take-profit',
            // 'TAKE_PROFIT_LIMIT': 'take-profit',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTimeInForce (status) {
        const statuses = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (status) {
        const statuses = {
            'BUY': 'buy',
            'SELL': 'sell',
        };
        return this.safeString (statuses, status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let accountId = undefined;
        if (market['margin']) {
            accountId = this.safeString (this.options, 'accountId');
            accountId = this.safeString (params, 'accountId', accountId);
            if (accountId === undefined) {
                throw new ArgumentsRequired (this.id + " createOrder() requires an accountId parameter or an exchange.options['accountId'] option for " + market['type'] + ' markets');
            }
        }
        const newOrderRespType = this.safeValue (this.options['newOrderRespType'], type, 'RESULT');
        const request = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'newOrderRespType': newOrderRespType, // 'RESULT' for full order or 'FULL' for order with fills
            // 'leverage': 1,
            // 'accountId': 5470306579272968, // required for leverage markets
            // 'takeProfit': '123.45',
            // 'stopLoss': '54.321',
            // 'guaranteedStopLoss': '54.321',
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['timeInForce'] = this.options['defaultTimeInForce'];
        } else {
            if (type === 'stop') {
                request['type'] = 'STOP';
                request['price'] = this.priceToPrecision (symbol, price);
            } else if (type === 'market') {
                const stopPrice = this.safeNumber (params, 'stopPrice');
                params = this.omit (params, 'stopPrice');
                if (stopPrice !== undefined) {
                    request['type'] = 'STOP';
                    request['price'] = this.priceToPrecision (symbol, stopPrice);
                }
            }
        }
        const response = await this.privatePostV2Order (this.extend (request, params));
        //
        // limit
        //
        //     {
        //         "symbol": "BTC/USD",
        //         "orderId": "00000000-0000-0000-0000-000006eaaaa0",
        //         "transactTime": "1645281669295",
        //         "price": "30000.00000000",
        //         "origQty": "0.0002",
        //         "executedQty": "0.0",  // positive for BUY, negative for SELL
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //     }
        //
        // market
        //
        //     {
        //         "symbol": "DOGE/USD",
        //         "orderId": "00000000-0000-0000-0000-000006eab8ad",
        //         "transactTime": "1645283022252",
        //         "price": "0.14066000",
        //         "origQty": "40",
        //         "executedQty": "40.0",  // positive for BUY, negative for SELL
        //         "status": "FILLED",
        //         "timeInForce": "FOK",
        //         "type": "MARKET",
        //         "side": "BUY",
        //         "fills": [
        //             {
        //                 "price": "0.14094",
        //                 "qty": "40.0",
        //                 "commission": "0",
        //                 "commissionAsset": "dUSD"
        //             }
        //         ]
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            const symbols = this.symbols;
            const numSymbols = symbols.length;
            const fetchOpenOrdersRateLimit = parseInt (numSymbols / 2);
            throw new ExchangeError (this.id + ' fetchOpenOrders() WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString () + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        }
        const response = await this.privateGetV2OpenOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "DOGE/USD",
        //             "orderId": "00000000-0000-0003-0000-000004bac57a",
        //             "price": "0.13",
        //             "origQty": "39.0",
        //             "executedQty": "0.0",  // positive for BUY, negative for SELL
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "time": "1645284216240",
        //             "updateTime": "1645284216240",
        //             "leverage": false,
        //             "working": true
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit, params);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const origClientOrderId = this.safeValue (params, 'origClientOrderId');
        const request = {
            'symbol': market['id'],
            // 'orderId': parseInt (id),
            // 'origClientOrderId': id,
        };
        if (origClientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['origClientOrderId'] = origClientOrderId;
        }
        const response = await this.privateDeleteV2Order (this.extend (request, params));
        //
        //     {
        //         "symbol": "DOGE/USD",
        //         "orderId": "00000000-0000-0003-0000-000006db764c",
        //         "price": "0.13",
        //         "origQty": "30.0",
        //         "executedQty": "0.0",  // positive for BUY, negative for SELL
        //         "status": "CANCELED",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2MyTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "DOGE/USD",
        //             "id": "116046000",
        //             "orderId": "00000000-0000-0000-0000-000006dbb8ad",
        //             "price": "0.14094",
        //             "qty": "40.0",
        //             "commission": "0.01",
        //             "commissionAsset": "USD",
        //             "time": "1645283022351",
        //             "buyer": false,
        //             "maker": false,
        //             "isBuyer": false,
        //             "isMaker": false
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByMethod ('privateGetV2Deposits', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByMethod ('privateGetV2Withdrawals', code, since, limit, params);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByMethod ('privateGetV2Transactions', code, since, limit, params);
    }

    async fetchTransactionsByMethod (method, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //       {
        //         "id": "616769213",
        //         "balance": "2.088",
        //         "amount": "1.304",   // negative for 'withdrawal'
        //         "currency": "CAKE",
        //         "type": "deposit",
        //         "timestamp": "1645282121023",
        //         "paymentMethod": "BLOCKCHAIN",
        //         "blockchainTransactionHash": "0x57c68c1f2ae74d5eda5a2a00516361d241a5c9e1ee95bf32573523857c38c112",
        //         "status": "PROCESSED",
        //         "commission": "0.14", // this property only exists in withdrawal
        //       },
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const txHash = this.safeString (transaction, 'blockchainTransactionHash');
        const amount = this.safeNumber (transaction, 'amount');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const state = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        const feeCost = this.safeString (transaction, 'commission');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const result = {
            'id': id,
            'txid': txHash,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': state,
            'updated': undefined,
            'comment': undefined,
            'fee': fee,
            'info': transaction,
        };
        return result;
    }

    parseTransactionStatus (status) {
        const statuses = {
            'APPROVAL': 'pending',
            'PROCESSED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'deposit': 'deposit',
            'withdrawal': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2Ledger (this.extend (request, params));
        // in the below example, first item expresses withdrawal/deposit type, second example expresses trade
        //
        // [
        //     {
        //       "id": "619031398",
        //       "balance": "0.0",
        //       "amount": "-1.088",
        //       "currency": "CAKE",
        //       "type": "withdrawal",
        //       "timestamp": "1645460496425",
        //       "commission": "0.13",
        //       "paymentMethod": "BLOCKCHAIN", // present in withdrawal/deposit
        //       "blockchainTransactionHash": "0x400ac905557c3d34638b1c60eba110b3ee0f97f4eb0f7318015ab76e7f16b7d6", // present in withdrawal/deposit
        //       "status": "PROCESSED"
        //     },
        //     {
        //       "id": "619031034",
        //       "balance": "8.17223588",
        //       "amount": "-0.01326294",
        //       "currency": "USD",
        //       "type": "exchange_commission",
        //       "timestamp": "1645460461235",
        //       "commission": "0.01326294",
        //       "status": "PROCESSED"
        //     },
        // ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
        const id = this.safeString (item, 'id');
        const amountString = this.safeString (item, 'amount');
        const amount = Precise.stringAbs (amountString);
        const timestamp = this.safeInteger (item, 'timestamp');
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const feeCost = this.safeString (item, 'commission');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const direction = Precise.stringLt (amountString, '0') ? 'out' : 'in';
        const result = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': this.safeString (item, 'blockchainTransactionHash'),
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': this.safeString (item, 'balance'),
            'status': this.parseLedgerEntryStatus (this.safeString (item, 'status')),
            'fee': fee,
            'info': item,
        };
        return result;
    }

    parseLedgerEntryStatus (status) {
        const statuses = {
            'APPROVAL': 'pending',
            'PROCESSED': 'ok',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseLedgerEntryType (type) {
        const types = {
            'deposit': 'transaction',
            'withdrawal': 'transaction',
            'exchange_commission': 'fee',
        };
        return this.safeString (types, type, type);
    }

    async fetchLeverage (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetV2LeverageSettings (this.extend (request, params));
        //
        // {
        //     "values": [ 1, 2, 5, 10, ],
        //     "value": "10",
        // }
        //
        return this.safeNumber (response, 'value');
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetV2DepositAddress (this.extend (request, params));
        //
        //     { "address":"0x97d64eb014ac779194991e7264f01c74c90327f0" }
        //
        return this.parseDepositAddress (response, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        currency = this.safeCurrency (undefined, currency);
        return {
            'currency': currency['code'],
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': depositAddress,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (path === 'historicalTrades') {
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        url = this.implodeHostname (url);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetV2TradingPositions (params);
        //
        // {
        //     "positions": [
        //       {
        //         "accountId": "109698017416453793",
        //         "id": "00a18490-0079-54c4-0000-0000803e73d3",
        //         "instrumentId": "45463225268524228",
        //         "orderId": "00a18490-0079-54c4-0000-0000803e73d2",
        //         "openQuantity": "13.6",
        //         "openPrice": "0.75724",
        //         "closeQuantity": "0.0",
        //         "closePrice": "0",
        //         "rpl": "-0.007723848",
        //         "rplConverted": "0",
        //         "upl": "-0.006664",
        //         "uplConverted": "-0.006664",
        //         "swap": "0",
        //         "swapConverted": "0",
        //         "fee": "-0.007723848",
        //         "dividend": "0",
        //         "margin": "0.2",
        //         "state": "ACTIVE",
        //         "currency": "USD",
        //         "createdTimestamp": "1645473877236",
        //         "openTimestamp": "1645473877193",
        //         "type": "NET",
        //         "cost": "2.0583600",
        //         "symbol": "XRP/USD_LEVERAGE"
        //       }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'positions', []);
        return this.parsePositions (data);
    }

    parsePositions (positions) {
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push (this.parsePosition (positions[i]));
        }
        return result;
    }

    parsePosition (position, market = undefined) {
        market = this.safeMarket (this.safeString (position, 'symbol'), market);
        const symbol = market['symbol'];
        const timestamp = this.safeNumber (position, 'createdTimestamp');
        const quantityRaw = this.safeString (position, 'openQuantity');
        const side = Precise.stringGt (quantityRaw, '0') ? 'long' : 'short';
        const quantity = Precise.stringAbs (quantityRaw);
        const entryPrice = this.safeNumber (position, 'openPrice');
        const unrealizedProfit = this.safeNumber (position, 'upl');
        const marginCoeff = this.safeString (position, 'margin');
        const leverage = Precise.stringDiv ('1', marginCoeff);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'contracts': this.parseNumber (quantity),
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'collateral': undefined,
            'side': side,
            // 'realizedProfit': this.safeNumber (position, 'rpl'),
            'unrealizedProfit': unrealizedProfit,
            'leverage': leverage,
            'percentage': undefined,
            'marginType': undefined,
            'notional': undefined,
            'markPrice': undefined,
            'liquidationPrice': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': this.parseNumber (marginCoeff),
            'maintenanceMarginPercentage': undefined,
            'marginRatio': undefined,
            'info': position,
        };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((httpCode === 418) || (httpCode === 429)) {
            throw new DDoSProtection (this.id + ' ' + httpCode.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (httpCode >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code":-1128,"msg":"Combination of optional parameters invalid."}
        //
        const errorCode = this.safeString (response, 'code');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            const message = this.safeString (response, 'msg');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
