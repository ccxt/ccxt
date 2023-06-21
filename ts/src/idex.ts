
// ---------------------------------------------------------------------------

import Exchange from './abstract/idex.js';
import { TICK_SIZE, PAD_WITH_ZERO, ROUND, TRUNCATE, DECIMAL_PLACES } from './base/functions/number.js';
import { InvalidOrder, InsufficientFunds, ExchangeError, ExchangeNotAvailable, DDoSProtection, BadRequest, NotSupported, InvalidAddress, AuthenticationError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import { Int, OrderSide, OrderType } from './base/types.js';

// ---------------------------------------------------------------------------

export default class idex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': [ 'US' ],
            'rateLimit': 1000,
            'version': 'v3',
            'pro': true,
            'certified': false,
            'requiresWeb3': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'MATIC': 'https://api-sandbox-matic.idex.io',
                },
                'logo': 'https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg',
                'api': {
                    'MATIC': 'https://api-matic.idex.io',
                },
                'www': 'https://idex.io',
                'doc': [
                    'https://docs.idex.io/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchange': 1,
                        'assets': 1,
                        'markets': 1,
                        'tickers': 1,
                        'candles': 1,
                        'trades': 1,
                        'orderbook': 1,
                    },
                },
                'private': {
                    'get': {
                        'user': 1,
                        'wallets': 1,
                        'balances': 1,
                        'orders': 0.1,
                        'fills': 0.1,
                        'deposits': 1,
                        'withdrawals': 1,
                        'wsToken': 1,
                    },
                    'post': {
                        'wallets': 1,
                        'orders': 0.1,
                        'orders/test': 0.1,
                        'withdrawals': 1,
                    },
                    'delete': {
                        'orders': 0.1,
                    },
                },
            },
            'options': {
                'defaultTimeInForce': 'gtc',
                'defaultSelfTradePrevention': 'cn',
                'network': 'MATIC',
            },
            'exceptions': {
                'INVALID_ORDER_QUANTITY': InvalidOrder,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
                'SERVICE_UNAVAILABLE': ExchangeNotAvailable,
                'EXCEEDED_RATE_LIMIT': DDoSProtection,
                'INVALID_PARAMETER': BadRequest,
                'WALLET_NOT_ASSOCIATED': InvalidAddress,
                'INVALID_WALLET_SIGNATURE': AuthenticationError,
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'paddingMode': PAD_WITH_ZERO,
            'commonCurrencies': {},
        });
    }

    priceToPrecision (symbol, price) {
        //
        // we override priceToPrecision to fix the following issue
        // https://github.com/ccxt/ccxt/issues/13367
        // {"code":"INVALID_PARAMETER","message":"invalid value provided for request parameter \"price\": all quantities and prices must be below 100 billion, above 0, need to be provided as strings, and always require 4 decimals ending with 4 zeroes"}
        //
        const market = this.market (symbol);
        const info = this.safeValue (market, 'info', {});
        const quoteAssetPrecision = this.safeInteger (info, 'quoteAssetPrecision');
        price = this.decimalToPrecision (price, ROUND, market['precision']['price'], this.precisionMode);
        return this.decimalToPrecision (price, TRUNCATE, quoteAssetPrecision, DECIMAL_PLACES, PAD_WITH_ZERO);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name idex#fetchMarkets
         * @description retrieves data on all markets for idex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        //    [
        //        {
        //            "market": "ETH-USDC",
        //            "type": "hybrid",
        //            "status": "activeHybrid",
        //            "baseAsset": "ETH",
        //            "baseAssetPrecision": "8",
        //            "quoteAsset": "USDC",
        //            "quoteAssetPrecision": "8",
        //            "makerFeeRate": "0.0000",
        //            "takerFeeRate": "0.2500",
        //            "takerIdexFeeRate": "0.0500",
        //            "takerLiquidityProviderFeeRate": "0.2000",
        //            "tickSize": "0.01000000"
        //        },
        //    ]
        //
        const response2 = await this.publicGetExchange ();
        //
        //    {
        //        "timeZone": "UTC",
        //        "serverTime": "1654460599952",
        //        "maticDepositContractAddress": "0x3253a7e75539edaeb1db608ce6ef9aa1ac9126b6",
        //        "maticCustodyContractAddress": "0x3bcc4eca0a40358558ca8d1bcd2d1dbde63eb468",
        //        "maticUsdPrice": "0.60",
        //        "gasPrice": "180",
        //        "volume24hUsd": "10015814.46",
        //        "totalVolumeUsd": "1589273533.28",
        //        "totalTrades": "1534904",
        //        "totalValueLockedUsd": "12041929.44",
        //        "idexStakingValueLockedUsd": "20133816.98",
        //        "idexTokenAddress": "0x9Cb74C8032b007466865f060ad2c46145d45553D",
        //        "idexUsdPrice": "0.07",
        //        "idexMarketCapUsd": "48012346.00",
        //        "makerFeeRate": "0.0000",
        //        "takerFeeRate": "0.0025",
        //        "takerIdexFeeRate": "0.0005",
        //        "takerLiquidityProviderFeeRate": "0.0020",
        //        "makerTradeMinimum": "10.00000000",
        //        "takerTradeMinimum": "1.00000000",
        //        "withdrawMinimum": "0.50000000",
        //        "liquidityAdditionMinimum": "0.50000000",
        //        "liquidityRemovalMinimum": "0.40000000",
        //        "blockConfirmationDelay": "64"
        //    }
        //
        const maker = this.safeNumber (response2, 'makerFeeRate');
        const taker = this.safeNumber (response2, 'takerFeeRate');
        const makerMin = this.safeString (response2, 'makerTradeMinimum');
        const takerMin = this.safeString (response2, 'takerTradeMinimum');
        const minCostETH = this.parseNumber (Precise.stringMin (makerMin, takerMin));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const marketId = this.safeString (entry, 'market');
            const baseId = this.safeString (entry, 'baseAsset');
            const quoteId = this.safeString (entry, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const basePrecision = this.parseNumber (this.parsePrecision (this.safeString (entry, 'baseAssetPrecision')));
            const quotePrecision = this.parseNumber (this.parsePrecision (this.safeString (entry, 'quoteAssetPrecision')));
            const status = this.safeString (entry, 'status');
            let minCost = undefined;
            if (quote === 'ETH') {
                minCost = minCostETH;
            }
            result.push ({
                'id': marketId,
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
                'active': (status !== 'inactive'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': basePrecision,
                    'price': this.safeNumber (entry, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': basePrecision,
                        'max': undefined,
                    },
                    'price': {
                        'min': quotePrecision,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': entry,
            });
        }
        return result;
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name idex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        // [
        //   {
        //     market: 'DIL-ETH',
        //     time: 1598367493008,
        //     open: '0.09695361',
        //     high: '0.10245881',
        //     low: '0.09572507',
        //     close: '0.09917079',
        //     closeQuantity: '0.71320950',
        //     baseVolume: '309.17380612',
        //     quoteVolume: '30.57633981',
        //     percentChange: '2.28',
        //     numTrades: 205,
        //     ask: '0.09910476',
        //     bid: '0.09688340',
        //     sequence: 3902
        //   }
        // ]
        const response = await this.publicGetTickers (this.extend (request, params));
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        // [
        //   {
        //     market: 'DIL-ETH',
        //     time: 1598367493008,
        //     open: '0.09695361',
        //     high: '0.10245881',
        //     low: '0.09572507',
        //     close: '0.09917079',
        //     closeQuantity: '0.71320950',
        //     baseVolume: '309.17380612',
        //     quoteVolume: '30.57633981',
        //     percentChange: '2.28',
        //     numTrades: 205,
        //     ask: '0.09910476',
        //     bid: '0.09688340',
        //     sequence: 3902
        //   }, ...
        // ]
        const response = await this.publicGetTickers (params);
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //   market: 'DIL-ETH',
        //   time: 1598367493008,
        //   open: '0.09695361',
        //   high: '0.10245881',
        //   low: '0.09572507',
        //   close: '0.09917079',
        //   closeQuantity: '0.71320950',
        //   baseVolume: '309.17380612',
        //   quoteVolume: '30.57633981',
        //   percentChange: '2.28',
        //   numTrades: 205,
        //   ask: '0.09910476',
        //   bid: '0.09688340',
        //   sequence: 3902
        // }
        const marketId = this.safeString (ticker, 'market');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'time');
        const close = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': timeframe,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetCandles (this.extend (request, params));
        if (Array.isArray (response)) {
            // [
            //   {
            //     start: 1598345580000,
            //     open: '0.09771286',
            //     high: '0.09771286',
            //     low: '0.09771286',
            //     close: '0.09771286',
            //     volume: '1.45340410',
            //     sequence: 3853
            //   }, ...
            // ]
            return this.parseOHLCVs (response, market, timeframe, since, limit);
        } else {
            //  {"nextTime":1595536440000}
            return [];
        }
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //   start: 1598345580000,
        //   open: '0.09771286',
        //   high: '0.09771286',
        //   low: '0.09771286',
        //   close: '0.09771286',
        //   volume: '1.45340410',
        //   sequence: 3853
        // }
        const timestamp = this.safeInteger (ohlcv, 'start');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const volume = this.safeNumber (ohlcv, 'volume');
        return [ timestamp, open, high, low, close, volume ];
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     fillId: 'b5467d00-b13e-3fa9-8216-dd66735550fc',
        //     price: '0.09771286',
        //     quantity: '1.45340410',
        //     quoteQuantity: '0.14201627',
        //     time: 1598345638994,
        //     makerSide: 'buy',
        //     sequence: 3853
        //   }, ...
        // ]
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public trades
        //  {
        //      "fillId":"a4883704-850b-3c4b-8588-020b5e4c62f1",
        //      "price":"0.20377008",
        //      "quantity":"47.58448728",
        //      "quoteQuantity":"9.69629509",
        //      "time":1642091300873,
        //      "makerSide":"buy",
        //      "type":"hybrid",        // one of either: "orderBook", "hybrid", or "pool"
        //      "sequence":31876
        //  }
        //
        // private trades
        //  {
        //      "fillId":"83429066-9334-3582-b710-78858b2f0d6b",
        //      "price":"0.20717368",
        //      "quantity":"15.00000000",
        //      "quoteQuantity":"3.10760523",
        //      "orderBookQuantity":"0.00000003",
        //      "orderBookQuoteQuantity":"0.00000001",
        //      "poolQuantity":"14.99999997",
        //      "poolQuoteQuantity":"3.10760522",
        //      "time":1642083351215,
        //      "makerSide":"sell",
        //      "sequence":31795,
        //      "market":"IDEX-USDC",
        //      "orderId":"4fe993f0-747b-11ec-bd08-79d4a0b6e47c",
        //      "side":"buy",
        //      "fee":"0.03749989",
        //      "feeAsset":"IDEX",
        //      "gas":"0.40507261",
        //      "liquidity":"taker",
        //      "type":"hybrid",
        //      "txId":"0x69f6d82a762d12e3201efd0b3e9cc1969351e3c6ea3cf07c47c66bf24a459815",
        //      "txStatus":"mined"
        //  }
        //
        const id = this.safeString (trade, 'fillId');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const costString = this.safeString (trade, 'quoteQuantity');
        const timestamp = this.safeInteger (trade, 'time');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        // this code handles the duality of public vs private trades
        const makerSide = this.safeString (trade, 'makerSide');
        const oppositeSide = (makerSide === 'buy') ? 'sell' : 'buy';
        const side = this.safeString (trade, 'side', oppositeSide);
        const takerOrMaker = this.safeString (trade, 'liquidity', 'taker');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeAsset');
            fee = {
                'cost': feeCostString,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name idex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request = {
            'nonce': nonce,
        };
        let response = undefined;
        response = await this.privateGetUser (this.extend (request, params));
        //
        //     {
        //         depositEnabled: true,
        //         orderEnabled: true,
        //         cancelEnabled: true,
        //         withdrawEnabled: true,
        //         totalPortfolioValueUsd: '0.00',
        //         makerFeeRate: '0.0000',
        //         takerFeeRate: '0.0025',
        //         takerIdexFeeRate: '0.0005',
        //         takerLiquidityProviderFeeRate: '0.0020'
        //     }
        //
        const maker = this.safeNumber (response, 'makerFeeRate');
        const taker = this.safeNumber (response, 'takerFeeRate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'level': 2,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // {
        //   sequence: 36416753,
        //   bids: [
        //     [ '0.09672815', '8.22284267', 1 ],
        //     [ '0.09672814', '1.83685554', 1 ],
        //     [ '0.09672143', '4.10962617', 1 ],
        //     [ '0.09658884', '4.03863759', 1 ],
        //     [ '0.09653781', '3.35730684', 1 ],
        //     [ '0.09624660', '2.54163586', 1 ],
        //     [ '0.09617490', '1.93065030', 1 ]
        //   ],
        //   asks: [
        //     [ '0.09910476', '3.22840154', 1 ],
        //     [ '0.09940587', '3.39796593', 1 ],
        //     [ '0.09948189', '4.25088898', 1 ],
        //     [ '0.09958362', '2.42195784', 1 ],
        //     [ '0.09974393', '4.25234367', 1 ],
        //     [ '0.09995250', '3.40192141', 1 ]
        //   ]
        // }
        const response = await this.publicGetOrderbook (this.extend (request, params));
        const nonce = this.safeInteger (response, 'sequence');
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': nonce,
            'bids': this.parseSide (response, 'bids'),
            'asks': this.parseSide (response, 'asks'),
        } as any;
    }

    parseSide (book, side) {
        const bookSide = this.safeValue (book, side, []);
        const result = [];
        for (let i = 0; i < bookSide.length; i++) {
            const order = bookSide[i];
            const price = this.safeNumber (order, 0);
            const amount = this.safeNumber (order, 1);
            const orderCount = this.safeInteger (order, 2);
            result.push ([ price, amount, orderCount ]);
        }
        const descending = side === 'bids';
        return this.sortBy (result, 0, descending);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name idex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetAssets (params);
        //
        //     [
        //        {
        //            "name": "Ethereum",
        //            "symbol": "ETH",
        //            "contractAddress": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        //            "assetDecimals": "18",
        //            "exchangeDecimals": "8",
        //            "maticPrice": "3029.38503483"
        //        },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const name = this.safeString (entry, 'name');
            const currencyId = this.safeString (entry, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const precision = this.parseNumber (this.parsePrecision (this.safeString (entry, 'exchangeDecimals')));
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': entry,
                'type': undefined,
                'name': name,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': precision, 'max': undefined },
                    'withdraw': { 'min': precision, 'max': undefined },
                },
            };
        }
        return result;
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (entry, 'quantity');
            account['free'] = this.safeString (entry, 'availableForTrade');
            account['used'] = this.safeString (entry, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name idex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce1 = this.uuidv1 ();
        const request = {
            'nonce': nonce1,
            'wallet': this.walletAddress,
        };
        // [
        //   {
        //     asset: 'DIL',
        //     quantity: '0.00000000',
        //     availableForTrade: '0.00000000',
        //     locked: '0.00000000',
        //     usdValue: null
        //   }, ...
        // ]
        const extendedRequest = this.extend (request, params);
        if (extendedRequest['wallet'] === undefined) {
            throw new BadRequest (this.id + ' fetchBalance() wallet is undefined, set this.walletAddress or "address" in params');
        }
        let response = undefined;
        try {
            response = await this.privateGetBalances (extendedRequest);
        } catch (e) {
            if (e instanceof InvalidAddress) {
                const walletAddress = extendedRequest['wallet'];
                await this.associateWallet (walletAddress);
                response = await this.privateGetBalances (extendedRequest);
            } else {
                throw e;
            }
        }
        return this.parseBalance (response);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //     price: '0.09905990',
        //     quantity: '0.40000000',
        //     quoteQuantity: '0.03962396',
        //     time: 1598873478762,
        //     makerSide: 'sell',
        //     sequence: 5053,
        //     market: 'DIL-ETH',
        //     orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //     side: 'buy',
        //     fee: '0.00080000',
        //     feeAsset: 'DIL',
        //     gas: '0.00857497',
        //     liquidity: 'taker',
        //     txId: '0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65',
        //     txStatus: 'mined'
        //   }
        // ]
        const extendedRequest = this.extend (request, params);
        if (extendedRequest['wallet'] === undefined) {
            throw new BadRequest (this.id + ' fetchMyTrades() walletAddress is undefined, set this.walletAddress or "address" in params');
        }
        let response = undefined;
        try {
            response = await this.privateGetFills (extendedRequest);
        } catch (e) {
            if (e instanceof InvalidAddress) {
                const walletAddress = extendedRequest['wallet'];
                await this.associateWallet (walletAddress);
                response = await this.privateGetFills (extendedRequest);
            } else {
                throw e;
            }
        }
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'orderId': id,
        };
        return await this.fetchOrdersHelper (symbol, undefined, undefined, this.extend (request, params));
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'closed': false,
        };
        return await this.fetchOrdersHelper (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'closed': true,
        };
        return await this.fetchOrdersHelper (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrdersHelper (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        // fetchClosedOrders / fetchOpenOrders
        // [
        //   {
        //     "market": "DIL-ETH",
        //     "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //     "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //     "time": 1598873478650,
        //     "status": "filled",
        //     "type": "limit",
        //     "side": "buy",
        //     "originalQuantity": "0.40000000",
        //     "executedQuantity": "0.40000000",
        //     "cumulativeQuoteQuantity": "0.03962396",
        //     "avgExecutionPrice": "0.09905990",
        //     "price": "1.00000000",
        //     "fills": [
        //       {
        //         "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //         "price": "0.09905990",
        //         "quantity": "0.40000000",
        //         "quoteQuantity": "0.03962396",
        //         "time": 1598873478650,
        //         "makerSide": "sell",
        //         "sequence": 5053,
        //         "fee": "0.00080000",
        //         "feeAsset": "DIL",
        //         "gas": "0.00857497",
        //         "liquidity": "taker",
        //         "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //         "txStatus": "mined"
        //       }
        //     ]
        //   }
        // ]
        // fetchOrder
        // { market: 'DIL-ETH',
        //   orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //   wallet: '0x0AB991497116f7F5532a4c2f4f7B1784488628e1',
        //   time: 1598873478650,
        //   status: 'filled',
        //   type: 'limit',
        //   side: 'buy',
        //   originalQuantity: '0.40000000',
        //   executedQuantity: '0.40000000',
        //   cumulativeQuoteQuantity: '0.03962396',
        //   avgExecutionPrice: '0.09905990',
        //   price: '1.00000000',
        //   fills:
        //    [ { fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //        price: '0.09905990',
        //        quantity: '0.40000000',
        //        quoteQuantity: '0.03962396',
        //        time: 1598873478650,
        //        makerSide: 'sell',
        //        sequence: 5053,
        //        fee: '0.00080000',
        //        feeAsset: 'DIL',
        //        gas: '0.00857497',
        //        liquidity: 'taker',
        //        txId: '0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65',
        //        txStatus: 'mined' } ] }
        if (Array.isArray (response)) {
            return this.parseOrders (response, market, since, limit) as any;
        } else {
            return this.parseOrder (response, market);
        }
    }

    parseOrderStatus (status) {
        // https://docs.idex.io/#order-states-amp-lifecycle
        const statuses = {
            'active': 'open',
            'partiallyFilled': 'open',
            'rejected': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "market": "DIL-ETH",
        //         "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //         "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //         "time": 1598873478650,
        //         "status": "filled",
        //         "type": "limit",
        //         "side": "buy",
        //         "originalQuantity": "0.40000000",
        //         "executedQuantity": "0.40000000",
        //         "cumulativeQuoteQuantity": "0.03962396",
        //         "avgExecutionPrice": "0.09905990",
        //         "price": "1.00000000",
        //         "fills": [
        //             {
        //             "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //             "price": "0.09905990",
        //             "quantity": "0.40000000",
        //             "quoteQuantity": "0.03962396",
        //             "time": 1598873478650,
        //             "makerSide": "sell",
        //             "sequence": 5053,
        //             "fee": "0.00080000",
        //             "feeAsset": "DIL",
        //             "gas": "0.00857497",
        //             "liquidity": "taker",
        //             "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //             "txStatus": "mined"
        //             }
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (order, 'time');
        const fills = this.safeValue (order, 'fills', []);
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const marketId = this.safeString (order, 'market');
        const side = this.safeString (order, 'side');
        const symbol = this.safeSymbol (marketId, market, '-');
        const type = this.safeString (order, 'type');
        const amount = this.safeString (order, 'originalQuantity');
        const filled = this.safeString (order, 'executedQuantity');
        const average = this.safeString (order, 'avgExecutionPrice');
        const price = this.safeString (order, 'price');
        const rawStatus = this.safeString (order, 'status');
        const timeInForce = this.safeStringUpper (order, 'timeInForce');
        const status = this.parseOrderStatus (rawStatus);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    async associateWallet (walletAddress, params = {}) {
        const nonce = this.uuidv1 ();
        const noPrefix = this.remove0xPrefix (walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (noPrefix),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        // {
        //   address: '0x0AB991497116f7F5532a4c2f4f7B1784488628e1',
        //   totalPortfolioValueUsd: '0.00',
        //   time: 1598468353626
        // }
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': walletAddress,
            },
            'signature': signature,
        };
        const result = await this.privatePostWallets (request);
        return result;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name idex#createOrder
         * @description create a trade order, https://docs.idex.io/#create-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const nonce = this.uuidv1 ();
        let typeEnum = undefined;
        const stopLossTypeEnums = {
            'stopLoss': 3,
            'stopLossLimit': 4,
            'takeProfit': 5,
            'takeProfitLimit': 6,
        };
        let stopPriceString = undefined;
        if ((type === 'stopLossLimit') || (type === 'takeProfitLimit') || ('stopPrice' in params)) {
            if (!('stopPrice' in params)) {
                throw new BadRequest (this.id + ' createOrder() stopPrice is a required parameter for ' + type + 'orders');
            }
            stopPriceString = this.priceToPrecision (symbol, params['stopPrice']);
        }
        const limitTypeEnums = {
            'limit': 1,
            'limitMaker': 2,
        };
        let priceString = undefined;
        const typeLower = type.toLowerCase ();
        const limitOrder = typeLower.indexOf ('limit') >= 0;
        if (type in limitTypeEnums) {
            typeEnum = limitTypeEnums[type];
            priceString = this.priceToPrecision (symbol, price);
        } else if (type in stopLossTypeEnums) {
            typeEnum = stopLossTypeEnums[type];
            priceString = this.priceToPrecision (symbol, price);
        } else if (type === 'market') {
            typeEnum = 0;
        } else {
            throw new BadRequest (this.id + ' ' + type + ' is not a valid order type');
        }
        let amountEnum = 0; // base quantity
        if ('quoteOrderQuantity' in params) {
            if (type !== 'market') {
                throw new NotSupported (this.id + ' createOrder() quoteOrderQuantity is not supported for ' + type + ' orders, only supported for market orders');
            }
            amountEnum = 1;
            amount = this.safeNumber (params, 'quoteOrderQuantity');
        }
        const sideEnum = (side === 'buy') ? 0 : 1;
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const network = this.safeString (this.options, 'network', 'ETH');
        const orderVersion = this.getSupportedMapping (network, {
            'ETH': 1,
            'BSC': 2,
            'MATIC': 4,
        });
        const amountString = this.amountToPrecision (symbol, amount);
        // https://docs.idex.io/#time-in-force
        const timeInForceEnums = {
            'gtc': 0,
            'ioc': 2,
            'fok': 3,
        };
        const defaultTimeInForce = this.safeString (this.options, 'defaultTimeInForce', 'gtc');
        const timeInForce = this.safeString (params, 'timeInForce', defaultTimeInForce);
        let timeInForceEnum = undefined;
        if (timeInForce in timeInForceEnums) {
            timeInForceEnum = timeInForceEnums[timeInForce];
        } else {
            const allOptions = Object.keys (timeInForceEnums);
            const asString = allOptions.join (', ');
            throw new BadRequest (this.id + ' ' + timeInForce + ' is not a valid timeInForce, please choose one of ' + asString);
        }
        // https://docs.idex.io/#self-trade-prevention
        const selfTradePreventionEnums = {
            'dc': 0,
            'co': 1,
            'cn': 2,
            'cb': 3,
        };
        const defaultSelfTradePrevention = this.safeString (this.options, 'defaultSelfTradePrevention', 'cn');
        const selfTradePrevention = this.safeString (params, 'selfTradePrevention', defaultSelfTradePrevention);
        let selfTradePreventionEnum = undefined;
        if (selfTradePrevention in selfTradePreventionEnums) {
            selfTradePreventionEnum = selfTradePreventionEnums[selfTradePrevention];
        } else {
            const allOptions = Object.keys (selfTradePreventionEnums);
            const asString = allOptions.join (', ');
            throw new BadRequest (this.id + ' ' + selfTradePrevention + ' is not a valid selfTradePrevention, please choose one of ' + asString);
        }
        const byteArray = [
            this.numberToBE (orderVersion, 1),
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.encode (market['id']),
            this.numberToBE (typeEnum, 1),
            this.numberToBE (sideEnum, 1),
            this.encode (amountString),
            this.numberToBE (amountEnum, 1),
        ];
        if (limitOrder) {
            const encodedPrice = this.encode (priceString);
            byteArray.push (encodedPrice);
        }
        if (type in stopLossTypeEnums) {
            const encodedPrice = this.encode (stopPriceString || priceString);
            byteArray.push (encodedPrice);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            byteArray.push (this.encode (clientOrderId));
        }
        const after = [
            this.numberToBE (timeInForceEnum, 1),
            this.numberToBE (selfTradePreventionEnum, 1),
            this.numberToBE (0, 8), // unused
        ];
        const allBytes = this.arrayConcat (byteArray, after);
        const binary = this.binaryConcatArray (allBytes);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request = {
            'parameters': {
                'nonce': nonce,
                'market': market['id'],
                'side': side,
                'type': type,
                'wallet': this.walletAddress,
                'selfTradePrevention': selfTradePrevention,
            },
            'signature': signature,
        };
        if (type !== 'market') {
            request['parameters']['timeInForce'] = timeInForce;
        }
        if (limitOrder) {
            request['parameters']['price'] = priceString;
        }
        if (type in stopLossTypeEnums) {
            request['parameters']['stopPrice'] = stopPriceString || priceString;
        }
        if (amountEnum === 0) {
            request['parameters']['quantity'] = amountString;
        } else {
            request['parameters']['quoteOrderQuantity'] = amountString;
        }
        if (clientOrderId !== undefined) {
            request['parameters']['clientOrderId'] = clientOrderId;
        }
        // {
        //   market: 'DIL-ETH',
        //   orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //   wallet: '0x0AB991497116f7F5532a4c2f4f7B1784488628e1',
        //   time: 1598873478650,
        //   status: 'filled',
        //   type: 'limit',
        //   side: 'buy',
        //   originalQuantity: '0.40000000',
        //   executedQuantity: '0.40000000',
        //   cumulativeQuoteQuantity: '0.03962396',
        //   price: '1.00000000',
        //   fills: [
        //     {
        //       fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //       price: '0.09905990',
        //       quantity: '0.40000000',
        //       quoteQuantity: '0.03962396',
        //       time: 1598873478650,
        //       makerSide: 'sell',
        //       sequence: 5053,
        //       fee: '0.00080000',
        //       feeAsset: 'DIL',
        //       gas: '0.00857497',
        //       liquidity: 'taker',
        //       txStatus: 'pending'
        //     }
        //   ],
        //   avgExecutionPrice: '0.09905990'
        // }
        // we don't use extend here because it is a signed endpoint
        const response = await this.privatePostOrders (request);
        return this.parseOrder (response, market);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name idex#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const amountString = this.currencyToPrecision (code, amount);
        const currency = this.currency (code);
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.encode (currency['id']),
            this.encode (amountString),
            this.numberToBE (1, 1), // bool set to true
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': address,
                'asset': currency['id'],
                'quantity': amountString,
            },
            'signature': signature,
        };
        const response = await this.privatePostWithdrawals (request);
        //
        //     {
        //         withdrawalId: 'a61dcff0-ec4d-11ea-8b83-c78a6ecb3180',
        //         asset: 'ETH',
        //         assetContractAddress: '0x0000000000000000000000000000000000000000',
        //         quantity: '0.20000000',
        //         time: 1598962883190,
        //         fee: '0.00024000',
        //         txStatus: 'pending',
        //         txId: null
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name idex#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const nonce = this.uuidv1 ();
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': this.walletAddress,
            },
        };
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
        ];
        if (market !== undefined) {
            byteArray.push (this.encode (market['id']));
            request['parameters']['market'] = market['id'];
        }
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        request['signature'] = signature;
        // [ { orderId: '688336f0-ec50-11ea-9842-b332f8a34d0e' } ]
        const response = await this.privateDeleteOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name idex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const nonce = this.uuidv1 ();
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.encode (id),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': this.walletAddress,
                'orderId': id,
            },
            'signature': signature,
        };
        // [ { orderId: '688336f0-ec50-11ea-9842-b332f8a34d0e' } ]
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const canceledOrder = this.safeValue (response, 0);
        return this.parseOrder (canceledOrder, market);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (errorCode in this.exceptions) {
            const Exception = this.exceptions[errorCode];
            throw new Exception (this.id + ' ' + message);
        }
        if (errorCode !== undefined) {
            throw new ExchangeError (this.id + ' ' + message);
        }
        return undefined;
    }

    async fetchDeposit (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchDeposit
         * @description fetch information on a deposit
         * @param {string} id deposit id
         * @param {string|undefined} code not used by idex fetchDeposit ()
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request = {
            'nonce': nonce,
            'wallet': this.walletAddress,
            'depositId': id,
        };
        const response = await this.privateGetDeposits (this.extend (request, params));
        return this.parseTransaction (response, code);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        params = this.extend ({
            'method': 'privateGetDeposits',
        }, params);
        return await this.fetchTransactionsHelper (code, since, limit, params);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name idex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //    { serverTime: '1655258263236' }
        //
        return this.safeNumber (response, 'serverTime');
    }

    async fetchWithdrawal (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @param {string} id withdrawal id
         * @param {string|undefined} code not used by idex.fetchWithdrawal
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request = {
            'nonce': nonce,
            'wallet': this.walletAddress,
            'withdrawalId': id,
        };
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        return this.parseTransaction (response, code);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name idex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the idex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        params = this.extend ({
            'method': 'privateGetWithdrawals',
        }, params);
        return await this.fetchTransactionsHelper (code, since, limit, params);
    }

    async fetchTransactionsHelper (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request = {
            'nonce': nonce,
            'wallet': this.walletAddress,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     depositId: 'e9970cc0-eb6b-11ea-9e89-09a5ebc1f98e',
        //     asset: 'ETH',
        //     quantity: '1.00000000',
        //     txId: '0xcd4aac3171d7131cc9e795568c67938675185ac17641553ef54c8a7c294c8142',
        //     txTime: 1598865853000,
        //     confirmationTime: 1598865930231
        //   }
        // ]
        const method = params['method'];
        params = this.omit (params, 'method');
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'mined': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         depositId: 'e9970cc0-eb6b-11ea-9e89-09a5ebc1f98f',
        //         asset: 'ETH',
        //         quantity: '1.00000000',
        //         txId: '0xcd4aac3171d7131cc9e795568c67938675185ac17641553ef54c8a7c294c8142',
        //         txTime: 1598865853000,
        //         confirmationTime: 1598865930231
        //     }
        //
        // fetchWithdrwalas
        //
        //     {
        //         withdrawalId: 'a62d8760-ec4d-11ea-9fa6-47904c19499b',
        //         asset: 'ETH',
        //         assetContractAddress: '0x0000000000000000000000000000000000000000',
        //         quantity: '0.20000000',
        //         time: 1598962883288,
        //         fee: '0.00024000',
        //         txId: '0x305e9cdbaa85ad029f50578d13d31d777c085de573ed5334d95c19116d8c03ce',
        //         txStatus: 'mined'
        //     }
        //
        // withdraw
        //
        //     {
        //         withdrawalId: 'a61dcff0-ec4d-11ea-8b83-c78a6ecb3180',
        //         asset: 'ETH',
        //         assetContractAddress: '0x0000000000000000000000000000000000000000',
        //         quantity: '0.20000000',
        //         time: 1598962883190,
        //         fee: '0.00024000',
        //         txStatus: 'pending',
        //         txId: null
        //     }
        //
        let type = undefined;
        if ('depositId' in transaction) {
            type = 'deposit';
        } else if (('withdrawId' in transaction) || ('withdrawalId' in transaction)) {
            type = 'withdrawal';
        }
        let id = this.safeString2 (transaction, 'depositId', 'withdrawId');
        id = this.safeString (transaction, 'withdrawalId', id);
        const code = this.safeCurrencyCode (this.safeString (transaction, 'asset'), currency);
        const amount = this.safeNumber (transaction, 'quantity');
        const txid = this.safeString (transaction, 'txId');
        const timestamp = this.safeInteger2 (transaction, 'txTime', 'time');
        let fee = undefined;
        if ('fee' in transaction) {
            fee = {
                'cost': this.safeNumber (transaction, 'fee'),
                'currency': 'ETH',
            };
        }
        const rawStatus = this.safeString (transaction, 'txStatus');
        const status = this.parseTransactionStatus (rawStatus);
        const updated = this.safeInteger (transaction, 'confirmationTime');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        const hasApiKey = (this.apiKey !== undefined);
        const hasSecret = (this.secret !== undefined);
        const hasWalletAddress = (this.walletAddress !== undefined);
        const hasPrivateKey = (this.privateKey !== undefined);
        const defaultCost = this.safeValue (config, 'cost', 1);
        const authenticated = hasApiKey && hasSecret && hasWalletAddress && hasPrivateKey;
        return authenticated ? (defaultCost / 2) : defaultCost;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const network = this.safeString (this.options, 'network', 'ETH');
        const version = this.safeString (this.options, 'version', 'v1');
        let url = this.urls['api'][network] + '/' + version + '/' + path;
        const keys = Object.keys (params);
        const length = keys.length;
        let query = undefined;
        if (length > 0) {
            if (method === 'GET') {
                query = this.urlencode (params);
                url = url + '?' + query;
            } else {
                body = this.json (params);
            }
        }
        headers = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey !== undefined) {
            headers['IDEX-API-Key'] = this.apiKey;
        }
        if (api === 'private') {
            let payload = undefined;
            if (method === 'GET') {
                payload = query;
            } else {
                payload = body;
            }
            headers['IDEX-HMAC-Signature'] = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    remove0xPrefix (hexData) {
        if (hexData.slice (0, 2) === '0x') {
            return hexData.slice (2);
        } else {
            return hexData;
        }
    }

    hashMessage (message) {
        // takes a hex encoded message
        const binaryMessage = this.base16ToBinary (this.remove0xPrefix (message));
        const prefix = this.encode ('\x19Ethereum Signed Message:\n' + binaryMessage.byteLength);
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        };
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    signMessageString (message, privateKey) {
        // still takes the input as a hex string
        // same as above but returns a string instead of an object
        const signature = this.signMessage (message, privateKey);
        return signature['r'] + this.remove0xPrefix (signature['s']) + this.binaryToBase16 (this.numberToBE (signature['v'], 1));
    }
}
