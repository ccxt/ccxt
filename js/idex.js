'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { PAD_WITH_ZERO } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class idex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': [ 'US' ],
            'rateLimit': 1500,
            'version': 'v1',
            'certified': true,
            'requiresWeb3': true,
            'has': {
                'cancelOrder': false,
                'createOrder': false,
                'fetchBalance': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': false,
                'withdraw': false,
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
                'test': 'https://api-sandbox.idex.io',
                'logo': 'https://user-images.githubusercontent.com/1294454/63693236-3415e380-c81c-11e9-8600-ba1634f1407d.jpg',
                'api': {
                    'public': 'https://api-sandbox.idex.io',
                    'private': 'https://api-sandbox.idex.io',
                    'ws': 'https://api-sandbox.idex.io',
                },
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
            'exceptions': {},
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
        // {
        //   fillId: 'b5467d00-b13e-3fa9-8216-dd66735550fc',
        //   price: '0.09771286',
        //   quantity: '1.45340410',
        //   quoteQuantity: '0.14201627',
        //   time: 1598345638994,
        //   makerSide: 'buy',
        //   sequence: 3853
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
        const makerSide = this.safeString (trade, 'makerSide');
        const side = (makerSide === 'buy') ? 'sell' : 'buy';
        // by definition all trades are takers
        const takerOrMaker = 'taker';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
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
        const response = await this.privateGetBalances (this.extend (request, params));
        return response;
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
        // TODO: make some trades on the testnet
        const response = await this.privateGetFills (this.extend (request, params));
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'closed': false,
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'closed': true,
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'nonce': this.uuidv1 (),
            'wallet': this.walletAddress,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = this.privateGetOrders (this.extend (request, params));
        return response;
    }

    async associateWallet (walletAddress, params = {}) {
        const nonce = this.uuidv1 ();
        const noPrefix = Exchange.remove0xPrefix (walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce.replace (/-/g, '')),
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
        const walletBytes = Exchange.remove0xPrefix (this.walletAddress);
        const orderVersion = 1;
        const amountString = this.amountToPrecision (symbol, amount);
        const timeInForceEnum = 0;  // Good-til-canceled
        const timeInForce = 'gtc';
        const selfTradePrevention = 'cn';
        const selfTradePreventionEnum = 2;  // Cancel newest
        const byteArray = [
            this.numberToBE (orderVersion, 1),
            this.base16ToBinary (nonce.replace (/-/g, '')),
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
        const response = await this.privatePostOrdersTest (this.extend (request, params));
        return response;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const nonce = this.uuidv1 ();
        const amountString = this.currencyToPrecision (code, amount);
        const currency = this.currency (code);
        const walletBytes = Exchange.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce.replace (/-/g, ''), ''),
            this.base16ToBinary (walletBytes),
            this.stringToBinary (currency['id']),
            this.stringToBinary (amountString),
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
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const nonce = this.uuidv1 ();
        const walletBytes = Exchange.remove0xPrefix (this.walletAddress);
        const byteArray = [
            this.base16ToBinary (nonce.replace (/-/g, '')),
            this.base16ToBinary (walletBytes),
            this.stringToBinary (id),
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
        const response = await this.privateDeleteOrders (this.extend (request, params));
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + path;
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
