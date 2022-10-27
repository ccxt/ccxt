'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidAddress, DuplicateOrderId, ArgumentsRequired, InsufficientFunds, InvalidOrder, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lbank2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lbank2',
            'name': 'LBank',
            'countries': [ 'CN' ],
            'version': 'v2',
            // 50 per second for making and cancelling orders 1000ms / 50 = 20
            // 20 per second for all other requests, cost = 50 / 20 = 2.5
            'rateLimit': 20,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 'minute1',
                '5m': 'minute5',
                '15m': 'minute15',
                '30m': 'minute30',
                '1h': 'hour1',
                '2h': 'hour2',
                '4h': 'hour4',
                '6h': 'hour6',
                '8h': 'hour8',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg',
                'api': {
                    'rest': 'https://api.lbank.info',
                },
                'api2': 'https://api.lbkex.com',
                'www': 'https://www.lbank.info',
                'doc': 'https://www.lbank.info/en-US/docs/index.html',
                'fees': 'https://lbankinfo.zendesk.com/hc/en-gb/articles/360012072873-Trading-Fees',
                'referral': 'https://www.lbank.info/invitevip?icode=7QCY',
            },
            'api': {
                'public': {
                    'get': {
                        'currencyPairs': 2.5,
                        'accuracy': 2.5,
                        'usdToCny': 2.5,
                        'withdrawConfigs': 2.5,
                        'timestamp': 2.5,
                        'ticker/24hr': 2.5,
                        'ticker': 2.5,
                        'depth': 2.5,
                        'incrDepth': 2.5,
                        'trades': 2.5,
                        'kline': 2.5,
                        // new quote endpoints
                        'supplement/system_ping': 2.5,
                        'supplement/incrDepth': 2.5,
                        'supplement/trades': 2.5,
                        'supplement/ticker/price': 2.5,
                        'supplement/ticker/bookTicker': 2.5,
                    },
                    'post': {
                        'supplement/system_status': 2.5,
                    },
                },
                'private': {
                    'post': {
                        // account
                        'user_info': 2.5,
                        'subscribe/get_key': 2.5,
                        'subscribe/refresh_key': 2.5,
                        'subscribe/destroy_key': 2.5,
                        'get_deposit_address': 2.5,
                        'deposit_history': 2.5,
                        // order
                        'create_order': 1,
                        'batch_create_order': 1,
                        'cancel_order': 1,
                        'cancel_clientOrders': 1,
                        'orders_info': 2.5,
                        'orders_info_history': 2.5,
                        'order_transaction_detail': 2.5,
                        'transaction_history': 2.5,
                        'orders_info_no_deal': 2.5,
                        // withdraw
                        'withdraw': 2.5,
                        'withdrawCancel': 2.5,
                        'withdraws': 2.5,
                        'supplement/user_info': 2.5,
                        'supplement/withdraw': 2.5,
                        'supplement/deposit_history': 2.5,
                        'supplement/withdraws': 2.5,
                        'supplement/get_deposit_address': 2.5,
                        'supplement/asset_detail': 2.5,
                        'supplement/customer_trade_fee': 2.5,
                        'supplement/api_Restrictions': 2.5,
                        // new quote endpoints
                        'supplement/system_ping': 2.5,
                        // new order endpoints
                        'supplement/create_order_test': 1,
                        'supplement/create_order': 1,
                        'supplement/cancel_order': 1,
                        'supplement/cancel_order_by_symbol': 1,
                        'supplement/orders_info': 2.5,
                        'supplement/orders_info_no_deal': 2.5,
                        'supplement/orders_info_history': 2.5,
                        'supplement/user_info_account': 2.5,
                        'supplement/transaction_history': 2.5,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'VET_ERC20': 'VEN',
                'PNT': 'Penta',
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'cacheSecretAsPem': true,
                'createMarketBuyOrderRequiresPrice': true,
                'fetchTrades': {
                    'method': 'publicGetTrades', // or 'publicGetTradesSupplement'
                },
                'fetchTransactionFees': {
                    'method': 'fetchPrivateTransactionFees', // or 'fetchPublicTransactionFees'
                },
                'fetchDepositAddress': {
                    'method': 'fetchDepositAddressDefault', // or fetchDepositAddressSupplement
                },
                'createOrder': {
                    'method': 'privatePostSupplementCreateOrder', // or privatePostCreateOrder
                },
                'fetchOrder': {
                    'method': 'fetchOrderSupplement', // or fetchOrderDefault
                },
                'fetchBalance': {
                    'method': 'privatePostSupplementUserInfo', // or privatePostSupplementUserInfoAccount or privatePostUserInfo
                },
                'networks': {
                    'ERC20': 'erc20',
                    'ETH': 'erc20',
                    'TRC20': 'trc20',
                    'TRX': 'trc20',
                    'OMNI': 'omni',
                    'ASA': 'asa',
                    'BEP20': 'bep20(bsc)',
                    'BSC': 'bep20(bsc)',
                    'HT': 'heco',
                    'BNB': 'bep2',
                    'BTC': 'btc',
                    'DOGE': 'dogecoin',
                    'MATIC': 'matic',
                    'POLYGON': 'matic',
                    'OEC': 'oec',
                    'BTCTRON': 'btctron',
                    'XRP': 'xrp',
                    // other unusual chains with number of listed currencies supported
                    //     'avax c-chain': 1,
                    //     klay: 12,
                    //     bta: 1,
                    //     fantom: 1,
                    //     celo: 1,
                    //     sol: 2,
                    //     zenith: 1,
                    //     ftm: 5,
                    //     bep20: 1, (single token with mis-named chain) SSS
                    //     bitci: 1,
                    //     sgb: 1,
                    //     moonbeam: 1,
                    //     ekta: 1,
                    //     etl: 1,
                    //     arbitrum: 1,
                    //     tpc: 1,
                    //     ptx: 1
                    // }
                },
                'inverse-networks': {
                    'erc20': 'ERC20',
                    'trc20': 'TRC20',
                    'omni': 'OMNI',
                    'asa': 'ASA',
                    'bep20(bsc)': 'BSC',
                    'bep20': 'BSC',
                    'heco': 'HT',
                    'bep2': 'BNB',
                    'btc': 'BTC',
                    'dogecoin': 'DOGE',
                    'matic': 'MATIC',
                    'oec': 'OEC',
                    'btctron': 'BTCTRON',
                    'xrp': 'XRP',
                },
                'defaultNetworks': {
                    'USDT': 'TRC20',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name lbank2#fetchMarkets
         * @description retrieves data on all markets for lbank2
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        // needs to return a list of unified market structures
        const response = await this.publicGetAccuracy ();
        const data = this.safeValue (response, 'data');
        //      [
        //          {
        //              symbol: 'snx3s_usdt',
        //              quantityAccuracy: '2',
        //              minTranQua: '0.01',
        //              priceAccuracy: '6'
        //          }
        //     ]
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('_');
            const baseId = parts[0];
            const quoteId = parts[1];
            const base = baseId.toUpperCase ();
            const quote = quoteId.toUpperCase ();
            let symbol = base + '/' + quote;
            const productTypes = {
                '3l': true,
                '5l': true,
                '3s': true,
                '5s': true,
            };
            const ending = baseId.slice (-2);
            const isLeveragedProduct = this.safeValue (productTypes, ending, false);
            if (isLeveragedProduct) {
                symbol += ':' + quote;
            }
            let linear = undefined;
            if (isLeveragedProduct === true) {
                linear = true;
            }
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': isLeveragedProduct,
                'future': false,
                'option': false,
                'active': true,
                'contract': isLeveragedProduct,
                'linear': linear, // all leveraged ETF products are in USDT
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityAccuracy'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'priceAccuracy'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minTranQua'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
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
        //      {
        //          "symbol":"btc_usdt",
        //          "ticker": {
        //              "high":40200.88,
        //              "vol":7508.3096,
        //              "low":38239.38,
        //              "change":0.75,
        //              "turnover":292962771.34,
        //              "latest":39577.95
        //               },
        //           "timestamp":1647005189792
        //      }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const tickerData = this.safeValue (ticker, 'ticker');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (tickerData, 'high'),
            'low': this.safeString (tickerData, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (tickerData, 'latest'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (tickerData, 'change'),
            'average': undefined,
            'baseVolume': this.safeString (tickerData, 'vol'),
            'quoteVolume': this.safeString (tickerData, 'turnover'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name lbank2#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        //
        //      {
        //          "result":"true",
        //          "data": [
        //              {
        //                  "symbol":"btc_usdt",
        //                  "ticker":{
        //                          "high":40200.88,
        //                          "vol":7508.3096,
        //                          "low":38239.38,
        //                          "change":0.75,
        //                          "turnover":292962771.34,
        //                          "latest":39577.95
        //                      },
        //                  "timestamp":1647005189792
        //               }
        //                   ],
        //          "error_code":0,"ts":1647005190755
        //      }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        return this.parseTicker (first, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the lbank api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {
            'symbol': 'all',
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 60;
        }
        const request = {
            'symbol': market['id'],
            'size': limit,
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        const orderbook = response['data'];
        const timestamp = this.milliseconds ();
        return this.parseOrderBook (orderbook, market['symbol'], timestamp);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (old) publicGetTrades
        //
        //      {
        //          "date_ms":1647021989789,
        //          "amount":0.0028,
        //          "price":38804.2,
        //          "type":"buy",
        //          "tid":"52d5616ee35c43019edddebe59b3e094"
        //      }
        //
        //
        // fetchTrades (new) publicGetTradesSupplement
        //
        //      {
        //          "quoteQty":1675.048485,
        //          "price":0.127545,
        //          "qty":13133,
        //          "id":"3589541dc22e4357b227283650f714e2",
        //          "time":1648058297110,
        //          "isBuyerMaker":false
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "orderUuid":"38b4e7a4-14f6-45fd-aba1-1a37024124a0",
        //          "tradeFeeRate":0.0010000000,
        //          "dealTime":1648500944496,
        //          "dealQuantity":30.00000000000000000000,
        //          "tradeFee":0.00453300000000000000,
        //          "txUuid":"11f3850cc6214ea3b495adad3a032794",
        //          "dealPrice":0.15111300000000000000,
        //          "dealVolumePrice":4.53339000000000000000,
        //          "tradeType":"sell_market"
        //      }
        //
        let timestamp = this.safeInteger2 (trade, 'date_ms', 'time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'dealTime');
        }
        let amountString = this.safeString2 (trade, 'amount', 'qty');
        if (amountString === undefined) {
            amountString = this.safeString (trade, 'dealQuantity');
        }
        let priceString = this.safeString (trade, 'price');
        if (priceString === undefined) {
            priceString = this.safeString (trade, 'dealPrice');
        }
        let costString = this.safeString (trade, 'quoteQty');
        if (costString === undefined) {
            costString = this.safeString (trade, 'dealVolumePrice');
        }
        let side = this.safeString2 (trade, 'tradeType', 'type');
        let type = undefined;
        let takerOrMaker = undefined;
        if (side !== undefined) {
            const parts = side.split ('_');
            side = this.safeString (parts, 0);
            const typePart = this.safeString (parts, 1);
            type = 'limit';
            takerOrMaker = 'taker';
            if (typePart !== undefined) {
                if (typePart === 'market') {
                    type = 'market';
                } else if (typePart === 'maker') {
                    takerOrMaker = 'maker';
                }
            }
        }
        let id = this.safeString2 (trade, 'tid', 'id');
        if (id === undefined) {
            id = this.safeString (trade, 'txUuid');
        }
        const order = this.safeString (trade, 'orderUuid');
        const symbol = this.safeSymbol (undefined, market);
        let fee = undefined;
        const feeCost = this.safeString (trade, 'tradeFee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
                'rate': this.safeString (trade, 'tradeFeeRate'),
            };
        }
        return this.safeTrade ({
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['time'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        } else {
            request['size'] = 600; // max
        }
        let method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchTrades', {});
            method = this.safeString (options, 'method', 'publicGetTrades');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //      {
        //          "result":"true",
        //          "data": [
        //              {
        //                  "date_ms":1647021989789,
        //                  "amount":0.0028,
        //                  "price":38804.2,
        //                  "type":"buy",
        //                  "tid":"52d5616ee35c43019edddebe59b3e094"
        //               }
        //           ],
        //           "error_code":0,
        //           "ts":1647021999308
        //      }
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //   [
        //     1482311500, // timestamp
        //     5423.23,    // open
        //     5472.80,    // high
        //     5516.09,    // low
        //     5462,       // close
        //     234.3250    // volume
        //   ],
        //
        return [
            this.safeTimestamp (ohlcv, 0), // timestamp
            this.safeNumber (ohlcv, 1), // open
            this.safeNumber (ohlcv, 2), // high
            this.safeNumber (ohlcv, 3), // low
            this.safeNumber (ohlcv, 4), // close
            this.safeNumber (ohlcv, 5), // volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        // endpoint doesnt work
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        if (since === undefined) {
            const duration = this.parseTimeframe (timeframe);
            since = this.milliseconds () - duration * 1000 * limit;
        }
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'time': parseInt (since / 1000),
            'size': limit, // max 2000
        };
        const response = await this.publicGetKline (this.extend (request, params));
        const ohlcvs = this.safeValue (response, 'data', []);
        //
        //
        // [
        //   [
        //     1482311500,
        //     5423.23,
        //     5472.80,
        //     5516.09,
        //     5462,
        //     234.3250
        //   ],
        //   [
        //     1482311400,
        //     5432.52,
        //     5459.87,
        //     5414.30,
        //     5428.23,
        //     213.7329
        //   ]
        // ]
        //
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseBalance (response) {
        //
        // privatePostUserInfo
        //
        //      {
        //          "toBtc": {
        //              "egc:": "0",
        //              "iog": "0",
        //              "ksm": "0",
        //              },
        //          "freeze": {
        //              "egc": "0",
        //              "iog": "0",
        //              "ksm": "0" ,
        //              },
        //          "asset": {
        //              "egc": "0",
        //              "iog": "0",
        //              "ksm": "0",
        //              },
        //          "free": {
        //              "egc": "0",
        //              "iog": "0",
        //              "ksm": "0",
        //              }
        //      }
        //
        // privatePostSupplementUserInfoAccount
        //
        //      {
        //          "balances":[
        //              {
        //                  "asset":"lbk",
        //                  "free":"0",
        //                  "locked":"0"
        //              }, ...
        //          ]
        //      }
        //
        // privatePostSupplementUserInfo
        //
        //      [
        //          {
        //              "usableAmt":"31.45130723",
        //              "assetAmt":"31.45130723",
        //              "networkList":[
        //                  {
        //                      "isDefault":true,
        //                      "withdrawFeeRate":"",
        //                      "name":"bep20(bsc)",
        //                      "withdrawMin":30,
        //                      "minLimit":0.0001,
        //                      "minDeposit":0.0001,
        //                      "feeAssetCode":"doge",
        //                      "withdrawFee":"30",
        //                      "type":1,
        //                      "coin":"doge",
        //                      "network":"bsc"
        //                  },
        //                  {
        //                      "isDefault":false,
        //                      "withdrawFeeRate":"",
        //                      "name":"dogecoin",
        //                      "withdrawMin":10,
        //                      "minLimit":0.0001,
        //                      "minDeposit":10,
        //                      "feeAssetCode":"doge",
        //                      "withdrawFee":"10",
        //                      "type":1,
        //                      "coin":"doge",
        //                      "network":"dogecoin"
        //                  }
        //              ],
        //              "freezeAmt":"0",
        //              "coin":"doge"
        //          }, ...
        //      ]
        //
        const timestamp = this.safeInteger (response, 'ts');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const data = this.safeValue (response, 'data');
        // from privatePostUserInfo
        const toBtc = this.safeValue (data, 'toBtc');
        if (toBtc !== undefined) {
            const used = this.safeValue (data, 'freeze', {});
            const free = this.safeValue (data, 'free', {});
            const currencies = Object.keys (free);
            for (let i = 0; i < currencies.length; i++) {
                const currencyId = currencies[i];
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['used'] = this.safeString (used, currencyId);
                account['free'] = this.safeString (free, currencyId);
                result[code] = account;
            }
            return this.safeBalance (result);
        }
        // from privatePostSupplementUserInfoAccount
        const balances = this.safeValue (data, 'balances');
        if (balances !== undefined) {
            for (let i = 0; i < balances.length; i++) {
                const item = balances[i];
                const currencyId = this.safeString (item, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (item, 'free');
                account['used'] = this.safeString (item, 'locked');
                result[code] = account;
            }
            return this.safeBalance (result);
        }
        // from privatePostSupplementUserInfo
        const isArray = Array.isArray (data);
        if (isArray === true) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const currencyId = this.safeString (item, 'coin');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (item, 'usableAmt');
                account['used'] = this.safeString (item, 'freezeAmt');
                result[code] = account;
            }
            return this.safeBalance (result);
        }
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name lbank2#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let method = this.safeString (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchBalance', {});
            method = this.safeString (options, 'method', 'privatePostSupplementUserInfo');
        }
        const response = await this[method] ();
        //
        //    {
        //        "result": "true",
        //        "data": [
        //            {
        //                "usableAmt": "14.36",
        //                "assetAmt": "14.36",
        //                "networkList": [
        //                    {
        //                        "isDefault": false,
        //                        "withdrawFeeRate": "",
        //                        "name": "erc20",
        //                        "withdrawMin": 30,
        //                        "minLimit": 0.0001,
        //                        "minDeposit": 20,
        //                        "feeAssetCode": "usdt",
        //                        "withdrawFee": "30",
        //                        "type": 1,
        //                        "coin": "usdt",
        //                        "network": "eth"
        //                    },
        //                    ...
        //                ],
        //                "freezeAmt": "0",
        //                "coin": "ada"
        //            }
        //        ],
        //        "code": 0
        //    }
        //
        return this.parseBalance (response);
    }

    parseTradingFee (fee, market = undefined) {
        //
        //      {
        //          "symbol":"skt_usdt",
        //          "makerCommission":"0.10",
        //          "takerCommission":"0.10"
        //      }
        //
        const marketId = this.safeString (fee, 'symbol');
        const symbol = this.safeSymbol (marketId);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'makerCommission'),
            'taker': this.safeNumber (fee, 'takerCommission'),
        };
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name lbank2#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        const market = this.market (symbol);
        const result = await this.fetchTradingFees (this.extend (params, { 'category': market['id'] }));
        return result;
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name lbank2#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const request = {};
        const response = await this.privatePostSupplementCustomerTradeFee (this.extend (request, params));
        const fees = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee (fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const clientOrderId = this.safeString2 (params, 'custom_id', 'clientOrderId');
        const postOnly = this.safeValue (params, 'postOnly', false);
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        params = this.omit (params, [ 'custom_id', 'clientOrderId', 'timeInForce', 'postOnly' ]);
        const request = {
            'symbol': market['id'],
        };
        const ioc = (timeInForce === 'IOC');
        const fok = (timeInForce === 'FOK');
        const maker = (postOnly || (timeInForce === 'PO'));
        if ((type === 'market') && (ioc || fok || maker)) {
            throw new InvalidOrder (this.id + ' createOrder () does not allow market FOK, IOC, or postOnly orders. Only limit IOC, FOK, and postOnly orders are allowed');
        }
        if (type === 'limit') {
            request['type'] = side;
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
            if (ioc) {
                request['type'] = side + '_' + 'ioc';
            } else if (fok) {
                request['type'] = side + '_' + 'fok';
            } else if (maker) {
                request['type'] = side + '_' + 'maker';
            }
        } else if (type === 'market') {
            if (side === 'sell') {
                request['type'] = side + '_' + 'market';
                request['amount'] = this.amountToPrecision (symbol, amount);
            } else if (side === 'buy') {
                request['type'] = side + '_' + 'market';
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder () requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply the price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteAmount = Precise.stringMul (amountString, priceString);
                        const cost = this.parseNumber (quoteAmount);
                        request['price'] = this.priceToPrecision (symbol, cost);
                    }
                } else {
                    request['price'] = amount;
                }
            }
        }
        if (clientOrderId !== undefined) {
            request['custom_id'] = clientOrderId;
        }
        let method = undefined;
        method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'createOrder', {});
            method = this.safeString (options, 'method', 'privatePostSupplementCreateOrder');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "symbol":"doge_usdt",
        //              "order_id":"0cf8a3de-4597-4296-af45-be7abaa06b07"
        //              },
        //          "error_code":0,
        //          "ts":1648162321043
        //      }
        //
        const result = this.safeValue (response, 'data', {});
        return {
            'id': this.safeString (result, 'order_id'),
            'info': result,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'canceled', // canceled
            '0': 'open', // not traded
            '1': 'open', // partial deal
            '2': 'closed', // complete deal
            '3': 'canceled', // filled partially and cancelled
            '4': 'closed', // disposal processing
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrderSupplement (private)
        //
        //      {
        //          "cummulativeQuoteQty":0,
        //          "symbol":"doge_usdt",
        //          "executedQty":0,
        //          "orderId":"53d2d53e-70fb-4398-b722-f48571a5f61e",
        //          "origQty":1E+2,
        //          "price":0.05,
        //          "clientOrderId":null,
        //          "origQuoteOrderQty":5,
        //          "updateTime":1648163406000,
        //          "time":1648163139387,
        //          "type":"buy_maker",
        //          "status":-1
        //      }
        //
        //
        // fetchOrderDefault (private)
        //
        //      {
        //          "symbol":"shib_usdt",
        //          "amount":1,
        //          "create_time":1649367863356,
        //          "price":0.0000246103,
        //          "avg_price":0.00002466180000000104,
        //          "type":"buy_market",
        //          "order_id":"abe8b92d-86d9-4d6d-b71e-d14f5fb53ddf",
        //          "custom_id": "007",                                 // field only present if user creates it at order time
        //          "deal_amount":40548.54065802,
        //          "status":2
        //      }
        //
        // fetchOpenOrders (private)
        //
        //      {
        //          "cummulativeQuoteQty":0,
        //          "symbol":"doge_usdt",
        //          "executedQty":0,
        //          "orderId":"73878edf-008d-4e4c-8041-df1f1b2cd8bb",
        //          "origQty":100,
        //          "price":0.05,
        //          "origQuoteOrderQty":5,
        //          "updateTime":1648501762000,
        //          "time":1648501762353,
        //          "type":"buy",
        //          "status":0
        //      }
        //
        // fetchOrders (private)
        //
        //      {
        //          "cummulativeQuoteQty":0,
        //          "symbol":"doge_usdt",
        //          "executedQty":0,
        //          "orderId":"2cadc7cc-b5f6-486b-a5b4-d6ac49a9c186",
        //          "origQty":100,
        //          "price":0.05,
        //          "origQuoteOrderQty":5,
        //          "updateTime":1648501384000,
        //          "time":1648501363889,
        //          "type":"buy",
        //          "status":-1
        //      }
        //
        const id = this.safeString2 (order, 'orderId', 'order_id');
        const clientOrderId = this.safeString2 (order, 'clientOrderId', 'custom_id');
        const timestamp = this.safeInteger2 (order, 'time', 'create_time');
        const rawStatus = this.safeString (order, 'status');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        let timeInForce = undefined;
        let postOnly = false;
        let type = 'limit';
        const rawType = this.safeString (order, 'type'); // buy, sell, buy_market, sell_market, buy_maker,sell_maker,buy_ioc,sell_ioc, buy_fok, sell_fok
        const parts = rawType.split ('_');
        const side = this.safeString (parts, 0);
        const typePart = this.safeString (parts, 1); // market, maker, ioc, fok or undefined (limit)
        if (typePart === 'market') {
            type = 'market';
        }
        if (typePart === 'maker') {
            postOnly = true;
            timeInForce = 'PO';
        }
        if (typePart === 'ioc') {
            timeInForce = 'IOC';
        }
        if (typePart === 'fok') {
            timeInForce = 'FOK';
        }
        const price = this.safeString (order, 'price');
        const costString = this.safeString (order, 'cummulativeQuoteQty');
        let amountString = undefined;
        if (rawType !== 'buy_market') {
            amountString = this.safeString2 (order, 'origQty', 'amount');
        }
        const filledString = this.safeString2 (order, 'executedQty', 'deal_amount');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (rawStatus),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': costString,
            'amount': amountString,
            'filled': filledString,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let method = this.safeString (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchOrder', {});
            method = this.safeString (options, 'method', 'fetchOrderSupplement');
        }
        const result = await this[method] (id, symbol, params);
        return result;
    }

    async fetchOrderSupplement (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder () requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this.privatePostSupplementOrdersInfo (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "cummulativeQuoteQty":0,
        //              "symbol":"doge_usdt",
        //              "executedQty":0,
        //              "orderId":"53d2d53e-70fb-4398-b722-f48571a5f61e",
        //              "origQty":1E+2,
        //              "price":0.05,
        //              "clientOrderId":null,
        //              "origQuoteOrderQty":5,
        //              "updateTime":1648163406000,
        //              "time":1648163139387,
        //              "type":"buy_maker",
        //              "status":-1
        //              },
        //          "error_code":0,
        //          "ts":1648164471827
        //      }
        //
        const result = this.safeValue (response, 'data', {});
        return this.parseOrder (result);
    }

    async fetchOrderDefault (id, symbol = undefined, params = {}) {
        // Id can be a list of ids delimited by a comma
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder () requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostOrdersInfo (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":[
        //              {
        //                  "symbol":"doge_usdt",
        //                  "amount":18,
        //                  "create_time":1647455223186,
        //                  "price":0,
        //                  "avg_price":0.113344,
        //                  "type":"sell_market",
        //                  "order_id":"d4ca1ddd-40d9-42c1-9717-5de435865bec",
        //                  "deal_amount":18,
        //                  "status":2
        //                }
        //            ],
        //          "error_code":0,
        //          "ts":1647455270776
        //      }
        //
        const result = this.safeValue (response, 'data', []);
        const numOrders = result.length;
        if (numOrders === 1) {
            return this.parseOrder (result[0]);
        } else {
            const parsedOrders = [];
            for (let i = 0; i < numOrders; i++) {
                const parsedOrder = this.parseOrder (result[i]);
                parsedOrders.push (parsedOrder);
            }
            return parsedOrders;
        }
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades () requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        since = this.safeValue (params, 'start_date', since);
        params = this.omit (params, 'start_date');
        const request = {
            'symbol': market['id'],
            // 'start_date': String Start time yyyy-mm-dd, the maximum is today, the default is yesterday
            // 'end_date': String Finish time yyyy-mm-dd, the maximum is today, the default is today
            // 'The start': and end date of the query window is up to 2 days
            // 'from': String Initial transaction number inquiring
            // 'direct': String inquire direction,The default is the 'next' which is the positive sequence of dealing time，the 'prev' is inverted order of dealing time
            // 'size': String Query the number of defaults to 100
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        if (since !== undefined) {
            request['start_date'] = this.ymd (since, '-'); // max query 2 days ago
        }
        const response = await this.privatePostTransactionHistory (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":[
        //              {
        //                  "orderUuid":"38b4e7a4-14f6-45fd-aba1-1a37024124a0",
        //                  "tradeFeeRate":0.0010000000,
        //                  "dealTime":1648500944496,
        //                  "dealQuantity":30.00000000000000000000,
        //                  "tradeFee":0.00453300000000000000,
        //                  "txUuid":"11f3850cc6214ea3b495adad3a032794",
        //                  "dealPrice":0.15111300000000000000,
        //                  "dealVolumePrice":4.53339000000000000000,
        //                  "tradeType":"sell_market"
        //              }
        //          ],
        //          "error_code":0,
        //          "ts":1648509742164
        //      }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        // default query is for canceled and completely filled orders
        // does not return open orders unless specified explicitly
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
            // 'status'  -1: Cancelled, 0: Unfilled, 1: Partially filled, 2: Completely filled, 3: Partially filled and cancelled, 4: Cancellation is being processed
        };
        const response = await this.privatePostSupplementOrdersInfoHistory (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "total":1,
        //              "page_length":100,
        //              "orders":[
        //                  {
        //                      "cummulativeQuoteQty":0,
        //                      "symbol":"doge_usdt",
        //                      "executedQty":0,
        //                      "orderId":"2cadc7cc-b5f6-486b-a5b4-d6ac49a9c186",
        //                      "origQty":100,
        //                      "price":0.05,
        //                      "origQuoteOrderQty":5,
        //                      "updateTime":1648501384000,
        //                      "time":1648501363889,
        //                      "type":"buy",
        //                      "status":-1
        //                  }, ...
        //              ],
        //              "current_page":1
        //          },
        //          "error_code":0,
        //          "ts":1648505706348
        //      }
        //
        const result = this.safeValue (response, 'data', {});
        const orders = this.safeValue (result, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
        };
        const response = await this.privatePostSupplementOrdersInfoNoDeal (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "total":1,
        //              "page_length":100,
        //              "orders":[
        //                  {
        //                      "cummulativeQuoteQty":0,
        //                      "symbol":"doge_usdt",
        //                      "executedQty":0,
        //                      "orderId":"73878edf-008d-4e4c-8041-df1f1b2cd8bb",
        //                      "origQty":100,
        //                      "price":0.05,
        //                      "origQuoteOrderQty":5,
        //                      "updateTime":1648501762000,
        //                      "time":1648501762353,
        //                      "type":"buy",
        //                      "status":0
        //                  }, ...
        //             ],
        //             "current_page":1
        //         },
        //         "error_code":0,
        //         "ts":1648506110196
        //     }
        //
        const result = this.safeValue (response, 'data', {});
        const orders = this.safeValue (result, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const clientOrderId = this.safeString2 (params, 'origClientOrderId', 'clientOrderId');
        params = this.omit (params, [ 'origClientOrderId', 'clientOrderId' ]);
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        request['orderId'] = id;
        const response = await this.privatePostSupplementCancelOrder (this.extend (request, params));
        //
        //   {
        //      "result":true,
        //      "data":{
        //          "executedQty":0.0,
        //          "price":0.05,
        //          "origQty":100.0,
        //          "tradeType":"buy",
        //          "status":0
        //          },
        //      "error_code":0,
        //      "ts":1648501286196
        //  }
        const result = this.safeValue (response, 'data', {});
        return result;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostSupplementCancelOrderBySymbol (this.extend (request, params));
        //
        //      {
        //          "result":"true",
        //          "data":[
        //              {
        //                  "executedQty":0.00000000000000000000,
        //                  "orderId":"293ef71b-3e67-4962-af93-aa06990a045f",
        //                  "price":0.05000000000000000000,
        //                  "origQty":100.00000000000000000000,
        //                  "tradeType":"buy",
        //                  "status":0
        //              },
        //          ],
        //          "error_code":0,
        //          "ts":1648506641469
        //      }
        //
        const result = this.safeValue (response, 'data', []);
        return result;
    }

    getNetworkCodeForCurrency (currencyCode, params) {
        const defaultNetworks = this.safeValue (this.options, 'defaultNetworks');
        const defaultNetwork = this.safeStringUpper (defaultNetworks, currencyCode);
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network', defaultNetwork); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ERC20>ETH alias
        return network;
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name lbank2#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        let method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchDepositAddress', {});
            method = this.safeString (options, 'method', 'fetchPrivateTradingFees');
        }
        return await this[method] (code, params);
    }

    async fetchDepositAddressDefault (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'assetCode': currency['id'],
        };
        const network = this.getNetworkCodeForCurrency (code, params);
        if (network !== undefined) {
            request['netWork'] = network; // ... yes, really lol
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostGetDepositAddress (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "assetCode":"usdt",
        //              "address":"0xc85689d37ca650bf2f2161364cdedee21eb6ca53",
        //              "memo":null,
        //              "netWork":"bep20(bsc)"
        //              },
        //          "error_code":0,
        //          "ts":1648075865103
        //      }
        //
        const result = this.safeValue (response, 'data');
        const address = this.safeString (result, 'address');
        const tag = this.safeString (result, 'memo');
        const networkId = this.safeString (result, 'netWork');
        const inverseNetworks = this.safeValue (this.options, 'inverse-networks', {});
        const networkCode = this.safeStringUpper (inverseNetworks, networkId, networkId);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkCode,
            'info': response,
        };
    }

    async fetchDepositAddressSupplement (code, params = {}) {
        // returns the address for whatever the default network is...
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const networks = this.safeValue (this.options, 'networks');
        let network = this.safeStringUpper (params, 'network');
        network = this.safeString (networks, network, network);
        if (network !== undefined) {
            request['networkName'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostSupplementGetDepositAddress (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data":{
        //              "address":"TDxtabCC8iQwaxUUrPcE4WL2jArGAfvQ5A",
        //              "memo":null,
        //              "coin":"usdt"
        //              },
        //          "error_code":0,
        //          "ts":1648073818880
        //     }
        //
        const result = this.safeValue (response, 'data');
        const address = this.safeString (result, 'address');
        const tag = this.safeString (result, 'memo');
        const inverseNetworks = this.safeValue (this.options, 'inverse-networks', {});
        const networkCode = this.safeStringUpper (inverseNetworks, network, network);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkCode, // will be undefined if not specified in request
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const fee = this.safeString (params, 'fee');
        params = this.omit (params, 'fee');
        if (fee === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw () requires a fee argument to be supplied in params, the relevant coin network fee can be found by calling fetchTransactionFees (), note: if no network param is supplied then the default network will be used, this can also be found in fetchTransactionFees ()');
        }
        const currency = this.currency (code);
        const request = {
            'address': address,
            'coin': currency['id'],
            'amount': amount,
            'fee': fee, // the correct coin-network fee must be supplied, which can be found by calling fetchTransactionFees (private)
            // 'networkName': defaults to the defaultNetwork of the coin which can be found in the /supplement/user_info endpoint
            // 'memo': memo: memo word of bts and dct
            // 'mark': Withdrawal Notes
            // 'name': Remarks of the address. After filling in this parameter, it will be added to the withdrawal address book of the currency.
            // 'withdrawOrderId': withdrawOrderId
            // 'type': type=1 is for intra-site transfer
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const network = this.safeStringUpper2 (params, 'network', 'networkName');
        params = this.omit (params, [ 'network', 'networkName' ]);
        const networks = this.safeValue (this.options, 'networks');
        const networkId = this.safeString (networks, network, network);
        if (networkId !== undefined) {
            request['networkName'] = networkId;
        }
        const response = await this.privatePostSupplementWithdraw (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data": {
        //              "fee":10.00000000000000000000,
        //              "withdrawId":1900376
        //              },
        //          "error_code":0,
        //          "ts":1648992501414
        //      }
        //
        const result = this.safeValue (response, 'data', {});
        return {
            'info': result,
            'id': this.safeString (result, 'withdrawId'),
        };
    }

    parseTransactionStatus (status, type) {
        const statuses = {
            'deposit': {
                '1': 'pending',
                '2': 'ok',
                '3': 'failed',
                '4': 'canceled',
                '5': 'transfer',
            },
            'withdrawal': {
                '1': 'pending',
                '2': 'canceled',
                '3': 'failed',
                '4': 'ok',
            },
        };
        return this.safeString (this.safeValue (statuses, type, {}), status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits (private)
        //
        //      {
        //          "insertTime":1649012310000,
        //          "amount":9.00000000000000000000,
        //          "address":"TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
        //          "networkName":"trc20",
        //          "txId":"081e4e9351dd0274922168da5f2d14ea6c495b1c3b440244f4a6dd9fe196bf2b",
        //          "coin":"usdt",
        //          "status":"2"
        //      }
        //
        //
        // fetchWithdrawals (private)
        //
        //      {
        //          "amount":2.00000000000000000000,
        //          "address":"TBjrW5JHDyPZjFc5nrRMhRWUDaJmhGhmD6",
        //          "fee":1.00000000000000000000,
        //          "networkName":"trc20",
        //          "coid":"usdt",
        //          "transferType":"数字资产提现",
        //          "txId":"47eeee2763ad49b8817524dacfa7d092fb58f8b0ab7e5d25473314df1a793c3d",
        //          "id":1902194,
        //          "applyTime":1649014002000,
        //          "status":"4"
        //      }
        //
        const id = this.safeString (transaction, 'id');
        let type = undefined;
        if (id === undefined) {
            type = 'deposit';
        } else {
            type = 'withdrawal';
        }
        const txid = this.safeString (transaction, 'txId');
        const timestamp = this.safeInteger2 (transaction, 'insertTime', 'applyTime');
        const networks = this.safeValue (this.options, 'inverse-networks', {});
        const networkId = this.safeString (transaction, 'networkName');
        const network = this.safeString (networks, networkId, networkId);
        const address = this.safeString (transaction, 'address');
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'deposit') {
            addressFrom = address;
        } else {
            addressTo = address;
        }
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString2 (transaction, 'coin', 'coid');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'), type);
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': undefined,
            'internal': (status === 'transfer'),
            'fee': fee,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'status': Recharge status: ("1","Applying"),("2","Recharge successful"),("3","Recharge failed"),("4","Already Cancel"), ("5", "Transfer")
            // 'endTime': end time, timestamp in milliseconds, default now
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privatePostSupplementDepositHistory (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data": {
        //              "total":1,
        //              "depositOrders": [
        //                  {
        //                      "insertTime":1649012310000,
        //                      "amount":9.00000000000000000000,
        //                      "address":"TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
        //                      "networkName":"trc20",
        //                      "txId":"081e4e9351dd0274922168da5f2d14ea6c495b1c3b440244f4a6dd9fe196bf2b",
        //                      "coin":"usdt",
        //                      "status":"2"
        //                  },
        //              ],
        //              "page_length":20,
        //              "current_page":1
        //          },
        //          "error_code":0,
        //          "ts":1649719721758
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const deposits = this.safeValue (data, 'depositOrders', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'status': Recharge status: ("1","Applying"),("2","Recharge successful"),("3","Recharge failed"),("4","Already Cancel"), ("5", "Transfer")
            // 'endTime': end time, timestamp in milliseconds, default now
            // 'withdrawOrderId': Custom withdrawal id
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privatePostSupplementWithdraws (this.extend (request, params));
        //
        //      {
        //          "result":true,
        //          "data": {
        //              "total":1,
        //              "withdraws": [
        //                  {
        //                      "amount":2.00000000000000000000,
        //                      "address":"TBjrW5JHDyPZjFc5nrRMhRWUDaJmhGhmD6",
        //                      "fee":1.00000000000000000000,
        //                      "networkName":"trc20",
        //                      "coid":"usdt",
        //                      "transferType":"数字资产提现",
        //                      "txId":"47eeee2763ad49b8817524dacfa7d092fb58f8b0ab7e5d25473314df1a793c3d",
        //                      "id":1902194,
        //                      "applyTime":1649014002000,
        //                      "status":"4"
        //                  },
        //              ],
        //              "page_length":20,
        //              "current_page":1
        //          },
        //          "error_code":0,
        //          "ts":1649720362362
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const withdraws = this.safeValue (data, 'withdraws', []);
        return this.parseTransactions (withdraws, currency, since, limit);
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name lbank2#fetchTransactionFees
         * @description fetch transaction fees
         * @param {[string]|undefined} codes not used by lbank2 fetchTransactionFees ()
         * @param {object} params extra parameters specific to the lbank2 api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        // private only returns information for currencies with non-zero balance
        await this.loadMarkets ();
        const isAuthorized = this.checkRequiredCredentials (false);
        let result = undefined;
        if (isAuthorized === true) {
            let method = this.safeString (params, 'method');
            params = this.omit (params, 'method');
            if (method === undefined) {
                const options = this.safeValue (this.options, 'fetchTransactionFees', {});
                method = this.safeString (options, 'method', 'fetchPrivateTransactionFees');
            }
            result = await this[method] (params);
        } else {
            result = await this.fetchPublicTransactionFees (params);
        }
        return result;
    }

    async fetchPrivateTransactionFees (params = {}) {
        // complete response
        // incl. for coins which undefined in public method
        await this.loadMarkets ();
        const response = await this.privatePostSupplementUserInfo ();
        //
        //    {
        //        "result": "true",
        //        "data": [
        //            {
        //                "usableAmt": "14.36",
        //                "assetAmt": "14.36",
        //                "networkList": [
        //                    {
        //                        "isDefault": false,
        //                        "withdrawFeeRate": "",
        //                        "name": "erc20",
        //                        "withdrawMin": 30,
        //                        "minLimit": 0.0001,
        //                        "minDeposit": 20,
        //                        "feeAssetCode": "usdt",
        //                        "withdrawFee": "30",
        //                        "type": 1,
        //                        "coin": "usdt",
        //                        "network": "eth"
        //                    },
        //                    ...
        //                ],
        //                "freezeAmt": "0",
        //                "coin": "ada"
        //            }
        //        ],
        //        "code": 0
        //    }
        //
        const result = this.safeValue (response, 'data', []);
        const withdrawFees = {};
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const currencyId = this.safeString (entry, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const networkList = this.safeValue (entry, 'networkList', []);
            withdrawFees[code] = {};
            for (let j = 0; j < networkList.length; j++) {
                const networkEntry = networkList[j];
                const networkId = this.safeString (networkEntry, 'name');
                const networkCode = this.safeString (this.options['inverse-networks'], networkId, networkId);
                const fee = this.safeNumber (networkEntry, 'withdrawFee');
                if (fee !== undefined) {
                    withdrawFees[code][networkCode] = fee;
                }
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async fetchPublicTransactionFees (params = {}) {
        // extremely incomplete response
        // vast majority fees undefined
        await this.loadMarkets ();
        const code = this.safeString2 (params, 'coin', 'assetCode');
        params = this.omit (params, [ 'coin', 'assetCode' ]);
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code);
            request['assetCode'] = currency['id'];
        }
        const response = await this.publicGetWithdrawConfigs (this.extend (request, params));
        //
        //    {
        //        result: 'true',
        //        data: [
        //          {
        //            amountScale: '4',
        //            chain: 'heco',
        //            assetCode: 'lbk',
        //            min: '200',
        //            transferAmtScale: '4',
        //            canWithDraw: true,
        //            fee: '100',
        //            minTransfer: '0.0001',
        //            type: '1'
        //          },
        //          ...
        //        ],
        //        error_code: '0',
        //        ts: '1663364435973'
        //    }
        //
        const result = this.safeValue (response, 'data', []);
        const withdrawFees = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const canWithdraw = this.safeString (item, 'canWithDraw');
            if (canWithdraw === 'true') {
                const currencyId = this.safeString (item, 'assetCode');
                const code = this.safeCurrencyCode (currencyId);
                const chain = this.safeString (item, 'chain');
                let network = this.safeString (this.options['inverse-networks'], chain, chain);
                if (network === undefined) {
                    network = code;
                }
                const fee = this.safeString (item, 'fee');
                if (withdrawFees[code] === undefined) {
                    withdrawFees[code] = {};
                }
                withdrawFees[code][network] = this.parseNumber (fee);
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + this.implodeParams (path, params);
        // Every endpoint ends with ".do"
        url += '.do';
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (this.keysort (query));
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            const echostr = this.uuid22 () + this.uuid16 ();
            query = this.extend ({
                'api_key': this.apiKey,
            }, query);
            let signatureMethod = undefined;
            if (this.secret.length > 32) {
                signatureMethod = 'RSA';
            } else {
                signatureMethod = 'HmacSHA256';
            }
            const auth = this.rawencode (this.keysort (this.extend ({
                'echostr': echostr,
                'signature_method': signatureMethod,
                'timestamp': timestamp,
            }, query)));
            const encoded = this.encode (auth);
            const hash = this.hash (encoded);
            const uppercaseHash = hash.toUpperCase ();
            let sign = undefined;
            if (signatureMethod === 'RSA') {
                const cacheSecretAsPem = this.safeValue (this.options, 'cacheSecretAsPem', true);
                let pem = undefined;
                if (cacheSecretAsPem) {
                    pem = this.safeValue (this.options, 'pem');
                    if (pem === undefined) {
                        pem = this.convertSecretToPem (this.encode (this.secret));
                        this.options['pem'] = pem;
                    }
                } else {
                    pem = this.convertSecretToPem (this.encode (this.secret));
                }
                const encodedPem = this.encode (pem);
                sign = this.binaryToBase64 (this.rsa (uppercaseHash, encodedPem, 'RS256'));
            } else if (signatureMethod === 'HmacSHA256') {
                sign = this.hmac (this.encode (uppercaseHash), this.encode (this.secret));
            }
            query['sign'] = sign;
            body = this.urlencode (this.keysort (query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'timestamp': timestamp,
                'signature_method': signatureMethod,
                'echostr': echostr,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    convertSecretToPem (secret) {
        const lineLength = 64;
        const secretLength = secret.length - 0;
        let numLines = parseInt (secretLength / lineLength);
        numLines = this.sum (numLines, 1);
        let pem = "-----BEGIN PRIVATE KEY-----\n"; // eslint-disable-line
        for (let i = 0; i < numLines; i++) {
            const start = i * lineLength;
            const end = this.sum (start, lineLength);
            pem += this.secret.slice (start, end) + "\n"; // eslint-disable-line
        }
        return pem + '-----END PRIVATE KEY-----';
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const success = this.safeString (response, 'result');
        if (success === 'false') {
            const errorCode = this.safeString (response, 'error_code');
            const message = this.safeString ({
                '10000': 'Internal error',
                '10001': 'The required parameters can not be empty',
                '10002': 'Validation failed',
                '10003': 'Invalid parameter',
                '10004': 'Request too frequent',
                '10005': 'Secret key does not exist',
                '10006': 'User does not exist',
                '10007': 'Invalid signature',
                '10008': 'Invalid Trading Pair',
                '10009': 'Price and/or Amount are required for limit order',
                '10010': 'Price and/or Amount must be less than minimum requirement',
                // '10011': 'Market orders can not be missing the amount of the order',
                // '10012': 'market sell orders can not be missing orders',
                '10013': 'The amount is too small',
                '10014': 'Insufficient amount of money in the account',
                '10015': 'Invalid order type',
                '10016': 'Insufficient account balance',
                '10017': 'Server Error',
                '10018': 'Page size should be between 1 and 50',
                '10019': 'Cancel NO more than 3 orders in one request',
                '10020': 'Volume < 0.001',
                '10021': 'Price < 0.01',
                '10022': 'Invalid authorization',
                '10023': 'Market Order is not supported yet',
                '10024': 'User cannot trade on this pair',
                '10025': 'Order has been filled',
                '10026': 'Order has been cancelld',
                '10027': 'Order is cancelling',
                '10028': 'Wrong query time',
                '10029': 'from is not in the query time',
                '10030': 'from do not match the transaction type of inqury',
                '10031': 'echostr length must be valid and length must be from 30 to 40',
                '10033': 'Failed to create order',
                '10036': 'customID duplicated',
                '10100': 'Has no privilege to withdraw',
                '10101': 'Invalid fee rate to withdraw',
                '10102': 'Too little to withdraw',
                '10103': 'Exceed daily limitation of withdraw',
                '10104': 'Cancel was rejected',
                '10105': 'Request has been cancelled',
                '10106': 'None trade time',
                '10107': 'Start price exception',
                '10108': 'can not create order',
                '10109': 'wallet address is not mapping',
                '10110': 'transfer fee is not mapping',
                '10111': 'mount > 0',
                '10112': 'fee is too lower',
                '10113': 'transfer fee is 0',
                '10600': 'intercepted by replay attacks filter, check timestamp',
                '10601': 'Interface closed unavailable',
                '10701': 'invalid asset code',
                '10702': 'not allowed deposit',
            }, errorCode, this.json (response));
            const ErrorClass = this.safeValue ({
                '10001': BadRequest,
                '10002': AuthenticationError,
                '10003': BadRequest,
                '10004': RateLimitExceeded,
                '10005': AuthenticationError,
                '10006': AuthenticationError,
                '10007': AuthenticationError,
                '10008': BadSymbol,
                '10009': InvalidOrder,
                '10010': InvalidOrder,
                '10013': InvalidOrder,
                '10014': InsufficientFunds,
                '10015': InvalidOrder,
                '10016': InsufficientFunds,
                '10017': ExchangeError,
                '10018': BadRequest,
                '10019': BadRequest,
                '10020': BadRequest,
                '10021': InvalidOrder,
                '10022': PermissionDenied, // 'Invalid authorization',
                '10023': InvalidOrder, // 'Market Order is not supported yet',
                '10024': PermissionDenied, // 'User cannot trade on this pair',
                '10025': InvalidOrder, // 'Order has been filled',
                '10026': InvalidOrder, // 'Order has been cancelled',
                '10027': InvalidOrder, // 'Order is cancelling',
                '10028': BadRequest, // 'Wrong query time',
                '10029': BadRequest, // 'from is not in the query time',
                '10030': BadRequest, // 'from do not match the transaction type of inqury',
                '10031': InvalidNonce, // 'echostr length must be valid and length must be from 30 to 40',
                '10033': ExchangeError, // 'Failed to create order',
                '10036': DuplicateOrderId, // 'customID duplicated',
                '10100': PermissionDenied, // 'Has no privilege to withdraw',
                '10101': BadRequest, // 'Invalid fee rate to withdraw',
                '10102': InsufficientFunds, // 'Too little to withdraw',
                '10103': ExchangeError, // 'Exceed daily limitation of withdraw',
                '10104': ExchangeError, // 'Cancel was rejected',
                '10105': ExchangeError, // 'Request has been cancelled',
                '10106': BadRequest, // 'None trade time',
                '10107': BadRequest, // 'Start price exception',
                '10108': ExchangeError, // 'can not create order',
                '10109': InvalidAddress, // 'wallet address is not mapping',
                '10110': ExchangeError, // 'transfer fee is not mapping',
                '10111': BadRequest, // 'mount > 0',
                '10112': BadRequest, // 'fee is too lower',
                '10113': BadRequest, // 'transfer fee is 0',
                '10600': BadRequest, // 'intercepted by replay attacks filter, check timestamp',
                '10601': ExchangeError, // 'Interface closed unavailable',
                '10701': BadSymbol, // 'invalid asset code',
                '10702': PermissionDenied, // 'not allowed deposit',
            }, errorCode, ExchangeError);
            throw new ErrorClass (message);
        }
    }
};
