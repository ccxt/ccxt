'use strict';

//  ---------------------------------------------------------------------------

const Precise = require ('./base/Precise');
const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class poloniexfutures extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniexfutures',
            'name': 'Poloniex Futures',
            'countries': [ 'US' ],
            // 'rateLimit': 1000, // up to 6 calls per second
            'certified': false,
            'pro': false,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': true,
                'swap': true,
                'future': false,
                'option': undefined,
                'fetchCurrencies': false,
                'fetchMarkets': true,
            },
            'timeframes': {
                // TODO
                // '5m': 300,
                // '15m': 900,
                // '30m': 1800,
                // '2h': 7200,
                // '4h': 14400,
                // '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://futures-api.poloniex.com',
                    'private': 'https://futures-api.poloniex.com',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://futures-docs.poloniex.com',
                'fees': 'https://poloniex.com/fee-schedule',
                'referral': 'https://poloniex.com/signup?c=UBFZJRPJ',
            },
            'api': {
                'public': {
                    'get': [
                        'contracts/active',
                        'contracts/{symbol}',
                        'ticker',
                        'ticker', // v2
                        'tickers', // v2
                        'level2/snapshot',
                        'level2/depth',
                        'level2/message/query',
                        'level3/snapshot', // v2
                        'trade/history',
                        'interest/query',
                        'index/query',
                        'mark-price/{symbol}/current',
                        'premium/query',
                        'funding-rate/{symbol}/current',
                        'timestamp',
                        'status',
                        'kline/query',
                    ],
                    'post': [
                        'bullet-public',
                    ],
                },
                'private': {
                    'get': [
                        'account-overview',
                        'transaction-history',
                        'orders',
                        'stopOrders',
                        'recentDoneOrders',
                        'orders/{order-id}',
                        'fills',
                        'openOrderStatistics',
                        'position',
                        'positions',
                        'funding-history',
                    ],
                    'post': [
                        'orders',
                        'orders',
                        'position/margin/auto-deposit-status',
                        'position/margin/deposit-margin',
                        'bullet-private',
                    ],
                    'delete': [
                        'orders/{order-id}',
                        'orders',
                        'stopOrders',
                    ],
                },
            },
            'fees': {
                // TODO
                // 'trading': {
                //     'feeSide': 'get',
                //     // starting from Jan 8 2020
                //     'maker': this.parseNumber ('0.0009'),
                //     'taker': this.parseNumber ('0.0009'),
                // },
                // 'funding': {},
            },
            'limits': {
                // TODO
                // 'amount': {
                //     'min': 0.000001,
                //     'max': undefined,
                // },
                // 'price': {
                //     'min': 0.00000001,
                //     'max': 1000000000,
                // },
                // 'cost': {
                //     'min': 0.00000000,
                //     'max': 1000000000,
                // },
            },
            'precision': {
                // TODO
                // 'amount': 8,
                // 'price': 8,
            },
            'commonCurrencies': {
                // 'AIR': 'AirCoin',
                // 'APH': 'AphroditeCoin',
                // 'BCC': 'BTCtalkcoin',
                // 'BCHABC': 'BCHABC',
                // 'BDG': 'Badgercoin',
                // 'BTM': 'Bitmark',
                // 'CON': 'Coino',
                // 'GOLD': 'GoldEagles',
                // 'GPUC': 'GPU',
                // 'HOT': 'Hotcoin',
                // 'ITC': 'Information Coin',
                // 'KEY': 'KEYCoin',
                // 'MASK': 'NFTX Hashmasks Index', // conflict with Mask Network
                // 'MEME': 'Degenerator Meme', // Degenerator Meme migrated to Meme Inu, this exchange still has the old price
                // 'PLX': 'ParallaxCoin',
                // 'REPV2': 'REP',
                // 'STR': 'XLM',
                // 'SOC': 'SOCC',
                // 'TRADE': 'Unitrade',
                // 'XAP': 'API Coin',
                // // this is not documented in the API docs for Poloniex
                // // https://github.com/ccxt/ccxt/issues/7084
                // // when the user calls withdraw ('USDT', amount, address, tag, params)
                // // with params = { 'currencyToWithdrawAs': 'USDTTRON' }
                // // or params = { 'currencyToWithdrawAs': 'USDTETH' }
                // // fetchWithdrawals ('USDT') returns the corresponding withdrawals
                // // with a USDTTRON or a USDTETH currency id, respectfully
                // // therefore we have map them back to the original code USDT
                // // otherwise the returned withdrawals are filtered out
                // 'USDTTRON': 'USDT',
                // 'USDTETH': 'USDT',
            },
            'options': {
                'networks': {
                    // TODO
                    // 'ERC20': 'ETH',
                    // 'TRX': 'TRON',
                    // 'TRC20': 'TRON',
                },
                'limits': {
                    // TODO
                    // 'cost': {
                    //     'min': {
                    //         'BTC': 0.0001,
                    //         'ETH': 0.0001,
                    //         'USDT': 1.0,
                    //         'TRX': 100,
                    //         'BNB': 0.06,
                    //         'USDC': 1.0,
                    //         'USDJ': 1.0,
                    //         'TUSD': 0.0001,
                    //         'DAI': 1.0,
                    //         'PAX': 1.0,
                    //         'BUSD': 1.0,
                    //     },
                    // },
                },
                'versions': {
                    'public': {
                        'GET': {
                            'ticker': 'v2',
                            'tickers': 'v2',
                            'level3/snapshot': 'v2',
                        },
                    },
                },
                'requiredCredentials': {
                    'apiKey': true,
                    'secret': true,
                    'password': true,
                },
            },
            'exceptions': {
                // TODO
                // 'exact': {
                //     'You may only place orders that reduce your position.': InvalidOrder,
                //     'Invalid order number, or you are not the person who placed the order.': OrderNotFound,
                //     'Permission denied': PermissionDenied,
                //     'Permission denied.': PermissionDenied,
                //     'Connection timed out. Please try again.': RequestTimeout,
                //     'Internal error. Please try again.': ExchangeNotAvailable,
                //     'Currently in maintenance mode.': OnMaintenance,
                //     'Order not found, or you are not the person who placed it.': OrderNotFound,
                //     'Invalid API key/secret pair.': AuthenticationError,
                //     'Please do not make more than 8 API calls per second.': DDoSProtection,
                //     'Rate must be greater than zero.': InvalidOrder, // {"error":"Rate must be greater than zero."}
                //     'Invalid currency pair.': BadSymbol, // {"error":"Invalid currency pair."}
                //     'Invalid currencyPair parameter.': BadSymbol, // {"error":"Invalid currencyPair parameter."}
                //     'Trading is disabled in this market.': BadSymbol, // {"error":"Trading is disabled in this market."}
                //     'Invalid orderNumber parameter.': OrderNotFound,
                //     'Order is beyond acceptable bounds.': InvalidOrder, // {"error":"Order is beyond acceptable bounds.","fee":"0.00155000","currencyPair":"USDT_BOBA"}
                // },
                // 'broad': {
                //     'Total must be at least': InvalidOrder, // {"error":"Total must be at least 0.0001."}
                //     'This account is frozen.': AccountSuspended,
                //     'This account is locked.': AccountSuspended, // {"error":"This account is locked."}
                //     'Not enough': InsufficientFunds,
                //     'Nonce must be greater': InvalidNonce,
                //     'You have already called cancelOrder or moveOrder on this order.': CancelPending,
                //     'Amount must be at least': InvalidOrder, // {"error":"Amount must be at least 0.000001."}
                //     'is either completed or does not exist': OrderNotFound, // {"error":"Order 587957810791 is either completed or does not exist."}
                //     'Error pulling ': ExchangeError, // {"error":"Error pulling order book"}
                // },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchMarkets
         * @description retrieves data on all markets for poloniex futures
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetContractsActive (params);
        //
        // {
        //  "code": "200000",
        //  "data": [
        //     {
        //       symbol: 'APTUSDTPERP',
        //       takerFixFee: '0E-10',
        //       nextFundingRateTime: '20145603',
        //       makerFixFee: '0E-10',
        //       type: 'FFWCSX',
        //       predictedFundingFeeRate: '0.000000',
        //       turnoverOf24h: '386037.46704292',
        //       initialMargin: '0.05',
        //       isDeleverage: true,
        //       createdAt: '1666681959000',
        //       fundingBaseSymbol: '.APTINT8H',
        //       lowPriceOf24h: '4.34499979019165',
        //       lastTradePrice: '4.4090000000',
        //       indexPriceTickSize: '0.001',
        //       fairMethod: 'FundingRate',
        //       takerFeeRate: '0.00040',
        //       order: '102',
        //       updatedAt: '1671076377000',
        //       displaySettleCurrency: 'USDT',
        //       indexPrice: '4.418',
        //       multiplier: '1.0',
        //       maxLeverage: '20',
        //       fundingQuoteSymbol: '.USDTINT8H',
        //       quoteCurrency: 'USDT',
        //       maxOrderQty: '1000000',
        //       maxPrice: '1000000.0000000000',
        //       maintainMargin: '0.025',
        //       status: 'Open',
        //       displayNameMap: [Object],
        //       openInterest: '2367',
        //       highPriceOf24h: '4.763999938964844',
        //       fundingFeeRate: '0.000000',
        //       volumeOf24h: '83540.00000000',
        //       riskStep: '500000',
        //       isQuanto: true,
        //       maxRiskLimit: '20000',
        //       rootSymbol: 'USDT',
        //       baseCurrency: 'APT',
        //       firstOpenDate: '1666701000000',
        //       tickSize: '0.001',
        //       markMethod: 'FairPrice',
        //       indexSymbol: '.PAPTUSDT',
        //       markPrice: '4.418',
        //       minRiskLimit: '1000000',
        //       settlementFixFee: '0E-10',
        //       settlementSymbol: '',
        //       priceChgPctOf24h: '-0.0704',
        //       fundingRateSymbol: '.APTUSDTPERPFPI8H',
        //       makerFeeRate: '0.00010',
        //       isInverse: false,
        //       lotSize: '1',
        //       settleCurrency: 'USDT',
        //       settlementFeeRate: '0.0'
        //     },
        //   ]
        // }
        //
        const result = [];
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const settleId = this.safeString (market, 'rootSymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const inverse = this.safeValue (market, 'isInverse');
            const status = this.safeString (market, 'status');
            const multiplier = this.safeString (market, 'multiplier');
            const tickSize = this.safeNumber (market, 'indexPriceTickSize');
            const lotSize = this.safeNumber (market, 'lotSize');
            const limitAmountMax = this.safeNumber (market, 'maxOrderQty');
            const limitPriceMax = this.safeNumber (market, 'maxPrice');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': (status === 'Open'),
                'contract': true,
                'linear': !inverse,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.parseNumber (Precise.stringAbs (multiplier)),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': lotSize,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': lotSize,
                        'max': limitAmountMax,
                    },
                    'price': {
                        'min': tickSize,
                        'max': limitPriceMax,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const versions = this.safeValue (this.options, 'versions', {});
        const apiVersions = this.safeValue (versions, api, {});
        const methodVersions = this.safeValue (apiVersions, method, {});
        const defaultVersion = this.safeString (methodVersions, path, this.version);
        const version = this.safeString (params, 'version', defaultVersion);
        const tail = '/api/' + version + '/' + this.implodeParams (path, params);
        url += tail;
        const query = this.omit (params, path);
        if (api === 'public') {
            const queryLength = Object.keys (query).length;
            if (queryLength) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (query);
            const now = this.milliseconds ().toString ();
            const str_to_sign = now + method + tail;
            const signature = this.hmac (this.encode (this.secret), this.encode (str_to_sign), 'sha256', 'base64');
            headers = {
                'PF-API-SIGN': signature,
                'PF-API-TIMESTAMP': now,
                'PF-API-KEY': this.apiKey,
                'PF-API-PASSPHRASE': this.password,
            };
            // const signature = base64.b64encode (
            //     hmac.new (
            //         api_secret.encode('utf-8'),
            //         str_to_sign.encode('utf-8'),
            //         hashlib.sha256
            //     ).digest ()
            // )
        }
        console.log (url);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // {"error":"Permission denied."}
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
