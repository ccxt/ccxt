'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection, AddressPending } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class mandalaex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mandalaex',
            'name': 'Mandala',
            'countries': [ 'MT' ],
            'version': 'v1.1',
            'rateLimit': 1500,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMyTrades': 'emulated',
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'oneMin',
                '5m': 'fiveMin',
                '30m': 'thirtyMin',
                '1h': 'hour',
                '1d': 'day',
            },
            'comment': 'Modulus Exchange API ',
            'hostname': 'mandalaex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': 'https://zapi.{hostname}',
                'www': 'https://mandalaex.com',
                'doc': [
                    'https://documenter.getpostman.com/view/6273708/RznBP1Hh',
                ],
                'fees': [
                    'https://mandalaex.com/trading-rules/',
                ],
                'referral': 'https://trade.mandalaex.com/?ref=564377',
            },
            'api': {
                'settings': {
                    'get': [
                        'getCoinInfo',
                        'GetSettings',
                        'CurrencySettings',
                        'Get_Withdrawal_Limits',
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
                        'GetPendingOrders?side=aLL&pair=ALL&timestamp=1541240408&recvWindow=3600',
                        'TradeHistory?side=ALL&pair=ALL&timestamp=1550920234&recvWindow=10000&count=100&page=1',
                        'GOKYC_Get_Kyc_Form',
                        'language_list',
                        'language?code=en&namespace=translation',
                        'get_page_n_content',
                        'GetExchangeTokenDiscountEnrollmentStatus',
                        'GetDiscountTiers',
                        'My_Affiliate',
                        'Affiliate_Summary',
                        'Affiliate_Commission',
                        'List_Fiat_Manual_Deposit_Requests',
                        'List_Fiat_BanksList/YCN/',
                        'Get_Fiat_PGs?Currency=TRY',
                        'get_insta_pairs',
                        'hmac?side=BUY&market=BTC&trade=ETH&type=STOPLIMIT&volume=0.025&rate=0.032&timeInForce=GTC&stop=2&',
                    ],
                    'post': [
                        'GAuth_Set_Enable',
                        'GAuth_Disable_Request',
                        'SignUp',
                        'VerifyAccount',
                        'SignUp_Resend_Email',
                        'AuthenticateUser',
                        'AuthenticateUser_Resend_EmailOTP/71db395a-6bdc-4183-8191-5940bca95ffd',
                        'Validate_BearerToken',
                        'RequestChangePasswordOT',
                        'ChangePassword',
                        'ForgotPassword',
                        'ResetPassword',
                        'check_Duplicate_Mobile/',
                        'check_Duplicate_Email/',
                        'GenerateAddress',
                        'GetBalance',
                        'GetDeposits',
                        'GetWithdrawals',
                        'RequestWithdraw',
                        'RequestWithdrawConfirmation',
                        'RequestTransfer_AeraPass',
                        'PlaceOrder',
                        'PlaceOrder',
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
                        'my-order-history/{key}/{side}/{order-id}',
                        'my-order-status/{key}/{side}/{Order-id}',
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
                    '803': InvalidOrder, // "Count could not be less than 0.001." (selling below minAmount)
                    '804': InvalidOrder, // "Count could not be more than 10000." (buying above maxAmount)
                    '805': InvalidOrder, // "price could not be less than X." (minPrice violation on buy & sell)
                    '806': InvalidOrder, // "price could not be more than X." (maxPrice violation on buy & sell)
                    '807': InvalidOrder, // "cost could not be less than X." (minCost violation on buy & sell)
                    '831': InsufficientFunds, // "Not enougth X to create buy order." (buying with balance.quote < order.cost)
                    '832': InsufficientFunds, // "Not enougth X to create sell order." (selling with balance.base < order.amount)
                    '833': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                },
                'broad': {
                    'Invalid pair name': ExchangeError, // {"success":0,"error":"Invalid pair name: btc_eth"}
                    'invalid api key': AuthenticationError,
                    'invalid sign': AuthenticationError,
                    'api key dont have trade permission': AuthenticationError,
                    'invalid parameter': InvalidOrder,
                    'invalid order': InvalidOrder,
                    'Requests too often': DDoSProtection,
                    'not available': ExchangeNotAvailable,
                    'data unavailable': ExchangeNotAvailable,
                    'external service unavailable': ExchangeNotAvailable,
                },
            },
            'options': {
                'symbolSeparator': '-',
                'api': {
                    'settings': 'api',
                },
                'fetchCurrencies': {
                    'expires': 5000,
                },
            },
            'commonCurrencies': {
            },
        });
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
            const code = this.commonCurrencyCode (id);
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
        const currencies = this.safeValue (currenciesResponse, 'data', [])
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
            const [ quoteId, baseId ] = id.split ('_');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
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
        let response = await this.accountGetBalances (params);
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'Currency');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let free = this.safeFloat (balance, 'Available', 0);
            let total = this.safeFloat (balance, 'Balance', 0);
            let used = undefined;
            if (total !== undefined) {
                if (free !== undefined) {
                    used = total - free;
                }
            }
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
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
        let timestamp = this.safeString (ticker, 'TimeStamp');
        if (typeof timestamp === 'string') {
            if (timestamp.length > 0) {
                timestamp = this.parse8601 (timestamp);
            }
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let previous = this.safeFloat (ticker, 'PrevDay');
        let last = this.safeFloat (ticker, 'Last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined)
            if (previous !== undefined) {
                change = last - previous;
                if (previous > 0)
                    percentage = (change / previous) * 100;
            }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume'),
            'quoteVolume': this.safeFloat (ticker, 'BaseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketsummaries (params);
        let tickers = response['result'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['MarketName'];
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
        let market = this.market (symbol);
        let response = await this.publicGetMarketsummary (this.extend ({
            'market': market['id'],
        }, params));
        let ticker = response['result'][0];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['TimeStamp'] + '+00:00');
        let side = undefined;
        if (trade['OrderType'] === 'BUY') {
            side = 'buy';
        } else if (trade['OrderType'] === 'SELL') {
            side = 'sell';
        }
        let id = this.safeString2 (trade, 'Id', 'ID');
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let cost = undefined;
        let price = this.safeFloat (trade, 'Price');
        let amount = this.safeFloat (trade, 'Quantity');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarkethistory (this.extend ({
            'market': market['id'],
        }, params));
        if ('result' in response) {
            if (response['result'] !== undefined)
                return this.parseTrades (response['result'], market, since, limit);
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['T'] + '+00:00');
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'tickInterval': this.timeframes[timeframe],
            'marketName': market['id'],
        };
        let response = await this.v2GetMarketGetTicks (this.extend (request, params));
        if ('result' in response) {
            if (response['result'])
                return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.marketGetOpenorders (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'marketGet' + this.capitalize (side) + type;
        let order = {
            'market': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        // if (type == 'limit')
        //     order['rate'] = this.priceToPrecision (symbol, price);
        let response = await this[method] (this.extend (order, params));
        let orderIdField = this.getOrderIdField ();
        let result = {
            'info': response,
            'id': response['result'][orderIdField],
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
        };
        return result;
    }

    getOrderIdField () {
        return 'uuid';
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let orderIdField = this.getOrderIdField ();
        let request = {};
        request[orderIdField] = id;
        let response = await this.marketGetCancel (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.accountGetDeposithistory (this.extend (request, params));
        //
        //     { success:    true,
        //       message:   "",
        //        result: [ {            Id:  22578097,
        //                           Amount:  0.3,
        //                         Currency: "ETH",
        //                    Confirmations:  15,
        //                      LastUpdated: "2018-06-10T07:12:10.57",
        //                             TxId: "0xf50b5ba2ca5438b58f93516eaa523eaf35b4420ca0f24061003df1be7…",
        //                    CryptoAddress: "0xb25f281fa51f1635abd4a60b0870a62d2a7fa404"                    } ] }
        //
        // we cannot filter by `since` timestamp, as it isn't set by Bittrex
        // see https://github.com/ccxt/ccxt/issues/4067
        // return this.parseTransactions (response['result'], currency, since, limit);
        return this.parseTransactions (response['result'], currency, undefined, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.accountGetWithdrawalhistory (this.extend (request, params));
        //
        //     {
        //         "success" : true,
        //         "message" : "",
        //         "result" : [{
        //                 "PaymentUuid" : "b32c7a5c-90c6-4c6e-835c-e16df12708b1",
        //                 "Currency" : "BTC",
        //                 "Amount" : 17.00000000,
        //                 "Address" : "1DfaaFBdbB5nrHj87x3NHS4onvw1GPNyAu",
        //                 "Opened" : "2014-07-09T04:24:47.217",
        //                 "Authorized" : true,
        //                 "PendingPayment" : false,
        //                 "TxCost" : 0.00020000,
        //                 "TxId" : null,
        //                 "Canceled" : true,
        //                 "InvalidAddress" : false
        //             }, {
        //                 "PaymentUuid" : "d193da98-788c-4188-a8f9-8ec2c33fdfcf",
        //                 "Currency" : "XC",
        //                 "Amount" : 7513.75121715,
        //                 "Address" : "TcnSMgAd7EonF2Dgc4c9K14L12RBaW5S5J",
        //                 "Opened" : "2014-07-08T23:13:31.83",
        //                 "Authorized" : true,
        //                 "PendingPayment" : false,
        //                 "TxCost" : 0.00002000,
        //                 "TxId" : "d8a575c2a71c7e56d02ab8e26bb1ef0a2f6cf2094f6ca2116476a569c1e84f6e",
        //                 "Canceled" : false,
        //                 "InvalidAddress" : false
        //             }
        //         ]
        //     }
        //
        return this.parseTransactions (response['result'], currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //      {            Id:  72578097,
        //               Amount:  0.3,
        //             Currency: "ETH",
        //        Confirmations:  15,
        //          LastUpdated: "2018-06-17T07:12:14.57",
        //                 TxId: "0xb31b5ba2ca5438b58f93516eaa523eaf35b4420ca0f24061003df1be7…",
        //        CryptoAddress: "0x2d5f281fa51f1635abd4a60b0870a62d2a7fa404"                    }
        //
        // fetchWithdrawals
        //
        //     {
        //         "PaymentUuid" : "e293da98-788c-4188-a8f9-8ec2c33fdfcf",
        //         "Currency" : "XC",
        //         "Amount" : 7513.75121715,
        //         "Address" : "EVnSMgAd7EonF2Dgc4c9K14L12RBaW5S5J",
        //         "Opened" : "2014-07-08T23:13:31.83",
        //         "Authorized" : true,
        //         "PendingPayment" : false,
        //         "TxCost" : 0.00002000,
        //         "TxId" : "b4a575c2a71c7e56d02ab8e26bb1ef0a2f6cf2094f6ca2116476a569c1e84f6e",
        //         "Canceled" : false,
        //         "InvalidAddress" : false
        //     }
        //
        const id = this.safeString2 (transaction, 'Id', 'PaymentUuid');
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString2 (transaction, 'CryptoAddress', 'Address');
        const txid = this.safeString (transaction, 'TxId');
        const updated = this.parse8601 (this.safeValue (transaction, 'LastUpdated'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'Opened', updated));
        const type = (timestamp !== undefined) ? 'withdrawal' : 'deposit';
        let code = undefined;
        let currencyId = this.safeString (transaction, 'Currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        let status = 'pending';
        if (type === 'deposit') {
            if (currency !== undefined) {
                // deposits numConfirmations never reach the minConfirmations number
                // we set all of them to 'ok', otherwise they'd all be 'pending'
                //
                //     const numConfirmations = this.safeInteger (transaction, 'Confirmations', 0);
                //     const minConfirmations = this.safeInteger (currency['info'], 'MinConfirmation');
                //     if (numConfirmations >= minConfirmations) {
                //         status = 'ok';
                //     }
                //
                status = 'ok';
            }
        } else {
            const authorized = this.safeValue (transaction, 'Authorized', false);
            const pendingPayment = this.safeValue (transaction, 'PendingPayment', false);
            const canceled = this.safeValue (transaction, 'Canceled', false);
            const invalidAddress = this.safeValue (transaction, 'InvalidAddress', false);
            if (invalidAddress) {
                status = 'failed';
            } else if (canceled) {
                status = 'canceled';
            } else if (pendingPayment) {
                status = 'pending';
            } else if (authorized && (txid !== undefined)) {
                status = 'ok';
            }
        }
        let feeCost = this.safeFloat (transaction, 'TxCost');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                // according to https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-
                feeCost = 0; // FIXME: remove hardcoded value that may change any time
            } else if (type === 'withdrawal') {
                throw new ExchangeError ('Withdrawal without fee detected!');
            }
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString2 (order, 'OrderType', 'Type');
        let isBuyOrder = (side === 'LIMIT_BUY') || (side === 'BUY');
        let isSellOrder = (side === 'LIMIT_SELL') || (side === 'SELL');
        if (isBuyOrder) {
            side = 'buy';
        }
        if (isSellOrder) {
            side = 'sell';
        }
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (('Opened' in order) && order['Opened'])
            status = 'open';
        if (('Closed' in order) && order['Closed'])
            status = 'closed';
        if (('CancelInitiated' in order) && order['CancelInitiated'])
            status = 'canceled';
        if (('Status' in order) && this.options['parseOrderStatus'])
            status = this.parseOrderStatus (this.safeString (order, 'Status'));
        let symbol = undefined;
        if ('Exchange' in order) {
            let marketId = order['Exchange'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('Opened' in order)
            timestamp = this.parse8601 (order['Opened'] + '+00:00');
        if ('Created' in order)
            timestamp = this.parse8601 (order['Created'] + '+00:00');
        let lastTradeTimestamp = undefined;
        if (('TimeStamp' in order) && (order['TimeStamp'] !== undefined))
            lastTradeTimestamp = this.parse8601 (order['TimeStamp'] + '+00:00');
        if (('Closed' in order) && (order['Closed'] !== undefined))
            lastTradeTimestamp = this.parse8601 (order['Closed'] + '+00:00');
        if (timestamp === undefined)
            timestamp = lastTradeTimestamp;
        let fee = undefined;
        let commission = undefined;
        if ('Commission' in order) {
            commission = 'Commission';
        } else if ('CommissionPaid' in order) {
            commission = 'CommissionPaid';
        }
        if (commission) {
            fee = {
                'cost': parseFloat (order[commission]),
            };
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            } else if (symbol !== undefined) {
                let currencyIds = symbol.split ('/');
                let quoteCurrencyId = currencyIds[1];
                if (quoteCurrencyId in this.currencies_by_id)
                    fee['currency'] = this.currencies_by_id[quoteCurrencyId]['code'];
                else
                    fee['currency'] = this.commonCurrencyCode (quoteCurrencyId);
            }
        }
        let price = this.safeFloat (order, 'Limit');
        let cost = this.safeFloat (order, 'Price');
        let amount = this.safeFloat (order, 'Quantity');
        let remaining = this.safeFloat (order, 'QuantityRemaining');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        if (!cost) {
            if (price && filled)
                cost = price * filled;
        }
        if (!price) {
            if (cost && filled)
                price = cost / filled;
        }
        let average = this.safeFloat (order, 'PricePerUnit');
        let id = this.safeString (order, 'OrderUuid');
        if (id === undefined)
            id = this.safeString (order, 'OrderId');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let orderIdField = this.getOrderIdField ();
            let request = {};
            request[orderIdField] = id;
            response = await this.accountGetOrder (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID')
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        if (!response['result']) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['result']);
    }

    orderToTrade (order) {
        // this entire method should be moved to the base class
        const timestamp = this.safeInteger2 (order, 'lastTradeTimestamp', 'timestamp');
        return {
            'id': this.safeString (order, 'id'),
            'side': this.safeString (order, 'side'),
            'order': this.safeString (order, 'id'),
            'price': this.safeFloat (order, 'average'),
            'amount': this.safeFloat (order, 'filled'),
            'cost': this.safeFloat (order, 'cost'),
            'symbol': this.safeString (order, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': this.safeValue (order, 'fee'),
            'info': order,
        };
    }

    ordersToTrades (orders) {
        // this entire method should be moved to the base class
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.orderToTrade (orders[i]));
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchClosedOrders (symbol, since, limit, params);
        return this.ordersToTrades (orders);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.accountGetOrderhistory (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market, since, limit);
        if (symbol !== undefined)
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.accountGetDepositaddress (this.extend (request, params));
        //
        //     { "success": false, "message": "ADDRESS_GENERATING", "result": null }
        //
        //     { success:    true,
        //       message:   "",
        //        result: { Currency: "INCNT",
        //                   Address: "3PHvQt9bK21f7eVQVdJzrNPcsMzXabEA5Ha" } } }
        //
        let address = this.safeString (response['result'], 'Address');
        const message = this.safeString (response, 'message');
        if (!address || message === 'ADDRESS_GENERATING') {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        let tag = undefined;
        if (currency['type'] in this.options['tag']) {
            tag = address;
            address = currency['address'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'quantity': amount,
            'address': address,
        };
        if (tag)
            request['paymentid'] = tag;
        let response = await this.accountGetWithdraw (this.extend (request, params));
        let id = undefined;
        if ('result' in response) {
            if ('uuid' in response['result'])
                id = response['result']['uuid'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'], {
            'hostname': this.hostname,
        });
        url += '/' + this.safeString (this.options['api'], api, api);
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        // const isPublic = this.safeValue (this.options['api'], api, true);
        if (api === 'market' || api === 'settings') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += api + '/';
            if (((api === 'account') && (path !== 'withdraw')) || (path === 'openorders'))
                url += method.toLowerCase ();
            const request = {
                'apikey': this.apiKey,
            };
            const disableNonce = this.safeValue (this.options, 'disableNonce');
            if ((disableNonce === undefined) || !disableNonce) {
                request['nonce'] = this.nonce ();
            }
            url += path + '?' + this.urlencode (this.extend (request, params));
            let signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!this.isJsonEncodedObject (body))
            return; // fallback to default error handler
        if ('success' in response) {
            //
            // 1 - Liqui only returns the integer 'success' key from their private API
            //
            //     { "success": 1, ... } httpCode === 200
            //     { "success": 0, ... } httpCode === 200
            //
            // 2 - However, exchanges derived from Liqui, can return non-integers
            //
            //     It can be a numeric string
            //     { "sucesss": "1", ... }
            //     { "sucesss": "0", ... }, httpCode >= 200 (can be 403, 502, etc)
            //
            //     Or just a string
            //     { "success": "true", ... }
            //     { "success": "false", ... }, httpCode >= 200
            //
            //     Or a boolean
            //     { "success": true, ... }
            //     { "success": false, ... }, httpCode >= 200
            //
            // 3 - Oversimplified, Python PEP8 forbids comparison operator (===) of different types
            //
            // 4 - We do not want to copy-paste and duplicate the code of this handler to other exchanges derived from Liqui
            //
            // To cover points 1, 2, 3 and 4 combined this handler should work like this:
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1'))
                    success = true;
                else
                    success = false;
            }
            if (!success) {
                const code = this.safeString (response, 'code');
                const message = this.safeString (response, 'error');
                const feedback = this.id + ' ' + this.json (response);
                const exact = this.exceptions['exact'];
                if (code in exact) {
                    throw new exact[code] (feedback);
                }
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, message);
                if (broadKey !== undefined) {
                    throw new broad[broadKey] (feedback);
                }
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
