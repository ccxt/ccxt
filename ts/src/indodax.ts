
//  ---------------------------------------------------------------------------

import Exchange from './abstract/indodax.js';
import { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, BadSymbol } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class indodax
 * @augments Exchange
 */
export default class indodax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'indodax',
            'name': 'INDODAX',
            'countries': [ 'ID' ], // Indonesia
            // 10 requests per second for making trades => 1000ms / 10 = 100ms
            // 180 requests per minute (public endpoints) = 2 requests per second => cost = (1000ms / rateLimit) / 2 = 5
            'rateLimit': 100,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchDeposit': false,
                'fetchDepositAddress': 'emulated',
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFee': true,
                'fetchTransactionFees': false,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'version': '2.0', // as of 9 April 2018
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg',
                'api': {
                    'public': 'https://indodax.com',
                    'private': 'https://indodax.com/tapi',
                },
                'www': 'https://www.indodax.com',
                'doc': 'https://github.com/btcid/indodax-official-api-docs',
                'referral': 'https://indodax.com/ref/testbitcoincoid/1',
            },
            'api': {
                'public': {
                    'get': {
                        'api/server_time': 5,
                        'api/pairs': 5,
                        'api/price_increments': 5,
                        'api/summaries': 5,
                        'api/ticker/{pair}': 5,
                        'api/ticker_all': 5,
                        'api/trades/{pair}': 5,
                        'api/depth/{pair}': 5,
                        'tradingview/history_v2': 5,
                    },
                },
                'private': {
                    'post': {
                        'getInfo': 4,
                        'transHistory': 4,
                        'trade': 1,
                        'tradeHistory': 4, // TODO add fetchMyTrades
                        'openOrders': 4,
                        'orderHistory': 4,
                        'getOrder': 4,
                        'cancelOrder': 4,
                        'withdrawFee': 4,
                        'withdrawCoin': 4,
                        'listDownline': 4,
                        'checkDownline': 4,
                        'createVoucher': 4, // partner only
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'invalid_pair': BadSymbol, // {"error":"invalid_pair","error_description":"Invalid Pair"}
                    'Insufficient balance.': InsufficientFunds,
                    'invalid order.': OrderNotFound,
                    'Invalid credentials. API not found or session has expired.': AuthenticationError,
                    'Invalid credentials. Bad sign.': AuthenticationError,
                },
                'broad': {
                    'Minimum price': InvalidOrder,
                    'Minimum order': InvalidOrder,
                },
            },
            // exchange-specific options
            'options': {
                'recvWindow': 5 * 1000, // default 5 sec
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'networks': {
                    'XLM': 'Stellar Token',
                    'BSC': 'bep20',
                    'TRC20': 'trc20',
                    'MATIC': 'polygon',
                    // 'BEP2': 'bep2',
                    // 'ARB': 'arb',
                    // 'ERC20': 'erc20',
                    // 'KIP7': 'kip7',
                    // 'MAINNET': 'mainnet',  // TODO: does mainnet just mean the default?
                    // 'OEP4': 'oep4',
                    // 'OP': 'op',
                    // 'SPL': 'spl',
                    // 'TRC10': 'trc10',
                    // 'ZRC2': 'zrc2'
                    // 'ETH': 'eth'
                    // 'BASE': 'base'
                },
                'timeframes': {
                    '1m': '1',
                    '15m': '15',
                    '30m': '30',
                    '1h': '60',
                    '4h': '240',
                    '1d': '1D',
                    '3d': '3D',
                    '1w': '1W',
                },
            },
            'commonCurrencies': {
                'STR': 'XLM',
                'BCHABC': 'BCH',
                'BCHSV': 'BSV',
                'DRK': 'DASH',
                'NEM': 'XEM',
            },
            'precisionMode': TICK_SIZE,
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name indodax#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetApiServerTime (params);
        //
        //     {
        //         "timezone": "UTC",
        //         "server_time": 1571205969552
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name indodax#fetchMarkets
         * @description retrieves data on all markets for indodax
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#pairs
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiPairs (params);
        //
        //     [
        //         {
        //             "id": "btcidr",
        //             "symbol": "BTCIDR",
        //             "base_currency": "idr",
        //             "traded_currency": "btc",
        //             "traded_currency_unit": "BTC",
        //             "description": "BTC/IDR",
        //             "ticker_id": "btc_idr",
        //             "volume_precision": 0,
        //             "price_precision": 1000,
        //             "price_round": 8,
        //             "pricescale": 1000,
        //             "trade_min_base_currency": 10000,
        //             "trade_min_traded_currency": 0.00007457,
        //             "has_memo": false,
        //             "memo_name": false,
        //             "has_payment_id": false,
        //             "trade_fee_percent": 0.3,
        //             "url_logo": "https://indodax.com/v2/logo/svg/color/btc.svg",
        //             "url_logo_png": "https://indodax.com/v2/logo/png/color/btc.png",
        //             "is_maintenance": 0
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'ticker_id');
            const baseId = this.safeString (market, 'traded_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const isMaintenance = this.safeInteger (market, 'is_maintenance');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': isMaintenance ? false : true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'trade_fee_percent'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'percentage': true,
                'precision': {
                    'amount': this.parseNumber ('1e-8'),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_round'))),
                    'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'volume_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'trade_min_traded_currency'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'trade_min_base_currency'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    parseBalance (response): Balances {
        const balances = this.safeValue (response, 'return', {});
        const free = this.safeValue (balances, 'balance', {});
        const used = this.safeValue (balances, 'balance_hold', {});
        const timestamp = this.safeTimestamp (balances, 'server_time');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (free, currencyId);
            account['used'] = this.safeString (used, currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name indodax#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-info-endpoint
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "server_time":1619562628,
        //             "balance":{
        //                 "idr":167,
        //                 "btc":"0.00000000",
        //                 "1inch":"0.00000000",
        //             },
        //             "balance_hold":{
        //                 "idr":0,
        //                 "btc":"0.00000000",
        //                 "1inch":"0.00000000",
        //             },
        //             "address":{
        //                 "btc":"1KMntgzvU7iTSgMBWc11nVuJjAyfW3qJyk",
        //                 "1inch":"0x1106c8bb3172625e1f411c221be49161dac19355",
        //                 "xrp":"rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //                 "zrx":"0x1106c8bb3172625e1f411c221be49161dac19355"
        //             },
        //             "user_id":"276011",
        //             "name":"",
        //             "email":"testbitcoincoid@mailforspam.com",
        //             "profile_picture":null,
        //             "verification_status":"unverified",
        //             "gauth_enable":true
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name indodax#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['base'] + market['quote'],
        };
        const orderbook = await this.publicGetApiDepthPair (this.extend (request, params));
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'buy', 'sell');
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "high":"0.01951",
        //         "low":"0.01877",
        //         "vol_eth":"39.38839319",
        //         "vol_btc":"0.75320886",
        //         "last":"0.01896",
        //         "buy":"0.01896",
        //         "sell":"0.019",
        //         "server_time":1565248908
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'server_time');
        const baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        const quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, baseVolume),
            'quoteVolume': this.safeString (ticker, quoteVolume),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name indodax#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['base'] + market['quote'],
        };
        const response = await this.publicGetApiTickerPair (this.extend (request, params));
        //
        //     {
        //         "ticker": {
        //             "high":"0.01951",
        //             "low":"0.01877",
        //             "vol_eth":"39.38839319",
        //             "vol_btc":"0.75320886",
        //             "last":"0.01896",
        //             "buy":"0.01896",
        //             "sell":"0.019",
        //             "server_time":1565248908
        //         }
        //     }
        //
        const ticker = this.safeDict (response, 'ticker', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name indodax#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#ticker-all
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        //
        // {
        //     "tickers": {
        //         "btc_idr": {
        //             "high": "120009000",
        //             "low": "116735000",
        //             "vol_btc": "218.13777777",
        //             "vol_idr": "25800033297",
        //             "last": "117088000",
        //             "buy": "117002000",
        //             "sell": "117078000",
        //             "server_time": 1571207881
        //         }
        //     }
        // }
        //
        const response = await this.publicGetApiTickerAll (params);
        const tickers = this.safeDict (response, 'tickers', {});
        return this.parseTickers (tickers, symbols);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        const timestamp = this.safeTimestamp (trade, 'date');
        return this.safeTrade ({
            'id': this.safeString (trade, 'tid'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': this.safeString (trade, 'type'),
            'order': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name indodax#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Public-RestAPI.md#trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['base'] + market['quote'],
        };
        const response = await this.publicGetApiTradesPair (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "Time": 1708416900,
        //         "Open": 51707.52,
        //         "High": 51707.52,
        //         "Low": 51707.52,
        //         "Close": 51707.52,
        //         "Volume": "0"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'Time'),
            this.safeNumber (ohlcv, 'Open'),
            this.safeNumber (ohlcv, 'High'),
            this.safeNumber (ohlcv, 'Low'),
            this.safeNumber (ohlcv, 'Close'),
            this.safeNumber (ohlcv, 'Volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name indodax#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframes = this.options['timeframes'];
        const selectedTimeframe = this.safeString (timeframes, timeframe, timeframe);
        const now = this.seconds ();
        const until = this.safeInteger (params, 'until', now);
        params = this.omit (params, [ 'until' ]);
        const request = {
            'to': until,
            'tf': selectedTimeframe,
            'symbol': market['base'] + market['quote'],
        };
        if (limit === undefined) {
            limit = 1000;
        }
        if (since !== undefined) {
            request['from'] = Math.floor (since / 1000);
        } else {
            const duration = this.parseTimeframe (timeframe);
            request['from'] = now - limit * duration - 1;
        }
        const response = await this.publicGetTradingviewHistoryV2 (this.extend (request, params));
        //
        //     [
        //         {
        //             "Time": 1708416900,
        //             "Open": 51707.52,
        //             "High": 51707.52,
        //             "Low": 51707.52,
        //             "Close": 51707.52,
        //             "Volume": "0"
        //         }
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        //     {
        //         "order_id": "12345",
        //         "submit_time": "1392228122",
        //         "price": "8000000",
        //         "type": "sell",
        //         "order_ltc": "100000000",
        //         "remain_ltc": "100000000"
        //     }
        //
        // market closed orders - note that the price is very high
        // and does not reflect actual price the order executed at
        //
        //     {
        //       "order_id": "49326856",
        //       "type": "sell",
        //       "price": "1000000000",
        //       "submit_time": "1618314671",
        //       "finish_time": "1618314671",
        //       "status": "filled",
        //       "order_xrp": "30.45000000",
        //       "remain_xrp": "0.00000000"
        //     }
        let side = undefined;
        if ('type' in order) {
            side = order['type'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status', 'open'));
        let symbol = undefined;
        let cost = undefined;
        const price = this.safeString (order, 'price');
        let amount = undefined;
        let remaining = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            let quoteId = market['quoteId'];
            let baseId = market['baseId'];
            if ((market['quoteId'] === 'idr') && ('order_rp' in order)) {
                quoteId = 'rp';
            }
            if ((market['baseId'] === 'idr') && ('remain_rp' in order)) {
                baseId = 'rp';
            }
            cost = this.safeString (order, 'order_' + quoteId);
            if (!cost) {
                amount = this.safeString (order, 'order_' + baseId);
                remaining = this.safeString (order, 'remain_' + baseId);
            }
        }
        const timestamp = this.safeInteger (order, 'submit_time');
        const fee = undefined;
        const id = this.safeString (order, 'order_id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#get-order-endpoints
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        const orders = response['return'];
        const order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        order['info'] = response;
        return order;
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name indodax#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#open-orders-endpoints
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const rawOrders = response['return']['orders'];
        // { success: 1, return: { orders: null }} if no orders
        if (!rawOrders) {
            return [];
        }
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (symbol !== undefined) {
            return this.parseOrders (rawOrders, market, since, limit);
        }
        // { success: 1, return: { orders: { marketid: [ ... objects ] }}} if all orders are fetched
        const marketIds = Object.keys (rawOrders);
        let exchangeOrders = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketOrders = rawOrders[marketId];
            market = this.safeMarket (marketId);
            const parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            exchangeOrders = this.arrayConcat (exchangeOrders, parsedOrders);
        }
        return exchangeOrders as Order[];
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name indodax#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#order-history
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market);
        orders = this.filterBy (orders, 'status', 'closed') as Order[];
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit) as Order[];
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name indodax#createOrder
         * @description create a trade order
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#trade-endpoints
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        const currency = market['baseId'];
        if (side === 'buy') {
            request[market['quoteId']] = amount * price;
        } else {
            request[market['baseId']] = amount;
        }
        request[currency] = amount;
        const result = await this.privatePostTrade (this.extend (request, params));
        const data = this.safeValue (result, 'return', {});
        const id = this.safeString (data, 'order_id');
        return this.safeOrder ({
            'info': result,
            'id': id,
        }, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name indodax#cancelOrder
         * @description cancels an open order
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#cancel-order-endpoints
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const side = this.safeValue (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an extra "side" param');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'pair': market['id'],
            'type': side,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchTransactionFee (code: string, params = {}) {
        /**
         * @method
         * @name indodax#fetchTransactionFee
         * @description fetch the fee for a transaction
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-fee-endpoints
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostWithdrawFee (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "server_time": 1607923272,
        //             "withdraw_fee": 0.005,
        //             "currency": "eth"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'return', {});
        const currencyId = this.safeString (data, 'currency');
        return {
            'info': response,
            'rate': this.safeNumber (data, 'withdraw_fee'),
            'currency': this.safeCurrencyCode (currencyId, currency),
        };
    }

    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name indodax#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#transaction-history-endpoints
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            const startTime = this.iso8601 (since).slice (0, 10);
            request['start'] = startTime;
            request['end'] = this.iso8601 (this.milliseconds ()).slice (0, 10);
        }
        const response = await this.privatePostTransHistory (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": {
        //             "withdraw": {
        //                 "idr": [
        //                     {
        //                         "status": "success",
        //                         "type": "coupon",
        //                         "rp": "115205",
        //                         "fee": "500",
        //                         "amount": "114705",
        //                         "submit_time": "1539844166",
        //                         "success_time": "1539844189",
        //                         "withdraw_id": "1783717",
        //                         "tx": "BTC-IDR-RDTVVO2P-ETD0EVAW-VTNZGMIR-HTNTUAPI-84ULM9OI",
        //                         "sender": "boris",
        //                         "used_by": "viginia88"
        //                     },
        //                     ...
        //                 ],
        //                 "btc": [],
        //                 "abyss": [],
        //                 ...
        //             },
        //             "deposit": {
        //                 "idr": [
        //                     {
        //                         "status": "success",
        //                         "type": "duitku",
        //                         "rp": "393000",
        //                         "fee": "5895",
        //                         "amount": "387105",
        //                         "submit_time": "1576555012",
        //                         "success_time": "1576555012",
        //                         "deposit_id": "3395438",
        //                         "tx": "Duitku OVO Settlement"
        //                     },
        //                     ...
        //                 ],
        //                 "btc": [
        //                     {
        //                         "status": "success",
        //                         "btc": "0.00118769",
        //                         "amount": "0.00118769",
        //                         "success_time": "1539529208",
        //                         "deposit_id": "3602369",
        //                         "tx": "c816aeb35a5b42f389970325a32aff69bb6b2126784dcda8f23b9dd9570d6573"
        //                     },
        //                     ...
        //                 ],
        //                 "abyss": [],
        //                 ...
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'return', {});
        const withdraw = this.safeValue (data, 'withdraw', {});
        const deposit = this.safeValue (data, 'deposit', {});
        let transactions = [];
        let currency = undefined;
        if (code === undefined) {
            let keys = Object.keys (withdraw);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                transactions = this.arrayConcat (transactions, withdraw[key]);
            }
            keys = Object.keys (deposit);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                transactions = this.arrayConcat (transactions, deposit[key]);
            }
        } else {
            currency = this.currency (code);
            const withdraws = this.safeValue (withdraw, currency['id'], []);
            const deposits = this.safeValue (deposit, currency['id'], []);
            transactions = this.arrayConcat (withdraws, deposits);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}) {
        /**
         * @method
         * @name indodax#withdraw
         * @description make a withdrawal
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#withdraw-coin-endpoints
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // Custom string you need to provide to identify each withdrawal.
        // Will be passed to callback URL (assigned via website to the API key)
        // so your system can identify the request and confirm it.
        // Alphanumeric, max length 255.
        const requestId = this.milliseconds ();
        // Alternatively:
        // let requestId = this.uuid ();
        const request = {
            'currency': currency['id'],
            'withdraw_amount': amount,
            'withdraw_address': address,
            'request_id': requestId.toString (),
        };
        if (tag) {
            request['withdraw_memo'] = tag;
        }
        const response = await this.privatePostWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // withdraw
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        // transHistory
        //
        //     {
        //         "status": "success",
        //         "type": "coupon",
        //         "rp": "115205",
        //         "fee": "500",
        //         "amount": "114705",
        //         "submit_time": "1539844166",
        //         "success_time": "1539844189",
        //         "withdraw_id": "1783717",
        //         "tx": "BTC-IDR-RDTVVO2P-ETD0EVAW-VTNZGMIR-HTNTUAPI-84ULM9OI",
        //         "sender": "boris",
        //         "used_by": "viginia88"
        //     }
        //
        //     {
        //         "status": "success",
        //         "btc": "0.00118769",
        //         "amount": "0.00118769",
        //         "success_time": "1539529208",
        //         "deposit_id": "3602369",
        //         "tx": "c816aeb35a5b42f389970325a32aff69bb6b2126784dcda8f23b9dd9570d6573"
        //     },
        const status = this.safeString (transaction, 'status');
        const timestamp = this.safeTimestamp2 (transaction, 'success_time', 'submit_time');
        const depositId = this.safeString (transaction, 'deposit_id');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode (undefined, currency),
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return {
            'id': this.safeString2 (transaction, 'withdraw_id', 'deposit_id'),
            'txid': this.safeString2 (transaction, 'txid', 'tx'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'withdraw_address'),
            'addressTo': undefined,
            'amount': this.safeNumberN (transaction, [ 'amount', 'withdraw_amount', 'deposit_amount' ]),
            'type': (depositId === undefined) ? 'withdraw' : 'deposit',
            'currency': this.safeCurrencyCode (undefined, currency),
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': this.safeString (transaction, 'withdraw_memo'),
            'internal': undefined,
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchDepositAddresses (codes: string[] = undefined, params = {}) {
        /**
         * @method
         * @name indodax#fetchDepositAddresses
         * @description fetch deposit addresses for multiple currencies and chain types
         * @see https://github.com/btcid/indodax-official-api-docs/blob/master/Private-RestAPI.md#general-information-on-endpoints
         * @param {string[]} [codes] list of unified currency codes, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        //
        //    {
        //        success: '1',
        //        return: {
        //            server_time: '1708031570',
        //            balance: {
        //                idr: '29952',
        //                ...
        //            },
        //            balance_hold: {
        //                idr: '0',
        //                ...
        //            },
        //            address: {
        //                btc: '1KMntgzvU7iTSgMBWc11nVuJjAyfW3qJyk',
        //                ...
        //            },
        //            memo_is_required: {
        //                btc: { mainnet: false },
        //                ...
        //            },
        //            network: {
        //                btc: 'mainnet',
        //                ...
        //            },
        //            user_id: '276011',
        //            name: '',
        //            email: 'testbitcoincoid@mailforspam.com',
        //            profile_picture: null,
        //            verification_status: 'unverified',
        //            gauth_enable: true,
        //            withdraw_status: '0'
        //        }
        //    }
        //
        const data = this.safeDict (response, 'return');
        const addresses = this.safeDict (data, 'address', {});
        const networks = this.safeDict (data, 'network', {});
        const addressKeys = Object.keys (addresses);
        const result = {
            'info': data,
        };
        for (let i = 0; i < addressKeys.length; i++) {
            const marketId = addressKeys[i];
            const code = this.safeCurrencyCode (marketId);
            const address = this.safeString (addresses, marketId);
            if ((address !== undefined) && ((codes === undefined) || (this.inArray (code, codes)))) {
                this.checkAddress (address);
                let network = undefined;
                if (marketId in networks) {
                    const networkId = this.safeString (networks, marketId);
                    if (networkId.indexOf (',') >= 0) {
                        network = [];
                        const networkIds = networkId.split (',');
                        for (let j = 0; j < networkIds.length; j++) {
                            network.push (this.networkIdToCode (networkIds[j]).toUpperCase ());
                        }
                    } else {
                        network = this.networkIdToCode (networkId).toUpperCase ();
                    }
                }
                result[code] = {
                    'info': {},
                    'currency': code,
                    'address': address,
                    'network': network,
                    'tag': undefined,
                };
            }
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            const requestPath = '/' + this.implodeParams (path, params);
            url = url + requestPath;
            if (Object.keys (query).length) {
                url += '?' + this.urlencodeWithArrayRepeat (query);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        // { success: 0, error: "invalid order." }
        // or
        // [{ data, ... }, { ... }, ... ]
        if (Array.isArray (response)) {
            return undefined; // public endpoints may return []-arrays
        }
        const error = this.safeValue (response, 'error', '');
        if (!('success' in response) && error === '') {
            return undefined; // no 'success' property on public responses
        }
        if (this.safeInteger (response, 'success', 0) === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response)) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            } else {
                return undefined;
            }
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
}
