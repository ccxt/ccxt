'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, AuthenticationError, DDoSProtection, BadResponse } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bytetrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bytetrade',
            'name': 'ByteTrade',
            'countries': ['HK'],
            'rateLimit': 500,
            'requiresWeb3': true,
            'certified': false,
            // new metainfo interface
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': undefined,
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
                'test': {
                    'market': 'https://api-v2-test.byte-trade.com',
                    'public': 'https://api-v2-test.byte-trade.com',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg',
                'api': {
                    'market': 'https://api-v2.bttcdn.com',
                    'public': 'https://api-v2.bttcdn.com',
                },
                'www': 'https://www.byte-trade.com',
                'doc': 'https://docs.byte-trade.com/#description',
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
                '1': 'ByteTrade',
                '44': 'ByteHub',
                '48': 'Blocktonic',
                '133': 'TerraCredit',
            },
            'exceptions': {
                'vertify error': AuthenticationError, // typo on the exchange side, 'vertify'
                'verify error': AuthenticationError, // private key signature is incorrect
                'transaction already in network': BadRequest, // same transaction submited
                'invalid argument': BadRequest,
            },
            'options': {
                'orderExpiration': 31536000000, // one year
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
            // in byte-trade.com DEX, request https://api-v2.byte-trade.com/currencies will return currencies,
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
            let maxDeposit = this.safeNumber (deposit, 'max');
            if (maxDeposit === -1.0) {
                maxDeposit = undefined;
            }
            const withdraw = this.safeValue (limits, 'withdraw');
            let maxWithdraw = this.safeNumber (withdraw, 'max');
            if (maxWithdraw === -1.0) {
                maxWithdraw = undefined;
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'precision': amountPrecision,
                'fee': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'deposit': {
                        'min': this.safeNumber (deposit, 'min'),
                        'max': maxDeposit,
                    },
                    'withdraw': {
                        'min': this.safeNumber (withdraw, 'min'),
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
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const normalBase = base.split ('@' + baseId)[0];
            let normalQuote = quote.split ('@' + quoteId)[0];
            if (quoteId === '126') {
                normalQuote = 'ZAR'; // The id 126 coin is a special coin whose name on the chain is actually ZAR, but it is changed to ZCN after creation, so it must be changed to ZAR when placing the transaction in the chain
            }
            const normalSymbol = normalBase + '/' + normalQuote;
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
                'type': 'spot',
                'spot': true,
                'active': active,
                'precision': {
                    'amount': this.safeInteger (precision, 'amount'),
                    'price': this.safeInteger (precision, 'price'),
                },
                'normalSymbol': normalSymbol,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (amount, 'min'),
                        'max': this.safeNumber (amount, 'max'),
                    },
                    'price': {
                        'min': this.safeNumber (price, 'min'),
                        'max': this.safeNumber (price, 'max'),
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
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires this.apiKey or userid argument');
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
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'used');
            result[code] = account;
        }
        return this.parseBalance (result, false);
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
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
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
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeNumber (ticker, 'weightedAvgPrice'),
            'open': this.safeNumber (ticker, 'open'),
            'close': this.safeNumber (ticker, 'close'),
            'last': this.safeNumber (ticker, 'last'),
            'previousClose': undefined, // previous day close
            'change': this.safeNumber (ticker, 'change'),
            'percentage': this.safeNumber (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
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

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.marketGetDepth (params);
        return this.parseTickers (response, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.marketGetTickers (params);
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591505760000,
        //         "242.7",
        //         "242.76",
        //         "242.69",
        //         "242.76",
        //         "0.1892"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
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
        //
        //     [
        //         [1591505760000,"242.7","242.76","242.69","242.76","0.1892"],
        //         [1591505820000,"242.77","242.83","242.7","242.72","0.6378"],
        //         [1591505880000,"242.72","242.73","242.61","242.72","0.4141"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'amount');
        const cost = this.safeNumber (trade, 'cost');
        const id = this.safeString (trade, 'id');
        const type = this.safeString (trade, 'type');
        const takerOrMaker = this.safeString (trade, 'takerOrMaker');
        const side = this.safeString (trade, 'side');
        const datetime = this.iso8601 (timestamp); // this.safeString (trade, 'datetime');
        const order = this.safeString (trade, 'order');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const feeData = this.safeValue (trade, 'fee');
        const feeCost = this.safeNumber (feeData, 'cost');
        const feeRate = this.safeNumber (feeData, 'rate');
        const feeCode = this.safeString (feeData, 'code');
        const feeCurrency = this.safeCurrencyCode (feeCode);
        const fee = {
            'currency': feeCurrency,
            'cost': feeCost,
            'rate': feeRate,
        };
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
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'filled');
        const remaining = this.safeString (order, 'remaining');
        const cost = this.safeString (order, 'cost');
        const average = this.safeString (order, 'average');
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const feeData = this.safeValue (order, 'fee');
        const feeCost = this.safeNumber (feeData, 'cost');
        const feeRate = this.safeNumber (feeData, 'rate');
        const feeCode = this.safeString (feeData, 'code');
        const feeCurrency = this.safeCurrencyCode (feeCode);
        const fee = {
            'currency': feeCurrency,
            'cost': feeCost,
            'rate': feeRate,
        };
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        this.checkRequiredDependencies ();
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('createOrder() requires this.apiKey or userid in params');
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
        const amountChain = this.toWei (amountTruncated, baseCurrency['precision']);
        const amountChainString = this.numberToString (amountChain);
        const quoteId = market['quoteId'];
        const quoteCurrency = this.currency (market['quote']);
        const priceRounded = this.priceToPrecision (symbol, price);
        const priceChain = this.toWei (priceRounded, quoteCurrency['precision']);
        const priceChainString = this.numberToString (priceChain);
        const now = this.milliseconds ();
        const expiryDelta = this.safeInteger (this.options, 'orderExpiration', 31536000000);
        const expiration = this.milliseconds () + expiryDelta;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const defaultDappId = 'Sagittarius';
        const dappId = this.safeString (params, 'dappId', defaultDappId);
        const defaultFee = this.safeString (this.options, 'fee', '300000000000000');
        const totalFeeRate = this.safeString (params, 'totalFeeRate', 8);
        const chainFeeRate = this.safeString (params, 'chainFeeRate', 1);
        const fee = this.safeString (params, 'fee', defaultFee);
        const eightBytes = Precise.stringPow ('2', '64');
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
            this.numberToLE (Precise.stringDiv (amountChainString, eightBytes, 0), 8),
            this.numberToLE (Precise.stringMod (amountChainString, eightBytes), 8),
            this.numberToLE (Precise.stringDiv (priceChainString, eightBytes, 0), 8),
            this.numberToLE (Precise.stringMod (priceChainString, eightBytes), 8),
            this.numberToLE (0, 2),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (parseInt (chainFeeRate), 2),
            this.numberToLE (1, 1),
            this.numberToLE (parseInt (totalFeeRate), 2),
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
            this.numberToLE (Precise.stringDiv (amountChainString, eightBytes, 0), 8),
            this.numberToLE (Precise.stringMod (amountChainString, eightBytes), 8),
            this.numberToLE (Precise.stringDiv (priceChainString, eightBytes, 0), 8),
            this.numberToLE (Precise.stringMod (priceChainString, eightBytes), 8),
            this.numberToLE (0, 2),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (parseInt (chainFeeRate), 2),
            this.numberToLE (1, 1),
            this.numberToLE (parseInt (totalFeeRate), 2),
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
        const recoveryParam = this.binaryToBase16 (this.numberToLE (this.sum (signature['v'], 31), 1));
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
            'custom_no_btt_fee_rate': parseInt (totalFeeRate),
            'custom_btt_fee_rate': parseInt (chainFeeRate),
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
        const statusCode = this.safeString (response, 'code');
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
            'clientOrderId': undefined,
            'average': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchOrder() requires this.apiKey or userid argument');
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
            throw new ArgumentsRequired ('fetchOpenOrders() requires this.apiKey or userid argument');
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
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetOrdersOpen (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchClosedOrders() requires this.apiKey or userid argument');
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
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetOrdersClosed (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchOrders() requires this.apiKey or userid argument');
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
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetOrdersAll (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('cancelOrder() requires hasAlreadyAuthenticatedSuccessfully');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
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
        const recoveryParam = this.binaryToBase16 (this.numberToLE (this.sum (signature['v'], 31), 1));
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
        const statusCode = this.safeString (response, 'code');
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
            'clientOrderId': undefined,
            'average': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchMyTrades() requires this.apiKey or userid argument');
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
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetOrdersTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits() requires this.apiKey or userid argument');
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
            throw new ArgumentsRequired ('fetchWithdrawals() requires this.apiKey or userid argument');
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
        const amount = this.safeNumber (transaction, 'amount');
        const feeInfo = this.safeValue (transaction, 'fee');
        const feeCost = this.safeNumber (feeInfo, 'cost');
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
            throw new ArgumentsRequired ('fetchDepositAddress() requires this.apiKey or userid argument');
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
            'network': chainType,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
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
