'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { PAD_WITH_ZERO } = require ('./base/functions/number');
const { InvalidOrder, InsufficientFunds, ExchangeError, ExchangeNotAvailable, DDoSProtection, BadRequest } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class idex2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex2',
            'name': 'IDEX',
            'countries': [ 'US' ],
            'rateLimit': 1500,
            'version': 'v1',
            'certified': false,
            'requiresWeb3': true,
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://api-sandbox.idex.io',
                    'private': 'https://api-sandbox.idex.io',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/63693236-3415e380-c81c-11e9-8600-ba1634f1407d.jpg',
                'api': {},
                'www': 'https://idex.io',
                'doc': [
                    'https://docs.idex.io/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'exchange',
                        'assets',
                        'markets',
                        'tickers',
                        'candles',
                        'trades',
                        'orderbook',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'wallets',
                        'balances',
                        'orders',
                        'fills',
                        'deposits',
                        'withdrawals',
                    ],
                    'post': [
                        'wallets',
                        'orders',
                        'orders/test',
                        'withdrawals',
                    ],
                    'delete': [
                        'orders',
                    ],
                },
            },
            'options': {},
            'exceptions': {
                'INVALID_ORDER_QUANTITY': InvalidOrder,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
                'SERVICE_UNAVAILABLE': ExchangeNotAvailable,
                'EXCEEDED_RATE_LIMIT': DDoSProtection,
                'INVALID_PARAMETER': BadRequest,
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
                'apiKey': true,
                'secret': true,
            },
            'paddingMode': PAD_WITH_ZERO,
            'commonCurrencies': {},
        });
    }

    async fetchMarkets (params = {}) {
        // [
        //   {
        //     market: 'DIL-ETH',
        //     status: 'active',
        //     baseAsset: 'DIL',
        //     baseAssetPrecision: 8,
        //     quoteAsset: 'ETH',
        //     quoteAssetPrecision: 8
        //   }, ...
        // ]
        const response = await this.publicGetMarkets (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const marketId = this.safeString (entry, 'market');
            const baseId = this.safeString (entry, 'baseAsset');
            const quoteId = this.safeString (entry, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const basePrecision = this.safeInteger (entry, 'baseAssetPrecision');
            const quotePrecision = this.safeInteger (entry, 'quoteAssetPrecision');
            const status = this.safeString (entry, 'status');
            const active = status === 'active';
            const precision = {
                'amount': basePrecision,
                'price': quotePrecision,
            };
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': entry,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
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
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        // [
        //   {
        //     market: 'DIL-ETH',
        //     time: 1598367493008,
        //     open: '0.09695361',
        //     high: '0.10245881',
        //     low: '0.09572507',
        //     close: '0.09917079',
        //     closeQuantity: '0.71320950',
        //     baseVolume: '309.17380612',
        //     quoteVolume: '30.57633981',
        //     percentChange: '2.28',
        //     numTrades: 205,
        //     ask: '0.09910476',
        //     bid: '0.09688340',
        //     sequence: 3902
        //   }
        // ]
        const response = await this.publicGetTickers (this.extend (request, params));
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        // [
        //   {
        //     market: 'DIL-ETH',
        //     time: 1598367493008,
        //     open: '0.09695361',
        //     high: '0.10245881',
        //     low: '0.09572507',
        //     close: '0.09917079',
        //     closeQuantity: '0.71320950',
        //     baseVolume: '309.17380612',
        //     quoteVolume: '30.57633981',
        //     percentChange: '2.28',
        //     numTrades: 205,
        //     ask: '0.09910476',
        //     bid: '0.09688340',
        //     sequence: 3902
        //   }, ...
        // ]
        const response = await this.publicGetTickers (params);
        return this.parseTickers (response, symbols);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //   market: 'DIL-ETH',
        //   time: 1598367493008,
        //   open: '0.09695361',
        //   high: '0.10245881',
        //   low: '0.09572507',
        //   close: '0.09917079',
        //   closeQuantity: '0.71320950',
        //   baseVolume: '309.17380612',
        //   quoteVolume: '30.57633981',
        //   percentChange: '2.28',
        //   numTrades: 205,
        //   ask: '0.09910476',
        //   bid: '0.09688340',
        //   sequence: 3902
        // }
        const marketId = this.safeString (ticker, 'market');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const baseVolume = this.safeFloat (ticker, 'baseVolume');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        const timestamp = this.safeInteger (ticker, 'time');
        const open = this.safeFloat (ticker, 'open');
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const close = this.safeFloat (ticker, 'close');
        const ask = this.safeFloat (ticker, 'ask');
        const bid = this.safeFloat (ticker, 'bid');
        let percentage = this.safeFloat (ticker, 'percentChange');
        if (percentage !== undefined) {
            percentage = 1 + percentage / 100;
        }
        let change = undefined;
        if ((close !== undefined) && (open !== undefined)) {
            change = close - open;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': timeframe,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     start: 1598345580000,
        //     open: '0.09771286',
        //     high: '0.09771286',
        //     low: '0.09771286',
        //     close: '0.09771286',
        //     volume: '1.45340410',
        //     sequence: 3853
        //   }, ...
        // ]
        const response = await this.publicGetCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //   start: 1598345580000,
        //   open: '0.09771286',
        //   high: '0.09771286',
        //   low: '0.09771286',
        //   close: '0.09771286',
        //   volume: '1.45340410',
        //   sequence: 3853
        // }
        const timestamp = this.safeInteger (ohlcv, 'start');
        const open = this.safeFloat (ohlcv, 'open');
        const high = this.safeFloat (ohlcv, 'high');
        const low = this.safeFloat (ohlcv, 'low');
        const close = this.safeFloat (ohlcv, 'close');
        const volume = this.safeFloat (ohlcv, 'volume');
        return [ timestamp, open, high, low, close, volume ];
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     fillId: 'b5467d00-b13e-3fa9-8216-dd66735550fc',
        //     price: '0.09771286',
        //     quantity: '1.45340410',
        //     quoteQuantity: '0.14201627',
        //     time: 1598345638994,
        //     makerSide: 'buy',
        //     sequence: 3853
        //   }, ...
        // ]
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    parseTrade (trade, market = undefined) {
        // public trades
        // {
        //   fillId: 'b5467d00-b13e-3fa9-8216-dd66735550fc',
        //   price: '0.09771286',
        //   quantity: '1.45340410',
        //   quoteQuantity: '0.14201627',
        //   time: 1598345638994,
        //   makerSide: 'buy',
        //   sequence: 3853
        // }
        // private trades
        // {
        //   fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //   price: '0.09905990',
        //   quantity: '0.40000000',
        //   quoteQuantity: '0.03962396',
        //   time: 1598873478762,
        //   makerSide: 'sell',
        //   sequence: 5053,
        //   market: 'DIL-ETH',
        //   orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //   side: 'buy',
        //   fee: '0.00080000',
        //   feeAsset: 'DIL',
        //   gas: '0.00857497',
        //   liquidity: 'taker',
        //   txId: '0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65',
        //   txStatus: 'mined'
        // }
        const id = this.safeString (trade, 'fillId');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const cost = this.safeFloat (trade, 'quoteQuantity');
        const timestamp = this.safeInteger (trade, 'time');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        // this code handles the duality of public vs private trades
        const makerSide = this.safeString (trade, 'makerSide');
        const oppositeSide = (makerSide === 'buy') ? 'sell' : 'buy';
        const side = this.safeString (trade, 'side', oppositeSide);
        const takerOrMaker = this.safeString (trade, 'liquidity', 'taker');
        const fee = {
            'cost': this.safeFloat (trade, 'fee'),
            'currency': this.safeString (trade, 'feeAsset'),
        };
        const orderId = this.safeString (trade, 'orderId');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'level': 2,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // {
        //   sequence: 36416753,
        //   bids: [
        //     [ '0.09672815', '8.22284267', 1 ],
        //     [ '0.09672814', '1.83685554', 1 ],
        //     [ '0.09672143', '4.10962617', 1 ],
        //     [ '0.09658884', '4.03863759', 1 ],
        //     [ '0.09653781', '3.35730684', 1 ],
        //     [ '0.09624660', '2.54163586', 1 ],
        //     [ '0.09617490', '1.93065030', 1 ]
        //   ],
        //   asks: [
        //     [ '0.09910476', '3.22840154', 1 ],
        //     [ '0.09940587', '3.39796593', 1 ],
        //     [ '0.09948189', '4.25088898', 1 ],
        //     [ '0.09958362', '2.42195784', 1 ],
        //     [ '0.09974393', '4.25234367', 1 ],
        //     [ '0.09995250', '3.40192141', 1 ]
        //   ]
        // }
        const response = await this.publicGetOrderbook (this.extend (request, params));
        const nonce = this.safeInteger (response, 'sequence');
        const book = this.parseOrderBook (response, undefined, 'bids', 'asks', 0, 1);
        book['nonce'] = nonce;
        return book;
    }

    async fetchCurrencies (params = {}) {
        // [
        //   {
        //     name: 'Ether',
        //     symbol: 'ETH',
        //     contractAddress: '0x0000000000000000000000000000000000000000',
        //     assetDecimals: 18,
        //     exchangeDecimals: 8
        //   }, ..
        // ]
        const response = await this.publicGetAssets (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const name = this.safeString (entry, 'name');
            const currencyId = this.safeString (entry, 'symbol');
            const precision = this.safeInteger (entry, 'exchangeDecimals');
            const code = this.safeCurrencyCode (currencyId);
            const lot = Math.pow (-10, precision);
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': entry,
                'type': undefined,
                'name': name,
                'active': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': lot, 'max': undefined },
                    'price': { 'min': lot, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': lot, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const nonce1 = this.uuidv1 ();
        const request = {
            'nonce': nonce1,
            'wallet': this.walletAddress,
        };
        // [
        //   {
        //     asset: 'DIL',
        //     quantity: '0.00000000',
        //     availableForTrade: '0.00000000',
        //     locked: '0.00000000',
        //     usdValue: null
        //   }, ...
        // ]
        const response = await this.privateGetBalances (this.extend (request, params));
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const total = this.safeFloat (entry, 'quantity');
            const free = this.safeFloat (entry, 'availableForTrade');
            const used = this.safeFloat (entry, 'locked');
            result[code] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return this.parseBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //     price: '0.09905990',
        //     quantity: '0.40000000',
        //     quoteQuantity: '0.03962396',
        //     time: 1598873478762,
        //     makerSide: 'sell',
        //     sequence: 5053,
        //     market: 'DIL-ETH',
        //     orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //     side: 'buy',
        //     fee: '0.00080000',
        //     feeAsset: 'DIL',
        //     gas: '0.00857497',
        //     liquidity: 'taker',
        //     txId: '0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65',
        //     txStatus: 'mined'
        //   }
        // ]
        const response = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        return await this.fetchOrdersHelper (symbol, undefined, undefined, this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'closed': false,
        };
        return await this.fetchOrdersHelper (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'closed': true,
        };
        return await this.fetchOrdersHelper (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrdersHelper (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        // fetchClosedOrders / fetchOpenOrders
        // [
        //   {
        //     "market": "DIL-ETH",
        //     "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //     "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //     "time": 1598873478650,
        //     "status": "filled",
        //     "type": "limit",
        //     "side": "buy",
        //     "originalQuantity": "0.40000000",
        //     "executedQuantity": "0.40000000",
        //     "cumulativeQuoteQuantity": "0.03962396",
        //     "avgExecutionPrice": "0.09905990",
        //     "price": "1.00000000",
        //     "fills": [
        //       {
        //         "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //         "price": "0.09905990",
        //         "quantity": "0.40000000",
        //         "quoteQuantity": "0.03962396",
        //         "time": 1598873478650,
        //         "makerSide": "sell",
        //         "sequence": 5053,
        //         "fee": "0.00080000",
        //         "feeAsset": "DIL",
        //         "gas": "0.00857497",
        //         "liquidity": "taker",
        //         "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //         "txStatus": "mined"
        //       }
        //     ]
        //   }
        // ]
        // fetchOrder
        // { market: 'DIL-ETH',
        //   orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //   wallet: '0x0AB991497116f7F5532a4c2f4f7B1784488628e1',
        //   time: 1598873478650,
        //   status: 'filled',
        //   type: 'limit',
        //   side: 'buy',
        //   originalQuantity: '0.40000000',
        //   executedQuantity: '0.40000000',
        //   cumulativeQuoteQuantity: '0.03962396',
        //   avgExecutionPrice: '0.09905990',
        //   price: '1.00000000',
        //   fills:
        //    [ { fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //        price: '0.09905990',
        //        quantity: '0.40000000',
        //        quoteQuantity: '0.03962396',
        //        time: 1598873478650,
        //        makerSide: 'sell',
        //        sequence: 5053,
        //        fee: '0.00080000',
        //        feeAsset: 'DIL',
        //        gas: '0.00857497',
        //        liquidity: 'taker',
        //        txId: '0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65',
        //        txStatus: 'mined' } ] }
        if (Array.isArray (response)) {
            return this.parseOrders (response, market, since, limit);
        } else {
            return this.parseOrder (response, market);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //   "market": "DIL-ETH",
        //   "orderId": "7cdc8e90-eb7d-11ea-9e60-4118569f6e63",
        //   "wallet": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
        //   "time": 1598873478650,
        //   "status": "filled",
        //   "type": "limit",
        //   "side": "buy",
        //   "originalQuantity": "0.40000000",
        //   "executedQuantity": "0.40000000",
        //   "cumulativeQuoteQuantity": "0.03962396",
        //   "avgExecutionPrice": "0.09905990",
        //   "price": "1.00000000",
        //   "fills": [
        //     {
        //       "fillId": "48582d10-b9bb-3c4b-94d3-e67537cf2472",
        //       "price": "0.09905990",
        //       "quantity": "0.40000000",
        //       "quoteQuantity": "0.03962396",
        //       "time": 1598873478650,
        //       "makerSide": "sell",
        //       "sequence": 5053,
        //       "fee": "0.00080000",
        //       "feeAsset": "DIL",
        //       "gas": "0.00857497",
        //       "liquidity": "taker",
        //       "txId": "0xeaa02b112c0b8b61bc02fa1776a2b39d6c614e287c1af90df0a2e591da573e65",
        //       "txStatus": "mined"
        //     }
        //   ]
        // }
        const timestamp = this.safeInteger (order, 'time');
        const fills = this.safeValue (order, 'fills');
        const id = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'market');
        let symbol = undefined;
        const side = this.safeString (order, 'side');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        const trades = this.parseTrades (fills, market);
        const type = this.safeString (order, 'type');
        const amount = this.safeFloat (order, 'originalQuantity');
        const filled = this.safeFloat (order, 'executedQuantity');
        let remaining = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            remaining = amount - filled;
        }
        const average = this.safeFloat (order, 'avgExecutionPrice');
        const price = this.safeFloat (order, 'price', average);  // for market orders
        let cost = undefined;
        if ((amount !== undefined) && (price !== undefined)) {
            cost = amount * price;
        }
        const rawStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (rawStatus);
        const fee = {
            'currency': undefined,
            'cost': undefined,
        };
        let lastTrade = undefined;
        for (let i = 0; i < trades.length; i++) {
            lastTrade = trades[i];
            fee['currency'] = lastTrade['fee']['currency'];
            fee['cost'] = this.sum (fee['cost'], lastTrade['fee']['cost']);
        }
        const lastTradeTimestamp = this.safeInteger (lastTrade, 'timestamp');
        return {
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
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async associateWallet (walletAddress, params = {}) {
        const nonce = this.uuidv1 ();
        const noPrefix = this.remove0xPrefix (walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (noPrefix),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, 'keccak', 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        // {
        //   address: '0x0AB991497116f7F5532a4c2f4f7B1784488628e1',
        //   totalPortfolioValueUsd: '0.00',
        //   time: 1598468353626
        // }
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': walletAddress,
            },
            'signature': signature,
        };
        return await this.privatePostWallets (request);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // https://docs.idex.io/#create-order
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const nonce = this.uuidv1 ();
        let typeEnum = undefined;
        let priceString = undefined;
        if (type === 'limit') {
            typeEnum = 1;
            priceString = this.priceToPrecision (symbol, price);
        } else if (type === 'market') {
            typeEnum = 0;
        }
        const sideEnum = (side === 'buy') ? 0 : 1;
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const orderVersion = 1;
        const amountString = this.amountToPrecision (symbol, amount);
        const timeInForceEnum = 0;  // Good-til-canceled
        const timeInForce = 'gtc';
        const selfTradePrevention = 'cn';
        const selfTradePreventionEnum = 2;  // Cancel newest
        const byteArray = [
            this.numberToBE (orderVersion, 1),
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.stringToBinary (this.encode (market['id'])),  // TODO: refactor to remove either encode or stringToBinary
            this.numberToBE (typeEnum, 1),
            this.numberToBE (sideEnum, 1),
            this.stringToBinary (this.encode (amountString)),
        ];
        if (type === 'limit') {
            const encodedPrice = this.stringToBinary (this.encode (priceString));
            byteArray.push (encodedPrice);
        }
        const after = [
            this.numberToBE (timeInForceEnum, 1),
            this.numberToBE (selfTradePreventionEnum, 1),
            this.numberToBE (0, 8), // unused
        ];
        const allBytes = this.arrayConcat (byteArray, after);
        const binary = this.binaryConcatArray (allBytes);
        const hash = this.hash (binary, 'keccak', 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request = {
            'parameters': {
                'nonce': nonce,
                'market': market['id'],
                'side': side,
                'type': type,
                'quantity': amountString,
                'wallet': this.walletAddress,
                'timeInForce': timeInForce,
                'selfTradePrevention': selfTradePrevention,
            },
            'signature': signature,
        };
        if (type === 'limit') {
            request['parameters']['price'] = priceString;
        }
        // {
        //   market: 'DIL-ETH',
        //   orderId: '7cdc8e90-eb7d-11ea-9e60-4118569f6e63',
        //   wallet: '0x0AB991497116f7F5532a4c2f4f7B1784488628e1',
        //   time: 1598873478650,
        //   status: 'filled',
        //   type: 'limit',
        //   side: 'buy',
        //   originalQuantity: '0.40000000',
        //   executedQuantity: '0.40000000',
        //   cumulativeQuoteQuantity: '0.03962396',
        //   price: '1.00000000',
        //   fills: [
        //     {
        //       fillId: '48582d10-b9bb-3c4b-94d3-e67537cf2472',
        //       price: '0.09905990',
        //       quantity: '0.40000000',
        //       quoteQuantity: '0.03962396',
        //       time: 1598873478650,
        //       makerSide: 'sell',
        //       sequence: 5053,
        //       fee: '0.00080000',
        //       feeAsset: 'DIL',
        //       gas: '0.00857497',
        //       liquidity: 'taker',
        //       txStatus: 'pending'
        //     }
        //   ],
        //   avgExecutionPrice: '0.09905990'
        // }
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const amountString = this.currencyToPrecision (code, amount);
        const currency = this.currency (code);
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.stringToBinary (this.encode (currency['id'])),
            this.stringToBinary (this.encode (amountString)),
            this.numberToBE (1, 1), // bool set to true
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, 'keccak', 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': this.walletAddress,
                'asset': currency['id'],
                'quantity': amountString,
            },
            'signature': signature,
        };
        // {
        //   withdrawalId: 'a61dcff0-ec4d-11ea-8b83-c78a6ecb3180',
        //   asset: 'ETH',
        //   assetContractAddress: '0x0000000000000000000000000000000000000000',
        //   quantity: '0.20000000',
        //   time: 1598962883190,
        //   fee: '0.00024000',
        //   txStatus: 'pending',
        //   txId: null
        // }
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        const id = this.safeString (response, 'withdrawalId');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const nonce = this.uuidv1 ();
        const walletBytes = this.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce),
            this.base16ToBinary (walletBytes),
            this.stringToBinary (this.encode (id)),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, 'keccak', 'hex');
        const signature = this.signMessageString (hash, this.privateKey);
        const request = {
            'parameters': {
                'nonce': nonce,
                'wallet': this.walletAddress,
                'orderId': id,
            },
            'signature': signature,
        };
        // [ { orderId: '688336f0-ec50-11ea-9842-b332f8a34d0e' } ]
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const canceledOrder = this.safeValue (response, 0);
        return this.parseOrder (canceledOrder, market);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (errorCode in this.exceptions) {
            const Exception = this.exceptions[errorCode];
            throw new Exception (this.id + ' ' + message);
        }
        if (errorCode !== undefined) {
            throw new ExchangeError (this.id + ' ' + message);
        }
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        params = this.extend ({
            'method': 'privateGetDeposits',
        }, params);
        return this.fetchTransactionsHelper (code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        params = this.extend ({
            'method': 'privateGetWithdrawals',
        }, params);
        return this.fetchTransactionsHelper (code, since, limit, params);
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const request = {
            'nonce': nonce,
            'wallet': this.walletAddress,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // [
        //   {
        //     depositId: 'e9970cc0-eb6b-11ea-9e89-09a5ebc1f98e',
        //     asset: 'ETH',
        //     quantity: '1.00000000',
        //     txId: '0xcd4aac3171d7131cc9e795568c67938675185ac17641553ef54c8a7c294c8142',
        //     txTime: 1598865853000,
        //     confirmationTime: 1598865930231
        //   }
        // ]
        const method = params['method'];
        params = this.omit (params, 'method');
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'mined': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        // fetchDeposits
        // {
        //   depositId: 'e9970cc0-eb6b-11ea-9e89-09a5ebc1f98f',
        //   asset: 'ETH',
        //   quantity: '1.00000000',
        //   txId: '0xcd4aac3171d7131cc9e795568c67938675185ac17641553ef54c8a7c294c8142',
        //   txTime: 1598865853000,
        //   confirmationTime: 1598865930231
        // }
        // fetchWithdrwalas
        // {
        //   withdrawalId: 'a62d8760-ec4d-11ea-9fa6-47904c19499b',
        //   asset: 'ETH',
        //   assetContractAddress: '0x0000000000000000000000000000000000000000',
        //   quantity: '0.20000000',
        //   time: 1598962883288,
        //   fee: '0.00024000',
        //   txId: '0x305e9cdbaa85ad029f50578d13d31d777c085de573ed5334d95c19116d8c03ce',
        //   txStatus: 'mined'
        //  }
        let type = undefined;
        if ('depositId' in transaction) {
            type = 'deposit';
        } else if ('withdrawalId' in transaction) {
            type = 'withdrawal';
        }
        const id = this.safeString2 (transaction, 'depositId', 'withdrawId');
        const code = this.safeCurrencyCode (this.safeString (transaction, 'asset'), currency);
        const amount = this.safeFloat (transaction, 'quantity');
        const txid = this.safeString (transaction, 'txId');
        const timestamp = this.safeInteger (transaction, 'txTime');
        let fee = undefined;
        if ('fee' in transaction) {
            fee = {
                'cost': this.safeFloat (transaction, 'fee'),
                'currency': 'ETH',
            };
        }
        const rawStatus = this.safeString (transaction, 'txStatus');
        const status = this.parseTransactionStatus (rawStatus);
        const updated = this.safeInteger (transaction, 'confirmationTime');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['test'][api] + '/' + this.version + '/' + path;
        const keys = Object.keys (params);
        const length = keys.length;
        let query = undefined;
        if (length > 0) {
            if (method === 'GET') {
                query = this.urlencode (params);
                url = url + '?' + query;
            } else {
                body = this.json (params);
            }
        }
        headers = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey !== undefined) {
            headers['IDEX-API-Key'] = this.apiKey;
        }
        if (api === 'private') {
            let payload = undefined;
            if (method === 'GET') {
                payload = query;
            } else {
                payload = body;
            }
            headers['IDEX-HMAC-Signature'] = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'hex');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
