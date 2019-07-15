'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, DDoSProtection, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okcoinusd extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoinusd',
            'name': 'OKCoin USD',
            'countries': [ 'CN', 'US' ],
            'version': 'v1',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTickers': true,
                'withdraw': true,
                'futures': false,
            },
            'extension': '.do', // appended to endpoint URL
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'api': {
                'web': {
                    'get': [
                        'futures/pc/market/marketOverview',
                        'spot/markets/index-tickers',
                        'spot/markets/currencies',
                        'spot/markets/products',
                        'spot/markets/tickers',
                        'spot/user-level',
                    ],
                    'post': [
                        'futures/pc/market/futuresCoin',
                    ],
                },
                'public': {
                    'get': [
                        'depth',
                        'exchange_rate',
                        'future_depth',
                        'future_estimated_price',
                        'future_hold_amount',
                        'future_index',
                        'future_kline',
                        'future_price_limit',
                        'future_ticker',
                        'future_trades',
                        'kline',
                        'otcs',
                        'ticker',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'account_records',
                        'batch_trade',
                        'borrow_money',
                        'borrow_order_info',
                        'borrows_info',
                        'cancel_borrow',
                        'cancel_order',
                        'cancel_otc_order',
                        'cancel_withdraw',
                        'funds_transfer',
                        'future_batch_trade',
                        'future_cancel',
                        'future_devolve',
                        'future_explosive',
                        'future_order_info',
                        'future_orders_info',
                        'future_position',
                        'future_position_4fix',
                        'future_trade',
                        'future_trades_history',
                        'future_userinfo',
                        'future_userinfo_4fix',
                        'lend_depth',
                        'order_fee',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'otc_order_history',
                        'otc_order_info',
                        'repayment',
                        'submit_otc_order',
                        'trade',
                        'trade_history',
                        'trade_otc_order',
                        'wallet_info',
                        'withdraw',
                        'withdraw_info',
                        'unrepayments_info',
                        'userinfo',
                    ],
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': {
                    'web': 'https://www.okcoin.com/v2',
                    'public': 'https://www.okcoin.com/api',
                    'private': 'https://www.okcoin.com',
                },
                'www': 'https://www.okcoin.com',
                'doc': [
                    'https://www.okcoin.com/docs/en/',
                    'https://www.npmjs.com/package/okcoin.com',
                ],
                'referral': 'https://www.okcoin.com/account/register?flag=activity&channelId=600001513',
            },
            // these are okcoin.com fees, okex fees are in okex.js
            'fees': {
                'trading': {
                    'taker': 0.001,
                    'maker': 0.0005,
                },
            },
            'exceptions': {
                // see https://github.com/okcoin-okex/API-docs-OKEx.com/blob/master/API-For-Spot-EN/Error%20Code%20For%20Spot.md
                '10000': ExchangeError, // "Required field, can not be null"
                '10001': DDoSProtection, // "Request frequency too high to exceed the limit allowed"
                '10005': AuthenticationError, // "'SecretKey' does not exist"
                '10006': AuthenticationError, // "'Api_key' does not exist"
                '10007': AuthenticationError, // "Signature does not match"
                '1002': InsufficientFunds, // "The transaction amount exceed the balance"
                '1003': InvalidOrder, // "The transaction amount is less than the minimum requirement"
                '1004': InvalidOrder, // "The transaction amount is less than 0"
                '1013': InvalidOrder, // no contract type (PR-1101)
                '1027': InvalidOrder, // createLimitBuyOrder(symbol, 0, 0): Incorrect parameter may exceeded limits
                '1050': InvalidOrder, // returned when trying to cancel an order that was filled or canceled previously
                '1217': InvalidOrder, // "Order was sent at ±5% of the current market price. Please resend"
                '10014': InvalidOrder, // "Order price must be between 0 and 1,000,000"
                '1009': OrderNotFound, // for spot markets, cancelling closed order
                '1019': OrderNotFound, // order closed? ("Undo order failed")
                '1051': OrderNotFound, // for spot markets, cancelling "just closed" order
                '10009': OrderNotFound, // for spot markets, "Order does not exist"
                '20015': OrderNotFound, // for future markets
                '10008': BadRequest, // Illegal URL parameter
                // todo: sort out below
                // 10000 Required parameter is empty
                // 10001 Request frequency too high to exceed the limit allowed
                // 10002 Authentication failure
                // 10002 System error
                // 10003 This connection has requested other user data
                // 10004 Request failed
                // 10005 api_key or sign is invalid, 'SecretKey' does not exist
                // 10006 'Api_key' does not exist
                // 10007 Signature does not match
                // 10008 Illegal parameter, Parameter erorr
                // 10009 Order does not exist
                // 10010 Insufficient funds
                // 10011 Amount too low
                // 10012 Only btc_usd ltc_usd supported
                // 10013 Only support https request
                // 10014 Order price must be between 0 and 1,000,000
                // 10015 Order price differs from current market price too much / Channel subscription temporally not available
                // 10016 Insufficient coins balance
                // 10017 API authorization error / WebSocket authorization error
                // 10018 borrow amount less than lower limit [usd:100,btc:0.1,ltc:1]
                // 10019 loan agreement not checked
                // 1002 The transaction amount exceed the balance
                // 10020 rate cannot exceed 1%
                // 10021 rate cannot less than 0.01%
                // 10023 fail to get latest ticker
                // 10024 balance not sufficient
                // 10025 quota is full, cannot borrow temporarily
                // 10026 Loan (including reserved loan) and margin cannot be withdrawn
                // 10027 Cannot withdraw within 24 hrs of authentication information modification
                // 10028 Withdrawal amount exceeds daily limit
                // 10029 Account has unpaid loan, please cancel/pay off the loan before withdraw
                // 1003 The transaction amount is less than the minimum requirement
                // 10031 Deposits can only be withdrawn after 6 confirmations
                // 10032 Please enabled phone/google authenticator
                // 10033 Fee higher than maximum network transaction fee
                // 10034 Fee lower than minimum network transaction fee
                // 10035 Insufficient BTC/LTC
                // 10036 Withdrawal amount too low
                // 10037 Trade password not set
                // 1004 The transaction amount is less than 0
                // 10040 Withdrawal cancellation fails
                // 10041 Withdrawal address not exsit or approved
                // 10042 Admin password error
                // 10043 Account equity error, withdrawal failure
                // 10044 fail to cancel borrowing order
                // 10047 this function is disabled for sub-account
                // 10048 withdrawal information does not exist
                // 10049 User can not have more than 50 unfilled small orders (amount<0.15BTC)
                // 10050 can't cancel more than once
                // 10051 order completed transaction
                // 10052 not allowed to withdraw
                // 10064 after a USD deposit, that portion of assets will not be withdrawable for the next 48 hours
                // 1007 No trading market information
                // 1008 No latest market information
                // 1009 No order
                // 1010 Different user of the cancelled order and the original order
                // 10100 User account frozen
                // 10101 order type is wrong
                // 10102 incorrect ID
                // 10103 the private otc order's key incorrect
                // 10106 API key domain not matched
                // 1011 No documented user
                // 1013 No order type
                // 1014 No login
                // 1015 No market depth information
                // 1017 Date error
                // 1018 Order failed
                // 1019 Undo order failed
                // 10216 Non-available API / non-public API
                // 1024 Currency does not exist
                // 1025 No chart type
                // 1026 No base currency quantity
                // 1027 Incorrect parameter may exceeded limits
                // 1028 Reserved decimal failed
                // 1029 Preparing
                // 1030 Account has margin and futures, transactions can not be processed
                // 1031 Insufficient Transferring Balance
                // 1032 Transferring Not Allowed
                // 1035 Password incorrect
                // 1036 Google Verification code Invalid
                // 1037 Google Verification code incorrect
                // 1038 Google Verification replicated
                // 1039 Message Verification Input exceed the limit
                // 1040 Message Verification invalid
                // 1041 Message Verification incorrect
                // 1042 Wrong Google Verification Input exceed the limit
                // 1043 Login password cannot be same as the trading password
                // 1044 Old password incorrect
                // 1045 2nd Verification Needed
                // 1046 Please input old password
                // 1048 Account Blocked
                // 1050 Orders have been withdrawn or withdrawn
                // 1051 Order completed
                // 1201 Account Deleted at 00: 00
                // 1202 Account Not Exist
                // 1203 Insufficient Balance
                // 1204 Invalid currency
                // 1205 Invalid Account
                // 1206 Cash Withdrawal Blocked
                // 1207 Transfer Not Support
                // 1208 No designated account
                // 1209 Invalid api
                // 1216 Market order temporarily suspended. Please send limit order
                // 1217 Order was sent at ±5% of the current market price. Please resend
                // 1218 Place order failed. Please try again later
                // 20001 User does not exist
                // 20002 Account frozen
                // 20003 Account frozen due to forced liquidation
                // 20004 Contract account frozen
                // 20005 User contract account does not exist
                // 20006 Required field missing
                // 20007 Illegal parameter
                // 20008 Contract account balance is too low
                // 20009 Contract status error
                // 20010 Risk rate ratio does not exist
                // 20011 Risk rate lower than 90%/80% before opening BTC position with 10x/20x leverage. or risk rate lower than 80%/60% before opening LTC position with 10x/20x leverage
                // 20012 Risk rate lower than 90%/80% after opening BTC position with 10x/20x leverage. or risk rate lower than 80%/60% after opening LTC position with 10x/20x leverage
                // 20013 Temporally no counter party price
                // 20014 System error
                // 20015 Order does not exist
                // 20016 Close amount bigger than your open positions, liquidation quantity bigger than holding
                // 20017 Not authorized/illegal operation/illegal order ID
                // 20018 Order price cannot be more than 103-105% or less than 95-97% of the previous minute price
                // 20019 IP restricted from accessing the resource
                // 20020 Secret key does not exist
                // 20021 Index information does not exist
                // 20022 Wrong API interface (Cross margin mode shall call cross margin API, fixed margin mode shall call fixed margin API)
                // 20023 Account in fixed-margin mode
                // 20024 Signature does not match
                // 20025 Leverage rate error
                // 20026 API Permission Error
                // 20027 no transaction record
                // 20028 no such contract
                // 20029 Amount is large than available funds
                // 20030 Account still has debts
                // 20038 Due to regulation, this function is not availavle in the country/region your currently reside in.
                // 20049 Request frequency too high
                // 20100 request time out
                // 20101 the format of data is error
                // 20102 invalid login
                // 20103 event type error
                // 20104 subscription type error
                // 20107 JSON format error
                // 20115 The quote is not match
                // 20116 Param not match
                // 21020 Contracts are being delivered, orders cannot be placed
                // 21021 Contracts are being settled, contracts cannot be placed
            },
            'options': {
                'marketBuyPrice': false,
                'fetchOHLCVWarning': true,
                'contractTypes': {
                    '1': 'this_week',
                    '2': 'next_week',
                    '4': 'quarter',
                },
                'fetchTickersMethod': 'fetch_tickers_from_api',
            },
        });
    }

    async fetchMarkets (params = {}) {
        // TODO: they have a new fee schedule as of Feb 7
        // the new fees are progressive and depend on 30-day traded volume
        // the following is the worst case
        const result = [];
        const spotResponse = await this.webGetSpotMarketsProducts ();
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "baseCurrency":0,
        //                 "brokerId":0,
        //                 "callAuctionOrCallNoCancelAuction":false,
        //                 "callNoCancelSwitchTime":{},
        //                 "collect":"0",
        //                 "continuousSwitchTime":{},
        //                 "groupId":1,
        //                 "isMarginOpen":true,
        //                 "listDisplay":0,
        //                 "marginRiskPreRatio":1.2,
        //                 "marginRiskRatio":1.1,
        //                 "marketFrom":118,
        //                 "maxMarginLeverage":5,
        //                 "maxPriceDigit":1,
        //                 "maxSizeDigit":8,
        //                 "mergeTypes":"0.1,1,10",
        //                 "minTradeSize":0.00100000,
        //                 "online":1,
        //                 "productId":20,
        //                 "quoteCurrency":7,
        //                 "quoteIncrement":"0.1",
        //                 "quotePrecision":2,
        //                 "sort":30038,
        //                 "symbol":"btc_usdt",
        //                 "tradingMode":3
        //             },
        //         ]
        //     }
        //
        const spotMarkets = this.safeValue (spotResponse, 'data', []);
        let markets = spotMarkets;
        if (this.has['futures']) {
            const futuresResponse = await this.webPostFuturesPcMarketFuturesCoin ();
            //
            //     {
            //         "msg":"success",
            //         "code":0,
            //         "detailMsg":"",
            //         "data": [
            //             {
            //                 "symbolId":0,
            //                 "symbol":"f_usd_btc",
            //                 "iceSingleAvgMinAmount":2,
            //                 "minTradeSize":1,
            //                 "iceSingleAvgMaxAmount":500,
            //                 "contractDepthLevel":["0.01","0.2"],
            //                 "dealAllMaxAmount":999,
            //                 "maxSizeDigit":4,
            //                 "contracts":[
            //                     { "marketFrom":34, "id":201905240000034, "type":1, "desc":"BTC0524" },
            //                     { "marketFrom":13, "id":201905310000013, "type":2, "desc":"BTC0531" },
            //                     { "marketFrom":12, "id":201906280000012, "type":4, "desc":"BTC0628" },
            //                 ],
            //                 "maxPriceDigit":2,
            //                 "nativeRate":1,
            //                 "quote":"usd",
            //                 "nativeCurrency":"usd",
            //                 "nativeCurrencyMark":"$",
            //                 "contractSymbol":0,
            //                 "unitAmount":100.00,
            //                 "symbolMark":"฿",
            //                 "symbolDesc":"BTC"
            //             },
            //         ]
            //     }
            //
            const futuresMarkets = this.safeValue (futuresResponse, 'data', []);
            markets = this.arrayConcat (spotMarkets, futuresMarkets);
        }
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            let symbol = undefined;
            let base = undefined;
            let quote = undefined;
            let baseId = undefined;
            let quoteId = undefined;
            let baseNumericId = undefined;
            let quoteNumericId = undefined;
            let lowercaseId = undefined;
            let uppercaseBaseId = undefined;
            const precision = {
                'amount': this.safeInteger (market, 'maxSizeDigit'),
                'price': this.safeInteger (market, 'maxPriceDigit'),
            };
            const minAmount = this.safeFloat (market, 'minTradeSize');
            const minPrice = Math.pow (10, -precision['price']);
            let contracts = this.safeValue (market, 'contracts');
            if (contracts === undefined) {
                // spot markets
                lowercaseId = id;
                const parts = id.split ('_');
                baseId = parts[0];
                quoteId = parts[1];
                baseNumericId = this.safeInteger (market, 'baseCurrency');
                quoteNumericId = this.safeInteger (market, 'quoteCurrency');
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                contracts = [{}];
            } else {
                // futures markets
                quoteId = this.safeString (market, 'quote');
                uppercaseBaseId = this.safeString (market, 'symbolDesc');
                baseId = uppercaseBaseId.toLowerCase ();
                lowercaseId = baseId + '_' + quoteId;
                base = this.safeCurrencyCode (uppercaseBaseId);
                quote = this.safeCurrencyCode (quoteId);
            }
            for (let k = 0; k < contracts.length; k++) {
                const contract = contracts[k];
                let type = this.safeString (contract, 'type', 'spot');
                let contractType = undefined;
                let spot = true;
                let future = false;
                let active = true;
                if (type === 'spot') {
                    symbol = base + '/' + quote;
                    active = market['online'] !== 0;
                } else {
                    const contractId = this.safeString (contract, 'id');
                    symbol = base + '-' + quote + '-' + contractId.slice (2, 8);
                    contractType = this.safeString (this.options['contractTypes'], type);
                    type = 'future';
                    spot = false;
                    future = true;
                }
                const fees = this.safeValue2 (this.fees, type, 'trading', {});
                result.push (this.extend (fees, {
                    'id': id,
                    'lowercaseId': lowercaseId,
                    'contractType': contractType,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'baseNumericId': baseNumericId,
                    'quoteNumericId': quoteNumericId,
                    'info': market,
                    'type': type,
                    'spot': spot,
                    'future': future,
                    'active': active,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': minAmount,
                            'max': undefined,
                        },
                        'price': {
                            'min': minPrice,
                            'max': undefined,
                        },
                        'cost': {
                            'min': minAmount * minPrice,
                            'max': undefined,
                        },
                    },
                }));
            }
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async fetchTickersFromApi (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.publicGetTickers (this.extend (request, params));
        const tickers = response['tickers'];
        let timestamp = this.safeInteger (response, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            ticker = this.parseTicker (this.extend (tickers[i], { 'timestamp': timestamp }));
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTickersFromWeb (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.webGetSpotMarketsTickers (this.extend (request, params));
        const tickers = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const method = this.options['fetchTickersMethod'];
        return await this[method] (symbols, params);
    }

    async fetchOrderBook (symbol = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'publicGetFutureDepth' : 'publicGetDepth';
        const request = this.createRequest (market, params);
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this[method] (request);
        return this.parseOrderBook (response);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {              buy:   "48.777300",
        //                 change:   "-1.244500",
        //       changePercentage:   "-2.47%",
        //                  close:   "49.064000",
        //            createdDate:    1531704852254,
        //             currencyId:    527,
        //                dayHigh:   "51.012500",
        //                 dayLow:   "48.124200",
        //                   high:   "51.012500",
        //                inflows:   "0",
        //                   last:   "49.064000",
        //                    low:   "48.124200",
        //             marketFrom:    627,
        //                   name: {  },
        //                   open:   "50.308500",
        //               outflows:   "0",
        //              productId:    527,
        //                   sell:   "49.064000",
        //                 symbol:   "zec_okb",
        //                 volume:   "1049.092535"   }
        //
        const timestamp = this.safeInteger2 (ticker, 'timestamp', 'createdDate');
        let symbol = undefined;
        if (market === undefined) {
            if ('symbol' in ticker) {
                const marketId = ticker['symbol'];
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                } else {
                    const [ baseId, quoteId ] = ticker['symbol'].split ('_');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open');
        const change = this.safeFloat (ticker, 'change');
        const percentage = this.safeFloat (ticker, 'changePercentage');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat2 (ticker, 'vol', 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'publicGetFutureTicker' : 'publicGetTicker';
        const request = this.createRequest (market, params);
        const response = await this[method] (request);
        let ticker = this.safeValue (response, 'ticker');
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' fetchTicker returned an empty response: ' + this.json (response));
        }
        let timestamp = this.safeInteger (response, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
            ticker = this.extend (ticker, { 'timestamp': timestamp });
        }
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (trade, 'date_ms');
        const id = this.safeString (trade, 'tid');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'publicGetFutureTrades' : 'publicGetTrades';
        const request = this.createRequest (market, params);
        const response = await this[method] (request);
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const numElements = ohlcv.length;
        const volumeIndex = (numElements > 6) ? 6 : 5;
        return [
            ohlcv[0], // timestamp
            parseFloat (ohlcv[1]), // Open
            parseFloat (ohlcv[2]), // High
            parseFloat (ohlcv[3]), // Low
            parseFloat (ohlcv[4]), // Close
            // parseFloat (ohlcv[5]), // quote volume
            // parseFloat (ohlcv[6]), // base volume
            parseFloat (ohlcv[volumeIndex]), // okex will return base volume in the 7th element for future markets
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'publicGetFutureKline' : 'publicGetKline';
        const request = this.createRequest (market, {
            'type': this.timeframes[timeframe],
            // 'since': since === undefined ? this.milliseconds () - 86400000 : since,  // default last 24h
        });
        if (since !== undefined) {
            request['since'] = parseInt ((this.milliseconds () - 86400000) / 1000); // default last 24h
        }
        if (limit !== undefined) {
            if (this.options['fetchOHLCVWarning']) {
                throw new ExchangeError (this.id + ' fetchOHLCV counts "limit" candles backwards in chronological ascending order, therefore the "limit" argument for ' + this.id + ' is disabled. Set ' + this.id + '.options["fetchOHLCVWarning"] = false to suppress this warning message.');
            }
            request['size'] = parseInt (limit); // max is 1440 candles
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostUserinfo (params);
        const info = this.safeValue (response, 'info', {});
        const balances = this.safeValue (info, 'funds', {});
        const result = { 'info': response };
        let ids = Object.keys (balances['free']);
        let usedField = 'freezed';
        // wtf, okex?
        // https://github.com/okcoin-okex/API-docs-OKEx.com/commit/01cf9dd57b1f984a8737ef76a037d4d3795d2ac7
        if (!(usedField in balances)) {
            usedField = 'holds';
        }
        const usedKeys = Object.keys (balances[usedField]);
        ids = this.arrayConcat (ids, usedKeys);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeFloat (balances['free'], id);
            account['used'] = this.safeFloat (balances[usedField], id);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'privatePostFutureTrade' : 'privatePostTrade';
        const orderSide = (type === 'market') ? (side + '_market') : side;
        const isMarketBuy = ((market['spot']) && (type === 'market') && (side === 'buy') && (!this.options['marketBuyPrice']));
        const orderPrice = isMarketBuy ? this.safeFloat (params, 'cost') : price;
        const request = this.createRequest (market, {
            'type': orderSide,
        });
        if (market['future']) {
            request['match_price'] = 0; // match best counter party price? 0 or 1, ignores price if 1
            request['lever_rate'] = 10; // leverage rate value: 10 or 20 (10 by default)
        } else if (type === 'market') {
            if (side === 'buy') {
                if (!orderPrice) {
                    if (this.options['marketBuyPrice']) {
                        // eslint-disable-next-line quotes
                        throw new ExchangeError (this.id + " market buy orders require a price argument (the amount you want to spend or the cost of the order) when this.options['marketBuyPrice'] is true.");
                    } else {
                        // eslint-disable-next-line quotes
                        throw new ExchangeError (this.id + " market buy orders require an additional cost parameter, cost = price * amount. If you want to pass the cost of the market order (the amount you want to spend) in the price argument (the default " + this.id + " behaviour), set this.options['marketBuyPrice'] = true. It will effectively suppress this warning exception as well.");
                    }
                } else {
                    request['price'] = orderPrice;
                }
            } else {
                request['amount'] = amount;
            }
        }
        if (type !== 'market') {
            request['price'] = orderPrice;
            request['amount'] = amount;
        }
        params = this.omit (params, 'cost');
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': this.safeString (response, 'order_id'),
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

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'privatePostFutureCancel' : 'privatePostCancelOrder';
        const request = this.createRequest (market, {
            'order_id': id,
        });
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeValue (statuses, status, status);
    }

    parseOrderSide (side) {
        if (side === 1) {
            return 'buy'; // open long position
        } else if (side === 2) {
            return 'sell'; // open short position
        } else if (side === 3) {
            return 'sell'; // liquidate long position
        } else if (side === 4) {
            return 'buy'; // liquidate short position
        }
        return side;
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        let type = undefined;
        if ('type' in order) {
            if ((order['type'] === 'buy') || (order['type'] === 'sell')) {
                side = order['type'];
                type = 'limit';
            } else if (order['type'] === 'buy_market') {
                side = 'buy';
                type = 'market';
            } else if (order['type'] === 'sell_market') {
                side = 'sell';
                type = 'market';
            } else {
                side = this.parseOrderSide (order['type']);
                if (('contract_name' in order) || ('lever_rate' in order)) {
                    type = 'margin';
                }
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market) {
            symbol = market['symbol'];
        }
        const createDateField = this.getCreateDateField ();
        const timestamp = this.safeInteger (order, createDateField);
        let amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'deal_amount');
        amount = Math.max (amount, filled);
        let remaining = Math.max (0, amount - filled);
        if (type === 'market') {
            remaining = 0;
        }
        let average = this.safeFloat (order, 'avg_price');
        // https://github.com/ccxt/ccxt/issues/2452
        average = this.safeFloat (order, 'price_avg', average);
        const cost = average * filled;
        return {
            'info': order,
            'id': this.safeString (order, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    getCreateDateField () {
        // needed for derived exchanges
        // allcoin typo create_data instead of create_date
        return 'create_date';
    }

    getOrdersField () {
        // needed for derived exchanges
        // allcoin typo order instead of orders (expected based on their API docs)
        return 'orders';
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'privatePostFutureOrderInfo' : 'privatePostOrderInfo';
        const request = this.createRequest (market, {
            'order_id': id,
            // 'status': 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page': 1, // current page number
            // 'page_length': 200, // number of orders returned per page, maximum 200
        });
        const response = await this[method] (this.extend (request, params));
        const ordersField = this.getOrdersField ();
        const numOrders = response[ordersField].length;
        if (numOrders > 0) {
            return this.parseOrder (response[ordersField][0]);
        }
        throw new OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = market['future'] ? 'privatePostFutureOrdersInfo' : 'privatePost';
        let request = this.createRequest (market);
        const order_id_in_params = ('order_id' in params);
        if (market['future']) {
            if (!order_id_in_params) {
                throw new ExchangeError (this.id + ' fetchOrders() requires order_id param for futures market ' + symbol + ' (a string of one or more order ids, comma-separated)');
            }
        } else {
            const status = ('type' in params) ? params['type'] : params['status'];
            if (typeof status === 'undefined') {
                const name = order_id_in_params ? 'type' : 'status';
                throw new ExchangeError (this.id + ' fetchOrders() requires ' + name + ' param for spot market ' + symbol + ' (0 - for unfilled orders, 1 - for filled/canceled orders)');
            }
            if (order_id_in_params) {
                method += 'OrdersInfo';
                request = this.extend (request, {
                    'type': status,
                    'order_id': params['order_id'],
                });
            } else {
                method += 'OrderHistory';
                request = this.extend (request, {
                    'status': status,
                    'current_page': 1, // current page number
                    'page_length': 200, // number of orders returned per page, maximum 200
                });
            }
            params = this.omit (params, [ 'type', 'status' ]);
        }
        const response = await this[method] (this.extend (request, params));
        const ordersField = this.getOrdersField ();
        return this.parseOrders (response[ordersField], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 0, // 0 for unfilled orders, 1 for filled orders
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 1, // 0 for unfilled orders, 1 for filled orders
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // if (amount < 0.01)
        //     throw new ExchangeError (this.id + ' withdraw() requires amount > 0.01');
        // for some reason they require to supply a pair of currencies for withdrawing one currency
        const currencyId = currency['id'] + '_usd';
        if (tag) {
            address = address + ':' + tag;
        }
        const request = {
            'symbol': currencyId,
            'withdraw_address': address,
            'withdraw_amount': amount,
            'target': 'address', // or 'okcn', 'okcom', 'okex'
        };
        let query = params;
        if ('chargefee' in query) {
            request['chargefee'] = query['chargefee'];
            query = this.omit (query, 'chargefee');
        } else {
            throw new ExchangeError (this.id + ' withdraw() requires a `chargefee` parameter');
        }
        if (this.password) {
            request['trade_pwd'] = this.password;
        } else if ('password' in query) {
            request['trade_pwd'] = query['password'];
            query = this.omit (query, 'password');
        } else if ('trade_pwd' in query) {
            request['trade_pwd'] = query['trade_pwd'];
            query = this.omit (query, 'trade_pwd');
        }
        const passwordInRequest = ('trade_pwd' in request);
        if (!passwordInRequest) {
            throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a password / trade_pwd parameter');
        }
        const response = await this.privatePostWithdraw (this.extend (request, query));
        return {
            'info': response,
            'id': this.safeString (response, 'withdraw_id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api !== 'web') {
            url += this.version + '/';
        }
        url += path;
        if (api !== 'web') {
            url += this.extension;
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            // secret key must be at the end of query
            const queryString = this.rawencode (query) + '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString)).toUpperCase ();
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    createRequest (market, params = {}) {
        if (market['future']) {
            return this.deepExtend ({
                'symbol': market['lowercaseId'],
                'contract_type': market['contractType'],
            }, params);
        }
        return this.deepExtend ({
            'symbol': market['id'],
        }, params);
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('error_code' in response) {
            const error = this.safeString (response, 'error_code');
            const message = this.id + ' ' + this.json (response);
            if (error in this.exceptions) {
                const ExceptionClass = this.exceptions[error];
                throw new ExceptionClass (message);
            } else {
                throw new ExchangeError (message);
            }
        }
        if ('result' in response) {
            if (!response['result']) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
    }
};
