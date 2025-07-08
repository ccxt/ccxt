//  ---------------------------------------------------------------------------

import Exchange from './abstract/zebpayspot.js';
import { TICK_SIZE } from './base/functions/number.js';
import { BadRequest, AuthenticationError, NotSupported, RateLimitExceeded, ExchangeNotAvailable, ExchangeError } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Dict, Int, int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface } from './base/types.js';
import Precise from './base/Precise.js';

//  ---------------------------------------------------------------------------

/**
 * @class
 * @augments Exchange
 */
export default class zebpayspot extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'zebpayspot',
            'name': 'Zebpay Spot',
            'countries': [ 'IN' ],
            'rateLimit': 0,
            'version': 'v2',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': undefined,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': 'emulated',
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 480,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://sapi.zebpay.com',
                    'private': 'https://sapi.zebpay.com',
                },
                'www': 'https://www.zebpay.com',
                'doc': '',
                'fees': '',
            },
            'api': {
                'public': {
                    'get': {
                        'market/orderbook': 10,
                        'market/trades': 10,
                        'market/ticker': 10,
                        'market/allTickers': 10,
                        'ex/tradepairs': 10,
                        'ex/currencies': 10,
                        'market/klines': 10,
                    },
                },
                'private': {
                    'post': {
                        'ex/orders': 10,
                    },
                    'get': {
                        'ex/orders': 10,
                        'account/balance': 10,
                        'ex/fee/{symbol}': 10,
                        'ex/orders/{orderId}': 10,
                        'ex/orders/fills/{orderId}': 10,
                    },
                    'delete': {
                        'ex/orders/{orderId}': 10,
                        'ex/orders': 10,
                        'ex/orders/cancelAll': 10,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {},
            'commonCurrencies': {
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {},
            'features': {
                'default': {
                    'fetchOHLCV': {
                        'limit': 100,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Bad Request -- Invalid request format
                    '401': AuthenticationError, // Unauthorized -- Invalid API Key
                    '403': NotSupported, // Forbidden -- The request is forbidden
                    '404': NotSupported, // Not Found -- The specified resource could not be found
                    '429': RateLimitExceeded, // Too Many Requests -- Access limit breached
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable, // Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                },
                'broad': {
                },
            },
        });
    }

    /**
     * @method
     * @name zebpayspot#fetchMarkets
     * @description retrieves data on all markets for zebpayfutures
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-trading-pairs
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetExTradepairs (params);
        //
        //    {
        //        "data": {
        //            "symbol": "ETH-INR",
        //            "name": "ETH-INR",
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "INR",
        //            "feeCurrency": "INR",
        //            "baseMinSize": "",
        //            "quoteMinSize": "100",
        //            "baseMaxSize": "",
        //            "quoteMaxSize": "2000",
        //            "baseIncrement": "0.00001"
        //            "quoteIncrement": "0.00001",
        //            "enableTrading": true
        //        }
        //    }
        //
        const result = [];
        const data = this.safeDict (response, 'data', {});
        const markets = this.safeList (data, 'tradePairs', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'spot': true,
                'margin': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': undefined,
                'taker': undefined,
                'maker': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'baseIncrement'),
                    'price': this.safeNumber (market, 'priceIncrement'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'baseMinSize', 0),
                        'max': this.safeNumber (market, 'baseMaxSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'quoteMinSize'),
                        'max': this.safeNumber (market, 'quoteMaxSize'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    /**
     * @method
     * @name zebpayspot#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-coin-settings
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetExCurrencies (params);
        //
        //     {
        //             "data": [
        //                 {
        //                     "currency": "BTC",
        //                     "name": "BTC",
        //                     "fullName": "150",
        //                     "precision": "0.2",
        //                     "type": "fiat",
        //                     "isDebitEnabled": false,
        //                     "chains": [
        //                         {
        //                             "chainName": "Bitcoin",
        //                             "withdrawalMinSize": "0.000482",
        //                             "depositMinSize": "0.00000001",
        //                             "withdrawalFee": "0.00040000",
        //                             "isWithdrawEnabled": "true",
        //                             "isDepositEnabled": "true",
        //                             "contractAddress": "0x095418A82BC2439703b69fbE1210824F2247D77c",
        //                             "withdrawPrecision": "8",
        //                             "maxWithdraw": "2.43090487000000",
        //                             "maxDeposit": "100.00000000",
        //                             "needTag": "false",
        //                             "chainId": "bitcoin",
        //                             "AddressRegex": "^tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|m[a-zA-Z0-9]{25,34}|n[a-zA-Z0-9]{25,34}|^2[a-zA-Z0-9]{25,34}$"
        //                          }
        //                     ]
        //                 }
        //             ]
        //     }
        //
        const rows = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision')));
            const chains = this.safeList (currency, 'chains', []);
            const networks: Dict = {};
            let minWithdrawFeeString = undefined;
            let minWithdrawString = undefined;
            let minDepositString = undefined;
            let deposit = false;
            let withdraw = false;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chainId');
                const networkCode = this.networkIdToCode (networkId);
                const depositAllowed = this.safeBool (chain, 'isDepositEnabled') === true;
                deposit = (depositAllowed) ? depositAllowed : deposit;
                const withdrawAllowed = this.safeBool (chain, 'isWithdrawEnabled') === true;
                withdraw = (withdrawAllowed) ? withdrawAllowed : withdraw;
                const withdrawFeeString = this.safeString (chain, 'withdrawalFee');
                if (withdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? withdrawFeeString : Precise.stringMin (withdrawFeeString, minWithdrawFeeString);
                }
                const minNetworkWithdrawString = this.safeString (chain, 'withdrawalMinSize');
                if (minNetworkWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? minNetworkWithdrawString : Precise.stringMin (minNetworkWithdrawString, minWithdrawString);
                }
                const minNetworkDepositString = this.safeString (chain, 'depositMinSize');
                if (minNetworkDepositString !== undefined) {
                    minDepositString = (minDepositString === undefined) ? minNetworkDepositString : Precise.stringMin (minNetworkDepositString, minDepositString);
                }
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': depositAllowed && withdrawAllowed,
                    'deposit': depositAllowed,
                    'withdraw': withdrawAllowed,
                    'fee': this.parseNumber (withdrawFeeString),
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': this.parseNumber (minNetworkWithdrawString),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber (minNetworkDepositString),
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': name,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': this.parseNumber (minWithdrawFeeString),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber (minWithdrawString),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.parseNumber (minDepositString),
                        'max': undefined,
                    },
                },
                'networks': networks,
            });
        }
        return result;
    }

    /**
     * @method
     * @name zebpayspot#createOrder
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#place-new-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
        };
        [ request, params ] = this.orderRequest (symbol, type, amount, request, price, params);
        const response = await this.privatePostExOrders (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const order = this.parseOrder (data, market);
        return order;
    }

    /**
     * @method
     * @name zebpayspot#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-exchange-fee
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.side] side to fetch trading fee
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const side = this.safeString (params, 'side', undefined);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (side !== undefined) {
            request['side'] = side;
        }
        const response = await this.privateGetExFeeSymbol (this.extend (request, params));
        //
        // {
        //     "statusDescription": "Success",
        //     "data":
        //       {
        //         "symbol": "BTCINR",
        //         "takerFeeRate": "0.01",
        //         "makerFeeRate": "0.05",
        //         "percentage": true
        //       } ,
        //     "statusCode": 200,
        // }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTradingFee (data, market);
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        return {
            'info': fee,
            'symbol': this.safeSymbol (undefined, market),
            'maker': this.safeNumber (fee, 'makerFeeRate'),
            'taker': this.safeNumber (fee, 'takerFeeRate'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    /**
     * @method
     * @name zebpayspot#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-account-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetAccountBalance (this.extend (request, params));
        if (response.data === null) {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //     {
        //         "data": [
        //              {
        //                 "available": "1.076218",
        //                 "locked": "0",
        //                 "balance": "1.076218",
        //                 "currency": "INJ"
        //              },
        //              {
        //                 "available": "0",
        //                 "locked": "0",
        //                 "balance": "0",
        //                 "currency": "QTUM"
        //              }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name zebpayspot#cancelOrder
     * @description cancels an open order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders-for-a-symbol
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] Timestamp
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        let response = undefined;
        if (id === undefined) {
            request['symbol'] = symbol;
            response = await this.privateDeleteExOrders (this.extend (request, params));
        } else {
            request['orderId'] = id;
            response = await this.privateDeleteExOrdersOrderId (this.extend (request, params));
        }
        if (response.data === null) {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //    {
        //        "data": {
        //            "orderId": "12345",
        //            "symbol": 'BTC-INR
        //        },
        //    }
        //
        return response;
    }

    /**
     * @method
     * @name zebpayspot#cancelOrders
     * @description cancels all open orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders
     * @param {string[]} ids open orders transaction ID (txid) or user reference (userref)
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateDeleteExOrdersCancelAll (this.extend (request, params));
        if (response.data === null) {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //    {
        //        "data": {
        //            "orderId": "12345",
        //            "symbol": 'BTC-INR
        //        },
        //    }
        //
        return response;
    }

    /**
     * @method
     * @name zebpayspot#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.publicGetMarketAllTickers (this.extend (request, params));
        //
        //     [
        //        {
        //            "symbol": "BTC-INR",
        //            "bestBid": "4900000",
        //            "bestBidQty": "0.00014938",
        //            "bestAsk": "",
        //            "bestAskQty": "0",
        //            "priceChange": "-98134.56",
        //            "priceChangePercent": "-1.84",
        //            "high": "5433400",
        //            "low": "5333400",
        //            "vol": "0.0002",
        //            "volValue": "1066.68",
        //            "last": "5333400"
        //        }
        //     ]
        //
        return this.parseTickers (response, undefined);
    }

    /**
     * @method
     * @name zebpayspot#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        limit = (limit === undefined) ? 10 : limit;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketOrderbook (this.extend (request, params));
        //
        //       {
        //         "asks": [
        //                 [5000, 1000],           //Price, quantity
        //                 [6000, 1983]            //Price, quantity
        //         ],
        //         "bids": [
        //                 [3200, 800],            //Price, quantity
        //                 [3100, 100]             //Price, quantity
        //         ],
        //       }
        // }
        const orderbook = this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', 0, 1);
        return orderbook;
    }

    /**
     * @method
     * @name zebpayspot#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     [
        //        {
        //            "symbol": "BTC-INR",
        //            "bestBid": "4900000",
        //            "bestBidQty": "0.00014938",
        //            "bestAsk": "",
        //            "bestAskQty": "0",
        //            "priceChange": "-98134.56",
        //            "priceChangePercent": "-1.84",
        //            "high": "5433400",
        //            "low": "5333400",
        //            "vol": "0.0002",
        //            "volValue": "1066.68",
        //            "last": "5333400"
        //        }
        //     ]
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name zebpayspot#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (typeof since !== 'undefined') {
            request['page'] = since;
        } else {
            request['page'] = 1;
        }
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        } else {
            request['limit'] = 10;
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id" : "60014521",
        //             "price" : "23162.94",
        //             "qty" : "0.00009",
        //             "side" : "SELL",
        //             "time" : 1659684602042,
        //             "isBuyerMaker" : 1659684602036
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name zebpayspot#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        return await this.fetchTickers (symbols, params);
    }

    /**
     * @method
     * @name zebpayspot#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-klinescandlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endtime] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const endtime = this.safeString (params, 'endTime');
        params = this.omit (params, [ 'endtime' ]);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit === undefined) {
            limit = 200; // default is 200
        }
        request['startTime'] = since;
        request['limit'] = limit; // max 200, default 200
        request['endTime'] = endtime;
        request['interval'] = timeframe;
        let response = undefined;
        if (market['spot']) {
            request['category'] = 'spot';
            response = await this.publicGetMarketKlines (this.extend (request, params));
        }
        //
        //             [
        //                 [
        //                     "1670608800000",
        //                     "17071",
        //                     "17073",
        //                     "17027",
        //                     "17055.5",
        //                     "268611",
        //                     "15.74462667"
        //                 ],
        //                 [
        //                     "1670605200000",
        //                     "17071.5",
        //                     "17071.5",
        //                     "17061",
        //                     "17071",
        //                     "4177",
        //                     "0.24469757"
        //                 ],
        //                 [
        //                     "1670601600000",
        //                     "17086.5",
        //                     "17088",
        //                     "16978",
        //                     "17071.5",
        //                     "6356",
        //                     "0.37288112"
        //                 ]
        //             ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name zebpayspot#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timestamp] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        request['orderId'] = id;
        const response = await this.privateGetExOrdersOrderId (this.extend (request, params));
        if (response.data === null) {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //     {
        //         "data": {
        //                     "orderId": "64507d02921f1c0001ff6892-123-zeb",
        //                     "datetime": "2025-03-14T14:34:34.4567",
        //                     "timestamp": 1741962557553,
        //                     "status": "open",
        //                     "origQty": "12",
        //                     "symbol": "BTCINR",
        //                     "type": "market",
        //                     "side": "buy",
        //                     "price": 700000,
        //                     "avgExecutedPrice": 0,
        //                     "filledQty": "0",
        //                     "openQty": 0.002,
        //                     "feeCurrency": "INR",
        //                     "fees": "0",
        //                     "tds": "0",
        //                     "tax": "0"
        //                 }
        //     }
        //
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const responseData = this.safeDict (response, 'data');
        return this.parseOrder (responseData, market);
    }

    /**
     * @method
     * @name zebpayspot#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timestamp] the orders client order id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {
            'currentPage': 1,
            'pageSize': limit,
            'symbol': symbol,
        };
        const response = await this.privateGetExOrders (this.extend (request, params));
        if (response.data === null) {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //     {
        //         "data": {
        //             "items": [
        //                   {
        //                      "orderId": "64507d02921f1c0001ff6892-123-zeb",
        //                      "datetime": "2025-03-14T14:34:34.4567",
        //                      "timestamp": 1741962557553,
        //                      "status": "open",
        //                      "symbol": "BTCINR",
        //                      "type": "market",
        //                      "side": "buy",
        //                      "price": "700000",
        //                      "avgExecutedPrice": "0",
        //                      "filled": null,
        //                      "remaining": 0.002,
        //                      "filledQty": "0",
        //                      "openQty": 0.002,
        //                      "feeCurrency": "INR",
        //                      "fees": "0",
        //                      "tds": "0",
        //                      "tax": "0"
        //                  }
        //              ]
        //           }
        //     }
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const result = this.safeDict (response, 'data', {});
        const items = this.safeList (result, 'items', []);
        return this.parseOrders (items, market, undefined, limit);
    }

    /**
     * @method
     * @name zebpatspot#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-fills
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetExOrdersFillsOrderId (this.extend (request, params));
        if (response.data === null) {
            throw new ExchangeError (JSON.stringify (response));
        }
        //
        //         {
        //             "orderId": "456789",
        //             "symbol": "LINK_USDT",
        //             "origQty": "1.5",
        //             "orderId": "30249408733945856",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "matchRole": "MAKER",
        //             "createTime": 1648200366864,
        //             "price": "3.1",
        //             "avgExecutedPrice": "2.3456"
        //             "openQty": "1",
        //             "filledQty": "0",
        //             "fees": "0.00145",
        //         }
        //
        const data = this.safeDict (response, 'data', {});
        const trades = [ data ];
        return this.parseTrades (trades);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchMyTrades
        //
        //     {
        //         "id": "32164924331503616",
        //         "symbol": "LINK_USDT",
        //         "accountType": "SPOT",
        //         "orderId": "32164923987566592",
        //         "side": "SELL",
        //         "type": "MARKET",
        //         "matchRole": "TAKER",
        //         "createTime": 1648635115525,
        //         "price": "11",
        //         "quantity": "0.5",
        //         "amount": "5.5",
        //         "feeCurrency": "USDT",
        //         "feeAmount": "0.007975",
        //         "pageId": "32164924331503616",
        //         "clientOrderId": "myOwnId-321"
        //     }
        //
        //
        const id = undefined;
        const orderId = this.safeInteger (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'createdAt');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeStringLower (trade, 'side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'openQty');
        const fees = this.safeString (trade, 'fees');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': this.safeStringLower (trade, 'type'),
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fees,
        }, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     [
        //        {
        //            "symbol": "BTC-INR",
        //            "bestBid": "4900000",
        //            "bestBidQty": "0.00014938",
        //            "bestAsk": "",
        //            "bestAskQty": "0",
        //            "priceChange": "-98134.56",
        //            "priceChangePercent": "-1.84",
        //            "high": "5433400",
        //            "low": "5333400",
        //            "vol": "0.0002",
        //            "volValue": "1066.68",
        //            "last": "5333400"
        //        }
        //     ]
        //
        const timestamp = this.safeInteger (ticker, 'ts', undefined);
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId);
        const close = this.safeString (ticker, 'close', undefined);
        const last = this.safeString (ticker, 'last', undefined);
        const percentage = this.safeString (ticker, 'priceChangePercent');
        const bidVolume = this.safeString (ticker, 'bestBidQty');
        const askVolume = this.safeString (ticker, 'bestAskQty');
        return this.safeTicker ({
            'id': marketId,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': bidVolume,
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'markPrice': undefined,
            'info': ticker,
        }, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //      {
        //          "orderId": "64507d02921f1c0001ff6892-123-zeb",
        //          "datetime": "2025-03-14T14:34:34.4567",
        //          "timestamp": 1741962557553,
        //          "status": "open",
        //          "symbol": "BTCINR",
        //          "type": "market",
        //          "side": "buy",
        //          "price": "700000",
        //          "avgExecutedPrice": "0",
        //          "filled": null,
        //          "remaining": 0.002,
        //          "filledQty": "0",
        //          "openQty": 0.002,
        //          "feeCurrency": "INR",
        //          "fees": "0",
        //          "tds": "0",
        //          "tax": "0"
        //      }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const type = this.safeString (order, 'type');
        const timestamp = this.safeInteger (order, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeString (order, 'price');
        const side = this.safeString (order, 'side');
        const amount = this.safeString (order, 'origQty');
        const filled = this.safeString (order, 'filledQty');
        const remaining = this.safeString (order, 'openQty');
        const orderId = this.safeString (order, 'orderId');
        const timeInForce = undefined;
        const status = this.safeString (order, 'status');
        return this.safeOrder ({
            'id': orderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'amount': amount,
            'price': price,
            'triggerPrice': undefined,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': undefined,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    orderRequest (symbol, type, amount, request, price = undefined, params = {}) {
        const upperCaseType = type.toUpperCase ();
        const triggerPrice = this.safeString (params, 'stopPrice');
        const quoteOrderQty = this.safeString (params, 'quoteOrderQty');
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        const clientOrderId = this.safeString (params, 'clientOrderId', this.uuid ());
        params = this.omit (params, [ 'stopPrice', 'quoteOrderQty', 'timeInForce', 'clientOrderId' ]);
        request['type'] = upperCaseType;
        request['clientOrderId'] = clientOrderId;
        request['timeInForce'] = timeInForce;
        if (upperCaseType === 'MARKET') {
            if (quoteOrderQty === undefined) {
                throw new ExchangeError (this.id + ' market createOrder() requires quoteOrderQty as params');
            }
            request['quoteOrderQty'] = quoteOrderQty;
        } else {
            request['stopPrice'] = triggerPrice;
            request['quantity'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        return [ request, params ];
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyList = this.safeList (response, 'data');
        for (let i = 0; i < currencyList.length; i++) {
            const entry = currencyList[i];
            const account = this.account ();
            account['total'] = this.safeString (entry, 'balance');
            account['free'] = this.safeString (entry, 'available');
            account['used'] = this.safeString (entry, 'locked');
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const tail = '/api/' + this.version + '/' + this.implodeParams (path, params);
        url += tail;
        const timestamp = this.milliseconds ().toString ();
        let signature = '';
        const query = this.omit (params, this.extractParams (path));
        const queryLength = Object.keys (query).length;
        if (api === 'public') {
            if (queryLength) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET' || method === 'DELETE') {
                // For GET/DELETE: Append params to URL and sign the query string
                params['timestamp'] = timestamp;
                if (method === 'DELETE' && path.includes ('ex/orders')) {
                    params = this.omit (params, 'orderId');
                }
                if (method === 'GET' && path.includes ('ex/orders/')) {
                    params = this.omit (params, 'orderId');
                }
                const queryString = this.urlencode (params);
                signature = this.hmac (queryString, this.secret, sha256, 'hex');
                url += '?' + queryString;
            } else {
                // For POST/PUT: Convert body to JSON and sign the stringified payload
                params['timestamp'] = timestamp;
                body = JSON.stringify (params);
                signature = this.hmac (body, this.secret, sha256, 'hex');
            }
            headers = {
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, body);
            return undefined;
        }
        //
        // bad
        //     { "code": "400100", "msg": "validation.createOrder.clientOidIsRequired" }
        // good
        //     { code: "200000", data: { ... }}
        //
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg', '');
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
        return undefined;
    }
}
