import { Dict, Int, Market, Strings, Ticker, Tickers, OrderBook, Trade, FundingRate, OHLCV, Balances, int, Str, Leverages, Leverage, OrderType, OrderSide, Num, Order, Position } from './base/types.js';
import Exchange from './abstract/rabbitx.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, DDoSProtection, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OnMaintenance, OrderImmediatelyFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';

/**
 * @class rabbitx
 * @augments Exchange
 */
export default class rabbitx extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'rabbitx',
            'name': 'RabbitX',
            'countries': [ 'SG' ],
            'certified': false,
            'pro': true,
            'urls': {
                'api': {
                    'public': 'https://api.rabbitx.com',
                    'private': 'https://api.rabbitx.com',
                },
                'test': {
                    'public': 'https://api.testnet.rabbitx.io',
                    'private': 'https://api.testnet.rabbitx.io',
                },
                'www': 'https://rabbitx.com/',
                'doc': 'https://docs.rabbitx.com/',
                'fees': 'https://docs.rabbitx.com/trading-fees/api-fees',
            },
            'api': {
                'public': {
                    'get': {
                        'markets': 10,
                        'markets/trades': 10,
                        'markets/orderbook': 10,
                        'markets/fundingrate': 10,
                        'candles': 10,
                    },
                },
                'private': {
                    'get': {
                        'account': 20,
                        'orders': 10,
                        'fills': 10,
                        'fills/order': 10,
                        'positions': 10,
                        'profile': 10,
                        'balanceops': 10,
                        'cancel_all_after': 10,
                    },
                    'put': {
                        'account/leverage': 20,
                        'orders': 10,
                    },
                    'post': {
                        'jwt': 20,
                        'orders': 10,
                        'cancel_all_after': 10,
                    },
                    'delete': {
                        'orders': 10,
                        'orders/cancel_all': 10,
                        'cancel_all_after': 10,
                    },
                },
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchFundingLimits': false,
                'fetchFundingRate': true,
                'fetchFundingRates': false,
                'fetchLeverages': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPositions': true,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTiers': true,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'inverse': false,
                'refreshJWT': true,
                'setLeverage': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
            },
            'rateLimit': 50,
            'verbose': false,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0,
                    'taker': this.parseNumber ('0.00035'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), 0 ],
                            [ this.parseNumber ('100000'), 0 ],
                            [ this.parseNumber ('500000'), 0 ],
                            [ this.parseNumber ('1000000'), 0 ],
                            [ this.parseNumber ('50000000'), 0 ],
                            [ this.parseNumber ('250000000'), 0 ],
                            [ this.parseNumber ('1500000000'), 0 ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00035') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.00032') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00027') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00025') ],
                            [ this.parseNumber ('250000000'), this.parseNumber ('0.00022') ],
                            [ this.parseNumber ('1500000000'), this.parseNumber ('0.00017') ],
                        ],
                    },
                },
            },
            'options': {
                'defaultType': 'swap',
                'eid': 'rbx',
                'eids': {
                    'ethereum': 'rbx',
                    'blast': 'bfx',
                    'sonic': 'rbx_sonic',
                    'base': 'rbx_base',
                    'arbitrum': 'rbx_arbitrum',
                },
                'sandboxMode': false,
                'deadmanSwitchTimeout': 600, // default timeout in ms
            },
            'features': {
                'swap': {
                    'linear': {
                        'sandbox': true,
                        'createOrder': {
                            'triggerPrice': true,
                            'triggerPriceType': undefined,
                            'triggerDirection': false,
                            'stopLossPrice': true,
                            'takeProfitPrice': true,
                            'attachedStopLossTakeProfit': {
                                'triggerPriceType': {
                                    'last': true,
                                    'mark': true,
                                    'index': false,
                                },
                                'price': true,
                            },
                            'marginMode': false,
                            'timeInForce': {
                                'GTC': true, // 'good_till_cancel' supported
                                'IOC': true, // 'immediate_or_cancel' supported
                                'FOK': true, // 'fill_or_kill' supported
                                'PO': true,  // 'post_only' supported
                                'GTD': false, // Not mentioned in docs
                            },
                            'hedged': false,
                            'leverage': false,
                            'selfTradePrevention': false,
                            'trailing': false,
                            'iceberg': false,
                            'marketBuyByCost': false,
                            'marketBuyRequiresPrice': false,
                        },
                        'createOrders': undefined,
                        'fetchMyTrades': {
                            'limit': 1000,
                            'marginMode': false,
                            'daysBack': undefined,
                            'untilDays': undefined,
                            'symbolRequired': false,
                        },
                        'fetchOrder': {
                            'marginMode': false,
                            'trigger': true,
                            'trailing': false,
                            'symbolRequired': true,
                        },
                        'fetchOpenOrders': undefined,
                        'fetchOrders': {
                            'limit': 1000,
                            'daysBack': undefined,
                            'untilDays': undefined,
                            'marginMode': false,
                            'trigger': true,
                            'trailing': false,
                            'symbolRequired': false,
                        },
                        'fetchClosedOrders': undefined,
                        'fetchOHLCV': {
                            'paginate': false,
                            'limit': undefined,
                            'symbolRequired': true,
                        },
                    },
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '404': BadRequest,
                    '418': PermissionDenied,
                    '429': DDoSProtection,
                    '500': ExchangeError,
                    '504': ExchangeNotAvailable,
                    // RabbitX error codes
                    'INTEGRITY_ERROR': BadRequest,
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'POSITION_NOT_FOUND': BadRequest,
                    'ORDERBOOK_ENTRY_NOT_FOUND': BadRequest,
                    'ORDER_LIMIT_REACHED': InvalidOrder,
                    'ORDER_NOTIONAL_EXCEEDED': InvalidOrder,
                    'WRONG_ORDER_SIZE': InvalidOrder,
                    'WRONG_ORDER_SIDE': InvalidOrder,
                    'WRONG_ORDER_STATUS': InvalidOrder,
                    'WRONG_TIME_IN_FORCE': InvalidOrder,
                    'WRONG_ORDER_TYPE': InvalidOrder,
                    'ORDER_PRICE_OVERFLOW': InvalidOrder,
                    'ORDER_IMMEDIATE_EXECUTION': OrderImmediatelyFillable,
                    'CLIENT_ORDER_ID_DUPLICATE': DuplicateOrderId,
                    'NO_CONDITION_MET': InvalidOrder,
                    'NOT_YOUR_ORDER': PermissionDenied,
                    'PROFILE_NOT_ACTIVE': PermissionDenied,
                    'MARKET_NOT_ACTIVE': InvalidOrder,
                    'WRONG_MARKET_ID': BadSymbol,
                    'CLIENT_ORDER_ID_TOO_LARGE': InvalidOrder,
                    'TIME_IN_FORCE_FOK_ERROR': InvalidOrder,
                    'TIME_IN_FORCE_IOC_ERROR': InvalidOrder,
                    'TIME_IN_FORCE_POSTONLY_ERROR': InvalidOrder,
                    'NOTHING_TO_AMEND': InvalidOrder,
                    // REVERT errors (order logic issues)
                    'REVERT_INVALID_ROW': InvalidOrder,
                    'REVERT_TAKER_AND_MAKER_SAME': InvalidOrder,
                    'REVERT_NO_TAKER': InvalidOrder,
                    'REVERT_UNKNOWN_SIDE': InvalidOrder,
                    'REVERT_NO_SUCH_MARKET': BadSymbol,
                    'REVERT_CANT_BIND': ExchangeError,
                    'REVERT_ALREADY_EXIST': DuplicateOrderId,
                    'REVERT_INVALID_HEADER': BadRequest,
                    // Auth/Key errors
                    'API_SECRET_UPDATE': AuthenticationError,
                    'NO_SUCH_KEY': AuthenticationError,
                    'REFRESH_TOKEN_NOT_FOUND': AuthenticationError,
                    'NO_API_KEY_FOR_REFRESH_TOKEN': AuthenticationError,
                    'NOT_YOUR_REFRESH_TOKEN': PermissionDenied,
                    'API_JWT_UPDATE_ERROR': AuthenticationError,
                    'API_SECRET_UPDATE_ERROR': AuthenticationError,
                    'KEY_EXPIRED': AuthenticationError,
                    'NOT_ALLOWED_FOR_IP': PermissionDenied,
                    'NOT_YOUR_KEY': PermissionDenied,
                    'MAX_SECRETS_EXCEED': ExchangeError,
                },
                'broad': {
                    'too many requests': DDoSProtection,
                    'rate limit': RateLimitExceeded,
                    'timed out': RequestTimeout,
                    'unavailable': ExchangeNotAvailable,
                    'maintenance': OnMaintenance,
                    'invalid': BadRequest,
                    'not found': OrderNotFound,
                    'not enough': InsufficientFunds,
                    'permission denied': PermissionDenied,
                    'unauthorized': AuthenticationError,
                },
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        const messageParts = [];
        let i = 0;
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/json',
                };
                body = this.json (params);
            } else {
                const paramKeys = Object.keys (params);
                const paramKeysLength = paramKeys.length; // hint for transpiler that paramKeys is an array
                // use for loop for proper array length handling
                if (paramKeysLength > 0) {
                    url += '?' + this.urlencode (params);
                }
            }
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ();
            // RabbitX expects timestamp as integer string in RBT-TS header (expiry time)
            const expires = timestamp + 60;
            const data = this.extend ({}, params);
            data['method'] = method.toUpperCase ();
            data['path'] = '/' + path;
            const sortedData = this.keysort (data);
            const sortedKeys = Object.keys (sortedData);
            const sortedKeysLength = sortedKeys.length; // hint for transpiler that sortedKeys is an array
            while (i < sortedKeysLength) {
                const key = sortedKeys[i];
                let val = sortedData[key];
                if (typeof val === 'boolean') {
                    val = val.toString ().toLowerCase ();
                } else {
                    val = val.toString ();
                }
                messageParts.push (key + '=' + val);
                i = i + 1;
            }
            const expiresString = expires.toString ();
            messageParts.push (expiresString);
            const message = messageParts.join ('');
            let secret = this.secret;
            if (secret.startsWith ('0x')) {
                secret = secret.slice (2);
            }
            const messageHash = this.hash (this.encode (message), sha256, 'binary');
            const secretBytes = this.base16ToBinary (secret);
            const signature = this.hmac (messageHash, secretBytes, sha256, 'hex');
            if (!headers) {
                headers = {};
            }
            headers = this.extend (headers, {
                'RBT-TS': expires.toString (),
                'RBT-API-KEY': this.apiKey,
                'RBT-SIGNATURE': '0x' + signature,
                'EID': this.safeString (this.options, 'eid', 'rbx'),
                'Content-Type': 'application/json',
            });
            if (method === 'GET') {
                const paramKeys = Object.keys (params);
                const paramKeysLength = paramKeys.length; // hint for transpiler that paramKeys is an array
                if (paramKeysLength > 0) {
                    url += '?' + this.urlencode (params);
                }
                body = undefined;
            } else {
                body = this.json (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name rabbitx#fetchMarkets
     * @description Fetches market information from the exchange.
     * @see https://docs.ccxt.com/en/latest/manual.html#markets
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/market-info
     * @param {object} [params] - Extra parameters specific to the exchange API endpoint
     * @returns {Promise<Market[]>} An array of market structures.
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params);
        // {
        //     id: 'BTC-USD',
        //     status: 'active',
        //     min_tick: '1',
        //     min_order: '0.0001',
        //     best_bid: '103686',
        //     best_ask: '103697',
        //     market_price: '103691.5',
        //     index_price: '103700',
        //     last_trade_price: '103691',
        //     fair_price: '103691',
        //     instant_funding_rate: '0.00000131635735939129586311201044498264',
        //     last_funding_rate_basis: '0.00000121189800300372592551821014962327',
        //     last_update_time: '1749205876272223',
        //     last_update_sequence: '1439589144',
        //     average_daily_volume_q: '109.6077',
        //     last_funding_update_time: '1749204000147750',
        //     icon_url: 'https://d3jcs7jdw2xltq.cloudfront.net/currencies/btc.svg',
        //     market_title: 'Bitcoin',
        //     base_currency: 'BTC',
        //     quote_currency: 'USD',
        //     product_type: 'perpetual',
        //     open_interest: '1015304.8012',
        //     next_funding_rate_timestamp: '1749207600',
        //     average_daily_volume: '11319927.4397',
        //     last_trade_price_24high: '105903',
        //     last_trade_price_24low: '100389',
        //     last_trade_price_24h_change_premium: '-1018',
        //     last_trade_price_24h_change_basis: '-0.00972218242939957406',
        //     average_daily_volume_change_premium: '6507950.2037',
        //     average_daily_volume_change_basis: '1.3524482524588568',
        //     market_cap: '2061625626818'
        //   }
        const markets = this.safeList (response, 'result', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'id');
        const parts = marketId.split ('-');
        const marketType = 'swap';
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settleId = this.safeString (parts, 1);
        const settle = this.safeCurrencyCode (settleId);
        const active = this.safeString (market, 'status') === 'active';
        const symbol = base + '/' + quote;
        const contractSize = this.parseNumber ('1');
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': false,
            'margin': null,
            'swap': true,
            'future': false,
            'option': false,
            'active': active,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': this.safeNumber (market, 'min_tick'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_order'),
                    'max': undefined,
                },
                'price': {
                    'min': this.safeNumber (market, 'min_tick'),
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

    /**
     * @method
     * @name rabbitx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/market-info
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
            'market_id': marketId,
        };
        const response = await this.publicGetMarkets (this.extend (request, params));
        // "result": [
        //     {
        //     "id": "BTC-USD",
        //     "status": "active",
        //     "min_tick": "1",
        //     "min_order": "0.0001",
        //     "best_bid": "105427",
        //     "best_ask": "105439",
        //     "market_price": "105433",
        //     "index_price": "105440",
        //     "last_trade_price": "105433",
        //     "fair_price": "105434",
        //     "instant_funding_rate": "0.00000486119473567234493798947422247026",
        //     "last_funding_rate_basis": "0.00000216983639131552921488165503766416",
        //     "last_update_time": 1749300953961595,
        //     "last_update_sequence": 1440358684,
        //     "average_daily_volume_q": "12.1237",
        //     "last_funding_update_time": 1749297600998176,
        //     "icon_url": "https://d3jcs7jdw2xltq.cloudfront.net/currencies/btc.svg",
        //     "market_title": "Bitcoin",
        //     "base_currency": "BTC",
        //     "quote_currency": "USD",
        //     "product_type": "perpetual",
        //     "open_interest": "1019833.08",
        //     "next_funding_rate_timestamp": 1749301200,
        //     "average_daily_volume": "1271379.6487",
        //     "last_trade_price_24high": "105672",
        //     "last_trade_price_24low": "103766",
        //     "last_trade_price_24h_change_premium": "1590",
        //     "last_trade_price_24h_change_basis": "0.01531157612934911357",
        //     "average_daily_volume_change_premium": "-9182164.4024",
        //     "average_daily_volume_change_basis": "-0.87837812300927588904",
        //     "market_cap": "2096142107926"
        //     }
        // ]
        const ticker = this.safeValue (response['result'], 0, {});
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name rabbitx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/market-info
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', by default fetches both
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarkets (params);
        const tickers = this.safeList (response, 'result', []);
        const result: Dict = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 'id');
            const market = this.safeMarket (marketId);
            const parsedTicker = this.parseTicker (ticker, market);
            result[market['symbol']] = parsedTicker;
        }
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        // {
        //     id: 'BTC-USD',
        //     status: 'active',
        //     min_tick: '1',
        //     min_order: '0.0001',
        //     best_bid: '105511',
        //     best_ask: '105520',
        //     market_price: '105515.5',
        //     index_price: '105525',
        //     last_trade_price: '105514',
        //     fair_price: '105514',
        //     instant_funding_rate: '-0.00000043660097772351435663919337517612',
        //     last_funding_rate_basis: '0.00000345036828584396221344396134618789',
        //     last_update_time: '1749307498331590',
        //     last_update_sequence: '1440403544',
        //     average_daily_volume_q: '11.9561', //base volume
        //     last_funding_update_time: '1749304800450605',
        //     icon_url: 'https://d3jcs7jdw2xltq.cloudfront.net/currencies/btc.svg',
        //     market_title: 'Bitcoin',
        //     base_currency: 'BTC',
        //     quote_currency: 'USD',
        //     product_type: 'perpetual',
        //     open_interest: '1020723.088',
        //     next_funding_rate_timestamp: '1749308400',
        //     average_daily_volume: '1261134.5966', //quote volume
        //     last_trade_price_24high: '105789',
        //     last_trade_price_24low: '103864',
        //     last_trade_price_24h_change_premium: '741',
        //     last_trade_price_24h_change_basis: '0.00707243278325522797',
        //     average_daily_volume_change_premium: '-7720988.1781',
        //     average_daily_volume_change_basis: '-0.85959503914239009183',
        //     market_cap: '2098987055650'
        //   }
        let timestamp = this.safeInteger (ticker, 'last_update_time');
        if (timestamp !== undefined) {
            timestamp = Math.floor (timestamp / 1000);
        }
        const baseVolume = this.safeNumber (ticker, 'average_daily_volume_q');
        const lastTradePrice = this.safeNumber (ticker, 'last_trade_price');
        // Calculate quote volume only if both baseVolume and lastTradePrice are available
        let quoteVolume = undefined;
        if (baseVolume !== undefined && lastTradePrice !== undefined) {
            quoteVolume = baseVolume * lastTradePrice;
        }
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'last_trade_price_24high'),
            'low': this.safeNumber (ticker, 'last_trade_price_24low'),
            'bid': this.safeNumber (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'best_ask'),
            'askVolume': undefined,
            'markPrice': this.safeNumber (ticker, 'fair_price'),
            'indexPrice': this.safeNumber (ticker, 'index_price'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeNumber (ticker, 'last_trade_price'),
            'last': this.safeNumber (ticker, 'last_trade_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name rabbitx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return the exchange not supported yet.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        if (limit === undefined) {
            limit = 100;
        }
        if (limit > 1000 || limit < 1) {
            throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be between 1 and 1000, inclusive, but ' + limit + ' was passed');
        }
        const request = {
            'market_id': marketId,
            'p_limit': limit,
        };
        const response = await this.publicGetMarketsOrderbook (this.extend (request, params));
        // {
        //     market_id string
        //     bids      [string, string]  // returns array of (price, quantity)
        //     asks      [string, string]  // returns array of (price, quantity)
        //     sequence  uint
        //     timestamp int64 (ms)
        // }
        const result = this.safeValue (response['result'], 0, {});
        const timestamp = this.safeInteger (result, 'timestamp');
        return this.parseOrderBook (result, symbol, timestamp, 'bids', 'asks');
    }

    /**
     * @name rabbitx#fetchTrades
     * @description fetches all completed trades for a particular market/symbol
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/trades
     * @param symbol
     * @param since
     * @param limit
     * @param params
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        if (limit === undefined) {
            limit = 50;
        }
        if (limit > 1000 || limit < 1) {
            throw new BadRequest (this.id + ' fetchTrades() limit argument must be between 1 and 1000, inclusive, but ' + limit + ' was passed');
        }
        const request = {
            'market_id': marketId,
            'p_limit': limit,
        };
        // {
        //     id            string
        //     market_id     string
        //     timestamp     int64
        //     price         string
        //     size          string
        //     liquidation   bool
        //     taker_size    string // "long", "short"
        // }
        const response = await this.publicGetMarketsTrades (this.extend (request, params));
        const trades = this.safeList (response, 'result', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        // public trades
        // {
        //     id: 'BTC-USD-71837196',
        //     market_id: 'BTC-USD',
        //     timestamp: '1749316981085089',
        //     price: '105514',
        //     size: '0.0001',
        //     liquidation: false,
        //     taker_side: 'short'
        // }
        // private trades
        // {
        //      'fee': '-0.0178801',
        //      'id': 'BTC-USD-62581592',
        //      'is_maker': False,
        //      'liquidation': False,
        //      'market_id': 'BTC-USD',
        //      'order_id': 'BTC-USD@6509736',
        //      'price': '25543',
        //      'profile_id': 7615,
        //      'side': 'short',
        //      'size': '0.001',
        //      'timestamp': 1676648452088704,
        //      'trade_id': 'BTC-USD-62581590'
        // }
        const marketId = this.safeString (trade, 'market_id');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString2 (trade, 'id', 'trade_id');
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = Math.floor (timestamp / 1000);
        }
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'size');
        // Determine if this is a private trade (has 'side') or public (has 'taker_side')
        let side = this.safeString (trade, 'side');
        if (side === undefined) {
            const takerSide = this.safeString (trade, 'taker_side');
            if (takerSide !== undefined) {
                side = (takerSide === 'long') ? 'buy' : 'sell';
            }
        } else {
            side = (side === 'long') ? 'buy' : 'sell';
        }
        // Fee (only in private trades)
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': symbol.split ('/')[1],
            };
        }
        // Detect maker/taker (only in private trades)
        const isMaker = this.safeValue (trade, 'is_maker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        } else {
            takerOrMaker = undefined;
        }
        const orderId = this.safeString (trade, 'order_id');
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': (price !== undefined && amount !== undefined) ? price * amount : undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name rabbitx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market, default will return the last 24h period.
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the API endpoint
     * @param {int} [params.until] timestamp in ms of the earliest candle to fetch
     * @returns {OHLCV[]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) : Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request: Dict = {
            'market_id': marketId,
            'period': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['timestamp_from'] = Math.floor (since / 1000);
        } else {
            request['timestamp_from'] = Math.floor (this.milliseconds () / 1000) - 86400; // default to the last 24 hours
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        if (until !== undefined) {
            request['timestamp_to'] = Math.floor (until / 1000); // RabbitX expects timestamp in seconds
        } else {
            request['timestamp_to'] = Math.floor (this.milliseconds () / 1000);
        }
        const response = await this.publicGetCandles (this.extend (request, params));
        const rows = this.safeList (response, 'result', []);
        return this.parseOHLCVs (rows, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // {
        //     time   int64
        //     low    string
        //     high   string
        //     open   string
        //     close  string
        //     volume string
        // }
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name rabbit#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.rabbitx.com/api-documentation/public-endpoints/funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request: Dict = {
            'market_id': marketId,
        };
        const response = await this.publicGetMarketsFundingrate (this.extend (request, params));
        // {
        //     market_id string
        //     funding_rate string
        //     timestamp int64
        // }
        const result = this.safeValue (response, 'result', []);
        const first = this.safeDict (result, 0);
        return this.parseFundingRate (first, market);
    }

    parseFundingRate (ticker, market: Market = undefined): FundingRate {
        // {
        //     "market_id": "BTC-USD",
        //     "timestamp": 1749304800000000,
        //     "funding_rate": "0.00000345036828584396221344396134618789"
        //     },
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.001);
        return {
            'info': ticker,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (ticker, 'funding_rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name rabbitx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/account-operations
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        // {
        //     id: '92122',
        //     profile_type: 'trader',
        //     status: 'active',
        //     wallet: '0x3bf7e3dacbd1000ff11e5c7b74b7fa64a812d8f8',
        //     last_update: '1749127528165345',
        //     balance: '0',
        //     account_equity: '0',
        //     total_position_margin: '0',
        //     total_order_margin: '0',
        //     total_notional: '0',
        //     account_margin: '1',
        //     withdrawable_balance: '0',
        //     cum_unrealized_pnl: '0',
        //     health: '1',
        //     account_leverage: '1',
        //     cum_trading_volume: '0',
        //     leverage: [Object],
        //     last_liq_check: '0',
        //     mmf_total: '0',
        //     acmf_total: '0',
        //     tier_status: [Object]
        //   }
        const resultList = this.safeValue (response, 'result', []);
        const account = this.safeValue (resultList, 0, {});
        const free = this.safeNumber (account, 'withdrawable_balance');
        const orderMargin = this.safeNumber (account, 'total_order_margin');
        const positionMargin = this.safeNumber (account, 'total_position_margin');
        const used = this.sum (orderMargin, positionMargin);
        const total = this.safeNumber (account, 'balance'); // use reported balance from API
        const timestamp = this.safeIntegerProduct (account, 'last_update', 0.001);
        const datetime = this.iso8601 (timestamp);
        const currencyCode = 'USD';
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': datetime,
            'free': {},
            'used': {},
            'total': {},
        };
        result['free'][currencyCode] = free;
        result['used'][currencyCode] = used;
        result['total'][currencyCode] = total;
        result[currencyCode] = {
            'free': free,
            'used': used,
            'total': total,
        };
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name rabbitx#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/account-operations
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        const result = this.safeValue (response, 'result', []);
        const account = this.safeValue (result, 0, []);
        const leverages = this.safeDict (account, 'leverage', []);
        const leveragesArray = [];
        const leverageKeys = Object.keys (leverages);
        for (let i = 0; i < leverageKeys.length; i++) {
            const symbol = leverageKeys[i];
            leveragesArray.push ({
                'symbol': symbol,
                'leverage': this.safeNumber (leverages, symbol),
            });
        }
        return this.parseLeverages (leveragesArray, symbols, 'symbol');
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': 'isolated',
            'longLeverage': this.safeNumber (leverage, 'leverage'),
            'shortLeverage': this.safeNumber (leverage, 'leverage'),
        } as Leverage;
    }

    /**
     * @method
     * @name rabbitx#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/account-operations#update-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] margin mode must be either [isolated, cross], default is cross
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if (leverage < 1 || leverage > 50) {
            throw new BadRequest (this.id + ' setLeverage() leverage must be between 1 and 50');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
            'leverage': leverage,
        };
        const response = await this.privatePutAccountLeverage (this.extend (request, params));
        //
        //     {
        // success: true,
        // request_id: '3dd850d174f626f684cead07b02434ff',
        // result: [
        //     {
        //     id: '87116',
        //     profile_type: 'trader',
        //     status: 'active',
        //     wallet: '0x07527f6837e9f97fedd64f707a412053a768a810',
        //     last_update: '1749634792717220',
        //     balance: '1000',
        //     account_equity: '1000',
        //     total_position_margin: '0',
        //     total_order_margin: '0',
        //     total_notional: '0',
        //     account_margin: '1',
        //     withdrawable_balance: '1000',
        //     cum_unrealized_pnl: '0',
        //     health: '1',
        //     account_leverage: '1',
        //     cum_trading_volume: '0',
        //     leverage: [Object],
        //     last_liq_check: '0',
        //     mmf_total: '0',
        //     acmf_total: '0'
        //     }
        // ]
        // }
        //
        const result = this.safeList (response, 'result', []);
        const account = this.safeDict (result, 0);
        return {
            'info': response,
            'leverage': this.safeNumber (account, 'account_leverage'),
            'symbol': symbol,
        };
    }

    /**
     * @method
     * @name rabbitx#refreshJWT
     * @description fetch a new JWT token (if expired)
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/account-operations#update-leverage
     * @param {string} refreshToken the refresh token to use for updating the JWT
     * @returns {object} a structure containing the new JWT token
     */
    async refreshJWT (refreshToken: string): Promise<Dict> {
        if (refreshToken === undefined) {
            throw new ArgumentsRequired (this.id + ' refreshJWT() requires a refreshToken argument');
        }
        const request: Dict = {
            'is_client': true,
            'refresh_token': refreshToken,
        };
        // {
        //     "success": true,
        //     "error": "",
        //     "result": ["<jwt token>"]
        // }
        const response = await this.privatePostJwt (request);
        const result = this.safeList (response, 'result', []);
        const jwtToken = this.safeString (result, 0, '');
        if (jwtToken === '') {
            throw new AuthenticationError (this.id + ' refreshJWT() failed to retrieve a new JWT token');
        }
        return {
            'info': response,
            'jwt': jwtToken,
        };
    }

    /**
     * @method
     * @name rabbitx#fetchTiers
     * @description Get profile tier information.
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/profile
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} tier information including current tier, next tier, and required volume to level up
     */
    async fetchTiers (params = {}) {
        const response = await this.privateGetProfile (params);
        const data = this.safeValue (response, 'result', []);
        // [
        //     {
        //       "tier_status": {
        //         "current": {
        //           "tier": 2,
        //           "title": "VIP 2 (Gold)",
        //           "min_volume": "5000000"
        //         },
        //         "next": {
        //           "tier": 3,
        //           "title": "VIP 3 (Platinum)",
        //           "min_volume": "10000000"
        //         },
        //         "needed_volume": "4630999.406908"
        //       }
        //     }
        // ]
        const tier = this.safeValue (data, 0, {});
        const tierStatus = this.safeValue (tier, 'tier_status', {});
        const current = this.safeValue (tierStatus, 'current', {});
        const next = this.safeValue (tierStatus, 'next', {});
        const neededVolume = this.safeNumber (tierStatus, 'needed_volume');
        return {
            'current': {
                'tier': this.safeInteger (current, 'tier'),
                'title': this.safeString (current, 'title'),
                'minVolume': this.safeNumber (current, 'min_volume'),
            },
            'next': {
                'tier': this.safeInteger (next, 'tier'),
                'title': this.safeString (next, 'title'),
                'minVolume': this.safeNumber (next, 'min_volume'),
            },
            'neededVolume': neededVolume,
            'info': response,
        };
    }

    /**
     * @method
     * @name rabbitx#setDeadmanSwitch
     * @description activate the Deadman Switch to auto-cancel orders after a timeout
     * @param {string} symbol unified market symbol
     * @param {number} [timeout] timeout in seconds after which all orders will be cancelled (default = 600)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} exchange response
     */
    async setDeadmanSwitch (symbol: string, timeout: number = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (timeout === undefined) {
            timeout = this.safeInteger (this.options, 'deadmanSwitchTimeout', 600);
        }
        const request = {
            'market_id': market['id'],
            'timeout': timeout,
        };
        const response = await this.privatePostCancelAllAfter (this.extend (request, params));
        // {
        //     "success": true,
        //     "error": "",
        //     "result":
        //             {
        //                 market_id:'BTC-USD'
        //                 profile_id:1
        //                 timeout:600 // in milliseconds
        //                 last_updated: 1701324346000000
        //                 status: "active" // status could be 'active' or 'canceled'
        //             }
        // }
        const result = this.safeValue (response, 'result', {});
        return this.parseDeadManSwitchStatus (result);
    }

    /**
     * @method
     * @name rabbitx#getDeadmanSwitchStatus
     * @description check the current Deadman Switch timeout setting for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} exchange response
     */
    async getDeadmanSwitchStatus (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.privateGetCancelAllAfter (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        // {
        //     "success": true,
        //     "error": "",
        //     "result":
        //             {
        //                 profile_id:1
        //                 timeout:600 // in milliseconds
        //                 last_updated: 1701324346000000
        //                 status: "active" // status could be 'active' or 'canceled'
        //             }
        // }
        return this.parseDeadManSwitchStatus (result);
    }

    parseDeadManSwitchStatus (status) {
        //
        // {
        //     "profile_id": 12345,
        //     "timeout": 600,
        //     "last_updated": 1640995200,
        //     "status": "active"
        // }
        //
        return {
            'profileId': this.safeInteger (status, 'profile_id'),
            'timeout': this.safeInteger (status, 'timeout'),
            'lastUpdated': this.safeInteger (status, 'last_updated'),
            'status': this.safeString (status, 'status'),
        };
    }

    /**
     * @method
     * @name rabbitx#removeDeadmanSwitch
     * @description disable the Deadman Switch for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} exchange response
     */
    async removeDeadmanSwitch (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.privateDeleteCancelAllAfter (this.extend (request, params));
        // {
        //     "success": true,
        //     "error": "",
        //     "result": None
        // }
        return response;
    }

    /**
     * @method
     * @name rabbitx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['p_limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const results = this.safeValue (response, 'result', []);
        return this.parseOrders (results, market, since, limit);
    }

    /**
     * @method
     * @name rabbitx#fetchOrder
     * @description fetch information on a single order by id or client_order_id
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/orders
     * @param {string} id order ID or clientOrderId
     * @param {string} symbol unified market symbol (required for client_order_id)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: string = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        const isClientOrderId = this.safeValue (params, 'client_order_id', false);
        if (isClientOrderId) {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrder() requires symbol when using client_order_id');
            }
            market = this.market (symbol);
            request['client_order_id'] = id;
            request['market_id'] = market['id'];
        } else {
            request['order_id'] = id;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        const order = this.safeValue (orders, 0);
        if (!order) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order: ' + id);
        }
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name rabbitx#createOrder
     * @description create a trade order
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/orders#place-orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.time_in_force] // (optional) 'good_till_cancel' 'post_only' 'immediate_or_cancel' 'fill_or_kill'
     * @param {string} [params.client_order_id] // (optional)
     * @param {string} [params.trigger_price] // RabbitX stop loss orders where trigger_price is required. Type must be 'stop_loss' or 'take profit'. size is percentage of the position. 0.5 means 50% of the position. 1.0 means 100% of the position.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = (side === 'buy') ? 'long' : 'short'; // RabbitX uses 'long' and 'short' instead of 'buy' and 'sell'
        const request: Dict = {
            'market_id': market['id'],
            'side': orderSide,
            'type': type,
            'size': amount,
        };
        if (type === 'limit' || type === 'stop_limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for (stop) limit orders');
            }
            request['price'] = price;
        }
        if (type === 'stop_loss' || type === 'take_profit' || type === 'stop_limit' || type === 'stop_market') {
            const triggerPrice = this.safeNumber (params, 'trigger_price');
            if (triggerPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a trigger_price parameter for stop loss or take profit orders');
            }
            request['trigger_price'] = triggerPrice;
            // size is percentage of the position. 0.5 means 50% of the position. 1.0 means 100% of the position.
            if (amount < 0 || amount > 1) {
                throw new BadRequest (this.id + ' createOrder() size for stop loss or take profit orders must be between 0 and 1, where 1 means 100% of the position');
            }
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const first = this.safeDict (result, 0);
        return this.parseOrder (first, market);
    }

    /**
     * @method
     * @name rabbitx#cancelOrder
     * @description cancels an open order
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/orders#cancel-orders
     * @param {string} id order ID
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order} the canceled order structure
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'market_id': market['id'],
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseOrder (result[0], market);
    }

    /**
     * @method
     * @name rabbitx#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/orders#cancel-all-orders
     * @param {string} [symbol] unified market symbol, if not provided, all open orders will be canceled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of canceled order structures
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        const response = await this.privateDeleteOrdersCancelAll (params);
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result);
    }

    /**
     * @method
     * @name rabbitx#editOrder
     * @description edits an existing open order (amend order)
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/orders#amend-orders
     * @param {string} id order ID to amend
     * @param {string} symbol unified market symbol
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'long' or 'short'
     * @param {float} amount the new order amount (optional)
     * @param {float} price the new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order} the edited order structure
     */
    async editOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'order_id': id,
            'market_id': market['id'],
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        if (amount !== undefined) {
            request['size'] = amount;
        }
        const response = await this.privatePutOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        const first = this.safeDict (result, 0);
        return this.parseOrder (first, market);
    }

    parseOrder (order: Dict, market = undefined): Order {
        //
        // {
        // id: 'ETH-USD@6217987305',
        // profile_id: '87116',
        // market_id: 'ETH-USD',
        // order_type: 'limit',
        // status: 'open',
        // price: '2000',
        // size: '0.01',
        // initial_size: '0.01',
        // total_filled_size: '0',
        // side: 'long',
        // timestamp: '1749726237677594',
        // reason: '',
        // client_order_id: 'ff18cf5c-aeaf-4a2a-a220-74ca02b121ce',
        // trigger_price: '0',
        // size_percent: '0',
        // time_in_force: 'good_till_cancel',
        // created_at: '0',
        // updated_at: '0'
        // }
        //
        const marketId = this.safeString (order, 'market_id');
        const symbol = this.safeSymbol (marketId, market);
        const rawStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (rawStatus);
        let side = this.safeString (order, 'side');
        if (side === 'long') {
            side = 'buy';
        } else if (side === 'short') {
            side = 'sell';
        }
        const type = this.safeString (order, 'order_type');
        const timeInForce = this.safeString (order, 'time_in_force');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'size');
        const filled = this.safeNumber (order, 'total_filled_size');
        const triggerPriceRaw = this.safeNumber (order, 'trigger_price');
        const triggerPrice = (triggerPriceRaw && triggerPriceRaw > 0) ? triggerPriceRaw : undefined;
        const timestamp = this.safeIntegerProduct (order, 'timestamp', 0.001);
        const datetime = this.iso8601 (timestamp);
        const remaining = (amount !== undefined && filled !== undefined) ? Math.max (amount - filled, 0) : undefined;
        const cost = (filled !== undefined && price !== undefined) ? filled * price : undefined;
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'average': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses = {
            'open': 'open',
            'processing': 'open',
            'amending': 'open',
            'canceling': 'canceled',
            'cancelingall': 'canceled',
            'canceled': 'canceled',
            'closed': 'closed',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name rabbitx#fetchMyTrades
     * @description fetch all trades made by the user (fills), optionally filtered by market, time, or limit
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/fills#get-fills
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['p_limit'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, undefined, since, limit);
    }

    /**
     * @method
     * @name rabbitx#fetchOrderTrades
     * @description fetch all trades made by the user for a specific order
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/fills#get-fills-by-order-id
     * @param {string} id order ID
     * @param {string} [symbol] unified market symbol (not required but recommended for parsing)
     * @param since
     * @param limit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.privateGetFillsOrder (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        return this.parseTrades (result, market);
    }

    /**
     * @method
     * @name rabbitx#fetchPositions
     * @description fetch all open positions for the user
     * @see https://docs.rabbitx.com/api-documentation/private-endpoints/positions
     * @param {string[]|undefined} symbols unified market symbols to filter positions by, if not provided, all open positions will be fetched
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of open position structures
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        this.checkRequiredCredentials ();
        const response = await this.privateGetPositions (params);
        const results = this.safeValue (response, 'result', []);
        const positions = this.parsePositions (results, undefined, params);
        return this.filterByArrayPositions (positions, 'symbol', symbols);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        // {
        // id: 'pos-BTC-USD-tr-123456',
        // market_id: 'BTC-USD',
        // profile_id: '123456',
        // size: '0.01',
        // side: 'short',
        // entry_price: '104449',
        // unrealized_pnl: '0.49',
        // notional: '1044',
        // margin: '20.88',
        // liquidation_price: '202356.81717821782178217821782178217822',
        // fair_price: '104400'
        // }
        const marketId = this.safeString (position, 'market_id');
        const symbol = this.safeSymbol (marketId, market);
        const sideRaw = this.safeString (position, 'side');
        const side = (sideRaw === 'long') ? 'buy' : 'sell';
        const size = this.safeNumber (position, 'size');
        const notional = this.safeNumber (position, 'notional');
        const entryPrice = this.safeNumber (position, 'entry_price');
        const markPrice = this.safeNumber (position, 'fair_price'); // fair_price is the mark price
        const liquidationPrice = this.safeNumber (position, 'liquidation_price');
        const unrealizedPnl = this.safeNumber (position, 'unrealized_pnl');
        const margin = this.safeNumber (position, 'margin');
        return {
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'initialMargin': margin,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': entryPrice,
            'notional': notional,
            'leverage': undefined,
            'unrealizedPnl': unrealizedPnl,
            'contracts': size,
            'contractSize': undefined,
            'marginRatio': undefined,
            'liquidationPrice': liquidationPrice,
            'markPrice': markPrice,
            'collateral': margin,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
        };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        // { "success": false, "error": "NO_SUCH_KEY", "request_id": "...", "result": [] }
        const success = this.safeValue (response, 'success', true);
        if (success !== true) {
            const message = this.safeString (response, 'error');
            const feedback = this.id + ' ' + body;
            const errorCode = message; // RabbitX uses 'error' as the code
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
