'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, InvalidOrder } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class idex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': [ 'US' ],
            'rateLimit': 1500,
            'certified': true,
            'requiresWeb3': true,
            'has': {
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchMarkets': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchTransactions': true,
                'fetchTrades': false,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchOHLCV': false,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30', // default
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'urls': {
                'test': 'https://api.idex.market',
                'logo': 'https://user-images.githubusercontent.com/1294454/63693236-3415e380-c81c-11e9-8600-ba1634f1407d.jpg',
                'api': 'https://api.idex.market',
                'www': 'https://idex.market',
                'doc': [
                    'https://docs.idex.market/',
                ],
            },
            'api': {
                'public': {
                    'post': [
                        'returnTicker',
                        'returnCurrenciesWithPairs', // undocumented
                        'returnCurrencies',
                        'return24Volume',
                        'returnBalances',
                        'returnCompleteBalances', // shows amount in orders as well as total
                        'returnDepositsWithdrawals',
                        'returnOpenOrders',
                        'returnOrderBook',
                        'returnOrderStatus',
                        'returnOrderTrades',
                        'returnTradeHistory',
                        'returnTradeHistoryMeta', // not documented
                        'returnContractAddress',
                        'returnNextNonce',
                    ],
                },
                'private': {
                    'post': [
                        'order',
                        'cancel',
                        'trade',
                        'withdraw',
                    ],
                },
            },
            'options': {
                'contractAddress': undefined,  // 0x2a0c0DBEcC7E4D658f48E01e3fA353F44050c208
                'orderNonce': undefined,
            },
            'exceptions': {
                'Invalid order signature. Please try again.': AuthenticationError,
                'You have insufficient funds to match this order. If you believe this is a mistake please refresh and try again.': InsufficientFunds,
                'Order no longer available.': InvalidOrder,
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
                'apiKey': false,
                'secret': false,
            },
        });
    }

    async fetchMarkets (params = {}) {
        // idex does not have an endpoint for markets
        // instead we generate the markets from the endpoint for currencies
        const request = {
            'includeDelisted': true,
        };
        const markets = await this.publicPostReturnCurrenciesWithPairs (this.extend (request, params));
        const currenciesById = {};
        const currencies = markets['tokens'];
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            currenciesById[currency['symbol']] = currency;
        }
        const result = [];
        const limits = {
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
        };
        const quotes = markets['pairs'];
        const keys = Object.keys (quotes);
        for (let i = 0; i < keys.length; i++) {
            const quoteId = keys[i];
            const bases = quotes[quoteId];
            const quote = this.safeCurrencyCode (quoteId);
            const quoteCurrency = currenciesById[quoteId];
            for (let j = 0; j < bases.length; j++) {
                const baseId = bases[j];
                const id = quoteId + '_' + baseId;
                const base = this.safeCurrencyCode (baseId);
                const symbol = base + '/' + quote;
                const baseCurrency = currenciesById[baseId];
                const baseAddress = baseCurrency['address'];
                const quoteAddress = quoteCurrency['address'];
                const precision = {
                    'price': this.safeInteger (quoteCurrency, 'decimals'),
                    'amount': this.safeInteger (baseCurrency, 'decimals'),
                };
                result.push ({
                    'symbol': symbol,
                    'precision': precision,
                    'base': base,
                    'quote': quote,
                    'baseId': baseAddress,
                    'quoteId': quoteAddress,
                    'limits': limits,
                    'id': id,
                    'info': baseCurrency,
                    'tierBased': false,
                });
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         last: '0.0016550916',
        //         high: 'N/A',
        //         low: 'N/A',
        //         lowestAsk: '0.0016743368',
        //         highestBid: '0.001163726270773897',
        //         percentChange: '0',
        //         baseVolume: '0',
        //         quoteVolume: '0'
        //     }
        //
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const baseVolume = this.safeFloat (ticker, 'baseVolume');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'percentChange');
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicPostReturnTicker (params);
        //  { ETH_BOUNCY:
        //    { last: '0.000000004000088005',
        //      high: 'N/A',
        //      low: 'N/A',
        //      lowestAsk: '0.00000000599885995',
        //      highestBid: '0.000000001400500103',
        //      percentChange: '0',
        //      baseVolume: '0',
        //      quoteVolume: '0' },
        //   ETH_NBAI:
        //    { last: '0.0000032',
        //      high: 'N/A',
        //      low: 'N/A',
        //      lowestAsk: '0.000004000199999502',
        //      highestBid: '0.0000016002',
        //      percentChange: '0',
        //      baseVolume: '0',
        //      quoteVolume: '0' }, }
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = undefined;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const [ quoteId, baseId ] = id.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicPostReturnTicker (this.extend (request, params));
        // { last: '0.0016550916',
        //   high: 'N/A',
        //   low: 'N/A',
        //   lowestAsk: '0.0016743368',
        //   highestBid: '0.001163726270773897',
        //   percentChange: '0',
        //   baseVolume: '0',
        //   quoteVolume: '0' }
        return this.parseTicker (response, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['quote'] + '_' + market['base'];
        const request = {
            'market': id,
            'count': 100, // the default will only return one trade
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicPostReturnOrderBook (this.extend (request, params));
        //
        //     {
        //         "asks": [
        //             {
        //                 "price": "0.001675282799999",
        //                 "amount": "206.163978911921061732",
        //                 "total": "0.345382967850497906",
        //                 "orderHash": "0xfdf12c124a6a7fa4a8e1866b324da888c8e1b3ad209f5050d3a23df3397a5cb7",
        //                 "params": {
        //                     "tokenBuy": "0x0000000000000000000000000000000000000000",
        //                     "buySymbol": "ETH",
        //                     "buyPrecision": 18,
        //                     "amountBuy": "345382967850497906",
        //                     "tokenSell": "0xb98d4c97425d9908e66e53a6fdf673acca0be986",
        //                     "sellSymbol": "ABT",
        //                     "sellPrecision": 18,
        //                     "amountSell": "206163978911921061732",
        //                     "expires": 10000,
        //                     "nonce": 13489307413,
        //                     "user": "0x9e8ef79316a4a79bbf55a5f9c16b3e068fff65c6"
        //                 }
        //             }
        //         ],
        //         "bids": [
        //             {
        //                 "price": "0.001161865193232242",
        //                 "amount": "854.393661648355",
        //                 "total": "0.992690256787469029",
        //                 "orderHash": "0x2f2baaf982085e4096f9e23e376214885fa74b2939497968e92222716fc2c86d",
        //                 "params": {
        //                     "tokenBuy": "0xb98d4c97425d9908e66e53a6fdf673acca0be986",
        //                     "buySymbol": "ABT",
        //                     "buyPrecision": 18,
        //                     "amountBuy": "854393661648355000000",
        //                     "tokenSell": "0x0000000000000000000000000000000000000000",
        //                     "sellSymbol": "ETH",
        //                     "sellPrecision": 18,
        //                     "amountSell": "992690256787469029",
        //                     "expires": 10000,
        //                     "nonce": 18155189676,
        //                     "user": "0xb631284dd7b74a846af5b37766ceb1f85d53eca4"
        //                 }
        //             }
        //         ]
        //     }
        //
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseBidAsk (bidAsk, priceKey = 0, amountKey = 1) {
        const price = this.safeFloat (bidAsk, priceKey);
        const amount = this.safeFloat (bidAsk, amountKey);
        const info = bidAsk;
        return [price, amount, info];
    }

    async fetchBalance (params = {}) {
        const request = {
            'address': this.walletAddress,
        };
        const response = await this.publicPostReturnCompleteBalances (this.extend (request, params));
        //
        //     {
        //         ETH: { available: '0.0167', onOrders: '0.1533' }
        //     }
        //
        const result = {
            'info': response,
        };
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const currency = keys[i];
            const balance = response[currency];
            const code = this.safeCurrencyCode (currency);
            result[code] = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'onOrders'),
            };
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        this.checkRequiredDependencies ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === 'limit') {
            const expires = 100000;
            const contractAddress = await this.getContractAddress ();
            let tokenBuy = undefined;
            let tokenSell = undefined;
            let amountBuy = undefined;
            let amountSell = undefined;
            const quoteAmount = parseFloat (price) * parseFloat (amount);
            if (side === 'buy') {
                tokenBuy = market['baseId'];
                tokenSell = market['quoteId'];
                amountBuy = this.toWei (amount, 'ether', market['precision']['amount']);
                amountSell = this.toWei (quoteAmount, 'ether', 18);
            } else {
                tokenBuy = market['quoteId'];
                tokenSell = market['baseId'];
                amountBuy = this.toWei (quoteAmount, 'ether', 18);
                amountSell = this.toWei (amount, 'ether', market['precision']['amount']);
            }
            const nonce = await this.getNonce ();
            const orderToHash = {
                'contractAddress': contractAddress,
                'tokenBuy': tokenBuy,
                'amountBuy': amountBuy,
                'tokenSell': tokenSell,
                'amountSell': amountSell,
                'expires': expires,
                'nonce': nonce,
                'address': this.walletAddress,
            };
            const orderHash = this.getIdexCreateOrderHash (orderToHash);
            const signature = this.signMessage (orderHash, this.privateKey);
            const request = {
                'tokenBuy': tokenBuy,
                'amountBuy': amountBuy,
                'tokenSell': tokenSell,
                'amountSell': amountSell,
                'address': this.walletAddress,
                'nonce': nonce,
                'expires': expires,
            };
            const response = await this.privatePostOrder (this.extend (request, signature)); // this.extend (request, params) will cause invalid signature
            // { orderNumber: 1562323021,
            //   orderHash:
            //    '0x31c42154a8421425a18d076df400d9ec1ef64d5251285384a71ba3c0ab31beb4',
            //   timestamp: 1564041428,
            //   price: '0.00073',
            //   amount: '210',
            //   total: '0.1533',
            //   type: 'buy',
            //   params:
            //    { tokenBuy: '0x763fa6806e1acf68130d2d0f0df754c93cc546b2',
            //      buyPrecision: 18,
            //      amountBuy: '210000000000000000000',
            //      tokenSell: '0x0000000000000000000000000000000000000000',
            //      sellPrecision: 18,
            //      amountSell: '153300000000000000',
            //      expires: 100000,
            //      nonce: 1,
            //      user: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1' } }
            return this.parseOrder (response, market);
        } else if (type === 'market') {
            if (!('orderHash' in params)) {
                throw new ArgumentsRequired (this.id + ' market order requires an order structure such as that in fetchOrderBook()[\'bids\'][0][2], fetchOrder()[\'info\'], or fetchOpenOrders()[0][\'info\']');
            }
            // { price: '0.000132247803328924',
            //   amount: '19980',
            //   total: '2.6423111105119',
            //   orderHash:
            //    '0x5fb3452b3d13fc013585b51c91c43a0fbe4298c211243763c49437848c274749',
            //   params:
            //    { tokenBuy: '0x0000000000000000000000000000000000000000',
            //      buySymbol: 'ETH',
            //      buyPrecision: 18,
            //      amountBuy: '2642311110511900000',
            //      tokenSell: '0xb705268213d593b8fd88d3fdeff93aff5cbdcfae',
            //      sellSymbol: 'IDEX',
            //      sellPrecision: 18,
            //      amountSell: '19980000000000000000000',
            //      expires: 10000,
            //      nonce: 1564656561510,
            //      user: '0xc3f8304270e49b8e8197bfcfd8567b83d9e4479b' } }
            const orderToSign = {
                'orderHash': params['orderHash'],
                'amount': params['params']['amountBuy'],
                'address': params['params']['user'],
                'nonce': params['params']['nonce'],
            };
            const orderHash = this.getIdexMarketOrderHash (orderToSign);
            const signature = this.signMessage (orderHash, this.privateKey);
            const signedOrder = this.extend (orderToSign, signature);
            signedOrder['address'] = this.walletAddress;
            signedOrder['nonce'] = await this.getNonce ();
            //   [ {
            //     "amount": "0.07",
            //     "date": "2017-10-13 16:25:36",
            //     "total": "0.49",
            //     "market": "ETH_DVIP",
            //     "type": "buy",
            //     "price": "7",
            //     "orderHash": "0xcfe4018c59e50e0e1964c979e6213ce5eb8c751cbc98a44251eb48a0985adc52",
            //     "uuid": "250d51a0-b033-11e7-9984-a9ab79bb8f35"
            //   } ]
            const response = await this.privatePostTrade (signedOrder);
            return this.parseOrders (response, market);
        }
    }

    async getNonce () {
        if (this.options['orderNonce'] === undefined) {
            const response = await this.publicPostReturnNextNonce ({
                'address': this.walletAddress,
            });
            return this.safeInteger (response, 'nonce');
        } else {
            const result = this.options['orderNonce'];
            this.options['orderNonce'] = this.sum (this.options['orderNonce'], 1);
            return result;
        }
    }

    async getContractAddress () {
        if (this.options['contractAddress'] !== undefined) {
            return this.options['contractAddress'];
        }
        const response = await this.publicPostReturnContractAddress ();
        this.options['contractAddress'] = this.safeString (response, 'address');
        return this.options['contractAddress'];
    }

    async cancelOrder (orderId, symbol = undefined, params = {}) {
        const nonce = await this.getNonce ();
        const orderToHash = {
            'orderHash': orderId,
            'nonce': nonce,
        };
        const orderHash = this.getIdexCancelOrderHash (orderToHash);
        const signature = this.signMessage (orderHash, this.privateKey);
        const request = {
            'orderHash': orderId,
            'address': this.walletAddress,
            'nonce': nonce,
        };
        const response = await this.privatePostCancel (this.extend (request, signature));
        // { success: 1 }
        if ('success' in response) {
            return {
                'info': response,
            };
        } else {
            throw new ExchangeError (this.id + ' cancel order failed ' + this.json (response));
        }
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'address': this.walletAddress,
        };
        if (since !== undefined) {
            request['start'] = parseInt (Math.floor (since / 1000));
        }
        const response = await this.publicPostReturnDepositsWithdrawals (this.extend (request, params));
        // { deposits:
        //    [ { currency: 'ETH',
        //        amount: '0.05',
        //        timestamp: 1563953513,
        //        transactionHash:
        //         '0xd6eefd81c7efc9beeb35b924d6db3c93a78bf7eac082ba87e107ad4e94bccdcf',
        //        depositNumber: 1586430 },
        //      { currency: 'ETH',
        //        amount: '0.12',
        //        timestamp: 1564040359,
        //        transactionHash:
        //         '0x2ecbb3ab72b6f79fc7a9058c39dce28f913152748c1507d13ab1759e965da3ca',
        //        depositNumber: 1587341 } ],
        //   withdrawals:
        //    [ { currency: 'ETH',
        //        amount: '0.149',
        //        timestamp: 1564060001,
        //        transactionHash:
        //         '0xab555fc301779dd92fd41ccd143b1d72776ae7b5acfc59ca44a1d376f68fda15',
        //        withdrawalNumber: 1444070,
        //        status: 'COMPLETE' } ] }
        const deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        const withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        return this.arrayConcat (deposits, withdrawals);
    }

    parseTransaction (item, currency = undefined) {
        // { currency: 'ETH',
        //   amount: '0.05',
        //   timestamp: 1563953513,
        //   transactionHash:
        //    '0xd6eefd81c7efc9beeb35b924d6db3c93a78bf7eac082ba87e107ad4e94bccdcf',
        //   depositNumber: 1586430 }
        const amount = this.safeFloat (item, 'amount');
        const timestamp = this.safeTimestamp (item, 'timestamp');
        const txhash = this.safeString (item, 'transactionHash');
        let id = undefined;
        let type = undefined;
        let status = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if ('depositNumber' in item) {
            id = this.safeString (item, 'depositNumber');
            type = 'deposit';
            addressFrom = this.walletAddress;
            addressTo = this.options['contractAddress'];
        } else if ('withdrawalNumber' in item) {
            id = this.safeString (item, 'withdrawalNumber');
            type = 'withdrawal';
            status = this.parseTransactionStatus (this.safeString (item, 'status'));
            addressFrom = this.options['contractAddress'];
            addressTo = this.walletAddress;
        }
        const code = this.safeCurrencyCode (this.safeString (item, 'currency'));
        return {
            'info': item,
            'id': id,
            'txid': txhash,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'status': status,
            'type': type,
            'updated': undefined,
            'comment': undefined,
            'addressFrom': addressFrom,
            'tagFrom': undefined,
            'addressTo': addressTo,
            'tagTo': undefined,
            'fee': {
                'currency': code,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
        };
        return this.safeString (statuses, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a walletAddress');
        }
        await this.loadMarkets ();
        const request = {
            'address': this.walletAddress,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.publicPostReturnOpenOrders (this.extend (request, params));
        // [ { timestamp: 1564041428,
        //     orderHash:
        //      '0x31c42154a8421425a18d076df400d9ec1ef64d5251285384a71ba3c0ab31beb4',
        //     orderNumber: 1562323021,
        //     market: 'ETH_LIT',
        //     type: 'buy',
        //     params:
        //      { tokenBuy: '0x763fa6806e1acf68130d2d0f0df754c93cc546b2',
        //        buySymbol: 'LIT',
        //        buyPrecision: 18,
        //        amountBuy: '210000000000000000000',
        //        tokenSell: '0x0000000000000000000000000000000000000000',
        //        sellSymbol: 'ETH',
        //        sellPrecision: 18,
        //        amountSell: '153300000000000000',
        //        expires: 100000,
        //        nonce: 1,
        //        user: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1' },
        //     price: '0.00073',
        //     amount: '210',
        //     status: 'open',
        //     total: '0.1533' } ]
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'orderHash': id,
        };
        const response = await this.publicPostReturnOrderStatus (this.extend (request, params));
        // { filled: '0',
        //   initialAmount: '210',
        //   timestamp: 1564041428,
        //   orderHash:
        //    '0x31c42154a8421425a18d076df400d9ec1ef64d5251285384a71ba3c0ab31beb4',
        //   orderNumber: 1562323021,
        //   market: 'ETH_LIT',
        //   type: 'buy',
        //   params:
        //    { tokenBuy: '0x763fa6806e1acf68130d2d0f0df754c93cc546b2',
        //      buySymbol: 'LIT',
        //      buyPrecision: 18,
        //      amountBuy: '210000000000000000000',
        //      tokenSell: '0x0000000000000000000000000000000000000000',
        //      sellSymbol: 'ETH',
        //      sellPrecision: 18,
        //      amountSell: '153300000000000000',
        //      expires: 100000,
        //      nonce: 1,
        //      user: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1' },
        //   price: '0.00073',
        //   amount: '210',
        //   status: 'open',
        //   total: '0.1533' }
        return this.parseOrder (response, market);
    }

    parseOrder (order, market = undefined) {
        // { filled: '0',
        //   initialAmount: '210',
        //   timestamp: 1564041428,
        //   orderHash:
        //    '0x31c42154a8421425a18d076df400d9ec1ef64d5251285384a71ba3c0ab31beb4',
        //   orderNumber: 1562323021,
        //   market: 'ETH_LIT',
        //   type: 'buy',
        //   params:
        //    { tokenBuy: '0x763fa6806e1acf68130d2d0f0df754c93cc546b2',
        //      buySymbol: 'LIT',
        //      buyPrecision: 18,
        //      amountBuy: '210000000000000000000',
        //      tokenSell: '0x0000000000000000000000000000000000000000',
        //      sellSymbol: 'ETH',
        //      sellPrecision: 18,
        //      amountSell: '153300000000000000',
        //      expires: 100000,
        //      nonce: 1,
        //      user: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1' },
        //   price: '0.00073',
        //   amount: '210',
        //   status: 'open',
        //   total: '0.1533' }
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const side = this.safeString (order, 'type');
        let symbol = undefined;
        let amount = undefined;
        let remaining = undefined;
        if ('initialAmount' in order) {
            amount = this.safeFloat (order, 'initialAmount');
            remaining = this.safeFloat (order, 'amount');
        } else {
            amount = this.safeFloat (order, 'amount');
        }
        const filled = this.safeFloat (order, 'filled');
        const cost = this.safeFloat (order, 'total');
        const price = this.safeFloat (order, 'price');
        if ('market' in order) {
            const marketId = order['market'];
            symbol = this.markets_by_id[marketId]['symbol'];
        } else if ((side !== undefined) && ('params' in order)) {
            const params = order['params'];
            const buy = this.safeCurrencyCode (this.safeString (params, 'tokenBuy'));
            const sell = this.safeCurrencyCode (this.safeString (params, 'tokenSell'));
            if (buy !== undefined && sell !== undefined) {
                symbol = (side === 'buy') ? (buy + '/' + sell) : (sell + '/' + buy);
            }
        }
        if (symbol === undefined && market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'orderHash');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        return {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': side,
            'amount': amount,
            'price': price,
            'type': 'limit',
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'status': status,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a walletAddress');
        }
        await this.loadMarkets ();
        const request = {
            'address': this.walletAddress,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['start'] = parseInt (Math.floor (limit));
        }
        const response = await this.publicPostReturnTradeHistory (this.extend (request, params));
        // { ETH_IDEX:
        //    [ { type: 'buy',
        //        date: '2019-07-25 11:24:41',
        //        amount: '347.833140025692348611',
        //        total: '0.050998794333719943',
        //        uuid: 'cbdff960-aece-11e9-b566-c5d69c3be671',
        //        tid: 4320867,
        //        timestamp: 1564053881,
        //        price: '0.000146618560640751',
        //        taker: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1',
        //        maker: '0x1a961bc2e0d619d101f5f92a6be752132d7606e6',
        //        orderHash:
        //         '0xbec6485613a15be619c04c1425e8e821ebae42b88fa95ac4dfe8ba2beb363ee4',
        //        transactionHash:
        //         '0xf094e07b329ac8046e8f34db358415863c41daa36765c05516f4cf4f5b403ad1',
        //        tokenBuy: '0x0000000000000000000000000000000000000000',
        //        buyerFee: '0.695666280051384697',
        //        gasFee: '28.986780264563232993',
        //        sellerFee: '0.00005099879433372',
        //        tokenSell: '0xb705268213d593b8fd88d3fdeff93aff5cbdcfae',
        //        usdValue: '11.336926687304238214' } ] }
        //
        // if a symbol is specified in the request:
        //
        //    [ { type: 'buy',
        //        date: '2019-07-25 11:24:41',
        //        amount: '347.833140025692348611',
        //        total: '0.050998794333719943',
        //        uuid: 'cbdff960-aece-11e9-b566-c5d69c3be671',
        //        tid: 4320867,
        //        timestamp: 1564053881,
        //        price: '0.000146618560640751',
        //        taker: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1',
        //        maker: '0x1a961bc2e0d619d101f5f92a6be752132d7606e6',
        //        orderHash:
        //         '0xbec6485613a15be619c04c1425e8e821ebae42b88fa95ac4dfe8ba2beb363ee4',
        //        transactionHash:
        //         '0xf094e07b329ac8046e8f34db358415863c41daa36765c05516f4cf4f5b403ad1',
        //        tokenBuy: '0x0000000000000000000000000000000000000000',
        //        buyerFee: '0.695666280051384697',
        //        gasFee: '28.986780264563232993',
        //        sellerFee: '0.00005099879433372',
        //        tokenSell: '0xb705268213d593b8fd88d3fdeff93aff5cbdcfae',
        //        usdValue: '11.336926687304238214' } ]
        if (Array.isArray (response)) {
            return this.parseTrades (response, market, since, limit);
        } else {
            let result = [];
            const marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const trades = response[marketId];
                const parsed = this.parseTrades (trades, market, since, limit);
                result = this.arrayConcat (result, parsed);
            }
            return result;
        }
    }

    parseTrade (trade, market = undefined) {
        // { type: 'buy',
        //   date: '2019-07-25 11:24:41',
        //   amount: '347.833140025692348611',
        //   total: '0.050998794333719943',
        //   uuid: 'cbdff960-aece-11e9-b566-c5d69c3be671',
        //   tid: 4320867,
        //   timestamp: 1564053881,
        //   price: '0.000146618560640751',
        //   taker: '0x0ab991497116f7f5532a4c2f4f7b1784488628e1',
        //   maker: '0x1a961bc2e0d619d101f5f92a6be752132d7606e6',
        //   orderHash:
        //    '0xbec6485613a15be619c04c1425e8e821ebae42b88fa95ac4dfe8ba2beb363ee4',
        //   transactionHash:
        //    '0xf094e07b329ac8046e8f34db358415863c41daa36765c05516f4cf4f5b403ad1',
        //   tokenBuy: '0x0000000000000000000000000000000000000000',
        //   buyerFee: '0.695666280051384697',
        //   gasFee: '28.986780264563232993',
        //   sellerFee: '0.00005099879433372',
        //   tokenSell: '0xb705268213d593b8fd88d3fdeff93aff5cbdcfae',
        //   usdValue: '11.336926687304238214' }
        const side = this.safeString (trade, 'type');
        let feeCurrency = undefined;
        let symbol = undefined;
        const maker = this.safeString (trade, 'maker');
        let takerOrMaker = undefined;
        if (maker !== undefined) {
            if (maker.toLowerCase () === this.walletAddress.toLowerCase ()) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        }
        const buy = this.safeCurrencyCode (this.safeString (trade, 'tokenBuy'));
        const sell = this.safeCurrencyCode (this.safeString (trade, 'tokenSell'));
        // get ready to be mind-boggled
        let feeSide = undefined;
        if (buy !== undefined && sell !== undefined) {
            if (side === 'buy') {
                feeSide = 'buyerFee';
                if (takerOrMaker === 'maker') {
                    symbol = buy + '/' + sell;
                    feeCurrency = buy;
                } else {
                    symbol = sell + '/' + buy;
                    feeCurrency = sell;
                }
            } else {
                feeSide = 'sellerFee';
                if (takerOrMaker === 'maker') {
                    symbol = sell + '/' + buy;
                    feeCurrency = buy;
                } else {
                    symbol = buy + '/' + sell;
                    feeCurrency = sell;
                }
            }
        }
        if (symbol === undefined && market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const id = this.safeString (trade, 'tid');
        const amount = this.safeFloat (trade, 'amount');
        const price = this.safeFloat (trade, 'price');
        const cost = this.safeFloat (trade, 'total');
        let feeCost = this.safeFloat (trade, feeSide);
        if (feeCost < 0) {
            const gasFee = this.safeFloat (trade, 'gasFee');
            feeCost = this.sum (gasFee, feeCost);
        }
        const fee = {
            'currency': feeCurrency,
            'cost': feeCost,
        };
        if (feeCost !== undefined && amount !== undefined) {
            const feeCurrencyAmount = (feeCurrency === 'ETH') ? cost : amount;
            fee['rate'] = feeCost / feeCurrencyAmount;
        }
        const orderId = this.safeString (trade, 'orderHash');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'order': orderId,
            'symbol': symbol,
            'type': 'limit',
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkRequiredDependencies ();
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const tokenAddress = currency['id'];
        const nonce = await this.getNonce ();
        amount = this.toWei (amount, 'ether', currency['precision']);
        const requestToHash = {
            'contractAddress': await this.getContractAddress (),
            'token': tokenAddress,
            'amount': amount,
            'address': address,
            'nonce': nonce,
        };
        const hash = this.getIdexWithdrawHash (requestToHash);
        const signature = this.signMessage (hash, this.privateKey);
        const request = {
            'address': address,
            'amount': amount,
            'token': tokenAddress,
            'nonce': nonce,
        };
        const response = await this.privatePostWithdraw (this.extend (request, signature));
        // { amount: '0' }
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        body = this.json (params);  // all methods are POST
        const url = this.urls['api'] + '/' + path;
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers['API-Key'] = this.apiKey;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    getIdexCreateOrderHash (order) {
        return this.soliditySha3 ([
            order['contractAddress'], // address
            order['tokenBuy'], // address
            order['amountBuy'], // uint256
            order['tokenSell'], // address
            order['amountSell'], // uint256
            order['expires'], // uint256
            order['nonce'], // uint256
            order['address'], // address
        ]);
    }

    getIdexCancelOrderHash (order) {
        return this.soliditySha3 ([
            order['orderHash'], // address
            order['nonce'], // uint256
        ]);
    }

    getIdexMarketOrderHash (order) {
        return this.soliditySha3 ([
            order['orderHash'], // address
            order['amount'], // uint256
            order['address'], // address
            order['nonce'], // uint256
        ]);
    }

    getIdexWithdrawHash (request) {
        return this.soliditySha3 ([
            request['contractAddress'], // address
            request['token'], // uint256
            request['amount'], // uint256
            request['address'],  // address
            request['nonce'], // uint256
        ]);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ('error' in response) {
            if (response['error'] in this.exceptions) {
                throw new this.exceptions[response['error']] (this.id + ' ' + response['error']);
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
