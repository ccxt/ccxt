'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, NotSupported, RequestTimeout, DDoSProtection, InvalidOrder, InvalidAddress, BadRequest, InsufficientFunds, OrderNotFound, AuthenticationError, ExchangeNotAvailable, ArgumentsRequired } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class btcex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcex',
            'name': 'BTCEX',
            'countries': [ 'CA' ], // Canada
            'version': 'v1',
            'certified': false,
            'pro': false,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/173489620-d49807a4-55cd-4f4e-aca9-534921298bbf.jpg',
                'www': 'https://www.btcex.com/',
                'api': {
                    'rest': 'https://api.btcex.com',
                },
                'doc': 'https://docs.btcex.com/',
                'fees': 'https://support.btcex.com/hc/en-us/articles/4415995130647',
                'referral': {
                    'url': 'https://www.btcex.com/en-us/register?i=48biatg1',
                    'discount': 0.1,
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': undefined,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'signIn': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1D',
                '3d': '3D',
                '1M': '30D',
            },
            'api': {
                'public': {
                    'get': [
                        // Market data
                        'get_last_trades_by_currency',
                        'get_last_trades_by_instrument',
                        'get_order_book',
                        'tickers',
                        'get_instruments',
                        'get_tradingview_chart_data',
                        // CMC
                        'cmc_spot_summary',
                        'cmc_spot_ticker',
                        'cmc_spot_orderbook',
                        'cmc_market_trades',
                        'cmc_contracts',
                        'cmc_contract_orderbook',
                        // CoinGecko
                        'coin_gecko_spot_pairs',
                        'coin_gecko_spot_ticker',
                        'coin_gecko_spot_orderbook',
                        'coin_gecko_market_trades',
                        'coin_gecko_contracts',
                        'coin_gecko_contract_orderbook',
                    ],
                    'post': [
                        'auth',
                    ],
                },
                'private': {
                    'get': [
                        // wallet
                        'get_deposit_record',
                        'get_withdraw_record',
                        // trade
                        'get_position',
                        'get_positions',
                        'get_open_orders_by_currency',
                        'get_open_orders_by_instrument',
                        'get_order_history_by_currency',
                        'get_order_history_by_instrument',
                        'get_order_state',
                        'get_user_trades_by_currency',
                        'get_user_trades_by_instrument',
                        'get_user_trades_by_order',
                    ],
                    'post': [
                        // auth
                        'logout',
                        // wallet
                        'get_assets_info',
                        'add_withdraw_address',
                        // trade
                        'buy',
                        'sell',
                        'cancel',
                        'cancel_all_by_currency',
                        'cancel_all_by_instrument',
                        'close_position',
                    ],
                    'delete': [],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'margin': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'perpetual': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'exceptions': {
                'exact': {
                    '9999': ExchangeError, // SYSTEM_INNER_ERROR System error, please try again later
                    '9900': ExchangeNotAvailable, // SERVICE_BUSY Service is busy，please try again later
                    '401': AuthenticationError, // UNAUTHENTICATION_ERROR UnAuthentication
                    '403': AuthenticationError, // ACCESS_DENIED_ERROR Access denied
                    '1000': ExchangeNotAvailable, // NO_SERVICE No service found
                    '1001': BadRequest, // BAD_REQUEST Bad requested
                    '2000': AuthenticationError, // NEED_LOGIN Login is required
                    '2001': AuthenticationError, // ACCOUNT_NOT_MATCH Account information does not match
                    '2002': AuthenticationError, // ACCOUNT_NEED_ENABLE Account needs to be activated
                    '2003': AuthenticationError, // ACCOUNT_NOT_AVAILABLE Account not available
                    '3000': AuthenticationError, // TEST user
                    '3002': AuthenticationError, // NICKNAME_EXIST Nicknames exist
                    '3003': AuthenticationError, // ACCOUNT_NOT_EXIST No account
                    '3004': BadRequest, // PARAM_ERROR Parameter exception
                    '3005': NotSupported, // LANGUAGE_NONSUPPORT Unsupported languages
                    '3007': AuthenticationError, // ONLY_SUBACCOUNT_OPE Sub-account operations only
                    '3008': AuthenticationError, // LOGIN_ENABLE Account not logged
                    '3009': AuthenticationError, // TFA_EXPIRE_ERROR Google key failed
                    '3011': AuthenticationError, // PASSWORD_ERROR Password error
                    '3012': AuthenticationError, // TFA_UUID_ERROR One-time unlock code error
                    '3013': RequestTimeout, // TIME_OUT time out
                    '3015': AuthenticationError, // ID_IS_ERROR id_is_error
                    '3016': AuthenticationError, // WRONG_SUBACCOUNT_NAME already taken
                    '3018': BadRequest, // USER_NAME_AT_LEAST_5_BYTE The user name must have at least 5 digits
                    '3019': BadRequest, // PASSWORD_AT_LEAST_8_BYTE 8-32 bits contain at least three of the numbers, capital, lowercase letters and special symbols!
                    '3020': BadRequest, // TFA_ALREADY_SET GoogleCode Already Set
                    '3021': BadRequest, // PWD_MATCH_ERROR pwd_match_error
                    '3022': BadRequest, // ILLEGAL_OPERATION illegal operation
                    '3023': BadRequest, // REMOVE_SUBACCOUNT_OVER_LIMIT remove subaccount over limit
                    '3024': BadRequest, // GOOGLE_VERIFICATION_CODE_TURNED_ON Google verification code turned on
                    '3025': BadRequest, // OPERATION_FAILURE The operation failure
                    '3026': BadRequest, // ACCOUNT_ACTIVED Account has Actived
                    '3027': BadRequest, // INVALID_EMAIL_ADDRESS Invalid email address!
                    '3028': BadRequest, // PASSWORD_FORMAT_ERROR Password format err
                    '3029': DDoSProtection, // ONE_MINUTE_LIMIT Only one operation per minute and the remaining ${times}s
                    '3030': DDoSProtection, // ONE_HOUR_LIMIT Do this up to 5 times per hour
                    '3031': BadRequest, // USER_NAME_UP_12_BYTE Up to 12 characters, only letters and numbers are supported
                    '3032': BadRequest, // EMAIL_SETTED You need to set email address and password first
                    '3033': BadRequest, // PASSWORD_SETTED You need to set password first
                    '3034': AuthenticationError, // SUBACCOUNT_EMAIL_ACTIVATE You need to wait for email confirmation
                    '3035': BadRequest, // API_NOT_EXIST No api message
                    '3036': BadRequest, // UNAVAILABLE_IN_SUBACCOUNT Unavailable in subaccount
                    '3037': BadRequest, // MAX_SUBACCOUNT_NUMBER Limit of subaccounts is reached
                    '3038': BadRequest, // MAIN_SUBACCOUNT_EMAIL_SAME Provided email address is already used for your other subaccount
                    '3039': BadRequest, // MAX_API_KEY_NUMBER You cannot have more than 8 API keys
                    '3040': AuthenticationError, // ALPHA_TEST Non-invited users shall contact BTCEX Team to obtain the internal tests qualification
                    '3041': BadRequest, // API_NAME_MAX_LENGTH Name of key maximum length - 16 characters
                    '4000': BadRequest, // WALLET_ERROR Wallet error || RECHARGE_CLOSED Recharge closed
                    '4001': InvalidAddress, // WRONG_WITHDRAWAL_ADDRESS Wrong withdrawal address
                    '4002': InvalidAddress, // ADDRESS_DOES_NOT_EXIST Address does not exist
                    '4003': BadRequest, // WITHDRAWAL_CLOSED Withdrawal closed || TOO_SMALL_WITHDRAWAL_AMOUNT Too small withdrawal amount
                    '4004': NotSupported, // INTERNAL_TRANSFER_IS_NOT_SUPPORTED_TEMPORARILY Internal transfer is not supported temporarily
                    '4005': ExchangeError, // WITHDRAW_FAIL Withdrawal failed
                    '4006': InsufficientFunds, // INSUFFICIENT_ASSET ser asset not enough
                    '4007': BadRequest, // TRANSFER_ACCOUNT_ERROR Transfer account error
                    '4008': NotSupported, // AMOUNT_ERROR Amount error
                    '4009': InvalidAddress, // NO_RECHARGE_ADDRESS No recharge address
                    '4010': BadRequest, // GET_TRANSFER_SUBACCOUNT_ERROR Get transfer subaccount error
                    '4011': BadRequest, // TRANSFER_SUBMIT_URL_ERROR Transfer submit url error
                    '5001': InvalidOrder, // ORDER_PARAM_WRONG Order's param wrong.
                    '5002': OrderNotFound, // ORDER_DOSE_NOT_EXIST Order does not exist.
                    '5003': InvalidOrder, // CONTRACT_DOSE_NOT_EXIST Contract does not exist.
                    '5004': InvalidOrder, // ORDER_STATUS_ERR Order status error.
                    '5005': InvalidOrder, // ORDER_AMOUNT_MIN_TRANCSACTION_ERR Order amount min transaction error.
                    '5006': InvalidOrder, // ORDER_PRICE_MIN_TRANCSACTION_ERR Order price min price error.
                    '5007': InvalidOrder, // ORDER_PRICE_TICK_SIZE_ERR Order price tick size error.
                    '5008': InvalidOrder, // ORDER_TYPE_ERR Order type error.
                    '5009': InvalidOrder, // ORDER_OPTION_IS_EXPIRED Order option is expired.
                    '5010': InvalidOrder, // ORDER_IS_NOT_ACTIVE Order is not active.
                    '5011': InvalidOrder, // IV_ORDER_ARE_NOT_SUPPORTED Iv orders are not supported.
                    '5012': InvalidOrder, // ORDER_NO_MARK_PRICE_ERROR No mark price error.
                    '5013': InvalidOrder, // ORDER_PRICE_RANGE_IS_TOO_HIGH order price range is too high.
                    '5014': InvalidOrder, // ORDER_PRICE_RANGE_IS_TOO_LOW Order price range is too low.
                    '5109': InvalidOrder, // ORDER_PRICE_RANGE_IS_TOO_LOW Order price range is too low.
                    '5135': InvalidOrder, // The quantity should be larger than: 0.01
                    '5901': InvalidOrder, // TRANSFER_RESULT transfer out success.
                    '5902': InvalidOrder, // ORDER_SUCCESS place order success.
                    '5903': InvalidOrder, // ORDER_FAIL place order fail.
                    '5904': InvalidOrder, // PRICE_TRIGGER_LIQ price trigger liquidation
                    '5905': InvalidOrder, // LIQ_CANCEL liquidation make order cancel.
                    '5906': InvalidOrder, // LIQ_ORDER liquidation place a new order
                    '5907': InsufficientFunds, // ASSET_NOT_ENOUTH asset not enough
                    '8000': BadRequest, // PARAM_ERROR Request params not valid!
                    '8001': BadRequest, // DATA_NOT_EXIST The data doesn't exist!
                    '8100': BadRequest, // CODE_CHECK_FAIL Incorrect verification code
                    '8101': RequestTimeout, // CODE_NOT_EXIST Verification code time out, please retry later
                    '8102': DDoSProtection, // CODE_CHECK_FAIL_LIMIT Errors exceed the limit. Please try again after 24H.
                    '8103': BadRequest, // SMS_CODE_CHECK_FAIL Incorrect SMS verification code
                    '8104': BadRequest, // MAIL_CODE_CHECK_FAIL Incorrect mail verification code
                    '8105': BadRequest, // GOOGLE_CODE_CHECK_FAIL 2FA Code error!
                    '8106': DDoSProtection, // SMS_CODE_LIMIT Your message service is over limit today, please try tomorrow
                    '8107': ExchangeError, // REQUEST_FAILED Request failed
                    '10000': AuthenticationError, // Authentication Failure
                    '11000': BadRequest, // CHANNEL_REGEX_ERROR channel regex not match
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'accountsByType': {
                    'wallet': 'WALLET',
                    'spot': 'SPOT',
                    'perpetual': 'PERPETUAL',
                    'margin': 'MARGIN',
                    'swap': 'PERPETUAL',
                    'BTC': 'BTC',
                    'ETH': 'ETH',
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        const markets = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647533492507,
        //         "usOut":1647533492511,
        //         "usDiff":4,
        //         "result":[{
        //             "currency":"BTC",
        //             "base_currency":"USDT",
        //             "contract_size":"0.01",
        //             "creation_timestamp":"1632384961348",
        //             "expiration_timestamp":"1648195200000",
        //             "instrument_name":"BTC-25MAR22",
        //             "show_name":"BTC-25MAR22",
        //             "is_active":true,
        //             "kind":"future",
        //             "leverage":0,
        //             "maker_commission":"10",
        //             "taker_commission":"17",
        //             "min_trade_amount":"0.01",
        //             "option_type":"init",
        //             "quote_currency":"USDT",
        //             "settlement_period":"week",
        //             "strike":"0",
        //             "tick_size":"0.1",
        //             "instr_multiple":"0.01",
        //             "order_price_low_rate":"0.8",
        //             "order_price_high_rate":"1.2",
        //             "order_price_limit_type":0,
        //             "min_qty":"0.01",
        //             "min_notional":"0",
        //             "support_trace_trade":false
        //         }]
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'instrument_name');
            const type = this.safeString (market, 'kind');
            let unifiedType = type;
            if (type === 'perpetual') {
                unifiedType = 'swap';
            }
            let baseId = this.safeString (market, 'quote_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const swap = (type === 'perpetual');
            const spot = (type === 'spot');
            const margin = (type === 'margin');
            const option = (type === 'option');
            const future = (type === 'future');
            const contract = swap || future || option;
            let expiry = undefined;
            if (option || future) {
                baseId = this.safeString (market, 'currency');
                expiry = this.safeInteger (market, 'expiration_timestamp');
            }
            let contractSize = undefined;
            let settleId = undefined;
            let settle = undefined;
            if (contract) {
                settleId = quoteId;
                settle = this.safeCurrencyCode (settleId);
            }
            let optionType = undefined;
            let strike = undefined;
            if (option) {
                optionType = this.safeString (market, 'option_type');
                strike = this.safeNumber (market, 'strike');
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = undefined;
            if (margin) {
                symbol = id;
            } else {
                symbol = base + '/' + quote;
            }
            if (contract) {
                contractSize = this.safeNumber (market, 'contract_size');
                symbol = symbol + ':' + settle;
                if (future || option) {
                    symbol = symbol + '-' + this.yymmdd (expiry);
                    if (option) {
                        const letter = (optionType === 'call') ? 'C' : 'P';
                        symbol = symbol + ':' + this.numberToString (strike) + ':' + letter;
                    }
                }
            }
            const minTradeAmount = this.safeNumber (market, 'min_trade_amount');
            const tickSize = this.safeNumber (market, 'tick_size');
            const maker = this.safeNumber (market, 'maker_commission');
            const taker = this.safeNumber (market, 'taker_commission');
            const percentage = !(option || future);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'settle': settle,
                'type': unifiedType,
                'maker': maker,
                'taker': taker,
                'percentage': percentage,
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': future,
                'option': option,
                'active': this.safeValue (market, 'is_active'),
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': strike,
                'optionType': optionType,
                'precision': {
                    'amount': minTradeAmount,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': this.safeString (market, 'leverage'),
                    },
                    'amount': {
                        'min': minTradeAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': tickSize,
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

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "best_ask_amount":"0.20962",
        //         "best_ask_price":"40491.7",
        //         "best_bid_amount":"0.08855",
        //         "best_bid_price":"40491.6",
        //         "instrument_name":"BTC-USDT",
        //         "last_price":"40493",
        //         "mark_price":"40493.10644717",
        //         "state":"open",
        //         "stats":{
        //             "high":"41468.8",
        //             "low":"40254.9",
        //             "price_change":"-0.0159",
        //             "volume":"3847.35240000000000005"
        //             "turnover":"1109811189.67100102035328746"
        //         },
        //         "timestamp":"1647569486224"
        //     }
        //
        const marketId = this.safeString (ticker, 'instrument_name');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const stats = this.safeValue (ticker, 'stats');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (stats, 'high'),
            'low': this.safeString (stats, 'low'),
            'bid': this.safeString (ticker, 'best_bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_amount'),
            'ask': this.safeString (ticker, 'best_ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (stats, 'price_change'),
            'average': undefined,
            'baseVolume': this.safeString (stats, 'volume'),
            'quoteVolume': this.safeString (stats, 'turnover'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647569487238,
        //         "usOut":1647569487240,
        //         "usDiff":2,
        //         "result":[{
        //             "best_ask_amount":"0.20962",
        //             "best_ask_price":"40491.7",
        //             "best_bid_amount":"0.08855",
        //             "best_bid_price":"40491.6",
        //             "instrument_name":"BTC-USDT",
        //             "last_price":"40493",
        //             "mark_price":"40493.10644717",
        //             "state":"open",
        //             "stats":{
        //                 "high":"41468.8",
        //                 "low":"40254.9",
        //                 "price_change":"-0.0159",
        //                 "volume":"3847.35240000000000005"
        //             },
        //             "timestamp":"1647569486224"
        //         }]
        //     }
        //
        const ticker = this.safeValue (result, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647573916524,
        //         "usOut":1647573916526,
        //         "usDiff":2,
        //         "result":{
        //             "asks":[["10155.00000","0.200","186.980","0.000"],["10663.00000","0.200","217.480","0.000"]],
        //             "bids":[["7896.00000","0.200","1.000","0.000"],["7481.00000","0.200","1.000","0.000"]],
        //             "timestamp":"1647573916525",
        //             "instrument_name":"BTC-25MAR22-32000-C",
        //             "version":1002541
        //         }
        //     }
        //
        const timestamp = this.safeInteger (result, 'timestamp');
        return this.parseOrderBook (result, market['symbol'], timestamp);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "tick":1647547200,
        //         "open":"40868.16800000",
        //         "high":"40877.65600000",
        //         "low":"40647.00000000",
        //         "close":"40699.10000000",
        //         "volume":"100.27789000",
        //         "cost":"4083185.78337596"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'tick'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 10;
        }
        const request = {
            'resolution': this.timeframes[timeframe],
            // 'start_timestamp': 0,
            // 'end_timestamp': 0,
        };
        let marketId = market['id'];
        if (market['spot'] || market['margin']) {
            marketId = market['baseId'] + '-' + market['quoteId'];
        }
        request['instrument_name'] = marketId;
        if (since === undefined) {
            request['end_timestamp'] = this.milliseconds ();
            request['start_timestamp'] = 0;
        } else {
            const timeframeInSeconds = this.parseTimeframe (timeframe);
            const timeframeInMilliseconds = timeframeInSeconds * 1000;
            request['start_timestamp'] = since;
            request['end_timestamp'] = this.sum (request['start_timestamp'], limit * timeframeInMilliseconds);
        }
        const response = await this.publicGetGetTradingviewChartData (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647578562427,
        //         "usOut":1647578562428,
        //         "usDiff":1,
        //         "result":[{
        //             "tick":1647547200,
        //             "open":"40868.16800000",
        //             "high":"40877.65600000",
        //             "low":"40647.00000000",
        //             "close":"40699.10000000",
        //             "volume":"100.27789000",
        //             "cost":"4083185.78337596"
        //         }]
        //     }
        //
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "amount":"0.0003",
        //         "direction":"sell",
        //         "iv":"0",
        //         "price":"40767.18",
        //         "timestamp":"1647582687050",
        //         "instrument_name":"BTC-USDT-SPOT",
        //         "trade_id":57499240
        //     }
        //
        // fetchOrderTrades || fetchMyTrades
        //
        //     {
        //         "direction":"sell",
        //         "amount":"0.03",
        //         "price":"397.8",
        //         "fee":"0.011934",
        //         "timestamp":1647668570759,
        //         "role":"taker",
        //         "trade_id":"58319385",
        //         "order_id":"250979478947823616",
        //         "instrument_name":"BNB-USDT-SPOT",
        //         "order_type":"market",
        //         "fee_use_coupon":false,
        //         "fee_coin_type":"USDT",
        //         "index_price":"",
        //         "self_trade":false
        //     }
        //
        const id = this.safeString (trade, 'trade_id');
        const marketId = this.safeString (trade, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'direction');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const takerOrMaker = this.safeString (trade, 'role');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_coin_type');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeString (trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            // 'start_id' : 0,
            // 'end_id': 0,
            // 'sorting': 'asc', // asc | desc
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 10
        }
        const response = await this.publicGetGetLastTradesByInstrument (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647582703220,
        //         "usOut":1647582703253,
        //         "usDiff":33,
        //         "result":{
        //             "trades":[{
        //                 "amount":"0.0003",
        //                 "direction":"sell",
        //                 "iv":"0",
        //                 "price":"40767.18",
        //                 "timestamp":"1647582687050",
        //                 "instrument_name":"BTC-USDT-SPOT",
        //                 "trade_id":57499240
        //             }],
        //             "has_more":true
        //         }
        //     }
        //
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async signIn (params = {}) {
        let accessToken = this.safeString (this.options, 'accessToken');
        if (accessToken !== undefined) {
            return accessToken;
        }
        this.checkRequiredCredentials ();
        const request = {
            'grant_type': 'client_credentials', // client_signature || refresh_token
            'client_id': this.apiKey,
            'client_secret': this.secret,
            // 'refresh_token': '', // Required for grant type refresh_token
            // 'signature': '', // Required for grant type client_signature
        };
        const response = await this.publicPostAuth (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        //
        //     {
        //         jsonrpc: '2.0',
        //         usIn: '1647601525586',
        //         usOut: '1647601525597',
        //         usDiff: '11',
        //         result: {
        //         access_token: '',
        //         token_type: 'bearer',
        //         refresh_token: '',
        //         expires_in: '604799',
        //         scope: 'account:read_write block_trade:read_write trade:read_write wallet:read_write'
        //         }
        //     }
        //
        accessToken = this.safeString (result, 'access_token');
        this.options['accessToken'] = accessToken;
        return accessToken;
    }

    parseBalance (response) {
        //
        //     {
        //         "WALLET":{
        //             "total":"0",
        //             "coupon":"0",
        //             "details":[{
        //                 "available":"0",
        //                 "freeze":"0",
        //                 "coin_type":"1INCH",
        //                 "current_mark_price":"1.657"
        //             }]
        //         },
        //         "MARGIN":{
        //             "total":"0",
        //             "net":"0",
        //             "available":"0",
        //             "borrowed":"0",
        //             "details":[],
        //             "maintenance_margin":"0",
        //             "interest_owed":"0"
        //         },
        //         "SPOT":{
        //             "total":"3.965",
        //             "available":"15.887066",
        //             "details":[{
        //                 "available":"0",
        //                 "freeze":"0",
        //                 "total":"0",
        //                 "coin_type":"1INCH",
        //                 "current_mark_price":"1.657"
        //             }]
        //         },
        //         "BTC":{
        //             "currency":"BTC",
        //             "balance":"0",
        //             "freeze":"0",
        //             "equity":"0",
        //             "base_currency":"USDT",
        //             "available_funds":"0",
        //             "available_withdrawal_funds":"0",
        //             "initial_margin":"0",
        //             "maintenance_margin":"0",
        //             "margin_balance":"0",
        //             "session_funding":"0",
        //             "session_rpl":"0",
        //             "session_upl":"0",
        //             "futures_pl":"0",
        //             "futures_session_rpl":"0",
        //             "futures_session_upl":"0",
        //             "options_value":"0",
        //             "options_pl":"0",
        //             "options_session_rpl":"0",
        //             "options_session_upl":"0",
        //             "total_pl":"0",
        //             "options_delta":"0",
        //             "options_gamma":"0",
        //             "options_theta":"0",
        //             "options_vega":"0",
        //             "delta_total":"0"
        //         },
        //         "ETH":{
        //             "currency":"ETH",
        //             "balance":"0",
        //             "freeze":"0",
        //             "equity":"0",
        //             "base_currency":"USDT",
        //             "available_funds":"0",
        //             "available_withdrawal_funds":"0",
        //             "initial_margin":"0",
        //             "maintenance_margin":"0",
        //             "margin_balance":"0",
        //             "session_funding":"0",
        //             "session_rpl":"0",
        //             "session_upl":"0",
        //             "futures_pl":"0",
        //             "futures_session_rpl":"0",
        //             "futures_session_upl":"0",
        //             "options_value":"0",
        //             "options_pl":"0",
        //             "options_session_rpl":"0",
        //             "options_session_upl":"0",
        //             "total_pl":"0",
        //             "options_delta":"0",
        //             "options_gamma":"0",
        //             "options_theta":"0",
        //             "options_vega":"0",
        //             "delta_total":"0"
        //         },
        //         "PERPETUAL":{
        //             "bonus":"0",
        //             "global_state":0,
        //             "available_funds":"0",
        //             "wallet_balance":"0",
        //             "available_withdraw_funds":"0",
        //             "total_pl":"0",
        //             "total_upl":"0",
        //             "position_rpl":"0",
        //             "total_upl_isolated":"0",
        //             "total_upl_cross":"0",
        //             "total_initial_margin_cross":"0",
        //             "total_initial_margin_isolated":"0",
        //             "total_margin_balance_isolated":"0",
        //             "total_margin_balance":"0",
        //             "total_margin_balance_cross":"0",
        //             "total_maintenance_margin_cross":"0",
        //             "total_wallet_balance_isolated":"0",
        //             "order_frozen":"0",
        //             "order_cross_frozen":"0",
        //             "order_isolated_frozen":"0",
        //             "risk_level":"0",
        //             "bonus_max":"0"
        //         }
        //     }
        //
        const result = { 'info': response };
        const assetTypes = Object.keys (response);
        for (let i = 0; i < assetTypes.length; i++) {
            const assetType = assetTypes[i];
            const currency = this.safeValue (response, assetType);
            if ((assetType === 'WALLET') || (assetType === 'SPOT')) {
                const details = this.safeValue (currency, 'details');
                if (details !== undefined) {
                    for (let i = 0; i < details.length; i++) {
                        const detail = details[i];
                        const coinType = this.safeString (detail, 'coin_type');
                        const code = this.safeCurrencyCode (coinType);
                        const account = this.safeValue (result, code, this.account ());
                        account['free'] = this.safeString (detail, 'available');
                        account['used'] = this.safeString (detail, 'freeze');
                        account['total'] = this.safeString (detail, 'total');
                        result[code] = account;
                    }
                }
            } else {
                // all other wallets are linear futures
                const code = 'USDT';
                const account = this.account ();
                account['total'] = this.safeString (currency, 'wallet_balance');
                account['free'] = this.safeString (currency, 'available_withdraw_funds');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.signIn ();
        await this.loadMarkets ();
        const type = this.safeStringLower (params, 'type', 'spot');
        const types = this.safeValue (this.options, 'accountsByType', {});
        const assetType = this.safeString (types, type, type);
        params = this.omit (params, 'type');
        const request = {
            'asset_type': [ assetType ],
        };
        const response = await this.privatePostGetAssetsInfo (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "id":"1647675393",
        //         "jsonrpc":"2.0",
        //         "usIn":1647675394091,
        //         "usOut":1647675394104,
        //         "usDiff":13,
        //         "result":{
        //             "WALLET":{
        //                 "total":"0",
        //                 "coupon":"0",
        //                 "details":[{
        //                     "available":"0",
        //                     "freeze":"0",
        //                     "coin_type":"1INCH",
        //                     "current_mark_price":"1.657"
        //                 }]
        //             },
        //             "MARGIN":{
        //                 "total":"0",
        //                 "net":"0",
        //                 "available":"0",
        //                 "borrowed":"0",
        //                 "details":[],
        //                 "maintenance_margin":"0",
        //                 "interest_owed":"0"
        //             },
        //             "SPOT":{
        //                 "total":"3.965",
        //                 "available":"15.887066",
        //                 "details":[{
        //                     "available":"0",
        //                     "freeze":"0",
        //                     "total":"0",
        //                     "coin_type":"1INCH",
        //                     "current_mark_price":"1.657"
        //                 }]
        //             },
        //             "BTC":{
        //                 "currency":"BTC",
        //                 "balance":"0",
        //                 "freeze":"0",
        //                 "equity":"0",
        //                 "base_currency":"USDT",
        //                 "available_funds":"0",
        //                 "available_withdrawal_funds":"0",
        //                 "initial_margin":"0",
        //                 "maintenance_margin":"0",
        //                 "margin_balance":"0",
        //                 "session_funding":"0",
        //                 "session_rpl":"0",
        //                 "session_upl":"0",
        //                 "futures_pl":"0",
        //                 "futures_session_rpl":"0",
        //                 "futures_session_upl":"0",
        //                 "options_value":"0",
        //                 "options_pl":"0",
        //                 "options_session_rpl":"0",
        //                 "options_session_upl":"0",
        //                 "total_pl":"0",
        //                 "options_delta":"0",
        //                 "options_gamma":"0",
        //                 "options_theta":"0",
        //                 "options_vega":"0",
        //                 "delta_total":"0"
        //             },
        //             "ETH":{
        //                 "currency":"ETH",
        //                 "balance":"0",
        //                 "freeze":"0",
        //                 "equity":"0",
        //                 "base_currency":"USDT",
        //                 "available_funds":"0",
        //                 "available_withdrawal_funds":"0",
        //                 "initial_margin":"0",
        //                 "maintenance_margin":"0",
        //                 "margin_balance":"0",
        //                 "session_funding":"0",
        //                 "session_rpl":"0",
        //                 "session_upl":"0",
        //                 "futures_pl":"0",
        //                 "futures_session_rpl":"0",
        //                 "futures_session_upl":"0",
        //                 "options_value":"0",
        //                 "options_pl":"0",
        //                 "options_session_rpl":"0",
        //                 "options_session_upl":"0",
        //                 "total_pl":"0",
        //                 "options_delta":"0",
        //                 "options_gamma":"0",
        //                 "options_theta":"0",
        //                 "options_vega":"0",
        //                 "delta_total":"0"
        //             },
        //             "PERPETUAL":{
        //                 "bonus":"0",
        //                 "global_state":0,
        //                 "available_funds":"0",
        //                 "wallet_balance":"0",
        //                 "available_withdraw_funds":"0",
        //                 "total_pl":"0",
        //                 "total_upl":"0",
        //                 "position_rpl":"0",
        //                 "total_upl_isolated":"0",
        //                 "total_upl_cross":"0",
        //                 "total_initial_margin_cross":"0",
        //                 "total_initial_margin_isolated":"0",
        //                 "total_margin_balance_isolated":"0",
        //                 "total_margin_balance":"0",
        //                 "total_margin_balance_cross":"0",
        //                 "total_maintenance_margin_cross":"0",
        //                 "total_wallet_balance_isolated":"0",
        //                 "order_frozen":"0",
        //                 "order_cross_frozen":"0",
        //                 "order_isolated_frozen":"0",
        //                 "risk_level":"0",
        //                 "bonus_max":"0"
        //             }
        //         }
        //     }
        //
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        if (timeInForce === '-') {
            return undefined;
        }
        const timeInForces = {
            'good_til_cancelled': 'GTC',
            'good_til_date': 'GTD',
            'fill_or_kill': 'FOK',
            'immediate_or_cancel': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder || fetchOpenOrders || fetchClosedOrders
        //         {
        //             "kind":"spot",
        //             "direction":"sell",
        //             "amount":"0.02",
        //             "price":"900",
        //             "advanced":"usdt",
        //             "source":"api",
        //             "mmp":false,
        //             "version":1,
        //             "order_id":"250971492850401280",
        //             "order_state":"open",
        //             "instrument_name":"BNB-USDT-SPOT",
        //             "filled_amount":"0",
        //             "average_price":"0",
        //             "order_type":"limit",
        //             "time_in_force":"GTC",
        //             "post_only":false,
        //             "reduce_only":false,
        //             "creation_timestamp":1647666666723,
        //             "last_update_timestamp":1647666666725
        //         }
        //
        // createOrder
        //
        //         {
        //             "order_id":"251052889774161920",
        //             "custom_order_id":"-"
        //         }
        //
        // closeOrder
        //         {
        //             "order_id":"250979354159153152"
        //         }
        //
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        const lastUpdate = this.safeInteger (order, 'last_update_timestamp');
        const id = this.safeString (order, 'order_id');
        const priceString = this.safeString (order, 'price');
        const averageString = this.safeString (order, 'average_price');
        const amountString = this.safeString (order, 'amount');
        const filledString = this.safeString (order, 'filled_amount');
        let lastTradeTimestamp = undefined;
        if (filledString !== undefined) {
            const isFilledPositive = Precise.stringGt (filledString, '0');
            if (isFilledPositive) {
                lastTradeTimestamp = lastUpdate;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'order_state'));
        const marketId = this.safeString (order, 'instrument_name');
        market = this.safeMarket (marketId, market);
        const side = this.safeStringLower (order, 'direction');
        let feeCostString = this.safeString (order, 'commission');
        let fee = undefined;
        if (feeCostString !== undefined) {
            feeCostString = Precise.stringAbs (feeCostString);
            fee = {
                'cost': feeCostString,
                'currency': market['base'],
            };
        }
        const type = this.safeString (order, 'order_type');
        // injected in createOrder
        const trades = this.safeValue (order, 'trades');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'time_in_force'));
        const stopPrice = this.safeValue (order, 'trigger_price');
        const postOnly = this.safeValue (order, 'post_only');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': priceString,
            'stopPrice': stopPrice,
            'amount': amountString,
            'cost': undefined,
            'average': averageString,
            'filled': filledString,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetGetOrderState (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647672034018,
        //         "usOut":1647672034033,
        //         "usDiff":15,
        //         "result":{
        //             "currency":"SPOT",
        //             "kind":"spot",
        //             "direction":"sell",
        //             "amount":"0.03",
        //             "price":"-1",
        //             "advanced":"usdt",
        //             "source":"api",
        //             "mmp":false,
        //             "version":1,
        //             "order_id":"250979478947823616",
        //             "order_state":"filled",
        //             "instrument_name":"BNB-USDT-SPOT",
        //             "filled_amount":"0.03",
        //             "average_price":"397.8",
        //             "order_type":"market",
        //             "time_in_force":"GTC",
        //             "post_only":false,
        //             "reduce_only":false,
        //             "creation_timestamp":1647668570759,
        //             "last_update_timestamp":1647668570761
        //         }
        //     }
        //
        return this.parseOrder (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'type': type, // limit, market, default is limit
            // 'price': this.priceToPrecision (symbol, 123.45), // The order price for limit order. When adding options order with advanced=iv, the field price should be a value of implied volatility in percentages. For example, price=100, means implied volatility of 100%
            // 'time_in_force' : 'good_til_cancelled', // good_til_cancelled, good_til_date, fill_or_kill, immediate_or_cancel Specifies how long the order remains in effect, default: good_til_cancelled
            // 'post_only': false, // If true, the order is considered post-only, default: false
            // 'reduce_only': false, // If true, the order is considered reduce-only which is intended to only reduce a current position. default: false
            // 'condition_type': '', // NORMAL, STOP, TRAILING, IF_TOUCHED, Condition sheet policy, the default is NORMAL. Available when kind is future
            // 'trigger_price': 'index_price', // trigger price. Available when condition_type is STOP or IF_TOUCHED
            // 'trail_price': false, // trail price, Tracking price change Delta. Available when condition_type is TRAILING
            // 'advanced': 'usd', // Advanced option order type, (Only for options), default: usdt. If set to iv，then the price field means iv value
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (market['contract']) {
            const timeInForce = this.safeStringUpper (params, 'timeInForce');
            if (timeInForce === 'GTC') {
                request['time_in_force'] = 'good_till_cancelled';
            } else if (timeInForce === 'FOK') {
                request['time_in_force'] = 'fill_or_kill';
            } else if (timeInForce === 'IOC') {
                request['time_in_force'] = 'immediate_or_cancel';
            }
            const isMarketOrder = type === 'market';
            const exchangeSpecificParam = this.safeValue (params, 'post_only', false);
            const postOnly = this.isPostOnly (isMarketOrder, exchangeSpecificParam, params);
            if (postOnly) {
                request['post_only'] = true;
            }
            const reduceOnly = this.safeValue (params, 'reduceOnly', false);
            if (reduceOnly) {
                request['reduce_only'] = true;
            }
            params = this.omit (params, [ 'timeInForce', 'postOnly', 'reduceOnly' ]);
        }
        const method = 'privatePost' + this.capitalize (side);
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "id":"1647686073",
        //         "jsonrpc":"2.0",
        //         "usIn":1647686073252,
        //         "usOut":1647686073264,
        //         "usDiff":12,
        //         "result":{
        //             "order":{
        //                 "order_id":"251052889774161920",
        //                 "custom_order_id":"-"
        //             }
        //         }
        //     }
        //
        const order = this.safeValue (result, 'order');
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.signIn ();
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostCancel (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "id":"1647675007",
        //         "jsonrpc":"2.0",
        //         "usIn":1647675007485,
        //         "usOut":1647675007494,
        //         "usDiff":9,
        //         "result":{
        //             "order_id":"250979354159153152"
        //         }
        //     }
        //
        return this.parseOrder (result);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privatePostCancelAllByInstrument (this.extend (request, params));
        //
        //     {
        //         "id":"1647686580",
        //         "jsonrpc":"2.0",
        //         "usIn":1647686581216,
        //         "usOut":1647686581224,
        //         "usDiff":8,
        //         "result":2
        //     }
        //
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetOpenOrdersByInstrument (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647667026285,
        //         "usOut":1647667026291,
        //         "usDiff":6,
        //         "result":[{
        //             "kind":"spot",
        //             "direction":"sell",
        //             "amount":"0.02",
        //             "price":"900",
        //             "advanced":"usdt",
        //             "source":"api",
        //             "mmp":false,
        //             "version":1,
        //             "order_id":"250971492850401280",
        //             "order_state":"open",
        //             "instrument_name":"BNB-USDT-SPOT",
        //             "filled_amount":"0",
        //             "average_price":"0",
        //             "order_type":"limit",
        //             "time_in_force":"GTC",
        //             "post_only":false,
        //             "reduce_only":false,
        //             "creation_timestamp":1647666666723,
        //             "last_update_timestamp":1647666666725
        //         }]
        //     }
        //
        return this.parseOrders (result, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetOrderHistoryByInstrument (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647671721716,
        //         "usOut":1647671721730,
        //         "usDiff":14,
        //         "result":[{
        //             "currency":"SPOT",
        //             "kind":"spot",
        //             "direction":"sell",
        //             "amount":"0.03",
        //             "price":"-1",
        //             "advanced":"usdt",
        //             "source":"api",
        //             "mmp":false,
        //             "version":1,
        //             "order_id":"250979478947823616",
        //             "order_state":"filled",
        //             "instrument_name":"BNB-USDT-SPOT",
        //             "filled_amount":"0.03",
        //             "average_price":"397.8",
        //             "order_type":"market",
        //             "time_in_force":"GTC",
        //             "post_only":false,
        //             "reduce_only":false,
        //             "creation_timestamp":1647668570759,
        //             "last_update_timestamp":1647668570761
        //         }]
        //     }
        //
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a id argument');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            // 'start_id': 0, // The ID number of the first trade to be returned
            // 'end_id': 0, // The ID number of the last trade to be returned
            // 'sorting': '', // Direction of results sorting,default: desc
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 20
        }
        const response = await this.privateGetGetUserTradesByOrder (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647671425457,
        //         "usOut":1647671425470,
        //         "usDiff":13,
        //         "result":{
        //             "count":1,
        //             "trades":[{
        //                 "direction":"sell",
        //                 "amount":"0.03",
        //                 "price":"397.8",
        //                 "fee":"0.011934",
        //                 "timestamp":1647668570759,
        //                 "role":"taker",
        //                 "trade_id":"58319385",
        //                 "order_id":"250979478947823616",
        //                 "instrument_name":"BNB-USDT-SPOT",
        //                 "order_type":"market",
        //                 "fee_use_coupon":false,
        //                 "fee_coin_type":"USDT",
        //                 "index_price":"",
        //                 "self_trade":false
        //             }],
        //             "has_more":false
        //         }
        //     }
        //
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a id argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const request = {
            // 'kind': '', // The order kind, eg. margin, spot, option, future, perpetual. only used when call privateGetGetUserTradesByCurrency
            // 'start_id': 0, // The ID number of the first trade to be returned
            // 'end_id': 0, // The ID number of the last trade to be returned
            // 'sorting': '', // Direction of results sorting,default: desc
            // 'self_trade': false, // If not set, query all
        };
        let method = undefined;
        const market = this.market (symbol);
        request['instrument_name'] = market['id'];
        if (since === undefined) {
            method = 'privateGetGetUserTradesByInstrument';
        } else {
            method = 'privateGetGetUserTradesByInstrumentAndTime';
        }
        if (limit !== undefined) {
            request['count'] = limit; // default 20
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647668582167,
        //         "usOut":1647668582187,
        //         "usDiff":20,
        //         "result":{
        //             "count":1,
        //             "trades":[{
        //                 "direction":"sell",
        //                 "amount":"0.03",
        //                 "price":"397.8",
        //                 "fee":"0.011934",
        //                 "timestamp":1647668570759,
        //                 "role":"taker",
        //                 "trade_id":"58319385",
        //                 "order_id":"250979478947823616",
        //                 "instrument_name":"BNB-USDT-SPOT",
        //                 "order_type":"market",
        //                 "fee_use_coupon":false,
        //                 "fee_coin_type":"USDT",
        //                 "index_price":"",
        //                 "self_trade":false
        //             }],
        //             "has_more":false
        //         }
        //     }
        //
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "currency":"PERPETUAL",
        //         "kind":"perpetual",
        //         "size":"-0.08",
        //         "direction":"sell",
        //         "leverage":"3",
        //         "margin":"10.7724",
        //         "version":"553",
        //         "roe":"-0.000483",
        //         "traceType":0,
        //         "pos_id":"0",
        //         "instrument_name":"BNB-USDT-PERPETUAL",
        //         "average_price":"403.9",
        //         "mark_price":"403.965",
        //         "initial_margin":"10.77066668",
        //         "maintenance_margin":"0.2100618",
        //         "floating_profit_loss":"-0.0052",
        //         "liquid_price":"549.15437158",
        //         "margin_type":"cross",
        //         "risk_level":"0.017651",
        //         "available_withdraw_funds":"1.13004332",
        //         "order_id":"251085320510201856",
        //         "stop_loss_price":"0",
        //         "stop_loss_type":1,
        //         "take_profit_price":"0",
        //         "take_profit_type":1
        //     }
        //
        const contract = this.safeString (position, 'instrument_name');
        market = this.safeMarket (contract, market);
        const size = this.safeString (position, 'size');
        let side = this.safeString (position, 'direction');
        side = (side === 'buy') ? 'long' : 'short';
        const maintenanceMarginString = this.safeString (position, 'maintenance_margin');
        const riskLevel = this.safeString (position, 'risk_level');
        // maint_margin / collateral = risk_level
        // collateral = maint_margin / risk_level
        const collateral = Precise.stringDiv (maintenanceMarginString, riskLevel);
        const markPrice = this.safeString (position, 'mark_price');
        const notionalString = Precise.stringMul (markPrice, size);
        const unrealisedPnl = this.safeString (position, 'floating_profit_loss');
        const initialMarginString = this.safeString (position, 'initial_margin');
        const percentage = Precise.stringMul (Precise.stringDiv (unrealisedPnl, initialMarginString), '100');
        const marginType = this.safeString (position, 'margin_type');
        return {
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (Precise.stringDiv (initialMarginString, notionalString)),
            'maintenanceMargin': this.parseNumber (maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber (Precise.stringDiv (maintenanceMarginString, notionalString)),
            'entryPrice': this.safeNumber (position, 'average_price'),
            'notional': this.parseNumber (notionalString),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),  // in USD for perpetuals on deribit
            'contractSize': this.safeValue (market, 'contractSize'),
            'marginRatio': this.parseNumber (riskLevel),
            'liquidationPrice': this.safeNumber (position, 'liquid_price'),
            'markPrice': this.parseNumber (markPrice),
            'collateral': this.parseNumber (collateral),
            'marginType': marginType,
            'side': side,
            'percentage': this.parseNumber (percentage),
        };
    }

    async fetchPosition (symbol, params = {}) {
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetPosition (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647693832273,
        //         "usOut":1647693832282,
        //         "usDiff":9,
        //         "result":{
        //             "currency":"PERPETUAL",
        //             "kind":"perpetual",
        //             "size":"-0.08",
        //             "direction":"sell",
        //             "leverage":"3",
        //             "margin":"10.7724",
        //             "version":"553",
        //             "roe":"-0.000483",
        //             "traceType":0,
        //             "pos_id":"0",
        //             "instrument_name":"BNB-USDT-PERPETUAL",
        //             "average_price":"403.9",
        //             "mark_price":"403.965",
        //             "initial_margin":"10.77066668",
        //             "maintenance_margin":"0.2100618",
        //             "floating_profit_loss":"-0.0052",
        //             "liquid_price":"549.15437158",
        //             "margin_type":"cross",
        //             "risk_level":"0.017651",
        //             "available_withdraw_funds":"1.13004332",
        //             "order_id":"251085320510201856",
        //             "stop_loss_price":"0",
        //             "stop_loss_type":1,
        //             "take_profit_price":"0",
        //             "take_profit_type":1
        //         }
        //     }
        //
        return this.parsePosition (result);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.signIn ();
        await this.loadMarkets ();
        const request = {
            'currency': 'PERPETUAL',
            // 'kind' : '', // option, future, spot, margin,perpetual The order kind
        };
        const response = await this.privateGetGetPositions (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647694531356,
        //         "usOut":1647694531364,
        //         "usDiff":8,
        //         "result":[{
        //             "currency":"PERPETUAL",
        //             "kind":"perpetual",
        //             "size":"-0.08",
        //             "direction":"sell",
        //             "leverage":"3",
        //             "margin":"10.7836",
        //             "version":"1251",
        //             "roe":"-0.003602",
        //             "traceType":0,
        //             "pos_id":"0",
        //             "instrument_name":"BNB-USDT-PERPETUAL",
        //             "average_price":"403.9",
        //             "mark_price":"404.385",
        //             "initial_margin":"10.77066668",
        //             "maintenance_margin":"0.2102802",
        //             "floating_profit_loss":"-0.0388",
        //             "liquid_price":"549.15437158",
        //             "margin_type":"cross",
        //             "risk_level":"0.01772",
        //             "available_withdraw_funds":"1.09644332",
        //             "order_id":"251085320510201856",
        //             "stop_loss_price":"0",
        //             "stop_loss_type":1,
        //             "take_profit_price":"0",
        //             "take_profit_type":1
        //         }]
        //     }
        //
        return this.parsePositions (result, symbols);
    }

    parseTransactionStatus (status) {
        const states = {
            'deposit_confirmed': 'ok',
            'deposit_waiting_confirm': 'pending',
            'withdraw_init': 'pending',
            'withdraw_noticed_block_chain': 'pending',
            'withdraw_waiting_confirm': 'pending',
            'withdraw_confirmed': 'ok',
            'withdraw_failed': 'failed',
            'withdraw_auditing': 'pending',
            'withdraw_audit_reject': 'failed',
        };
        return this.safeString (states, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //         {
        //             "id":"250325458128736256",
        //             "amount":"0.04",
        //             "state":"deposit_confirmed",
        //             "coin_type":"BNB",
        //             "token_code":"BNB",
        //             "create_time":"1647512640040",
        //             "update_time":"1647512640053",
        //             "tx_hash":"",
        //             "full_name":"Binance Coin"
        //         }
        //
        // fetchWithdrawals || fetchWithdraw
        //         {
        //             "id":"251076247882829824",
        //             "address":"",
        //             "amount":"0.01",
        //             "state":"withdraw_auditing",
        //             "coin_type":"BNB",
        //             "create_time":"1647691642267",
        //             "update_time":"1647691650090",
        //             "full_name":"Binance Coin",
        //             "token_code":"BNB"
        //         }
        //
        const currencyId = this.safeString (transaction, 'coin_type');
        const code = this.safeCurrencyCode (currencyId, currency);
        const id = this.safeString (transaction, 'id');
        const txId = this.safeString (transaction, 'tx_hash');
        const timestamp = this.safeInteger (transaction, 'create_time');
        const updated = this.safeInteger (transaction, 'update_time');
        const amount = this.safeNumber (transaction, 'amount');
        const status = this.safeString (transaction, 'state');
        return {
            'info': transaction,
            'id': id,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': this.parseTransactionStatus (status),
            'updated': updated,
            'fee': undefined,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires the code argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'coin_type': currency['id'],
        };
        const response = await this.privateGetGetDepositRecord (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647606752447,
        //         "usOut":1647606752457,
        //         "usDiff":10,
        //         "result":[{
        //             "id":"250325458128736256",
        //             "amount":"0.04",
        //             "state":"deposit_confirmed",
        //             "coin_type":"BNB",
        //             "token_code":"BNB",
        //             "create_time":"1647512640040",
        //             "update_time":"1647512640053",
        //             "tx_hash":"",
        //             "full_name":"Binance Coin"
        //         }]
        //     }
        //     }
        //
        return this.parseTransactions (result, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires the code argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'coin_type': currency['id'],
            // 'withdraw_id': 0,
        };
        const response = await this.privateGetGetWithdrawRecord (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647691750112,
        //         "usOut":1647691750125,
        //         "usDiff":13,
        //         "result":[{
        //             "id":"251076247882829824",
        //             "address":"",
        //             "amount":"0.01",
        //             "state":"withdraw_auditing",
        //             "coin_type":"BNB",
        //             "create_time":"1647691642267",
        //             "update_time":"1647691650090",
        //             "full_name":"Binance Coin",
        //             "token_code":"BNB"
        //         }]
        //     }
        //
        return this.parseTransactions (result, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchWithdrawal (id, code = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawal() requires the code argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'coin_type': currency['id'],
            'withdraw_id': id,
        };
        const response = await this.privateGetGetWithdrawRecord (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647691750112,
        //         "usOut":1647691750125,
        //         "usDiff":13,
        //         "result":[{
        //             "id":"251076247882829824",
        //             "address":"",
        //             "amount":"0.01",
        //             "state":"withdraw_auditing",
        //             "coin_type":"BNB",
        //             "create_time":"1647691642267",
        //             "update_time":"1647691650090",
        //             "full_name":"Binance Coin",
        //             "token_code":"BNB"
        //         }]
        //     }
        //
        const records = this.filterBy (result, 'id', id);
        const record = this.safeValue (records, 0);
        return this.parseTransaction (record, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + 'api/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    request += '?' + this.urlencode (params);
                }
            }
            const sessionToken = this.safeString (this.options, 'accessToken');
            if (sessionToken === undefined) {
                throw new AuthenticationError (this.id + ' sign() requires access token');
            }
            headers = {
                'Authorization': 'bearer ' + sessionToken,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                if (Object.keys (params).length) {
                    const rpcPayload = {
                        'jsonrpc': '2.0',
                        'id': this.nonce (),
                        'method': '/' + api + '/' + path,
                        'params': params,
                    };
                    body = this.json (rpcPayload);
                }
            }
        }
        const url = this.urls['api']['rest'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        const error = this.safeValue (response, 'error');
        if (error) {
            const feedback = this.id + ' ' + body;
            const code = this.safeString (error, 'code');
            const message = this.safeString (error, 'message');
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
