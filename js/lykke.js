'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, ExchangeError, BadRequest, InsufficientFunds, InvalidOrder, DuplicateOrderId } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lykke extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lykke',
            'name': 'Lykke',
            'countries': [ 'UK' ],
            'version': '2',
            // 300 requests per minute per method => 60000ms / 300 = 200 (/api/orders/*)
            // 120 requests per minute per method => ( 60000ms / rateLimit ) / 120 = cost = 2.5 (/api/*)
            'rateLimit': 200, // TODO: optim\ize https://lykkecity.github.io/Trading-API/#request-rate-limits
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
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
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'withdraw': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/155840500-1ea4fdf0-47c0-4daa-9597-c6c1cd51b9ec.jpg',
                'api': {
                    'public': 'https://hft-apiv2.lykke.com/api',
                    'private': 'https://hft-apiv2.lykke.com/api',
                },
                'www': 'https://www.lykke.com',
                'doc': [
                    'https://hft-apiv2.lykke.com/swagger/ui/index.html',
                    'https://lykkecity.github.io/Trading-API',
                ],
                'fees': 'https://support.lykke.com/hc/en-us/articles/115002141125-What-are-the-fees-and-charges-', // zero fee
            },
            'api': {
                'public': {
                    'get': {
                        'assetpairs': 2.5,
                        'assetpairs/{id}': 2.5,
                        'assets': 2.5,
                        'assets/{id}': 2.5,
                        'isalive': 2.5,
                        'orderbooks': 2.5,
                        'tickers': 2.5,
                        'prices': 2.5,
                        'trades/public/{assetPairId}': 2.5,
                    },
                },
                'private': {
                    'get': {
                        'balance': 2.5,
                        'trades': 2.5,
                        'trades/order/{orderId}': 2.5,
                        'orders/active': 1,
                        'orders/closed': 1,
                        'orders/{orderId}': 1,
                        'operations': 2.5,
                        'operations/deposits/addresses': 2.5,
                        'operations/deposits/addresses/{assetId}': 2.5,
                    },
                    'post': {
                        'orders/limit': 1,
                        'orders/market': 1,
                        'orders/bulk': 1,
                        'operations/withdrawals': 2.5,
                        'operations/deposits/addresses': 2.5,
                    },
                    'delete': {
                        'orders': 1,
                        'orders/{orderId}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0, // https://support.lykke.com/hc/en-us/articles/115002141125-What-are-the-fees-and-min-amounts-
                    'taker': 0,
                },
            },
            'exceptions': {
                'exact': {
                    '1001': ExchangeError,
                    '1100': ExchangeError,
                    '1101': ExchangeError,
                    '2000': BadRequest,
                    '2001': InsufficientFunds,
                    '2202': DuplicateOrderId,
                    '2003': ExchangeError,
                    '2004': NotSupported,
                    '2005': ExchangeError,
                    '2006': InsufficientFunds,
                    '2007': InsufficientFunds,
                    '2008': InsufficientFunds,
                    '2009': ExchangeError,
                    '2010': InsufficientFunds,
                    '2011': InvalidOrder,
                    '2012': InvalidOrder,
                    '2013': InvalidOrder,
                    '2014': InvalidOrder,
                    '2015': InvalidOrder,
                    '2016': InvalidOrder,
                    '2017': InvalidOrder,
                    '2018': InvalidOrder,
                    '2019': InvalidOrder,
                    '2020': InvalidOrder,
                    '2021': InvalidOrder,
                    '2022': InvalidOrder,
                    '2023': ExchangeError,
                },
                'broad': {},
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        const currencies = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 "assetId":"115a60c2-0da1-40f9-a7f2-41da723b9074",
        //                 "name":"Monaco Token",
        //                 "symbol":"MCO",
        //                 "accuracy":6,
        //                 "multiplierPower":8,
        //                 "assetAddress":"",
        //                 "blockchainIntegrationLayerId":"",
        //                 "blockchain":"ethereum",
        //                 "type":"erc20Token",
        //                 "isTradable":true,
        //                 "isTrusted":true,
        //                 "kycNeeded":false,
        //                 "blockchainWithdrawal":true,
        //                 "cashoutMinimalAmount":0.1,
        //                 "lowVolumeAmount":null,
        //                 "lykkeEntityId":"LYKKE NL",
        //                 "siriusAssetId":0,
        //                 "siriusBlockchainId":null,
        //                 "blockchainIntegrationType":"none",
        //                 "blockchainDepositEnabled":false,
        //                 "isDisabled":false
        //             }
        //         ],
        //         "error":null
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'assetId');
            const code = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name');
            const type = this.safeString (currency, 'type');
            const deposit = this.safeValue (currency, 'blockchainDepositEnabled');
            const withdraw = this.safeValue (currency, 'blockchainWithdrawal');
            const isDisabled = this.safeValue (currency, 'isDisabled');
            const active = !isDisabled;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': type,
                'name': name,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': this.safeInteger (currency, 'accuracy'),
                'limits': {
                    'withdraw': {
                        'min': this.safeValue (currency, 'cashoutMinimalAmount'),
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeValue (currency, 'lowVolumeAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAssetpairs (params);
        const markets = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 "assetPairId":"AAVEBTC",
        //                 "baseAssetId":"c9e55548-dae5-44fc-bebd-e72249cb19f3",
        //                 "quoteAssetId":"BTC",
        //                 "name":"AAVE/BTC",
        //                 "priceAccuracy":6,
        //                 "baseAssetAccuracy":6,
        //                 "quoteAssetAccuracy":8,
        //                 "minVolume":0.001,
        //                 "minOppositeVolume":0.0001
        //             }
        //         ],
        //         "error":null
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'assetPairId');
            const name = this.safeString (market, 'name');
            const baseAssetId = this.safeString (market, 'baseAssetId');
            const quoteAssetId = this.safeString (market, 'quoteAssetId');
            const [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'priceAccuracy'),
                'amount': this.safeInteger (market, 'baseAssetAccuracy'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseAssetId,
                'quoteId': quoteAssetId,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'active': true,
                'info': market,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'minVolume'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minOppositeVolume'),
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTickers
        //
        //     publicGetTickers
        //
        //     {
        //         "assetPairId":"BTCUSD",
        //         "volumeBase":2.56905016,
        //         "volumeQuote":95653.8730,
        //         "priceChange":-0.0367945778541765034194707584,
        //         "lastPrice":36840.0,
        //         "high":38371.645,
        //         "low":35903.356,
        //         "timestamp":1643295740729
        //     }
        //
        // fetchTicker
        //
        //     publicGetTickers
        //
        //     {
        //         "assetPairId":"BTCUSD",
        //         "volumeBase":2.56905016,
        //         "volumeQuote":95653.8730,
        //         "priceChange":-0.0367945778541765034194707584,
        //         "lastPrice":36840.0,
        //         "high":38371.645,
        //         "low":35903.356,
        //         "timestamp":1643295740729
        //     }
        //
        //     publicGetPrices
        //
        //     {
        //         "assetPairId":"BTCUSD",
        //         "bid":36181.521,
        //         "ask":36244.492,
        //         "timestamp":1643305510990
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'assetPairId');
        market = this.safeMarket (marketId, market);
        const close = this.safeString (ticker, 'lastPrice');
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volumeBase'),
            'quoteVolume': this.safeString (ticker, 'volumeQuote'),
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'assetPairIds': market['id'],
        };
        // publicGetTickers or publicGetPrices
        const method = this.safeString (this.options, 'fetchTickerMethod', 'publicGetTickers');
        const response = await this[method] (this.extend (request, params));
        const ticker = this.safeValue (response, 'payload', []);
        //
        // publicGetTickers
        //
        //     {
        //         "payload":[
        //             {
        //                 "assetPairId":"BTCUSD",
        //                 "volumeBase":0.78056880,
        //                 "volumeQuote":29782.5169,
        //                 "priceChange":0.0436602362590968619931324699,
        //                 "lastPrice":38626.885,
        //                 "high":38742.896,
        //                 "low":36872.498,
        //                 "timestamp":1643687822840
        //             }
        //         ],
        //         "error":null
        //     }
        //
        // publicGetPrices
        //
        //     {
        //         "payload":[
        //             {
        //                 "assetPairId":"BTCUSD",
        //                 "bid":38597.936,
        //                 "ask":38640.311,
        //                 "timestamp":1643688350847
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseTicker (this.safeValue (ticker, 0, {}), market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 "assetPairId":"BTCUSD",
        //                 "volumeBase":0.78056880,
        //                 "volumeQuote":29782.5169,
        //                 "priceChange":0.0436602362590968619931324699,
        //                 "lastPrice":38626.885,
        //                 "high":38742.896,
        //                 "low":36872.498,
        //                 "timestamp":1643687822840
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'assetPairId': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit; // default 0
        }
        const response = await this.publicGetOrderbooks (this.extend (request, params));
        const payload = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 assetPairId: 'BTCUSD',
        //                 timestamp: '1643298038203',
        //                 bids: [
        //                     {
        //                         "v":0.59034382,
        //                         "p":36665.329
        //                     }
        //                 ],
        //                 asks: [
        //                     {
        //                         "v":-0.003,
        //                         "p":36729.686
        //                     }
        //                 ]
        //             }
        //         ],
        //         "error":null
        //     }
        //
        const orderbook = this.safeValue (payload, 0, {});
        const timestamp = this.safeString (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, symbol, timestamp, 'bids', 'asks', 'p', 'v');
    }

    parseTrade (trade, market) {
        //
        //  public fetchTrades
        //
        //     {
        //         "id":"71df1f0c-be4e-4d45-b809-c108fad5f2a8",
        //         "assetPairId":"BTCUSD",
        //         "timestamp":1643345958414,
        //         "volume":0.00010996,
        //         "price":37205.723,
        //         "side":"buy"
        //      }
        //
        //  private fetchMyTrades
        //         {
        //             "id":"813a3ffa-1c4b-45cb-b13f-1c077ea2748b",
        //             "timestamp":1644155923357,
        //             "assetPairId":"BCHEUR",
        //             "orderId":"1b367978-7e4f-454b-b870-64040d484443",
        //             "role":"Taker",
        //             "side":"sell",
        //             "price":280.569,
        //             "baseVolume":0.01,
        //             "quoteVolume":2.8056,
        //             "baseAssetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //             "quoteAssetId":"EUR",
        //             "fee":null
        //         }
        //
        const marketId = this.safeString (trade, 'assetPairId');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const id = this.safeString2 (trade, 'id', 'id');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeString2 (trade, 'price', 'price');
        let amount = this.safeString2 (trade, 'volume', 'amount');
        if (amount === undefined) {
            amount = this.safeString2 (trade, 'baseVolume', 'amount');
        }
        const side = this.safeStringLower (trade, 'side');
        const fee = {
            'cost': this.parseNumber ('0'), // There are no fees for trading.
            'currency': market['quote'],
        };
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'assetPairId': market['id'],
            // 'offset': 0,
        };
        if (limit !== undefined) {
            request['take'] = limit;
        }
        const response = await this.publicGetTradesPublicAssetPairId (this.extend (request, params));
        const result = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 "id":"71df1f0c-be4e-4d45-b809-c108fad5f2a8",
        //                 "assetPairId":"BTCUSD",
        //                 "timestamp":1643345958414,
        //                 "volume":0.00010996,
        //                 "price":37205.723,
        //                 "side":"buy"
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseTrades (result, market, since, limit);
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
        const response = await this.privateGetBalance (params);
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
            'Open': 'open',
            'Pending': 'open',
            'InOrderBook': 'open',
            'Processing': 'open',
            'Matched': 'closed',
            'Cancelled': 'canceled',
            'Rejected': 'rejected',
            'Replaced': 'canceled',
            'Placed': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "id":"1b367978-7e4f-454b-b870-64040d484443",
        //         "timestamp":1644155923357,
        //         "lastTradeTimestamp":1644155923357,
        //         "status":"Matched",
        //         "assetPairId":"BCHEUR",
        //         "type":"Market",
        //         "side":"Sell",
        //         "price":280.569,
        //         "volume":0.01,
        //         "filledVolume":0.01,
        //         "remainingVolume":0.0,
        //         "cost":2.80569
        //     }
        //
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'assetPairId');
        const symbol = this.safeSymbol (marketId, market);
        const type = this.safeStringLower (order, 'type');
        const lastTradeTimestamp = this.safeInteger (order, 'lastTradeTimestamp');
        const timestamp = this.safeInteger (order, 'timestamp');
        const price = this.safeString (order, 'price');
        const side = this.safeStringLower (order, 'side');
        const amount = this.safeString (order, 'volume');
        const remaining = this.safeString (order, 'remainingVolume');
        const filled = this.safeString (order, 'filledVolume');
        const cost = this.safeString (order, 'cost');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const query = {
            'assetPairId': market['id'],
            'side': this.capitalize (side),
            'volume': parseFloat (this.amountToPrecision (symbol, amount)),
        };
        if (type === 'limit') {
            query['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        const method = 'privatePostOrders' + this.capitalize (type);
        const result = await this[method] (this.extend (query, params));
        //
        // market
        //
        //         {
        //             "payload":{
        //                 "orderId":"2b98ec26-8410-49b6-9f37-1fb2150e2299",
        //                 "price":280.699
        //             },
        //             "error":null
        //         }
        //
        // limit
        //
        //         {
        //             "payload":{
        //                 "orderId":"27be8802-30be-40ca-bf40-ec886b309c5b"
        //             },
        //             "error":null
        //         }
        //
        const payload = this.safeValue (result, 'payload');
        const id = this.safeString (payload, 'orderId');
        if (type === 'market') {
            price = this.safeNumber (payload, 'price');
        }
        return {
            'id': id,
            'info': result,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        //
        //     {
        //         "payload":null,
        //         "error":null
        //     }
        //
        return await this.privateDeleteOrdersOrderId (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'side': 'Buy',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['assetPairId'] = market['id'];
        }
        //
        //     {
        //         "payload":null,
        //         "error":null
        //     }
        //
        return await this.privateDeleteOrders (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        const payload = this.safeValue (response, 'payload');
        //
        //     {
        //         "payload":{
        //             "id":"1b367978-7e4f-454b-b870-64040d484443",
        //             "timestamp":1644155923357,
        //             "lastTradeTimestamp":1644155923357,
        //             "status":"Matched",
        //             "assetPairId":"BCHEUR",
        //             "type":"Market",
        //             "side":"Sell",
        //             "price":280.569,
        //             "volume":0.01,
        //             "filledVolume":0.01,
        //             "remainingVolume":0.0,
        //             "cost":2.80569
        //         },
        //         "error":null
        //     }
        //
        return this.parseOrder (payload);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            // 'offset': 0,
            // 'take': 1,
        };
        if (limit !== undefined) {
            request['take'] = limit;
        }
        const response = await this.privateGetOrdersActive (this.extend (request, params));
        const payload = this.safeValue (response, 'payload');
        //
        //     {
        //         "payload":[
        //             {
        //                 "id":"b26f58f5-8542-4b4c-9815-91562b523cc3",
        //                 "timestamp":1644157177155,
        //                 "lastTradeTimestamp":null,
        //                 "status":"Placed",
        //                 "assetPairId":"BCHEUR",
        //                 "type":"Limit",
        //                 "side":"Sell",
        //                 "price":666.666,
        //                 "volume":0.01,
        //                 "filledVolume":0.00,
        //                 "remainingVolume":0.01,
        //                 "cost":0.00000
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseOrders (payload, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            // 'offset': 0,
            // 'take': 1,
        };
        if (limit !== undefined) {
            request['take'] = limit;
        }
        const response = await this.privateGetOrdersClosed (this.extend (request, params));
        const payload = this.safeValue (response, 'payload');
        //
        //     {
        //         "payload":[
        //             {
        //                 "id":"1b367978-7e4f-454b-b870-64040d484443",
        //                 "timestamp":1644155923357,
        //                 "lastTradeTimestamp":1644155923357,
        //                 "status":"Matched",
        //                 "assetPairId":"BCHEUR",
        //                 "type":"Market",
        //                 "side":"Sell",
        //                 "price":280.569,
        //                 "volume":0.01,
        //                 "filledVolume":0.01,
        //                 "remainingVolume":0.0,
        //                 "cost":2.80569
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseOrders (payload, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'side': 'buy',
            // 'offset': 0,
            // 'take': 1,
            // 'to': 0,
        };
        let market = undefined;
        if (limit !== undefined) {
            request['take'] = limit; // How many maximum items have to be returned, max 1000 default 100.
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['assetPairId'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        const payload = this.safeValue (response, 'payload');
        //
        //     {
        //         "payload":[
        //             {
        //                 "id":"813a3ffa-1c4b-45cb-b13f-1c077ea2748b",
        //                 "timestamp":1644155923357,
        //                 "assetPairId":"BCHEUR",
        //                 "orderId":"1b367978-7e4f-454b-b870-64040d484443",
        //                 "role":"Taker",
        //                 "side":"sell",
        //                 "price":280.569,
        //                 "baseVolume":0.01,
        //                 "quoteVolume":2.8056,
        //                 "baseAssetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //                 "quoteAssetId":"EUR",
        //                 "fee":null
        //             }
        //         ],
        //         "error":null
        //     }
        //
        return this.parseTrades (payload, market, since, limit);
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = this.safeString (bidask, priceKey);
        const amount = Precise.stringAbs (this.safeString (bidask, amountKey));
        return [ this.parseNumber (price), this.parseNumber (amount) ];
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'assetId': this.safeString (currency, 'id'),
        };
        const response = await this.privateGetOperationsDepositsAddressesAssetId (this.extend (request, params));
        //
        //     {
        //         "assetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //         "symbol":"BCH",
        //         "address":null,
        //         "baseAddress":null,
        //         "addressExtension":null,
        //         "state":"Active"
        //     }
        //
        const address = this.safeString (response, 'baseAddress');
        const tag = this.safeString (response, 'addressExtension');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //     "3035b1ad-2005-4587-a986-1f7966be78e0"
        //
        // fetchTransactions
        //     {
        //         "operationId":"787201c8-f1cc-45c0-aec1-fa06eeea426b",
        //         "assetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //         "totalVolume":0.1,
        //         "fee":0.0,
        //         "type":"deposit",
        //         "timestamp":1644146723620
        //     }
        //
        let id = undefined;
        let assetId = undefined;
        let code = undefined;
        let amount = undefined;
        let fee = undefined;
        let type = undefined;
        let timestamp = undefined;
        if (typeof transaction === 'string') {
            id = transaction;
        } else {
            id = this.safeString (transaction, 'operationId');
            assetId = this.safeString (transaction, 'assetId');
            code = this.safeCurrencyCode (assetId, currency);
            amount = this.safeNumber (transaction, 'totalVolume');
            type = this.safeString (transaction, 'type');
            timestamp = this.safeInteger (transaction, 'timestamp');
            const feeCost = this.safeNumber (transaction, 'fee');
            fee = {
                'currency': code,
                'cost': feeCost,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': undefined,
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'offset': 0,
            // 'take': 1,
        };
        if (limit !== undefined) {
            request['take'] = limit;
        }
        const response = await this.privateGetOperations (this.extend (request, params));
        const payload = this.safeValue (response, 'payload', []);
        //
        //     {
        //         "payload":[
        //             {
        //                 "operationId":"787201c8-f1cc-45c0-aec1-fa06eeea426b",
        //                 "assetId":"2a34d6a6-5839-40e5-836f-c1178fa09b89",
        //                 "totalVolume":0.1,
        //                 "fee":0.0,
        //                 "type":"deposit",
        //                 "timestamp":1644146723620
        //             }
        //         ],
        //         "error":null
        //     }
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (payload, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'assetId': currency['id'],
            'volume': parseFloat (this.currencyToPrecision (code, amount)),
            'destinationAddress': address,
            // 'destinationAddressExtension': tag,
        };
        if (tag !== undefined) {
            request['destinationAddressExtension'] = tag;
        }
        const response = await this.privatePostOperationsWithdrawals (this.extend (request, params));
        //
        //     "3035b1ad-2005-4587-a986-1f7966be78e0"
        //
        return this.parseTransaction (response, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            if ((method === 'GET') || (method === 'DELETE')) {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            this.checkRequiredCredentials ();
            headers['Authorization'] = 'Bearer ' + this.apiKey;
            if (method === 'POST') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
            if (path === 'operations/withdrawals') {
                headers['X-Request-ID'] = this.uuid ();
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const error = this.safeValue (response, 'error', {});
        const errorCode = this.safeString (error, 'code');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString (error, 'message');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
