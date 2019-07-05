'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, AuthenticationError, InvalidOrder, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class mandala extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mandala',
            'name': 'Mandala',
            'countries': [ 'MT' ],
            'version': 'v1.1',
            'rateLimit': 1500,
            'certified': false,
            // new metainfo interface
            'has': {
                'cancelAllOrders': true,
                'CORS': true,
                'createDepositAddress': true,
                'createMarketOrder': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderStatus': true,
                'fetchTickers': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '1h': '60',
                '1d': '1440',
            },
            'comment': 'Modulus Exchange API ',
            'hostname': 'mandalaex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/54686665-df629400-4b2a-11e9-84d3-d88856367dd7.jpg',
                'api': 'https://zapi.{hostname}',
                'www': 'https://mandalaex.com',
                'doc': [
                    'https://apidocs.mandalaex.com',
                ],
                'fees': [
                    'https://mandalaex.com/trading-rules/',
                ],
                'referral': 'https://trade.mandalaex.com/?ref=564377',
            },
            'api': {
                'settings': {
                    'get': [
                        'getCoinInfo', // FIX ME, this endpoint is documented, but broken: https://zapi.mandalaex.com/api/getCoinInfo
                        'GetSettings',
                        'CurrencySettings',
                        'Get_Withdrawal_Limits',
                    ],
                },
                'token': {
                    'post': [
                        'token',
                    ],
                },
                'public': {
                    'post': [
                        'AuthenticateUser',
                        'ForgotPassword',
                        'SignUp',
                        'check_Duplicate_Mobile',
                        'check_Duplicate_Email',
                    ],
                },
                'api': {
                    'get': [
                        'GAuth_Check_Status',
                        'GAuth_Enable_Request',
                        'GetProfile',
                        'Loginhistory',
                        'ListAllAddresses',
                        'Get_User_Withdrawal_Limits',
                        'GetPendingOrders', // ?side=aLL&pair=ALL&timestamp=1541240408&recvWindow=3600',
                        'TradeHistory', // ?side=ALL&pair=ALL&timestamp=1550920234&recvWindow=10000&count=100&page=1',
                        'GOKYC_Get_Kyc_Form',
                        'language_list',
                        'language', // ?code=en&namespace=translation',
                        'get_page_n_content',
                        'GetExchangeTokenDiscountEnrollmentStatus',
                        'GetDiscountTiers',
                        'My_Affiliate',
                        'Affiliate_Summary',
                        'Affiliate_Commission',
                        'List_Fiat_Manual_Deposit_Requests',
                        'List_Fiat_BanksList/YCN/',
                        'Get_Fiat_PGs', // ?Currency=TRY',
                        'get_insta_pairs',
                        'hmac', // ?side=BUY&market=BTC&trade=ETH&type=STOPLIMIT&volume=0.025&rate=0.032&timeInForce=GTC&stop=2&',
                    ],
                    'post': [
                        'GAuth_Set_Enable',
                        'GAuth_Disable_Request',
                        'VerifyAccount',
                        'SignUp_Resend_Email',
                        'AuthenticateUser_Resend_EmailOTP/{tempAuthToken}',
                        'Validate_BearerToken',
                        'RequestChangePasswordOT',
                        'ChangePassword',
                        'ResetPassword',
                        'GenerateAddress',
                        'GetBalance',
                        'GetDeposits',
                        'GetWithdrawals',
                        'RequestWithdraw',
                        'RequestWithdrawConfirmation',
                        'RequestTransfer_AeraPass',
                        'PlaceOrder',
                        'PlaceOrder_Priced',
                        'CancelOrder',
                        'KYC_GetSumAndSub_AccessToken',
                        'KYC_SaveSumAndSubstanceApplicationId',
                        'GOKYC_Submit_KYC_Form',
                        'SetExchangeTokenDiscountEnrollment',
                        'Dis_Enroll_ExchangeTokenDiscount',
                        'Webhook_BitGoDeposit',
                        'Add_Fiat_Manual_Deposit_Request',
                        'Add_Fiat_Manual_Withdrawal_Request',
                        'Add_Fiat_PG_Deposit_Request',
                        'ListApiKey',
                        'GenerateApiKey',
                        'DeleteApiKey',
                        'request_insta_trade',
                        'confirm_insta_trade',
                        'simplex_get_quote',
                        'simplex_payment',
                        'hmac',
                        'import_translations',
                    ],
                },
                'market': {
                    'get': [
                        'get-market-summary',
                        'get-market-summary/{marketId}',
                        'get-trade-history/{marketId}',
                        'get-bid_ask-price/{marketId}',
                        'get-open-orders/{marketId}/{side}/{depth}',
                        'get-currency-price/{marketId}',
                        'get-currency-usd-rate/{currencyId}',
                        'depth', // ?symbol=BTC_ETH&limit=10
                        'get-chart-data', // ?baseCurrency=BTC&quoteCurrency=ETH&interval=60&limit=200&timestamp=1541228704517
                    ],
                },
                'order': {
                    'get': [
                        'my-order-history/{key}/{side}',
                        'my-order-history/{key}/{side}/{orderId}',
                        'my-order-status/{key}/{side}/{orderId}',
                        'my-trade-history', // ?side=BUY&pair=BTC_ETH&orderID=13165837&apiKey=d14b1eb4-fe1f-4bfc-896d-97285975989e
                        'hmac', // ?side=BUY&market=BTC&trade=ETH&type=STOPLIMIT&volume=0.025&rate=0.032&timeInForce=GTC&stop=2&'
                    ],
                    'post': [
                        'PlaceOrder',
                        'cancel-my-order',
                        'cancel-all-my-orders',
                        'get-balance',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.005,
                    'taker': 0.005,
                },
            },
            'exceptions': {
                'exact': {
                    'Failure_General': ExchangeError, // {"Status":"Error","Message":"Failure_General","Data":"Cannot roll back TransBuyOrder. No transaction or savepoint of that name was found."}
                    'Exception_Insufficient_Funds': InsufficientFunds, // {"Status":"Error","Message":"Exception_Insufficient_Funds","Data":"Insufficient Funds."}
                    'Exception_TimeStamp': BadRequest, // {"status":"BadRequest","message":"Exception_TimeStamp","data":"Invalid timestamp."}
                    'Exception_HMAC_Validation': AuthenticationError, // {"status":"Error","message":"Exception_HMAC_Validation","data":"HMAC validation failed."}
                    'Exception_General': BadRequest, // {"status":"BadRequest","message":"Exception_General","data":"Our servers are experiencing some glitch, please try again later."}
                    'Must provide the orderID param.': BadRequest, // {"Status":"BadRequest","Message":"Must provide the orderID param.","Data":null}
                    'Invalid Market_Currency pair!': ExchangeError, // {"status":"Error","errorMessage":"Invalid Market_Currency pair!","data":null}
                    'Invalid volume parameter.': InvalidOrder, // {"Status":"BadRequest","Message":"Invalid volume parameter.","Data":null}
                    'Invalid rate parameter.': InvalidOrder, // {"Status":"BadRequest","Message":"Invalid rate parameter.","Data":null}
                    "Invalid parameter 'side', must be 'BUY' or 'SELL'.": InvalidOrder, // {"Status":"BadRequest","Message":"Invalid parameter 'side', must be 'BUY' or 'SELL'.","Data":null}
                    'Invalid Type': BadRequest, // on fetchOrders with a wrong type {"status":"Error","errorMessage":"Invalid Type","data":null}
                    'Exception_Invalid_CurrencyName': BadRequest, // {"status":"BadRequest","message":"Exception_Invalid_CurrencyName","data":"Invalid Currency name"}
                    'Exception_BadRequest': BadRequest, // {"status":"BadRequest","message":"Exception_BadRequest","data":"Invalid Payload"}
                },
                'broad': {
                },
            },
            'options': {
                'symbolSeparator': '_',
                'api': {
                    'settings': 'api',
                    'public': 'api',
                },
                'fetchCurrencies': {
                    'expires': 5000,
                },
                // https://documenter.getpostman.com/view/5614390/RWguuvfd#a74ee943-3b7a-415e-9315-a7bf204db09d
                // HMAC can be obtained using a Secret key. Thispre shared secret key ensures that the message is encrypted by a legitimate source. You can get a secret key issued for your sandbox enviroment by writing an email to support@modulus.io
                // Secret-Key : 03c06dd7-4982-441a-910d-5fd2cbb3f1c6
                'secret': '03c06dd7-4982-441a-910d-5fd2cbb3f1c6',
            },
        });
    }

    async signIn (params = {}) {
        if (!this.login || !this.password) {
            throw new AuthenticationError (this.id + ' signIn() requires this.login (email) and this.password credentials');
        }
        const authenticateRequest = {
            'email': this.login,
            'password': this.password,
        };
        const authenticateResponse = await this.publicPostAuthenticateUser (authenticateRequest);
        //
        //     {
        //         status: 'Success',
        //         message: 'Success!',
        //         data: {
        //             tempAuthToken: 'e1b0603a-5996-4bac-9ec4-f097a02d9696',
        //             tokenExpiry: '2019-03-19T21:16:15.999201Z',
        //             twoFAMehtod: 'GAuth'
        //         }
        //     }
        //
        const data = this.safeValue (authenticateResponse, 'data', {});
        const tempAuthToken = this.safeString (data, 'tempAuthToken');
        let otp = undefined;
        if (this.twofa !== undefined) {
            otp = this.oath ();
        }
        otp = this.safeString (params, 'password', otp);
        if (otp === undefined) {
            throw new AuthenticationError (this.id + ' signIn() requires this.twofa credential or a one-time 2FA "password" parameter');
        }
        const tokenRequest = {
            'grant_type': 'password',
            'username': tempAuthToken,
            'password': otp,
        };
        const tokenResponse = await this.tokenPostToken (this.extend (tokenRequest, params));
        //
        //     {
        //         "access_token": "WWRNCO--bFjX3zKAixROAjy3dbU0csNoI91PXpT1oScTrik50mVrSIbr22HrsJV5ATXgN867vy66pxY7IzMQGzYtz-7KTxUnL6uPbQpiveBgPEGD5drpvh5KwhcCOzFelJ1-OxZa6g6trx82x2YqQI7Lny0VkAIEv-EBQT8B4C_UVYhoMVCzYumeQgcxtyXc9hoRolVUwwQ965--LrAYIybBby85LzRRIfh7Yg_CVSx6zehAcHFUeKh2tE4NwN9lYweeDEPb6z2kHn0UJb18nxYcC3-NjgiyublBiY1AI_U",
        //         "token_type": "bearer",
        //         "expires_in": 86399
        //     }
        //
        const expiresIn = this.safeInteger (tokenResponse, 'expires_in');
        this.options['expires'] = this.sum (this.milliseconds (), expiresIn * 1000);
        this.options['accessToken'] = this.safeString (tokenResponse, 'accessToken');
        this.options['tokenType'] = this.safeString (tokenResponse, 'token_type');
        // const accessToken = this.safeValue (tokenResponse, 'access_token');
        // this.headers['Authorization'] = 'Bearer ' + accessToken;
        return tokenResponse;
    }

    async fetchCurrenciesFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.settingsGetCurrencySettings (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchCurrencies'], 'response');
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        this.options['currencies'] = {
            'timestamp': this.milliseconds (),
            'response': response,
        };
        //
        //     {
        //         status: 'Success',
        //         message: 'Success!',
        //         data: [
        //             {
        //                 shortName: 'BAT',
        //                 fullName: 'Basic Attention Token',
        //                 buyServiceCharge: 0.5,
        //                 sellServiceCharge: 0.5,
        //                 withdrawalServiceCharge: 0.25,
        //                 withdrawalServiceChargeInBTC: 0,
        //                 confirmationCount: 29,
        //                 contractAddress: null,
        //                 minWithdrawalLimit: 100,
        //                 maxWithdrawalLimit: 2000000,
        //                 decimalPrecision: 18,
        //                 tradeEnabled: true,
        //                 depositEnabled: true,
        //                 withdrawalEnabled: true,
        //                 secondaryWalletType: '',
        //                 addressSeparator: '',
        //                 walletType: 'BitGo',
        //                 withdrawalServiceChargeType: 'Percentage',
        //             },
        //             {
        //                 shortName: 'BCH',
        //                 fullName: 'BitcoinCash',
        //                 buyServiceCharge: 0.5,
        //                 sellServiceCharge: 0.5,
        //                 withdrawalServiceCharge: 0.25,
        //                 withdrawalServiceChargeInBTC: 0.001,
        //                 confirmationCount: 3,
        //                 contractAddress: null,
        //                 minWithdrawalLimit: 0.1,
        //                 maxWithdrawalLimit: 300,
        //                 decimalPrecision: 8,
        //                 tradeEnabled: true,
        //                 depositEnabled: true,
        //                 withdrawalEnabled: true,
        //                 secondaryWalletType: '',
        //                 addressSeparator: '',
        //                 walletType: 'BitGo',
        //                 withdrawalServiceChargeType: 'Percentage',
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'shortName');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'fullName');
            const precision = this.safeInteger (currency, 'decimalPrecision');
            let active = true;
            const canWithdraw = this.safeValue (currency, 'withdrawalEnabled');
            const canDeposit = this.safeValue (currency, 'depositEnabled');
            if (!canWithdraw || !canDeposit) {
                active = false;
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'precision': precision,
                'fee': this.safeFloat (currency, 'withdrawalServiceCharge') / 100,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawalLimit'),
                        'max': this.safeFloat (currency, 'maxWithdrawalLimit'),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const currenciesResponse = await this.fetchCurrenciesFromCache (params);
        const currencies = this.safeValue (currenciesResponse, 'data', []);
        const currenciesById = this.indexBy (currencies, 'shortName');
        const response = await this.marketGetGetMarketSummary ();
        //
        //     {
        //         status: 'Success',
        //         errorMessage: null,
        //         data: {
        //             BTC_BAT:
        //                 Last: 0.00003431,
        //                 LowestAsk: 0,
        //                 HeighestBid: 0,
        //                 PercentChange: 0,
        //                 BaseVolume: 0,
        //                 QuoteVolume: 0,
        //                 High_24hr: 0,
        //                 Low_24hr: 0,
        //             },
        //             ETH_ZRX: {
        //                 Last: 0.00213827,
        //                 LowestAsk: 0,
        //                 HeighestBid: 0,
        //                 PercentChange: 0,
        //                 BaseVolume: 0,
        //                 QuoteVolume: 0,
        //                 High_24hr: 0,
        //                 Low_24hr: 0,
        //             },
        //         },
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', {});
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = data[id];
            const [ quoteId, baseId ] = id.split ('_');  // they have base/quote reversed with some endpoints
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const baseCurrency = this.safeValue (currenciesById, baseId, {});
            const quoteCurrency = this.safeValue (currenciesById, quoteId, {});
            const precision = {
                'amount': this.safeInteger (baseCurrency, 'decimalPrecision', 8),
                'price': this.safeInteger (quoteCurrency, 'decimalPrecision', 8),
            };
            const baseTradeEnabled = this.safeValue (baseCurrency, 'tradeEnabled', true);
            const quoteTradeEnabled = this.safeValue (quoteCurrency, 'tradeEnabled', true);
            const active = baseTradeEnabled && quoteTradeEnabled;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': 'ALL',
        };
        const response = await this.orderPostGetBalance (this.extend (request, params));
        //
        //     {
        //         Status: 'Success',
        //         Message: null,
        //         Data: [
        //             { currency: 'BCH', balance: 0, balanceInTrade: 0 },
        //             { currency: 'BTC', balance: 0, balanceInTrade: 0 },
        //             ...,
        //         ],
        //     }
        //
        const data = this.safeValue (response, 'Data', []);
        const result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'balanceInTrade');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 10;
        }
        const request = {
            'symbol': this.marketId (symbol),
            'limit': limit,
        };
        const response = await this.marketGetDepth (this.extend (request, params));
        // https://documenter.getpostman.com/view/6273708/RznBP1Hh#19469d73-45b5-4dd1-8464-c043efb62e00
        //
        //     {
        //         status: 'Success',
        //         errorMessage: '',
        //         data: {
        //             lastUpdate: 1552825727108,
        //             bids: [
        //                 [ "0.02880201", "0.05939008", []],
        //                 [ "0.02880200", "0.30969842", []],
        //             ],
        //             'asks': [
        //                 [ "0.02877161", "0.00001779", []],
        //                 [ "0.02881321", "0.47325696", []],
        //             ],
        //         },
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'lastUpdate');
        return this.parseOrderBook (data, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //     {
        //         Pair: 'ETH_MDX', // FIXME missing in fetchTickers
        //         Last: 0.000055,
        //         LowestAsk: 0.000049,
        //         HeighestBid: 0.00003,
        //         PercentChange: 12.47,
        //         BaseVolume: 34.60345,
        //         QuoteVolume: 629153.63636364,
        //         IsFrozen: false, // FIXME missing in fetchTickers
        //         High_24hr: 0,
        //         Low_24hr: 0
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'Pair');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const last = this.safeFloat (ticker, 'Last');
        return {
            'symbol': symbol,
            'timestamp': undefined, // FIXME, no timestamp in tickers
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'High_24hr'),
            'low': this.safeFloat (ticker, 'Low_24hr'),
            'bid': this.safeFloat (ticker, 'HeighestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'LowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'PercentChange'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'QuoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'BaseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.marketGetGetMarketSummary (params);
        //
        //     {
        //         status: 'Success',
        //         errorMessage: null,
        //         data: {
        //             BTC_BAT: {
        //                 Last: 0.00003431,
        //                 LowestAsk: 0,
        //                 HeighestBid: 0,
        //                 PercentChange: 0,
        //                 BaseVolume: 0,
        //                 QuoteVolume: 0,
        //                 High_24hr: 0,
        //                 Low_24hr: 0,
        //             },
        //             ETH_ZRX: {
        //                 Last: 0.00213827,
        //                 LowestAsk: 0,
        //                 HeighestBid: 0,
        //                 PercentChange: 0,
        //                 BaseVolume: 0,
        //                 QuoteVolume: 0,
        //                 High_24hr: 0,
        //                 Low_24hr: 0,
        //             },
        //         },
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const ids = Object.keys (data);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const ticker = data[id];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (id);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'marketId': this.marketId (symbol),
        };
        const response = await this.marketGetGetMarketSummaryMarketId (this.extend (request, params));
        //
        //     {
        //         status: 'Success',
        //         errorMessage: null,
        //         data: {
        //             Pair: 'ETH_MDX',
        //             Last: 0.000055,
        //             LowestAsk: 0.000049,
        //             HeighestBid: 0.00003,
        //             PercentChange: 12.47,
        //             BaseVolume: 34.60345,
        //             QuoteVolume: 629153.63636364,
        //             IsFrozen: false,
        //             High_24hr: 0,
        //             Low_24hr: 0
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTicker (data);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         TradeID:  619255,
        //         Rate:  0.000055,
        //         Volume:  79163.63636364,
        //         Total:  4.354,
        //         Date: "2019-03-16T23:14:48.613",
        //         Type: "Buy"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         orderId: 20000040,
        //         market: 'ETH',
        //         trade: 'MDX',
        //         volume: 1,
        //         rate: 2,
        //         amount: 2,
        //         serviceCharge: 0.003,
        //         side: 'SELL',
        //         date: '2019-03-20T01:47:09.14'
        //     }
        //
        const timestamp = this.parse8601 (this.safeString2 (trade, 'Date', 'date'));
        let side = this.safeString2 (trade, 'Type', 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const id = this.safeString (trade, 'TradeID');
        let symbol = undefined;
        const baseId = this.safeString (trade, 'trade');
        const quoteId = this.safeString (trade, 'market');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        if (base !== undefined && quote !== undefined) {
            symbol = base + '/' + quote;
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const cost = this.safeFloat2 (trade, 'Total', 'amount');
        const price = this.safeFloat2 (trade, 'Rate', 'rate');
        const amount = this.safeFloat2 (trade, 'Volume', 'volume');
        const orderId = this.safeString (trade, 'orderId');
        const feeCost = this.safeValue (trade, 'serviceCharge');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': quote,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        // this endpoint returns last 50 trades
        const response = await this.marketGetGetTradeHistoryMarketId (this.extend (request, params));
        //
        //     {
        //         status:   "Success",
        //         errorMessage:    null,
        //         data: [
        //             {
        //                 TradeID:  619255,
        //                 Rate:  0.000055,
        //                 Volume:  79163.63636364,
        //                 Total:  4.354,
        //                 Date: "2019-03-16T23:14:48.613",
        //                 Type: "Buy"
        //             },
        //             {
        //                 TradeID:  619206,
        //                 Rate:  0.000073,
        //                 Volume:  7635.50136986,
        //                 Total:  0.5573916,
        //                 Date: "2019-02-13T16:49:54.02",
        //                 Type: "Sell"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     {
        //         time: 1552830600000,
        //         open: 0.000055,
        //         close: 0.000055,
        //         high: 0.000055,
        //         low: 0.000055,
        //         volume: 0,
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100; // default is 100
        }
        const offset = this.parseTimeframe (timeframe) * this.sum (limit, 1) * 1000;
        if (since === undefined) {
            since = this.milliseconds () - offset;
        }
        const request = {
            'interval': this.timeframes[timeframe],
            'baseCurrency': market['baseId'], // they have base/quote reversed with some endpoints
            'quoteCurrency': market['quoteId'],
            'limit': limit,
            'timestamp': this.sum (since, offset),
        };
        const response = await this.marketGetGetChartData (this.extend (request, params));
        //
        //     {
        //         status: 'Success',
        //         errorMessage: null,
        //         data: [
        //             {
        //                 time: 1552830600000,
        //                 open: 0.000055,
        //                 close: 0.000055,
        //                 high: 0.000055,
        //                 low: 0.000055,
        //                 volume: 0,
        //             },
        //             {
        //                 time: 1552830540000,
        //                 open: 0.000055,
        //                 close: 0.000055,
        //                 high: 0.000055,
        //                 low: 0.000055,
        //                 volume: 0,
        //             },
        //         ],
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let orderPrice = price;
        if (type === 'market') {
            orderPrice = 0;
        }
        const request = {
            'market': market['quoteId'],
            'trade': market['baseId'],
            'type': type.toUpperCase (), // MARKET, LIMIT, STOPLIMIT
            'side': side.toUpperCase (), // BUY, SELL
            // Here GTC should be default for LIMIT, MARKET & STOP LIMIT Orders.
            // IOC,FOK, DO must be passed only with a LIMIT order.
            // GTC (Good till cancelled), IOC (Immediate or cancel), FOK (Fill or Kill), Do (Day only)
            'timeInForce': 'GTC',
            'rate': this.priceToPrecision (symbol, orderPrice),
            'volume': this.amountToPrecision (symbol, amount),
            // the stop-price at which a stop-limit order
            // triggers and becomes a limit order
            'stop': 0, // stop is always zero for limit and market orders
            // 'clientOrderId': this.uuid (),
        };
        const response = await this.orderPostPlaceOrder (this.extend (request, params));
        //
        //     {
        //         Status: 'Success',
        //         Message: 'Success!',
        //         Data: {
        //             orderId: 20000031,
        //         },
        //     }
        //
        const data = this.safeValue (response, 'Data', {});
        const order = this.parseOrder (data, market);
        return this.extend (order, {
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'status': 'open',
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an order `side` extra parameter');
        }
        params = this.omit (params, 'side');
        id = id.toString ();
        const request = {
            'orderId': id,
            'side': side.toUpperCase (),
        };
        const response = await this.orderPostCancelMyOrder (this.extend (request, params));
        //
        //     {
        //         Status: 'Success',
        //         Message: 'Success_General',
        //         Data: 'Success!'
        //     }
        //
        return this.parseOrder (response, {
            'id': id,
            'symbol': symbol,
            'side': side.toLowerCase (),
            'status': 'canceled',
        });
    }

    async cancelAllOrders (symbols = undefined, params = {}) {
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires an order `side` extra parameter');
        }
        params = this.omit (params, 'side');
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a `symbols` argument (a list containing one symbol)');
        } else {
            const numSymbols = symbols.length;
            if (numSymbols !== 1) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a `symbols` argument (a list containing one symbol)');
            }
        }
        const symbol = symbols[0];
        const request = {
            'side': side.toUpperCase (),
            'pair': this.marketId (symbol),
        };
        return await this.orderPostCancelAllMyOrders (this.extend (request, params));
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.safeCurrencyCode (base);
        quote = this.safeCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrders
        //
        //     {
        //         orderId: 20000038,
        //         market: 'BTC',
        //         trade: 'ETH',
        //         volume: 1,
        //         pendingVolume: 1,
        //         orderStatus: false,
        //         rate: 1,
        //         amount: 1,
        //         serviceCharge: 0,
        //         placementDate: '2019-03-19T18:28:43.553',
        //         completionDate: null
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         orderId: 20000038,
        //         market: 'BTC',
        //         trade: 'ETH',
        //         volume: 1,
        //         rate: 1,
        //         side: 'SELL',
        //         date: '2019-03-19T18:28:43.553',
        //     }
        //
        // fetchOrderStatus
        //
        //     {
        //         "PendingVolume": 0.7368974,
        //         "Volume": 0.7368974,
        //         "Price": 0.22921771,
        //         "Status": true
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const baseId = this.safeString (order, 'trade');
        const quoteId = this.safeString (order, 'market');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = undefined;
        if (base !== undefined && quote !== undefined) {
            symbol = base + '/' + quote;
        }
        const completionDate = this.parse8601 (this.safeString (order, 'completionDate'));
        const timestamp = this.parse8601 (this.safeString2 (order, 'placementDate', 'date'));
        let price = this.safeFloat2 (order, 'rate', 'Price');
        const amount = this.safeFloat2 (order, 'volume', 'Volume');
        let cost = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat2 (order, 'pendingVolume', 'PendingVolume');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = Math.max (amount - remaining, 0);
        }
        if (!cost) {
            if (price && filled) {
                cost = price * filled;
            }
        }
        if (!price) {
            if (cost && filled) {
                price = cost / filled;
            }
        }
        let status = this.safeValue2 (order, 'orderStatus', 'Status');
        status = status ? 'closed' : 'open';
        let lastTradeTimestamp = undefined;
        if (filled > 0) {
            lastTradeTimestamp = completionDate;
        }
        if ((filled !== undefined) && (amount !== undefined)) {
            if ((filled < amount) && (status === 'closed')) {
                status = 'canceled';
            }
        }
        const feeCost = this.safeValue (order, 'serviceCharge');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': quote,
            };
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': undefined,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires an order `side` extra parameter');
        }
        params = this.omit (params, 'side');
        const request = {
            'key': this.apiKey,
            'side': side.toUpperCase (),
            // 'orderId': id,
        };
        const response = await this.orderGetMyOrderHistoryKeySide (this.extend (request, params));
        //
        //     {
        //         status: 'Success',
        //         errorMessage: null,
        //         data: [
        //             {
        //                 orderId: 20000038,
        //                 market: 'BTC',
        //                 trade: 'ETH',
        //                 volume: 1,
        //                 pendingVolume: 1,
        //                 orderStatus: false,
        //                 rate: 1,
        //                 amount: 1,
        //                 serviceCharge: 0,
        //                 placementDate: '2019-03-19T18:28:43.553',
        //                 completionDate: null
        //             },
        //             {
        //                 orderId: 20000037,
        //                 market: 'BTC',
        //                 trade: 'ETH',
        //                 volume: 1,
        //                 pendingVolume: 1,
        //                 orderStatus: true,
        //                 rate: 1,
        //                 amount: 1,
        //                 serviceCharge: 0,
        //                 placementDate: '2019-03-19T18:27:51.087',
        //                 completionDate: '2019-03-19T18:28:16.07'
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrders (data, market, since, limit, {
            'side': side.toLowerCase (),
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const side = this.safeString (params, 'side', 'ALL');
        params = this.omit (params, 'side');
        let market = undefined;
        let pair = 'ALL';
        if (symbol !== undefined) {
            market = this.market (symbol);
            pair = market['baseId'] + '-' + market['quoteId'];
        }
        const request = {
            'side': side.toUpperCase (),
            'pair': pair,
        };
        const response = await this.apiGetGetPendingOrders (this.extend (request, params));
        //
        //     {
        //         status: 'Success',
        //         message: 'Success!',
        //         data: [
        //             {
        //                 orderId: 20000038,
        //                 market: 'BTC',
        //                 trade: 'ETH',
        //                 volume: 1,
        //                 rate: 1,
        //                 side: 'SELL',
        //                 date: '2019-03-19T18:28:43.553',
        //             },
        //             {
        //                 orderId: 20000039,
        //                 market: 'BTC',
        //                 trade: 'ETH',
        //                 volume: 1,
        //                 rate: 2,
        //                 side: 'SELL',
        //                 date: '2019-03-19T18:48:12.033',
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires an order `side` extra parameter');
        }
        params = this.omit (params, 'side');
        id = id.toString ();
        const request = {
            'key': this.apiKey,
            'side': side.toUpperCase (),
            'orderId': id,
        };
        const response = await this.orderGetMyOrderStatusKeySideOrderId (this.extend (request, params));
        //
        //     {
        //         "status": "Success",
        //         "errorMessage": null,
        //         "data": {
        //             "PendingVolume": 0.7368974,
        //             "Volume": 0.7368974,
        //             "Price": 0.22921771,
        //             "Status": true
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.extend (this.parseOrder (data), {
            'id': id,
            'side': side.toLowerCase (),
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const side = this.safeString (params, 'side', 'ALL');
        params = this.omit (params, 'side');
        let market = undefined;
        let pair = 'ALL';
        if (symbol !== undefined) {
            market = this.market (symbol);
            pair = market['id'];
        }
        const request = {
            'side': side.toUpperCase (),
            'pair': pair,
            'orderID': -1,
            'apiKey': this.apiKey,
        };
        const response = await this.orderGetMyTradeHistory (this.extend (request, params));
        //
        //     {
        //         Status: 'Success',
        //         Message: null,
        //         Data: [
        //             {
        //                 orderId: 20000040,
        //                 market: 'ETH',
        //                 trade: 'MDX',
        //                 volume: 1,
        //                 rate: 2,
        //                 amount: 2,
        //                 serviceCharge: 0.003,
        //                 side: 'SELL',
        //                 date: '2019-03-20T01:47:09.14'
        //             },
        //             {
        //                 orderId: 20000041,
        //                 market: 'ETH',
        //                 trade: 'MDX',
        //                 volume: 0.5,
        //                 rate: 3,
        //                 amount: 1.5,
        //                 serviceCharge: 0.00225,
        //                 side: 'SELL',
        //                 date: '2019-03-20T01:49:20.42'
        //             },
        //             {
        //                 orderId: 20000041,
        //                 market: 'ETH',
        //                 trade: 'MDX',
        //                 volume: 0.25,
        //                 rate: 3,
        //                 amount: 0.75,
        //                 serviceCharge: 0.001125,
        //                 side: 'SELL',
        //                 date: '2019-03-20T01:51:01.307'
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'Data');
        return this.parseTrades (data, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        let requestCurrency = 'ALL';
        if (code !== undefined) {
            currency = this.currency (code);
            requestCurrency = currency['id'];
        }
        const request = {
            'currency': requestCurrency,
        };
        const response = await this.apiPostGetDeposits (this.extend (request, params));
        //
        //     {
        //         "status": "Success",
        //         "message": null,
        //         "data": {
        //             "deposits": [
        //                 {
        //                     ?
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const deposits = this.safeValue (data, 'deposits', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        let requestCurrency = 'ALL';
        if (code !== undefined) {
            currency = this.currency (code);
            requestCurrency = currency['id'];
        }
        const request = {
            'currency': requestCurrency,
        };
        const response = await this.apiPostGetWithdrawals (this.extend (request, params));
        //
        //     {
        //         "status": "Success",
        //         "message": null,
        //         "data": {
        //             "withdrawals": [
        //                 {
        //                     "withdrawalType": "ETH",
        //                     "withdrawalAddress": "0xE28CE3A999d6035d042D1a87FAab389Cb0B78Db6",
        //                     "withdrawalAmount": 0.071,
        //                     "txnHash": null,
        //                     "withdrawalReqDate": "2018-11-12T09:38:28.43",
        //                     "withdrawalConfirmDate": null,
        //                     "withdrawalStatus": "Pending"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const withdrawals = this.safeValue (data, 'withdrawals', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Pending': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         ?
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "withdrawalType": "ETH",
        //         "withdrawalAddress": "0xE28CE3A999d6035d042D1a87FAab389Cb0B78Db6",
        //         "withdrawalAmount": 0.071,
        //         "txnHash": null,
        //         "withdrawalReqDate": "2018-11-12T09:38:28.43",
        //         "withdrawalConfirmDate": null,
        //         "withdrawalStatus": "Pending"
        //     }
        //
        const id = undefined;
        const amount = this.safeFloat (transaction, 'withdrawalAmount');
        const address = this.safeString (transaction, 'withdrawalAddress');
        const tag = undefined;
        const txid = this.safeString (transaction, 'txnHash');
        const updated = this.parse8601 (this.safeValue (transaction, 'withdrawalConfirmDate'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'withdrawalReqDate', updated));
        const type = ('withdrawalReqDate' in transaction) ? 'withdrawal' : 'deposit';
        const currencyId = this.safeString (transaction, 'withdrawalType');
        const code = this.safeCurrencyCode (currencyId, currency);
        let status = this.parseTransactionStatus (this.safeString (transaction, 'withdrawalStatus'));
        let feeCost = undefined;
        if (type === 'deposit') {
            status = 'ok';
            feeCost = 0;
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    parseDepositAddresses (addresses) {
        const result = [];
        const ids = Object.keys (addresses);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const address = addresses[id];
            const currencyId = id.toUpperCase ();
            const currency = this.safeValue (this.currencies_by_id, currencyId);
            result.push (this.parseDepositAddress (address, currency));
        }
        return result;
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.apiGetListAllAddresses (params);
        //
        //     {
        //         "status": "Success",
        //         "message": null,
        //         "data": {
        //             "btc": "3PLKhwm59C21U3KN3YZVQmrQhoE3q1p1i8",
        //             "eth": "0x8143c11ed6b100e5a96419994846c890598647cf",
        //             "xrp": "rKHZQttBiDysDT4PtYL7RmLbGm6p5HBHfV:3931222419"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseDepositAddresses (data);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     "btc": "3PLKhwm59C21U3KN3YZVQmrQhoE3q1p1i8",
        //     "eth": "0x8143c11ed6b100e5a96419994846c890598647cf",
        //     "xrp": "rKHZQttBiDysDT4PtYL7RmLbGm6p5HBHfV:3931222419"
        //
        const parts = depositAddress.split (':');
        const address = parts[0];
        this.checkAddress (address);
        let tag = undefined;
        const numParts = parts.length;
        if (numParts > 1) {
            tag = parts[1];
        }
        let code = undefined;
        if (currency !== undefined) {
            code = currency['code'];
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.apiPostGenerateAddress (this.extend (request, params));
        //
        //     {
        //         status: 'Success',
        //         message: '',
        //         data: {
        //             address: '0x13a1ac355bf1be5b157486f619169cf7f9ffed4e'
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'address');
        return this.parseDepositAddress (address, currency);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.apiPostGenerateAddress (this.extend (request, params));
        //
        //     {
        //         status: 'Success',
        //         message: '',
        //         data: {
        //             address: '0x13a1ac355bf1be5b157486f619169cf7f9ffed4e'
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'address');
        return this.parseDepositAddress (address, currency);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const withdrawalRequest = {
            'currency': currency['id'],
            'amount': parseFloat (amount),
            'address': address,
            // 'addressTag': null,
        };
        if (tag !== undefined) {
            withdrawalRequest['addressTag'] = tag;
        }
        const withdrawalResponse = await this.apiPostRequestWithdraw (this.extend (withdrawalRequest, params));
        //
        //     {
        //         "status": "Success",
        //         "message": null,
        //         "data": {
        //             "withdrawalId": "E26AA92F-F526-4F6C-85FD-B1EA9B1B118D"
        //         }
        //     }
        //
        const data = this.safeValue (withdrawalResponse, 'data', {});
        const id = this.safeString (data, 'withdrawalId');
        let otp = undefined;
        if (this.twofa !== undefined) {
            otp = this.oath ();
        }
        otp = this.safeString (params, 'emailToken', otp);
        if (otp === undefined) {
            throw new AuthenticationError (this.id + ' signIn() requires this.twofa credential or a one-time 2FA "emailToken" parameter');
        }
        const confirmationRequest = {
            'EmailToken': otp,
        };
        const confirmationResponse = await this.apiPostRequestWithdrawConfirmation (this.extend (confirmationRequest, params));
        const timestamp = this.milliseconds ();
        return {
            'info': [ withdrawalResponse, confirmationResponse ],
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'addressFrom': undefined,
            'tagFrom': undefined,
            'addressTo': address,
            'tagTo': tag,
            'type': 'withdrawal',
            'updated': undefined,
            'txid': undefined,
            'status': 'pending',
            'fee': undefined,
        };
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'], {
            'hostname': this.hostname,
        });
        if (api !== 'token') {
            url += '/' + this.safeString (this.options['api'], api, api);
        }
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        // const isPublic = this.safeValue (this.options['api'], api, true);
        if (api === 'market' || api === 'settings' || api === 'public') {
            if (method === 'POST') {
                body = this.json (query);
                headers = {
                    'Content-Type': 'application/json',
                };
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        } else if (api === 'token') {
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            this.checkRequiredCredentials ();
            query = this.keysort (this.extend ({
                'timestamp': this.seconds (),
            }, query));
            const auth = this.urlencode (query);
            const secret = (api === 'api') ? this.options['secret'] : this.secret;
            const signature = this.hmac (this.encode (auth), this.encode (secret), 'sha512');
            headers = {
                'HMAC': signature.toUpperCase (),
            };
            if (api === 'api') {
                const token = this.safeString (this.options, 'accessToken');
                if (token === undefined) {
                    throw new AuthenticationError (this.id + ' ' + path + ' endpoint requires an `accessToken` option or a prior call to signIn() method');
                }
                const expires = this.safeInteger (this.options, 'expires');
                if (expires !== undefined) {
                    if (this.milliseconds () >= expires) {
                        throw new AuthenticationError (this.id + ' accessToken expired, supply a new `accessToken` or call signIn() method');
                    }
                }
                const tokenType = this.safeString (this.options, 'tokenType', 'bearer');
                headers['Authorization'] = tokenType + ' ' + token;
            }
            if (method === 'POST') {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
                headers['publicKey'] = this.apiKey;
            } else if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     {"Status":"Error","Message":"Exception_Insufficient_Funds","Data":"Insufficient Funds."}
        //     {"status":"Error","errorMessage":"Invalid Market_Currency pair!","data":null}
        //     {"status":"BadRequest","message":"Exception_BadRequest","data":"Invalid Payload"}
        //
        //
        const status = this.safeString2 (response, 'status', 'Status');
        if ((status !== undefined) && (status !== 'Success')) {
            let message = this.safeString2 (response, 'errorMessage', 'Message');
            message = this.safeString (response, 'message', message);
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
