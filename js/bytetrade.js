'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, AuthenticationError, DDoSProtection } = require ('./base/errors');
const { TRUNCATE, NO_PADDING, SIGNIFICANT_DIGITS } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bytetrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bytetrade',
            'name': 'bytetrade',
            'countries': ['HK'],
            'rateLimit': 500,
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
                'logo': 'https://user-images.githubusercontent.com/246404/60647143-9c28f880-9e6f-11e9-8b94-fbdd0d3f2c5d.png',
                'api': {
                    'market': 'https://api-v2.bytetrade.com',
                    'public': 'https://api-v2-test.bytetrade.com',
                },
                'www': 'https://www.bytetrade.com',
                'referral': '',
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
                'private': {
                    'get': [
                    ],
                    'post': [
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
                '48': 'Blocktonic',
            },
            'options': {
            },
            'exceptions': {
                'verify error': AuthenticationError,           // private key signature is incorrect
                'transaction already in network': BadRequest,   // same transaction submited
                'invalid argument': ArgumentsRequired,
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
                    'amount': {
                        'min': undefined,
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
            const base = this.safeCurrencyCode (this.safeString (market, 'baseName'));
            const quote = this.safeCurrencyCode (this.safeString (market, 'quoteName'));
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const symbol = base + '/' + quote;
            const amountMin = this.safeFloat (market['limits']['amount'], 'min');
            const amountMax = this.safeFloat (market['limits']['amount'], 'max');
            const priceMin = this.safeFloat (market['limits']['price'], 'min');
            const priceMax = this.safeFloat (market['limits']['price'], 'max');
            const precision = {
                'amount': this.safeInteger (market['precision'], 'amount'),
                'price': this.safeInteger (market['precision'], 'price'),
            };
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
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': amountMin,
                        'max': amountMax,
                    },
                    'price': {
                        'min': priceMin,
                        'max': priceMax,
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
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
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
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
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
        if (response.length > 0) {
            return this.parseTicker (response[0], market);
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
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'timestamp');
        const price = this.safeFloat2 (trade, 'price', 'price');
        const amount = this.safeFloat2 (trade, 'amount', 'amount');
        const cost = this.safeFloat2 (trade, 'cost', 'cost');
        const id = this.safeString2 (trade, 'id', 'id');
        const type = this.safeString2 (trade, 'type', 'type');
        const takerOrMaker = this.safeString2 (trade, 'takerOrMaker', 'takerOrMaker');
        const side = this.safeString2 (trade, 'side', 'side');
        const datetime = this.safeString2 (trade, 'datetime', 'datetime');
        const order = this.safeString2 (trade, 'order', 'order');
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
        const symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
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
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('createOrder requires hasAlreadyAuthenticatedSuccessfully');
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
        }
        const baseId = market['baseId'];
        const baseCurrency = this.currencies_by_id[baseId];
        const amountChainWithoutTruncate = this.toWei (amount, 'ether', baseCurrency['precision']['amount']);
        const amountTruncate = baseCurrency['precision']['amount'] - market['precision']['amount'];
        const amountChain = this.decimalToPrecision (amountChainWithoutTruncate, TRUNCATE, amountTruncate, SIGNIFICANT_DIGITS, NO_PADDING);
        const quoteId = market['quoteId'];
        const quoteCurrency = this.currencies_by_id[quoteId];
        const priceChainWithoutTruncate = this.toWei (price, 'ether', quoteCurrency['precision']['amount']);
        const priceTruncate = quoteCurrency['precision']['amount'] - market['precision']['price'];
        const priceChain = this.decimalToPrecision (priceChainWithoutTruncate, TRUNCATE, priceTruncate, SIGNIFICANT_DIGITS, NO_PADDING);
        const now = this.milliseconds ();
        const expiration = this.milliseconds ();
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const chainName = 'Sagittarius';
        const feeAmount = '300000000000000';
        const eightBytes = this.pow ('2', '64');
        const byteStringArray = [
            this.numberToBE (1, 32),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (32, 1),
            this.numberToLE (0, 8),
            this.numberToLE (feeAmount, 8),  // string for 32 bit php
            this.numberToLE (this.apiKey.length, 1),
            this.stringToBinary (this.encode (this.apiKey)),
            this.numberToLE (sideNum, 1),
            this.numberToLE (typeNum, 1),
            this.numberToLE (symbol.length, 1),
            this.stringToBinary (this.encode (symbol)),
            this.numberToLE (Math.floor (parseInt (parseFloat (this.divide (amountChain, eightBytes)))), 8),
            this.numberToLE (this.modulo (amountChain, eightBytes), 8),
            this.numberToLE (Math.floor (parseInt (parseFloat (this.divide (priceChain, eightBytes)))), 8),
            this.numberToLE (this.modulo (priceChain, eightBytes), 8),
            this.numberToLE (0, 2),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (0, 2),
            this.numberToLE (parseInt (quoteId), 4),
            this.numberToLE (parseInt (baseId), 4),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (chainName.length, 1),
            this.stringToBinary (this.encode (chainName)),
            this.numberToLE (0, 1),
        ];
        let bytestring = byteStringArray[0];
        for (let i = 1; i < byteStringArray.length; i++) {
            bytestring = this.binaryConcat (bytestring, byteStringArray[i]);
        }
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (signature['v'] + 31, 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        const operation = {
            'now': datetime,
            'expiration': expirationDatetime,
            'fee': feeAmount,
            'creator': this.apiKey,
            'side': sideNum,
            'order_type': typeNum,
            'market_name': symbol,
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
            'dapp': 'Sagittarius',
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
        let status = '';
        if (statusCode === '0') {
            status = 'submit success';
        } else {
            status = 'submit fail';
        }
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchOrder requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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
            throw new ArgumentsRequired ('fetchOpenOrders requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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
            throw new ArgumentsRequired ('fetchClosedOrders requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = { };
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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
            throw new ArgumentsRequired ('fetchOrders requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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
        const feeAmount = '300000000000000';
        const now = this.milliseconds ();
        const expiration = 0;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const chainName = 'Sagittarius';
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
            this.numberToLE (symbol.length, 1),
            this.stringToBinary (this.encode (symbol)),
            this.base16ToBinary (id),
            this.numberToLE (parseInt (quoteId), 4),
            this.numberToLE (parseInt (baseId), 4),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (chainName.length, 1),
            this.stringToBinary (this.encode (chainName)),
            this.numberToLE (0, 1),
        ];
        let bytestring = byteStringArray[0];
        for (let i = 1; i < byteStringArray.length; i++) {
            bytestring = this.binaryConcat (bytestring, byteStringArray[i]);
        }
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (signature['v'] + 31, 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        const operation = {
            'fee': feeAmount,
            'creator': this.apiKey,
            'order_id': id,
            'market_name': symbol,
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
            'dapp': 'Sagittarius',
            'signatures': [
                mySignature,
            ],
        };
        const signedTransaction = await this.signExTransactionV1 ('cancel_order', operation, this.secret);
        const request = {
            'trObj': JSON.stringify (fatty),
        };
        const response = await this.publicPostTransactionCancelorder (request);
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
            'trades': undefined,
            'fee': undefined,
        };
    }

    async transfer (code, amount, address, params = {}) {
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('transfer requires hasAlreadyAuthenticatedSuccessfully');
        }
        await this.loadMarkets ();
        const currency = this.currencies[code];
        const amountChainWithoutTruncate = this.toWei (amount, 'ether', currency['precision']['amount']);
        const amountTruncate = currency['precision']['amount'] - currency['info']['transferPrecision'];
        const amountChain = this.decimalToPrecision (amountChainWithoutTruncate, TRUNCATE, amountTruncate, SIGNIFICANT_DIGITS, NO_PADDING);
        const assetType = parseInt (currency['id']);
        const now = this.milliseconds ();
        const expiration = now;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const feeAmount = '300000000000000';
        const chainName = 'Sagittarius';
        const eightBytes = this.pow ('2', '64');
        const byteStringArray = [
            this.numberToBE (1, 32),
            this.numberToLE (Math.floor (now / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (Math.floor (expiration / 1000), 4),
            this.numberToLE (1, 1),
            this.numberToLE (0, 1),
            this.numberToLE (0, 8),
            this.numberToLE (feeAmount, 8),  // string for 32 bit php
            this.numberToLE (this.apiKey.length, 1),
            this.stringToBinary (this.encode (this.apiKey)),
            this.numberToLE (address.length, 1),
            this.stringToBinary (this.encode (address)),
            this.numberToLE (assetType, 4),
            this.numberToLE (this.divide (amountChain, eightBytes), 8),
            this.numberToLE (this.modulo (amountChain, eightBytes), 8),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (chainName.length, 1),
            this.stringToBinary (this.encode (chainName)),
            this.numberToLE (0, 1),
        ];
        let bytestring = byteStringArray[0];
        for (let i = 1; i < byteStringArray.length; i++) {
            bytestring = this.binaryConcat (bytestring, byteStringArray[i]);
        }
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (signature['v'] + 31, 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        const operation = {
            'fee': '300000000000000',
            'from': this.apiKey,
            'to': address,
            'asset_type': parseInt (currency['id']),
            'amount': amountChain.toString (),
        };
        const fatty = {
            'timestamp': datetime,
            'expiration': expirationDatetime,
            'operations': [
                [
                    0,
                    operation,
                ],
            ],
            'validate_type': 0,
            'dapp': 'Sagittarius',
            'signatures': [
                mySignature,
            ],
        };
        //const signedTransaction = await this.signExTransactionV1 ('cancel_order', operation, this.secret);
        //console.log (signedTransaction)
        const request = {
            'trObj': JSON.stringify (fatty),
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
            throw new ArgumentsRequired ('fetchMyTrades requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired ('fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        let currency = undefined;
        const request = { };
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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
            throw new ArgumentsRequired ('fetchWithdrawals requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        let currency = undefined;
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
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

    parseTransactionStatusByType (status) {
        if ((status === 'DEPOSIT_FAILED') || (status === 'FEE_SEND_FAILED') || (status === 'FEE_FAILED') || (status === 'PAY_SEND_FAILED') || (status === 'PAY_FAILED') || (status === 'BTT_FAILED') || (status === 'WITHDDRAW_FAILED') || (status === 'USER_FAILED')) {
            return 'failed';
        } else if ((status === 'FEE_EXECUED') || (status === 'PAY_EXECUED') || (status === 'WITHDDRAW_EXECUTED') || (status === 'USER_EXECUED')) {
            return 'pending';
        } else if (status === 'BTT_SUCCED') {
            return 'ok';
        } else {
            return status;
        }
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
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'));
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
            throw new ArgumentsRequired ('fetchDepositAddress requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        const currency = this.currency (code);
        const request = { };
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        request['code'] = currency['id'];
        const response = await this.publicGetDepositaddress (request);
        const address = this.safeString (response[0], 'address');
        const tag = this.safeString (response[0], 'addressTag');
        const chainType = this.safeString (response[0], 'chainType');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'chainType': chainType,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('withdraw requires hasAlreadyAuthenticatedSuccessfully');
        }
        // when deposit, first deposit to user's pixiu address, and then auto transfer to bytetrade smart contract from pixiu addreess; when withdraw, first withdraw to user's pixiu address from bytetrade smart contract, and then transfer to user address;
        const addressResponse = await this.fetchDepositAddress (code);
        const middleAddress = this.safeString (addressResponse, 'address');
        const chainTypeString = this.safeString (addressResponse, 'chainType');
        let chainType = 0;
        let operationId = undefined;
        if (code === 'ETH') {
            chainType = 1;
            operationId = 18;
        } else if (code === 'BTC') {
            chainType = 2;
            operationId = 26;
        } else if (code === 'CMT') {
            chainType = 3;
        } else if (code === 'NAKA') {
            chainType = 4;
        } else {
            throw new ExchangeError (this.id + ' ' + code + ' is not supported.');
        }
        const now = this.milliseconds ();
        const expiration = 0;
        let datetime = this.iso8601 (now);
        datetime = datetime.split ('.')[0];
        let expirationDatetime = this.iso8601 (expiration);
        expirationDatetime = expirationDatetime.split ('.')[0];
        const chainName = 'Sagittarius';
        const feeAmount = '300000000000000';
        const currency = this.currency (code);
        const coinId = currency['id'];
        const amountChain = this.toWei (amount, 'ether', currency['info']['externalPrecision']);
        const eightBytes = this.pow ('2', '64');
        const byteStringArray = [
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
            this.numberToLE (Math.floor (parseInt (parseFloat (this.divide (amountChain, eightBytes)))), 8),
            this.numberToLE (this.modulo (amountChain, eightBytes), 8),
            this.numberToLE (0, 1),
            this.numberToLE (1, 1),
            this.numberToLE (chainName.length, 1),
            this.stringToBinary (this.encode (chainName)),
            this.numberToLE (0, 1),
        ];
        let bytestring = byteStringArray[0];
        for (let i = 1; i < byteStringArray.length; i++) {
            bytestring = this.binaryConcat (bytestring, byteStringArray[i]);
        }
        const hash = this.hash (bytestring, 'sha256', 'hex');
        const signature = this.ecdsa (hash, this.secret, 'secp256k1', undefined);
        const recoveryParam = this.decode (this.binaryToBase16 (this.numberToLE (signature['v'] + 31, 1)));
        const mySignature = recoveryParam + signature['r'] + signature['s'];
        let assetFee = 0;
        const operation = {
            'fee': feeAmount,
            'from': this.apiKey,
            'to_external_address': middleAddress,
            'asset_type': parseInt (coinId),
            'amount': amountChain,
        };
        if (chainTypeString === 2) {
            assetFee = currency['info']['fee'];
            operation['asset_fee'] = assetFee;
        }
        const middle = {
            'fee': feeAmount,
            'proposaler': this.apiKey,
            'expiration_time': datetime,
            'proposed_ops': [{
                'op': [4, operation],
            }],
        };
        const fatty = {
            'timestamp': datetime,
            'expiration': expirationDatetime,
            'operations': [
                [
                    operationId,
                    middle,
                ],
            ],
            'validate_type': 0,
            'dapp': 'Sagittarius',
            'signatures': [
                mySignature,
            ],
        };
        const chainContractAddress = this.safeString (currency['info'], 'chainContractAddress');
        const request = {
            'chainType': chainType,
            'toExternalAddress': address,
            'trObj': JSON.stringify (fatty),
            'chainContractAddresss': chainContractAddress,
        };
        const response = await this.publicPostTransactionWithdraw (request); // part 1
        await this.transfer (code, amount, address); // part 2
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
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
        if ((code === 503)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const status = this.safeString (response, 'code');
            if (status === '1') {
                const msg = this.safeString (response, 'msg');
                const feedback = this.id + ' ' + this.json (response);
                const exceptions = this.exceptions;
                if (msg in exceptions) {
                    throw new exceptions[msg] (feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
