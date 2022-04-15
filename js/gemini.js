'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, OrderNotFound, InvalidOrder, InvalidNonce, InsufficientFunds, AuthenticationError, PermissionDenied, NotSupported, OnMaintenance, RateLimitExceeded, ExchangeNotAvailable } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class gemini extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gemini',
            'name': 'Gemini',
            'countries': [ 'US' ],
            // 600 requests a minute = 10 requests per second => 1000ms / 10 = 100ms between requests (private endpoints)
            // 120 requests a minute = 2 requests per second => ( 1000ms / rateLimit ) / 2 = 5 (public endpoints)
            'rateLimit': 100,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': undefined,
                'fetchDepositAddress': undefined, // TODO
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': undefined,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': undefined,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
                'api': {
                    'public': 'https://api.gemini.com',
                    'private': 'https://api.gemini.com',
                    'web': 'https://docs.gemini.com',
                },
                'www': 'https://gemini.com/',
                'doc': [
                    'https://docs.gemini.com/rest-api',
                    'https://docs.sandbox.gemini.com',
                ],
                'test': {
                    'public': 'https://api.sandbox.gemini.com',
                    'private': 'https://api.sandbox.gemini.com',
                    // use the true doc instead of the sandbox doc
                    // since they differ in parsing
                    // https://github.com/ccxt/ccxt/issues/7874
                    // https://github.com/ccxt/ccxt/issues/7894
                    'web': 'https://docs.gemini.com',
                },
                'fees': [
                    'https://gemini.com/api-fee-schedule',
                    'https://gemini.com/trading-fees',
                    'https://gemini.com/transfer-fees',
                ],
            },
            'api': {
                'web': {
                    'get': [
                        'rest-api',
                    ],
                },
                'public': {
                    'get': {
                        'v1/symbols': 5,
                        'v1/symbols/details/{symbol}': 5,
                        'v1/pubticker/{symbol}': 5,
                        'v2/ticker/{symbol}': 5,
                        'v2/candles/{symbol}/{timeframe}': 5,
                        'v1/trades/{symbol}': 5,
                        'v1/auction/{symbol}': 5,
                        'v1/auction/{symbol}/history': 5,
                        'v1/pricefeed': 5,
                        'v1/book/{symbol}': 5,
                        'v1/earn/rates': 5,
                    },
                },
                'private': {
                    'post': {
                        'v1/order/new': 1,
                        'v1/order/cancel': 1,
                        'v1/wrap/{symbol}': 1,
                        'v1/order/cancel/session': 1,
                        'v1/order/cancel/all': 1,
                        'v1/order/status': 1,
                        'v1/orders': 1,
                        'v1/mytrades': 1,
                        'v1/notionalvolume': 1,
                        'v1/tradevolume': 1,
                        'v1/clearing/new': 1,
                        'v1/clearing/status': 1,
                        'v1/clearing/cancel': 1,
                        'v1/clearing/confirm': 1,
                        'v1/balances': 1,
                        'v1/notionalbalances/{currency}': 1,
                        'v1/transfers': 1,
                        'v1/addresses/{network}': 1,
                        'v1/deposit/{network}/newAddress': 1,
                        'v1/deposit/{currency}/newAddress': 1,
                        'v1/withdraw/{currency}': 1,
                        'v1/account/transfer/{currency}': 1,
                        'v1/payments/addbank': 1,
                        'v1/payments/methods': 1,
                        'v1/payments/sen/withdraw': 1,
                        'v1/balances/earn': 1,
                        'v1/earn/interest': 1,
                        'v1/approvedAddresses/{network}/request': 1,
                        'v1/approvedAddresses/account/{network}': 1,
                        'v1/approvedAddresses/{network}/remove': 1,
                        'v1/account': 1,
                        'v1/account/create': 1,
                        'v1/account/list': 1,
                        'v1/heartbeat': 1,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'taker': 0.004,
                    'maker': 0.002,
                },
            },
            'httpExceptions': {
                '400': BadRequest, // Auction not open or paused, ineligible timing, market not open, or the request was malformed, in the case of a private API request, missing or malformed Gemini private API authentication headers
                '403': PermissionDenied, // The API key is missing the role necessary to access this private API endpoint
                '404': OrderNotFound, // Unknown API entry point or Order not found
                '406': InsufficientFunds, // Insufficient Funds
                '429': RateLimitExceeded, // Rate Limiting was applied
                '500': ExchangeError, // The server encountered an error
                '502': ExchangeNotAvailable, // Technical issues are preventing the request from being satisfied
                '503': OnMaintenance, // The exchange is down for maintenance
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1hr',
                '6h': '6hr',
                '1d': '1day',
            },
            'exceptions': {
                'exact': {
                    'AuctionNotOpen': BadRequest, // Failed to place an auction-only order because there is no current auction open for this symbol
                    'ClientOrderIdTooLong': BadRequest, // The Client Order ID must be under 100 characters
                    'ClientOrderIdMustBeString': BadRequest, // The Client Order ID must be a string
                    'ConflictingOptions': BadRequest, // New orders using a combination of order execution options are not supported
                    'EndpointMismatch': BadRequest, // The request was submitted to an endpoint different than the one in the payload
                    'EndpointNotFound': BadRequest, // No endpoint was specified
                    'IneligibleTiming': BadRequest, // Failed to place an auction order for the current auction on this symbol because the timing is not eligible, new orders may only be placed before the auction begins.
                    'InsufficientFunds': InsufficientFunds, // The order was rejected because of insufficient funds
                    'InvalidJson': BadRequest, // The JSON provided is invalid
                    'InvalidNonce': InvalidNonce, // The nonce was not greater than the previously used nonce, or was not present
                    'InvalidOrderType': InvalidOrder, // An unknown order type was provided
                    'InvalidPrice': InvalidOrder, // For new orders, the price was invalid
                    'InvalidQuantity': InvalidOrder, // A negative or otherwise invalid quantity was specified
                    'InvalidSide': InvalidOrder, // For new orders, and invalid side was specified
                    'InvalidSignature': AuthenticationError, // The signature did not match the expected signature
                    'InvalidSymbol': BadRequest, // An invalid symbol was specified
                    'InvalidTimestampInPayload': BadRequest, // The JSON payload contained a timestamp parameter with an unsupported value.
                    'Maintenance': OnMaintenance, // The system is down for maintenance
                    'MarketNotOpen': InvalidOrder, // The order was rejected because the market is not accepting new orders
                    'MissingApikeyHeader': AuthenticationError, // The X-GEMINI-APIKEY header was missing
                    'MissingOrderField': InvalidOrder, // A required order_id field was not specified
                    'MissingRole': AuthenticationError, // The API key used to access this endpoint does not have the required role assigned to it
                    'MissingPayloadHeader': AuthenticationError, // The X-GEMINI-PAYLOAD header was missing
                    'MissingSignatureHeader': AuthenticationError, // The X-GEMINI-SIGNATURE header was missing
                    'NoSSL': AuthenticationError, // You must use HTTPS to access the API
                    'OptionsMustBeArray': BadRequest, // The options parameter must be an array.
                    'OrderNotFound': OrderNotFound, // The order specified was not found
                    'RateLimit': RateLimitExceeded, // Requests were made too frequently. See Rate Limits below.
                    'System': ExchangeError, // We are experiencing technical issues
                    'UnsupportedOption': BadRequest, // This order execution option is not supported.
                },
                'broad': {
                    'The Gemini Exchange is currently undergoing maintenance.': OnMaintenance, // The Gemini Exchange is currently undergoing maintenance. Please check https://status.gemini.com/ for more information.
                    'We are investigating technical issues with the Gemini Exchange.': ExchangeNotAvailable, // We are investigating technical issues with the Gemini Exchange. Please check https://status.gemini.com/ for more information.
                },
            },
            'options': {
                'fetchMarketsMethod': 'fetch_markets_from_web',
                'fetchTickerMethod': 'fetchTickerV1', // fetchTickerV1, fetchTickerV2, fetchTickerV1AndV2
                'networkIds': {
                    'bitcoin': 'BTC',
                    'ethereum': 'ERC20',
                    'bitcoincash': 'BCH',
                    'litecoin': 'LTC',
                    'zcash': 'ZEC',
                    'filecoin': 'FIL',
                    'dogecoin': 'DOGE',
                    'tezos': 'XTZ',
                },
                'networks': {
                    'BTC': 'bitcoin',
                    'ERC20': 'ethereum',
                    'BCH': 'bitcoincash',
                    'LTC': 'litecoin',
                    'ZEC': 'zcash',
                    'FIL': 'filecoin',
                    'DOGE': 'dogecoin',
                    'XTZ': 'tezos',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const method = this.safeValue (this.options, 'fetchMarketsMethod', 'fetch_markets_from_api');
        return await this[method] (params);
    }

    async fetchMarketsFromWeb (params = {}) {
        const response = await this.webGetRestApi (params);
        const sections = response.split ('<h1 id="symbols-and-minimums">Symbols and minimums</h1>');
        const numSections = sections.length;
        const error = this.id + ' the ' + this.name + ' API doc HTML markup has changed, breaking the parser of order limits and precision info for ' + this.name + ' markets.';
        if (numSections !== 2) {
            throw new NotSupported (error);
        }
        const tables = sections[1].split ('tbody>');
        const numTables = tables.length;
        if (numTables < 2) {
            throw new NotSupported (error);
        }
        const rows = tables[1].split ("\n<tr>\n"); // eslint-disable-line quotes
        const numRows = rows.length;
        if (numRows < 2) {
            throw new NotSupported (error);
        }
        const result = [];
        // skip the first element (empty string)
        for (let i = 1; i < numRows; i++) {
            const row = rows[i];
            const cells = row.split ("</td>\n"); // eslint-disable-line quotes
            const numCells = cells.length;
            if (numCells < 5) {
                throw new NotSupported (error);
            }
            //     [
            //         '<td>btcusd', // currency
            //         '<td>0.00001 BTC (1e-5)', // min order size
            //         '<td>0.00000001 BTC (1e-8)', // tick size
            //         '<td>0.01 USD', // quote currency price increment
            //         '</tr>'
            //     ]
            const marketId = cells[0].replace ('<td>', '');
            // const base = this.safeCurrencyCode (baseId);
            const minAmountString = cells[1].replace ('<td>', '');
            const minAmountParts = minAmountString.split (' ');
            const minAmount = this.safeNumber (minAmountParts, 0);
            const amountPrecisionString = cells[2].replace ('<td>', '');
            const amountPrecisionParts = amountPrecisionString.split (' ');
            const idLength = marketId.length - 0;
            const startingIndex = idLength - 3;
            const pricePrecisionString = cells[3].replace ('<td>', '');
            const pricePrecisionParts = pricePrecisionString.split (' ');
            const quoteId = this.safeStringLower (pricePrecisionParts, 1, marketId.slice (startingIndex, idLength));
            const baseId = this.safeStringLower (amountPrecisionParts, 1, marketId.replace (quoteId, ''));
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (amountPrecisionParts, 0),
                    'price': this.safeNumber (pricePrecisionParts, 0),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minAmount,
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
                'info': row,
            });
        }
        return result;
    }

    async fetchMarketsFromAPI (params = {}) {
        const response = await this.publicGetV1Symbols (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const marketId = response[i];
            const market = marketId;
            const idLength = marketId.length - 0;
            const baseId = marketId.slice (0, idLength - 3);
            const quoteId = marketId.slice (idLength - 3, idLength);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': undefined,
                    'amount': undefined,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit;
            request['limit_asks'] = limit;
        }
        const response = await this.publicGetV1BookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickerV1 (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1PubtickerSymbol (this.extend (request, params));
        //
        //     {
        //         "bid":"9117.95",
        //         "ask":"9117.96",
        //         "volume":{
        //             "BTC":"1615.46861748",
        //             "USD":"14727307.57545006088",
        //             "timestamp":1594982700000
        //         },
        //         "last":"9115.23"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickerV2 (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2TickerSymbol (this.extend (request, params));
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "open":"9080.58",
        //         "high":"9184.53",
        //         "low":"9063.56",
        //         "close":"9116.08",
        //         // Hourly prices descending for past 24 hours
        //         "changes":["9117.33","9105.69","9106.23","9120.35","9098.57","9114.53","9113.55","9128.01","9113.63","9133.49","9133.49","9137.75","9126.73","9103.91","9119.33","9123.04","9124.44","9117.57","9114.22","9102.33","9076.67","9074.72","9074.97","9092.05"],
        //         "bid":"9115.86",
        //         "ask":"9115.87"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickerV1AndV2 (symbol, params = {}) {
        const tickerA = await this.fetchTickerV1 (symbol, params);
        const tickerB = await this.fetchTickerV2 (symbol, params);
        return this.deepExtend (tickerA, {
            'open': tickerB['open'],
            'high': tickerB['high'],
            'low': tickerB['low'],
            'change': tickerB['change'],
            'percentage': tickerB['percentage'],
            'average': tickerB['average'],
            'info': tickerB['info'],
        });
    }

    async fetchTicker (symbol, params = {}) {
        const method = this.safeValue (this.options, 'fetchTickerMethod', 'fetchTickerV1');
        return await this[method] (symbol, params);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTickers
        //
        //     {
        //         "pair": "BATUSD",
        //         "price": "0.20687",
        //         "percentChange24h": "0.0146"
        //     }
        //
        // fetchTickerV1
        //
        //     {
        //         "bid":"9117.95",
        //         "ask":"9117.96",
        //         "volume":{
        //             "BTC":"1615.46861748",
        //             "USD":"14727307.57545006088",
        //             "timestamp":1594982700000
        //         },
        //         "last":"9115.23"
        //     }
        //
        // fetchTickerV2
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "open":"9080.58",
        //         "high":"9184.53",
        //         "low":"9063.56",
        //         "close":"9116.08",
        //         // Hourly prices descending for past 24 hours
        //         "changes":["9117.33","9105.69","9106.23","9120.35","9098.57","9114.53","9113.55","9128.01","9113.63","9133.49","9133.49","9137.75","9126.73","9103.91","9119.33","9123.04","9124.44","9117.57","9114.22","9102.33","9076.67","9074.72","9074.97","9092.05"],
        //         "bid":"9115.86",
        //         "ask":"9115.87"
        //     }
        //
        const volume = this.safeValue (ticker, 'volume', {});
        const timestamp = this.safeInteger (volume, 'timestamp');
        let symbol = undefined;
        const marketId = this.safeStringLower (ticker, 'pair');
        market = this.safeMarket (marketId, market);
        let baseId = undefined;
        let quoteId = undefined;
        let base = undefined;
        let quote = undefined;
        if ((marketId !== undefined) && (market === undefined)) {
            const idLength = marketId.length - 0;
            if (idLength === 7) {
                baseId = marketId.slice (0, 4);
                quoteId = marketId.slice (4, 7);
            } else {
                baseId = marketId.slice (0, 3);
                quoteId = marketId.slice (3, 6);
            }
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
            baseId = this.safeStringUpper (market, 'baseId');
            quoteId = this.safeStringUpper (market, 'quoteId');
        }
        const price = this.safeString (ticker, 'price');
        const last = this.safeString2 (ticker, 'last', 'close', price);
        const percentage = this.safeString (ticker, 'percentChange24h');
        const open = this.safeString (ticker, 'open');
        const baseVolume = this.safeString (volume, baseId);
        const quoteVolume = this.safeString (volume, quoteId);
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
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetV1Pricefeed (params);
        //
        //     [
        //         {
        //             "pair": "BATUSD",
        //             "price": "0.20687",
        //             "percentChange24h": "0.0146"
        //         },
        //         {
        //             "pair": "LINKETH",
        //             "price": "0.018",
        //             "percentChange24h": "0.0000"
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "timestamp":1601617445,
        //         "timestampms":1601617445144,
        //         "tid":14122489752,
        //         "price":"0.46476",
        //         "amount":"28.407209",
        //         "exchange":"gemini",
        //         "type":"buy"
        //     }
        //
        // private fetchTrades
        //
        //      {
        //          "price":"3900.00",
        //          "amount":"0.00996",
        //          "timestamp":1638891173,
        //          "timestampms":1638891173518,
        //          "type":"Sell",
        //          "aggressor":false,
        //          "fee_currency":"EUR",
        //          "fee_amount":"0.00",
        //          "tid":73621746145,
        //          "order_id":"73621746059",
        //          "exchange":"gemini",
        //          "is_auction_fill":false,
        //          "is_clearing_fill":false,
        //          "symbol":"ETHEUR",
        //          "client_order_id":"1638891171610"
        //      }
        //
        const timestamp = this.safeInteger (trade, 'timestampms');
        const id = this.safeString (trade, 'tid');
        const orderId = this.safeString (trade, 'order_id');
        const feeCurrencyId = this.safeString (trade, 'fee_currency');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        const fee = {
            'cost': this.safeString (trade, 'fee_amount'),
            'currency': feeCurrencyCode,
        };
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const side = this.safeStringLower (trade, 'type');
        const symbol = this.safeSymbol (undefined, market);
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'cost': undefined,
            'amount': amountString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1TradesSymbol (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp":1601617445,
        //             "timestampms":1601617445144,
        //             "tid":14122489752,
        //             "price":"0.46476",
        //             "amount":"28.407209",
        //             "exchange":"gemini",
        //             "type":"buy"
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseBalance (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['total'] = this.safeString (balance, 'amount');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostV1Notionalvolume (params);
        //
        //      {
        //          "web_maker_fee_bps": 25,
        //          "web_taker_fee_bps": 35,
        //          "web_auction_fee_bps": 25,
        //          "api_maker_fee_bps": 10,
        //          "api_taker_fee_bps": 35,
        //          "api_auction_fee_bps": 20,
        //          "fix_maker_fee_bps": 10,
        //          "fix_taker_fee_bps": 35,
        //          "fix_auction_fee_bps": 20,
        //          "block_maker_fee_bps": 0,
        //          "block_taker_fee_bps": 50,
        //          "notional_30d_volume": 150.00,
        //          "last_updated_ms": 1551371446000,
        //          "date": "2019-02-28",
        //          "notional_1d_volume": [
        //              {
        //                  "date": "2019-02-22",
        //                  "notional_volume": 75.00
        //              },
        //              {
        //                  "date": "2019-02-14",
        //                  "notional_volume": 75.00
        //              }
        //          ]
        //     }
        //
        const makerBps = this.safeString (response, 'api_maker_fee_bps');
        const takerBps = this.safeString (response, 'api_taker_fee_bps');
        const makerString = Precise.stringDiv (makerBps, '10000');
        const takerString = Precise.stringDiv (takerBps, '10000');
        const maker = this.parseNumber (makerString);
        const taker = this.parseNumber (takerString);
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostV1Balances (params);
        return this.parseBalance (response);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'timestampms');
        const amount = this.safeString (order, 'original_amount');
        const remaining = this.safeString (order, 'remaining_amount');
        const filled = this.safeString (order, 'executed_amount');
        let status = 'closed';
        if (order['is_live']) {
            status = 'open';
        }
        if (order['is_cancelled']) {
            status = 'canceled';
        }
        const price = this.safeString (order, 'price');
        const average = this.safeString (order, 'avg_execution_price');
        let type = this.safeString (order, 'type');
        if (type === 'exchange limit') {
            type = 'limit';
        } else if (type === 'market buy' || type === 'market sell') {
            type = 'market';
        } else {
            type = order['type'];
        }
        const fee = undefined;
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString (order, 'order_id');
        const side = this.safeStringLower (order, 'side');
        const clientOrderId = this.safeString (order, 'client_order_id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': average,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostV1OrderStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostV1Orders (params);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol); // throws on non-existent symbol
        }
        return this.parseOrders (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const nonce = this.nonce ();
        const amountString = this.amountToPrecision (symbol, amount);
        const priceString = this.priceToPrecision (symbol, price);
        const request = {
            'client_order_id': nonce.toString (),
            'symbol': this.marketId (symbol),
            'amount': amountString,
            'price': priceString,
            'side': side,
            'type': 'exchange limit', // gemini allows limit orders only
        };
        const response = await this.privatePostV1OrderNew (this.extend (request, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        return await this.privatePostV1OrderCancel (this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit_trades'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.privatePostV1Mytrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostV1WithdrawCurrency (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'txHash'),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit_transfers'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.privatePostV1Transfers (this.extend (request, params));
        return this.parseTransactions (response);
    }

    parseTransaction (transaction, currency = undefined) {
        const timestamp = this.safeInteger (transaction, 'timestampms');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'destination');
        const type = this.safeStringLower (transaction, 'type');
        let status = 'pending';
        // When deposits show as Advanced or Complete they are available for trading.
        if (transaction['status']) {
            status = 'ok';
        }
        let fee = undefined;
        const feeAmount = this.safeNumber (transaction, 'feeAmount');
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'eid'),
            'txid': this.safeString (transaction, 'txHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined, // or is it defined?
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type, // direction of the transaction, ('deposit' | 'withdraw')
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //      {
        //          address: "0xed6494Fe7c1E56d1bd6136e89268C51E32d9708B",
        //          timestamp: "1636813923098",
        //          addressVersion: "eV1"                                         }
        //      }
        //
        const address = this.safeString (depositAddress, 'address');
        return {
            'currency': currency,
            'network': undefined,
            'address': address,
            'tag': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code, params = {}) {
        await this.loadMarkets ();
        const network = this.safeString (params, 'network');
        if (network === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddressesByNetwork() requires a network parameter');
        }
        params = this.omit (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        const networkId = this.safeString (networks, network, network);
        const networkIds = this.safeValue (this.options, 'networkIds', {});
        const networkCode = this.safeString (networkIds, networkId, network);
        const request = {
            'network': networkId,
        };
        const response = await this.privatePostV1AddressesNetwork (this.extend (request, params));
        const results = this.parseDepositAddresses (response, [ code ], false, { 'network': networkCode, 'currency': code });
        return this.groupBy (results, 'network');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const apiKey = this.apiKey;
            if (apiKey.indexOf ('account') < 0) {
                throw new AuthenticationError (this.id + ' sign() requires an account-key, master-keys are not-supported');
            }
            const nonce = this.nonce ();
            const request = this.extend ({
                'request': url,
                'nonce': nonce,
            }, query);
            let payload = this.json (request);
            payload = this.stringToBase64 (payload);
            const signature = this.hmac (payload, this.encode (this.secret), 'sha384');
            headers = {
                'Content-Type': 'text/plain',
                'X-GEMINI-APIKEY': this.apiKey,
                'X-GEMINI-PAYLOAD': this.decode (payload),
                'X-GEMINI-SIGNATURE': signature,
            };
        } else {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'][api] + url;
        if ((method === 'POST') || (method === 'DELETE')) {
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            if (typeof body === 'string') {
                const feedback = this.id + ' ' + body;
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            }
            return; // fallback to default error handler
        }
        //
        //     {
        //         "result": "error",
        //         "reason": "BadNonce",
        //         "message": "Out-of-sequence nonce <1234> precedes previously used nonce <2345>"
        //     }
        //
        const result = this.safeString (response, 'result');
        if (result === 'error') {
            const reason = this.safeString (response, 'reason');
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions['exact'], reason, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostV1DepositCurrencyNewAddress (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'timeframe': this.timeframes[timeframe],
            'symbol': market['id'],
        };
        const response = await this.publicGetV2CandlesSymbolTimeframe (this.extend (request, params));
        //
        //     [
        //         [1591515000000,0.02509,0.02509,0.02509,0.02509,0],
        //         [1591514700000,0.02503,0.02509,0.02503,0.02509,44.6405],
        //         [1591514400000,0.02503,0.02503,0.02503,0.02503,0],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }
};
