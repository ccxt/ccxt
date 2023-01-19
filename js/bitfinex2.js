'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidAddress, ArgumentsRequired, InsufficientFunds, AuthenticationError, OrderNotFound, InvalidOrder, BadRequest, InvalidNonce, BadSymbol, OnMaintenance, NotSupported, PermissionDenied, ExchangeNotAvailable } = require ('./base/errors');
const Precise = require ('./base/Precise');
const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class bitfinex2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex2',
            'name': 'Bitfinex',
            'countries': [ 'VG' ],
            'version': 'v2',
            'certified': false,
            'pro': false,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': undefined,
                'fetchBalance': true,
                'fetchClosedOrder': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchStatus': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFees': undefined,
                'fetchTransactions': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            // cheapest endpoint is 240 requests per minute => ~ 4 requests per second => ( 1000ms / 4 ) = 250ms between requests on average
            'rateLimit': 250,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': {
                    'v1': 'https://api.bitfinex.com',
                    'public': 'https://api-pub.bitfinex.com',
                    'private': 'https://api.bitfinex.com',
                },
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://docs.bitfinex.com/v2/docs/',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
                'fees': 'https://www.bitfinex.com/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'conf/{config}': 2.66, // 90 requests a minute
                        'conf/pub:{action}:{object}': 2.66,
                        'conf/pub:{action}:{object}:{detail}': 2.66,
                        'conf/pub:map:{object}': 2.66,
                        'conf/pub:map:{object}:{detail}': 2.66,
                        'conf/pub:map:currency:{detail}': 2.66,
                        'conf/pub:map:currency:sym': 2.66, // maps symbols to their API symbols, BAB > BCH
                        'conf/pub:map:currency:label': 2.66, // verbose friendly names, BNT > Bancor
                        'conf/pub:map:currency:unit': 2.66, // maps symbols to unit of measure where applicable
                        'conf/pub:map:currency:undl': 2.66, // maps derivatives symbols to their underlying currency
                        'conf/pub:map:currency:pool': 2.66, // maps symbols to underlying network/protocol they operate on
                        'conf/pub:map:currency:explorer': 2.66, // maps symbols to their recognised block explorer URLs
                        'conf/pub:map:currency:tx:fee': 2.66, // maps currencies to their withdrawal fees https://github.com/ccxt/ccxt/issues/7745
                        'conf/pub:map:tx:method': 2.66,
                        'conf/pub:list:{object}': 2.66,
                        'conf/pub:list:{object}:{detail}': 2.66,
                        'conf/pub:list:currency': 2.66,
                        'conf/pub:list:pair:exchange': 2.66,
                        'conf/pub:list:pair:margin': 2.66,
                        'conf/pub:list:pair:futures': 2.66,
                        'conf/pub:list:competitions': 2.66,
                        'conf/pub:info:{object}': 2.66,
                        'conf/pub:info:{object}:{detail}': 2.66,
                        'conf/pub:info:pair': 2.66,
                        'conf/pub:info:pair:futures': 2.66,
                        'conf/pub:info:tx:status': 2.66, // [ deposit, withdrawal ] statuses 1 = active, 0 = maintenance
                        'conf/pub:fees': 2.66,
                        'platform/status': 8, // 30 requests per minute = 0.5 requests per second => ( 1000ms / rateLimit ) / 0.5 = 8
                        'tickers': 2.66, // 90 requests a minute = 1.5 requests per second => ( 1000 / rateLimit ) / 1.5 = 2.666666666
                        'ticker/{symbol}': 2.66,
                        'tickers/hist': 2.66,
                        'trades/{symbol}/hist': 2.66,
                        'book/{symbol}/{precision}': 1, // 240 requests a minute
                        'book/{symbol}/P0': 1,
                        'book/{symbol}/P1': 1,
                        'book/{symbol}/P2': 1,
                        'book/{symbol}/P3': 1,
                        'book/{symbol}/R0': 1,
                        'stats1/{key}:{size}:{symbol}:{side}/{section}': 2.66,
                        'stats1/{key}:{size}:{symbol}:{side}/last': 2.66,
                        'stats1/{key}:{size}:{symbol}:{side}/hist': 2.66,
                        'stats1/{key}:{size}:{symbol}/{section}': 2.66,
                        'stats1/{key}:{size}:{symbol}/last': 2.66,
                        'stats1/{key}:{size}:{symbol}/hist': 2.66,
                        'stats1/{key}:{size}:{symbol}:long/last': 2.66,
                        'stats1/{key}:{size}:{symbol}:long/hist': 2.66,
                        'stats1/{key}:{size}:{symbol}:short/last': 2.66,
                        'stats1/{key}:{size}:{symbol}:short/hist': 2.66,
                        'candles/trade:{timeframe}:{symbol}:{period}/{section}': 2.66,
                        'candles/trade:{timeframe}:{symbol}/{section}': 2.66,
                        'candles/trade:{timeframe}:{symbol}/last': 2.66,
                        'candles/trade:{timeframe}:{symbol}/hist': 2.66,
                        'status/{type}': 2.66,
                        'status/deriv': 2.66,
                        'liquidations/hist': 80, // 3 requests a minute = 0.05 requests a second => ( 1000ms / rateLimit ) / 0.05 = 80
                        'rankings/{key}:{timeframe}:{symbol}/{section}': 2.66,
                        'rankings/{key}:{timeframe}:{symbol}/hist': 2.66,
                        'pulse/hist': 2.66,
                        'pulse/profile/{nickname}': 2.66,
                        'funding/stats/{symbol}/hist': 10, // ratelimit not in docs
                    },
                    'post': {
                        'calc/trade/avg': 2.66,
                        'calc/fx': 2.66,
                    },
                },
                'private': {
                    'post': {
                        // 'auth/r/orders/{symbol}/new', // outdated
                        // 'auth/r/stats/perf:{timeframe}/hist', // outdated
                        'auth/r/wallets': 2.66,
                        'auth/r/wallets/hist': 2.66,
                        'auth/r/orders': 2.66,
                        'auth/r/orders/{symbol}': 2.66,
                        'auth/w/order/submit': 2.66,
                        'auth/w/order/update': 2.66,
                        'auth/w/order/cancel': 2.66,
                        'auth/w/order/multi': 2.66,
                        'auth/w/order/cancel/multi': 2.66,
                        'auth/r/orders/{symbol}/hist': 2.66,
                        'auth/r/orders/hist': 2.66,
                        'auth/r/order/{symbol}:{id}/trades': 2.66,
                        'auth/r/trades/{symbol}/hist': 2.66,
                        'auth/r/trades/hist': 2.66,
                        'auth/r/ledgers/{currency}/hist': 2.66,
                        'auth/r/ledgers/hist': 2.66,
                        'auth/r/info/margin/{key}': 2.66,
                        'auth/r/info/margin/base': 2.66,
                        'auth/r/info/margin/sym_all': 2.66,
                        'auth/r/positions': 2.66,
                        'auth/w/position/claim': 2.66,
                        'auth/w/position/increase:': 2.66,
                        'auth/r/position/increase/info': 2.66,
                        'auth/r/positions/hist': 2.66,
                        'auth/r/positions/audit': 2.66,
                        'auth/r/positions/snap': 2.66,
                        'auth/w/deriv/collateral/set': 2.66,
                        'auth/w/deriv/collateral/limits': 2.66,
                        'auth/r/funding/offers': 2.66,
                        'auth/r/funding/offers/{symbol}': 2.66,
                        'auth/w/funding/offer/submit': 2.66,
                        'auth/w/funding/offer/cancel': 2.66,
                        'auth/w/funding/offer/cancel/all': 2.66,
                        'auth/w/funding/close': 2.66,
                        'auth/w/funding/auto': 2.66,
                        'auth/w/funding/keep': 2.66,
                        'auth/r/funding/offers/{symbol}/hist': 2.66,
                        'auth/r/funding/offers/hist': 2.66,
                        'auth/r/funding/loans': 2.66,
                        'auth/r/funding/loans/hist': 2.66,
                        'auth/r/funding/loans/{symbol}': 2.66,
                        'auth/r/funding/loans/{symbol}/hist': 2.66,
                        'auth/r/funding/credits': 2.66,
                        'auth/r/funding/credits/hist': 2.66,
                        'auth/r/funding/credits/{symbol}': 2.66,
                        'auth/r/funding/credits/{symbol}/hist': 2.66,
                        'auth/r/funding/trades/{symbol}/hist': 2.66,
                        'auth/r/funding/trades/hist': 2.66,
                        'auth/r/info/funding/{key}': 2.66,
                        'auth/r/info/user': 2.66,
                        'auth/r/summary': 2.66,
                        'auth/r/logins/hist': 2.66,
                        'auth/r/permissions': 2.66,
                        'auth/w/token': 2.66,
                        'auth/r/audit/hist': 2.66,
                        'auth/w/transfer': 2.66, // ratelimit not in docs...
                        'auth/w/deposit/address': 24, // 10 requests a minute = 0.166 requests per second => ( 1000ms / rateLimit ) / 0.166 = 24
                        'auth/w/deposit/invoice': 24, // ratelimit not in docs
                        'auth/w/withdraw': 24, // ratelimit not in docs
                        'auth/r/movements/{currency}/hist': 2.66,
                        'auth/r/movements/hist': 2.66,
                        'auth/r/alerts': 5.33, // 45 requests a minute = 0.75 requests per second => ( 1000ms / rateLimit ) / 0.75 => 5.33
                        'auth/w/alert/set': 2.66,
                        'auth/w/alert/price:{symbol}:{price}/del': 2.66,
                        'auth/w/alert/{type}:{symbol}:{price}/del': 2.66,
                        'auth/calc/order/avail': 2.66,
                        'auth/w/settings/set': 2.66,
                        'auth/r/settings': 2.66,
                        'auth/w/settings/del': 2.66,
                        'auth/r/pulse/hist': 2.66,
                        'auth/w/pulse/add': 16, // 15 requests a minute = 0.25 requests per second => ( 1000ms / rateLimit ) / 0.25 => 16
                        'auth/w/pulse/del': 2.66,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'percentage': true,
                    'tierBased': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('7500000'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('20000000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.001') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('7500000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('20000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'options': {
                'precision': 'R0', // P0, P1, P2, P3, P4, R0
                // convert 'EXCHANGE MARKET' to lowercase 'market'
                // convert 'EXCHANGE LIMIT' to lowercase 'limit'
                // everything else remains uppercase
                'exchangeTypes': {
                    // 'MARKET': undefined,
                    'EXCHANGE MARKET': 'market',
                    // 'LIMIT': undefined,
                    'EXCHANGE LIMIT': 'limit',
                    // 'STOP': undefined,
                    'EXCHANGE STOP': 'market',
                    // 'TRAILING STOP': undefined,
                    // 'EXCHANGE TRAILING STOP': undefined,
                    // 'FOK': undefined,
                    'EXCHANGE FOK': 'limit',
                    // 'STOP LIMIT': undefined,
                    'EXCHANGE STOP LIMIT': 'limit',
                    // 'IOC': undefined,
                    'EXCHANGE IOC': 'limit',
                },
                // convert 'market' to 'EXCHANGE MARKET'
                // convert 'limit' 'EXCHANGE LIMIT'
                // everything else remains as is
                'orderTypes': {
                    'market': 'EXCHANGE MARKET',
                    'limit': 'EXCHANGE LIMIT',
                },
                'fiat': {
                    'USD': 'USD',
                    'EUR': 'EUR',
                    'JPY': 'JPY',
                    'GBP': 'GBP',
                    'CHN': 'CHN',
                },
                // actually the correct names unlike the v1
                // we don't want to extend this with accountsByType in v1
                'v2AccountsByType': {
                    'spot': 'exchange',
                    'exchange': 'exchange',
                    'funding': 'funding',
                    'margin': 'margin',
                    'derivatives': 'margin',
                    'future': 'margin',
                },
            },
            'exceptions': {
                'exact': {
                    '10001': PermissionDenied, // api_key: permission invalid (#10001)
                    '10020': BadRequest,
                    '10100': AuthenticationError,
                    '10114': InvalidNonce,
                    '20060': OnMaintenance,
                    // {"code":503,"error":"temporarily_unavailable","error_description":"Sorry, the service is temporarily unavailable. See https://www.bitfinex.com/ for more info."}
                    'temporarily_unavailable': ExchangeNotAvailable,
                },
                'broad': {
                    'address': InvalidAddress,
                    'available balance is only': InsufficientFunds,
                    'not enough exchange balance': InsufficientFunds,
                    'Order not found': OrderNotFound,
                    'symbol: invalid': BadSymbol,
                    'Invalid order': InvalidOrder,
                },
            },
            'commonCurrencies': {
                'UST': 'USDT',
                'EUTF0': 'EURT',
                'USTF0': 'USDT',
                'ALG': 'ALGO', // https://github.com/ccxt/ccxt/issues/6034
                'AMP': 'AMPL',
                'ATO': 'ATOM', // https://github.com/ccxt/ccxt/issues/5118
                'BCHABC': 'XEC',
                'BCHN': 'BCH',
                'DAT': 'DATA',
                'DOG': 'MDOGE',
                'DSH': 'DASH',
                'EDO': 'PNT',
                'EUS': 'EURS',
                'EUT': 'EURT',
                'IDX': 'ID',
                'IOT': 'IOTA',
                'IQX': 'IQ',
                'LUNA': 'LUNC',
                'LUNA2': 'LUNA',
                'MNA': 'MANA',
                'ORS': 'ORS Group', // conflict with Origin Sport #3230
                'PAS': 'PASS',
                'QSH': 'QASH',
                'QTM': 'QTUM',
                'RBT': 'RBTC',
                'SNG': 'SNGLS',
                'STJ': 'STORJ',
                'TERRAUST': 'USTC',
                'TSD': 'TUSD',
                'YGG': 'YEED', // conflict with Yield Guild Games
                'YYW': 'YOYOW',
                'UDC': 'USDC',
                'VSY': 'VSYS',
                'WAX': 'WAXP',
                'XCH': 'XCHF',
                'ZBT': 'ZB',
            },
        });
    }

    isFiat (code) {
        return (code in this.options['fiat']);
    }

    getCurrencyId (code) {
        return 'f' + code;
    }

    getCurrencyName (code) {
        // temporary fix for transpiler recognition, even though this is in parent class
        if (code in this.options['currencyNames']) {
            return this.options['currencyNames'][code];
        }
        throw new NotSupported (this.id + ' ' + code + ' not supported for withdrawal');
    }

    amountToPrecision (symbol, amount) {
        // https://docs.bitfinex.com/docs/introduction#amount-precision
        // The amount field allows up to 8 decimals.
        // Anything exceeding this will be rounded to the 8th decimal.
        symbol = this.safeSymbol (symbol);
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    priceToPrecision (symbol, price) {
        symbol = this.safeSymbol (symbol);
        price = this.decimalToPrecision (price, ROUND, this.markets[symbol]['precision']['price'], this.precisionMode);
        // https://docs.bitfinex.com/docs/introduction#price-precision
        // The precision level of all trading prices is based on significant figures.
        // All pairs on Bitfinex use up to 5 significant digits and up to 8 decimals (e.g. 1.2345, 123.45, 1234.5, 0.00012345).
        // Prices submit with a precision larger than 5 will be cut by the API.
        return this.decimalToPrecision (price, TRUNCATE, 8, DECIMAL_PLACES);
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
        //
        //    [1] // operative
        //    [0] // maintenance
        //
        const response = await this.publicGetPlatformStatus (params);
        const statusRaw = this.safeString (response, 0);
        return {
            'status': this.safeString ({ '0': 'maintenance', '1': 'ok' }, statusRaw, statusRaw),
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchMarkets
         * @description retrieves data on all markets for bitfinex2
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let spotMarketsInfo = await this.publicGetConfPubInfoPair (params);
        let futuresMarketsInfo = await this.publicGetConfPubInfoPairFutures (params);
        spotMarketsInfo = this.safeValue (spotMarketsInfo, 0, []);
        futuresMarketsInfo = this.safeValue (futuresMarketsInfo, 0, []);
        const markets = this.arrayConcat (spotMarketsInfo, futuresMarketsInfo);
        let marginIds = await this.publicGetConfPubListPairMargin (params);
        marginIds = this.safeValue (marginIds, 0, []);
        //
        //    [
        //        "1INCH:USD",
        //        [
        //           null,
        //           null,
        //           null,
        //           "2.0",
        //           "100000.0",
        //           null,
        //           null,
        //           null,
        //           null,
        //           null,
        //           null,
        //           null
        //        ]
        //    ]
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const pair = markets[i];
            const id = this.safeStringUpper (pair, 0);
            const market = this.safeValue (pair, 1, {});
            let spot = true;
            if (id.indexOf ('F0') >= 0) {
                spot = false;
            }
            const swap = !spot;
            let baseId = undefined;
            let quoteId = undefined;
            if (id.indexOf (':') >= 0) {
                const parts = id.split (':');
                baseId = parts[0];
                quoteId = parts[1];
            } else {
                baseId = id.slice (0, 3);
                quoteId = id.slice (3, 6);
            }
            let base = this.safeCurrencyCode (baseId);
            let quote = this.safeCurrencyCode (quoteId);
            const splitBase = base.split ('F0');
            const splitQuote = quote.split ('F0');
            base = this.safeString (splitBase, 0);
            quote = this.safeString (splitQuote, 0);
            let symbol = base + '/' + quote;
            baseId = this.getCurrencyId (baseId);
            quoteId = this.getCurrencyId (quoteId);
            let settle = undefined;
            if (swap) {
                settle = quote;
                symbol = symbol + ':' + settle;
            }
            const minOrderSizeString = this.safeString (market, 3);
            const maxOrderSizeString = this.safeString (market, 4);
            let margin = false;
            if (this.inArray (id, marginIds)) {
                margin = true;
            }
            result.push ({
                'id': 't' + id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': quoteId,
                'type': spot ? 'spot' : 'swap',
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': false,
                'option': false,
                'active': true,
                'contract': swap,
                'linear': swap ? true : undefined,
                'inverse': swap ? false : undefined,
                'contractSize': swap ? this.parseNumber ('1') : undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': parseInt ('8'), // https://github.com/ccxt/ccxt/issues/7310
                    'price': parseInt ('5'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.parseNumber (minOrderSizeString),
                        'max': this.parseNumber (maxOrderSizeString),
                    },
                    'price': {
                        'min': this.parseNumber ('1e-8'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const labels = [
            'pub:list:currency',
            'pub:map:currency:sym', // maps symbols to their API symbols, BAB > BCH
            'pub:map:currency:label', // verbose friendly names, BNT > Bancor
            'pub:map:currency:unit', // maps symbols to unit of measure where applicable
            'pub:map:currency:undl', // maps derivatives symbols to their underlying currency
            'pub:map:currency:pool', // maps symbols to underlying network/protocol they operate on
            'pub:map:currency:explorer', // maps symbols to their recognised block explorer URLs
            'pub:map:currency:tx:fee', // maps currencies to their withdrawal fees https://github.com/ccxt/ccxt/issues/7745,
            'pub:map:tx:method', // maps withdrawal/deposit methods to their API symbols
        ];
        const config = labels.join (',');
        const request = {
            'config': config,
        };
        const response = await this.publicGetConfConfig (this.extend (request, params));
        //
        //     [
        //
        //         a list of symbols
        //         ["AAA","ABS","ADA"],
        //
        //         // sym
        //         // maps symbols to their API symbols, BAB > BCH
        //         [
        //             [ 'BAB', 'BCH' ],
        //             [ 'CNHT', 'CNHt' ],
        //             [ 'DSH', 'DASH' ],
        //             [ 'IOT', 'IOTA' ],
        //             [ 'LES', 'LEO-EOS' ],
        //             [ 'LET', 'LEO-ERC20' ],
        //             [ 'STJ', 'STORJ' ],
        //             [ 'TSD', 'TUSD' ],
        //             [ 'UDC', 'USDC' ],
        //             [ 'USK', 'USDK' ],
        //             [ 'UST', 'USDt' ],
        //             [ 'USTF0', 'USDt0' ],
        //             [ 'XCH', 'XCHF' ],
        //             [ 'YYW', 'YOYOW' ],
        //             // ...
        //         ],
        //         // label
        //         // verbose friendly names, BNT > Bancor
        //         [
        //             [ 'BAB', 'Bitcoin Cash' ],
        //             [ 'BCH', 'Bitcoin Cash' ],
        //             [ 'LEO', 'Unus Sed LEO' ],
        //             [ 'LES', 'Unus Sed LEO (EOS)' ],
        //             [ 'LET', 'Unus Sed LEO (ERC20)' ],
        //             // ...
        //         ],
        //         // unit
        //         // maps symbols to unit of measure where applicable
        //         [
        //             [ 'IOT', 'Mi|MegaIOTA' ],
        //         ],
        //         // undl
        //         // maps derivatives symbols to their underlying currency
        //         [
        //             [ 'USTF0', 'UST' ],
        //             [ 'BTCF0', 'BTC' ],
        //             [ 'ETHF0', 'ETH' ],
        //         ],
        //         // pool
        //         // maps symbols to underlying network/protocol they operate on
        //         [
        //             [ 'SAN', 'ETH' ], [ 'OMG', 'ETH' ], [ 'AVT', 'ETH' ], [ 'EDO', 'ETH' ],
        //             [ 'ESS', 'ETH' ], [ 'ATD', 'EOS' ], [ 'ADD', 'EOS' ], [ 'MTO', 'EOS' ],
        //             [ 'PNK', 'ETH' ], [ 'BAB', 'BCH' ], [ 'WLO', 'XLM' ], [ 'VLD', 'ETH' ],
        //             [ 'BTT', 'TRX' ], [ 'IMP', 'ETH' ], [ 'SCR', 'ETH' ], [ 'GNO', 'ETH' ],
        //             // ...
        //         ],
        //         // explorer
        //         // maps symbols to their recognised block explorer URLs
        //         [
        //             [
        //                 'AIO',
        //                 [
        //                     "https://mainnet.aion.network",
        //                     "https://mainnet.aion.network/#/account/VAL",
        //                     "https://mainnet.aion.network/#/transaction/VAL"
        //                 ]
        //             ],
        //             // ...
        //         ],
        //         // fee
        //         // maps currencies to their withdrawal fees
        //         [
        //             ["AAA",[0,0]],
        //             ["ABS",[0,131.3]],
        //             ["ADA",[0,0.3]],
        //         ],
        //     ]
        //
        const indexed = {
            'sym': this.indexBy (this.safeValue (response, 1, []), 0),
            'label': this.indexBy (this.safeValue (response, 2, []), 0),
            'unit': this.indexBy (this.safeValue (response, 3, []), 0),
            'undl': this.indexBy (this.safeValue (response, 4, []), 0),
            'pool': this.indexBy (this.safeValue (response, 5, []), 0),
            'explorer': this.indexBy (this.safeValue (response, 6, []), 0),
            'fees': this.indexBy (this.safeValue (response, 7, []), 0),
        };
        const ids = this.safeValue (response, 0, []);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id.indexOf ('F0') >= 0) {
                // we get a lot of F0 currencies, skip those
                continue;
            }
            const code = this.safeCurrencyCode (id);
            const label = this.safeValue (indexed['label'], id, []);
            const name = this.safeString (label, 1);
            const pool = this.safeValue (indexed['pool'], id, []);
            const type = this.safeString (pool, 1);
            const feeValues = this.safeValue (indexed['fees'], id, []);
            const fees = this.safeValue (feeValues, 1, []);
            const fee = this.safeNumber (fees, 1);
            const undl = this.safeValue (indexed['undl'], id, []);
            const precision = '8'; // default precision, todo: fix "magic constants"
            const fid = 'f' + id;
            result[code] = {
                'id': fid,
                'uppercaseId': id,
                'code': code,
                'info': [ id, label, pool, feeValues, undl ],
                'type': type,
                'name': name,
                'active': true,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': parseInt (precision),
                'limits': {
                    'amount': {
                        'min': this.parseNumber (this.parsePrecision (precision)),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': undefined,
                    },
                },
            };
            const networks = {};
            const currencyNetworks = this.safeValue (response, 8, []);
            const cleanId = id.replace ('F0', '');
            for (let j = 0; j < currencyNetworks.length; j++) {
                const pair = currencyNetworks[j];
                const networkId = this.safeString (pair, 0);
                const currencyId = this.safeString (this.safeValue (pair, 1, []), 0);
                if (currencyId === cleanId) {
                    const network = this.safeNetwork (networkId);
                    networks[network] = {
                        'info': networkId,
                        'id': networkId.toLowerCase (),
                        'network': networkId,
                        'active': undefined,
                        'deposit': undefined,
                        'withdraw': undefined,
                        'fee': undefined,
                        'precision': undefined,
                        'limits': {
                            'withdraw': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                    };
                }
            }
            const keysNetworks = Object.keys (networks);
            const networksLength = keysNetworks.length;
            if (networksLength > 0) {
                result[code]['networks'] = networks;
            }
        }
        return result;
    }

    safeNetwork (networkId) {
        const networksById = {
            'BITCOIN': 'BTC',
            'LITECOIN': 'LTC',
            'ETHEREUM': 'ERC20',
            'TETHERUSE': 'ERC20',
            'TETHERUSO': 'OMNI',
            'TETHERUSL': 'LIQUID',
            'TETHERUSX': 'TRC20',
            'TETHERUSS': 'EOS',
            'TETHERUSDTAVAX': 'AVAX',
            'TETHERUSDTSOL': 'SOL',
            'TETHERUSDTALG': 'ALGO',
            'TETHERUSDTBCH': 'BCH',
            'TETHERUSDTKSM': 'KSM',
            'TETHERUSDTDVF': 'DVF',
            'TETHERUSDTOMG': 'OMG',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        // this api call does not return the 'used' amount - use the v1 version instead (which also returns zero balances)
        // there is a difference between this and the v1 api, namely trading wallet is called margin in v2
        await this.loadMarkets ();
        const accountsByType = this.safeValue (this.options, 'v2AccountsByType', {});
        const requestedType = this.safeString (params, 'type', 'exchange');
        const accountType = this.safeString (accountsByType, requestedType, requestedType);
        if (accountType === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' fetchBalance() type parameter must be one of ' + keys.join (', '));
        }
        const isDerivative = requestedType === 'derivatives';
        const query = this.omit (params, 'type');
        const response = await this.privatePostAuthRWallets (query);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const type = this.safeString (balance, 0);
            const currencyId = this.safeStringLower (balance, 1, '');
            const start = currencyId.length - 2;
            const isDerivativeCode = currencyId.slice (start) === 'f0';
            // this will only filter the derivative codes if the requestedType is 'derivatives'
            const derivativeCondition = (!isDerivative || isDerivativeCode);
            if ((accountType === type) && derivativeCondition) {
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['total'] = this.safeString (balance, 2);
                account['free'] = this.safeString (balance, 4);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bitfinex2#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        // transferring between derivatives wallet and regular wallet is not documented in their API
        // however we support it in CCXT (from just looking at web inspector)
        await this.loadMarkets ();
        const accountsByType = this.safeValue (this.options, 'v2AccountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount);
        if (fromId === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ArgumentsRequired (this.id + ' transfer() fromAccount must be one of ' + keys.join (', '));
        }
        const toId = this.safeString (accountsByType, toAccount);
        if (toId === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ArgumentsRequired (this.id + ' transfer() toAccount must be one of ' + keys.join (', '));
        }
        const currency = this.currency (code);
        const fromCurrencyId = this.convertDerivativesId (currency, fromAccount);
        const toCurrencyId = this.convertDerivativesId (currency, toAccount);
        const requestedAmount = this.currencyToPrecision (code, amount);
        // this request is slightly different from v1 fromAccount -> from
        const request = {
            'amount': requestedAmount,
            'currency': fromCurrencyId,
            'currency_to': toCurrencyId,
            'from': fromId,
            'to': toId,
        };
        const response = await this.privatePostAuthWTransfer (this.extend (request, params));
        //
        //     [
        //         1616451183763,
        //         "acc_tf",
        //         null,
        //         null,
        //         [
        //             1616451183763,
        //             "exchange",
        //             "margin",
        //             null,
        //             "UST",
        //             "UST",
        //             null,
        //             1
        //         ],
        //         null,
        //         "SUCCESS",
        //         "1.0 Tether USDt transfered from Exchange to Margin"
        //     ]
        //
        const error = this.safeString (response, 0);
        if (error === 'error') {
            const message = this.safeString (response, 2, '');
            // same message as in v1
            this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + message);
            throw new ExchangeError (this.id + ' ' + message);
        }
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer
        //
        //     [
        //         1616451183763,
        //         "acc_tf",
        //         null,
        //         null,
        //         [
        //             1616451183763,
        //             "exchange",
        //             "margin",
        //             null,
        //             "UST",
        //             "UST",
        //             null,
        //             1
        //         ],
        //         null,
        //         "SUCCESS",
        //         "1.0 Tether USDt transfered from Exchange to Margin"
        //     ]
        //
        const timestamp = this.safeInteger (transfer, 0);
        const info = this.safeValue (transfer, 4);
        const fromAccount = this.safeString (info, 1);
        const toAccount = this.safeString (info, 2);
        const currencyId = this.safeString (info, 5);
        const status = this.safeString (transfer, 6);
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': this.parseTransferStatus (status),
            'amount': this.safeNumber (info, 7),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'info': transfer,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'SUCCESS': 'ok',
            'ERROR': 'failed',
            'FAILURE': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    convertDerivativesId (currency, type) {
        // there is a difference between this and the v1 api, namely trading wallet is called margin in v2
        // {
        //   id: 'fUSTF0',
        //   code: 'USTF0',
        //   info: [ 'USTF0', [], [], [], [ 'USTF0', 'UST' ] ],
        const info = this.safeValue (currency, 'info');
        const transferId = this.safeString (info, 0);
        const underlying = this.safeValue (info, 4, []);
        let currencyId = undefined;
        if (type === 'derivatives') {
            currencyId = this.safeString (underlying, 0, transferId);
            const start = currencyId.length - 2;
            const isDerivativeCode = currencyId.slice (start) === 'F0';
            if (!isDerivativeCode) {
                currencyId = currencyId + 'F0';
            }
        } else if (type !== 'margin') {
            currencyId = this.safeString (underlying, 1, transferId);
        } else {
            currencyId = transferId;
        }
        return currencyId;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        throw new NotSupported (this.id + ' fetchOrder() is not supported yet. Consider using fetchOpenOrder() or fetchClosedOrder() instead.');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const precision = this.safeValue (this.options, 'precision', 'R0');
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'precision': precision,
        };
        if (limit !== undefined) {
            request['len'] = limit; // 25 or 100
        }
        const fullRequest = this.extend (request, params);
        const orderbook = await this.publicGetBookSymbolPrecision (fullRequest);
        const timestamp = this.milliseconds ();
        const result = {
            'symbol': market['symbol'],
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        const priceIndex = (fullRequest['precision'] === 'R0') ? 1 : 0;
        for (let i = 0; i < orderbook.length; i++) {
            const order = orderbook[i];
            const price = this.safeNumber (order, priceIndex);
            const signedAmount = this.safeString (order, 2);
            const amount = Precise.stringAbs (signedAmount);
            const side = Precise.stringGt (signedAmount, '0') ? 'bids' : 'asks';
            result[side].push ([ price, this.parseNumber (amount) ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // on trading pairs (ex. tBTCUSD)
        //
        //     [
        //         SYMBOL,
        //         BID,
        //         BID_SIZE,
        //         ASK,
        //         ASK_SIZE,
        //         DAILY_CHANGE,
        //         DAILY_CHANGE_RELATIVE,
        //         LAST_PRICE,
        //         VOLUME,
        //         HIGH,
        //         LOW
        //     ]
        //
        // on funding currencies (ex. fUSD)
        //
        //     [
        //         SYMBOL,
        //         FRR,
        //         BID,
        //         BID_PERIOD,
        //         BID_SIZE,
        //         ASK,
        //         ASK_PERIOD,
        //         ASK_SIZE,
        //         DAILY_CHANGE,
        //         DAILY_CHANGE_RELATIVE,
        //         LAST_PRICE,
        //         VOLUME,
        //         HIGH,
        //         LOW,
        //         _PLACEHOLDER,
        //         _PLACEHOLDER,
        //         FRR_AMOUNT_AVAILABLE
        //     ]
        //
        const timestamp = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const length = ticker.length;
        const last = this.safeString (ticker, length - 4);
        const percentage = this.safeString (ticker, length - 5);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, length - 2),
            'low': this.safeString (ticker, length - 1),
            'bid': this.safeString (ticker, length - 10),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, length - 8),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, length - 6),
            'percentage': Precise.stringMul (percentage, '100'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, length - 3),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['symbols'] = ids.join (',');
        } else {
            request['symbols'] = 'ALL';
        }
        const tickers = await this.publicGetTickers (this.extend (request, params));
        //
        //     [
        //         // on trading pairs (ex. tBTCUSD)
        //         [
        //             SYMBOL,
        //             BID,
        //             BID_SIZE,
        //             ASK,
        //             ASK_SIZE,
        //             DAILY_CHANGE,
        //             DAILY_CHANGE_RELATIVE,
        //             LAST_PRICE,
        //             VOLUME,
        //             HIGH,
        //             LOW
        //         ],
        //         // on funding currencies (ex. fUSD)
        //         [
        //             SYMBOL,
        //             FRR,
        //             BID,
        //             BID_PERIOD,
        //             BID_SIZE,
        //             ASK,
        //             ASK_PERIOD,
        //             ASK_SIZE,
        //             DAILY_CHANGE,
        //             DAILY_CHANGE_RELATIVE,
        //             LAST_PRICE,
        //             VOLUME,
        //             HIGH,
        //             LOW,
        //             _PLACEHOLDER,
        //             _PLACEHOLDER,
        //             FRR_AMOUNT_AVAILABLE
        //         ],
        //         ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 0);
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetTickerSymbol (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseSymbol (marketId) {
        if (marketId === undefined) {
            return marketId;
        }
        marketId = marketId.replace ('t', '');
        let baseId = undefined;
        let quoteId = undefined;
        if (marketId.indexOf (':') >= 0) {
            const parts = marketId.split (':');
            baseId = parts[0];
            quoteId = parts[1];
        } else {
            baseId = marketId.slice (0, 3);
            quoteId = marketId.slice (3, 6);
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return base + '/' + quote;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     [
        //         ID,
        //         MTS, // timestamp
        //         AMOUNT,
        //         PRICE
        //     ]
        //
        // fetchMyTrades (private)
        //
        //     [
        //         ID,
        //         PAIR,
        //         MTS_CREATE,
        //         ORDER_ID,
        //         EXEC_AMOUNT,
        //         EXEC_PRICE,
        //         ORDER_TYPE,
        //         ORDER_PRICE,
        //         MAKER,
        //         FEE,
        //         FEE_CURRENCY,
        //         ...
        //     ]
        //
        const tradeLength = trade.length;
        const isPrivate = (tradeLength > 5);
        const id = this.safeString (trade, 0);
        const amountIndex = isPrivate ? 4 : 2;
        let side = undefined;
        let amountString = this.safeString (trade, amountIndex);
        const priceIndex = isPrivate ? 5 : 3;
        const priceString = this.safeString (trade, priceIndex);
        if (amountString[0] === '-') {
            side = 'sell';
            amountString = Precise.stringAbs (amountString);
        } else {
            side = 'buy';
        }
        let orderId = undefined;
        let takerOrMaker = undefined;
        let type = undefined;
        let fee = undefined;
        let symbol = undefined;
        const timestampIndex = isPrivate ? 2 : 1;
        const timestamp = this.safeInteger (trade, timestampIndex);
        if (isPrivate) {
            const marketId = trade[1];
            symbol = this.parseSymbol (marketId);
            orderId = this.safeString (trade, 3);
            const maker = this.safeInteger (trade, 8);
            takerOrMaker = (maker === 1) ? 'maker' : 'taker';
            let feeCostString = this.safeString (trade, 9);
            feeCostString = Precise.stringNeg (feeCostString);
            const feeCurrencyId = this.safeString (trade, 10);
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
            };
            const orderType = trade[6];
            type = this.safeString (this.options['exchangeTypes'], orderType);
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'side': side,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let sort = '-1';
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
            sort = '1';
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 120, max 5000
        }
        request['sort'] = sort;
        const response = await this.publicGetTradesSymbolHist (this.extend (request, params));
        //
        //     [
        //         [
        //             ID,
        //             MTS, // timestamp
        //             AMOUNT,
        //             PRICE
        //         ]
        //     ]
        //
        const trades = this.sortBy (response, 1);
        return this.parseTrades (trades, market, undefined, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100; // default 100, max 5000
        }
        if (since === undefined) {
            const duration = this.parseTimeframe (timeframe);
            since = this.milliseconds () - duration * limit * 1000;
        }
        const request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
            'start': since,
            'limit': limit,
        };
        const response = await this.publicGetCandlesTradeTimeframeSymbolHist (this.extend (request, params));
        //
        //     [
        //         [1591503840000,0.025069,0.025068,0.025069,0.025068,1.97828998],
        //         [1591504500000,0.025065,0.025065,0.025065,0.025065,1.0164],
        //         [1591504620000,0.025062,0.025062,0.025062,0.025062,0.5],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1457539800000,
        //         0.02594,
        //         0.02594,
        //         0.02594,
        //         0.02594,
        //         0.1
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    parseOrderStatus (status) {
        if (status === undefined) {
            return status;
        }
        const parts = status.split (' ');
        const state = this.safeString (parts, 0);
        const statuses = {
            'ACTIVE': 'open',
            'PARTIALLY': 'open',
            'EXECUTED': 'closed',
            'CANCELED': 'canceled',
            'INSUFFICIENT': 'canceled',
            'POSTONLY CANCELED': 'canceled',
            'RSN_DUST': 'rejected',
            'RSN_PAUSE': 'rejected',
            'IOC CANCELED': 'canceled',
            'FILLORKILL CANCELED': 'canceled',
        };
        return this.safeString (statuses, state, status);
    }

    parseOrderFlags (flags) {
        // flags can be added to each other...
        const flagValues = {
            '1024': [ 'reduceOnly' ],
            '4096': [ 'postOnly' ],
            '5120': [ 'reduceOnly', 'postOnly' ],
            // '64': 'hidden', // The hidden order option ensures an order does not appear in the order book
            // '512': 'close', // Close position if position present.
            // '16384': 'OCO', // The one cancels other order option allows you to place a pair of orders stipulating that if one order is executed fully or partially, then the other is automatically canceled.
            // '524288': 'No Var Rates' // Excludes variable rate funding offers from matching against this order, if on margin
        };
        return this.safeValue (flagValues, flags, undefined);
    }

    parseTimeInForce (orderType) {
        const orderTypes = {
            'EXCHANGE IOC': 'IOC',
            'EXCHANGE FOK': 'FOK',
            'IOC': 'IOC', // Margin
            'FOK': 'FOK', // Margin
        };
        return this.safeString (orderTypes, orderType, 'GTC');
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 0);
        const marketId = this.safeString (order, 3);
        const symbol = this.parseSymbol (marketId);
        // https://github.com/ccxt/ccxt/issues/6686
        // const timestamp = this.safeTimestamp (order, 5);
        const timestamp = this.safeInteger (order, 5);
        const remaining = Precise.stringAbs (this.safeString (order, 6));
        const signedAmount = this.safeString (order, 7);
        const amount = Precise.stringAbs (signedAmount);
        const side = Precise.stringLt (signedAmount, '0') ? 'sell' : 'buy';
        const orderType = this.safeString (order, 8);
        const type = this.safeString (this.safeValue (this.options, 'exchangeTypes'), orderType);
        const timeInForce = this.parseTimeInForce (orderType);
        const rawFlags = this.safeString (order, 12);
        const flags = this.parseOrderFlags (rawFlags);
        let postOnly = false;
        if (flags !== undefined) {
            for (let i = 0; i < flags.length; i++) {
                if (flags[i] === 'postOnly') {
                    postOnly = true;
                }
            }
        }
        let price = this.safeString (order, 16);
        let stopPrice = undefined;
        if ((orderType === 'EXCHANGE STOP') || (orderType === 'EXCHANGE STOP LIMIT')) {
            price = undefined;
            stopPrice = this.safeNumber (order, 16);
            if (orderType === 'EXCHANGE STOP LIMIT') {
                price = this.safeString (order, 19);
            }
        }
        let status = undefined;
        const statusString = this.safeString (order, 13);
        if (statusString !== undefined) {
            const parts = statusString.split (' @ ');
            status = this.parseOrderStatus (this.safeString (parts, 0));
        }
        const average = this.safeString (order, 17);
        const clientOrderId = this.safeString (order, 2);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#createOrder
         * @description Create an order on the exchange
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} type 'limit' or 'market'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount the amount of currency to trade
         * @param {float} price price of order
         * @param {object} params  Extra parameters specific to the exchange API endpoint
         * @param {float} params.stopPrice The price at which a trigger order is triggered at
         * @param {string} params.timeInForce "GTC", "IOC", "FOK", or "PO"
         * @param {bool} params.postOnly
         * @param {bool} params.reduceOnly Ensures that the executed order does not flip the opened position.
         * @param {int} params.flags additional order parameters: 4096 (Post Only), 1024 (Reduce Only), 16384 (OCO), 64 (Hidden), 512 (Close), 524288 (No Var Rates)
         * @param {int} params.lev leverage for a derivative order, supported by derivative symbol orders only. The value should be between 1 and 100 inclusive.
         * @param {string} params.price_traling The trailing price for a trailing stop order
         * @param {string} params.price_aux_limit Order price for stop limit orders
         * @param {string} params.price_oco_stop OCO stop price
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // order types "limit" and "market" immediatley parsed "EXCHANGE LIMIT" and "EXCHANGE MARKET"
        // note: same order types exist for margin orders without the EXCHANGE prefix
        const orderTypes = this.safeValue (this.options, 'orderTypes', {});
        let orderType = type.toUpperCase ();
        if (market['spot']) {
            // although they claim that type needs to be 'exchange limit' or 'exchange market'
            // in fact that's not the case for swap markets
            orderType = this.safeStringUpper (orderTypes, type, type);
        }
        const stopPrice = this.safeString2 (params, 'stopPrice', 'triggerPrice');
        const timeInForce = this.safeString (params, 'timeInForce');
        const postOnlyParam = this.safeValue (params, 'postOnly', false);
        const reduceOnly = this.safeValue (params, 'reduceOnly', false);
        const clientOrderId = this.safeValue2 (params, 'cid', 'clientOrderId');
        params = this.omit (params, [ 'triggerPrice', 'stopPrice', 'timeInForce', 'postOnly', 'reduceOnly', 'price_aux_limit' ]);
        let amountString = this.amountToPrecision (symbol, amount);
        amountString = (side === 'buy') ? amountString : Precise.stringNeg (amountString);
        const request = {
            // 'gid': 0123456789, // int32,  optional group id for the order
            // 'cid': 0123456789, // int32 client order id
            'type': orderType,
            'symbol': market['id'],
            // 'price': this.numberToString (price),
            'amount': amountString,
            // 'flags': 0, // int32, https://docs.bitfinex.com/v2/docs/flag-values
            // 'lev': 10, // leverage for a derivative orders, the value should be between 1 and 100 inclusive, optional, 10 by default
            // 'price_trailing': this.numberToString (priceTrailing),
            // 'price_aux_limit': this.numberToString (stopPrice),
            // 'price_oco_stop': this.numberToString (ocoStopPrice),
            // 'tif': '2020-01-01 10:45:23', // datetime for automatic order cancellation
            // 'meta': {
            //     'aff_code': 'AFF_CODE_HERE'
            // },
        };
        const stopLimit = ((orderType === 'EXCHANGE STOP LIMIT') || ((orderType === 'EXCHANGE LIMIT') && (stopPrice !== undefined)));
        const exchangeStop = (orderType === 'EXCHANGE STOP');
        const exchangeMarket = (orderType === 'EXCHANGE MARKET');
        const stopMarket = (exchangeStop || (exchangeMarket && (stopPrice !== undefined)));
        const ioc = ((orderType === 'EXCHANGE IOC') || (timeInForce === 'IOC'));
        const fok = ((orderType === 'EXCHANGE FOK') || (timeInForce === 'FOK'));
        const postOnly = (postOnlyParam || (timeInForce === 'PO'));
        if ((ioc || fok) && (price === undefined)) {
            throw new InvalidOrder (this.id + ' createOrder() requires a price argument with IOC and FOK orders');
        }
        if ((ioc || fok) && exchangeMarket) {
            throw new InvalidOrder (this.id + ' createOrder() does not allow market IOC and FOK orders');
        }
        if ((orderType !== 'MARKET') && (!exchangeMarket) && (!exchangeStop)) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (stopLimit || stopMarket) {
            // request['price'] is taken as stopPrice for stop orders
            request['price'] = this.priceToPrecision (symbol, stopPrice);
            if (stopMarket) {
                request['type'] = 'EXCHANGE STOP';
            } else if (stopLimit) {
                request['type'] = 'EXCHANGE STOP LIMIT';
                request['price_aux_limit'] = this.priceToPrecision (symbol, price);
            }
        }
        if (ioc) {
            request['type'] = 'EXCHANGE IOC';
        } else if (fok) {
            request['type'] = 'EXCHANGE FOK';
        }
        // flag values may be summed to combine flags
        let flags = 0;
        if (postOnly) {
            flags = this.sum (flags, 4096);
        }
        if (reduceOnly) {
            flags = this.sum (flags, 1024);
        }
        if (flags !== 0) {
            request['flags'] = flags;
        }
        if (clientOrderId !== undefined) {
            request['cid'] = clientOrderId;
            params = this.omit (params, [ 'cid', 'clientOrderId' ]);
        }
        const response = await this.privatePostAuthWOrderSubmit (this.extend (request, params));
        //
        //      [
        //          1653325121,   // Timestamp in milliseconds
        //          "on-req",     // Purpose of notification ('on-req', 'oc-req', 'uca', 'fon-req', 'foc-req')
        //          null,         // unique ID of the message
        //          null,
        //              [
        //                  [
        //                      95412102131,            // Order ID
        //                      null,                   // Group ID
        //                      1653325121798,          // Client Order ID
        //                      "tDOGE:UST",            // Market ID
        //                      1653325121798,          // Millisecond timestamp of creation
        //                      1653325121798,          // Millisecond timestamp of update
        //                      -10,                    // Amount (Positive means buy, negative means sell)
        //                      -10,                    // Original amount
        //                      "EXCHANGE LIMIT",       // Type of the order: LIMIT, EXCHANGE LIMIT, MARKET, EXCHANGE MARKET, STOP, EXCHANGE STOP, STOP LIMIT, EXCHANGE STOP LIMIT, TRAILING STOP, EXCHANGE TRAILING STOP, FOK, EXCHANGE FOK, IOC, EXCHANGE IOC.
        //                      null,                   // Previous order type (stop-limit orders are converted to limit orders so for them previous type is always STOP)
        //                      null,                   // Millisecond timestamp of Time-In-Force: automatic order cancellation
        //                      null,                   // _PLACEHOLDER
        //                      4096,                   // Flags, see parseOrderFlags()
        //                      "ACTIVE",               // Order Status, see parseOrderStatus()
        //                      null,                   // _PLACEHOLDER
        //                      null,                   // _PLACEHOLDER
        //                      0.071,                  // Price (Stop Price for stop-limit orders, Limit Price for limit orders)
        //                      0,                      // Average Price
        //                      0,                      // Trailing Price
        //                      0,                      // Auxiliary Limit price (for STOP LIMIT)
        //                      null,                   // _PLACEHOLDER
        //                      null,                   // _PLACEHOLDER
        //                      null,                   // _PLACEHOLDER
        //                      0,                      // Hidden (0 if false, 1 if true)
        //                      0,                      // Placed ID (If another order caused this order to be placed (OCO) this will be that other order's ID)
        //                      null,                   // _PLACEHOLDER
        //                      null,                   // _PLACEHOLDER
        //                      null,                   // _PLACEHOLDER
        //                      "API>BFX",              // Routing, indicates origin of action: BFX, ETHFX, API>BFX, API>ETHFX
        //                      null,                   // _PLACEHOLDER
        //                      null,                   // _PLACEHOLDER
        //                      {"$F7":1}               // additional meta information about the order ( $F7 = IS_POST_ONLY (0 if false, 1 if true), $F33 = Leverage (int))
        //                  ]
        //              ],
        //          null,      // CODE (work in progress)
        //          "SUCCESS",                    // Status of the request
        //          "Submitting 1 orders."      // Message
        //       ]
        //
        const status = this.safeString (response, 6);
        if (status !== 'SUCCESS') {
            const errorCode = response[5];
            const errorText = response[7];
            throw new ExchangeError (this.id + ' ' + response[6] + ': ' + errorText + ' (#' + errorCode + ')');
        }
        const orders = this.safeValue (response, 4, []);
        const order = this.safeValue (orders, 0);
        return this.parseOrder (order, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'all': 1,
        };
        const response = await this.privatePostAuthWOrderCancelMulti (this.extend (request, params));
        const orders = this.safeValue (response, 4, []);
        return this.parseOrders (orders);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol Not used by bitfinex2 cancelOrder ()
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const cid = this.safeValue2 (params, 'cid', 'clientOrderId'); // client order id
        let request = undefined;
        if (cid !== undefined) {
            const cidDate = this.safeValue (params, 'cidDate'); // client order id date
            if (cidDate === undefined) {
                throw new InvalidOrder (this.id + " canceling an order by clientOrderId ('cid') requires both 'cid' and 'cid_date' ('YYYY-MM-DD')");
            }
            request = {
                'cid': cid,
                'cid_date': cidDate,
            };
            params = this.omit (params, [ 'cid', 'clientOrderId' ]);
        } else {
            request = {
                'id': parseInt (id),
            };
        }
        const response = await this.privatePostAuthWOrderCancel (this.extend (request, params));
        const order = this.safeValue (response, 4);
        return this.parseOrder (order);
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchOpenOrder
         * @description fetch an open order by it's id
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'id': [ parseInt (id) ],
        };
        const orders = await this.fetchOpenOrders (symbol, undefined, undefined, this.extend (request, params));
        const order = this.safeValue (orders, 0);
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return order;
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchClosedOrder
         * @description fetch an open order by it's id
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'id': [ parseInt (id) ],
        };
        const orders = await this.fetchClosedOrders (symbol, undefined, undefined, this.extend (request, params));
        const order = this.safeValue (orders, 0);
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return order;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let response = undefined;
        if (symbol === undefined) {
            response = await this.privatePostAuthROrders (this.extend (request, params));
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            response = await this.privatePostAuthROrdersSymbol (this.extend (request, params));
        }
        //
        //      [
        //          [
        //              95408916206,            // Order ID
        //              null,                   // Group Order ID
        //              1653322349926,          // Client Order ID
        //              "tDOGE:UST",            // Market ID
        //              1653322349926,          // Created Timestamp in milliseconds
        //              1653322349927,          // Updated Timestamp in milliseconds
        //              -10,                    // Amount remaining (Positive means buy, negative means sell)
        //              -10,                    // Original amount
        //              "EXCHANGE LIMIT",       // Order type
        //              null,                   // Previous Order Type
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              0,                      // Flags, see parseOrderFlags()
        //              "ACTIVE",               // Order Status, see parseOrderStatus()
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              0.11,                   // Price
        //              0,                      // Average Price
        //              0,                      // Trailing Price
        //              0,                      // Auxiliary Limit price (for STOP LIMIT)
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              0,                      // Hidden (0 if false, 1 if true)
        //              0,                      // Placed ID (If another order caused this order to be placed (OCO) this will be that other order's ID)
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              "API>BFX",              // Routing, indicates origin of action: BFX, ETHFX, API>BFX, API>ETHFX
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              {"$F7":1}               // additional meta information about the order ( $F7 = IS_POST_ONLY (0 if false, 1 if true), $F33 = Leverage (int))
        //          ],
        //      ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        // returns the most recent closed or canceled orders up to circa two weeks ago
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 25, max 2500
        }
        let market = undefined;
        let response = undefined;
        if (symbol === undefined) {
            response = await this.privatePostAuthROrdersHist (this.extend (request, params));
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            response = await this.privatePostAuthROrdersSymbolHist (this.extend (request, params));
        }
        //
        //      [
        //          [
        //              95412102131,            // Order ID
        //              null,                   // Group Order ID
        //              1653325121798,          // Client Order ID
        //              "tDOGE:UST",            // Market ID
        //              1653325122000,          // Created Timestamp in milliseconds
        //              1653325122000,          // Updated Timestamp in milliseconds
        //              -10,                    // Amount remaining (Positive means buy, negative means sell)
        //              -10,                    // Original amount
        //              "EXCHANGE LIMIT",       // Order type
        //              null,                   // Previous Order Type
        //              null,                   // Millisecond timestamp of Time-In-Force: automatic order cancellation
        //              null,                   // _PLACEHOLDER
        //              "4096",                 // Flags, see parseOrderFlags()
        //              "POSTONLY CANCELED",    // Order Status, see parseOrderStatus()
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              0.071,                  // Price
        //              0,                      // Average Price
        //              0,                      // Trailing Price
        //              0,                      // Auxiliary Limit price (for STOP LIMIT)
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              0,                      // Notify (0 if false, 1 if true)
        //              0,                      // Hidden (0 if false, 1 if true)
        //              null,                   // Placed ID (If another order caused this order to be placed (OCO) this will be that other order's ID)
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              "API>BFX",              // Routing, indicates origin of action: BFX, ETHFX, API>BFX, API>ETHFX
        //              null,                   // _PLACEHOLDER
        //              null,                   // _PLACEHOLDER
        //              {"_$F7":1}              // additional meta information about the order ( _$F7 = IS_POST_ONLY (0 if false, 1 if true), _$F33 = Leverage (int))
        //          ]
        //      ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderId = parseInt (id);
        const request = {
            'id': orderId,
            'symbol': market['id'],
        };
        // valid for trades upto 10 days old
        const response = await this.privatePostAuthROrderSymbolIdTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'end': this.milliseconds (),
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 25, max 1000
        }
        let method = 'privatePostAuthRTradesHist';
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            method = 'privatePostAuthRTradesSymbolHist';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitfinex2#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const request = {
            'op_renew': 1,
        };
        return await this.fetchDepositAddress (code, this.extend (request, params));
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        // if not provided explicitly we will try to match using the currency name
        const network = this.safeString (params, 'network', code);
        const currencyNetworks = this.safeValue (currency, 'networks', {});
        const currencyNetwork = this.safeValue (currencyNetworks, network);
        const networkId = this.safeString (currencyNetwork, 'id');
        if (networkId === undefined) {
            throw new ArgumentsRequired (this.id + " fetchDepositAddress() could not find a network for '" + code + "'. You can specify it by providing the 'network' value inside params");
        }
        const wallet = this.safeString (params, 'wallet', 'exchange');  // 'exchange', 'margin', 'funding' and also old labels 'exchange', 'trading', 'deposit', respectively
        params = this.omit (params, 'network', 'wallet');
        const request = {
            'method': networkId,
            'wallet': wallet,
            'op_renew': 0, // a value of 1 will generate a new address
        };
        const response = await this.privatePostAuthWDepositAddress (this.extend (request, params));
        //
        //     [
        //         1582269616687, // MTS Millisecond Time Stamp of the update
        //         'acc_dep', // TYPE Purpose of notification 'acc_dep' for account deposit
        //         null, // MESSAGE_ID unique ID of the message
        //         null, // not documented
        //         [
        //             null, // PLACEHOLDER
        //             'BITCOIN', // METHOD Method of deposit
        //             'BTC', // CURRENCY_CODE Currency code of new address
        //             null, // PLACEHOLDER
        //             '1BC9PZqpUmjyEB54uggn8TFKj49zSDYzqG', // ADDRESS
        //             null, // POOL_ADDRESS
        //         ],
        //         null, // CODE null or integer work in progress
        //         'SUCCESS', // STATUS Status of the notification, SUCCESS, ERROR, FAILURE
        //         'success', // TEXT Text of the notification
        //     ]
        //
        const result = this.safeValue (response, 4, []);
        const poolAddress = this.safeString (result, 5);
        const address = (poolAddress === undefined) ? this.safeString (result, 4) : poolAddress;
        const tag = (poolAddress === undefined) ? undefined : this.safeString (result, 4);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'SUCCESS': 'ok',
            'ERROR': 'failed',
            'FAILURE': 'failed',
            'CANCELED': 'canceled',
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     [
        //         1582271520931, // MTS Millisecond Time Stamp of the update
        //         "acc_wd-req", // TYPE Purpose of notification 'acc_wd-req' account withdrawal request
        //         null, // MESSAGE_ID unique ID of the message
        //         null, // not documented
        //         [
        //             0, // WITHDRAWAL_ID Unique Withdrawal ID
        //             null, // PLACEHOLDER
        //             "bitcoin", // METHOD Method of withdrawal
        //             null, // PAYMENT_ID Payment ID if relevant
        //             "exchange", // WALLET Sending wallet
        //             1, // AMOUNT Amount of Withdrawal less fee
        //             null, // PLACEHOLDER
        //             null, // PLACEHOLDER
        //             0.0004, // WITHDRAWAL_FEE Fee on withdrawal
        //         ],
        //         null, // CODE null or integer Work in progress
        //         "SUCCESS", // STATUS Status of the notification, it may vary over time SUCCESS, ERROR, FAILURE
        //         "Invalid bitcoin address (abcdef)", // TEXT Text of the notification
        //     ]
        //
        // fetchTransactions
        //
        //     [
        //         13293039, // ID
        //         'ETH', // CURRENCY
        //         'ETHEREUM', // CURRENCY_NAME
        //         null,
        //         null,
        //         1574175052000, // MTS_STARTED
        //         1574181326000, // MTS_UPDATED
        //         null,
        //         null,
        //         'CANCELED', // STATUS
        //         null,
        //         null,
        //         -0.24, // AMOUNT, negative for withdrawals
        //         -0.00135, // FEES
        //         null,
        //         null,
        //         '0x38110e0Fc932CB2BE...........', // DESTINATION_ADDRESS
        //         null,
        //         null,
        //         null,
        //         '0x523ec8945500.....................................', // TRANSACTION_ID
        //         "Purchase of 100 pizzas", // WITHDRAW_TRANSACTION_NOTE, might also be: null
        //     ]
        //
        const transactionLength = transaction.length;
        let timestamp = undefined;
        let updated = undefined;
        let code = undefined;
        let amount = undefined;
        let id = undefined;
        let status = undefined;
        let tag = undefined;
        let type = undefined;
        let feeCost = undefined;
        let txid = undefined;
        let addressTo = undefined;
        let network = undefined;
        let comment = undefined;
        if (transactionLength === 8) {
            const data = this.safeValue (transaction, 4, []);
            timestamp = this.safeInteger (transaction, 0);
            if (currency !== undefined) {
                code = currency['code'];
            }
            feeCost = this.safeString (data, 8);
            if (feeCost !== undefined) {
                feeCost = Precise.stringAbs (feeCost);
            }
            amount = this.safeNumber (data, 5);
            id = this.safeValue (data, 0);
            status = 'ok';
            if (id === 0) {
                id = undefined;
                status = 'failed';
            }
            tag = this.safeString (data, 3);
            type = 'withdrawal';
        } else if (transactionLength === 22) {
            id = this.safeString (transaction, 0);
            const currencyId = this.safeString (transaction, 1);
            code = this.safeCurrencyCode (currencyId, currency);
            const networkId = this.safeString (transaction, 2);
            network = this.safeNetwork (networkId);
            timestamp = this.safeInteger (transaction, 5);
            updated = this.safeInteger (transaction, 6);
            status = this.parseTransactionStatus (this.safeString (transaction, 9));
            const signedAmount = this.safeString (transaction, 12);
            amount = Precise.stringAbs (signedAmount);
            if (signedAmount !== undefined) {
                if (Precise.stringLt (signedAmount, '0')) {
                    type = 'withdrawal';
                } else {
                    type = 'deposit';
                }
            }
            feeCost = this.safeString (transaction, 13);
            if (feeCost !== undefined) {
                feeCost = Precise.stringAbs (feeCost);
            }
            addressTo = this.safeString (transaction, 16);
            txid = this.safeString (transaction, 20);
            comment = this.safeString (transaction, 21);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'type': type,
            'currency': code,
            'network': network,
            'amount': this.parseNumber (amount),
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': addressTo, // this is actually the tag for XRP transfers (the address is missing)
            'addressFrom': undefined,
            'addressTo': addressTo,
            'tag': tag, // refix it properly for the tag from description
            'tagFrom': undefined,
            'tagTo': tag,
            'updated': updated,
            'comment': comment,
            'fee': {
                'currency': code,
                'cost': this.parseNumber (feeCost),
                'rate': undefined,
            },
        };
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privatePostAuthRSummary (params);
        //
        //      Response Spec:
        //      [
        //         PLACEHOLDER,
        //         PLACEHOLDER,
        //         PLACEHOLDER,
        //         PLACEHOLDER,
        //         [
        //            [
        //             MAKER_FEE,
        //             MAKER_FEE,
        //             MAKER_FEE,
        //             PLACEHOLDER,
        //             PLACEHOLDER,
        //             DERIV_REBATE
        //            ],
        //            [
        //             TAKER_FEE_TO_CRYPTO,
        //             TAKER_FEE_TO_STABLE,
        //             TAKER_FEE_TO_FIAT,
        //             PLACEHOLDER,
        //             PLACEHOLDER,
        //             DERIV_TAKER_FEE
        //            ]
        //         ],
        //         PLACEHOLDER,
        //         PLACEHOLDER,
        //         PLACEHOLDER,
        //         PLACEHOLDER,
        //         {
        //             LEO_LEV,
        //             LEO_AMOUNT_AVG
        //         }
        //     ]
        //
        //      Example response:
        //
        //     [
        //         null,
        //         null,
        //         null,
        //         null,
        //         [
        //          [ 0.001, 0.001, 0.001, null, null, 0.0002 ],
        //          [ 0.002, 0.002, 0.002, null, null, 0.00065 ]
        //         ],
        //         [
        //          [
        //              {
        //              curr: 'Total (USD)',
        //              vol: '0',
        //              vol_safe: '0',
        //              vol_maker: '0',
        //              vol_BFX: '0',
        //              vol_BFX_safe: '0',
        //              vol_BFX_maker: '0'
        //              }
        //          ],
        //          {},
        //          0
        //         ],
        //         [ null, {}, 0 ],
        //         null,
        //         null,
        //         { leo_lev: '0', leo_amount_avg: '0' }
        //     ]
        //
        const result = {};
        const fiat = this.safeValue (this.options, 'fiat', {});
        const feeData = this.safeValue (response, 4, []);
        const makerData = this.safeValue (feeData, 0, []);
        const takerData = this.safeValue (feeData, 1, []);
        const makerFee = this.safeNumber (makerData, 0);
        const makerFeeFiat = this.safeNumber (makerData, 2);
        const makerFeeDeriv = this.safeNumber (makerData, 5);
        const takerFee = this.safeNumber (takerData, 0);
        const takerFeeFiat = this.safeNumber (takerData, 2);
        const takerFeeDeriv = this.safeNumber (takerData, 5);
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = {
                'info': response,
                'symbol': symbol,
                'percentage': true,
                'tierBased': true,
            };
            if (market['quote'] in fiat) {
                fee['maker'] = makerFeeFiat;
                fee['taker'] = takerFeeFiat;
            } else if (market['contract']) {
                fee['maker'] = makerFeeDeriv;
                fee['taker'] = takerFeeDeriv;
            } else { // TODO check if stable coin
                fee['maker'] = makerFee;
                fee['taker'] = takerFee;
            }
            result[symbol] = fee;
        }
        return result;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        let method = 'privatePostAuthRMovementsHist';
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['uppercaseId'];
            method = 'privatePostAuthRMovementsCurrencyHist';
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 1000
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         [
        //             13293039, // ID
        //             'ETH', // CURRENCY
        //             'ETHEREUM', // CURRENCY_NAME
        //             null,
        //             null,
        //             1574175052000, // MTS_STARTED
        //             1574181326000, // MTS_UPDATED
        //             null,
        //             null,
        //             'CANCELED', // STATUS
        //             null,
        //             null,
        //             -0.24, // AMOUNT, negative for withdrawals
        //             -0.00135, // FEES
        //             null,
        //             null,
        //             '0x38110e0Fc932CB2BE...........', // DESTINATION_ADDRESS
        //             null,
        //             null,
        //             null,
        //             '0x523ec8945500.....................................', // TRANSACTION_ID
        //             "Purchase of 100 pizzas", // WITHDRAW_TRANSACTION_NOTE, might also be: null
        //         ]
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // if not provided explicitly we will try to match using the currency name
        const network = this.safeString (params, 'network', code);
        params = this.omit (params, 'network');
        const currencyNetworks = this.safeValue (currency, 'networks', {});
        const currencyNetwork = this.safeValue (currencyNetworks, network);
        const networkId = this.safeString (currencyNetwork, 'id');
        if (networkId === undefined) {
            throw new ArgumentsRequired (this.id + " fetchDepositAddress() could not find a network for '" + code + "'. You can specify it by providing the 'network' value inside params");
        }
        const wallet = this.safeString (params, 'wallet', 'exchange');  // 'exchange', 'margin', 'funding' and also old labels 'exchange', 'trading', 'deposit', respectively
        params = this.omit (params, 'network', 'wallet');
        const request = {
            'method': networkId,
            'wallet': wallet,
            'amount': this.numberToString (amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const response = await this.privatePostAuthWWithdraw (this.extend (request, params));
        //
        //     [
        //         1582271520931, // MTS Millisecond Time Stamp of the update
        //         "acc_wd-req", // TYPE Purpose of notification 'acc_wd-req' account withdrawal request
        //         null, // MESSAGE_ID unique ID of the message
        //         null, // not documented
        //         [
        //             0, // WITHDRAWAL_ID Unique Withdrawal ID
        //             null, // PLACEHOLDER
        //             "bitcoin", // METHOD Method of withdrawal
        //             null, // PAYMENT_ID Payment ID if relevant
        //             "exchange", // WALLET Sending wallet
        //             1, // AMOUNT Amount of Withdrawal less fee
        //             null, // PLACEHOLDER
        //             null, // PLACEHOLDER
        //             0.0004, // WITHDRAWAL_FEE Fee on withdrawal
        //         ],
        //         null, // CODE null or integer Work in progress
        //         "SUCCESS", // STATUS Status of the notification, it may vary over time SUCCESS, ERROR, FAILURE
        //         "Invalid bitcoin address (abcdef)", // TEXT Text of the notification
        //     ]
        //
        // in case of failure:
        //
        //     [
        //         "error",
        //         10001,
        //         "Momentary balance check. Please wait few seconds and try the transfer again."
        //     ]
        //
        const statusMessage = this.safeString (response, 0);
        if (statusMessage === 'error') {
            const feedback = this.id + ' ' + response;
            const message = this.safeString (response, 2, '');
            // same message as in v1
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        const text = this.safeString (response, 7);
        if (text !== 'success') {
            this.throwBroadlyMatchedException (this.exceptions['broad'], text, text);
        }
        const transaction = this.parseTransaction (response, currency);
        return this.extend (transaction, {
            'address': address,
        });
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostAuthRPositions (params);
        //
        //     [
        //         [
        //             "tBTCUSD", // SYMBOL
        //             "ACTIVE", // STATUS
        //             0.0195, // AMOUNT
        //             8565.0267019, // BASE_PRICE
        //             0, // MARGIN_FUNDING
        //             0, // MARGIN_FUNDING_TYPE
        //             -0.33455568705000516, // PL
        //             -0.0003117550117425625, // PL_PERC
        //             7045.876419249083, // PRICE_LIQ
        //             3.0673001895895604, // LEVERAGE
        //             null, // _PLACEHOLDER
        //             142355652, // POSITION_ID
        //             1574002216000, // MTS_CREATE
        //             1574002216000, // MTS_UPDATE
        //             null, // _PLACEHOLDER
        //             0, // TYPE
        //             null, // _PLACEHOLDER
        //             0, // COLLATERAL
        //             0, // COLLATERAL_MIN
        //             // META
        //             {
        //                 "reason":"TRADE",
        //                 "order_id":34271018124,
        //                 "liq_stage":null,
        //                 "trade_price":"8565.0267019",
        //                 "trade_amount":"0.0195",
        //                 "order_id_oppo":34277498022
        //             }
        //         ]
        //     ]
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'v1') {
            request = api + request;
        } else {
            request = this.version + request;
        }
        let url = this.urls['api'][api] + '/' + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            body = this.json (query);
            const auth = '/api/' + request + nonce + body;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha384');
            headers = {
                'bfx-nonce': nonce,
                'bfx-apikey': this.apiKey,
                'bfx-signature': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response !== undefined) {
            if (!Array.isArray (response)) {
                const message = this.safeString2 (response, 'message', 'error');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (this.id + ' ' + body);
            }
        } else if (response === '') {
            throw new ExchangeError (this.id + ' returned empty response');
        }
        if (statusCode === 500) {
            // See https://docs.bitfinex.com/docs/abbreviations-glossary#section-errorinfo-codes
            const errorCode = this.numberToString (response[1]);
            const errorText = response[2];
            const feedback = this.id + ' ' + errorText;
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorText, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorText, feedback);
            throw new ExchangeError (this.id + ' ' + errorText + ' (#' + errorCode + ')');
        }
        return response;
    }

    parseLedgerEntryType (type) {
        if (type === undefined) {
            return undefined;
        } else if (type.indexOf ('fee') >= 0 || type.indexOf ('charged') >= 0) {
            return 'fee';
        } else if (type.indexOf ('exchange') >= 0 || type.indexOf ('position') >= 0) {
            return 'trade';
        } else if (type.indexOf ('rebate') >= 0) {
            return 'rebate';
        } else if (type.indexOf ('deposit') >= 0 || type.indexOf ('withdrawal') >= 0) {
            return 'transaction';
        } else if (type.indexOf ('transfer') >= 0) {
            return 'transfer';
        } else if (type.indexOf ('payment') >= 0) {
            return 'payout';
        } else {
            return type;
        }
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     [
        //         [
        //             2531822314, // ID: Ledger identifier
        //             "USD", // CURRENCY: The symbol of the currency (ex. "BTC")
        //             null, // PLACEHOLDER
        //             1573521810000, // MTS: Timestamp in milliseconds
        //             null, // PLACEHOLDER
        //             0.01644445, // AMOUNT: Amount of funds moved
        //             0, // BALANCE: New balance
        //             null, // PLACEHOLDER
        //             "Settlement @ 185.79 on wallet margin" // DESCRIPTION: Description of ledger transaction
        //         ]
        //     ]
        //
        let type = undefined;
        const id = this.safeString (item, 0);
        const currencyId = this.safeString (item, 1);
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (item, 3);
        const amount = this.safeNumber (item, 5);
        const after = this.safeNumber (item, 6);
        const description = this.safeString (item, 8);
        if (description !== undefined) {
            const parts = description.split (' @ ');
            const first = this.safeStringLower (parts, 0);
            type = this.parseLedgerEntryType (first);
        }
        return {
            'id': id,
            'direction': undefined,
            'account': undefined,
            'referenceId': id,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': after,
            'status': undefined,
            'fee': undefined,
            'info': item,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitfinex2#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        let method = 'privatePostAuthRLedgersHist';
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['uppercaseId'];
            method = 'privatePostAuthRLedgersCurrencyHist';
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 2500
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         [
        //             2531822314, // ID: Ledger identifier
        //             "USD", // CURRENCY: The symbol of the currency (ex. "BTC")
        //             null, // PLACEHOLDER
        //             1573521810000, // MTS: Timestamp in milliseconds
        //             null, // PLACEHOLDER
        //             0.01644445, // AMOUNT: Amount of funds moved
        //             0, // BALANCE: New balance
        //             null, // PLACEHOLDER
        //             "Settlement @ 185.79 on wallet margin" // DESCRIPTION: Description of ledger transaction
        //         ]
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }
};
