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
            // hard limit of 6 requests per 200ms => 30 requests per 1000ms => 1000ms / 30 = 33.3333 ms between requests
            // 10 withdrawal requests per 30 seconds = (1000ms / rateLimit) / (1/3) = 90.1
            // cancels do not count towards rateLimit
            // only 'order-making' requests count towards ratelimit
            'rateLimit': 33.34,
            'certified': false,
            'pro': false,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'urls': {
                'logo': '',
                'www': 'https://www.btcex.com/',
                'api': 'https://api.btcex.com',
                'doc': 'https://docs.btcex.com/',
                'fees': 'https://support.btcex.com/hc/en-us/articles/4415995130647',
                'referral': {
                    'url': '',
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': true,
                'fetchBorrowRateHistory': true,
                'fetchBorrowRates': true,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'withdraw': true,
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
                '3d': '259200',
                '1w': '604800',
                '2w': '1209600',
                '1M': '2592000',
            },
            'api': {
                'public': {
                    'get': {
                        // Market data
                        'get_last_trades_by_currency': 1,
                        'get_last_trades_by_instrument': 1,
                        'get_order_book': 1,
                        'tickers': 1,
                        'get_instruments': 1,
                        'get_tradingview_chart_data': 1,
                        // CMC
                        'cmc_spot_summary': 1,
                        'cmc_spot_ticker': 1,
                        'cmc_spot_orderbook': 1,
                        'cmc_market_trades': 1,
                        'cmc_contracts': 1,
                        'cmc_contract_orderbook': 1,
                        // CoinGecko
                        'coin_gecko_spot_pairs': 1,
                        'coin_gecko_spot_ticker': 1,
                        'coin_gecko_spot_orderbook': 1,
                        'coin_gecko_market_trades': 1,
                        'coin_gecko_contracts': 1,
                        'coin_gecko_contract_orderbook': 1,
                    },
                    'post': {
                        'auth': 1,
                    },
                },
                'private': {
                    'get': {
                        // wallet
                        'get_deposit_record': 1,
                        'get_withdraw_record': 1,
                        // 'get_assets_info': 1,
                        // trade
                        'get_position': 1,
                        'get_positions': 1,
                        'get_open_orders_by_currency': 1,
                        'get_open_orders_by_instrument': 1,
                        'get_order_history_by_currency': 1,
                        'get_order_history_by_instrument': 1,
                        'get_order_state': 1,
                        'get_user_trades_by_currency': 1,
                        'get_user_trades_by_instrument': 1,
                        'get_user_trades_by_order': 1,
                    },
                    'post': {
                        // auth
                        'logout': 1,
                        // wallet
                        'get_assets_info': 1,
                        'add_withdraw_address': 1,
                        // trade
                        'buy': 1,
                        'sell': 1,
                        'cancel': 1,
                        'cancel_all_by_currency': 1,
                        'cancel_all_by_instrument': 1,
                        'close_position': 1,
                    },
                    'delete': {
                    },
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
                    '11000': BadRequest, // CHANNEL_REGEX_ERROR channel regex not match
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'networks': {
                    'ERC20': 'ETH',
                    'BEP20': 'BEP20',
                    'ETH': 'ETH',
                    'BSC': 'BSC',
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
            const contract = (type === 'future');
            const baseId = this.safeString (market, 'base_currency');
            let quoteId = this.safeString (market, 'quote_currency');
            const settlementPeriod = this.safeValue (market, 'settlement_period');
            const margin = !contract;
            const perpetual = (settlementPeriod === 'perpetual');
            const swap = perpetual;
            const spot = (type === 'spot');
            const option = (type === 'option');
            const future = !swap && (type === 'future');
            const expiry = this.safeInteger (market, 'expiration_timestamp');
            const strike = this.safeString (market, 'strike');
            const optionType = this.safeString (market, 'option_type');
            const base = this.safeCurrencyCode (baseId);
            const settleId = quoteId;
            const settle = this.safeCurrencyCode (settleId);
            if (!spot) {
                quoteId = this.safeString (market, 'currency');
            }
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = quote + '/' + base;
            if (option || future) {
                symbol = symbol + ':' + settle + '-' + this.yymmdd (expiry, '');
                if (option) {
                    const letter = (optionType === 'call') ? 'C' : 'P';
                    symbol = symbol + ':' + this.numberToString (strike) + ':' + letter;
                }
            }
            const minTradeAmount = this.safeString (market, 'min_trade_amount');
            const tickSize = this.safeString (market, 'tick_size');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': future,
                'option': option,
                'active': this.safeValue (market, 'enabled'),
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'contractSize': this.safeString (market, 'contract_size'),
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
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
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
        return this.parseOrderBook (result, symbol, timestamp);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "close":177.23,
        //         "high":177.45,
        //         "low":177.2,
        //         "open":177.43,
        //         "startTime":"2019-10-17T13:27:00+00:00",
        //         "time":1571318820000.0,
        //         "volume":0.0
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
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
            limit = 500;
        }
        const request = {
            'resolution': this.timeframes[timeframe],
            'instrument_name': market['id'],
            // 'start_timestamp': 0,
            // 'end_timestamp': 0,
        };
        if (market['spot']) {
            request['instrument_name'] = market['symbol'].replace ('/', '-');
        }
        const timeframeInSeconds = this.parseTimeframe (timeframe);
        const timeframeInMilliseconds = timeframeInSeconds * 1000;
        if (since === undefined) {
            request['end_timestamp'] = this.milliseconds ();
            request['start_timestamp'] = request['end_timestamp'] - (limit * timeframeInMilliseconds);
        } else {
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
        const liquidity = this.safeString (trade, 'liquidity');
        let takerOrMaker = undefined;
        if (liquidity !== undefined) {
            // M = maker, T = taker, MT = both
            takerOrMaker = (liquidity === 'M') ? 'maker' : 'taker';
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
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

    codeFromOptions (methodName, params = {}) {
        const defaultCode = this.safeValue (this.options, 'code', 'BTC');
        const options = this.safeValue (this.options, methodName, {});
        const code = this.safeValue (options, 'code', defaultCode);
        return this.safeValue (params, 'code', code);
    }

    async signIn (params = {}) {
        this.checkRequiredCredentials ();
        const request = {
            'grant_type': 'client_credentials', // client_signature || refresh_token
            'client_id': this.apiKey,
            'client_secret': this.secret,
            // 'refresh_token': '', // Required for grant type refresh_token
            // 'signature': '', // Required for grant type client_signature
        };
        const response = await this.publicPostAuth (this.extend (request, params));
        const result = this.safeString (response, 'result');
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
        const sessionToken = this.safeString (result, 'access_token');
        if (sessionToken !== undefined) {
            this.options['sessionToken'] = sessionToken;
            return result;
        }
        return response;
    }

    parseBalance (response) {
        //
        //     [
        //         {
        //             "assetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //             "available":0.1,
        //             "reserved":0.0,
        //             "timestamp":1644146723620
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'assetId');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free = this.safeString (balance, 'available');
            const used = this.safeString (balance, 'reserved');
            account['free'] = free;
            account['used'] = used;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let assetType = this.safeValue (params, 'asset_type');
        if (assetType === undefined) {
            assetType = [ 'ALL' ];
        }
        const request = {
            'asset_type': assetType,
            // 'coin_type': 'BNB',
            // 'coin_type': ['SPOT'],
        };
        const response = await this.privatePostGetAssetsInfo (this.extend (request, params));
        // const response = await this.privateGetGetAssetsInfo (this.extend (request, params));
        const payload = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 "assetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //                 "available":0.1,
        //                 "reserved":0.0,
        //                 "timestamp":1644146723620
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseBalance (payload);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
            'rejected': 'rejected',
            'untriggered': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'good_til_cancelled': 'GTC',
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
        let trades = this.safeValue (order, 'trades');
        if (trades !== undefined) {
            trades = this.parseTrades (trades, market);
        }
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
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            // for perpetual and futures the amount is in USD
            // for options it is in corresponding cryptocurrency contracts, e.g., BTC or ETH
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
        const conditionType = this.safeStringLower (params, 'condition_type');
        if (type === 'limit') {
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
        }
        if (conditionType === 'stop' || conditionType === 'if_touched') {
            const triggerPrice = this.safeNumber (params, 'trigger_price');
            if (triggerPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a trigger_price param for a ' + conditionType + ' order');
            } else {
                request['trigger_price'] = this.priceToPrecision (symbol, triggerPrice);
            }
            params = this.omit (params, [ 'trigger_price', 'triggerPrice' ]);
        }
        if (conditionType === 'trailing') {
            const trailPrice = this.safeNumber (params, 'trail_price');
            if (trailPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a trail_price param for a ' + conditionType + ' order');
            } else {
                request['trail_price'] = this.priceToPrecision (symbol, trailPrice);
            }
            params = this.omit (params, [ 'trail_price', 'trailPrice' ]);
        }
        const method = 'privatePost' + this.capitalize (side);
        const response = await this[method] (this.extend (request, params));
        //
        //
        const result = this.safeValue (response, 'result', {});
        const order = this.safeValue (result, 'order');
        const trades = this.safeValue (result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder (order, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a price argument');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            // for perpetual and futures the amount is in USD
            // for options it is in corresponding cryptocurrency contracts, e.g., BTC or ETH
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price), // required
            // 'post_only': false, // if the new price would cause the order to be filled immediately (as taker), the price will be changed to be just below the spread.
            // 'reject_post_only': false, // if true the order is put to order book unmodified or request is rejected
            // 'reduce_only': false, // if true, the order is intended to only reduce a current position
            // 'stop_price': false, // stop price, required for stop_limit orders
            // 'advanced': 'usd', // 'implv', advanced option order type, options only
        };
        const response = await this.privateGetEdit (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const order = this.safeValue (result, 'order');
        const trades = this.safeValue (result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder (order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetCancel (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = undefined;
        if (symbol === undefined) {
            method = 'privateGetCancelAll';
        } else {
            method = 'privateGetCancelAllByInstrument';
            const market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'kind': '', // The order kind, eg. margin, spot, option, future, perpetual. only used when call privateGetGetOpenOrdersByCurrency
            // 'type': '', // limit, market The order type
        };
        let market = undefined;
        let method = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions ('fetchOpenOrders', params);
            const currency = this.currency (code);
            request['currency'] = currency['id'];
            method = 'privateGetGetOpenOrdersByCurrency';
        } else {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
            method = 'privateGetGetOpenOrdersByInstrument';
        }
        const response = await this[method] (this.extend (request, params));
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
        await this.loadMarkets ();
        const request = {
            // 'kind': '', // The order kind, eg. margin, spot, option, future, perpetual. only used when call privateGetGetOrderHistoryByCurrency
            // 'offset': 0, // The default is 0. For example, if you query the second page and the quantity is 100, set offset = 100 and count = 100
        };
        let market = undefined;
        let method = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions ('fetchClosedOrders', params);
            const currency = this.currency (code);
            request['currency'] = currency['id'];
            method = 'privateGetGetOrderHistoryByCurrency';
        } else {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
            method = 'privateGetGetOrderHistoryByInstrument';
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
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
        await this.loadMarkets ();
        const request = {
            // 'kind': '', // The order kind, eg. margin, spot, option, future, perpetual. only used when call privateGetGetUserTradesByCurrency
            // 'start_id': 0, // The ID number of the first trade to be returned
            // 'end_id': 0, // The ID number of the last trade to be returned
            // 'sorting': '', // Direction of results sorting,default: desc
            // 'self_trade': false, // If not set, query all
        };
        let market = undefined;
        let method = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions ('fetchMyTrades', params);
            const currency = this.currency (code);
            request['currency'] = currency['id'];
            if (since === undefined) {
                method = 'privateGetGetUserTradesByCurrency';
            } else {
                method = 'privateGetGetUserTradesByCurrencyAndTime';
            }
        } else {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
            if (since === undefined) {
                method = 'privateGetGetUserTradesByInstrument';
            } else {
                method = 'privateGetGetUserTradesByInstrumentAndTime';
            }
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
        //         "jsonrpc": "2.0",
        //         "id": 404,
        //         "result": {
        //             "average_price": 0,
        //             "delta": 0,
        //             "direction": "buy",
        //             "estimated_liquidation_price": 0,
        //             "floating_profit_loss": 0,
        //             "index_price": 3555.86,
        //             "initial_margin": 0,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "leverage": 100,
        //             "kind": "future",
        //             "maintenance_margin": 0,
        //             "mark_price": 3556.62,
        //             "open_orders_margin": 0.000165889,
        //             "realized_profit_loss": 0,
        //             "settlement_price": 3555.44,
        //             "size": 0,
        //             "size_currency": 0,
        //             "total_profit_loss": 0
        //         }
        //     }
        //
        const contract = this.safeString (position, 'instrument_name');
        market = this.safeMarket (contract, market);
        const size = this.safeString (position, 'size');
        let side = this.safeString (position, 'direction');
        side = (side === 'buy') ? 'long' : 'short';
        const maintenanceRate = this.safeString (position, 'maintenance_margin');
        const markPrice = this.safeString (position, 'mark_price');
        const notionalString = Precise.stringMul (markPrice, size);
        const unrealisedPnl = this.safeString (position, 'floating_profit_loss');
        const initialMarginString = this.safeString (position, 'initial_margin');
        const percentage = Precise.stringMul (Precise.stringDiv (unrealisedPnl, initialMarginString), '100');
        const currentTime = this.milliseconds ();
        return {
            'info': position,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (Precise.stringDiv (initialMarginString, notionalString)),
            'maintenanceMargin': this.parseNumber (Precise.stringMul (maintenanceRate, notionalString)),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceRate),
            'entryPrice': this.safeString (position, 'average_price'),
            'notional': this.parseNumber (notionalString),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),  // in USD for perpetuals on deribit
            'contractSize': this.safeValue (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'estimated_liquidation_price'),
            'markPrice': markPrice,
            'collateral': undefined,
            'marginType': undefined,
            'side': side,
            'percentage': this.parseNumber (percentage),
        };
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetPosition (this.extend (request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 404,
        //         "result": {
        //             "average_price": 0,
        //             "delta": 0,
        //             "direction": "buy",
        //             "estimated_liquidation_price": 0,
        //             "floating_profit_loss": 0,
        //             "index_price": 3555.86,
        //             "initial_margin": 0,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "leverage": 100,
        //             "kind": "future",
        //             "maintenance_margin": 0,
        //             "mark_price": 3556.62,
        //             "open_orders_margin": 0.000165889,
        //             "realized_profit_loss": 0,
        //             "settlement_price": 3555.44,
        //             "size": 0,
        //             "size_currency": 0,
        //             "total_profit_loss": 0
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parsePosition (result);
    }

    parsePositions (positions) {
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push (this.parsePosition (positions[i]));
        }
        return result;
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let code = undefined;
        if (symbols === undefined) {
            code = this.codeFromOptions ('fetchPositions', params);
        } else if (typeof symbols === 'string') {
            code = symbols;
        } else {
            if (Array.isArray (symbols)) {
                const length = symbols.length;
                if (length !== 1) {
                    throw new BadRequest (this.id + ' fetchPositions symbols argument cannot contain more than 1 symbol');
                }
                const market = this.market (symbols[0]);
                code = market['base'];
            }
        }
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            // "kind" : "future", "option"
        };
        const response = await this.privateGetGetPositions (this.extend (request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 2236,
        //         "result": [
        //             {
        //                 "average_price": 7440.18,
        //                 "delta": 0.006687487,
        //                 "direction": "buy",
        //                 "estimated_liquidation_price": 1.74,
        //                 "floating_profit_loss": 0,
        //                 "index_price": 7466.79,
        //                 "initial_margin": 0.000197283,
        //                 "instrument_name": "BTC-PERPETUAL",
        //                 "kind": "future",
        //                 "leverage": 34,
        //                 "maintenance_margin": 0.000143783,
        //                 "mark_price": 7476.65,
        //                 "open_orders_margin": 0.000197288,
        //                 "realized_funding": -1e-8,
        //                 "realized_profit_loss": -9e-9,
        //                 "settlement_price": 7476.65,
        //                 "size": 50,
        //                 "size_currency": 0.006687487,
        //                 "total_profit_loss": 0.000032781
        //             },
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parsePositions (result);
    }

    async fetchHistoricalVolatility (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.publicGetGetHistoricalVolatility (this.extend (request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             [1640142000000,63.828320460740585],
        //             [1640142000000,63.828320460740585],
        //             [1640145600000,64.03821964123213]
        //         ],
        //         "usIn": 1641515379467734,
        //         "usOut": 1641515379468095,
        //         "usDiff": 361,
        //         "testnet": false
        //     }
        //
        const volatilityResult = this.safeValue (response, 'result', {});
        const result = [];
        for (let i = 0; i < volatilityResult.length; i++) {
            const timestamp = this.safeInteger (volatilityResult[i], 0);
            const volatility = this.safeNumber (volatilityResult[i], 1);
            result.push ({
                'info': response,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'volatility': volatility,
            });
        }
        return result;
    }

    parseTransactionStatus (status) {
        const states = {
            'deposit_confirmed': 'ok',
            'deposit_waiting_confirm': 'pending',
            'withdraw_init': 'pending',
            'withdraw_noticed_block_chain': 'pending',
            'withdraw_waiting_confirm': 'pending',
            'withdraw_confirmed': 'ok',
            'withdraw_faild': 'failed',
            'withdraw_auditing': 'pending',
            'withdraw_audit_reject': 'failed',
        };
        return this.safeString (states, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //             {
        //                 "id":"250325458128736256",
        //                 "amount":"0.04",
        //                 "state":"deposit_confirmed",
        //                 "coin_type":"BNB",
        //                 "token_code":"BNB",
        //                 "create_time":"1647512640040",
        //                 "update_time":"1647512640053",
        //                 "tx_hash":"",
        //                 "full_name":"Binance Coin"
        //             }
        //
        // fetchWithdrawals || fetchWithdraw || withdraw
        //
        const currencyId = this.safeString (transaction, 'coin_type');
        const code = this.safeCurrencyCode (currencyId, currency);
        const id = this.safeString (transaction, 'id');
        const txId = this.safeString (transaction, 'tx_hash');
        const timestamp = this.safeInteger (transaction, 'create_time');
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
            'updated': undefined,
            'fee': {
                'currency': code,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires the code argument');
        }
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
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'coin_type': currency['id'],
            // 'withdraw_id': 0,
        };
        const response = await this.privateGetGetWithdrawRecord (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //
        return this.parseTransactions (result, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchWithdrawal (id, code = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawal() requires the code argument');
        }
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'coin_type': currency['id'],
            'withdraw_id': id,
        };
        const response = await this.privateGetGetWithdrawRecord (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //
        return this.parseTransaction (result, currency);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
            'amount': this.numberToString (amount),
            'address': address,
            // 'tfa': 0, // 2FA code
        };
        if ('network' in params) {
            const networks = this.safeValue (this.options, 'networks', {});
            const requestedNetwork = this.safeStringUpper (params, 'network');
            params = this.omit (params, [ 'network' ]);
            const networkId = this.safeString (networks, requestedNetwork);
            if (networkId === undefined) {
                throw new ExchangeError (this.id + ' invalid network ' + requestedNetwork);
            }
            request['main_chain'] = networkId;
        }
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostAddWithdrawAddress (this.extend (request, params));
        const result = this.safeValue (response, 'data', {});
        //
        //
        return this.parseTransaction (result, currency);
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
            const sessionToken = this.safeString (this.options, 'sessionToken');
            if (sessionToken === undefined) {
                throw new AuthenticationError (this.id + ' sign() requires session token');
            }
            // headers['Authorization'] = 'Bearer ' + this.apiKey;
            if (method === 'POST') {
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
            headers = {
                'Authorization': 'bearer ' + sessionToken,
            };
        }
        const url = this.urls['api'] + request;
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
