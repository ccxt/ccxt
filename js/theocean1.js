'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, ArgumentsRequired, BadRequest, AuthenticationError, InvalidOrder, OrderNotFound, NotSupported, OrderNotFillable, InvalidAddress, InsufficientFunds } = require ('./base/errors');

module.exports = class theocean1 extends Exchange {
    describe () {
        this.checkRequiredDependencies ();
        return this.deepExtend (super.describe (), {
            'id': 'theocean1',
            'name': 'The Ocean',
            'countries': [ 'US' ],
            'rateLimit': 3000,
            'version': 'v1',
            'certified': true,
            'requiresWeb3': true,
            'timeframes': {
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '6h': '21600',
                '1d': '86400',
            },
            'has': {
                'CORS': false, // ?
                'fetchTickers': true,
                'fetchOHLCV': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/43103756-d56613ce-8ed7-11e8-924e-68f9d4bcacab.jpg',
                'api': 'https://api.dev.theocean.trade',
                'www': 'https://theocean.trade',
                'doc': 'https://docs.theocean.trade',
                'fees': 'https://theocean.trade/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'fee_components',
                        'token_pairs',
                        'ticker',
                        'tickers',
                        'candlesticks',
                        'candlesticks/intervals',
                        'trade_history',
                        'order_book',
                        'order/{orderHash}',
                        'version',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'available_balance',
                        'order_history',
                        'order/unsigned',
                        'order/unsigned/market',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order/{orderHash}',
                        'order',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'Order not found': OrderNotFound, // {"message":"Order not found","errors":...}
                },
                'broad': {
                    "Price can't exceed 8 digits in precision.": InvalidOrder, // {"message":"Price can't exceed 8 digits in precision.","type":"paramPrice"}
                    'Order cannot be canceled': InvalidOrder, // {"message":"Order cannot be canceled","type":"General error"}
                    'Greater than available wallet balance.': InsufficientFunds,
                    'Fillable amount under minimum': InvalidOrder, // {"message":"Fillable amount under minimum WETH trade size.","type":"paramQuoteTokenAmount"}
                    'Fillable amount over maximum': InvalidOrder, // {"message":"Fillable amount over maximum TUSD trade size.","type":"paramQuoteTokenAmount"}
                    "Schema validation failed for 'params'": BadRequest, // // {"message":"Schema validation failed for 'params'"}
                    'Service Temporarily Unavailable': ExchangeNotAvailable,
                },
            },
            'options': {
                'decimals': {},
                'fetchOrderMethod': 'fetch_order_from_history',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetTokenPairs ();
        //
        //     [
        //       {
        //         "baseToken": {
        //           "address": "0xa8e9fa8f91e5ae138c74648c9c304f1c75003a8d",
        //           "symbol": "ZRX",
        //           "decimals": "18",
        //           "minAmount": "1000000000000000000",
        //           "maxAmount": "100000000000000000000000",
        //           "precision": "18"
        //         },
        //         "quoteToken": {
        //           "address": "0xc00fd9820cd2898cc4c054b7bf142de637ad129a",
        //           "symbol": "WETH",
        //           "decimals": "18",
        //           "minAmount": "5000000000000000",
        //           "maxAmount": "100000000000000000000",
        //           "precision": "18"
        //         }
        //       }
        //     ]
        //
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let baseToken = market['baseToken'];
            let quoteToken = market['quoteToken'];
            let baseId = baseToken['address'];
            let quoteId = quoteToken['address'];
            let base = baseToken['symbol'];
            let quote = quoteToken['symbol'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let id = baseId + '/' + quoteId;
            let baseDecimals = this.safeInteger (baseToken, 'decimals');
            let quoteDecimals = this.safeInteger (quoteToken, 'decimals');
            this.options['decimals'][base] = baseDecimals;
            this.options['decimals'][quote] = quoteDecimals;
            let precision = {
                'amount': -parseInt (baseToken['precision']),
                'price': -parseInt (quoteToken['precision']),
            };
            let amountLimits = {
                'min': this.fromWei (this.safeString (baseToken, 'minAmount'), 'ether', baseDecimals),
                'max': this.fromWei (this.safeString (baseToken, 'maxAmount'), 'ether', baseDecimals),
            };
            let priceLimits = {
                'min': undefined,
                'max': undefined,
            };
            let costLimits = {
                'min': this.fromWei (this.safeString (quoteToken, 'minAmount'), 'ether', quoteDecimals),
                'max': this.fromWei (this.safeString (quoteToken, 'maxAmount'), 'ether', quoteDecimals),
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            let active = true;
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        let baseDecimals = this.safeInteger (this.options['decimals'], market['base'], 18);
        return [
            this.safeInteger (ohlcv, 'startTime') * 1000,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.fromWei (this.safeString (ohlcv, 'baseVolume'), 'ether', baseDecimals),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'baseTokenAddress': market['baseId'],
            'quoteTokenAddress': market['quoteId'],
            'interval': this.timeframes[timeframe],
        };
        if (since === undefined) {
            throw new ExchangeError (this.id + ' fetchOHLCV requires a since argument');
        }
        since = parseInt (since);
        request['startTime'] = since;
        let response = await this.publicGetCandlesticks (this.extend (request, params));
        //
        //   [
        //     {
        //         "high": "100.52",
        //         "low": "97.23",
        //         "open": "98.45",
        //         "close": "99.23",
        //         "baseVolume": "2400000000000000000000",
        //         "quoteVolume": "1200000000000000000000",
        //         "startTime": "1512929323784"
        //     },
        //     {
        //         "high": "100.52",
        //         "low": "97.23",
        //         "open": "98.45",
        //         "close": "99.23",
        //         "volume": "2400000000000000000000",
        //         "startTime": "1512929198980"
        //     }
        //   ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalanceByCode (code, params = {}) {
        if (!this.walletAddress || (this.walletAddress.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (this.id + ' fetchBalanceByCode() requires the .walletAddress to be a "0x"-prefixed hexstring like "0xbF2d65B3b2907214EEA3562f21B80f6Ed7220377"');
        }
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'walletAddress': this.walletAddress.toLowerCase (),
            'tokenAddress': currency['id'],
        };
        let response = await this.privateGetBalance (this.extend (request, params));
        //
        //     {"available":"0","committed":"0","total":"0"}
        //
        let decimals = this.safeInteger (this.options['decimals'], code, 18);
        let free = this.fromWei (this.safeString (response, 'available'), 'ether', decimals);
        let used = this.fromWei (this.safeString (response, 'committed'), 'ether', decimals);
        let total = this.fromWei (this.safeString (response, 'total'), 'ether', decimals);
        return {
            'free': free,
            'used': used,
            'total': total,
        };
    }

    async fetchBalance (params = {}) {
        if (!this.walletAddress || (this.walletAddress.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (this.id + ' fetchBalance() requires the .walletAddress to be a "0x"-prefixed hexstring like "0xbF2d65B3b2907214EEA3562f21B80f6Ed7220377"');
        }
        let codes = this.safeValue (this.options, 'fetchBalanceCurrencies');
        if (codes === undefined)
            codes = this.safeValue (params, 'codes');
        if ((codes === undefined) || (!Array.isArray (codes))) {
            throw new ExchangeError (this.id + ' fetchBalance() requires a `codes` parameter (an array of currency codes)');
        }
        await this.loadMarkets ();
        let result = {};
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            result[code] = await this.fetchBalanceByCode (code);
        }
        return this.parseBalance (result);
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1, market = undefined) {
        if (market === undefined) {
            throw new ArgumentsRequired (this.id + ' parseBidAsk requires a market argument');
        }
        let price = parseFloat (bidask[priceKey]);
        let amountDecimals = this.safeInteger (this.options['decimals'], market['base'], 18);
        let amount = this.fromWei (bidask[amountKey], 'ether', amountDecimals);
        return [ price, amount ];
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        let result = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        let sides = [ bidsKey, asksKey ];
        for (let i = 0; i < sides.length; i++) {
            let side = sides[i];
            let orders = [];
            let bidasks = this.safeValue (orderbook, side);
            for (let k = 0; k < bidasks.length; k++) {
                orders.push (this.parseBidAsk (bidasks[k], priceKey, amountKey, market));
            }
            result[side] = orders;
        }
        result[bidsKey] = this.sortBy (result[bidsKey], 0, true);
        result[asksKey] = this.sortBy (result[asksKey], 0);
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'baseTokenAddress': market['baseId'],
            'quoteTokenAddress': market['quoteId'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        let response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {
        //       "bids": [
        //         {
        //           "orderHash": "0x94629386298dee69ae63cd3e414336ae153b3f02cffb9ffc53ad71e166615618",
        //           "price": "0.00050915",
        //           "availableAmount": "100000000000000000000",
        //           "creationTimestamp": "1512929327792",
        //           "expirationTimestampInSec": "1534449466"
        //         }
        //       ],
        //       "asks": [
        //         {
        //           "orderHash": "0x94629386298dee69ae63cd3e414336ae153b3f02cffb9ffc53ad71e166615618",
        //           "price": "0.00054134",
        //           "availableAmount": "100000000000000000000",
        //           "creationTimestamp": "1512929323784",
        //           "expirationTimestampInSec": "1534449466"
        //         }
        //       ]
        //     }
        //
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'availableAmount', market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "bid": "0.00050915",
        //         "ask": "0.00054134",
        //         "last": "0.00052718",
        //         "volume": "3000000000000000000",
        //         "timestamp": "1512929327792"
        //     }
        //
        let timestamp = parseInt (this.safeFloat (ticker, 'timestamp') / 1000);
        let symbol = undefined;
        let base = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
        }
        let baseDecimals = this.safeInteger (this.options['decimals'], base, 18);
        let baseVolume = this.fromWei (this.safeString (ticker, 'volume'), 'ether', baseDecimals);
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'priceChange'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        //
        //     [{
        //     "baseTokenAddress": "0xa8e9fa8f91e5ae138c74648c9c304f1c75003a8d",
        //     "quoteTokenAddress": "0xc00fd9820cd2898cc4c054b7bf142de637ad129a",
        //     "ticker": {
        //         "bid": "0.00050915",
        //         "ask": "0.00054134",
        //         "last": "0.00052718",
        //         "volume": "3000000000000000000",
        //         "timestamp": "1512929327792"
        //     }
        //     }]
        //
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let baseId = this.safeString (ticker, 'baseTokenAddress');
            let quoteId = this.safeString (ticker, 'quoteTokenAddress');
            let marketId = baseId + '/' + quoteId;
            let market = undefined;
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker['ticker'], market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'baseTokenAddress': market['baseId'],
            'quoteTokenAddress': market['quoteId'],
        };
        let response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //
        //     {
        //         "id": "37212",
        //         "transactionHash": "0x5e6e75e1aa681b51b034296f62ac19be7460411a2ad94042dd8ba637e13eac0c",
        //         "amount": "300000000000000000",
        //         "price": "0.00052718",
        // ------- they also have a "confirmed" status here ↓ -----------------
        //         "status": "filled", // filled | settled | failed
        //         "lastUpdated": "1520265048996"
        //     }
        //
        // parseOrder trades (timeline "actions", "fills")
        //
        //     {      action: "confirmed",
        //            amount: "1000000000000000000",
        //          intentID: "MARKET_INTENT:90jjw2s7gj90jjw2s7gkjjw2s7gl",
        //            txHash: "0x043488fdc3f995bf9e632a32424e41ed126de90f8cb340a1ff006c2a74ca8336",
        //       blockNumber: "8094822",
        //         timestamp: "1532261686"                                                          }
        //
        let timestamp = this.safeInteger (trade, 'lastUpdated');
        let price = this.safeFloat (trade, 'price');
        let id = this.safeString (trade, 'id');
        let side = this.safeString (trade, 'side');
        let symbol = undefined;
        let base = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
        }
        let baseDecimals = this.safeInteger (this.options['decimals'], base, 18);
        let amount = this.fromWei (this.safeString (trade, 'amount'), 'ether', baseDecimals);
        let cost = undefined;
        if (amount !== undefined && price !== undefined) {
            cost = amount * price;
        }
        let takerOrMaker = 'taker';
        return {
            'id': id,
            'order': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'baseTokenAddress': market['baseId'],
            'quoteTokenAddress': market['quoteId'],
        };
        let response = await this.publicGetTradeHistory (this.extend (request, params));
        //
        //     [
        //       {
        //         "id": "37212",
        //         "transactionHash": "0x5e6e75e1aa681b51b034296f62ac19be7460411a2ad94042dd8ba637e13eac0c",
        //         "amount": "300000000000000000",
        //         "price": "0.00052718",
        //         "status": "filled", // filled | settled | failed
        //         "lastUpdated": "1520265048996"
        //       }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let errorMessage = this.id + ' createOrder() requires `exchange.walletAddress` and `exchange.privateKey`. The .walletAddress should be a "0x"-prefixed hexstring like "0xbF2d65B3b2907214EEA3562f21B80f6Ed7220377". The .privateKey for that wallet should be a "0x"-prefixed hexstring like "0xe4f40d465efa94c98aec1a51f574329344c772c1bce33be07fa20a56795fdd09".';
        if (!this.walletAddress || (this.walletAddress.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (errorMessage);
        }
        if (!this.privateKey || (this.privateKey.indexOf ('0x') !== 0)) {
            throw new InvalidAddress (errorMessage);
        }
        let orderParams = await this.fetchOrderParamsToSign (symbol, type, side, amount, price, params);
        let unsignedOrder = orderParams['unsignedZeroExOrder'];
        if (unsignedOrder === undefined) {
            throw new OrderNotFillable (this.id + ' ' + type + ' order to ' + side + ' ' + symbol + ' is not fillable at the moment');
        }
        let signedOrder = await this.signZeroExOrderV2 (unsignedOrder, this.privateKey);
        let id = this.safeString (signedOrder, 'orderHash');
        await this.postSignedOrder (signedOrder, orderParams, params);
        let order = await this.fetchOrder (id);
        order['type'] = type;
        return order;
    }

    async fetchOrderParamsToSign (symbol, type, side, amount, price = undefined, params = {}) {
        if (side !== 'buy' && side !== 'sell') {
            throw new ExchangeError (side + ' is not valid side param. Use \'buy\' or \'sell\'');
        }
        if (type !== 'market' && type !== 'limit') {
            throw new ExchangeError (type + ' is not valid type param. Use \'market\' or \'limit\'');
        }
        if (type === 'limit' && price === undefined) {
            throw new ExchangeError ('Price is not provided for limit order');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let baseDecimals = this.safeInteger (this.options['decimals'], market['base'], 18);
        let request = {
            'walletAddress': this.walletAddress.toLowerCase (), // Your Wallet Address
            'baseTokenAddress': market['baseId'], // Base token address
            'quoteTokenAddress': market['quoteId'], // Quote token address
            'side': side, // "buy" or "sell"
            'amount': this.toWei (this.amountToPrecision (symbol, amount), 'ether', baseDecimals), // Base token amount in wei
        };
        let method = undefined;
        if (type === 'limit') {
            method = 'privateGetOrderUnsigned';
            request['price'] = this.priceToPrecision (symbol, price);
        } else if (type === 'market') {
            method = 'privateGetOrderUnsignedMarket';
        } else {
            throw new ExchangeError ('Unsupported order type: ' + type);
        }
        let response = await this[method] (this.extend (request, params));
        return response;
    }

    async postSignedOrder (signedOrder, requestParams, params = {}) {
        let request = requestParams;
        request['signedZeroExOrder'] = signedOrder;
        request = this.omit (request, 'unsignedZeroExOrder');
        let response = await this.privatePostOrder (this.extend (request, params));
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderHash': id,
        };
        let response = await this.privateDeleteOrderOrderHash (this.extend (request, params));
        //
        //     {
        //       "canceledOrder": {
        //         "orderHash": "0x3d6b287c1dc79262d2391ae2ca9d050fdbbab2c8b3180e4a46f9f321a7f1d7a9",
        //         "amount": "100000000000"
        //       }
        //     }
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.extend (this.parseOrder (response['canceledOrder'], market), {
            'status': 'canceled',
        });
    }

    async cancelAllOrders (params = {}) {
        const response = await this.privateDeleteOrder (params);
        //
        //     [{
        //       "canceledOrder": {
        //         "orderHash": "0x3d6b287c1dc79262d2391ae2ca9d050fdbbab2c8b3180e4a46f9f321a7f1d7a9",
        //         "amount": "100000000000"
        //       }
        //     }]
        //
        return response;
    }

    parseOrder (order, market = undefined) {
        let zeroExOrder = this.safeValue (order, 'zeroExOrder');
        let id = this.safeString (order, 'orderHash');
        if ((id === undefined) && (zeroExOrder !== undefined)) {
            id = this.safeString (zeroExOrder, 'orderHash');
        }
        let side = this.safeString (order, 'side');
        let type = this.safeString (order, 'type'); // injected from outside
        let timestamp = this.safeInteger (order, 'creationTimestamp');
        let symbol = undefined;
        let baseId = this.safeString (order, 'baseTokenAddress');
        let quoteId = this.safeString (order, 'quoteTokenAddress');
        let marketId = undefined;
        if (baseId !== undefined && quoteId !== undefined) {
            marketId = baseId + '/' + quoteId;
        }
        market = this.safeValue (this.markets_by_id, marketId, market);
        let base = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
        }
        let baseDecimals = this.safeInteger (this.options['decimals'], base, 18);
        let price = this.safeFloat (order, 'price');
        let filledAmount = this.fromWei (this.safeString (order, 'filledAmount'), 'ether', baseDecimals);
        let settledAmount = this.fromWei (this.safeString (order, 'settledAmount'), 'ether', baseDecimals);
        let confirmedAmount = this.fromWei (this.safeString (order, 'confirmedAmount'), 'ether', baseDecimals);
        let failedAmount = this.fromWei (this.safeString (order, 'failedAmount'), 'ether', baseDecimals);
        let deadAmount = this.fromWei (this.safeString (order, 'deadAmount'), 'ether', baseDecimals);
        let prunedAmount = this.fromWei (this.safeString (order, 'prunedAmount'), 'ether', baseDecimals);
        let amount = this.fromWei (this.safeString (order, 'initialAmount'), 'ether', baseDecimals);
        let filled = this.sum (filledAmount, settledAmount, confirmedAmount);
        let remaining = undefined;
        let lastTradeTimestamp = undefined;
        let timeline = this.safeValue (order, 'timeline');
        let trades = undefined;
        let status = undefined;
        if (timeline !== undefined) {
            let numEvents = timeline.length;
            if (numEvents > 0) {
                let timelineEventsGroupedByAction = this.groupBy (timeline, 'action');
                if ('error' in timelineEventsGroupedByAction) {
                    status = 'failed';
                }
                if ('filled' in timelineEventsGroupedByAction) {
                    let fillEvents = this.safeValue (timelineEventsGroupedByAction, 'filled');
                    let numFillEvents = fillEvents.length;
                    lastTradeTimestamp = this.safeInteger (fillEvents[numFillEvents - 1], 'timestamp');
                    lastTradeTimestamp = (lastTradeTimestamp !== undefined) ? lastTradeTimestamp * 1000 : lastTradeTimestamp;
                    trades = [];
                    for (let i = 0; i < numFillEvents; i++) {
                        let trade = this.parseTrade (this.extend (fillEvents[i], {
                            'price': price,
                        }), market);
                        trades.push (this.extend (trade, {
                            'order': id,
                            'type': type,
                            'side': side,
                        }));
                    }
                }
            }
        }
        let cost = undefined;
        if (filled !== undefined) {
            if (remaining === undefined) {
                if (amount !== undefined) {
                    remaining = amount - filled;
                }
            }
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        let fee = undefined;
        let feeCost = this.safeString (order, 'feeAmount');
        if (feeCost !== undefined) {
            let feeOption = this.safeString (order, 'feeOption');
            let feeCurrency = undefined;
            if (feeOption === 'feeInNative') {
                if (market !== undefined) {
                    feeCurrency = market['base'];
                }
            } else if (feeOption === 'feeInZRX') {
                feeCurrency = 'ZRX';
            } else {
                throw new NotSupported (this.id + ' encountered an unsupported order fee option: ' + feeOption);
            }
            let feeDecimals = this.safeInteger (this.options['decimals'], feeCurrency, 18);
            fee = {
                'cost': this.fromWei (feeCost, 'ether', feeDecimals),
                'currency': feeCurrency,
            };
        }
        let amountPrecision = market ? market['precision']['amount'] : 8;
        if (remaining !== undefined) {
            if (status === undefined) {
                status = 'open';
                const rest = remaining - failedAmount - deadAmount - prunedAmount;
                if (rest < Math.pow (10, -amountPrecision)) {
                    status = (filled < amount) ? 'canceled' : 'closed';
                }
            }
        }
        let result = {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        let method = this.options['fetchOrderMethod'];
        return await this[method] (id, symbol, this.extend ({
            'openAmount': 1,
        }, params));
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
        let method = this.options['fetchOrderMethod'];
        return await this[method] (id, symbol, this.extend (params));
    }

    async fetchOrderFromHistory (id, symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, undefined, undefined, this.extend ({
            'orderHash': id,
        }, params));
        let ordersById = this.indexBy (orders, 'id');
        if (id in ordersById)
            return ordersById[id];
        throw new OrderNotFound (this.id + ' could not find order ' + id + ' in order history');
    }

    async fetchOrderById (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderHash': id,
        };
        let response = await this.publicGetOrderOrderHash (this.extend (request, params));
        //
        //     {
        //       "baseTokenAddress": "0x7cc7fdd065cfa9c7f4f6a3c1bfc6dfcb1a3177aa",
        //       "quoteTokenAddress": "0x17f15936ef3a2da5593033f84487cbe9e268f02f",
        //       "side": "buy",
        //       "amount": "10000000000000000000",
        //       "price": "1.000",
        //       "created": "1512929327792",
        //       "expires": "1512929897118",
        //       "zeroExOrder": {
        //         "exchangeContractAddress": "0x516bdc037df84d70672b2d140835833d3623e451",
        //         "maker": "0x006dc83e5b21854d4afc44c9b92a91e0349dda13",
        //         "taker": "0x00ba938cc0df182c25108d7bf2ee3d37bce07513",
        //         "makerTokenAddress": "0x7cc7fdd065cfa9c7f4f6a3c1bfc6dfcb1a3177aa",
        //         "takerTokenAddress": "0x17f15936ef3a2da5593033f84487cbe9e268f02f",
        //         "feeRecipient": "0x88a64b5e882e5ad851bea5e7a3c8ba7c523fecbe",
        //         "makerTokenAmount": "10000000000000000000",
        //         "takerTokenAmount": "10000000000000000000",
        //         "makerFee": "0",
        //         "takerFee": "0",
        //         "expirationUnixTimestampSec": "525600",
        //         "salt": "37800593840622773016017857006417214310534675667008850948421364357744823963318",
        //         "orderHash": "0x94629386298dee69ae63cd3e414336ae153b3f02cffb9ffc53ad71e166615618",
        //         "ecSignature": {
        //           "v": 28,
        //           "r": "0x5307b6a69e7cba8583e1de39efb93a9ae1afc11849e79d99f462e49c18c4d6e4",
        //           "s": "0x5950e82364227ccca95c70b47375e8911a2039d3040ba0684329634ebdced160"
        //         }
        //       }
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let request = {
            'orderHash': id,
        };
        let orders = await this.fetchOrders (symbol, undefined, undefined, this.extend (request, params));
        let numOrders = orders.length;
        if (numOrders !== 1) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return orders[0];
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['baseTokenAddress'] = market['baseId'];
            request['quoteTokenAddress'] = market['quoteId'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privateGetOrderHistory (this.extend (request, params));
        //
        //     [
        //       {
        //         "orderHash": "0x94629386298dee69ae63cd3e414336ae153b3f02cffb9ffc53ad71e166615618",
        //         "baseTokenAddress": "0x323b5d4c32345ced77393b3530b1eed0f346429d",
        //         "quoteTokenAddress": "0xef7fff64389b814a946f3e92105513705ca6b990",
        //         "side": "buy",
        //         "openAmount": "10000000000000000000",
        //         "filledAmount": "0",
        //         "reservedAmount": "0",
        //         "settledAmount": "0",
        //         "confirmedAmount": "0",
        //         "deadAmount": "0",
        //         "price": "0.00050915",
        //         "timeline": [
        //           {
        //             "action": "placed",
        //             "amount": "10000000000000000000",
        //             "timestamp": "1512929327792"
        //           }
        //         ]
        //       }
        //     ]
        //
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'openAmount': 1, // returns open orders with remaining openAmount >= 1
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'openAmount': 0, // returns closed orders with remaining openAmount === 0
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let timestamp = this.seconds ().toString ();
            let prehash = this.apiKey + timestamp + method;
            if (method === 'POST') {
                body = this.json (query);
                prehash += body;
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                prehash += this.json ({});
            }
            let signature = this.hmac (this.encode (prehash), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'TOX-ACCESS-KEY': this.apiKey,
                'TOX-ACCESS-SIGN': signature,
                'TOX-ACCESS-TIMESTAMP': timestamp,
                'Content-Type': 'application/json',
            };
        } else if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        // code 401 and plain body 'Authentication failed' (with single quotes)
        // this error is sent if you do not submit a proper Content-Type
        if (body === "'Authentication failed'") {
            throw new AuthenticationError (this.id + ' ' + body);
        }
        if ((body[0] === '{') || (body[0] === '[')) {
            const message = this.safeString (response, 'message');
            if (message !== undefined) {
                //
                // {"message":"Schema validation failed for 'query'","errors":[{"name":"required","argument":"startTime","message":"requires property \"startTime\"","instance":{"baseTokenAddress":"0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570","quoteTokenAddress":"0xd0a1e359811322d97991e03f863a0c30c2cf029c","interval":"300"},"property":"instance"}]}
                // {"message":"Logic validation failed for 'query'","errors":[{"message":"startTime should be between 0 and current date","type":"startTime"}]}
                // {"message":"Order not found","errors":[]}
                // {"message":"Orderbook exhausted for intent MARKET_INTENT:8yjjzd8b0e8yjjzd8b0fjjzd8b0g"}
                // {"message":"Intent validation failed.","errors":[{"message":"Greater than available wallet balance.","type":"walletBaseTokenAmount"}]}
                // {"message":"Schema validation failed for 'body'","errors":[{"name":"anyOf","argument":["[subschema 0]","[subschema 1]","[subschema 2]"],"message":"is not any of [subschema 0],[subschema 1],[subschema 2]","instance":{"signedTargetOrder":{"error":{"message":"Unsigned target order validation failed.","errors":[{"message":"Greater than available wallet balance.","type":"walletBaseTokenAmount"}]},"maker":"0x1709c02cd7327d391a39a7671af8a91a1ef8a47b","orderHash":"0xda007ea8b5eca71ac96fe4072f7c1209bb151d898a9cc89bbeaa594f0491ee49","ecSignature":{"v":27,"r":"0xb23ce6c4a7b5d51d77e2d00f6d1d472a3b2e72d5b2be1510cfeb122f9366b79e","s":"0x07d274e6d7a00b65fc3026c2f9019215b1e47a5ac4d1f05e03f90550d27109be"}}},"property":"instance"}]}
                // {"message":"Schema validation failed for 'params'","errors":[{"name":"pattern","argument":"^0x[0-9a-fA-F]{64}$","message":"does not match pattern \"^0x[0-9a-fA-F]{64}$\"","instance":"1","property":"instance.orderHash"}]}
                //
                const feedback = this.id + ' ' + this.json (response);
                const exact = this.exceptions['exact'];
                if (message in exact)
                    throw new exact[message] (feedback);
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, body);
                if (broadKey !== undefined)
                    throw new broad[broadKey] (feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
