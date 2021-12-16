'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, InsufficientFunds, BadRequest, RateLimitExceeded, InvalidNonce } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': [ 'VG' ], // British Virgin Islands
            'version': 'v2',
            'userAgent': undefined,
            'rateLimit': 100,
            'hostname': 'bybit.com', // bybit.com, bytick.com
            'has': {
                'margin': false,
                'swap': true,
                'future': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchIndexOHLCV': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'setMarginMode': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
                '1y': 'Y',
            },
            'urls': {
                'test': {
                    'spot': 'https://api-testnet.{hostname}',
                    'futures': 'https://api-testnet.{hostname}',
                    'v2': 'https://api-testnet.{hostname}',
                    'public': 'https://api-testnet.{hostname}',
                    'private': 'https://api-testnet.{hostname}',
                },
                'logo': 'https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'futures': 'https://api.{hostname}',
                    'v2': 'https://api.{hostname}',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'www': 'https://www.bybit.com',
                'doc': [
                    'https://bybit-exchange.github.io/docs/inverse/',
                    'https://bybit-exchange.github.io/docs/linear/',
                    'https://github.com/bybit-exchange',
                ],
                'fees': 'https://help.bybit.com/hc/en-us/articles/360039261154',
                'referral': 'https://www.bybit.com/app/register?ref=X7Prm',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': [
                            'symbols',
                        ],
                    },
                    'quote': {
                        'get': [
                            'depth',
                            'depth/merged',
                            'trades',
                            'kline',
                            'ticker/24hr',
                            'ticker/price',
                            'ticker/book_ticker',
                        ],
                    },
                    'private': {
                        'get': [
                            'order',
                            'open-orders',
                            'history-orders',
                            'myTrades',
                            'account',
                            'time',
                        ],
                        'post': [
                            'order',
                        ],
                        'delete': [
                            'order',
                            'order/fast',
                        ],
                    },
                    'order': {
                        'delete': [
                            'batch-cancel',
                            'batch-fast-cancel',
                            'batch-cancel-by-ids',
                        ],
                    },
                },
                'futures': {
                    'private': {
                        'get': [
                            'order/list',
                            'order',
                            'stop-order/list',
                            'stop-order',
                            'position/list',
                            'execution/list',
                            'trade/closed-pnl/list',
                        ],
                        'post': [
                            'order/create',
                            'order/cancel',
                            'order/cancelAll',
                            'order/replace',
                            'stop-order/create',
                            'stop-order/cancel',
                            'stop-order/cancelAll',
                            'stop-order/replace',
                            'position/change-position-margin',
                            'position/trading-stop',
                            'position/leverage/save',
                            'position/switch-mode',
                            'position/switch-isolated',
                            'position/risk-limit',
                        ],
                    },
                },
                'v2': {
                    'public': {
                        'get': [
                            'orderBook/L2',
                            'kline/list',
                            'tickers',
                            'trading-records',
                            'symbols',
                            'liq-records',
                            'mark-price-kline',
                            'index-price-kline',
                            'premium-index-kline',
                            'open-interest',
                            'big-deal',
                            'account-ratio',
                            'time',
                            'announcement',
                            'funding/prev-funding-rate',
                            'risk-limit/list',
                        ],
                    },
                    'private': {
                        'get': [
                            'order/list',
                            'order',
                            'stop-order/list',
                            'stop-order',
                            'position/list',
                            'execution/list',
                            'trade/closed-pnl/list',
                            'funding/prev-funding-rate',
                            'funding/prev-funding',
                            'funding/predicted-funding',
                            'account/api-key',
                            'account/lcp',
                            'wallet/balance',
                            'wallet/fund/records',
                            'wallet/withdraw/list',
                            'exchange-order/list',
                        ],
                        'post': [
                            'order/create',
                            'order/cancel',
                            'order/cancelAll',
                            'order/replace',
                            'stop-order/create',
                            'stop-order/cancel',
                            'stop-order/cancelAll',
                            'stop-order/replace',
                            'position/change-position-margin',
                            'position/trading-stop',
                            'position/leverage/save',
                            'position/switch-mode',
                            'position/switch-isolated',
                            'position/risk-limit',
                        ],
                    },
                },
                'public': {
                    'linear': {
                        'get': [
                            'kline',
                            'recent-trading-records',
                            'funding/prev-funding-rate',
                            'mark-price-kline',
                            'index-price-kline',
                            'premium-index-kline',
                            'risk-limit',
                        ],
                    },
                },
                'private': {
                    'linear': {
                        'get': [
                            'order/list',
                            'order/search',
                            'stop-order/list',
                            'stop-order/search',
                            'position/list',
                            'trade/execution/list',
                            'trade/closed-pnl/list',
                            'funding/predicted-funding',
                            'funding/prev-funding',
                        ],
                        'post': [
                            'order/create',
                            'order/cancel',
                            'order/cancel-all',
                            'order/replace',
                            'stop-order/create',
                            'stop-order/cancel',
                            'stop-order/cancel-all',
                            'stop-order/replace',
                            'position/set-auto-add-margin',
                            'position/switch-isolated',
                            'tpsl/switch-mode',
                            'position/add-margin',
                            'position/set-leverage',
                            'position/trading-stop',
                            'position/set-risk',
                        ],
                    },
                },
            },
            'httpExceptions': {
                '403': RateLimitExceeded, // Forbidden -- You request too many times
            },
            'exceptions': {
                'exact': {
                    '-2015': AuthenticationError, // Invalid API-key, IP, or permissions for action.
                    '10001': BadRequest, // parameter error
                    '10002': InvalidNonce, // request expired, check your timestamp and recv_window
                    '10003': AuthenticationError, // Invalid apikey
                    '10004': AuthenticationError, // invalid sign
                    '10005': PermissionDenied, // permission denied for current apikey
                    '10006': RateLimitExceeded, // too many requests
                    '10007': AuthenticationError, // api_key not found in your request parameters
                    '10010': PermissionDenied, // request ip mismatch
                    '10017': BadRequest, // request path not found or request method is invalid
                    '10018': RateLimitExceeded, // exceed ip rate limit
                    '20001': OrderNotFound, // Order not exists
                    '20003': InvalidOrder, // missing parameter side
                    '20004': InvalidOrder, // invalid parameter side
                    '20005': InvalidOrder, // missing parameter symbol
                    '20006': InvalidOrder, // invalid parameter symbol
                    '20007': InvalidOrder, // missing parameter order_type
                    '20008': InvalidOrder, // invalid parameter order_type
                    '20009': InvalidOrder, // missing parameter qty
                    '20010': InvalidOrder, // qty must be greater than 0
                    '20011': InvalidOrder, // qty must be an integer
                    '20012': InvalidOrder, // qty must be greater than zero and less than 1 million
                    '20013': InvalidOrder, // missing parameter price
                    '20014': InvalidOrder, // price must be greater than 0
                    '20015': InvalidOrder, // missing parameter time_in_force
                    '20016': InvalidOrder, // invalid value for parameter time_in_force
                    '20017': InvalidOrder, // missing parameter order_id
                    '20018': InvalidOrder, // invalid date format
                    '20019': InvalidOrder, // missing parameter stop_px
                    '20020': InvalidOrder, // missing parameter base_price
                    '20021': InvalidOrder, // missing parameter stop_order_id
                    '20022': BadRequest, // missing parameter leverage
                    '20023': BadRequest, // leverage must be a number
                    '20031': BadRequest, // leverage must be greater than zero
                    '20070': BadRequest, // missing parameter margin
                    '20071': BadRequest, // margin must be greater than zero
                    '20084': BadRequest, // order_id or order_link_id is required
                    '30001': BadRequest, // order_link_id is repeated
                    '30003': InvalidOrder, // qty must be more than the minimum allowed
                    '30004': InvalidOrder, // qty must be less than the maximum allowed
                    '30005': InvalidOrder, // price exceeds maximum allowed
                    '30007': InvalidOrder, // price exceeds minimum allowed
                    '30008': InvalidOrder, // invalid order_type
                    '30009': ExchangeError, // no position found
                    '30010': InsufficientFunds, // insufficient wallet balance
                    '30011': PermissionDenied, // operation not allowed as position is undergoing liquidation
                    '30012': PermissionDenied, // operation not allowed as position is undergoing ADL
                    '30013': PermissionDenied, // position is in liq or adl status
                    '30014': InvalidOrder, // invalid closing order, qty should not greater than size
                    '30015': InvalidOrder, // invalid closing order, side should be opposite
                    '30016': ExchangeError, // TS and SL must be cancelled first while closing position
                    '30017': InvalidOrder, // estimated fill price cannot be lower than current Buy liq_price
                    '30018': InvalidOrder, // estimated fill price cannot be higher than current Sell liq_price
                    '30019': InvalidOrder, // cannot attach TP/SL params for non-zero position when placing non-opening position order
                    '30020': InvalidOrder, // position already has TP/SL params
                    '30021': InvalidOrder, // cannot afford estimated position_margin
                    '30022': InvalidOrder, // estimated buy liq_price cannot be higher than current mark_price
                    '30023': InvalidOrder, // estimated sell liq_price cannot be lower than current mark_price
                    '30024': InvalidOrder, // cannot set TP/SL/TS for zero-position
                    '30025': InvalidOrder, // trigger price should bigger than 10% of last price
                    '30026': InvalidOrder, // price too high
                    '30027': InvalidOrder, // price set for Take profit should be higher than Last Traded Price
                    '30028': InvalidOrder, // price set for Stop loss should be between Liquidation price and Last Traded Price
                    '30029': InvalidOrder, // price set for Stop loss should be between Last Traded Price and Liquidation price
                    '30030': InvalidOrder, // price set for Take profit should be lower than Last Traded Price
                    '30031': InsufficientFunds, // insufficient available balance for order cost
                    '30032': InvalidOrder, // order has been filled or cancelled
                    '30033': RateLimitExceeded, // The number of stop orders exceeds maximum limit allowed
                    '30034': OrderNotFound, // no order found
                    '30035': RateLimitExceeded, // too fast to cancel
                    '30036': ExchangeError, // the expected position value after order execution exceeds the current risk limit
                    '30037': InvalidOrder, // order already cancelled
                    '30041': ExchangeError, // no position found
                    '30042': InsufficientFunds, // insufficient wallet balance
                    '30043': InvalidOrder, // operation not allowed as position is undergoing liquidation
                    '30044': InvalidOrder, // operation not allowed as position is undergoing AD
                    '30045': InvalidOrder, // operation not allowed as position is not normal status
                    '30049': InsufficientFunds, // insufficient available balance
                    '30050': ExchangeError, // any adjustments made will trigger immediate liquidation
                    '30051': ExchangeError, // due to risk limit, cannot adjust leverage
                    '30052': ExchangeError, // leverage can not less than 1
                    '30054': ExchangeError, // position margin is invalid
                    '30057': ExchangeError, // requested quantity of contracts exceeds risk limit
                    '30063': ExchangeError, // reduce-only rule not satisfied
                    '30067': InsufficientFunds, // insufficient available balance
                    '30068': ExchangeError, // exit value must be positive
                    '30074': InvalidOrder, // can't create the stop order, because you expect the order will be triggered when the LastPrice(or IndexPrice、 MarkPrice, determined by trigger_by) is raising to stop_px, but the LastPrice(or IndexPrice、 MarkPrice) is already equal to or greater than stop_px, please adjust base_price or stop_px
                    '30075': InvalidOrder, // can't create the stop order, because you expect the order will be triggered when the LastPrice(or IndexPrice、 MarkPrice, determined by trigger_by) is falling to stop_px, but the LastPrice(or IndexPrice、 MarkPrice) is already equal to or less than stop_px, please adjust base_price or stop_px
                    '33004': AuthenticationError, // apikey already expired
                    '34026': ExchangeError, // the limit is no change
                },
                'broad': {
                    'unknown orderInfo': OrderNotFound, // {"ret_code":-1,"ret_msg":"unknown orderInfo","ext_code":"","ext_info":"","result":null,"time_now":"1584030414.005545","rate_limit_status":99,"rate_limit_reset_ms":1584030414003,"rate_limit":100}
                    'invalid api_key': AuthenticationError, // {"ret_code":10003,"ret_msg":"invalid api_key","ext_code":"","ext_info":"","result":null,"time_now":"1599547085.415797"}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'marketTypes': {
                    'BTC/USDT': 'linear',
                    'ETH/USDT': 'linear',
                    'BNB/USDT': 'linear',
                    'ADA/USDT': 'linear',
                    'DOGE/USDT': 'linear',
                    'XRP/USDT': 'linear',
                    'DOT/USDT': 'linear',
                    'UNI/USDT': 'linear',
                    'BCH/USDT': 'linear',
                    'LTC/USDT': 'linear',
                    'SOL/USDT': 'linear',
                    'LINK/USDT': 'linear',
                    'MATIC/USDT': 'linear',
                    'ETC/USDT': 'linear',
                    'FIL/USDT': 'linear',
                    'EOS/USDT': 'linear',
                    'AAVE/USDT': 'linear',
                    'XTZ/USDT': 'linear',
                    'SUSHI/USDT': 'linear',
                    'XEM/USDT': 'linear',
                    'BTC/USD': 'inverse',
                    'ETH/USD': 'inverse',
                    'EOS/USD': 'inverse',
                    'XRP/USD': 'inverse',
                },
                'defaultType': 'linear',  // linear, inverse, futures
                'code': 'BTC',
                'cancelAllOrders': {
                    // 'method': 'v2PrivatePostOrderCancelAll', // v2PrivatePostStopOrderCancelAll
                },
                'recvWindow': 5 * 1000, // 5 sec default
                'timeDifference': 0, // the difference between system clock and exchange server clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.00075,
                    'maker': -0.00025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference (params = {}) {
        const serverTime = await this.fetchTime (params);
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        const response = await this.v2PublicGetTime (params);
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: {},
        //         time_now: '1583933682.448826'
        //     }
        //
        return this.safeTimestamp (response, 'time_now');
    }

    async fetchMarkets (params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const response = await this.v2PublicGetSymbols (params);
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":[
        //             {
        //                 "name":"BTCUSD",
        //                 "alias":"BTCUSD",
        //                 "status":"Trading",
        //                 "base_currency":"BTC",
        //                 "quote_currency":"USD",
        //                 "price_scale":2,
        //                 "taker_fee":"0.00075",
        //                 "maker_fee":"-0.00025",
        //                 "leverage_filter":{"min_leverage":1,"max_leverage":100,"leverage_step":"0.01"},
        //                 "price_filter":{"min_price":"0.5","max_price":"999999.5","tick_size":"0.5"},
        //                 "lot_size_filter":{"max_trading_qty":1000000,"min_trading_qty":1,"qty_step":1}
        //             },
        //             {
        //                 "name":"BTCUSDT",
        //                 "alias":"BTCUSDT",
        //                 "status":"Trading",
        //                 "base_currency":"BTC",
        //                 "quote_currency":"USDT",
        //                 "price_scale":2,
        //                 "taker_fee":"0.00075",
        //                 "maker_fee":"-0.00025",
        //                 "leverage_filter":{"min_leverage":1,"max_leverage":100,"leverage_step":"0.01"},
        //                 "price_filter":{"min_price":"0.5","max_price":"999999.5","tick_size":"0.5"},
        //                 "lot_size_filter":{"max_trading_qty":100,"min_trading_qty":0.001,"qty_step":0.001}
        //             },
        //         ],
        //         "time_now":"1610539664.818033"
        //     }
        //
        const markets = this.safeValue (response, 'result', []);
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const linearQuoteCurrencies = this.safeValue (options, 'linear', { 'USDT': true });
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString2 (market, 'name', 'symbol');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const linear = (quote in linearQuoteCurrencies);
            const inverse = !linear;
            let symbol = base + '/' + quote;
            const baseQuote = base + quote;
            let type = 'swap';
            if (baseQuote !== id) {
                symbol = id;
                type = 'futures';
            }
            const lotSizeFilter = this.safeValue (market, 'lot_size_filter', {});
            const priceFilter = this.safeValue (market, 'price_filter', {});
            const precision = {
                'amount': this.safeNumber (lotSizeFilter, 'qty_step'),
                'price': this.safeNumber (priceFilter, 'tick_size'),
            };
            const leverage = this.safeValue (market, 'leverage_filter', {});
            const status = this.safeString (market, 'status');
            let active = undefined;
            if (status !== undefined) {
                active = (status === 'Trading');
            }
            const spot = (type === 'spot');
            const swap = (type === 'swap');
            const futures = (type === 'futures');
            const option = (type === 'option');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
                'type': type,
                'spot': spot,
                'swap': swap,
                'futures': futures,
                'option': option,
                'linear': linear,
                'inverse': inverse,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (lotSizeFilter, 'min_trading_qty'),
                        'max': this.safeNumber (lotSizeFilter, 'max_trading_qty'),
                    },
                    'price': {
                        'min': this.safeNumber (priceFilter, 'min_price'),
                        'max': this.safeNumber (priceFilter, 'max_price'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'max': this.safeNumber (leverage, 'max_leverage', 1),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         symbol: 'BTCUSD',
        //         bid_price: '7680',
        //         ask_price: '7680.5',
        //         last_price: '7680.00',
        //         last_tick_direction: 'MinusTick',
        //         prev_price_24h: '7870.50',
        //         price_24h_pcnt: '-0.024204',
        //         high_price_24h: '8035.00',
        //         low_price_24h: '7671.00',
        //         prev_price_1h: '7780.00',
        //         price_1h_pcnt: '-0.012853',
        //         mark_price: '7683.27',
        //         index_price: '7682.74',
        //         open_interest: 188829147,
        //         open_value: '23670.06',
        //         total_turnover: '25744224.90',
        //         turnover_24h: '102997.83',
        //         total_volume: 225448878806,
        //         volume_24h: 809919408,
        //         funding_rate: '0.0001',
        //         predicted_funding_rate: '0.0001',
        //         next_funding_time: '2020-03-12T00:00:00Z',
        //         countdown_hour: 7
        //     }
        //
        const timestamp = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'last_price');
        const open = this.safeNumber (ticker, 'prev_price_24h');
        let percentage = this.safeNumber (ticker, 'price_24h_pcnt');
        if (percentage !== undefined) {
            percentage *= 100;
        }
        let change = undefined;
        let average = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            change = last - open;
            average = this.sum (open, last) / 2;
        }
        const baseVolume = this.safeNumber (ticker, 'turnover_24h');
        const quoteVolume = this.safeNumber (ticker, 'volume_24h');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high_price_24h'),
            'low': this.safeNumber (ticker, 'low_price_24h'),
            'bid': this.safeNumber (ticker, 'bid_price'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask_price'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v2PublicGetTickers (this.extend (request, params));
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 symbol: 'BTCUSD',
        //                 bid_price: '7680',
        //                 ask_price: '7680.5',
        //                 last_price: '7680.00',
        //                 last_tick_direction: 'MinusTick',
        //                 prev_price_24h: '7870.50',
        //                 price_24h_pcnt: '-0.024204',
        //                 high_price_24h: '8035.00',
        //                 low_price_24h: '7671.00',
        //                 prev_price_1h: '7780.00',
        //                 price_1h_pcnt: '-0.012853',
        //                 mark_price: '7683.27',
        //                 index_price: '7682.74',
        //                 open_interest: 188829147,
        //                 open_value: '23670.06',
        //                 total_turnover: '25744224.90',
        //                 turnover_24h: '102997.83',
        //                 total_volume: 225448878806,
        //                 volume_24h: 809919408,
        //                 funding_rate: '0.0001',
        //                 predicted_funding_rate: '0.0001',
        //                 next_funding_time: '2020-03-12T00:00:00Z',
        //                 countdown_hour: 7
        //             }
        //         ],
        //         time_now: '1583948195.818255'
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const first = this.safeValue (result, 0);
        const timestamp = this.safeTimestamp (response, 'time_now');
        const ticker = this.parseTicker (first, market);
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v2PublicGetTickers (params);
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 symbol: 'BTCUSD',
        //                 bid_price: '7680',
        //                 ask_price: '7680.5',
        //                 last_price: '7680.00',
        //                 last_tick_direction: 'MinusTick',
        //                 prev_price_24h: '7870.50',
        //                 price_24h_pcnt: '-0.024204',
        //                 high_price_24h: '8035.00',
        //                 low_price_24h: '7671.00',
        //                 prev_price_1h: '7780.00',
        //                 price_1h_pcnt: '-0.012853',
        //                 mark_price: '7683.27',
        //                 index_price: '7682.74',
        //                 open_interest: 188829147,
        //                 open_value: '23670.06',
        //                 total_turnover: '25744224.90',
        //                 turnover_24h: '102997.83',
        //                 total_volume: 225448878806,
        //                 volume_24h: 809919408,
        //                 funding_rate: '0.0001',
        //                 predicted_funding_rate: '0.0001',
        //                 next_funding_time: '2020-03-12T00:00:00Z',
        //                 countdown_hour: 7
        //             }
        //         ],
        //         time_now: '1583948195.818255'
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const tickers = {};
        for (let i = 0; i < result.length; i++) {
            const ticker = this.parseTicker (result[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // inverse perpetual BTC/USD
        //
        //     {
        //         symbol: 'BTCUSD',
        //         interval: '1',
        //         open_time: 1583952540,
        //         open: '7760.5',
        //         high: '7764',
        //         low: '7757',
        //         close: '7763.5',
        //         volume: '1259766',
        //         turnover: '162.32773718999994'
        //     }
        //
        // linear perpetual BTC/USDT
        //
        //     {
        //         "id":143536,
        //         "symbol":"BTCUSDT",
        //         "period":"15",
        //         "start_at":1587883500,
        //         "volume":1.035,
        //         "open":7540.5,
        //         "high":7541,
        //         "low":7540.5,
        //         "close":7541
        //     }
        //
        return [
            this.safeTimestamp2 (ohlcv, 'open_time', 'start_at'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber2 (ohlcv, 'volume', 'turnover'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a since argument or a limit argument');
            } else {
                request['from'] = now - limit * duration;
            }
        } else {
            request['from'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 200, default 200
        }
        let method = 'v2PublicGetKlineList';
        if (price === 'mark') {
            method = 'v2PublicGetMarkPriceKline';
        } else if (price === 'index') {
            method = 'v2PublicGetIndexPriceKline';
        } else if (price === 'premiumIndex') {
            method = 'v2PublicGetPremiumIndexKline';
        } else if (market['linear']) {
            method = 'publicLinearGetKline';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // inverse perpetual BTC/USD
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 symbol: 'BTCUSD',
        //                 interval: '1',
        //                 open_time: 1583952540,
        //                 open: '7760.5',
        //                 high: '7764',
        //                 low: '7757',
        //                 close: '7763.5',
        //                 volume: '1259766',
        //                 turnover: '162.32773718999994'
        //             },
        //         ],
        //         time_now: '1583953082.397330'
        //     }
        //
        // linear perpetual BTC/USDT
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":[
        //             {
        //                 "id":143536,
        //                 "symbol":"BTCUSDT",
        //                 "period":"15",
        //                 "start_at":1587883500,
        //                 "volume":1.035,
        //                 "open":7540.5,
        //                 "high":7541,
        //                 "low":7540.5,
        //                 "close":7541
        //             }
        //         ],
        //         "time_now":"1587884120.168077"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const method = market['linear'] ? 'publicLinearGetFundingPrevFundingRate' : 'v2PublicGetFundingPrevFundingRate';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "ret_code": 0,
        //     "ret_msg": "ok",
        //     "ext_code": "",
        //     "result": {
        //         "symbol": "BTCUSD",
        //         "funding_rate": "0.00010000",
        //         "funding_rate_timestamp": 1577433600
        //     },
        //     "ext_info": null,
        //     "time_now": "1577445586.446797",
        //     "rate_limit_status": 119,
        //     "rate_limit_reset_ms": 1577445586454,
        //     "rate_limit": 120
        // }
        //
        const result = this.safeValue (response, 'result');
        const nextFundingRate = this.safeNumber (result, 'funding_rate');
        const previousFundingTime = this.safeInteger (result, 'funding_rate_timestamp') * 1000;
        const nextFundingTime = previousFundingTime + (8 * 3600000);
        const currentTime = this.milliseconds ();
        return {
            'info': result,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'previousFundingRate': undefined,
            'nextFundingRate': nextFundingRate,
            'previousFundingTimestamp': previousFundingTime,
            'nextFundingTimestamp': nextFundingTime,
            'previousFundingDatetime': this.iso8601 (previousFundingTime),
            'nextFundingDatetime': this.iso8601 (nextFundingTime),
        };
    }

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (since === undefined && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchIndexOHLCV() requires a since argument or a limit argument');
        }
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (since === undefined && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMarkOHLCV() requires a since argument or a limit argument');
        }
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchPremiumIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (since === undefined && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPremiumIndexOHLCV() requires a since argument or a limit argument');
        }
        const request = {
            'price': 'premiumIndex',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "id": "44275042152",
        //          "symbol": "AAVEUSDT",
        //          "price": "256.35",
        //          "qty": "0.1",
        //          "side": "Buy",
        //          "time": "2021-11-30T12:46:14.000Z",
        //          "trade_time_ms": "1638276374312"
        //      }
        //
        // fetchMyTrades, fetchOrderTrades (private)
        //
        //      {
        //          "order_id": "b020b4bc-6fe2-45b5-adbc-dd07794f9746",
        //          "order_link_id": "",
        //          "side": "Buy",
        //          "symbol": "AAVEUSDT",
        //          "exec_id": "09abe8f0-aea6-514e-942b-7da8cb935120",
        //          "price": "269.3",
        //          "order_price": "269.3",
        //          "order_qty": "0.1",
        //          "order_type": "Market",
        //          "fee_rate": "0.00075",
        //          "exec_price": "256.35",
        //          "exec_type": "Trade",
        //          "exec_qty": "0.1",
        //          "exec_fee": "0.01922625",
        //          "exec_value": "25.635",
        //          "leaves_qty": "0",
        //          "closed_size": "0",
        //          "last_liquidity_ind": "RemovedLiquidity",
        //          "trade_time": "1638276374",
        //          "trade_time_ms": "1638276374312"
        //      }
        //
        const id = this.safeString2 (trade, 'id', 'exec_id');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const amountString = this.safeString2 (trade, 'qty', 'exec_qty');
        const priceString = this.safeString2 (trade, 'exec_price', 'price');
        const costString = this.safeString (trade, 'exec_value');
        let timestamp = this.parse8601 (this.safeString (trade, 'time'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'trade_time_ms');
        }
        const side = this.safeStringLower (trade, 'side');
        const lastLiquidityInd = this.safeString (trade, 'last_liquidity_ind');
        const takerOrMaker = (lastLiquidityInd === 'AddedLiquidity') ? 'maker' : 'taker';
        const feeCostString = this.safeString (trade, 'exec_fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyCode = market['inverse'] ? market['base'] : market['quote'];
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': this.safeString (trade, 'fee_rate'),
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeStringLower (trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'from': 123, // from id
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 500, max 1000
        }
        const method = market['linear'] ? 'publicLinearGetRecentTradingRecords' : 'v2PublicGetTradingRecords';
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             {
        //                 id: 43785688,
        //                 symbol: 'BTCUSD',
        //                 price: 7786,
        //                 qty: 67,
        //                 side: 'Sell',
        //                 time: '2020-03-11T19:18:30.123Z'
        //             },
        //         ],
        //         time_now: '1583954313.393362'
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTrades (result, market, since, limit);
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'Buy', asksKey = 'Sell', priceKey = 'price', amountKey = 'size') {
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbook.length; i++) {
            const bidask = orderbook[i];
            const side = this.safeString (bidask, 'side');
            if (side === 'Buy') {
                bids.push (this.parseBidAsk (bidask, priceKey, amountKey));
            } else if (side === 'Sell') {
                asks.push (this.parseBidAsk (bidask, priceKey, amountKey));
            } else {
                throw new ExchangeError (this.id + ' parseOrderBook encountered an unrecognized bidask format: ' + this.json (bidask));
            }
        }
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v2PublicGetOrderBookL2 (this.extend (request, params));
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [
        //             { symbol: 'BTCUSD', price: '7767.5', size: 677956, side: 'Buy' },
        //             { symbol: 'BTCUSD', price: '7767', size: 580690, side: 'Buy' },
        //             { symbol: 'BTCUSD', price: '7766.5', size: 475252, side: 'Buy' },
        //             { symbol: 'BTCUSD', price: '7768', size: 330847, side: 'Sell' },
        //             { symbol: 'BTCUSD', price: '7768.5', size: 97159, side: 'Sell' },
        //             { symbol: 'BTCUSD', price: '7769', size: 6508, side: 'Sell' },
        //         ],
        //         time_now: '1583954829.874823'
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeTimestamp (response, 'time_now');
        return this.parseOrderBook (result, symbol, timestamp, 'Buy', 'Sell', 'price', 'size');
    }

    async fetchBalance (params = {}) {
        // note: any funds in the 'spot' account will not be returned or visible from this endpoint
        await this.loadMarkets ();
        const request = {};
        const coin = this.safeString (params, 'coin');
        const code = this.safeString (params, 'code');
        if (coin !== undefined) {
            request['coin'] = coin;
        } else if (code !== undefined) {
            const currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.v2PrivateGetWalletBalance (this.extend (request, params));
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: {
        //             BTC: {
        //                 equity: 0,
        //                 available_balance: 0,
        //                 used_margin: 0,
        //                 order_margin: 0,
        //                 position_margin: 0,
        //                 occ_closing_fee: 0,
        //                 occ_funding_fee: 0,
        //                 wallet_balance: 0,
        //                 realised_pnl: 0,
        //                 unrealised_pnl: 0,
        //                 cum_realised_pnl: 0,
        //                 given_cash: 0,
        //                 service_cash: 0
        //             }
        //         },
        //         time_now: '1583937810.370020',
        //         rate_limit_status: 119,
        //         rate_limit_reset_ms: 1583937810367,
        //         rate_limit: 120
        //     }
        //
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'result', {});
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available_balance');
            account['used'] = this.safeString (balance, 'used_margin');
            account['total'] = this.safeString (balance, 'equity');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            // basic orders
            'Created': 'open',
            'Rejected': 'rejected', // order is triggered but failed upon being placed
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'PendingCancel': 'canceling', // the engine has received the cancellation but there is no guarantee that it will be successful
            // conditional orders
            'Active': 'open', // order is triggered and placed successfully
            'Untriggered': 'open', // order waits to be triggered
            'Triggered': 'closed', // order is triggered
            // 'Cancelled': 'canceled', // order is cancelled
            // 'Rejected': 'rejected', // order is triggered but fail to be placed
            'Deactivated': 'canceled', // conditional order was cancelled before triggering
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'GoodTillCancel': 'GTC',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
            'PostOnly': 'PO',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "user_id": 1,
        //         "order_id": "335fd977-e5a5-4781-b6d0-c772d5bfb95b",
        //         "symbol": "BTCUSD",
        //         "side": "Buy",
        //         "order_type": "Limit",
        //         "price": 8800,
        //         "qty": 1,
        //         "time_in_force": "GoodTillCancel",
        //         "order_status": "Created",
        //         "last_exec_time": 0,
        //         "last_exec_price": 0,
        //         "leaves_qty": 1,
        //         "cum_exec_qty": 0, // in contracts, where 1 contract = 1 quote currency unit (USD for inverse contracts)
        //         "cum_exec_value": 0, // in contract's underlying currency (BTC for inverse contracts)
        //         "cum_exec_fee": 0,
        //         "reject_reason": "",
        //         "order_link_id": "",
        //         "created_at": "2019-11-30T11:03:43.452Z",
        //         "updated_at": "2019-11-30T11:03:43.455Z"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "user_id" : 599946,
        //         "symbol" : "BTCUSD",
        //         "side" : "Buy",
        //         "order_type" : "Limit",
        //         "price" : "7948",
        //         "qty" : 10,
        //         "time_in_force" : "GoodTillCancel",
        //         "order_status" : "Filled",
        //         "ext_fields" : {
        //             "o_req_num" : -1600687220498,
        //             "xreq_type" : "x_create"
        //         },
        //         "last_exec_time" : "1588150113.968422",
        //         "last_exec_price" : "7948",
        //         "leaves_qty" : 0,
        //         "leaves_value" : "0",
        //         "cum_exec_qty" : 10,
        //         "cum_exec_value" : "0.00125817",
        //         "cum_exec_fee" : "-0.00000031",
        //         "reject_reason" : "",
        //         "cancel_type" : "",
        //         "order_link_id" : "",
        //         "created_at" : "2020-04-29T08:45:24.399146Z",
        //         "updated_at" : "2020-04-29T08:48:33.968422Z",
        //         "order_id" : "dd2504b9-0157-406a-99e1-efa522373944"
        //     }
        //
        // conditional order
        //
        //     {
        //         "user_id":##,
        //         "symbol":"BTCUSD",
        //         "side":"Buy",
        //         "order_type":"Market",
        //         "price":0,
        //         "qty":10,
        //         "time_in_force":"GoodTillCancel",
        //         "stop_order_type":"Stop",
        //         "trigger_by":"LastPrice",
        //         "base_price":11833,
        //         "order_status":"Untriggered",
        //         "ext_fields":{
        //             "stop_order_type":"Stop",
        //             "trigger_by":"LastPrice",
        //             "base_price":11833,
        //             "expected_direction":"Rising",
        //             "trigger_price":12400,
        //             "close_on_trigger":true,
        //             "op_from":"api",
        //             "remark":"x.x.x.x",
        //             "o_req_num":0
        //         },
        //         "leaves_qty":10,
        //         "leaves_value":0.00080645,
        //         "reject_reason":null,
        //         "cross_seq":-1,
        //         "created_at":"2020-08-21T09:18:48.000Z",
        //         "updated_at":"2020-08-21T09:18:48.000Z",
        //         "trigger_price":12400,
        //         "stop_order_id":"3f3b54b1-3379-42c7-8510-44f4d9915be0"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let feeCurrency = undefined;
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const id = this.safeString2 (order, 'order_id', 'stop_order_id');
        const type = this.safeStringLower (order, 'order_type');
        const price = this.safeString (order, 'price');
        const average = this.safeString (order, 'average_price');
        const amount = this.safeString (order, 'qty');
        const cost = this.safeString (order, 'cum_exec_value');
        const filled = this.safeString (order, 'cum_exec_qty');
        const remaining = this.safeString (order, 'leaves_qty');
        const marketTypes = this.safeValue (this.options, 'marketTypes', {});
        const marketType = this.safeString (marketTypes, symbol);
        if (market !== undefined) {
            if (marketType === 'linear') {
                feeCurrency = market['quote'];
            } else {
                feeCurrency = market['base'];
            }
        }
        let lastTradeTimestamp = this.safeTimestamp (order, 'last_exec_time');
        if (lastTradeTimestamp === 0) {
            lastTradeTimestamp = undefined;
        }
        const status = this.parseOrderStatus (this.safeString2 (order, 'order_status', 'stop_order_status'));
        const side = this.safeStringLower (order, 'side');
        const feeCostString = Precise.stringAbs (this.safeString (order, 'cum_exec_fee'));
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
            };
        }
        let clientOrderId = this.safeString (order, 'order_link_id');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'time_in_force'));
        const stopPrice = this.safeNumber2 (order, 'trigger_price', 'stop_px');
        const postOnly = (timeInForce === 'PO');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'order_link_id': 'string', // one of order_id, stop_order_id or order_link_id is required
            // regular orders ---------------------------------------------
            // 'order_id': id, // one of order_id or order_link_id is required for regular orders
            // conditional orders ---------------------------------------------
            // 'stop_order_id': id, // one of stop_order_id or order_link_id is required for conditional orders
        };
        let method = undefined;
        if (market['swap']) {
            if (market['linear']) {
                method = 'privateLinearGetOrderSearch';
            } else if (market['inverse']) {
                method = 'v2PrivateGetOrder';
            }
        } else if (market['futures']) {
            method = 'futuresPrivateGetOrder';
        }
        const stopOrderId = this.safeString (params, 'stop_order_id');
        if (stopOrderId === undefined) {
            const orderLinkId = this.safeString (params, 'order_link_id');
            if (orderLinkId === undefined) {
                request['order_id'] = id;
            }
        } else {
            if (market['swap']) {
                if (market['linear']) {
                    method = 'privateLinearGetStopOrderSearch';
                } else if (market['inverse']) {
                    method = 'v2PrivateGetStopOrder';
                }
            } else if (market['futures']) {
                method = 'futuresPrivateGetStopOrder';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "OK",
        //         "ext_code": "",
        //         "ext_info": "",
        //         "result": {
        //             "user_id": 1,
        //             "symbol": "BTCUSD",
        //             "side": "Sell",
        //             "order_type": "Limit",
        //             "price": "8083",
        //             "qty": 10,
        //             "time_in_force": "GoodTillCancel",
        //             "order_status": "New",
        //             "ext_fields": { "o_req_num": -308787, "xreq_type": "x_create", "xreq_offset": 4154640 },
        //             "leaves_qty": 10,
        //             "leaves_value": "0.00123716",
        //             "cum_exec_qty": 0,
        //             "reject_reason": "",
        //             "order_link_id": "",
        //             "created_at": "2019-10-21T07:28:19.396246Z",
        //             "updated_at": "2019-10-21T07:28:19.396246Z",
        //             "order_id": "efa44157-c355-4a98-b6d6-1d846a936b93"
        //         },
        //         "time_now": "1571651135.291930",
        //         "rate_limit_status": 99, // The remaining number of accesses in one minute
        //         "rate_limit_reset_ms": 1580885703683,
        //         "rate_limit": 100
        //     }
        //
        // conditional orders
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "OK",
        //         "ext_code": "",
        //         "ext_info": "",
        //         "result": {
        //             "user_id": 1,
        //             "symbol": "BTCUSD",
        //             "side": "Buy",
        //             "order_type": "Limit",
        //             "price": "8000",
        //             "qty": 1,
        //             "time_in_force": "GoodTillCancel",
        //             "order_status": "Untriggered",
        //             "ext_fields": {},
        //             "leaves_qty": 1,
        //             "leaves_value": "0.00013333",
        //             "cum_exec_qty": 0,
        //             "cum_exec_value": null,
        //             "cum_exec_fee": null,
        //             "reject_reason": "",
        //             "order_link_id": "",
        //             "created_at": "2019-12-27T19:56:24.052194Z",
        //             "updated_at": "2019-12-27T19:56:24.052194Z",
        //             "order_id": "378a1bbc-a93a-4e75-87f4-502ea754ba36"
        //         },
        //         "time_now": "1577476584.386958",
        //         "rate_limit_status": 99,
        //         "rate_limit_reset_ms": 1580885703683,
        //         "rate_limit": 100
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let qty = this.amountToPrecision (symbol, amount);
        if (market['inverse']) {
            qty = parseInt (qty);
        } else {
            qty = parseFloat (qty);
        }
        const request = {
            // orders ---------------------------------------------------------
            'side': this.capitalize (side),
            'symbol': market['id'],
            'order_type': this.capitalize (type),
            'qty': qty, // order quantity in USD, integer only
            // 'price': parseFloat (this.priceToPrecision (symbol, price)), // required for limit orders
            'time_in_force': 'GoodTillCancel', // ImmediateOrCancel, FillOrKill, PostOnly
            // 'take_profit': 123.45, // take profit price, only take effect upon opening the position
            // 'stop_loss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduce_only': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            // close_on_trigger to avoid failing due to insufficient available margin
            // 'close_on_trigger': false, required for linear orders
            // 'order_link_id': 'string', // unique client order id, max 36 characters
            // conditional orders ---------------------------------------------
            // base_price is used to compare with the value of stop_px, to decide
            // whether your conditional order will be triggered by crossing trigger
            // price from upper side or lower side, mainly used to identify the
            // expected direction of the current conditional order
            // 'base_price': 123.45, // required for conditional orders
            // 'stop_px': 123.45, // trigger price, required for conditional orders
            // 'trigger_by': 'LastPrice', // IndexPrice, MarkPrice
        };
        let priceIsRequired = false;
        if (type === 'limit') {
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price !== undefined) {
                request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            } else {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
        }
        const clientOrderId = this.safeString2 (params, 'order_link_id', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['order_link_id'] = clientOrderId;
            params = this.omit (params, [ 'order_link_id', 'clientOrderId' ]);
        }
        const stopPx = this.safeValue2 (params, 'stop_px', 'stopPrice');
        const basePrice = this.safeValue (params, 'base_price');
        let method = undefined;
        if (market['swap']) {
            if (market['linear']) {
                method = 'privateLinearPostOrderCreate';
                request['reduce_only'] = false;
                request['close_on_trigger'] = false;
            } else if (market['inverse']) {
                method = 'v2PrivatePostOrderCreate';
            }
        } else if (market['futures']) {
            method = 'futuresPrivatePostOrderCreate';
        }
        if (stopPx !== undefined) {
            if (basePrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires both the stop_px and base_price params for a conditional ' + type + ' order');
            } else {
                if (market['swap']) {
                    if (market['linear']) {
                        method = 'privateLinearPostStopOrderCreate';
                    } else if (market['inverse']) {
                        method = 'v2PrivatePostStopOrderCreate';
                    }
                } else if (market['futures']) {
                    method = 'futuresPrivatePostStopOrderCreate';
                }
                request['stop_px'] = parseFloat (this.priceToPrecision (symbol, stopPx));
                request['base_price'] = parseFloat (this.priceToPrecision (symbol, basePrice));
                params = this.omit (params, [ 'stop_px', 'stopPrice', 'base_price' ]);
            }
        } else if (basePrice !== undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires both the stop_px and base_price params for a conditional ' + type + ' order');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "OK",
        //         "ext_code": "",
        //         "ext_info": "",
        //         "result": {
        //             "user_id": 1,
        //             "order_id": "335fd977-e5a5-4781-b6d0-c772d5bfb95b",
        //             "symbol": "BTCUSD",
        //             "side": "Buy",
        //             "order_type": "Limit",
        //             "price": 8800,
        //             "qty": 1,
        //             "time_in_force": "GoodTillCancel",
        //             "order_status": "Created",
        //             "last_exec_time": 0,
        //             "last_exec_price": 0,
        //             "leaves_qty": 1,
        //             "cum_exec_qty": 0,
        //             "cum_exec_value": 0,
        //             "cum_exec_fee": 0,
        //             "reject_reason": "",
        //             "order_link_id": "",
        //             "created_at": "2019-11-30T11:03:43.452Z",
        //             "updated_at": "2019-11-30T11:03:43.455Z"
        //         },
        //         "time_now": "1575111823.458705",
        //         "rate_limit_status": 98,
        //         "rate_limit_reset_ms": 1580885703683,
        //         "rate_limit": 100
        //     }
        //
        // conditional orders
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "user_id": 1,
        //             "symbol": "BTCUSD",
        //             "side": "Buy",
        //             "order_type": "Limit",
        //             "price": 8000,
        //             "qty": 1,
        //             "time_in_force": "GoodTillCancel",
        //             "stop_order_type": "Stop",
        //             "trigger_by": "LastPrice",
        //             "base_price": 7000,
        //             "order_status": "Untriggered",
        //             "ext_fields": {
        //                 "stop_order_type": "Stop",
        //                 "trigger_by": "LastPrice",
        //                 "base_price": 7000,
        //                 "expected_direction": "Rising",
        //                 "trigger_price": 7500,
        //                 "op_from": "api",
        //                 "remark": "127.0.01",
        //                 "o_req_num": 0
        //             },
        //             "leaves_qty": 1,
        //             "leaves_value": 0.00013333,
        //             "reject_reason": null,
        //             "cross_seq": -1,
        //             "created_at": "2019-12-27T12:48:24.000Z",
        //             "updated_at": "2019-12-27T12:48:24.000Z",
        //             "stop_px": 7500,
        //             "stop_order_id": "a85cd1c0-a9a4-49d3-a1bd-bab5ebe946d5"
        //         },
        //         "ext_info": null,
        //         "time_now": "1577450904.327654",
        //         "rate_limit_status": 99,
        //         "rate_limit_reset_ms": 1577450904335,
        //         "rate_limit": "100"
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'order_id': id, // only for non-conditional orders
            'symbol': market['id'],
            // 'p_r_qty': this.amountToPrecision (symbol, amount), // new order quantity, optional
            // 'p_r_price' this.priceToprecision (symbol, price), // new order price, optional
            // ----------------------------------------------------------------
            // conditional orders
            // 'stop_order_id': id, // only for conditional orders
            // 'p_r_trigger_price': 123.45, // new trigger price also known as stop_px
        };
        let method = undefined;
        if (market['swap']) {
            if (market['linear']) {
                method = 'privateLinearPostOrderReplace';
            } else if (market['inverse']) {
                method = 'v2PrivatePostOrderReplace';
            }
        } else if (market['futures']) {
            method = 'futuresPrivatePostOrderReplace';
        }
        const stopOrderId = this.safeString (params, 'stop_order_id');
        if (stopOrderId !== undefined) {
            if (market['swap']) {
                if (market['linear']) {
                    method = 'privateLinearPostStopOrderReplace';
                } else if (market['inverse']) {
                    method = 'v2PrivatePostStopOrderReplace';
                }
            } else if (market['futures']) {
                method = 'futuresPrivatePostStopOrderReplace';
            }
            request['stop_order_id'] = stopOrderId;
            params = this.omit (params, [ 'stop_order_id' ]);
        } else {
            request['order_id'] = id;
        }
        if (amount !== undefined) {
            let qty = this.amountToPrecision (symbol, amount);
            if (market['inverse']) {
                qty = parseInt (qty);
            } else {
                qty = parseFloat (qty);
            }
            request['p_r_qty'] = qty;
        }
        if (price !== undefined) {
            request['p_r_price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": { "order_id": "efa44157-c355-4a98-b6d6-1d846a936b93" },
        //         "time_now": "1539778407.210858",
        //         "rate_limit_status": 99, // remaining number of accesses in one minute
        //         "rate_limit_reset_ms": 1580885703683,
        //         "rate_limit": 100
        //     }
        //
        // conditional orders
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": { "stop_order_id": "378a1bbc-a93a-4e75-87f4-502ea754ba36" },
        //         "ext_info": null,
        //         "time_now": "1577475760.604942",
        //         "rate_limit_status": 96,
        //         "rate_limit_reset_ms": 1577475760612,
        //         "rate_limit": "100"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'id': this.safeString2 (result, 'order_id', 'stop_order_id'),
            'order_id': this.safeString (result, 'order_id'),
            'stop_order_id': this.safeString (result, 'stop_order_id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'order_link_id': 'string', // one of order_id, stop_order_id or order_link_id is required
            // regular orders ---------------------------------------------
            // 'order_id': id, // one of order_id or order_link_id is required for regular orders
            // conditional orders ---------------------------------------------
            // 'stop_order_id': id, // one of stop_order_id or order_link_id is required for conditional orders
        };
        let method = undefined;
        if (market['swap']) {
            if (market['linear']) {
                method = 'privateLinearPostOrderCancel';
            } else if (market['inverse']) {
                method = 'v2PrivatePostOrderCancel';
            }
        } else if (market['futures']) {
            method = 'futuresPrivatePostOrderCancel';
        }
        const stopOrderId = this.safeString (params, 'stop_order_id');
        if (stopOrderId === undefined) {
            const orderLinkId = this.safeString (params, 'order_link_id');
            if (orderLinkId === undefined) {
                request['order_id'] = id;
            }
        } else {
            if (market['swap']) {
                if (market['linear']) {
                    method = 'privateLinearPostStopOrderCancel';
                } else if (market['inverse']) {
                    method = 'v2PrivatePostStopOrderCancel';
                }
            } else if (market['futures']) {
                method = 'futuresPrivatePostStopOrderCancel';
            }
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const options = this.safeValue (this.options, 'cancelAllOrders', {});
        let defaultMethod = undefined;
        if (market['swap']) {
            if (market['linear']) {
                defaultMethod = 'privateLinearPostOrderCancelAll';
            } else if (market['inverse']) {
                defaultMethod = 'v2PrivatePostOrderCancelAll';
            }
        } else if (market['futures']) {
            defaultMethod = 'futuresPrivatePostOrderCancelAll';
        }
        const method = this.safeString (options, 'method', defaultMethod);
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'order_id': 'string'
            // 'order_link_id': 'string', // unique client order id, max 36 characters
            // 'symbol': market['id'], // default BTCUSD
            // 'order': 'desc', // asc
            // 'page': 1,
            // 'limit': 20, // max 50
            // 'order_status': 'Created,New'
            // conditional orders ---------------------------------------------
            // 'stop_order_id': 'string',
            // 'stop_order_status': 'Untriggered',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const options = this.safeValue (this.options, 'fetchOrders', {});
        const defaultType = this.safeString (this.options, 'defaultType', 'linear');
        const marketTypes = this.safeValue (this.options, 'marketTypes', {});
        const marketType = this.safeString (marketTypes, symbol, defaultType);
        let defaultMethod = undefined;
        const marketDefined = (market !== undefined);
        const linear = (marketDefined && market['linear']) || (marketType === 'linear');
        const inverse = (marketDefined && market['swap'] && market['inverse']) || (marketType === 'inverse');
        const futures = (marketDefined && market['futures']) || (marketType === 'futures');
        if (linear) {
            defaultMethod = 'privateLinearGetOrderList';
        } else if (inverse) {
            defaultMethod = 'v2PrivateGetOrderList';
        } else if (futures) {
            defaultMethod = 'futuresPrivateGetOrderList';
        }
        let query = params;
        if (('stop_order_id' in params) || ('stop_order_status' in params)) {
            let stopOrderStatus = this.safeValue (params, 'stop_order_status');
            if (stopOrderStatus !== undefined) {
                if (Array.isArray (stopOrderStatus)) {
                    stopOrderStatus = stopOrderStatus.join (',');
                }
                request['stop_order_status'] = stopOrderStatus;
                query = this.omit (params, 'stop_order_status');
            }
            if (linear) {
                defaultMethod = 'privateLinearGetStopOrderList';
            } else if (inverse) {
                defaultMethod = 'v2PrivateGetStopOrderList';
            } else if (futures) {
                defaultMethod = 'futuresPrivateGetStopOrderList';
            }
        }
        const method = this.safeString (options, 'method', defaultMethod);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "current_page": 1,
        //             "last_page": 6,
        //             "data": [
        //                 {
        //                     "user_id": 1,
        //                     "symbol": "BTCUSD",
        //                     "side": "Sell",
        //                     "order_type": "Market",
        //                     "price": 7074,
        //                     "qty": 2,
        //                     "time_in_force": "ImmediateOrCancel",
        //                     "order_status": "Filled",
        //                     "ext_fields": {
        //                         "close_on_trigger": true,
        //                         "orig_order_type": "BLimit",
        //                         "prior_x_req_price": 5898.5,
        //                         "op_from": "pc",
        //                         "remark": "127.0.0.1",
        //                         "o_req_num": -34799032763,
        //                         "xreq_type": "x_create"
        //                     },
        //                     "last_exec_time": "1577448481.696421",
        //                     "last_exec_price": 7070.5,
        //                     "leaves_qty": 0,
        //                     "leaves_value": 0,
        //                     "cum_exec_qty": 2,
        //                     "cum_exec_value": 0.00028283,
        //                     "cum_exec_fee": 0.00002,
        //                     "reject_reason": "NoError",
        //                     "order_link_id": "",
        //                     "created_at": "2019-12-27T12:08:01.000Z",
        //                     "updated_at": "2019-12-27T12:08:01.000Z",
        //                     "order_id": "f185806b-b801-40ff-adec-52289370ed62"
        //                 }
        //             ]
        //         },
        //         "ext_info": null,
        //         "time_now": "1577448922.437871",
        //         "rate_limit_status": 98,
        //         "rate_limit_reset_ms": 1580885703683,
        //         "rate_limit": 100
        //     }
        //
        // conditional orders
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "current_page": 1,
        //             "last_page": 1,
        //             "data": [
        //                 {
        //                     "user_id": 1,
        //                     "stop_order_status": "Untriggered",
        //                     "symbol": "BTCUSD",
        //                     "side": "Buy",
        //                     "order_type": "Limit",
        //                     "price": 8000,
        //                     "qty": 1,
        //                     "time_in_force": "GoodTillCancel",
        //                     "stop_order_type": "Stop",
        //                     "trigger_by": "LastPrice",
        //                     "base_price": 7000,
        //                     "order_link_id": "",
        //                     "created_at": "2019-12-27T12:48:24.000Z",
        //                     "updated_at": "2019-12-27T12:48:24.000Z",
        //                     "stop_px": 7500,
        //                     "stop_order_id": "a85cd1c0-a9a4-49d3-a1bd-bab5ebe946d5"
        //                 },
        //             ]
        //         },
        //         "ext_info": null,
        //         "time_now": "1577451658.755468",
        //         "rate_limit_status": 599,
        //         "rate_limit_reset_ms": 1577451658762,
        //         "rate_limit": 600
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultStatuses = [
            'Rejected',
            'Filled',
            'Cancelled',
            // conditional orders
            // 'Active',
            // 'Triggered',
            // 'Cancelled',
            // 'Rejected',
            // 'Deactivated',
        ];
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        let status = this.safeValue (options, 'order_status', defaultStatuses);
        if (Array.isArray (status)) {
            status = status.join (',');
        }
        const request = {};
        const stopOrderStatus = this.safeValue (params, 'stop_order_status');
        if (stopOrderStatus === undefined) {
            request['order_status'] = status;
        } else {
            request['stop_order_status'] = stopOrderStatus;
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultStatuses = [
            'Created',
            'New',
            'PartiallyFilled',
            'PendingCancel',
            // conditional orders
            // 'Untriggered',
        ];
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        let status = this.safeValue (options, 'order_status', defaultStatuses);
        if (Array.isArray (status)) {
            status = status.join (',');
        }
        const request = {};
        const stopOrderStatus = this.safeValue (params, 'stop_order_status');
        if (stopOrderStatus === undefined) {
            request['order_status'] = status;
        } else {
            request['stop_order_status'] = stopOrderStatus;
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            // 'order_id': 'f185806b-b801-40ff-adec-52289370ed62', // if not provided will return user's trading records
            // 'symbol': market['id'],
            // 'start_time': parseInt (since / 1000),
            // 'page': 1,
            // 'limit' 20, // max 50
        };
        let market = undefined;
        const orderId = this.safeString (params, 'order_id');
        if (orderId !== undefined) {
            request['order_id'] = orderId;
            params = this.omit (params, 'order_id');
        }
        market = this.market (symbol);
        request['symbol'] = market['id'];
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 50
        }
        const defaultType = this.safeString (this.options, 'defaultType', 'linear');
        const marketTypes = this.safeValue (this.options, 'marketTypes', {});
        const marketType = this.safeString (marketTypes, symbol, defaultType);
        const marketDefined = (market !== undefined);
        const linear = (marketDefined && market['linear']) || (marketType === 'linear');
        const inverse = (marketDefined && market['swap'] && market['inverse']) || (marketType === 'inverse');
        const futures = (marketDefined && market['futures']) || (marketType === 'futures');
        let method = undefined;
        if (linear) {
            method = 'privateLinearGetTradeExecutionList';
        } else if (inverse) {
            method = 'v2PrivateGetExecutionList';
        } else if (futures) {
            method = 'futuresPrivateGetExecutionList';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // inverse
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "OK",
        //         "ext_code": "",
        //         "ext_info": "",
        //         "result": {
        //             "order_id": "Abandoned!!", // Abandoned!!
        //             "trade_list": [
        //                 {
        //                     "closed_size": 0,
        //                     "cross_seq": 277136382,
        //                     "exec_fee": "0.0000001",
        //                     "exec_id": "256e5ef8-abfe-5772-971b-f944e15e0d68",
        //                     "exec_price": "8178.5",
        //                     "exec_qty": 1,
        //                     "exec_time": "1571676941.70682",
        //                     "exec_type": "Trade", //Exec Type Enum
        //                     "exec_value": "0.00012227",
        //                     "fee_rate": "0.00075",
        //                     "last_liquidity_ind": "RemovedLiquidity", //Liquidity Enum
        //                     "leaves_qty": 0,
        //                     "nth_fill": 2,
        //                     "order_id": "7ad50cb1-9ad0-4f74-804b-d82a516e1029",
        //                     "order_link_id": "",
        //                     "order_price": "8178",
        //                     "order_qty": 1,
        //                     "order_type": "Market", //Order Type Enum
        //                     "side": "Buy", //Side Enum
        //                     "symbol": "BTCUSD", //Symbol Enum
        //                     "user_id": 1
        //                 }
        //             ]
        //         },
        //         "time_now": "1577483699.281488",
        //         "rate_limit_status": 118,
        //         "rate_limit_reset_ms": 1577483699244737,
        //         "rate_limit": 120
        //     }
        //
        // linear
        //
        //     {
        //         "ret_code":0,
        //         "ret_msg":"OK",
        //         "ext_code":"",
        //         "ext_info":"",
        //         "result":{
        //             "current_page":1,
        //             "data":[
        //                 {
        //                     "order_id":"b59418ec-14d4-4ef9-b9f4-721d5d576974",
        //                     "order_link_id":"",
        //                     "side":"Sell",
        //                     "symbol":"BTCUSDT",
        //                     "exec_id":"0327284d-faec-5191-bd89-acc5b4fafda9",
        //                     "price":0.5,
        //                     "order_price":0.5,
        //                     "order_qty":0.01,
        //                     "order_type":"Market",
        //                     "fee_rate":0.00075,
        //                     "exec_price":9709.5,
        //                     "exec_type":"Trade",
        //                     "exec_qty":0.01,
        //                     "exec_fee":0.07282125,
        //                     "exec_value":97.095,
        //                     "leaves_qty":0,
        //                     "closed_size":0.01,
        //                     "last_liquidity_ind":"RemovedLiquidity",
        //                     "trade_time":1591648052,
        //                     "trade_time_ms":1591648052861
        //                 }
        //             ]
        //         },
        //         "time_now":"1591736501.979264",
        //         "rate_limit_status":119,
        //         "rate_limit_reset_ms":1591736501974,
        //         "rate_limit":120
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue2 (result, 'trade_list', 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'currency': currency['id'], // alias
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (till),
            'wallet_fund_type': 'Deposit', // Deposit, Withdraw, RealisedPNL, Commission, Refund, Prize, ExchangeOrderWithdraw, ExchangeOrderDeposit
            // 'page': 1,
            // 'limit': 20, // max 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetWalletFundRecords (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "data": [
        //                 {
        //                     "id": 234467,
        //                     "user_id": 1,
        //                     "coin": "BTC",
        //                     "wallet_id": 27913,
        //                     "type": "Realized P&L",
        //                     "amount": "-0.00000006",
        //                     "tx_id": "",
        //                     "address": "BTCUSD",
        //                     "wallet_balance": "0.03000330",
        //                     "exec_time": "2019-12-09T00:00:25.000Z",
        //                     "cross_seq": 0
        //                 }
        //             ]
        //         },
        //         "ext_info": null,
        //         "time_now": "1577481867.115552",
        //         "rate_limit_status": 119,
        //         "rate_limit_reset_ms": 1577481867122,
        //         "rate_limit": 120
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (till),
            // 'status': 'Pending', // ToBeConfirmed, UnderReview, Pending, Success, CancelByUser, Reject, Expire
            // 'page': 1,
            // 'limit': 20, // max 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetWalletWithdrawList (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "data": [
        //                 {
        //                     "id": 137,
        //                     "user_id": 1,
        //                     "coin": "XRP", // Coin Enum
        //                     "status": "Pending", // Withdraw Status Enum
        //                     "amount": "20.00000000",
        //                     "fee": "0.25000000",
        //                     "address": "rH7H595XYEVTEHU2FySYsWnmfACBnZS9zM",
        //                     "tx_id": "",
        //                     "submited_at": "2019-06-11T02:20:24.000Z",
        //                     "updated_at": "2019-06-11T02:20:24.000Z"
        //                 },
        //             ],
        //             "current_page": 1,
        //             "last_page": 1
        //         },
        //         "ext_info": null,
        //         "time_now": "1577482295.125488",
        //         "rate_limit_status": 119,
        //         "rate_limit_reset_ms": 1577482295132,
        //         "rate_limit": 120
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransactionStatus (status) {
        const statuses = {
            'ToBeConfirmed': 'pending',
            'UnderReview': 'pending',
            'Pending': 'pending',
            'Success': 'ok',
            'CancelByUser': 'canceled',
            'Reject': 'rejected',
            'Expire': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": 137,
        //         "user_id": 1,
        //         "coin": "XRP", // Coin Enum
        //         "status": "Pending", // Withdraw Status Enum
        //         "amount": "20.00000000",
        //         "fee": "0.25000000",
        //         "address": "rH7H595XYEVTEHU2FySYsWnmfACBnZS9zM",
        //         "tx_id": "",
        //         "submited_at": "2019-06-11T02:20:24.000Z",
        //         "updated_at": "2019-06-11T02:20:24.000Z"
        //     }
        //
        // fetchDeposits ledger entries
        //
        //     {
        //         "id": 234467,
        //         "user_id": 1,
        //         "coin": "BTC",
        //         "wallet_id": 27913,
        //         "type": "Realized P&L",
        //         "amount": "-0.00000006",
        //         "tx_id": "",
        //         "address": "BTCUSD",
        //         "wallet_balance": "0.03000330",
        //         "exec_time": "2019-12-09T00:00:25.000Z",
        //         "cross_seq": 0
        //     }
        //
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString2 (transaction, 'submited_at', 'exec_time'));
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const address = this.safeString (transaction, 'address');
        const feeCost = this.safeNumber (transaction, 'fee');
        const type = this.safeStringLower (transaction, 'type');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'currency': currency['id'], // alias
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (till),
            // 'wallet_fund_type': 'Deposit', // Withdraw, RealisedPNL, Commission, Refund, Prize, ExchangeOrderWithdraw, ExchangeOrderDeposit
            // 'page': 1,
            // 'limit': 20, // max 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_date'] = this.yyyymmdd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetWalletFundRecords (this.extend (request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "data": [
        //                 {
        //                     "id": 234467,
        //                     "user_id": 1,
        //                     "coin": "BTC",
        //                     "wallet_id": 27913,
        //                     "type": "Realized P&L",
        //                     "amount": "-0.00000006",
        //                     "tx_id": "",
        //                     "address": "BTCUSD",
        //                     "wallet_balance": "0.03000330",
        //                     "exec_time": "2019-12-09T00:00:25.000Z",
        //                     "cross_seq": 0
        //                 }
        //             ]
        //         },
        //         "ext_info": null,
        //         "time_now": "1577481867.115552",
        //         "rate_limit_status": 119,
        //         "rate_limit_reset_ms": 1577481867122,
        //         "rate_limit": 120
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "id": 234467,
        //         "user_id": 1,
        //         "coin": "BTC",
        //         "wallet_id": 27913,
        //         "type": "Realized P&L",
        //         "amount": "-0.00000006",
        //         "tx_id": "",
        //         "address": "BTCUSD",
        //         "wallet_balance": "0.03000330",
        //         "exec_time": "2019-12-09T00:00:25.000Z",
        //         "cross_seq": 0
        //     }
        //
        const currencyId = this.safeString (item, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (item, 'amount');
        const after = this.safeNumber (item, 'wallet_balance');
        const direction = (amount < 0) ? 'out' : 'in';
        let before = undefined;
        if (after !== undefined && amount !== undefined) {
            const difference = (direction === 'out') ? amount : -amount;
            before = this.sum (after, difference);
        }
        const timestamp = this.parse8601 (this.safeString (item, 'exec_time'));
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const id = this.safeString (item, 'id');
        const referenceId = this.safeString (item, 'tx_id');
        return {
            'id': id,
            'currency': code,
            'account': this.safeString (item, 'wallet_id'),
            'referenceAccount': undefined,
            'referenceId': referenceId,
            'status': undefined,
            'amount': amount,
            'before': before,
            'after': after,
            'fee': undefined,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': type,
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'Deposit': 'transaction',
            'Withdraw': 'transaction',
            'RealisedPNL': 'trade',
            'Commission': 'fee',
            'Refund': 'cashback',
            'Prize': 'prize', // ?
            'ExchangeOrderWithdraw': 'transaction',
            'ExchangeOrderDeposit': 'transaction',
        };
        return this.safeString (types, type, type);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (Array.isArray (symbols)) {
            const length = symbols.length;
            if (length !== 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions takes an array with exactly one symbol');
            }
            request['symbol'] = this.marketId (symbols[0]);
        }
        const defaultType = this.safeString (this.options, 'defaultType', 'linear');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        let response = undefined;
        if (type === 'linear') {
            response = await this.privateLinearGetPositionList (this.extend (request, params));
        } else if (type === 'inverse') {
            response = await this.v2PrivateGetPositionList (this.extend (request, params));
        } else if (type === 'inverseFuture') {
            response = await this.futuresPrivateGetPositionList (this.extend (request, params));
        }
        if ((typeof response === 'string') && this.isJsonEncodedObject (response)) {
            response = JSON.parse (response);
        }
        //
        //     {
        //         ret_code: 0,
        //         ret_msg: 'OK',
        //         ext_code: '',
        //         ext_info: '',
        //         result: [] or {} depending on the request
        //     }
        //
        return this.safeValue (response, 'result');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString (api, 0);
        let section = this.safeString (api, 1);
        if (type === 'spot') {
            if (section === 'public') {
                section = 'v1';
            } else {
                section += '/v1';
            }
        }
        let url = this.implodeHostname (this.urls['api'][type]);
        let request = '/' + type + '/' + section + '/' + path;
        if ((type === 'spot') || (type === 'quote')) {
            if (Object.keys (params).length) {
                request += '?' + this.rawencode (params);
            }
        } else if (section === 'public') {
            if (Object.keys (params).length) {
                request += '?' + this.rawencode (params);
            }
        } else if (type === 'public') {
            if (Object.keys (params).length) {
                request += '?' + this.rawencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ();
            const query = this.extend (params, {
                'api_key': this.apiKey,
                'recv_window': this.options['recvWindow'],
                'timestamp': timestamp,
            });
            const sortedQuery = this.keysort (query);
            const auth = this.rawencode (sortedQuery);
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            if (method === 'POST') {
                body = this.json (this.extend (query, {
                    'sign': signature,
                }));
                headers = {
                    'Content-Type': 'application/json',
                };
            } else {
                request += '?' + this.urlencode (sortedQuery) + '&sign=' + signature;
            }
        }
        url += request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     {
        //         ret_code: 10001,
        //         ret_msg: 'ReadMapCB: expect { or n, but found \u0000, error ' +
        //         'found in #0 byte of ...||..., bigger context ' +
        //         '...||...',
        //         ext_code: '',
        //         ext_info: '',
        //         result: null,
        //         time_now: '1583934106.590436'
        //     }
        //
        const errorCode = this.safeString (response, 'ret_code');
        if (errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    async setMarginMode (marginType, symbol = undefined, params = {}) {
        //
        // {
        //     "ret_code": 0,
        //     "ret_msg": "ok",
        //     "ext_code": "",
        //     "result": null,
        //     "ext_info": null,
        //     "time_now": "1577477968.175013",
        //     "rate_limit_status": 74,
        //     "rate_limit_reset_ms": 1577477968183,
        //     "rate_limit": 75
        // }
        //
        const leverage = this.safeValue (params, 'leverage');
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + '.setMarginMode requires a leverage parameter');
        }
        marginType = marginType.toUpperCase ();
        if ((marginType !== 'ISOLATED') && (marginType !== 'CROSSED')) {
            throw new BadRequest (this.id + ' marginType must be either isolated or crossed');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const defaultType = this.safeString (this.options, 'defaultType', 'linear');
        const marketTypes = this.safeValue (this.options, 'marketTypes', {});
        const marketType = this.safeString (marketTypes, symbol, defaultType);
        const linear = market['linear'] || (marketType === 'linear');
        const inverse = (market['swap'] && market['inverse']) || (marketType === 'inverse');
        const futures = market['futures'] || (marketType === 'futures');
        if (linear) {
            method = 'privateLinearPostPositionSwitchIsolated';
        } else if (inverse) {
            method = 'v2PrivatePostPositionSwitchIsolated';
        } else if (futures) {
            method = 'privateFuturesPostPositionSwitchIsolated';
        }
        const isIsolated = (marginType === 'ISOLATED');
        const request = {
            'symbol': market['id'],
            'is_isolated': isIsolated,
            'buy_leverage': leverage,
            'sell_leverage': leverage,
        };
        return await this[method] (this.extend (request, params));
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        const defaultType = this.safeString (this.options, 'defaultType', 'linear');
        const marketTypes = this.safeValue (this.options, 'marketTypes', {});
        const marketType = this.safeString (marketTypes, symbol, defaultType);
        const linear = market['linear'] || (marketType === 'linear');
        const inverse = (market['swap'] && market['inverse']) || (marketType === 'inverse');
        const futures = market['futures'] || (marketType === 'futures');
        let method = undefined;
        if (linear) {
            method = 'privateLinearPostPositionSetLeverage';
        } else if (inverse) {
            method = 'v2PrivatePostPositionLeverageSave';
        } else if (futures) {
            method = 'privateFuturesPostPositionLeverageSave';
        }
        let buy_leverage = leverage;
        let sell_leverage = leverage;
        if (params['buy_leverage'] && params['sell_leverage'] && linear) {
            buy_leverage = params['buy_leverage'];
            sell_leverage = params['sell_leverage'];
        } else if (!leverage) {
            if (linear) {
                throw new ArgumentsRequired (this.id + ' setLeverage() requires either the parameter leverage or params["buy_leverage"] and params["sell_leverage"] for linear contracts');
            } else {
                throw new ArgumentsRequired (this.id + ' setLeverage() requires parameter leverage for inverse and futures contracts');
            }
        }
        if ((buy_leverage < 1) || (buy_leverage > 100) || (sell_leverage < 1) || (sell_leverage > 100)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 100');
        }
        const request = {
            'symbol': market['id'],
            'leverage_only': true,
        };
        if (!linear) {
            request['leverage'] = buy_leverage;
        } else {
            request['buy_leverage'] = buy_leverage;
            request['sell_leverage'] = sell_leverage;
        }
        return await this[method] (this.extend (request, params));
    }
};
