
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coinstore.js';
import { AuthenticationError, BadSymbol, PermissionDenied, ExchangeError, InsufficientFunds, BadRequest, DDoSProtection } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

// const coinstoreMarketsByNumericId = {};
export default class coinstore extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinstore',
            'name': 'Coinstore',
            'countries': [ 'SG' ],
            'rateLimit': 1000,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenOrders': 'emulated',
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'transfer': false,
            },
            'hostname': 'coinstore.com',
            'urls': {
                'logo': 'https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/253675376-6983b72e-4999-4549-b177-33b374c195e3.jpg',
                'api': {
                    'spot': 'https://api.{hostname}',
                },
                'www': 'https://www.coinstore.com/',
                'doc': 'https://coinstore-openapi.github.io/en/',
                'referral': undefined,
                'fees': 'https://www.coinstore.com/#/fee',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': {
                        // Get all tickers
                        'api/v1/market/tickers': 3,
                        // Get public trades
                        'api/v1/market/trade/{symbol}': 3,
                        // Get orderbook
                        'api/v1/market/depth/{symbol}': 3,
                    },
                    'post': {
                        // fetch markets
                        'v2/public/config/spot/symbols': 3,
                    },
                },
                'private': {
                    'get': {
                        // Get open orders
                        'api/v2/trade/order/active': 3,
                        // Fetch all orders
                        'api/trade/order/historyOrders': 3,
                        // Get an individual order
                        'api/v2/trade/order/orderInfo': 3,
                        // fetch user trades
                        'api/trade/match/accountMatches': 3,
                    },
                    'post': {
                        // get balances
                        'api/spot/accountList': 3,
                        // create order
                        'api/trade/order/place': 3,
                        // cancel order
                        'api/trade/order/cancel': 3,
                        // cancel all orders
                        'api/trade/order/cancelAll': 3,
                    },
                },
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'fees': {
                'trading': {},
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // may be used when a param is missing
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '404': BadRequest,
                    '429': DDoSProtection,
                    '500': ExchangeError,
                    '1101': InsufficientFunds,
                    '10001': ExchangeError,
                },
                'broad': {},
            },
            'commonCurrencies': {},
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * Uses tickers endpoint since coinstore doesn't have a market data endpoint:
         * https://api.coinstore.com/api/v2/public/config/spot/symbols
         *
         * @method
         * @name coinstore#fetchMarkets
         * @description retrieves data on spot markets for coinstore
         * @see https://coinstore-openapi.github.io/en/#ticker-related
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicPostV2PublicConfigSpotSymbols ();
        const data = this.safeValue (response, 'data');
        const result = [];
        // {
        //     "code": "0",
        //     "message": "Success",
        //     "data": [
        //         {
        //             "symbolId": 1,
        //             "symbolCode": "BTCUSDT",
        //             "tradeCurrencyCode": "btc",
        //             "quoteCurrencyCode": "usdt",
        //             "openTrade": true,
        //             "onLineTime": 1609813531019,
        //             "tickSz": 0,
        //             "lotSz": 4,
        //             "minLmtPr": "0.0002",
        //             "minLmtSz": "0.2",
        //             "minMktVa": "0.1",
        //             "minMktSz": "0.1",
        //             "makerFee": "0.006",
        //             "takerFee": "0.003"
        //         }
        //     ]
        // }
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            // different endpoints use different case for market/currency IDs
            // lowercase everything to be safe
            const id = this.safeStringLower (market, 'symbolCode');
            const baseId = this.safeStringLower (market, 'tradeCurrencyCode');
            const quoteId = this.safeStringLower (market, 'quoteCurrencyCode');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            // const symbolId = this.safeString (market, 'symbolId');
            // if (!(symbolId in coinstoreMarketsByNumericId)) {
            //     coinstoreMarketsByNumericId[symbolId] = symbol;
            // }
            const lowercaseId = id;
            const active = this.safeValue (market, 'openTrade');
            const pricePrecision = this.safeNumber (market, 'tickSz');
            const amountPrecision = this.safeNumber (market, 'lotSz');
            const minSize = this.safeNumber (market, 'minLmtSz');
            const minPrice = this.safeNumber (market, 'minLmtPr');
            const entry = {
                'id': id,
                'lowercaseId': lowercaseId,
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
                'swap': false,
                'future': false,
                'delivery': false,
                'option': false,
                'active': active !== false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision.toString ())),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision.toString ())),
                    'base': undefined,
                    'quote': undefined,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minSize,
                        'max': undefined,
                    },
                    'price': {
                        'min': minPrice,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://coinstore-openapi.github.io/en/#get-user-39-s-latest-trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {number} [since] timestamp used to filter out older trades
         * @param {number} [limit] the maximum amount of trades to fetch
         * @param {object} [params={}] extra parameters specific to the coinstore api endpoint
         * @param {string} [params.ordId] the order to get trades for
         * @param {number} [params.pageNum] which page of trades to list
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        this.checkRequiredSymbol ('fetchTrades', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetApiV1MarketTradeSymbol (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since);
    }

    parsePublicTrade (trade, market = undefined) {
        // public trades:
        // {
        //     "channel": "4@trade",
        //     "time": 1642495112,
        //     "volume": "0.011102",
        //     "price": "41732.3305",
        //     "tradeId": 14867136,
        //     "takerSide": "BUY",
        //     "seq": 14867136,
        //     "ts": 1642495112000,
        //     "symbol": "BTCUSDT",
        //     "instrumentId": 4
        // }
        const timestamp = this.safeNumber (trade, 'ts');
        const symbol = market['symbol'];
        const price = this.parseNumber (this.safeString (trade, 'price'));
        const amount = this.parseNumber (this.safeString (trade, 'volume'));
        let cost = undefined;
        if (price && amount) {
            cost = price * amount;
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'takerSide') === 'BUY' ? 'sell' : 'buy',
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    parsePrivateTrade (trade, market = undefined) {
        // user trades:
        // {
        //     "id": 3984987,
        //     "remainingQty": 0E-18,
        //     "matchRole": 1,
        //     "feeCurrencyId": 44,
        //     "acturalFeeRate": 0.002000000000000000,
        //     "role": 1,
        //     "accountId": 1138204,
        //     "instrumentId": 15,
        //     "baseCurrencyId": 44,
        //     "quoteCurrencyId": 30,
        //     "execQty": 40.900000000000000000,
        //     "orderState": 50,
        //     "matchId": 258338866,
        //     "orderId": 1717384395096065,
        //     "side": 1,
        //     "execAmt": 8.887161000000000000,
        //     "selfDealingQty": 0E-18,
        //     "tradeId": 11523732,
        //     "fee": 0.081800000000000000,
        //     "matchTime": 1637825389,
        //     "seq": null
        // }
        const timestamp = this.safeNumber (trade, 'matchTime', 0) * 1000;
        // Docs claim this is a string 'TAKER' or 'MAKER', but example shows 1
        const role = this.safeStringLower (trade, 'role');
        let takerOrMaker = 'maker';
        if (role === '1' || role === 'taker') {
            takerOrMaker = 'taker';
        }
        // const numericId = this.safeString (trade, 'instrumentId');
        // const symbol = this.safeString (coinstoreMarketsByNumericId, numericId);
        const symbol = market['symbol'];
        const feeCurrencyId = this.safeNumber (trade, 'feeCurrencyId');
        const baseCurrencyId = this.safeNumber (trade, 'baseCurrencyId');
        const rate = this.safeNumber (trade, 'acturalFeeRate');
        const fee = this.safeNumber (trade, 'fee');
        const feeCurrency = feeCurrencyId === baseCurrencyId ? market['base'] : market['quote'];
        const cost = this.safeString (trade, 'execAmt');
        const amount = this.safeString (trade, 'execQty');
        const price = Precise.stringDiv (cost, amount);
        const order = this.safeString (trade, 'orderId');
        let side = undefined;
        if (this.safeNumber (trade, 'side') === 1) {
            side = 'buy';
        }
        if (this.safeNumber (trade, 'side') === -1) {
            side = 'sell';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': order,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.parseNumber (price),
            'amount': this.parseNumber (amount),
            'cost': this.parseNumber (cost),
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
                'rate': rate,
            },
        }, market);
    }

    parseTrade (trade, market = undefined) {
        if (this.safeString (trade, 'channel')) {
            return this.parsePublicTrade (trade, market);
        }
        return this.parsePrivateTrade (trade, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coinstore-openapi.github.io/en/index.html#get-depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {number} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        this.checkRequiredSymbol ('fetchOrderBook', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetApiV1MarketDepthSymbol (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderbook, symbol, Date.now (), 'b', 'a', 0, 1);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name coinstore#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://coinstore-openapi.github.io/en/#ticker-related
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let id = this.marketId (symbol);
        id = id.toUpperCase ();
        const response = await this.publicGetApiV1MarketTickers (params);
        const tickers = this.filterByArray (this.safeValue (response, 'data'), 'symbol', [ id ], false);
        const ticker = this.safeValue (tickers, 0);
        if (!ticker) {
            throw new BadSymbol (this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        return this.parseTicker (ticker);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://coinstore-openapi.github.io/en/index.html#ticker
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const ids = Object.keys (this.markets_by_id);
        for (let i = 0; i < ids.length; i++) {
            ids[i] = ids[i].toUpperCase ();
        }
        const response = await this.publicGetApiV1MarketTickers (params);
        // We need to filter out tickers for markets that are not in the market list (coinstore doesn't return all markets in the market info endpoint)
        const tickers = this.filterByArray (this.safeValue (response, 'data'), 'symbol', ids);
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "channel": "ticker",
        //     "bidSize": "454.2",
        //     "askSize": "542.6",
        //     "count": 41723,
        //     "volume": "24121351.85",
        //     "amount": "1693799.10798965",
        //     "close": "0.067998",
        //     "open": "0.071842",
        //     "high": "0.072453",
        //     "low": "0.067985",
        //     "bid": "0.0679",
        //     "ask": "0.0681",
        //     "symbol": "TRXUSDT",
        //     "instrumentId": 2
        // }
        const marketId = this.safeStringLower (ticker, 'symbol');
        market = this.market (marketId);
        const open = this.safeNumber (ticker, 'open');
        const high = this.safeNumber (ticker, 'high');
        const low = this.safeNumber (ticker, 'low');
        const close = this.safeNumber (ticker, 'close');
        const last = close;
        const quoteVolume = this.safeNumber (ticker, 'volume');
        const baseVolume = this.safeNumber (ticker, 'amount');
        const bid = this.safeNumber (ticker, 'bid');
        const ask = this.safeNumber (ticker, 'ask');
        const change = open - close;
        const vwap = quoteVolume / baseVolume;
        const average = (open + close) / 2;
        const percentage = (change / open) * 100;
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name coinstore#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://coinstore-openapi.github.io/en/#assets-balance
         * @param {object} [params] extra parameters specific to the conistore api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostApiSpotAccountList ();
        return this.parseBalance (response);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'data', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const type = this.safeNumber (balance, 'type');
            const currencyId = this.safeStringLower (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.safeValue (result, code, this.account ());
            if (type === 1) {
                // this is the 'available' balance
                account['free'] = this.safeNumber (balance, 'balance', 0);
                account['used'] = this.safeNumber (account, 'used', 0);
            } else if (type === 4) {
                account['used'] = this.safeNumber (balance, 'balance', 0);
                account['free'] = this.safeNumber (account, 'free', 0);
            }
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#createOrder
         * @description create a trade order
         * @see https://coinstore-openapi.github.io/en/#create-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {number} amount how much of currency you want to trade in units of base currency
         * @param {number} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @param {string} [params.clOrdId] a custom order ID
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol ('createOrder', symbol);
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'ordType': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (request['ordType'] === 'LIMIT') {
            request['ordPrice'] = this.priceToPrecision (symbol, price);
        }
        if (request['ordType'] === 'MARKET' && side.toLowerCase () === 'buy') {
            const ordAmt = this.safeNumber (params, 'ordAmt');
            if (amount !== undefined) {
                throw new BadRequest (this.id + ' createOrder () does not support the amount parameter for market buy orders, for the amount of quote currency to spend use the ordAmt parameter');
            }
            if (!ordAmt) {
                throw new BadRequest (this.id + ' createOrder () requires an ordAmt parameter for market buy orders, for the amount of quote currency to spend');
            }
            request['ordAmt'] = this.priceToPrecision (symbol, ordAmt);
        } else {
            request['ordQty'] = this.amountToPrecision (symbol, amount);
        }
        request['timestamp'] = this.milliseconds ();
        const response = await this.privatePostApiTradeOrderPlace (this.extend (request, params));
        const responseData = this.safeValue (response, 'data', {});
        return this.parseSubmittedOrder (request, responseData);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#cancelOrder
         * @description cancels an open order
         * @see https://coinstore-openapi.github.io/en/index.html#cancel-orders
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredArgument ('cancelOrder', symbol, 'symbol');
        this.checkRequiredArgument ('cancelOrder', id, 'id');
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'ordId': id,
        };
        const response = await this.privatePostApiTradeOrderCancel (this.extend (request, params));
        return this.parseCanceledOrder (request, response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#cancelAllOrders
         * @description cancel all open orders
         * @see https://coinstore-openapi.github.io/en/index.html#one-click-cancellation
         * @param {string|undefined} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        // The response for this endpoint is empty, so to return the correct information we should use the fetchOrders endpoint
        const cancelResponse = await this.privatePostApiTradeOrderCancelAll (this.extend (request, params));
        const canceledOrderIds = this.safeValue (this.safeValue (cancelResponse, 'data', {}), 'canceling', []);
        // Stringify these ids
        for (let i = 0; i < canceledOrderIds.length; i++) {
            canceledOrderIds[i] = canceledOrderIds[i].toString ();
        }
        const endTimestamp = Date.now ();
        try {
            const orderResponse = await this.fetchOrders (symbol, undefined, undefined, { 'endTime': endTimestamp, 'ordType': 'LIMIT' });
            return Object.values (this.filterByArray (orderResponse, 'id', canceledOrderIds));
        } catch (e) {
            // return an empty array; the fetchOrders call failed, but cancelation succeeded
            return [];
        }
    }

    parseCanceledOrder (request, response) {
        // request:
        // {
        //    "symbol": "btcusdt",
        //    "ordId": 1722183748419690
        // }
        //
        // response:
        // {
        //     "code": 0,
        //     "data": {
        //         "clientOrderId": "b1b2ea5e00a84b888d419cb73f8eb203",
        //         "state": "CANCELED",
        //         "ordId": 1722183748419690
        //     }
        // }
        const data = this.safeValue (response, 'data');
        const orderId = this.safeValue (data, 'ordId');
        const symbol = this.safeString (request, 'symbol');
        const market = this.market (symbol);
        const info = this.extend ({ 'request': request }, { 'response': response });
        return this.safeOrder ({
            'info': info,
            'id': orderId,
            'symbol': symbol,
            'status': 'canceled',
        }, market);
    }

    parseSubmittedOrder (request, response) {
        // response (docs are wrong):
        // {
        //     "code": "0",
        //     "data": {
        //         "ordId": 11594964764657880
        //     }
        // }
        const orderId = this.safeNumber (response, 'ordId');
        const info = this.extend ({ 'request': request }, { 'response': response });
        const marketId = this.safeStringLower (request, 'symbol');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const side = this.safeStringLower (request, 'side');
        const type = this.safeStringLower (request, 'ordType');
        const price = this.safeNumber (request, 'ordPrice');
        const amount = this.safeNumber (request, 'ordQty');
        return this.safeOrder ({
            'info': info,
            'id': orderId,
            'symbol': symbol,
            'side': side,
            'type': type,
            'price': price,
            'amount': amount,
        }, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchOrders
         * @see https://coinstore-openapi.github.io/en/#get-current-orders-v2
         * @description fetch all open orders orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            // set to max, because we use this for fetchClosedOrders, but there's no status filter
            request['size'] = 100;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetApiTradeOrderHistoryOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const orders = this.safeValue (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        // history response format:
        // {
        //     "baseCurrency": "USDC",
        //     "quoteCurrency": "USDT",
        //     "side": "SELL",
        //     "cumQty": "22",
        //     "ordId": 1773897094529949,
        //     "clOrdId": "0",
        //     "ordType": "LIMIT",
        //     "ordQty": "98.48",
        //     "cumAmt": "21.7752",
        //     "timeInForce": "GTC",
        //     "ordPrice": "0.9896",
        //     "leavesQty": "0",
        //     "avgPrice": "0.9898",
        //     "ordState": "CANCELED",
        //     "symbol": "USDCUSDT",
        //     "timestamp": 1691720096406,
        //     "accountId": 3643140,
        //     "feeCurrency": "USDT",
        //     "ordAmt": "97.455808"
        // },
        // active response format:
        // {
        //     "baseCurrency": "A123",
        //     "quoteCurrency": "USDT",
        //     "side": "BUY",
        //     "cumQty": "0",
        //     "ordId": 1758065956225025,
        //     "clOrdId": "tLCGVA4g19zuEBwsITXi9g3U624Al0Bw",
        //     "ordType": "LIMIT",
        //     "ordQty": "10",
        //     "cumAmt": "0",
        //     "accountId": 1134912,
        //     "timeInForce": "GTC",
        //     "ordPrice": "100",
        //     "leavesQty": "10",
        //     "avgPrice": "0",
        //     "ordStatus": "SUBMITTED",
        //     "symbol": "A123USDT",
        //     "timestamp": 1676622290389
        // }
        const timestamp = this.safeNumber (order, 'timestamp');
        const feeCurrency = this.safeString (order, 'feeCurrency');
        let fee = undefined;
        if (feeCurrency) {
            fee = {
                'currency': this.safeCurrencyCode (feeCurrency),
            };
        }
        const filledAmount = this.safeString (order, 'cumQty', '0');
        const filledAmountNumber = this.parseNumber (filledAmount);
        const amount = this.safeString (order, 'ordQty');
        const cost = this.safeString (order, 'cumAmt');
        const remaining = Precise.stringSub (amount, filledAmount);
        const average = filledAmountNumber !== 0 ? Precise.stringDiv (cost, filledAmount) : undefined;
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'ordId'),
            'clientOrderId': this.safeString (order, 'clOrdId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeSymbol (this.safeStringLower (order, 'symbol'), market),
            'type': this.safeStringLower (order, 'ordType'),
            'timeInForce': 'GTC',
            'postOnly': undefined,
            'side': this.safeStringLower ('order', 'side'),
            'price': this.safeNumber (order, 'ordPrice'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.parseNumber (amount),
            'filled': filledAmountNumber,
            'remaining': this.parseNumber (remaining),
            'average': average ? this.parseNumber (average) : undefined,
            'status': this.parseOrderStatus (this.safeString2 (order, 'ordStatus', 'ordState')),
            'trades': undefined,
            'fee': fee,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'REJECTED': 'rejected',
            'SUBMITTING': 'open',
            'SUBMITTED': 'open',
            'PARTIAL_FILLED': 'open',
            'CANCELING': 'canceled',
            'CANCELED': 'canceled',
            'EXPIRED': 'expired',
            'STOPPED': 'closed',
            'FILLED': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} [params] extra parameters specific to the coinstore api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // const parsedOrders = await this.fetchOrders (symbol, undefined, undefined, params);
        // const filteredOrders = this.filterBy (parsedOrders, 'status', 'open');
        // if (since !== undefined || limit !== undefined) {
        //     return this.filterBySinceLimit (filteredOrders, since, limit);
        // }
        // return filteredOrders;
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetApiV2TradeOrderActive (this.extend (request, params));
        let data = this.safeValue (response, 'data');
        if (since !== undefined || limit !== undefined) {
            data = this.filterBySinceLimit (data, since, limit);
        }
        return this.parseOrders (data, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} [symbol] unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const parsedOrders = await this.fetchOrders (symbol, undefined, undefined, params);
        const filteredOrders = this.filterByArray (parsedOrders, 'status', [ 'canceled', 'rejected', 'expired', 'closed' ], false);
        if (since !== undefined || limit !== undefined) {
            return this.filterBySinceLimit (filteredOrders, since, limit);
        }
        return filteredOrders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinstore#fetchMyTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://coinstore-openapi.github.io/en/#get-user-39-s-latest-trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {number} [since] timestamp used to filter out older trades
         * @param {number} [limit] the maximum amount of trades to fetch
         * @param {object} [params={}] extra parameters specific to the coinstore api endpoint
         * @param {string} [params.ordId] the order to get trades for
         * @param {number} [params.pageNum] which page of trades to list
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        this.checkRequiredSymbol ('fetchMyTrades', symbol);
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetApiTradeMatchAccountMatches (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        // const tradesParsed = this.parseTrades (trades, market, since)
        return this.parseTrades (trades, market, since);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = {}, body = undefined) {
        /**
         * @method
         * @name coinstore#sign
         * @description signs and initiates the request
         * @see https://coinstore-openapi.github.io/en/#signature-authentication
         * @param {string} path the path to be appended to the URL
         * @param {'GET' | 'POST'} method extra parameters specific to the coinstore api endpoint
         * @param {object} [params] parameters to use for the path (for v1 symbols) or the query string
         * @param {object} [headers] headers to use for the request
         * @param {object} [body] body to use for the request
         * @returns {object} an associative dictionary of currencies
         */
        let url = this.urls['api']['spot'];
        url = this.implodeHostname (url);
        // v1 api implodes 'symbol' for some endpoints
        path = this.implodeParams (path, params);
        url += '/' + path;
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        let paramString = '';
        let bodyString = '';
        if (method === 'GET') {
            paramString = this.urlencode (params);
        } else {
            bodyString = JSON.stringify (params);
        }
        if (paramString.length) {
            url += '?' + paramString;
        }
        headers['Content-Type'] = 'application/json';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds () + 2000;
            headers['X-CS-EXPIRES'] = timestamp.toString ();
            headers['X-CS-APIKEY'] = this.apiKey;
            const expiresKey = Math.floor (timestamp / 30000);
            const expiresKeyString = expiresKey.toString ();
            const expiresHmac = this.hmac (this.encode (expiresKeyString), this.encode (this.secret), sha256, 'hex');
            headers['X-CS-SIGN'] = this.hmac (this.encode (paramString + bodyString), this.encode (expiresHmac), sha256, 'hex');
        }
        if (method === 'POST') {
            return { 'url': url, 'method': method, 'body': bodyString, 'headers': headers };
        }
        return { 'url': url, 'method': method, 'headers': headers };
        // if (Object.keys (body).length === 0) {
        // }
        // return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], code, reason);
        }
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const responseCode = this.safeNumber (response, 'code');
        if (responseCode !== 0) {
            const message = this.safeString (response, 'message');
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, message);
            throw new BadRequest (this.id + ' failed with code ' + responseCode + ' and message ' + message + '. Check your arguments and parameters');
        }
    }
}
