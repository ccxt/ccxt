'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, AuthenticationError, DDoSProtection, BadResponse } = require ('./base/errors');
const { TRUNCATE, NO_PADDING, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bytetrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bytetrade',
            'name': 'ByteTrade',
            'countries': ['HK'],
            'rateLimit': 500,
            'requiresWeb3': true,
            'certified': true,
            // new metainfo interface
            'has': {
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '5d': '5d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'test': 'https://api-v2-test.bytetrade.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': 'https://api-v2.bytetrade.com',
                'www': 'https://www.bytetrade.com',
                'doc': 'https://github.com/Bytetrade/bytetrade-official-api-docs/wiki',
            },
            'api': {
                'market': {
                    'get': [
                        'klines',        // Kline of a symbol
                        'depth',         // Market Depth of a symbol
                        'trades',        // Trade records of a symbol
                        'tickers',
                    ],
                },
                'public': {
                    'get': [
                        'symbols',        // Reference information of trading instrument, including base currency, quote precision, etc.
                        'currencies',     // The list of currencies available
                        'balance',        // Get the balance of an account
                        'orders/open',    // Get the open orders of an account
                        'orders/closed',  // Get the closed orders of an account
                        'orders/all',     // Get the open and closed orders of an account
                        'orders',         // Get the details of an order of an account
                        'orders/trades',  // Get detail match results
                        'depositaddress', // Get deposit address
                        'withdrawals',    // Get withdrawals info
                        'deposits',       // Get deposit info
                        'transfers',      // Get transfer info
                    ],
                    'post': [
                        'transaction/createorder',    // Post create order transaction to blockchain
                        'transaction/cancelorder',    // Post cancel order transaction to blockchain
                        'transaction/withdraw',       // Post withdraw transaction to blockchain
                        'transaction/transfer',       // Post transfer transaction to blockchain
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.0008,
                    'maker': 0.0008,
                },
            },
            'commonCurrencies': {
                '44': 'ByteHub',
                '48': 'Blocktonic',
            },
            'exceptions': {
                'vertify error': AuthenticationError, // typo on the exchange side, 'vertify'
                'verify error': AuthenticationError, // private key signature is incorrect
                'transaction already in network': BadRequest, // same transaction submited
                'invalid argument': BadRequest,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const currencies = await this.publicGetCurrencies (params);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            let code = undefined;
            if (id in this.commonCurrencies) {
                code = this.commonCurrencies[id];
            } else {
                code = this.safeString (currency, 'name');
            }
            const name = this.safeString (currency, 'fullname');
            // in bytetrade.com DEX, request https://api-v2.bytetrade.com/currencies will return currencies,
            // the api doc is https://github.com/Bytetrade/bytetrade-official-api-docs/wiki/rest-api#get-currencies-get-currencys-supported-in-bytetradecom
            // we can see the coin name is none-unique in the result, the coin which code is 18 is the CyberMiles ERC20, and the coin which code is 35 is the CyberMiles main chain, but their name is same.
            // that is because bytetrade is a DEX, supports people create coin with the same name, but the id(code) of coin is unique, so we should use the id or name and id as the identity of coin.
            // For coin name and symbol is same with CCXT, I use name@id as the key of commonCurrencies dict.
            // [{
            //     "name": "CMT",      // currency name, non-unique
            //     "code": "18",       // currency id, unique
            //     "type": "crypto",
            //     "fullname": "CyberMiles",
            //     "active": true,
            //     "chainType": "ethereum",
            //     "basePrecision": 18,
            //     "transferPrecision": 10,
            //     "externalPrecision": 18,
            //     "chainContractAddress": "0xf85feea2fdd81d51177f6b8f35f0e6734ce45f5f",
            //     "limits": {
            //       "deposit": {
            //         "min": "0",
            //         "max": "-1"
            //       },
            //       "withdraw": {
            //         "min": "0",
            //         "max": "-1"
            //       }
            //     }
            //   },
            //   {
            //     "name": "CMT",
            //     "code": "35",
            //     "type": "crypto",
            //     "fullname": "CyberMiles",
            //     "active": true,
            //     "chainType": "cmt",
            //     "basePrecision": 18,
            //     "transferPrecision": 10,
            //     "externalPrecision": 18,
            //     "chainContractAddress": "0x0000000000000000000000000000000000000000",
            //     "limits": {
            //       "deposit": {
            //         "min": "1",
            //         "max": "-1"
            //       },
            //       "withdraw": {
            //         "min": "10",
            //         "max": "-1"
            //       }
            //     }
            //   }
            //   ]
            const active = this.safeValue (currency, 'active');
            const limits = this.safeValue (currency, 'limits');
            const deposit = this.safeValue (limits, 'deposit');
            const amountPrecision = this.safeInteger (currency, 'basePrecision');
            let maxDeposit = this.safeFloat (deposit, 'max');
            if (maxDeposit === -1.0) {
                maxDeposit = undefined;
            }
            const withdraw = this.safeValue (limits, 'withdraw');
            let maxWithdraw = this.safeFloat (withdraw, 'max');
            if (maxWithdraw === -1.0) {
                maxWithdraw = undefined;
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'precision': {
                    'amount': amountPrecision,
                    'price': undefined,
                },
                'fee': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'deposit': {
                        'min': this.safeFloat (deposit, 'min'),
                        'max': maxDeposit,
                    },
                    'withdraw': {
                        'min': this.safeFloat (withdraw, 'min'),
                        'max': maxWithdraw,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetSymbols (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            let base = this.safeString (market, 'baseName');
            let quote = this.safeString (market, 'quoteName');
            const normalBase = base.split ('@')[0];
            const normalQuote = quote.split ('@')[0];
            const normalSymbol = normalBase + '/' + normalQuote;
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            if (baseId in this.commonCurrencies) {
                base = this.commonCurrencies[baseId];
            }
            if (quoteId in this.commonCurrencies) {
                quote = this.commonCurrencies[quoteId];
            }
            const symbol = base + '/' + quote;
            const limits = this.safeValue (market, 'limits', {});
            const amount = this.safeValue (limits, 'amount', {});
            const price = this.safeValue (limits, 'price', {});
            const precision = this.safeValue (market, 'precision', {});
            const active = this.safeString (market, 'active');
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': {
                    'amount': this.safeInteger (precision, 'amount'),
                    'price': this.safeInteger (precision, 'price'),
                },
                'normalSymbol': normalSymbol,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (amount, 'min'),
                        'max': this.safeFloat (amount, 'max'),
                    },
                    'price': {
                        'min': this.safeFloat (price, 'min'),
                        'max': this.safeFloat (price, 'max'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires this.apiKey or userid argument');
        }
        await this.loadMarkets ();
        const request = {
            'userid': this.apiKey,
        };
        const balances = await this.publicGetBalance (this.extend (request, params));
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'code');
            const code = this.safeCurrencyCode (currencyId, undefined);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'free');
            account['used'] = this.safeFloat (balance, 'used');
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
        if (limit !== undefined) {
            request['limit'] = limit; // default = maximum = 100
        }
        const response = await this.marketGetDepth (this.extend (request, params));
        const timestamp = this.safeValue (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, timestamp);
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        //
        //     [
        //         {
        //             "symbol":"68719476706",
        //             "name":"ETH/BTC",
        //             "base":"2",
        //             "quote":"32",
        //             "timestamp":1575905991933,
        //             "datetime":"2019-12-09T15:39:51.933Z",
        //             "high":"0",
        //             "low":"0",
        //             "open":"0",
        //             "close":"0",
        //             "last":"0",
        //             "change":"0",
        //             "percentage":"0",
        //             "baseVolume":"0",
        //             "quoteVolume":"0"
        //         }
        //     ]
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            const baseId = this.safeString (ticker, 'base');
            const quoteId = this.safeString (ticker, 'quote');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.safeFloat (ticker, 'open'),
            'close': this.safeFloat (ticker, 'close'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined, // previous day close
            'change': this.safeFloat (ticker, 'change'),
            'percentage': this.safeFloat (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.marketGetTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol":"68719476706",
        //             "name":"ETH/BTC",
        //             "base":"2",
        //             "quote":"32",
        //             "timestamp":1575905991933,
        //             "datetime":"2019-12-09T15:39:51.933Z",
        //             "high":"0",
        //             "low":"0",
        //             "open":"0",
        //             "close":"0",
        //             "last":"0",
        //             "change":"0",
        //             "percentage":"0",
        //             "baseVolume":"0",
        //             "quoteVolume":"0"
        //         }
        //     ]
        //
        if (Array.isArray (response)) {
            const ticker = this.safeValue (response, 0);
            if (ticker === undefined) {
                throw new BadResponse (this.id + ' fetchTicker() returned an empty response');
            }
            return this.parseTicker (ticker, market);
        }
        return this.parseTicker (response, market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const rawTickers = await this.marketGetDepth (params);
        return this.parseTickers (rawTickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const rawTickers = await this.marketGetTickers (params);
        return this.parseTickers (rawTickers, symbols);
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
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.marketGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const cost = this.safeFloat (trade, 'cost');
        const id = this.safeString (trade, 'id');
        const type = this.safeString (trade, 'type');
        const takerOrMaker = this.safeString (trade, 'takerOrMaker');
        const side = this.safeString (trade, 'side');
        const datetime = this.safeString (trade, 'datetime');
        const order = this.safeString (trade, 'order');
        const fee = this.safeValue (trade, 'fee');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
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
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 100, maximum = 500
        }
        const response = await this.marketGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const status = this.safeString (order, 'status');
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            const baseId = this.safeString (order, 'base');
            const quoteId = this.safeString (order, 'quote');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (order, 'timestamp');
        const datetime = this.safeString (order, 'datetime');
        const lastTradeTimestamp = this.safeInteger (order, 'lastTradeTimestamp');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled');
        const remaining = this.safeFloat (order, 'remaining');
        const cost = this.safeFloat (order, 'cost');
        const average = this.safeFloat (order, 'average');
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const fee = this.safeValue (order, 'fee');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
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
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        this.checkRequiredDependencies ();
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('createOrder requires this.apiKey or userid in params');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let sideNum = undefined;
        let typeNum = undefined;
        if (side === 'sell') {
            sideNum = 1;
        } else {
            sideNum = 2;
        }
        if (type === 'limit') {
            typeNum = 1;
        } else {
            typeNum = 2;
            price = 0;
        }
        const normalSymbol = market['normalSymbol'];
        const baseId = market['baseId'];
        const baseCurrency = this.currency (market['base']);
        const amountTruncated = this.amountToPrecision (symbol, amount);
        const amountChain = this.toWei (amountTruncated, baseCurrency['precision']['amount']);
        const quoteId = market['quoteId'];
        const quoteCurrency = this.currency (market['quote']);
        const priceRounded = this.priceToPrecision (symbol, price);
        const priceChain = this.toWei (priceRounded, quoteCurrency['precision']['amount']);
        const now = this.milliseconds ();
        const expiration = this.milliseconds ();
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const defaultDappId = 'Sagittarius';
        const dappId = this.safeString (params, 'dappId', defaultDappId);
        const defaultFee = this.safeString (this.options, 'fee', '300000000000000');
        const fee = this.safeString (params, 'fee', defaultFee);
        const eightBytes = this.integerPow ('2', '64');
        const allByteStringArray = [
            this.numberToBE (1, 32),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (32, 1),
            this.numberToLE (0, 8),
            this.numberToLE (fee, 8),  // string for 32 bit php
            this.numberToLE (this.apiKey.length, 1),
            this.stringToBinary (this.encode (this.apiKey)),
            this.numberToLE (sideNum, 1),
            this.numberToLE (typeNum, 1),
            this.numberToLE (normalSymbol.length, 1),
            this.stringToBinary (this.encode (normalSymbol)),
            this.numberToLE (this.integerDivide (amountChain, eightBytes), 8),
            this.numberToLE (this.integerModulo (amountChain, eightBytes), 8),
            this.numberToLE (this.integerDivide (priceChain, eightBytes), 8),
            this.numberToLE (this.integerModulo (priceChain, eightBytes), 8),
            this.numberToLE (0, 2),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (0, 2),
            this.numberToLE (parseInt (quoteId), 4),
            this.numberToLE (parseInt (baseId), 4),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (dappId.length, 1),
            this.stringToBinary (this.encode (dappId)),
            this.numberToLE (0, 1),
        ];
        const txByteStringArray = [
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (32, 1),
            this.numberToLE (0, 8),
            this.numberToLE (fee, 8),  // string for 32 bit php
            this.numberToLE (this.apiKey.length, 1),
            this.stringToBinary (this.encode (this.apiKey)),
            this.numberToLE (sideNum, 1),
            this.numberToLE (typeNum, 1),
            this.numberToLE (normalSymbol.length, 1),
            this.stringToBinary (this.encode (normalSymbol)),
            this.numberToLE (this.integerDivide (amountChain, eightBytes), 8),
            this.numberToLE (this.integerModulo (amountChain, eightBytes), 8),
            this.numberToLE (this.integerDivide (priceChain, eightBytes), 8),
            this.numberToLE (this.integerModulo (priceChain, eightBytes), 8),
            this.numberToLE (0, 2),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (0, 2),
            this.numberToLE (parseInt (quoteId), 4),
            this.numberToLE (parseInt (baseId), 4),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (dappId.length, 1),
            this.stringToBinary (this.encode (dappId)),
            this.numberToLE (0, 1),
        ];
        const txbytestring = this.binaryConcatArray (txByteStringArray);
        const txidhash = this.hash (txbytestring, 'sha256', 'hex');
        const txid = txidhash.slice (0, 40);
        const orderidByteStringArray = [
            this.numberToLE (txid.length, 1),
            this.stringToBinary (this.encode (txid)),
            this.numberToBE (0, 4),
        ];
        const orderidbytestring = this.binaryConcatArray (orderidByteStringArray);
        const orderidhash = this.hash (orderidbytestring, 'sha256', 'hex');
        const orderid = orderidhash.slice (0, 40);
        const bytestring = this.binaryConcatArray (allByteStringArray);
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined, true);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (this.sum (signature['v'], 31), 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        const operation = {
            'now': datetime,
            'expiration': expirationDatetime,
            'fee': fee,
            'creator': this.apiKey,
            'side': sideNum,
            'order_type': typeNum,
            'market_name': normalSymbol,
            'amount': amountChain,
            'price': priceChain,
            'use_btt_as_fee': false,
            'money_id': parseInt (quoteId),
            'stock_id': parseInt (baseId),
        };
        const fatty = {
            'timestamp': datetime,
            'expiration': expirationDatetime,
            'operations': [
                [
                    32,
                    operation,
                ],
            ],
            'validate_type': 0,
            'dapp': dappId,
            'signatures': [
                mySignature,
            ],
        };
        const request = {
            'trObj': this.json (fatty),
        };
        const response = await this.publicPostTransactionCreateorder (request);
        const timestamp = this.milliseconds ();
        const statusCode = this.safe_string (response, 'code');
        const status = (statusCode === '0') ? 'open' : 'failed';
        return {
            'info': response,
            'id': orderid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchOrder requires this.apiKey or userid argument');
        }
        await this.loadMarkets ();
        const request = {
            'userid': this.apiKey,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.markets[symbol];
            request['symbol'] = market['id'];
        }
        request['id'] = id;
        const response = await this.publicGetOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchOpenOrders requires this.apiKey or userid argument');
        }
        await this.loadMarkets ();
        const request = {
            'userid': this.apiKey,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersOpen (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchClosedOrders requires this.apiKey or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'userid': this.apiKey,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersClosed (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchOrders requires this.apiKey or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'userid': this.apiKey,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersAll (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('cancelOrder requires hasAlreadyAuthenticatedSuccessfully');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const baseId = market['baseId'];
        const quoteId = market['quoteId'];
        const normalSymbol = market['normalSymbol'];
        const feeAmount = '300000000000000';
        const now = this.milliseconds ();
        const expiration = 0;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const defaultDappId = 'Sagittarius';
        const dappId = this.safeString (params, 'dappId', defaultDappId);
        const byteStringArray = [
            this.numberToBE (1, 32),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (expiration, 4),
            this.numberToLE (1, 1),
            this.numberToLE (33, 1),
            this.numberToLE (0, 8),
            this.numberToLE (feeAmount, 8),  // string for 32 bit php
            this.numberToLE (this.apiKey.length, 1),
            this.stringToBinary (this.encode (this.apiKey)),
            this.numberToLE (normalSymbol.length, 1),
            this.stringToBinary (this.encode (normalSymbol)),
            this.base16ToBinary (id),
            this.numberToLE (parseInt (quoteId), 4),
            this.numberToLE (parseInt (baseId), 4),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (dappId.length, 1),
            this.stringToBinary (this.encode (dappId)),
            this.numberToLE (0, 1),
        ];
        const bytestring = this.binaryConcatArray (byteStringArray);
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined, true);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (this.sum (signature['v'], 31), 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        const operation = {
            'fee': feeAmount,
            'creator': this.apiKey,
            'order_id': id,
            'market_name': normalSymbol,
            'money_id': parseInt (quoteId),
            'stock_id': parseInt (baseId),
        };
        const fatty = {
            'timestamp': datetime,
            'expiration': expirationDatetime,
            'operations': [
                [
                    33,
                    operation,
                ],
            ],
            'validate_type': 0,
            'dapp': dappId,
            'signatures': [
                mySignature,
            ],
        };
        const request = {
            'trObj': this.json (fatty),
        };
        const response = await this.publicPostTransactionCancelorder (request);
        const timestamp = this.milliseconds ();
        const statusCode = this.safe_string (response, 'code');
        const status = (statusCode === '0') ? 'canceled' : 'failed';
        return {
            'info': response,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async transfer (code, amount, address, message = '', params = {}) {
        this.checkRequiredDependencies ();
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('transfer requires this.apiKey');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const amountTruncate = this.decimalToPrecision (amount, TRUNCATE, currency['info']['transferPrecision'], DECIMAL_PLACES, NO_PADDING);
        const amountChain = this.toWei (amountTruncate, currency['precision']['amount']);
        const assetType = parseInt (currency['id']);
        const now = this.milliseconds ();
        const expiration = now;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const feeAmount = '300000000000000';
        const defaultDappId = 'Sagittarius';
        const dappId = this.safeString (params, 'dappId', defaultDappId);
        const eightBytes = this.integerPow ('2', '64');
        const byteStringArray = [
            this.numberToBE (1, 32),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (28, 1),
            this.numberToLE (0, 8),
            this.numberToLE (feeAmount, 8),  // string for 32 bit php
            this.numberToLE (this.apiKey.length, 1),
            this.stringToBinary (this.encode (this.apiKey)),
            this.numberToLE (address.length, 1),
            this.stringToBinary (this.encode (address)),
            this.numberToLE (assetType, 4),
            this.numberToLE (this.integerDivide (amountChain, eightBytes), 8),
            this.numberToLE (this.integerModulo (amountChain, eightBytes), 8),
            this.numberToLE (1, 1),
            this.numberToLE (message.length, 1),
            this.stringToBinary (this.encode (message)),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (dappId.length, 1),
            this.stringToBinary (this.encode (dappId)),
            this.numberToLE (0, 1),
        ];
        const bytestring = this.binaryConcatArray (byteStringArray);
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined, true);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (this.sum (signature['v'], 31), 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        const operation = {
            'fee': '300000000000000',
            'from': this.apiKey,
            'to': address,
            'asset_type': parseInt (currency['id']),
            'amount': amountChain.toString (),
            'message': message,
        };
        const fatty = {
            'timestamp': datetime,
            'expiration': expirationDatetime,
            'operations': [
                [
                    28,
                    operation,
                ],
            ],
            'validate_type': 0,
            'dapp': dappId,
            'signatures': [
                mySignature,
            ],
        };
        const request = {
            'trObj': this.json (fatty),
        };
        const response = await this.publicPostTransactionTransfer (request);
        const timestamp = this.milliseconds ();
        const statusCode = this.safe_string (response, 'code');
        let status = '';
        if (statusCode === '0') {
            status = 'submit success';
        } else {
            status = 'submit fail';
        }
        return {
            'info': response,
            'id': '',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchMyTrades requires this.apiKey or userid argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'userid': this.apiKey,
        };
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires this.apiKey or userid argument');
        }
        let currency = undefined;
        const request = {
            'userid': this.apiKey,
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDeposits (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchWithdrawals requires this.apiKey or userid argument');
        }
        let currency = undefined;
        const request = {
            'userid': this.apiKey,
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'DEPOSIT_FAILED': 'failed',
            'FEE_SEND_FAILED': 'failed',
            'FEE_FAILED': 'failed',
            'PAY_SEND_FAILED': 'failed',
            'PAY_FAILED': 'failed',
            'BTT_FAILED': 'failed',
            'WITHDDRAW_FAILED': 'failed',
            'USER_FAILED': 'failed',
            'FEE_EXECUED': 'pending',
            'PAY_EXECUED': 'pending',
            'WITHDDRAW_EXECUTED': 'pending',
            'USER_EXECUED': 'pending',
            'BTT_SUCCED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'tag');
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const txid = this.safeValue (transaction, 'txid');
        const currencyId = this.safeString (transaction, 'code');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const datetime = this.safeString (transaction, 'datetime');
        const type = this.safeString (transaction, 'type');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeFloat (transaction, 'amount');
        const feeInfo = this.safeValue (transaction, 'fee');
        const feeCost = this.safeFloat (feeInfo, 'cost');
        const feeCurrencyId = this.safeString (feeInfo, 'code');
        const feeCode = this.safeCurrencyCode (feeCurrencyId, currency);
        const fee = {
            'cost': feeCost,
            'currency': feeCode,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDepositAddress requires this.apiKey or userid argument');
        }
        const currency = this.currency (code);
        const request = {
            'userid': this.apiKey,
            'code': currency['id'],
        };
        const response = await this.publicGetDepositaddress (request);
        const address = this.safeString (response[0], 'address');
        const tag = this.safeString (response[0], 'tag');
        const chainType = this.safeString (response[0], 'chainType');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'chainType': chainType,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkRequiredDependencies ();
        this.checkAddress (address);
        await this.loadMarkets ();
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('withdraw requires this.apiKey');
        }
        const addressResponse = await this.fetchDepositAddress (code);
        const chainTypeString = this.safeString (addressResponse, 'chainType');
        const chainId = this.safeString (addressResponse['info'][0], 'chainId');
        let middleAddress = '';
        if (chainTypeString === 'eos') {
            middleAddress = address;
        } else {
            middleAddress = this.safeString (addressResponse, 'address');
        }
        let operationId = 18;
        if (chainTypeString !== 'ethereum' && chainTypeString !== 'etc' && chainTypeString !== 'eos' && chainTypeString !== 'cmt' && chainTypeString !== 'naka') {
            operationId = 26;
        }
        const now = this.milliseconds ();
        const expiration = 0;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const defaultDappId = 'Sagittarius';
        const dappId = this.safeString (params, 'dappId', defaultDappId);
        const feeAmount = '300000000000000';
        const currency = this.currency (code);
        const coinId = currency['id'];
        const amountTruncate = this.decimalToPrecision (amount, TRUNCATE, currency['info']['transferPrecision'], DECIMAL_PLACES, NO_PADDING);
        const amountChain = this.toWei (amountTruncate, currency['info']['externalPrecision']);
        const eightBytes = this.integerPow ('2', '64');
        let assetFee = 0;
        let byteStringArray = [];
        if (operationId === 26) {
            assetFee = currency['info']['fee'];
            byteStringArray = [
                this.numberToBE (1, 32),
                this.numberToLE (Math.floor (now / 1000), 4),
                this.numberToLE (1, 1),
                this.numberToLE (Math.floor (expiration / 1000), 4),
                this.numberToLE (1, 1),
                this.numberToLE (operationId, 1),
                this.numberToLE (0, 8),
                this.numberToLE (feeAmount, 8),  // string for 32 bit php
                this.numberToLE (this.apiKey.length, 1),
                this.stringToBinary (this.encode (this.apiKey)),
                this.numberToLE (address.length, 1),
                this.stringToBinary (this.encode (address)),
                this.numberToLE (parseInt (coinId), 4),
                this.numberToLE (Math.floor (parseInt (parseFloat (this.integerDivide (amountChain, eightBytes)))), 8),
                this.numberToLE (this.integerModulo (amountChain, eightBytes), 8),
                this.numberToLE (1, 1),
                this.numberToLE (this.integerDivide (assetFee, eightBytes), 8),
                this.numberToLE (this.integerModulo (assetFee, eightBytes), 8),
                this.numberToLE (0, 1),
                this.numberToLE (1, 1),
                this.numberToLE (dappId.length, 1),
                this.stringToBinary (this.encode (dappId)),
                this.numberToLE (0, 1),
            ];
        } else {
            byteStringArray = [
                this.numberToBE (1, 32),
                this.numberToLE (Math.floor (now / 1000), 4),
                this.numberToLE (1, 1),
                this.numberToLE (Math.floor (expiration / 1000), 4),
                this.numberToLE (1, 1),
                this.numberToLE (operationId, 1),
                this.numberToLE (0, 8),
                this.numberToLE (feeAmount, 8),  // string for 32 bit php
                this.numberToLE (this.apiKey.length, 1),
                this.stringToBinary (this.encode (this.apiKey)),
                this.numberToLE (Math.floor (now / 1000), 4),
                this.numberToLE (1, 1),
                this.numberToLE (4, 1),
                this.numberToLE (0, 8),
                this.numberToLE (feeAmount, 8),
                this.numberToLE (this.apiKey.length, 1),
                this.stringToBinary (this.encode (this.apiKey)),
                this.numberToLE (middleAddress.length, 1),
                this.stringToBinary (this.encode (middleAddress)),
                this.numberToLE (parseInt (coinId), 4),
                this.numberToLE (Math.floor (parseInt (parseFloat (this.integerDivide (amountChain, eightBytes)))), 8),
                this.numberToLE (this.integerModulo (amountChain, eightBytes), 8),
                this.numberToLE (0, 1),
                this.numberToLE (1, 1),
                this.numberToLE (dappId.length, 1),
                this.stringToBinary (this.encode (dappId)),
                this.numberToLE (0, 1),
            ];
        }
        const bytestring = this.binaryConcatArray (byteStringArray);
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined, true);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (this.sum (signature['v'], 31), 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        let fatty = undefined;
        let request = undefined;
        let operation = undefined;
        const chainContractAddress = this.safeString (currency['info'], 'chainContractAddress');
        if (operationId === 26) {
            operation = {
                'fee': feeAmount,
                'from': this.apiKey,
                'to_external_address': address,
                'asset_type': parseInt (coinId),
                'amount': amountChain,
                'asset_fee': assetFee,
            };
            fatty = {
                'timestamp': datetime,
                'expiration': expirationDatetime,
                'operations': [
                    [
                        operationId,
                        operation,
                    ],
                ],
                'validate_type': 0,
                'dapp': dappId,
                'signatures': [
                    mySignature,
                ],
            };
            request = {
                'chainType': chainId,
                'trObj': this.json (fatty),
                'chainContractAddress': chainContractAddress,
            };
        } else {
            operation = {
                'fee': feeAmount,
                'from': this.apiKey,
                'to_external_address': middleAddress,
                'asset_type': parseInt (coinId),
                'amount': amountChain,
                'asset_fee': assetFee,
            };
            const middle = {
                'fee': feeAmount,
                'proposaler': this.apiKey,
                'expiration_time': datetime,
                'proposed_ops': [{
                    'op': [4, operation],
                }],
            };
            fatty = {
                'timestamp': datetime,
                'expiration': expirationDatetime,
                'operations': [
                    [
                        operationId,
                        middle,
                    ],
                ],
                'validate_type': 0,
                'dapp': dappId,
                'signatures': [
                    mySignature,
                ],
            };
            if (chainTypeString === 'eos') {
                request = {
                    'chainType': chainId,
                    'toExternalAddress': 'noneed',
                    'trObj': this.json (fatty),
                    'chainContractAddress': chainContractAddress,
                };
            } else {
                request = {
                    'chainType': chainId,
                    'toExternalAddress': address,
                    'trObj': this.json (fatty),
                    'chainContractAddress': chainContractAddress,
                };
            }
        }
        const response = await this.publicPostTransactionWithdraw (request);
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        url += '/' + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 503) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const status = this.safeString (response, 'code');
            if (status === '1') {
                const message = this.safeString (response, 'msg');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
