'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder, BadSymbol } = require ('./base/errors');
const { ROUND, TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmax',
            'name': 'BitMax',
            'countries': [ 'CN' ], // China
            'rateLimit': 500,
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchTrades': true,
                'fetchAccounts': true,
                'fetchMyTrades': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchOrderTrades': false,
                'fetchClosedOrders': true,
                'fetchTransactions': false,
                'cancelAllOrders': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg',
                'api': 'https://bitmax.io',
                'test': 'https://bitmax-test.io',
                'www': 'https://bitmax.io',
                'doc': [
                    'https://bitmax-exchange.github.io/bitmax-pro-api/#bitmax-pro-api-documentation',
                ],
                'fees': 'https://bitmax.io/#/feeRate/tradeRate',
                'referral': 'https://bitmax.io/#/register?inviteCode=EL6BXBQM',
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'products',
                        'ticker',
                        'barhist/info',
                        'barhist',
                        'depth',
                        'trades',
                        'cash/assets', // not documented
                        'cash/products', // not documented
                        'margin/assets', // not documented
                        'margin/products', // not documented
                        'futures/collateral',
                        'futures/contracts',
                        'futures/ref-px',
                        'futures/market-data',
                        'futures/funding-rates',
                    ],
                },
                'private': {
                    'get': [
                        'cash/balance',
                        'cash/order/hist/current',
                        'cash/order/open',
                        'cash/order/status',
                        'futures/balance',
                        'futures/order/hist/current',
                        'futures/order/open',
                        'futures/order/status',
                        'margin/balance',
                        'margin/order/hist/current',
                        'margin/order/open',
                        'margin/order/status',
                        'margin/risk',
                        'order/hist',
                        'transaction',
                        'info',
                        'wallet/deposit/address',
                    ],
                    'post': [
                        'cash/order',
                        'cash/order/batch',
                        'futures/order',
                        'futures/order/batch',
                        'margin/order',
                        'margin/order/batch',
                    ],
                    'delete': [
                        'cash/order',
                        'cash/order/all',
                        'cash/order/batch',
                        'margin/order',
                        'margin/order/all',
                        'margin/order/batch',
                        'futures/order',
                        'futures/order/all',
                        'futures/order/batch',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'account': 'cash', // 'cash'/'margin'/'futures'
                'accountGroup': undefined,
                'parseOrderToPrecision': false,
            },
            'exceptions': {
                'exact': {
                    // TODO: fix error code mapping
                    '2100': AuthenticationError, // {"code":2100,"message":"ApiKeyFailure"}
                    '5002': BadSymbol, // {"code":5002,"message":"Invalid Symbol"}
                    '6001': BadSymbol, // {"code":6001,"message":"Trading is disabled on symbol."}
                    '6010': InsufficientFunds, // {'code': 6010, 'message': 'Not enough balance.'}
                    '60060': InvalidOrder, // { 'code': 60060, 'message': 'The order is already filled or canceled.' }
                    '600503': InvalidOrder, // {"code":600503,"message":"Notional is too small."}
                },
                'broad': {},
            },
            'commonCurrencies': {
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
            },
        });
    }

    getValidAccounts () {
        // Bitmax sub-account
        return ['cash', 'margin', 'futures'];
    }

    getAccount (params = {}) {
        // get current or provided bitmax sub-account
        const account = this.safeValue (params, 'account', this.options['account']);
        return account.toLowerCase ().capitalize ();
    }

    setAccount (account) {
        // set default bitmax sub-account
        const validAccounts = this.getValidAccounts ();
        if (account in validAccounts) {
            this.options['account'] = account;
        }
    }

    getFuturesCollateral (params = {}) {
        // futures collateral
        const response = this.publicGetFuturesCollateral (params);
        return this.safeValue (response, 'data', []);
    }

    async fetchCurrencies (params = {}) {
        const assets = await this.publicGetAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode" : "LTCBULL",
        //                 "assetName" : "3X Long LTC Token",
        //                 "precisionScale" : 9,
        //                 "nativeScale" : 4,
        //                 "withdrawalFee" : "0.2",
        //                 "minWithdrawalAmt" : "1.0",
        //                 "status" : "Normal"
        //             },
        //         ]
        //     }
        //
        const margin = await this.publicGetMarginAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode":"BTT",
        //                 "borrowAssetCode":"BTT-B",
        //                 "interestAssetCode":"BTT-I",
        //                 "nativeScale":0,
        //                 "numConfirmations":1,
        //                 "withdrawFee":"100.0",
        //                 "minWithdrawalAmt":"1000.0",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "interestRate":"0.001"
        //             }
        //         ]
        //     }
        //
        const cash = await this.publicGetCashAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode":"LTCBULL",
        //                 "nativeScale":4,
        //                 "numConfirmations":20,
        //                 "withdrawFee":"0.2",
        //                 "minWithdrawalAmt":"1.0",
        //                 "statusCode":"Normal",
        //                 "statusMessage":""
        //             }
        //         ]
        //     }
        //
        const assetsData = this.safeValue (assets, 'data', []);
        const marginData = this.safeValue (margin, 'data', []);
        const cashData = this.safeValue (cash, 'data', []);
        const assetsById = this.indexBy (assetsData, 'assetCode');
        const marginById = this.indexBy (marginData, 'assetCode');
        const cashById = this.indexBy (cashData, 'assetCode');
        const dataById = this.deepExtend (assetsById, marginById, cashById);
        const ids = Object.keys (dataById);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = dataById[id];
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger2 (currency, 'precisionScale', 'nativeScale');
            // why would the exchange API have different names for the same field
            const fee = this.safeFloat2 (currency, 'withdrawFee', 'withdrawalFee');
            const status = this.safeString2 (currency, 'status', 'statusCode');
            const active = (status === 'Normal');
            const margin = ('borrowAssetCode' in currency);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'margin': margin,
                'name': this.safeString (currency, 'assetName'),
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawalAmt'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const products = await this.publicGetProducts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"LBA/BTC",
        //                 "baseAsset":"LBA",
        //                 "quoteAsset":"BTC",
        //                 "status":"Normal",
        //                 "minNotional":"0.000625",
        //                 "maxNotional":"6.25",
        //                 "marginTradable":false,
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "tickSize":"0.000000001",
        //                 "lotSize":"1"
        //             },
        //         ]
        //     }
        //
        const cash = await this.publicGetCashProducts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"QTUM/BTC",
        //                 "domain":"BTC",
        //                 "tradingStartTime":1569506400000,
        //                 "collapseDecimals":"0.0001,0.000001,0.00000001",
        //                 "minQty":"0.000000001",
        //                 "maxQty":"1000000000",
        //                 "minNotional":"0.000625",
        //                 "maxNotional":"12.5",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "tickSize":"0.00000001",
        //                 "useTick":false,
        //                 "lotSize":"0.1",
        //                 "useLot":false,
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "qtyScale":1,
        //                 "priceScale":8,
        //                 "notionalScale":4
        //             }
        //         ]
        //     }
        //
        const futures = await this.publicGetFuturesContracts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC-PERP",
        //                 "tradingStartTime":1579701600000,
        //                 "collapseDecimals":"1,0.1,0.01",
        //                 "minQty":"0.000000001",
        //                 "maxQty":"1000000000",
        //                 "minNotional":"5",
        //                 "maxNotional":"1000000",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "tickSize":"0.25",
        //                 "lotSize":"0.0001",
        //                 "priceScale":2,
        //                 "qtyScale":4,
        //                 "notionalScale":2
        //             }
        //         ]
        //     }
        //
        const productsData = this.safeValue (products, 'data', []);
        const productsById = this.indexBy (productsData, 'symbol');
        const cashData = this.safeValue (cash, 'data', []);
        const futuresData = this.safeValue (futures, 'data', []);
        const cashAndFuturesData = this.arrayConcat (cashData, futuresData);
        const cashAndFuturesById = this.indexBy (cashAndFuturesData, 'symbol');
        const dataById = this.deepExtend (productsById, cashAndFuturesById);
        const ids = Object.keys (dataById);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = dataById[id];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': this.safeFloat (market, 'lotSize'),
                'price': this.safeFloat (market, 'tickSize'),
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'Normal');
            const type = ('useLot' in market) ? 'spot' : 'future';
            const spot = (type === 'spot');
            const future = (type === 'future');
            let symbol = id;
            if (!future) {
                symbol = base + '/' + quote;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': type,
                'spot': spot,
                'future': future,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minQty'),
                        'max': this.safeFloat (market, 'maxQty'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'tickSize'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minNotional'),
                        'max': this.safeFloat (market, 'maxNotional'),
                    },
                },
            });
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        // TODO: fee calculation here is incorrect, we need to support tiered fee calculation.
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchAccounts (params = {}) {
        let accountGroup = this.safeString (this.options, 'accountGroup');
        let records = undefined;
        if (accountGroup === undefined) {
            const response = await this.privateGetInfo (params);
            //
            // {
            //    'code': 0,
            //    'data':
            //        {
            //            'email': 'xxxcc@gmail.com',
            //            'accountGroup': 5,
            //            'viewPermission': True,
            //            'tradePermission': True,
            //            'transferPermission': True,
            //            'withdrawPermission': True,
            //            'cashAccount': ['xxxxxxxxxxxxxxxxxxxxxxxxxx'],
            //            'marginAccount': ['yyyyyyyyyyyyyyyyyyyyyyyyy'],
            //            'futuresAccount': ['zzzzzzzzzzzzzzzzzzzzzzzzz'],
            //            'userUID': 'U123456789'
            //        }
            // }
            //
            if (response['code'] === 0) {
                records = response['data'];
                accountGroup = this.safeString (records, 'accountGroup');
                this.options['accountGroup'] = accountGroup;
            }
        }
        return [
            {
                'id': accountGroup,
                'type': undefined,
                'currency': undefined,
                'info': records,
            },
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const method = 'privateGet' + this.getAccount (params) + 'Balance';
        const response = await this[method] (params);
        //
        // {
        //    'code': 0,
        //    'data':
        //        [
        //            {
        //                'asset': 'BCHSV',
        //                'totalBalance': '64.298000048',
        //                'availableBalance': '64.298000048'
        //            },
        //         ]
        // }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableBalance');
            account['total'] = this.safeFloat (balance, 'totalBalance');
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "m":"depth-snapshot",
        //             "symbol":"BTC-PERP",
        //             "data":{
        //                 "ts":1590223998202,
        //                 "seqnum":115444921,
        //                 "asks":[
        //                     ["9207.5","18.2383"],
        //                     ["9207.75","18.8235"],
        //                     ["9208","10.7873"],
        //                 ],
        //                 "bids":[
        //                     ["9207.25","0.4009"],
        //                     ["9207","0.003"],
        //                     ["9206.5","0.003"],
        //                 ]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderbook = this.safeValue (data, 'data', {});
        const timestamp = this.safeInteger (orderbook, 'ts');
        const result = this.parseOrderBook (orderbook, timestamp);
        result['nonce'] = this.safeInteger (orderbook, 'seqnum');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"QTUM/BTC",
        //         "open":"0.00016537",
        //         "close":"0.00019077",
        //         "high":"0.000192",
        //         "low":"0.00016537",
        //         "volume":"846.6",
        //         "ask":["0.00018698","26.2"],
        //         "bid":["0.00018408","503.7"],
        //         "type":"spot"
        //     }
        //
        const timestamp = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        let symbol = marketId;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else if (marketId !== undefined) {
            const type = this.safeString (ticker, 'type');
            if (type === 'spot') {
                const [ baseId, quoteId ] = marketId.split ('/');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const close = this.safeFloat (ticker, 'close');
        const bid = this.safeValue (ticker, 'bid', []);
        const ask = this.safeValue (ticker, 'ask', []);
        const open = this.safeFloat (ticker, 'open');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((open !== undefined) && (close !== undefined)) {
            change = close - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, close) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (bid, 0),
            'bidVolume': this.safeFloat (bid, 1),
            'ask': this.safeFloat (ask, 0),
            'askVolume': this.safeFloat (ask, 1),
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "symbol":"BTC-PERP", // or "BTC/USDT"
        //             "open":"9073",
        //             "close":"9185.75",
        //             "high":"9185.75",
        //             "low":"9185.75",
        //             "volume":"576.8334",
        //             "ask":["9185.75","15.5863"],
        //             "bid":["9185.5","0.003"],
        //             "type":"derivatives", // or "spot"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"QTUM/BTC",
        //                 "open":"0.00016537",
        //                 "close":"0.00019077",
        //                 "high":"0.000192",
        //                 "low":"0.00016537",
        //                 "volume":"846.6",
        //                 "ask":["0.00018698","26.2"],
        //                 "bid":["0.00018408","503.7"],
        //                 "type":"spot"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     {
        //         "m":"bar",
        //         "s":"BTC/USDT",
        //         "data":{
        //             "i":"1",
        //             "ts":1590228000000,
        //             "o":"9139.59",
        //             "c":"9131.94",
        //             "h":"9139.99",
        //             "l":"9121.71",
        //             "v":"25.20648"
        //         }
        //     }
        //
        const data = this.safeValue (ohlcv, 'data', {});
        return [
            this.safeInteger (data, 'ts'),
            this.safeFloat (data, 'o'),
            this.safeFloat (data, 'h'),
            this.safeFloat (data, 'l'),
            this.safeFloat (data, 'c'),
            this.safeFloat (data, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        // if since and limit are not specified
        // the exchange will return just 1 last candle by default
        const duration = this.parseTimeframe (timeframe);
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const defaultLimit = this.safeInteger (options, 'limit', 500);
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                limit = defaultLimit;
            } else {
                limit = Math.min (limit, defaultLimit);
            }
            request['to'] = this.sum (since, limit * duration * 1000, 1);
        } else if (limit !== undefined) {
            request['n'] = limit; // max 500
        }
        const response = await this.publicGetBarhist (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "m":"bar",
        //                 "s":"BTC/USDT",
        //                 "data":{
        //                     "i":"1",
        //                     "ts":1590228000000,
        //                     "o":"9139.59",
        //                     "c":"9131.94",
        //                     "h":"9139.99",
        //                     "l":"9121.71",
        //                     "v":"25.20648"
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "p":"9128.5", // price
        //         "q":"0.0030", // quantity
        //         "ts":1590229002385, // timestamp
        //         "bm":false, // if true, the buyer is the market maker, we only use this field to "define the side" of a public trade
        //         "seqnum":180143985289898554
        //     }
        //
        const timestamp = this.safeInteger (trade, 'ts');
        const price = this.safeFloat2 (trade, 'price', 'p');
        const amount = this.safeFloat (trade, 'q');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const buyerIsMaker = this.safeValue (trade, 'bm', false);
        const makerOrTaker = buyerIsMaker ? 'maker' : 'taker';
        const side = buyerIsMaker ? 'buy' : 'sell';
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': makerOrTaker,
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
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // max 100
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "m":"trades",
        //             "symbol":"BTC-PERP",
        //             "data":[
        //                 {"p":"9128.5","q":"0.0030","ts":1590229002385,"bm":false,"seqnum":180143985289898554},
        //                 {"p":"9129","q":"0.0030","ts":1590229002642,"bm":false,"seqnum":180143985289898587},
        //                 {"p":"9129.5","q":"0.0030","ts":1590229021306,"bm":false,"seqnum":180143985289899043}
        //             ]
        //         }
        //     }
        //
        const records = this.safeValue (response, 'data', []);
        const trades = this.safeValue (records, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PendingNew': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        // {
        //    'symbol': 'BTC/USDT',
        //    'orderType': 'Limit',
        //    'action': 'new',
        //    'timestamp': 1583812256973,
        //    'id': '0e602eb4337d4aebbe3c438f6cc41aee',
        //    'orderId': 'a170c29124378418641348f6cc41aee'
        // }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        // {
        //    'avgPx': '9126.75',
        //    'cumFee': '0.002738025',
        //    'cumFilledQty': '0.0005',
        //    'errorCode': '',
        //    'execInst': 'NULL_VAL',
        //    'feeAsset': 'USDT',
        //    'lastExecTime': 1583443804918,
        //    'orderId': 'r170ac9b032cU9490877774sbtcpeAAb',
        //    'orderQty': '0.0005',
        //    'orderType': 'Market',
        //    'price': '8853',
        //    'seqNum': 4204789616,
        //    'side': 'Sell',
        //    'status': 'Filled',
        //    'stopPrice': '',
        //    'symbol': 'BTC-PERP'
        // }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('/');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (order, 'lastExecTime') || this.safeInteger (order, 'timestamp');
        let price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'orderQty');
        const avgFillPx = this.safeFloat (order, 'avgPx');
        const filled = this.safeFloat (order, 'cumFilledQty');
        let remaining = (amount || 0) - (filled || 0);
        if (remaining < 0) {
            remaining = 0;
        }
        if (symbol !== undefined) {
            remaining = this.amountToPrecision (symbol, remaining);
        }
        const cost = (avgFillPx || 0) * (filled || 0);
        const id = this.safeString (order, 'orderId');
        let type = this.safeString (order, 'orderType');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        const side = this.safeStringLower (order, 'side');
        const fee = {
            'cost': this.safeFloat (order, 'cumFee'),
            'currency': this.safeString (order, 'feeAsset'),
        };
        const clientOrderId = id;
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': avgFillPx,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const request = {
            'id': this.coid (), // optional, a unique identifier of length 32
            // 'time': this.milliseconds (), // milliseconds since UNIX epoch in UTC, this is filled in the private section of the sign() method below
            'symbol': market['id'],
            'orderPrice': this.priceToPrecision (symbol, price || 0), // optional, limit price of the order. This field is required for limit orders and stop limit orders
            'stopPrice': this.priceToPrecision (symbol, this.safeValue (params, 'stopPrice', 0.0)), // optional, stopPrice of the order. This field is required for stop_market orders and stop limit orders
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type, // order type, you shall specify one of the following: "limit", "market", "stop_market", "stop_limit"
            'side': side, // "buy" or "sell"
            'postOnly': this.safeValue (params, 'postOnly', false), // optional, if true, the order will either be posted to the limit order book or be cancelled, i.e. the order cannot take liquidity, default is false
            'timeInForce': this.safeString (params, 'timeInForce', 'GTC'), // optional, supports "GTC" good-till-canceled, "IOC" immediate-or-cancel, and "FOK" for fill-or-kill
        };
        if ((type === 'limit') || (type === 'stop_limit')) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const method = 'privatePost' + this.getAccount (params) + 'Order';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //  'code': 0,
        //  'data': {
        //              'ac': 'CASH',
        //              'accountId': 'hongyu.wang',
        //              'action': 'place-order',
        //              'info': {
        //                   'id': 'JhAAjOoTY6EINXC8QcOL18HoXw89FU0u',
        //                   'orderId': 'a170d000346b5450276356oXw89FU0u',
        //                   'orderType': 'Limit',
        //                   'symbol': 'BTMX/USDT',
        //                   'timestamp': 1584037640014
        //                  },
        //              'status': 'Ack'
        //          }
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const info = this.extend (this.safeValue (data, 'info'), { 'status': undefined });
        return this.parseOrder (info, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'orderId': id,
        };
        let accounts = undefined;
        if ('account' in params) {
            accounts = [ this.safeValue (params, 'account') ];
        } else {
            accounts = this.getValidAccounts ();
        }
        let response = undefined;
        for (let i = 0; i < accounts.length; i++) {
            if (response === undefined) {
                try {
                    const account = this.getAccount ({ 'account': accounts[i] });
                    const method = 'privateGet' + account + 'OrderStatus';
                    response = await this[method] (this.extend (request, params));
                } catch (error) {
                    // log error
                    response = undefined;
                }
            }
        }
        //
        //  {
        //      'code': 0,
        //      'accountId': 'ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
        //      'ac': 'CASH',
        //      'data': {
        //          'seqNum': 4208248561,
        //          'orderId': 'r170adcc717eU123456789bbtmabc3P',
        //          'symbol': 'BTMX/USDT',
        //          'orderType': 'Limit',
        //          'lastExecTime': 1583463823205,
        //          'price': '0.06043',
        //          'orderQty': '100',
        //          'side': 'Buy',
        //          'status': 'Filled',
        //          'avgPx': '0.06043',
        //          'cumFilledQty': '100',
        //          'stopPrice': '',
        //          'errorCode': '',
        //          'cumFee': '0.006043',
        //          'feeAsset': 'USDT',
        //          'execInst': 'NULL_VAL'
        //          }
        // }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        const request = {
            // 'symbol': 'ETH/BTC', // optional
            // 'category': 'CASH', // optional, string
            // 'orderType': 'Market', // optional, string
            // 'page': 1, // optional, integer type, starts at 1
            // 'pageSize': 100, // optional, integer type
            // 'side': 'buy', // or 'sell', optional, case insensitive.
            // 'startTime': 1566091628227, // optional, integer milliseconds since UNIX epoch representing the start of the range
            // 'endTime': 1566091628227, // optional, integer milliseconds since UNIX epoch representing the end of the range
            // 'status': 'Filled', // optional, can only be one of "Filled", "Canceled", "Rejected"
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['n'] = limit; // default 15, max 50
        }
        request['executedOnly'] = this.safeValue (params, 'executedOnly', false);
        const method = 'privateGet' + this.getAccount (params) + 'OrderHistCurrent';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //    'code': 0,
        //    'accountId': 'test1@xxxxx.io',
        //    'ac': 'CASH',
        //    'data': [
        //        {
        //            'seqNum': 30181890,
        //            'orderId': 'a170c4f6cae084186413483b0e984fe',
        //            'symbol': 'BTC/USDT',
        //            'orderType': 'Limit',
        //            'lastExecTime': 1583852473185,
        //            'price': '8500',
        //            'orderQty': '0.01',
        //            'side': 'Buy',
        //            'status': 'Filled',
        //            'avgPx': '8032.04',
        //            'cumFilledQty': '0.01',
        //            'stopPrice': '',
        //            'errorCode': '',
        //            'cumFee': '0.065862728',
        //            'feeAsset': 'USDT',
        //            'execInst': 'NULL_VAL'
        //        }]
        // }
        //
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        const request = {
            // 'symbol': 'symbol'  optional
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const method = 'privateGet' + this.getAccount (params) + 'OrderOpen';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //    'code': 0,
        //    'accountId': 'MPXFNEYEJIJ93CREXT3LTCIDIJPCFNIX',
        //    'ac': 'CASH',
        //    'data':
        //        [{
        //            'seqNum': 4305977824,
        //            'orderId': 'a170c9e191a7U9490877774397007e73',
        //            'symbol': 'BTMX/USDT',
        //            'orderType': 'Limit',
        //            'lastExecTime': 1583934968446,
        //            'price': '0.045',
        //            'orderQty': '200',
        //            'side': 'Buy',
        //            'status': 'New',
        //            'avgPx': '0',
        //            'cumFilledQty': '0',
        //            'stopPrice': '',
        //            'errorCode': '',
        //            'cumFee': '0',
        //            'feeAsset': 'USDT',
        //            'execInst': 'NULL_VAL'
        //        }]
        // }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        const request = {
            // 'symbol': 'ETH/BTC', // optional
            // 'category': 'CASH'/'MARGIN'/"FUTURES', // optional, string
            // 'orderType': 'Market', // optional, string
            // 'page': 1, // optional, integer type, starts at 1
            // 'pageSize': 100, // optional, integer type
            // 'side': 'buy', // or 'sell', optional, case insensitive.
            // 'startTime': 1566091628227, // optional, integer milliseconds since UNIX epoch representing the start of the range
            // 'endTime': 1566091628227, // optional, integer milliseconds since UNIX epoch representing the end of the range
            // 'status': 'Filled', // optional, can only be one of "Filled", "Canceled", "Rejected"
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['n'] = limit; // default 15, max 50
        }
        const response = await this.privateGetOrderHist (this.extend (request, params));
        //
        // {
        //    'code': 0,
        //    'data':
        //        {
        //            'page': 1,
        //            'pageSize': 20,
        //            'limit': 500,
        //            'hasNext': True,
        //            'data': [
        //                {
        //                    'ac': 'CASH',
        //                    'accountId': 'ABCDEFGHIJKLMOPQRSTUVWXYZABC',
        //                    'avgPx': '0',
        //                    'cumFee': '0',
        //                    'cumQty': '0',
        //                    'errorCode': 'NULL_VAL',
        //                    'feeAsset': 'USDT',
        //                    'lastExecTime': 1583894311925,
        //                    'orderId': 'r170c77528bdU9490877774bbtcu9DwL',
        //                    'orderQty': '0.001', 'orderType': 'Limit',
        //                    'price': '7912.88',
        //                    'sendingTime': 1583894310880,
        //                    'seqNum': 4297339552,
        //                    'side': 'Buy',
        //                    'status': 'Canceled',
        //                    'stopPrice': '',
        //                    'symbol': 'BTC/USDT',
        //                    'execInst': 'NULL_VAL'
        //                }
        //            ]
        //        }
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'id': this.coid (), // optional
            'orderId': id,
            // 'time': this.milliseconds (), // this is filled in the private section of the sign() method below
        };
        const method = 'privateDelete' + this.getAccount (params) + 'Order';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //    'code': 0,
        //    'data':
        //        {
        //            'accountId': 'test1@xxxxx.io',
        //            'ac': 'CASH',
        //            'action': 'cancel-order',
        //            'status': 'Ack',
        //            'info': {
        //                'symbol': 'BTC/USDT',
        //                'orderType': '',
        //                'timestamp': 1583868590663,
        //                'id': 'de4f5a7c5df2433cbe427da14d8f84d5',
        //                'orderId': 'a170c5136edb8418641348575f38457'}
        //        }
        // }
        //
        const order = this.safeValue (this.safeValue (response, 'data', {}), 'info', {});
        order['status'] = undefined;
        return this.parseOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const request = {
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id']; // optional
        }
        const method = 'privateDelete' + this.getAccount (params) + 'OrderAll';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //    'code': 0,
        //    'data':
        //        {
        //            'accountId': 'test1@dengpan.io',
        //            'ac': 'CASH',
        //            'action': 'cancel-all',
        //            'status': 'Ack',
        //            'info':
        //                {
        //                    'symbol': '',
        //                    'orderType': 'NULL_VAL',
        //                    'timestamp': 1584057856765,
        //                    'id': '',
        //                    'orderId': ''
        //                }
        //             }
        //    }
        // }
        //
        const order = this.safeValue (this.safeValue (response, 'data', {}), 'info', {});
        order['status'] = undefined;
        order['orderType'] = undefined;
        order['symbol'] = symbol;
        return this.parseOrder (order);
    }

    coid () {
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const clientOrderId = parts.join ('');
        const coid = clientOrderId.slice (0, 32);
        return coid;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const currency = this.currency (code);
        const request = {
            'requestId': this.coid (),
            // 'time': this.milliseconds (), // this is filled in the private section of the sign() method below
            'asset': currency['id'],
            'isCommonApi': true, // not from request
        };
        const response = await this.privateGetWalletDepositAddress (this.extend (request, params));
        //
        //
        // {
        //    'code': 0,
        //    'data':
        //        {
        //            'asset': 'BTC',
        //            'assetName': 'Bitcoin',
        //            'address':
        //                [
        //                    {
        //                        'address': '3P5e8M6nQaGPB6zYJ447uGJKCJN2ZkEDLB',
        //                        'destTag': '',
        //                        'tagType': '',
        //                        'tagId': '',
        //                        'chainName': 'Bitcoin',
        //                        'numConfirmations': 3,
        //                        'withdrawalFee': 0.0005,
        //                        'nativeScale': 8,
        //                        'tips': []
        //                    }
        //                ]
        //        }
        // }
        //
        const data = this.safeValue (response, 'data', {});
        let addressData = this.safeValue (data, 'address', []);
        if (Array.isArray (addressData)) {
            addressData = this.safeValue (addressData, 0, {});
        }
        const address = this.safeString (addressData, 'address');
        const tag = this.safeString (addressData, 'destTag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api/pro/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            if (!this.safeValue (params, 'isCommonApi', false)) {
                let accountGroup = this.safeString (this.options, 'accountGroup');
                if (accountGroup === undefined) {
                    if (this.accounts !== undefined) {
                        accountGroup = this.accounts[0]['id'];
                    }
                }
                if (accountGroup !== undefined) {
                    url = '/' + accountGroup + url;
                }
            }
            query['time'] = this.milliseconds ().toString ();
            const auth = query['time'] + '+' + path.replace ('/{orderId}', ''); // fix sign error
            headers = {
                'x-auth-key': this.apiKey,
                'x-auth-timestamp': query['time'],
                'Content-Type': 'application/json',
            };
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers['x-auth-signature'] = this.decode (signature);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code":2100,"message":"ApiKeyFailure"}
        //     {'code': 6010, 'message': 'Not enough balance.'}
        //     {'code': 60060, 'message': 'The order is already filled or canceled.'}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        const error = (code !== undefined) && (code !== '0');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
