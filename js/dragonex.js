'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, OrderNotFound, InvalidAddress } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class dragonex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dragonex',
            'name': 'DragonEx',
            'countries': ['CN'],
            'rateLimit': 500, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'has': {
                'fetchDepositAddress': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m': 1,
                '5m': 2,
                '15m': 3,
                '30m': 4,
                '1h': 5,
                '1d': 6,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/44139321/69334949-b9335c00-0c96-11ea-8e4d-cca246021d6f.png',
                'api': {
                    'public': 'https://openapi.dragonex.co/api/v1',
                    'private': 'https://openapi.dragonex.co',
                    'v1': 'https://openapi.dragonex.co/api/v1',
                    'aicoin': 'https://openapi.dragonex.co/api/aicoin',
                    'pal': 'https://openapi.dragonex.co/api/aicoin',
                },
                'www': 'https://dragonex.co',
                'referral': 'https://dragonex.co/account/register?inviteId=1248302',
                'doc': 'https://github.com/Dragonexio/OpenApi/blob/master/docs/English/1.interface_document_v1.md',
                'fees': 'https://dragonex.zendesk.com/hc/en-us/articles/115002431171-Fee',
            },
            'api': {
                'v1': {
                    'get': [
                        'market/kline/',  // 获取K线数据
                        'market/buy/',  // 获取买盘
                        'market/sell/',  // 获取卖盘
                        'market/real/',  // 获取实时行情
                        'market/depth/',  // 获取market depth数据
                    ],
                },
                'aicoin': {
                    'get': [
                        'market/real/',
                        'market/all_trade/',
                        'market/buy_sell/',
                    ],
                },
                'public': {
                    'get': [
                        'symbol/all/',  // 查询系统支持的所有交易对
                        'symbol/all2/',
                        'symbol/all3/',
                        'coin/all/',  // 查询系统支持的所有币种
                    ],
                },
                'private': {
                    'get': [
                        'user/own/',
                    ],
                    'post': [
                        'api/v1/token/new/',
                        'api/v1/token/status/',
                        'api/v1/user/own/',
                        'api/v1/user/fee/',
                        'api/v1/order/buy/',
                        'api/v1/order/sell/',
                        'api/v1/order/cancel/',
                        'api/v1/order/add/',
                        'api/v1/order/detail/',
                        'api/v1/order/detail2/',
                        'api/v1/order/history/',
                        'api/v1/order/history2/',
                        'api/v1/deal/history/',
                        'api/v1/user/detail/',
                        'api/pal/coin/withdraw/',
                        'api/v1/coin/withdraw/new/',
                        'api/v1/coin/prepay/history/',
                        'api/v1/coin/prepay/addr/',
                        'api/v1/coin/withdraw/history/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                // English
                // see https://github.com/Dragonexio/OpenApi/blob/master/docs/English/2.%20error_codes.md
                // Chinese
                // https://github.com/Dragonexio/OpenApi/blob/master/docs/%E4%B8%AD%E6%96%87/2.%20error_codes.md
                '1': 'ok',
                '2': 'Time Out',
                '3': 'Network Error',
                '4': 'Database Error',
                '5': 'Cache Error',
                '6': 'Server Error',
                '7': 'No Content',
                '8': 'Parameter Error',
                '5001': 'PriceLessThanLimit',
                '5002': 'VolumeLessThanLimit',
                '5003': 'MakeOrderIDFailed',
                '5004': 'DuplicateOrder',
                '5005': 'SellLessThanBuy',
                '5006': 'BuyGreaterThanSell',
                '5007': 'NotFindOrder',
                '5008': 'OrderCanceled',
                '5009': 'WriteTradeFailed',
                '5010': 'WrongPrice',
                '5011': 'WrongAmount',
                '5012': 'WrongUserID',
                '5013': 'OrderDone',
                '5014': 'OrderFailed',
                '5015': 'OrderNonTradable',
                '5016': 'AmountLessThanLimit',
                '5017': 'NewOrderDisabled',
                '5018': 'CancelOrderDisabled',
                '5019': 'TriggerPriceEqualClosePrice',
                '5020': 'OrderCountGreaterThanLimit',
                '9001': 'Key Already Exists',
                '9002': 'Key Not Exists',
                '9003': 'Invalid key',
                '9004': 'Signature Error',
                '9005': 'Invalid Token',
                '9006': 'Token Expires',
                '9007': 'Invalid User Credential',
                '9008': 'Frequent Operations',
                '9009': 'IP Disabled',
                '9010': 'Key Creation Fails',
                '9011': 'Unauthorized',
                '9014': 'Frequent Operations',
                '9015': 'Not in Binded IP',
                '9016': 'Exceed Maximum Times of Request Allowed in A Single Day',
                '9017': 'Fail to Obtain New Token',
                '9018': 'Key Expires',
                '9019': 'Date Field not Found in Headers',
                '9020': 'Improper Date Field Found in Headers',
                '9021': 'Incoming Time not within 15 Minutes',
                '9022': 'Token Kicked Off',
            },
            'options': {
                'change_quote': {
                    'USDT': 'USD',
                },
                'order_type': {
                    '0': '_',
                    '1': 'Buy',
                    '2': 'Sell',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const result = [];
        const spotResponse = await this.publicGetSymbolAll2 ();
        const spotMarkets = this.safeValue (spotResponse, 'data', {});
        const markets = this.safeValue (spotMarkets, 'list', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market[1];
            const parts = id.split ('_');
            const baseId = parts[0];
            const quoteId = parts[1];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': market[7],
                'price': market[5],
            };
            const symbol = base + '/' + quote;
            const taker = this.fees['trading']['taker'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'symbol_id': market[0],
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'taker': taker,
                'limits': {
                    'amount': {
                        'min': market[4],
                        'max': undefined,
                    },
                    'price': {
                        'min': market[2],
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (market[4]) * parseFloat (market[2]),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostUserOwn (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = balance['coin_id'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'volume') - this.safeFloat (balance, 'frozen');
            account['used'] = this.safeFloat (balance, 'frozen');
            account['total'] = this.safeFloat (balance, 'volume');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_id': market['symbol_id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = maximum = 100
        }
        const response = await this.v1GetMarketDepth (this.extend (request, params));
        const orderBook = this.parseOrderBook (response);
        const buysList = [];
        const sellsList = [];
        for (let i = 0; i < this.safeValue (response, 'data', {})['buys'].length; i++) {
            const buys = [];
            buys.push (this.safeInteger (this.safeValue (response, 'data', {})['buys'][i], 'price', 0));
            buys.push (this.safeInteger (this.safeValue (response, 'data', {})['buys'][i], 'volume', 0));
            buysList.push (buys);
        }
        for (let i = 0; i < this.safeValue (response, 'data', {})['sells'].length; i++) {
            const sells = [];
            sells.push (this.safeInteger (this.safeValue (response, 'data', {})['sells'][i], 'price', 0));
            sells.push (this.safeInteger (this.safeValue (response, 'data', {})['sells'][i], 'volume', 0));
            sellsList.push (sells);
        }
        orderBook['bids'] = buysList;
        orderBook['asks'] = sellsList;
        return orderBook;
    }

    parseTicker (ticker, market = undefined) {
        ticker = this.safeValue (this.safeValue (ticker, 'data', {}), 'list', [])[0];
        const lastNum = ticker.length - 1;
        const lastFourNum = ticker.length - 4;
        const timestamp = ticker[lastNum];
        const last = parseFloat (ticker[3]);
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker[4],
            'low': ticker[5],
            'bid': ticker[6],
            'bidVolume': undefined,
            'ask': ticker[7],
            'askVolume': undefined,
            'vwap': undefined,
            'open': ticker[2],
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': ticker[8],
            'percentage': ticker[9],
            'average': (last + parseFloat (ticker[2])) / 2,
            'baseVolume': ticker[lastFourNum],
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_ids': market['symbol_id'],
        };
        const response = await this.aicoinGetMarketReal (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_id': market['symbol_id'],
            'kline_type': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            since = 0;
            request['st'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.v1GetMarketKline (this.extend (request, params));
        const lists = this.safeValue (this.safeValue (response, 'data'), 'lists', []);
        const ohlcvs = [];
        for (let i = 0; i < lists.length; i++) {
            const cur = lists[i];
            const ohlcv = [parseInt (cur[6]) * 1000, cur[4], cur[2], cur[3], cur[1], cur[0]];  // columns - [ 'amount','close_price','max_price','min_price','open_price','pre_close_price','timestamp','usdt_amount','volume' ]
            ohlcvs.push (ohlcv);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeString (trade, 'timestamp');
        const price = this.safeFloat (trade, 'deal_price');
        const amount = this.safeFloat (trade, 'deal_volume');
        const id = this.safeString (trade, 'id');
        const side = undefined;
        let cost = undefined;
        const order = undefined;
        let type = this.safeString (trade, 'order_type');
        if (type !== undefined) {
            type = this.options['order_type'][type];
        }
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        const feeCost = this.safeFloat (trade, 'charge');
        let fee = undefined;
        const feeCurrency = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
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
        const request = {
            'symbol_id': market['symbol_id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.aicoinGetMarketAllTrade (this.extend (request, params));
        const data = this.safeValue (this.safeValue (response, 'data', {}), 'list', []);
        let result = [];
        for (let i = 0; i < data.length; i++) {
            const dataDict = {
                'id': data[i][0],
                'order_type': data[i][1],
                'deal_type': data[i][2],
                'deal_price': data[i][3],
                'deal_volume': data[i][4],
                'charge': data[i][5],
                'price_base': data[i][6],
                'usdt_amount': data[i][7],
                'timestamp': data[i][8],
            };
            const trade = this.parseTrade (dataDict, market);
            result.push (trade);
        }
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'Any',
            '1': 'Waiting',  // 等待成交
            '2': 'Done',  // 完成， 完全提交
            '3': 'Canceled',  // 取消+没有成交量
            '4': 'Failed',  // 失败
            '5': 'Cancelling',  // 正在取消订单
            '6': 'Partially_Filled',  // 部分成交+等待成交
            '7': 'Partially_Canceled',  // 部分成交+已撤销
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = market['symbol'];
        const timestamp = this.safeValue (order, 'timestamp') / 1000000;
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        const filled = this.safeFloat (order, 'trade_volume');
        let remaining = undefined;
        const average = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty', 0);
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.safeString (order, 'order_id');
        let side = this.safeStringLower (order, 'order_type', '0');
        side = this.options['order_type'][side];
        const feeCost = this.safeFloat (order, 'actual_fee', 0);
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (market !== undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'market',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_id': market['symbol_id'],
            'volume': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let response = undefined;
        if (side === 'buy') {
            response = await this.privatePostApiV1OrderBuy (this.extend (request, params));
        }
        if (side === 'sell') {
            response = await this.privatePostApiV1OrderSell (this.extend (request, params));
        }
        const timestamp = this.milliseconds ();
        const data = this.safeValue (response, 'data', {});
        return {
            'info': response,
            'id': data['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_id': market['symbol_id'],
            'order_id': id,
        };
        const response = await this.privatePostApiV1OrderDetail (this.extend (request, params));
        const response_dict = this.safeValue (response, 'data', {});
        return this.parseOrder (response_dict, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_id': market['symbol_id'],
            'statuses': params['status'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostApiV1OrderHistory2 (this.extend (request, params));
        const data = this.safeValue (this.safeValue (response, 'data', {}), 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'statuses': '2',
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'statuses': '3',
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol_id': market['symbol_id'],
            'order_id': id,
        };
        let response = await this.privatePostApiV1OrderCancel (this.extend (request, params));
        response = this.safeValue (response, 'data');
        if (response === undefined) {
            throw new OrderNotFound (this.id + ' cancelOrder() error ' + this.last_http_response);
        }
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostApiV1OrderDetail2 (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = undefined;
        const coinRes = this.publicGetCoinAll ();
        const coinList = this.safeValue (coinRes, 'data', []);
        const coinDict = {};
        const coinIdToCoinCode = {};
        for (let i = 0; i < coinList.length; i++) {
            coinDict[this.safeString (coinList[i], 'code', '')] = this.safeInteger (coinList[i], 'coin_id', 0);
            coinIdToCoinCode[this.safeInteger (coinList[i], 'coin_id', 0)] = this.safeString (coinList[i], 'code', '');
        }
        const request = {};
        let coinId = undefined;
        if (code !== undefined) {
            coinId = coinDict[code];
            request['coin_id'] = coinId;
        }
        const response = await this.privatePostApiV1CoinPrepayHistory (this.extend (request, params));
        return this.parseTransactions (response['data']['list'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = undefined;
        const coinRes = this.publicGetCoinAll ();
        const coinList = this.safeValue (coinRes, 'data', []);
        const coinDict = {};
        const coinIdToCoinCode = {};
        for (let i = 0; i < coinList.length; i++) {
            coinDict[this.safeString (coinList[i], 'code', '')] = this.safeInteger (coinList[i], 'coin_id', 0);
            coinIdToCoinCode[this.safeInteger (coinList[i], 'coin_id', 0)] = this.safeString (coinList[i], 'code', '');
        }
        const request = {};
        let coinId = undefined;
        if (code !== undefined) {
            coinId = coinDict[code];
            request['coin_id'] = coinId;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privatePostApiV1CoinWithdrawHistory (this.extend (request, params));
        return this.parseTransactions (response['data']['list'], currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        const statuses = {
            'deposit': {
                '1': 'pending',
                '2': 'entering',
                '3': 'ok',
                '4': 'failed',
            },
            'withdrawal': {
                '1': 'pending',
                '2': 'entering',
                '3': 'ok',
                '4': 'failed',
                '5': 'not approved',
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        const prepayId = this.safeString (transaction, 'prepay_id');
        const withdrawId = this.safeString (transaction, 'withdraw_id');
        const id = prepayId !== undefined ? prepayId : withdrawId;
        const address = this.safeString (transaction, 'addr');
        let tag = this.safeString (transaction, 'tag');
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const txid = this.safeValue (transaction, 'tx_id');
        const currencyId = this.safeString (transaction, 'coin_id');
        const coinRes = this.publicGetCoinAll ();
        const coinList = this.safeValue (coinRes, 'data', []);
        const coinDict = {};
        for (let i = 0; i < coinList.length; i++) {
            coinDict[this.safeString (coinList[i], 'code', '')] = this.safeInteger (coinList[i], 'coin_id', 0);
        }
        const code = coinDict[currencyId];
        let timestamp = undefined;
        let insertTime = undefined;
        let applyTime = undefined;
        if (prepayId !== undefined) {
            insertTime = this.safeInteger (transaction, 'arrive_time');
        }
        if (withdrawId !== undefined) {
            applyTime = this.safeInteger (transaction, 'arrive_time');
        }
        let type = this.safeString (transaction, 'type');
        if (type === undefined) {
            if ((insertTime !== undefined) && (applyTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            } else if ((insertTime === undefined) && (applyTime !== undefined)) {
                type = 'withdrawal';
                timestamp = applyTime;
            }
        }
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeFloat (transaction, 'volume');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': undefined,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const coinRes = this.publicGetCoinAll ();
        const coinList = this.safeValue (coinRes, 'data', []);
        const coinDict = {};
        for (let i = 0; i < coinList.length; i++) {
            coinDict[this.safeString (coinList[i], 'code', '')] = this.safeInteger (coinList[i], 'coin_id', 0);
        }
        let request = {};
        if (code !== undefined) {
            const coinId = this.safeInteger (coinDict, code, 0);
            request = {
                'coin_id': coinId,
            };
        }
        const response = await this.privatePostApiV1CoinPrepayAddr (this.extend (request, params));
        const success = this.safeValue (response, 'ok');
        if ((success === undefined) || !success) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress returned an empty response – create the deposit address in the user settings first.');
        }
        const address = this.safeString (this.safeValue (response, 'data', {}), 'addr');
        const tag = this.safeString (this.safeValue (response, 'data', {}), 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const coinRes = this.publicGetCoinAll ();
        const coinList = this.safeValue (coinRes, 'data', []);
        const coinDict = {};
        for (let i = 0; i < coinList.length; i++) {
            coinDict[this.safeString (coinList[i], 'code', '')] = this.safeInteger (coinList[i], 'coin_id', 0);
        }
        const request = {
            'coin_id': this.safeInteger (coinDict, code, 0),
            'addr': address,
            'volume': parseFloat (amount),
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const response = await this.privatePostApiV1CoinWithdrawNew (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'withdraw_id'),
        };
    }

    async signIn (params = {}) {
        const ip = this.safeValue (params, 'bind_ip', '0.0.0.0');
        let date = new this.Date ();
        date = this.gmt (date);
        const contentMd5 = '';
        const contentType = 'application/json';
        const canonicalizedHeaders = '';
        const strToTokenSign = ['POST', contentMd5, contentType, date, canonicalizedHeaders].join ('\n') + '/api/v1/token/new/';
        const signature = this.hmac (this.encode (this.secret), this.encode (strToTokenSign), 'sha1', 'base64');
        const authToken = this.apiKey + ':' + signature;
        const tokenHeader = {
            'Content-Sha1': contentMd5,
            'Date': date,
            'Content-Type': contentType,
            'X-Real-IP-Proxy': ip,
            'Auth': authToken,
        };
        const res = this.fetch ('https://openapi.dragonex.co/api/v1/token/new/', 'POST', tokenHeader);
        const token = this.safeString (this.safeValue (res, 'data', {}), 'token', '');
        this.options['accessToken'] = token;
        this.options['date'] = date;
        return {};
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (query !== undefined) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'][api] + request;
        if (api === 'private') {
            body = JSON.stringify ({});
            this.checkRequiredCredentials ();
            if (method !== 'GET') {
                if (query !== undefined) {
                    body = this.json (query);
                }
            }
            const contentMd5 = '';
            const contentType = 'application/json';
            const canonicalizedHeaders = '';
            const ip = this.safeValue (params, 'bind_ip', '0.0.0.0');
            const date = this.gmt (this.milliseconds ());
            const strToTokenSign = ['POST', contentMd5, contentType, date, canonicalizedHeaders].join ('\n') + '/api/v1/token/new/';
            let signature = this.hmac (this.encode (this.secret), this.encode (strToTokenSign), 'sha1', 'base64');
            const authToken = this.apiKey + ':' + signature;
            const tokenHeader = {
                'Content-Sha1': contentMd5,
                'Date': date,
                'Content-Type': contentType,
                'X-Real-IP-Proxy': ip,
                'Auth': authToken,
            };
            const res = this.fetch ('https://openapi.dragonex.co/api/v1/token/new/', 'POST', tokenHeader);
            const token = this.safeString (this.safeValue (res, 'data', {}), 'token', '');
            let strToSign = [method.upper (), contentMd5, contentType, date, canonicalizedHeaders].join ('\n');
            strToSign += request;
            signature = this.hmac (this.encode (this.secret), this.encode (strToSign), 'sha1', 'base64');
            const auth = this.apiKey + ':' + signature;
            headers = {
                'Content-Sha1': contentMd5,
                'Date': date,
                'Content-Type': contentType,
                'X-Real-IP-Proxy': ip,
                'Auth': auth,
                'token': token,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            if (response['code'] !== 1) {
                throw new ExchangeError (this.id + ' ' + JSON.parse (response));
            }
        }
    }
};

