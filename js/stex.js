'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder, BadRequest, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class stex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'stex',
            'name': 'STEX', // formerly known as stocks.exchange
            'countries': [ 'EE' ], // Estonia
            'rateLimit': 500, // https://help.stex.com/en/articles/2815043-api-3-rate-limits
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
            },
            'version': 'v3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg',
                'api': 'https://api3.stex.com',
                'www': 'https://www.stex.com',
                'doc': [
                    'https://help.stex.com/en/collections/1593608-api-v3-documentation',
                ],
                'fees': 'https://app.stex.com/en/pairs-specification',
                'referral': 'https://app.stex.com?ref=36416021',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'token': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '12h': '720',
                '1d': '1D', // default
            },
            'api': {
                'public': {
                    'get': [
                        'currencies', // Available Currencies
                        'currencies/{currencyId}', // Get currency info
                        'markets', // Available markets
                        'pairs-groups', // Available currency pairs groups (as displayed at stex trading page)
                        'currency_pairs/list/{code}', // Available currency pairs
                        'currency_pairs/group/{currencyPairGroupId}', // Available currency pairs for a given group
                        'currency_pairs/{currencyPairId}', // Get currency pair information
                        'ticker', // Tickers list for all currency pairs
                        'ticker/{currencyPairId}', // Ticker for currency pair
                        'trades/{currencyPairId}', // Trades for given currency pair
                        'orderbook/{currencyPairId}', // Orderbook for given currency pair
                        'chart/{currencyPairId}/{candlesType}', // A list of candles for given currency pair
                        'deposit-statuses', // Available Deposit Statuses
                        'deposit-statuses/{statusId}', // Get deposit status info
                        'withdrawal-statuses', // Available Withdrawal Statuses
                        'withdrawal-statuses/{statusId}', // Get status info
                        'ping', // Test API is working and get server time
                        'mobile-versions', // Shows the official mobile applications data
                    ],
                },
                'trading': {
                    'get': [
                        'fees/{currencyPairId}', // Returns the user's fees for a given currency pair
                        'orders', // List your currently open orders
                        'orders/{currencyPairId}', // List your currently open orders for given currency pair
                        'order/{orderId}', // Get a single order
                    ],
                    'post': [
                        'orders/{currencyPairId}', // Create new order and put it to the orders processing queue
                    ],
                    'delete': [
                        'orders', // Delete all active orders
                        'orders/{currencyPairId}', // Delete active orders for given currency pair
                        'order/{orderId}', // Cancel order
                    ],
                },
                'reports': {
                    'get': [
                        'orders', // Get past orders
                        'orders/{orderId}', // Get specified order details
                        'trades/{currencyPairId}', // Get a list of user trades according to request parameters
                        'background/{listMode}', // Get reports list for category
                        'background/{id}', // Get some report info
                        'background/download/{id}', // Get file by id
                    ],
                    'post': [
                        'background/create', // Create new report
                    ],
                    'delete': [
                        'background/{id}', // Remove report by id
                    ],
                },
                'profile': {
                    'get': [
                        'info', // Account information
                        'wallets', // Get a list of user wallets
                        'wallets/{walletId}', // Single wallet information
                        'wallets/address/{walletId}', // Get deposit address for given wallet
                        'deposits', // Get a list of deposits made by user
                        'deposits/{id}', // Get deposit by id
                        'withdrawals', // Get a list of withdrawals made by user
                        'withdrawals/{id}', // Get withdrawal by id
                        'notifications', // Get notifications
                        'favorite/currency_pairs', // Get favorite currency pairs
                        'token-scopes', // Get current token scopes
                    ],
                    'post': [
                        'wallets/burn/{walletId}', // Burns the given wallet
                        'wallets/{currencyId}', // Create a wallet for given currency
                        'wallets/address/{walletId}', // Create new deposit address
                        'withdraw', // Create withdrawal request
                        'referral/program', // Create referral program
                        'referral/insert/{code}', // Insert referral code
                        'referral/bonus_transfer/{currencyId}', // Transfer referral bonuses balance to main balance for given currency
                    ],
                    'put': [
                        'profile/favorite/currency_pairs/set', // Set favorite currency pairs
                    ],
                    'delete': [
                        'profile/withdraw/{withdrawalId}', // Cancel unconfirmed withdrawal
                    ],
                },
                'verification': {
                    'get': [
                        'verification/countries', // Countries list, beta
                        'verification/stex', // Get information about your KYC, beta
                    ],
                    'post': [
                        'verification/stex', // Update information regarding of your KYC verification, beta
                    ],
                },
                'settings': {
                    'get': [
                        'notifications/{event}', // User event notification settings
                        'notifications', // User events notification settings
                    ],
                    'put': [
                        'notifications', // Set notification settings
                        'notifications/set',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'options': {
                'parseOrderToPrecision': false,
            },
            'exceptions': {
                'exact': {
                    // {"success":false,"message":"Wrong parameters","errors":{"candleType":["Invalid Candle Type!"]}}
                    // {"success":false,"message":"Wrong parameters","errors":{"time":["timeStart or timeEnd is less then 1"]}}
                    'Wrong parameters': BadRequest,
                    'Unauthenticated.': AuthenticationError, // {"message":"Unauthenticated."}
                },
                'broad': {
                    'Not enough': InsufficientFunds, // {"success":false,"message":"Not enough  ETH"}
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "success":true,
        //         "data":[
        //             {
        //                 "id":1,
        //                 "code":"BTC",
        //                 "name":"Bitcoin",
        //                 "active":true,
        //                 "delisted":false,
        //                 "precision":8,
        //                 "minimum_tx_confirmations":1,
        //                 "minimum_withdrawal_amount":"0.00200000",
        //                 "minimum_deposit_amount":"0.00000000",
        //                 "deposit_fee_currency_id":1,
        //                 "deposit_fee_currency_code":"BTC",
        //                 "deposit_fee_const":"0.00000000",
        //                 "deposit_fee_percent":"0.00000000",
        //                 "withdrawal_fee_currency_id":1,
        //                 "withdrawal_fee_currency_code":"BTC",
        //                 "withdrawal_fee_const":"0.00100000",
        //                 "withdrawal_fee_percent":"0.00000000",
        //                 "block_explorer_url":"https:\/\/blockchain.info\/tx\/",
        //                 "protocol_specific_settings":null
        //             },
        //         ]
        //     }
        //
        const result = {};
        const currencies = this.safeValue (response, 'data', []);
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const numericId = this.safeInteger (currency, 'id');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (this.safeString (currency, 'code'));
            const precision = this.safeInteger (currency, 'precision');
            const fee = this.safeFloat (currency, 'withdrawal_fee_const'); // todo: redesign
            const active = this.safeValue (currency, 'active', true);
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': this.safeString (currency, 'name'),
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': { 'min': Math.pow (10, -precision), 'max': undefined },
                    'price': { 'min': Math.pow (10, -precision), 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'deposit': {
                        'min': this.safeFloat (currency, 'minimum_deposit_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minimum_withdrawal_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const request = {
            'code': 'ALL',
        };
        const response = await this.publicGetCurrencyPairsListCode (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "data":[
        //             {
        //                 "id":935,
        //                 "currency_id":662,
        //                 "currency_code":"ABET",
        //                 "currency_name":"Altbet",
        //                 "market_currency_id":1,
        //                 "market_code":"BTC",
        //                 "market_name":"Bitcoin",
        //                 "min_order_amount":"0.00000010",
        //                 "min_buy_price":"0.00000001",
        //                 "min_sell_price":"0.00000001",
        //                 "buy_fee_percent":"0.20000000",
        //                 "sell_fee_percent":"0.20000000",
        //                 "active":true,
        //                 "delisted":false,
        //                 "pair_message":"",
        //                 "currency_precision":8,
        //                 "market_precision":8,
        //                 "symbol":"ABET_BTC",
        //                 "group_name":"BTC",
        //                 "group_id":1
        //             }
        //         ]
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'data', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const numericId = this.safeInteger (market, 'id');
            const baseId = this.safeString (market, 'currency_id');
            const quoteId = this.safeString (market, 'market_currency_id');
            const baseNumericId = this.safeInteger (market, 'currency_id');
            const quoteNumericId = this.safeInteger (market, 'market_currency_id');
            const base = this.safeCurrencyCode (this.safeString (market, 'currency_code'));
            const quote = this.safeCurrencyCode (this.safeString (market, 'market_code'));
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'currency_precision'),
                'price': this.safeInteger (market, 'market_precision'),
            };
            const active = this.safeValue (market, 'active');
            const minBuyPrice = this.safeFloat (market, 'min_buy_price');
            const minSellPrice = this.safeFloat (market, 'min_sell_price');
            const minPrice = Math.max (minBuyPrice, minSellPrice);
            const buyFee = this.safeFloat (market, 'buy_fee_percent');
            const sellFee = this.safeFloat (market, 'sell_fee_percent');
            const fee = Math.max (buyFee, sellFee);
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'info': market,
                'active': active,
                'maker': fee,
                'taker': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_order_amount'),
                        'max': undefined,
                    },
                    'price': { 'min': minPrice, 'max': undefined },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
        };
        const response = await this.publicGetTickerCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 2,
        //             "amount_multiplier": 1,
        //             "currency_code": "ETH",
        //             "market_code": "BTC",
        //             "currency_name": "Ethereum",
        //             "market_name": "Bitcoin",
        //             "symbol": "ETH_BTC",
        //             "group_name": "BTC",
        //             "group_id": 1,
        //             "ask": "0.02069998",
        //             "bid": "0.02028622",
        //             "last": "0.02049224",
        //             "open": "0.02059605",
        //             "low": "0.01977744",
        //             "high": "0.02097005",
        //             "volume": "480.43248971",
        //             "volumeQuote": "23491.29826130",
        //             "count": "7384",
        //             "fiatsRate": {
        //                 "USD": 7230.86,
        //                 "EUR": 6590.79,
        //                 "UAH": 173402,
        //                 "AUD": 10595.51,
        //                 "IDR": 101568085,
        //                 "CNY": 50752,
        //                 "KRW": 8452295,
        //                 "JPY": 784607,
        //                 "VND": 167315119,
        //                 "INR": 517596,
        //                 "GBP": 5607.25,
        //                 "CAD": 9602.63,
        //                 "BRL": 30472,
        //                 "RUB": 460718
        //             },
        //             "timestamp": 1574698235601
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'data', {});
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit; // returns all if set to 0, default 100
            request['limit_asks'] = limit; // returns all if set to 0, default 100
        }
        const response = await this.publicGetOrderbookCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "ask": [
        //                 { "currency_pair_id": 2, "amount": "2.17865373", "price": "0.02062917", "amount2": "0.04494382", "count": 1, "cumulative_amount": 2.17865373 },
        //                 { "currency_pair_id": 2, "amount": "2.27521743", "price": "0.02062918", "amount2": "0.04693587", "count": 1, "cumulative_amount": 4.45387116 },
        //                 { "currency_pair_id": 2, "amount": "1.26980049", "price": "0.02063170", "amount2": "0.02619814", "count": 1, "cumulative_amount": 5.72367165 },
        //             ],
        //             "bid": [
        //                 { "currency_pair_id": 2, "amount": "0.00978005", "price": "0.02057000", "amount2": "0.00020118", "count": 1, "cumulative_amount": 0.00978005 },
        //                 { "currency_pair_id": 2, "amount": "0.00500000", "price": "0.02056000", "amount2": "0.00010280", "count": 1, "cumulative_amount": 0.01478005 },
        //                 { "currency_pair_id": 2, "amount": "0.77679882", "price": "0.02054001", "amount2": "0.01595546", "count": 1, "cumulative_amount": 0.79157887 },
        //             ],
        //             "ask_total_amount": 2555.749174609999,
        //             "bid_total_amount": 29.180037330000005
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderbook, undefined, 'bid', 'ask', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "id": 2,
        //         "amount_multiplier": 1,
        //         "currency_code": "ETH",
        //         "market_code": "BTC",
        //         "currency_name": "Ethereum",
        //         "market_name": "Bitcoin",
        //         "symbol": "ETH_BTC",
        //         "group_name": "BTC",
        //         "group_id": 1,
        //         "ask": "0.02069998",
        //         "bid": "0.02028622",
        //         "last": "0.02049224",
        //         "open": "0.02059605",
        //         "low": "0.01977744",
        //         "high": "0.02097005",
        //         "volume": "480.43248971",
        //         "volumeQuote": "23491.29826130",
        //         "count": "7384",
        //         "fiatsRate": {
        //             "USD": 7230.86,
        //             "EUR": 6590.79,
        //             "UAH": 173402,
        //             "AUD": 10595.51,
        //             "IDR": 101568085,
        //             "CNY": 50752,
        //             "KRW": 8452295,
        //             "JPY": 784607,
        //             "VND": 167315119,
        //             "INR": 517596,
        //             "GBP": 5607.25,
        //             "CAD": 9602.63,
        //             "BRL": 30472,
        //             "RUB": 460718
        //         },
        //         "timestamp": 1574698235601
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        let marketId = this.safeString (ticker, 'id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            marketId = this.safeString (ticker, 'symbol');
            if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volumeQuote'),
            'info': ticker,
        };
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //     {
        //         "success":true,
        //         "data":[
        //             {
        //                 "id":262,
        //                 "amount_multiplier":1,
        //                 "currency_code":"ARDR",
        //                 "market_code":"BTC",
        //                 "currency_name":"ARDOR",
        //                 "market_name":"Bitcoin",
        //                 "symbol":"ARDR_BTC",
        //                 "group_name":"BTC",
        //                 "group_id":1,
        //                 "ask":"0.00000630",
        //                 "bid":"0.00000613",
        //                 "last":"0.00000617",
        //                 "open":"0.00000620",
        //                 "low":"0.00000614",
        //                 "high":"0.00000630",
        //                 "volume":"30.37795305",
        //                 "volumeQuote":"4911487.01996544",
        //                 "count":"710",
        //                 "fiatsRate":{
        //                     "USD":7230.86,
        //                     "EUR":6590.79,
        //                     "UAH":173402,
        //                     "AUD":10744.52,
        //                     "IDR":101568085,
        //                     "CNY":50752,
        //                     "KRW":8452295,
        //                     "JPY":784607,
        //                     "VND":167315119,
        //                     "INR":517596,
        //                     "GBP":5607.25,
        //                     "CAD":9602.63,
        //                     "BRL":30472,
        //                     "RUB":467358
        //                 },
        //                 "timestamp":1574698617304,
        //                 "group_position":1
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        //
        //     {
        //         "time": 1566086400000,
        //         "close": 0.01895,
        //         "open": 0.01812427,
        //         "high": 0.0191588,
        //         "low": 0.01807001,
        //         "volume": 2588.597813750006
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
            'candlesType': this.timeframes[timeframe], // default 1D
            // 'timeStart': 1574709092, // unix timestamp in seconds, required
            // 'timeEnd': 1574709092, // unix timestamp in seconds, required
            // 'limit': 100, // default 100, optional
            // 'offset' 100, // optional, pagination within timerange
        };
        if (limit === undefined) {
            limit = 100;
        } else {
            request['limit'] = limit;
        }
        const duration = this.parseTimeframe (timeframe);
        const timerange = limit * duration;
        if (since === undefined) {
            request['timeEnd'] = this.seconds ();
            request['timeStart'] = request['timeEnd'] - timerange;
        } else {
            request['timeStart'] = parseInt (since / 1000);
            request['timeEnd'] = this.sum (request['timeStart'], timerange);
        }
        const response = await this.publicGetChartCurrencyPairIdCandlesType (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "time": 1566086400000,
        //                 "close": 0.01895,
        //                 "open": 0.01812427,
        //                 "high": 0.0191588,
        //                 "low": 0.01807001,
        //                 "volume": 2588.597813750006
        //             },
        //         ]
        //     }
        //
        const ohlcvs = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "id": 35989317,
        //         "price": "0.02033813",
        //         "amount": "3.60000000",
        //         "type": "BUY",
        //         "timestamp": "1574713503"
        //     }
        //
        // private
        //
        //     ...
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        let symbol = undefined;
        // const marketId = this.safeString (trade, 's');
        // if (marketId !== undefined) {
        //     if (marketId in this.markets_by_id) {
        //         market = this.markets_by_id[marketId];
        //         symbol = market['symbol'];
        //     } else {
        //         const [ baseId, quoteId ] = market.split ('/');
        //         const base = this.safeCurrencyCode (baseId);
        //         const quote = this.safeCurrencyCode (quoteId);
        //         symbol = base + '/' + quote;
        //     }
        // }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        // let fee = undefined;
        // const feeCost = this.safeFloat (trade, 'fee');
        // if (feeCost !== undefined) {
        //     const feeCurrencyId = this.safeString (trade, 'fa');
        //     const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        //     fee = {
        //         'cost': feeCost,
        //         'currency': feeCurrencyCode,
        //     };
        // }
        const side = this.safeStringLower (trade, 'type');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
            // 'sort': 'ASC', // ASC or DESC, default DESC
            // 'from': 1574709092, // unix timestamp, optional
            // 'till': 1574709092, // unix timestamp, optional
            // 'limit': 100, // default 100, optional
            // 'offset': 100, // optional
        };
        if (limit !== undefined) {
            request['limit'] = limit; // currently limited to 100 or fewer
        }
        if (since !== undefined) {
            request['sort'] = 'ASC'; // needed to make the from param work
            request['from'] = parseInt (since / 1000);
        }
        const response = await this.publicGetTradesCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 35989317,
        //                 "price": "0.02033813",
        //                 "amount": "3.60000000",
        //                 "type": "BUY",
        //                 "timestamp": "1574713503"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        // await this.loadAccounts ();
        const response = await this.profileGetWallets (params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": null,
        //                 "currency_id": 665,
        //                 "delisted": false,
        //                 "disabled": false,
        //                 "disable_deposits": false,
        //                 "currency_code": "ORM",
        //                 "currency_name": "Orium",
        //                 "currency_type_id": 5,
        //                 "balance": "0",
        //                 "frozen_balance": "0",
        //                 "bonus_balance": "0",
        //                 "total_balance": "0",
        //                 "protocol_specific_settings": null,
        //                 "rates": { "BTC": "0.00000000020", "USD": "0.00000147" },
        //             },
        //             {
        //                 "id": null,
        //                 "currency_id": 272,
        //                 "delisted": false,
        //                 "disabled": false,
        //                 "disable_deposits": false,
        //                 "currency_code": "USDT",
        //                 "currency_name": "TetherUSD",
        //                 "currency_type_id": 23,
        //                 "balance": "0",
        //                 "frozen_balance": "0",
        //                 "bonus_balance": "0",
        //                 "total_balance": "0",
        //                 "protocol_specific_settings": [
        //                     { "protocol_name": "OMNI", "protocol_id": 10, "active": true, "withdrawal_fee_currency_id": 272, "withdrawal_fee_const": 10, "withdrawal_fee_percent": 0, "block_explorer_url": "https://omniexplorer.info/search/" },
        //                     { "protocol_name": "ERC20", "protocol_id": 5, "active": true, "withdrawal_fee_const": 1.2, "withdrawal_fee_percent": 0, "block_explorer_url": "https://etherscan.io/tx/" },
        //                     { "protocol_name": "TRON", "protocol_id": 24, "active": true, "withdrawal_fee_currency_id": 272, "withdrawal_fee_const": 0.2, "withdrawal_fee_percent": 0, "block_explorer_url": "https://tronscan.org/#/transaction/" }
        //                 ],
        //                 "rates": { "BTC": "0.00013893", "USD": "1" },
        //             },
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'currency_id'));
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'frozen_balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PROCESSING': 'open',
            'PENDING': 'open',
            'PARTIAL': 'open',
            'FINISHED': 'closed',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOpenOrders
        //
        //     {
        //         "id": 828680665,
        //         "currency_pair_id": 1,
        //         "currency_pair_name": "NXT_BTC",
        //         "price": "0.011384",
        //         "trigger_price": 0.011385,
        //         "initial_amount": "13.942",
        //         "processed_amount": "3.724",
        //         "type": "SELL",
        //         "original_type": "STOP_LIMIT_SELL",
        //         "created": "2019-01-17 10:14:48",
        //         "timestamp": "1547720088",
        //         "status": "PARTIAL"
        //     }
        //
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        let marketId = this.safeString (order, 'currency_pair_id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            marketId = this.safeString (order, 'currency_pair_name');
            if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'initial_amount');
        const filled = this.safeFloat (order, 'processed_amount');
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        let type = this.safeString (order, 'original_type');
        if ((type === 'BUY') || (type === 'SELL')) {
            type = undefined;
        }
        const side = this.safeStringLower (order, 'type');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' createOrder allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === 'limit') {
            type = side;
        }
        const request = {
            'currencyPairId': market['id'],
            'type': type.toUpperCase (), // 'BUY', 'SELL', 'STOP_LIMIT_BUY', 'STOP_LIMIT_SELL'
            'amount': parseFloat (this.amountToPrecision (symbol, amount)), // required
            'price': parseFloat (this.priceToPrecision (symbol, price)), // required
            // 'trigger_price': 123.45 // required for STOP_LIMIT_BUY or STOP_LIMIT_SELL
        };
        const response = await this.tradingPostOrdersCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 828680665,
        //             "currency_pair_id": 1,
        //             "currency_pair_name": "NXT_BTC",
        //             "price": "0.011384",
        //             "trigger_price": 0.011385,
        //             "initial_amount": "13.942",
        //             "processed_amount": "3.724",
        //             "type": "SELL",
        //             "original_type": "STOP_LIMIT_SELL",
        //             "created": "2019-01-17 10:14:48",
        //             "timestamp": "1547720088",
        //             "status": "PARTIAL"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'coid': id,
        };
        const response = await this.privateGetOrderCoid (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         "data": {
        //             "accountCategory": "CASH",
        //             "accountId": "cshKAhmTHQNUKhR1pQyrDOdotE3Tsnz4",
        //             "avgPrice": "0.000000000",
        //             "baseAsset": "ETH",
        //             "btmxCommission": "0.000000000",
        //             "coid": "41g6wtPRFrJXgg6Y7vpIkcCyWhgcK0cF", // the unique identifier, you will need, this value to cancel this order
        //             "errorCode": "NULL_VAL",
        //             "execId": "12452288",
        //             "execInst": "NULL_VAL",
        //             "fee": "0.000000000", // cumulative fee paid for this order
        //             "feeAsset": "", // the asset
        //             "filledQty": "0.000000000", // filled quantity
        //             "notional": "0.000000000",
        //             "orderPrice": "0.310000000", // only available for limit and stop limit orders
        //             "orderQty": "1.000000000",
        //             "orderType": "StopLimit",
        //             "quoteAsset": "BTC",
        //             "side": "Buy",
        //             "status": "PendingNew",
        //             "stopPrice": "0.300000000", // only available for stop market and stop limit orders
        //             "symbol": "ETH/BTC",
        //             "time": 1566091628227, // The last execution time of the order
        //             "sendingTime": 1566091503547, // The sending time of the order
        //             "userId": "supEQeSJQllKkxYSgLOoVk7hJAX59WSz"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'coid': id,
        };
        const response = await this.privateGetOrderFillsCoid (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         "data": [
        //             {
        //                 "ap": "0.029062965", // average filled price
        //                 "bb": "36851.981", // base asset total balance
        //                 "bc": "0", // if possitive, this is the BTMX commission charged by reverse mining, if negative, this is the mining output of the current fill.
        //                 "bpb": "36851.981", // base asset pending balance
        //                 "btmxBal": "0.0", // optional, the BTMX balance of the current account. This field is only available when bc is non-zero.
        //                 "cat": "CASH", // account category: CASH/MARGIN
        //                 "coid": "41g6wtPRFrJXgg6YxjqI6Qoog139Dmoi", // client order id, (needed to cancel order)
        //                 "ei": "NULL_VAL", // execution instruction
        //                 "errorCode": "NULL_VAL", // if the order is rejected, this field explains why
        //                 "execId": "12562285", // for each user, this is a strictly increasing long integer (represented as string)
        //                 "f": "78.074", // filled quantity, this is the aggregated quantity executed by all past fills
        //                 "fa": "BTC", // fee asset
        //                 "fee": "0.000693608", // fee
        //                 'lp': "0.029064", // last price, the price executed by the last fill
        //                 "l": "11.932", // last quantity, the quantity executed by the last fill
        //                 "m": "order", // message type
        //                 "orderType": "Limit", // Limit, Market, StopLimit, StopMarket
        //                 "p": "0.029066", // limit price, only available for limit and stop limit orders
        //                 "q": "100.000", // order quantity
        //                 "qb": "98878.642957097", // quote asset total balance
        //                 "qpb": "98877.967247508", // quote asset pending balance
        //                 "s": "ETH/BTC", // symbol
        //                 "side": "Buy", // side
        //                 "status": "PartiallyFilled", // order status
        //                 "t": 1561131458389, // timestamp
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let method = 'tradingGetOrders';
        const request = {
            // 'limit': 100, // default 100
            // 'offset': 100,
        };
        if (symbol !== undefined) {
            method = 'tradingGetOrdersCurrencyPairId';
            market = this.market (symbol);
            request['currencyPairId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 828680665,
        //                 "currency_pair_id": 1,
        //                 "currency_pair_name": "NXT_BTC",
        //                 "price": "0.011384",
        //                 "trigger_price": 0.011385,
        //                 "initial_amount": "13.942",
        //                 "processed_amount": "3.724",
        //                 "type": "SELL",
        //                 "original_type": "STOP_LIMIT_SELL",
        //                 "created": "2019-01-17 10:14:48",
        //                 "timestamp": "1547720088",
        //                 "status": "PARTIAL"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let method = 'reportsGetOrders';
        const request = {
            // 'currencyPairId': market['id'],
            // 'orderStatus': 'ALL', // ALL, FINISHED, CANCELLED, PARTIAL, WITH_TRADES, default is ALL
            // 'timeStart': '2019-11-26T19:54:55.901Z', // datetime in iso format
            // 'timeEnd': '2019-11-26T19:54:55.901Z', // datetime in iso format
            // 'limit': 100, // default 100
            // 'offset': 100,
        };
        if (symbol !== undefined) {
            method = 'reportsGetOrdersCurrencyPairId';
            market = this.market (symbol);
            request['currencyPairId'] = market['id'];
        }
        if (since !== undefined) {
            request['timeStart'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 828680665,
        //                 "currency_pair_id": 1,
        //                 "currency_pair_name": "NXT_BTC",
        //                 "price": "0.011384",
        //                 "trigger_price": 0.011385,
        //                 "initial_amount": "13.942",
        //                 "processed_amount": "3.724",
        //                 "type": "SELL",
        //                 "original_type": "STOP_LIMIT_SELL",
        //                 "created": "2019-01-17 10:14:48",
        //                 "timestamp": "1547720088",
        //                 "status": "PARTIAL"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.tradingDeleteOrderOrderId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "put_into_processing_queue": [
        //                 {
        //                     "id": 828680665,
        //                     "currency_pair_id": 1,
        //                     "currency_pair_name": "NXT_BTC",
        //                     "price": "0.011384",
        //                     "trigger_price": 0.011385,
        //                     "initial_amount": "13.942",
        //                     "processed_amount": "3.724",
        //                     "type": "SELL",
        //                     "original_type": "STOP_LIMIT_SELL",
        //                     "created": "2019-01-17 10:14:48",
        //                     "timestamp": "1547720088",
        //                     "status": "PARTIAL"
        //                 }
        //             ],
        //             "not_put_into_processing_queue": [
        //                 {
        //                     "id": 828680665,
        //                     "currency_pair_id": 1,
        //                     "currency_pair_name": "NXT_BTC",
        //                     "price": "0.011384",
        //                     "trigger_price": 0.011385,
        //                     "initial_amount": "13.942",
        //                     "processed_amount": "3.724",
        //                     "type": "SELL",
        //                     "original_type": "STOP_LIMIT_SELL",
        //                     "created": "2019-01-17 10:14:48",
        //                     "timestamp": "1547720088",
        //                     "status": "PARTIAL"
        //                 }
        //             ],
        //             "message": "string"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const acceptedOrders = this.safeValue (data, 'put_into_processing_queue', []);
        const rejectedOrders = this.safeValue (data, 'not_put_into_processing_queue', []);
        const numAcceptedOrders = acceptedOrders.length;
        const numRejectedOrders = rejectedOrders.length;
        if (numAcceptedOrders < 1) {
            if (numRejectedOrders < 1) {
                throw new ExchangeError (this.id + ' cancelOrder received an unexpected response: ' + this.json (response));
            } else {
                return this.parseOrder (rejectedOrders[0]);
            }
        } else {
            if (numRejectedOrders < 1) {
                return this.parseOrder (acceptedOrders[0]);
            } else {
                throw new ExchangeError (this.id + ' cancelOrder received an unexpected response: ' + this.json (response));
            }
        }
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'tradingDeleteOrders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['currencyPairId'] = market['id'];
            method = 'tradingDeleteOrdersCurrencyPairId';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "data":{
        //             "put_into_processing_queue":[],
        //             "not_put_into_processing_queue":[],
        //             "message":"Orders operations are handled in processing queue, therefore cancelling is not immediate."
        //         }
        //     }
        //
        return response;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const currency = this.currency (code);
        const request = {
            'requestId': this.coid (),
            // 'time': this.milliseconds (), // this is filled in the private section of the sign() method below
            'assetCode': currency['id'],
        };
        // note: it is highly recommended to use V2 version of this route,
        // especially for assets with multiple block chains such as USDT.
        const response = await this.privateGetDeposit (this.extend (request, params));
        //
        // v1
        //
        //     {
        //         "data": {
        //             "address": "0x26a3CB49578F07000575405a57888681249c35Fd"
        //         },
        //         "email": "igor.kroitor@gmial.com",
        //         "status": "success",
        //     }
        //
        // v2 (not supported yet)
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "asset": "XRP",
        //                 "blockChain": "Ripple",
        //                 "addressData": {
        //                     "address": "rpinhtY4p35bPmVXPbfWRUtZ1w1K1gYShB",
        //                     "destTag": "54301"
        //                 }
        //             }
        //         ],
        //         "email": "xxx@xxx.com",
        //         "status": "success" // the request has been submitted to the server
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'Authorization': 'Bearer ' + this.token,
            };
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                if (Object.keys (query).length) {
                    headers['Content-Type'] = 'application/json';
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"success":false,"message":"Wrong parameters","errors":{"candleType":["Invalid Candle Type!"]}}
        //     {"success":false,"message":"Wrong parameters","errors":{"time":["timeStart or timeEnd is less then 1"]}}
        //     {"success":false,"message":"Not enough  ETH"}
        //
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
