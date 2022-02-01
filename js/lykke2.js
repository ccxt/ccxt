'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lykke extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lykke2',
            'name': 'Lykke',
            'countries': [ 'UK' ],
            'version': 'v2',
            'rateLimit': 120, // different rate limits
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
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'setMarginMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'Minute',
                '5m': 'Min5',
                '15m': 'Min15',
                '30m': 'Min30',
                '1h': 'Hour',
                '4h': 'Hour4',
                '6h': 'Hour6',
                '12h': 'Hour12',
                '1d': 'Day',
                '1w': 'Week',
                '1M': 'Month',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'urls': {
                'logo': 'https://lykke-marketing-website.cdn.prismic.io/lykke-marketing-website/7dd44480-31ea-45c8-a246-c97989cd9da6_logo.svg',
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
                    'get': [
                        'assetpairs',
                        'assetpairs/{id}',
                        'assets',
                        'assets/{id}',
                        'isalive',
                        'orderbooks',
                        'tickers',
                        'prices',
                        'trades/public/{AssetPairId}',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'trades',
                        'trades/order/{OrderId}',
                        'orders/active',
                        'orders/closed',
                        'orders/{OrderId}',
                        'operations',
                        'operations/deposits/addresses',
                        'operations/deposits/addresses/{AssetId}',
                    ],
                    'post': [
                        'orders/limit',
                        'orders/market',
                        'orders/bulk',
                        'operations/withdrawals',
                        'operations/deposits/addresses',
                    ],
                    'delete': [
                        'orders',
                        'orders/{OrderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0, // as of 7 Feb 2018, see https://github.com/ccxt/ccxt/issues/1863
                    'taker': 0.0, // https://support.lykke.com/hc/en-us/articles/115002141125-What-are-the-fees-and-charges-
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                    },
                    'deposit': {
                        'BTC': 0,
                    },
                },
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
            const id = this.safeString (currency, 'lykkeEntityId');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const type = this.safeString (currency, 'type');
            const deposit = this.safeValue (currency, 'blockchainDepositEnabled');
            const withdraw = this.safeValue (currency, 'blockchainWithdrawal');
            const active = this.safeValue (currency, 'isDisabled');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': type,
                'name': name,
                'active': active && deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': this.safeNumber (currency, 'accuracy'),
                'limits': {
                    'withdraw': { 'min': this.safeValue (currency, 'cashoutMinimalAmount'), 'max': undefined },
                    'amount': { 'min': this.safeValue (currency, 'lowVolumeAmount'), 'max': undefined },
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
            const [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const pricePrecision = this.safeString (market, 'priceAccuracy');
            const priceLimit = this.parsePrecision (pricePrecision);
            const precision = {
                'price': parseInt (pricePrecision),
                'amount': this.safeInteger (market, 'baseAssetAccuracy'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'active': true,
                'info': market,
                'linear': false,
                'inverse': false,
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
                        'min': this.parseNumber (priceLimit),
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
        const timestamp = this.parse8601 (this.safeValue (ticker, 'timestamp'));
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
            'change': undefined,
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
        const info = this.safeValue (market, 'info');
        const request = {
            'assetPairIds': this.safeString (info, 'assetPairId'),
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
            'depth': limit, // default 0
        };
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

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    parseTrade (trade, market) {
        //
        //  public fetchTrades
        //
        // [
        //     {
        //         "id":"71df1f0c-be4e-4d45-b809-c108fad5f2a8",
        //         "assetPairId":"BTCUSD",
        //         "timestamp":1643345958414,
        //         "volume":0.00010996,
        //         "price":37205.723,
        //         "side":"buy"
        //      }
        //  ]
        //
        //  private fetchMyTrades
        //     {
        //         Id: '3500b83c-9963-4349-b3ee-b3e503073cea',
        //         OrderId: '83b50feb-8615-4dc6-b606-8a4168ecd708',
        //         DateTime: '2020-05-19T11:17:39.31+00:00',
        //         Timestamp: '2020-05-19T11:17:39.31+00:00',
        //         State: null,
        //         Amount: -0.004,
        //         BaseVolume: -0.004,
        //         QuotingVolume: 39.3898,
        //         Asset: 'BTC',
        //         BaseAssetId: 'BTC',
        //         QuotingAssetId: 'USD',
        //         AssetPair: 'BTCUSD',
        //         AssetPairId: 'BTCUSD',
        //         Price: 9847.427,
        //         Fee: { Amount: null, Type: 'Unknown', FeeAssetId: null }
        //     },
        const marketId = this.safeString (trade, 'AssetPairId');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString2 (trade, 'id', 'Id');
        const orderId = this.safeString (trade, 'OrderId');
        const timestamp = this.parse8601 (this.safeString2 (trade, 'dateTime', 'DateTime'));
        const priceString = this.safeString2 (trade, 'price', 'Price');
        let amountString = this.safeString2 (trade, 'volume', 'Amount');
        let side = this.safeStringLower (trade, 'action');
        if (side === undefined) {
            side = (amountString[0] === '-') ? 'sell' : 'buy';
        }
        amountString = Precise.stringAbs (amountString);
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const fee = {
            'cost': 0, // There are no fees for trading.
            'currency': market['quote'],
        };
        return {
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
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'AssetPairId': market['id'],
            'offset': 0, // (optional) Skip the specified number of elements.
            'take': limit, // (optional) Take the specified number of elements.
        };
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
            account['total'] = Precise.stringAdd (free, used);
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
        //                 "assetId":"BTCUSD",
        //                 "available":0.0001,
        //                 "timestamp":1643345958414,
        //                 "reserved":0.00001,
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
        //         "Id": "string",
        //         "Status": "Unknown",
        //         "AssetPairId": "string",
        //         "Volume": 0,
        //         "Price": 0,
        //         "RemainingVolume": 0,
        //         "LastMatchTime": "2020-03-26T20:58:50.710Z",
        //         "CreatedAt": "2020-03-26T20:58:50.710Z",
        //         "Type": "Unknown",
        //         "LowerLimitPrice": 0,
        //         "LowerPrice": 0,
        //         "UpperLimitPrice": 0,
        //         "UpperPrice": 0
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        const marketId = this.safeString (order, 'AssetPairId');
        const symbol = this.safeSymbol (marketId, market);
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'LastMatchTime'));
        let timestamp = undefined;
        if (('Registered' in order) && (order['Registered'])) {
            timestamp = this.parse8601 (order['Registered']);
        } else if (('CreatedAt' in order) && (order['CreatedAt'])) {
            timestamp = this.parse8601 (order['CreatedAt']);
        }
        const price = this.safeString (order, 'Price');
        let side = undefined;
        let amount = this.safeString (order, 'Volume');
        const isAmountLessThanZero = Precise.stringLt (amount, '0');
        if (isAmountLessThanZero) {
            side = 'sell';
            amount = Precise.stringAbs (amount);
        } else {
            side = 'buy';
        }
        const remaining = Precise.stringAbs (this.safeString (order, 'RemainingVolume'));
        const id = this.safeString (order, 'Id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (limit !== undefined) {
            request['take'] = limit; // How many maximum items have to be returned, max 1000 default 100.
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['assetPairId'] = market['id'];
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = { 'id': id };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['assetPairId'] = market['id'];
        }
        return await this.privateDeleteOrders (this.extend (request, params));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const query = {
            'AssetPairId': market['id'],
            'OrderAction': this.capitalize (side),
            'Volume': amount,
            'Asset': market['baseId'],
        };
        if (type === 'limit') {
            query['Price'] = price;
        }
        const method = 'privatePostOrders' + this.capitalize (type);
        const result = await this[method] (this.extend (query, params));
        //
        // market
        //
        //     {
        //         "Price": 0
        //     }
        //
        // limit
        //
        //     {
        //         "Id":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        //     }
        //
        const id = this.safeString (result, 'Id');
        price = this.safeNumber (result, 'Price');
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetOrders (params);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'InOrderBook',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'Matched',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = this.safeNumber (bidask, priceKey);
        let amount = this.safeNumber (bidask, amountKey);
        if (amount < 0) {
            amount = -amount;
        }
        return [ price, amount ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'mobile') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'public') {
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
            headers = {
                'Authorization': 'Bearer ' + this.apiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
            if (method === 'POST') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'AssetId': this.safeString (currency, 'id'),
        };
        const response = await this.privateGetOperationsDepositsAddressesAssetId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": null,
        //             "method": "erc20",
        //             "coin": null
        //         }
        //     }
        //
        const result = this.safeValue (response, 'payload', {});
        const networkId = this.safeString (result, 'method');
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': this.safeString (result, 'tag'),
            'network': this.safeNetwork (networkId),
            'info': response,
        };
    }
};
