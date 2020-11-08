'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class southxchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'southxchange',
            'name': 'SouthXchange',
            'countries': [ 'AR' ], // Argentina
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg',
                'api': 'https://www.southxchange.com/api',
                'www': 'https://www.southxchange.com',
                'doc': 'https://www.southxchange.com/Home/Api',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'price/{symbol}',
                        'prices',
                        'book/{symbol}',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'cancelMarketOrders',
                        'cancelOrder',
                        'getOrder',
                        'generatenewaddress',
                        'listOrders',
                        'listBalances',
                        'listTransactions',
                        'placeOrder',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.3 / 100,
                },
            },
            'commonCurrencies': {
                'BHD': 'Bithold',
                'GHOST': 'GHOSTPRISM',
                'MTC': 'Marinecoin',
                'SMT': 'SmartNode',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = market[0];
            const quoteId = market[1];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const id = baseId + '/' + quoteId;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': undefined,
                'info': market,
                'precision': this.precision,
                'limits': this.limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostListBalances (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'Currency');
            const code = this.safeCurrencyCode (currencyId);
            const deposited = this.safeFloat (balance, 'Deposited');
            const unconfirmed = this.safeFloat (balance, 'Unconfirmed');
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'Available');
            account['total'] = this.sum (deposited, unconfirmed);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetBookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'BuyOrders', 'SellOrders', 'Price', 'Amount');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'Last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'Variation24Hr'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume24Hr'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetPrices (params);
        const tickers = this.indexBy (response, 'Market');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPriceSymbol (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeTimestamp (trade, 'At');
        const price = this.safeFloat (trade, 'Price');
        const amount = this.safeFloat (trade, 'Amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const side = this.safeString (trade, 'Type');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'takerOrMaker': undefined,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const status = 'open';
        const baseId = this.safeString (order, 'ListingCurrency');
        const quoteId = this.safeString (order, 'ReferenceCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const timestamp = undefined;
        const price = this.safeFloat (order, 'LimitPrice');
        const amount = this.safeFloat (order, 'OriginalAmount');
        const remaining = this.safeFloat (order, 'Amount');
        let filled = undefined;
        let cost = undefined;
        if (amount !== undefined) {
            cost = price * amount;
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
        }
        const type = 'limit';
        const side = this.safeStringLower (order, 'Type');
        const id = this.safeString (order, 'Code');
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'average': undefined,
            'trades': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostListOrders (params);
        return this.parseOrders (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'listingCurrency': market['base'],
            'referenceCurrency': market['quote'],
            'type': side,
            'amount': amount,
        };
        if (type === 'limit') {
            request['limitPrice'] = price;
        }
        const response = await this.privatePostPlaceOrder (this.extend (request, params));
        const id = JSON.parse (response);
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderCode': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGeneratenewaddress (this.extend (request, params));
        //
        // the exchange API returns a quoted-quoted-string
        //
        //     "\"0x4d43674209fcb66cc21469a6e5e52de7dd5bcd93\""
        //
        let address = response;
        if (address[0] === '"') {
            address = JSON.parse (address);
            if (address[0] === '"') {
                address = JSON.parse (address);
            }
        }
        const parts = address.split ('|');
        const numParts = parts.length;
        address = parts[0];
        this.checkAddress (address);
        let tag = undefined;
        if (numParts > 1) {
            tag = parts[1];
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['address'] = address + '|' + tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'trade': 'trade',
            'tradefee': 'fee',
            'withdraw': 'transaction',
            'deposit': 'transaction',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "Date":"2020-08-07T12:36:52.72",
        //         "CurrencyCode":"USDT",
        //         "Amount":27.614678000000000000,
        //         "TotalBalance":27.614678000000000000,
        //         "Type":"deposit",
        //         "Status":"confirmed",
        //         "Address":"0x4d43674209fcb66cc21469a6e5e52de7dd5bcd93",
        //         "Hash":"0x1809f1950c51a2f64fd2c4a27d4b06450fd249883fd91c852b79a99a124837f3",
        //         "Price":0.0,
        //         "OtherAmount":0.0,
        //         "OtherCurrency":null,
        //         "OrderCode":null,
        //         "TradeId":null,
        //         "MovementId":2732259
        //     }
        //
        const id = this.safeString (item, 'MovementId');
        let direction = undefined;
        const account = undefined;
        let referenceId = this.safeString2 (item, 'TradeId', 'OrderCode');
        referenceId = this.safeString (item, 'Hash', referenceId);
        const referenceAccount = this.safeString (item, 'Address');
        const type = this.safeString (item, 'Type');
        const ledgerEntryType = this.parseLedgerEntryType (type);
        const code = this.safeCurrencyCode (this.safeString (item, 'CurrencyCode'), currency);
        let amount = this.safeFloat (item, 'Amount');
        const after = this.safeFloat (item, 'TotalBalance');
        let before = undefined;
        if (amount !== undefined) {
            if (after !== undefined) {
                before = after - amount;
            }
            if (type === 'withdrawal') {
                direction = 'out';
            } else if (type === 'deposit') {
                direction = 'in';
            } else if ((type === 'trade') || (type === 'tradefee')) {
                direction = (amount < 0) ? 'out' : 'in';
                amount = Math.abs (amount);
            }
        }
        const timestamp = this.parse8601 (this.safeString (item, 'Date'));
        const fee = undefined;
        const status = this.safeString (item, 'Status');
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': ledgerEntryType,
            'currency': code,
            'amount': amount,
            'before': before,
            'after': after,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchLedger() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        limit = (limit === undefined) ? 50 : limit;
        const request = {
            'Currency': currency['id'],
            // 'TransactionType': 'transactions', // deposits, withdrawals, depositswithdrawals, transactions
            // 'PageIndex': 0,
            'PageSize': limit, // max 50
            'SortField': 'Date',
            // 'Descending': true,
        };
        const pageIndex = this.safeInteger (params, 'PageIndex');
        if (pageIndex === undefined) {
            request['Descending'] = true;
        }
        const response = await this.privatePostListTransactions (this.extend (request, params));
        //
        // fetchLedger ('BTC')
        //
        //     {
        //         "TotalElements":2,
        //         "Result":[
        //             {
        //                 "Date":"2020-08-07T13:06:22.117",
        //                 "CurrencyCode":"BTC",
        //                 "Amount":-0.000000301000000000,
        //                 "TotalBalance":0.000100099000000000,
        //                 "Type":"tradefee",
        //                 "Status":"confirmed",
        //                 "Address":null,
        //                 "Hash":null,
        //                 "Price":0.0,
        //                 "OtherAmount":0.0,
        //                 "OtherCurrency":null,
        //                 "OrderCode":null,
        //                 "TradeId":5298215,
        //                 "MovementId":null
        //             },
        //             {
        //                 "Date":"2020-08-07T13:06:22.117",
        //                 "CurrencyCode":"BTC",
        //                 "Amount":0.000100400000000000,
        //                 "TotalBalance":0.000100400000000000,
        //                 "Type":"trade",
        //                 "Status":"confirmed",
        //                 "Address":null,
        //                 "Hash":null,
        //                 "Price":11811.474849000000000000,
        //                 "OtherAmount":1.185872,
        //                 "OtherCurrency":"USDT",
        //                 "OrderCode":"78389610",
        //                 "TradeId":5298215,
        //                 "MovementId":null
        //             }
        //         ]
        //     }
        //
        // fetchLedger ('BTC'), same trade, other side
        //
        //     {
        //         "TotalElements":2,
        //         "Result":[
        //             {
        //                 "Date":"2020-08-07T13:06:22.133",
        //                 "CurrencyCode":"USDT",
        //                 "Amount":-1.185872000000000000,
        //                 "TotalBalance":26.428806000000000000,
        //                 "Type":"trade",
        //                 "Status":"confirmed",
        //                 "Address":null,
        //                 "Hash":null,
        //                 "Price":11811.474849000000000000,
        //                 "OtherAmount":0.000100400,
        //                 "OtherCurrency":"BTC",
        //                 "OrderCode":"78389610",
        //                 "TradeId":5298215,
        //                 "MovementId":null
        //             },
        //             {
        //                 "Date":"2020-08-07T12:36:52.72",
        //                 "CurrencyCode":"USDT",
        //                 "Amount":27.614678000000000000,
        //                 "TotalBalance":27.614678000000000000,
        //                 "Type":"deposit",
        //                 "Status":"confirmed",
        //                 "Address":"0x4d43674209fcb66cc21469a6e5e52de7dd5bcd93",
        //                 "Hash":"0x1809f1950c51a2f64fd2c4a27d4b06450fd249883fd91c852b79a99a124837f3",
        //                 "Price":0.0,
        //                 "OtherAmount":0.0,
        //                 "OtherCurrency":null,
        //                 "OrderCode":null,
        //                 "TradeId":null,
        //                 "MovementId":2732259
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'Result', []);
        return this.parseLedger (result, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'processed': 'pending',
            'confirmed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "Date":"2020-08-07T12:36:52.72",
        //         "CurrencyCode":"USDT",
        //         "Amount":27.614678000000000000,
        //         "TotalBalance":27.614678000000000000,
        //         "Type":"deposit",
        //         "Status":"confirmed",
        //         "Address":"0x4d43674209fcb66cc21469a6e5e52de7dd5bcd93",
        //         "Hash":"0x1809f1950c51a2f64fd2c4a27d4b06450fd249883fd91c852b79a99a124837f3",
        //         "Price":0.0,
        //         "OtherAmount":0.0,
        //         "OtherCurrency":null,
        //         "OrderCode":null,
        //         "TradeId":null,
        //         "MovementId":2732259
        //     }
        //
        const id = this.safeString (transaction, 'MovementId');
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString (transaction, 'Address');
        const addressTo = address;
        const addressFrom = undefined;
        const tag = undefined;
        const tagTo = tag;
        const tagFrom = undefined;
        const txid = this.safeString (transaction, 'Hash');
        const type = this.safeString (transaction, 'Type');
        const timestamp = this.parse8601 (this.safeString (transaction, 'Date'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'Status'));
        const currencyId = this.safeString (transaction, 'CurrencyCode');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': tag,
            'tagTo': tagTo,
            'tagFrom': tagFrom,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        limit = (limit === undefined) ? 50 : limit;
        const request = {
            'Currency': currency['id'],
            'TransactionType': 'depositswithdrawals', // deposits, withdrawals, depositswithdrawals, transactions
            // 'PageIndex': 0,
            'PageSize': limit, // max 50
            'SortField': 'Date',
            // 'Descending': true,
        };
        const pageIndex = this.safeInteger (params, 'PageIndex');
        if (pageIndex === undefined) {
            request['Descending'] = true;
        }
        const response = await this.privatePostListTransactions (this.extend (request, params));
        //
        //     {
        //         "TotalElements":2,
        //         "Result":[
        //             {
        //                 "Date":"2020-08-07T12:36:52.72",
        //                 "CurrencyCode":"USDT",
        //                 "Amount":27.614678000000000000,
        //                 "TotalBalance":27.614678000000000000,
        //                 "Type":"deposit",
        //                 "Status":"confirmed",
        //                 "Address":"0x4d43674209fcb66cc21469a6e5e52de7dd5bcd93",
        //                 "Hash":"0x1809f1950c51a2f64fd2c4a27d4b06450fd249883fd91c852b79a99a124837f3",
        //                 "Price":0.0,
        //                 "OtherAmount":0.0,
        //                 "OtherCurrency":null,
        //                 "OrderCode":null,
        //                 "TradeId":null,
        //                 "MovementId":2732259
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'Result', []);
        return this.parseTransactions (result, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'TransactionType': 'deposits',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'TransactionType': 'withdrawals',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, query);
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
                'Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
