'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, OrderNotFound, InsufficientFunds, DDoSProtection, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitforex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitforex',
            'name': 'Bitforex',
            'countries': [ 'CN' ],
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295553-1160ec00-c50e-11ea-8ea0-df79276a9646.jpg',
                'api': 'https://api.bitforex.com',
                'www': 'https://www.bitforex.com',
                'doc': 'https://github.com/githubdev2020/API_Doc_en/wiki',
                'fees': 'https://help.bitforex.com/en_us/?cat=13',
                'referral': 'https://www.bitforex.com/en/invitationRegister?inviterId=1867438',
            },
            'api': {
                'public': {
                    'get': [
                        'api/v1/market/symbols',
                        'api/v1/market/ticker',
                        'api/v1/market/depth',
                        'api/v1/market/trades',
                        'api/v1/market/kline',
                    ],
                },
                'private': {
                    'post': [
                        'api/v1/fund/mainAccount',
                        'api/v1/fund/allAccount',
                        'api/v1/trade/placeOrder',
                        'api/v1/trade/placeMultiOrder',
                        'api/v1/trade/cancelOrder',
                        'api/v1/trade/orderInfo',
                        'api/v1/trade/orderInfos',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'deposit': {},
                    'withdraw': {
                        'BTC': 0.0005,
                        'ETH': 0.01,
                        'BCH': 0.0001,
                        'LTC': 0.001,
                        'ETC': 0.005,
                        'USDT': 5,
                        'CMCT': 30,
                        'AION': 3,
                        'LVT': 0,
                        'DATA': 40,
                        'RHP': 50,
                        'NEO': 0,
                        'AIDOC': 10,
                        'BQT': 2,
                        'R': 2,
                        'DPY': 0.8,
                        'GTC': 40,
                        'AGI': 30,
                        'DENT': 100,
                        'SAN': 1,
                        'SPANK': 8,
                        'AID': 5,
                        'OMG': 0.1,
                        'BFT': 5,
                        'SHOW': 150,
                        'TRX': 20,
                        'ABYSS': 10,
                        'THM': 25,
                        'ZIL': 20,
                        'PPT': 0.2,
                        'WTC': 0.4,
                        'LRC': 7,
                        'BNT': 1,
                        'CTXC': 1,
                        'MITH': 20,
                        'TRUE': 4,
                        'LYM': 10,
                        'VEE': 100,
                        'AUTO': 200,
                        'REN': 50,
                        'TIO': 2.5,
                        'NGC': 1.5,
                        'PST': 10,
                        'CRE': 200,
                        'IPC': 5,
                        'PTT': 1000,
                        'XMCT': 20,
                        'ATMI': 40,
                        'TERN': 40,
                        'XLM': 0.01,
                        'ODE': 15,
                        'FTM': 100,
                        'RTE': 100,
                        'DCC': 100,
                        'IMT': 500,
                        'GOT': 3,
                        'EGT': 500,
                        'DACC': 1000,
                        'UBEX': 500,
                        'ABL': 100,
                        'OLT': 100,
                        'DAV': 40,
                        'THRT': 10,
                        'RMESH': 3,
                        'UPP': 20,
                        'SDT': 0,
                        'SHR': 10,
                        'MTV': 3,
                        'ESS': 100,
                        'MET': 3,
                        'TTC': 20,
                        'LXT': 10,
                        'XCLP': 100,
                        'LUK': 100,
                        'UBC': 100,
                        'DTX': 10,
                        'BEAT': 20,
                        'DEED': 2,
                        'BGX': 3000,
                        'PRL': 20,
                        'ELY': 50,
                        'CARD': 300,
                        'SQR': 15,
                        'VRA': 400,
                        'BWX': 3500,
                        'MAS': 75,
                        'FLP': 0.6,
                        'UNC': 300,
                        'CRNC': 15,
                        'MFG': 70,
                        'ZXC': 70,
                        'TRT': 30,
                        'ZIX': 35,
                        'XRA': 10,
                        'AMO': 1600,
                        'IPG': 3,
                        'uDoo': 50,
                        'URB': 30,
                        'ARCONA': 3,
                        'CRAD': 5,
                        'NOBS': 1000,
                        'ADF': 2,
                        'ELF': 5,
                        'LX': 20,
                        'PATH': 15,
                        'SILK': 120,
                        'SKYFT': 50,
                        'EDN': 50,
                        'ADE': 50,
                        'EDR': 10,
                        'TIME': 0.25,
                        'SPRK': 20,
                        'QTUM': 0.01,
                        'BF': 5,
                        'ZPR': 100,
                        'HYB': 10,
                        'CAN': 30,
                        'CEL': 10,
                        'ATS': 50,
                        'KCASH': 1,
                        'ACT': 0.01,
                        'MT': 300,
                        'DXT': 30,
                        'WAB': 4000,
                        'HYDRO': 400,
                        'LQD': 5,
                        'OPTC': 200,
                        'EQUAD': 80,
                        'LATX': 50,
                        'LEDU': 100,
                        'RIT': 70,
                        'ACDC': 500,
                        'FSN': 2,
                    },
                },
            },
            'commonCurrencies': {
                'CREDIT': 'TerraCredit',
                'IQ': 'IQ.Cash',
                'UOS': 'UOS Network',
            },
            'exceptions': {
                '4004': OrderNotFound,
                '1013': AuthenticationError,
                '1016': AuthenticationError,
                '1017': PermissionDenied, // {"code":"1017","success":false,"time":1602670594367,"message":"IP not allow"}
                '3002': InsufficientFunds,
                '10204': DDoSProtection,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetApiV1MarketSymbols (params);
        const data = response['data'];
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const symbolParts = id.split ('-');
            const baseId = symbolParts[2];
            const quoteId = symbolParts[1];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = true;
            const precision = {
                'amount': this.safeInteger (market, 'amountPrecision'),
                'price': this.safeInteger (market, 'pricePrecision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minOrderAmount'),
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
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (trade, 'time');
        const id = this.safeString (trade, 'tid');
        const orderId = undefined;
        const amount = this.safeFloat (trade, 'amount');
        const price = this.safeFloat (trade, 'price');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        const sideId = this.safeInteger (trade, 'direction');
        const side = this.parseSide (sideId);
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': orderId,
            'fee': undefined,
            'takerOrMaker': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const market = this.market (symbol);
        const response = await this.publicGetApiV1MarketTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostApiV1FundAllAccount (params);
        const data = response['data'];
        const result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeFloat (balance, 'frozen');
            account['free'] = this.safeFloat (balance, 'active');
            account['total'] = this.safeFloat (balance, 'fix');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.markets[symbol];
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1MarketTicker (this.extend (request, params));
        const data = response['data'];
        const timestamp = this.safeInteger (data, 'date');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (data, 'high'),
            'low': this.safeFloat (data, 'low'),
            'bid': this.safeFloat (data, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (data, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (data, 'last'),
            'last': this.safeFloat (data, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (data, 'vol'),
            'quoteVolume': undefined,
            'info': response,
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "close":0.02505143,
        //         "currencyVol":0,
        //         "high":0.02506422,
        //         "low":0.02505143,
        //         "open":0.02506095,
        //         "time":1591508940000,
        //         "vol":51.1869
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'vol'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'ktype': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = limit; // default 1, max 600
        }
        const response = await this.publicGetApiV1MarketKline (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {"close":0.02505143,"currencyVol":0,"high":0.02506422,"low":0.02505143,"open":0.02506095,"time":1591508940000,"vol":51.1869},
        //             {"close":0.02503914,"currencyVol":0,"high":0.02506687,"low":0.02503914,"open":0.02505358,"time":1591509000000,"vol":9.1082},
        //             {"close":0.02505172,"currencyVol":0,"high":0.02507466,"low":0.02503895,"open":0.02506371,"time":1591509060000,"vol":63.7431},
        //         ],
        //         "success":true,
        //         "time":1591509427131
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetApiV1MarketDepth (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (data, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseSide (sideId) {
        if (sideId === 1) {
            return 'buy';
        } else if (sideId === 2) {
            return 'sell';
        } else {
            return undefined;
        }
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeFloat (order, 'createTime');
        const lastTradeTimestamp = this.safeFloat (order, 'lastTime');
        const symbol = market['symbol'];
        const sideId = this.safeInteger (order, 'tradeType');
        const side = this.parseSide (sideId);
        const type = undefined;
        const price = this.safeFloat (order, 'orderPrice');
        const average = this.safeFloat (order, 'avgPrice');
        const amount = this.safeFloat (order, 'orderAmount');
        const filled = this.safeFloat (order, 'dealAmount');
        const remaining = amount - filled;
        const status = this.parseOrderStatus (this.safeString (order, 'orderState'));
        const cost = filled * price;
        const feeSide = (side === 'buy') ? 'base' : 'quote';
        const feeCurrency = market[feeSide];
        const fee = {
            'cost': this.safeFloat (order, 'tradeFee'),
            'currency': feeCurrency,
        };
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'orderId': id,
        };
        const response = await this.privatePostApiV1TradeOrderInfo (this.extend (request, params));
        const order = this.parseOrder (response['data'], market);
        return order;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'state': 0,
        };
        const response = await this.privatePostApiV1TradeOrderInfos (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'state': 1,
        };
        const response = await this.privatePostApiV1TradeOrderInfos (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let sideId = undefined;
        if (side === 'buy') {
            sideId = 1;
        } else if (side === 'sell') {
            sideId = 2;
        }
        const request = {
            'symbol': this.marketId (symbol),
            'price': price,
            'amount': amount,
            'tradeType': sideId,
        };
        const response = await this.privatePostApiV1TradePlaceOrder (this.extend (request, params));
        const data = response['data'];
        return {
            'info': response,
            'id': this.safeString (data, 'orderId'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        const results = await this.privatePostApiV1TradeCancelOrder (this.extend (request, params));
        const success = results['success'];
        const returnVal = { 'info': results, 'success': success };
        return returnVal;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let payload = this.urlencode ({ 'accessKey': this.apiKey });
            query['nonce'] = this.milliseconds ();
            if (Object.keys (query).length) {
                payload += '&' + this.urlencode (this.keysort (query));
            }
            // let message = '/' + 'api/' + this.version + '/' + path + '?' + payload;
            const message = '/' + path + '?' + payload;
            const signature = this.hmac (this.encode (message), this.encode (this.secret));
            body = payload + '&signData=' + signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (typeof body !== 'string') {
            return; // fallback to default error handler
        }
        if ((body[0] === '{') || (body[0] === '[')) {
            const feedback = this.id + ' ' + body;
            const success = this.safeValue (response, 'success');
            if (success !== undefined) {
                if (!success) {
                    const code = this.safeString (response, 'code');
                    this.throwExactlyMatchedException (this.exceptions, code, feedback);
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
