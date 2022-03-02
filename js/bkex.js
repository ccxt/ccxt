'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bkex',
            'name': 'BKEX',
            'countries': [ 'BVI' ], // British Virgin Islands
            'rateLimit': 100,
            'version': 'v2',
            'certified': true,
            'has': {
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'deposit': undefined,
                'editOrder': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': undefined,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': true,
                'privateAPI': true,
                'publicAPI': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.bkex.com',
                    'private': 'https://api.bkex.com',
                },
                'www': 'https://www.bkex.com/',
                'doc': [
                    'https://bkexapi.github.io/docs/api_en.htm',
                ],
                'fees': [
                    'https://www.bkex.com/help/instruction/33',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        '/common/symbols': 1,
                        '/common/currencys': 1,
                        '/common/timestamp': 1,
                        '/q/kline': 1,
                        '/q/tickers': 1,
                        '/q/ticker/price': 1,
                        '/q/depth': 1,
                        '/q/deals': 1,
                        // contracts:
                        '/contract/common/brokerInfo': 1,
                        '/contract/q/index': 1,
                        '/contract/q/depth': 1,
                        '/contract/q/depthMerged': 1,
                        '/contract/q/trades': 1,
                        '/contract/q/kline': 1,
                        '/contract/q/ticker24hr': 1,
                    },
                },
                'private': {
                    'get': {
                        '/u/api/info': 1,
                        '/u/account/balance': 1,
                        '/u/wallet/address': 1,
                        '/u/wallet/depositRecord': 1,
                        '/u/wallet/withdrawRecord': 1,
                        '/u/order/openOrders': 1,
                        '/u/order/openOrder/detail': 1,
                        '/u/order/historyOrders': 1,
                        // contracts:
                        '/contract/trade/getOrder': 1,
                        '/contract/trade/openOrders': 1,
                        '/contract/trade/historyOrders': 1,
                        '/contract/trade/myTrades': 1,
                        '/contract/trade/positions': 1,
                        '/contract/u/account': 1,
                    },
                    'post': {
                        '/u/account/transfer': 1,
                        '/u/wallet/withdraw': 1,
                        '/u/order/create': 1,
                        '/u/order/cancel': 1,
                        '/u/order/batchCreate': 1,
                        '/u/order/batchCancel': 1,
                        // contracts:
                        '/contract/trade/order': 1,
                        '/contract/trade/orderCancel': 1,
                        '/contract/trade/modifyMargin': 1,
                        '/contract/ws/dataStream/create': 1,
                        '/contract/ws/dataStream/update': 1,
                        '/contract/ws/dataStream/delete': 1,
                    },
                    'delete': {
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.15 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'timeframes': {
                    'spot': {
                    },
                    'contract': {
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP-20(BSC)',
                },
            },
            'commonCurrencies': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        //
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "minimumOrderSize": "0",
        //             "minimumTradeVolume": "0E-18",
        //             "pricePrecision": "11",
        //             "supportTrade": true,
        //             "symbol": "COMT_USDT",
        //             "volumePrecision": 0
        //         },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'marketId': baseId + '_' + quoteId,
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
                'future': false,
                'swap': false,
                'option': false,
                'active': this.safeValue (market, 'supportTrade'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'volumePrecision'),
                    'price': this.safeInteger (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minimumOrderSize'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimumTradeVolume'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCommonCurrencys (params);
        //
        // {
        //     "code": "0",
        //     "data": [
        //        {
        //           "currency": "ETH",
        //           "maxWithdrawOneDay": "100.000000000000000000",
        //           "maxWithdrawSingle": "50.000000000000000000",
        //           "minWithdrawSingle": "0.005000000000000000",
        //           "supportDeposit": true,
        //           "supportTrade": true,
        //           "supportWithdraw": true,
        //           "withdrawFee": 0.01
        //        },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const withdrawEnabled = this.safeValue (currency, 'supportWithdraw');
            const depositEnabled = this.safeValue (currency, 'supportDeposit');
            const tradeEnabled = this.safeValue (currency, 'supportTrade');
            const active = withdrawEnabled && depositEnabled && tradeEnabled;
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'active': active,
                'fee': this.safeNumber (currency, 'withdrawFee'),
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': this.safeNumber (currency, 'minWithdrawSingle'), 'max': this.safeNumber (currency, 'maxWithdrawSingle') },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetCommonTimestamp (params);
        //
        // {
        //     "code": '0',
        //     "data": 1573542445411,
        //     "msg": "success",
        //     "status": 0
        // }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        // their docs says that 'from/to' arguments are mandatory, however that's not true in reality
        if (since !== undefined) {
            request['from'] = since;
            // when 'since' [from] argument is set, then exchange also requires 'to' value to be set. So we have to set 'to' argument depending 'limit' amount (if limit was not provided, then exchange-default 500).
            if (limit === undefined) {
                limit = 500;
            }
            const duration = this.parseTimeframe (timeframe);
            const timerange = limit * duration * 1000;
            request['to'] = this.sum (request['from'], timerange);
        }
        const response = await this.publicGetQKline (request);
        //
        // {
        //     "code": "0",
        //     "data": [
        //       {
        //          "close": "43414.68",
        //          "high": "43446.47",
        //          "low": "43403.05",
        //          "open": "43406.05",
        //          "quoteVolume": "61500.40099",
        //          "symbol": "BTC_USDT",
        //          "ts": "1646152440000",
        //          "volume": 1.41627
        //       },
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 'ts'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchTickersHelper (symbolsString, params = {}) {
        const request = {
            'symbol': symbolsString,
        };
        return await this.publicGetQTickers (this.extend (request, params));
        // {
        //     "code": "0",
        //     "data": [
        //       {
        //         "change": "6.52",
        //         "close": "43573.470000",
        //         "high": "44940.540000",
        //         "low": "40799.840000",
        //         "open": "40905.780000",
        //         "quoteVolume": "225621691.5991",
        //         "symbol": "BTC_USDT",
        //         "ts": "1646156490781",
        //         "volume": 5210.349
        //       }
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.fetchTickersHelper (market['id'], params);
        const tickers = this.safeValue (response, 'data');
        const ticker = this.safeValue (tickers, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let marketIdsString = undefined;
        if (symbols !== undefined) {
            if (!Array.isArray (symbols)) {
                throw new BadRequest (this.id + ' fetchTickers() symbols argument should be an array');
            }
        }
        if (symbols !== undefined) {
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                marketIds.push (market['id']);
            }
            marketIdsString = marketIds.join (',');
        }
        const response = await this.fetchTickersHelper (marketIdsString, params);
        const tickers = this.safeValue (response, 'data');
        return this.parseTickers (tickers, symbols, params);
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'ts');
        const last = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market, false);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = Math.min (limit, 50);
        }
        const response = await this.publicGetQDepth (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": {
        //       "ask": [
        //         ["43820.07","0.86947"],
        //         ["43820.25","0.07503"],
        //       ],
        //       "bid": [
        //         ["43815.94","0.43743"],
        //         ["43815.72","0.08901"],
        //       ],
        //       "symbol": "BTC_USDT",
        //       "timestamp": 1646161595841
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data, symbol, undefined, 'bid', 'ask');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = Math.min (limit, 50);
        }
        const response = await this.publicGetQDeals (this.extend (request, params));
        // {
        //     "code": "0",
        //     "data": [
        //       {
        //         "direction": "S",
        //         "price": "43930.63",
        //         "symbol": "BTC_USDT",
        //         "ts": "1646224171992",
        //         "volume": 0.030653
        //       }, // first item is most recent
        //     ],
        //     "msg": "success",
        //     "status": 0
        // }
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'ts');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const side = this.parseOrderSide (this.safeString (trade, 'side'));
        const amount = this.safeNumber (trade, 'volume');
        const price = this.safeNumber (trade, 'price');
        const type = undefined;
        const takerOrMaker = undefined;
        let id = this.safeString (trade, 'tid');
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amount, price, type, takerOrMaker);
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    parseOrderSide (side) {
        const sides = {
            'B': 'buy',
            'S': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    syntheticTradeId (market = undefined, timestamp = undefined, side = undefined, amount = undefined, price = undefined, orderType = undefined, takerOrMaker = undefined) {
        // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp) + '-' + this.safeString (market, 'id', '_');
            if (side !== undefined) {
                id += '-' + side;
            }
            if (orderType !== undefined) {
                id += '-' + orderType;
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
        }
        return id;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privateGetUAccountBalance (query);
        // {
        //     "code": "0",
        //     "data": {
        //       "WALLET": [
        //         {
        //           "available": "0.221212121000000000",
        //           "currency": "PHX",
        //           "frozen": "0E-18",
        //           "total": 0.221212121
        //         },
        //         {
        //           "available": "44.959577229600000000",
        //           "currency": "USDT",
        //           "frozen": "0E-18",
        //           "total": 44.9595772296
        //         }
        //       ]
        //     },
        //     "msg": "success",
        //     "status": 0
        // }
        const balances = this.safeValue (response, 'data');
        const wallets = this.safeValue (balances, 'WALLET');
        const result = { 'info': wallets };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = wallet['currency'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (wallet, 'available');
            account['used'] = this.safeNumber (wallet, 'frozen');
            account['total'] = this.safeNumber (wallet, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.urlencode (params);
            if (method !== 'GET') {
                body = query;
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            headers = {
                'Cache-Control': 'no-cache',
                'Content-type': 'application/x-www-form-urlencoded',
                'X_ACCESS_KEY': this.apiKey,
                'X_SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // success
        //
        //   {
        //      "code": "0",
        //      "msg": "success",
        //      "status": 0,
        //      "data": [...],
        //   }
        //
        // error
        //   {
        //      "timestamp": "1646041085490",
        //      "status": "403",
        //      "error": "Forbidden",
        //      "message": "签名错误",
        //      "path": "/whatever/incorrect/path"
        //   }
        const message = this.safeValue (response, 'msg');
        if (message === 'success') {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if (responseCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
