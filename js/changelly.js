'use strict';

const crypto = require('crypto');
const Exchange = require('./base/Exchange');

module.exports = class changelly extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'changelly',
            'name': 'Changelly',
            'countries': 'CHE',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://changelly.com/a052341d96320fbeab6a9d477359a9a2.svg',
                'api': 'https://api.changelly.com',
                'www': 'https://changelly.com/',
                'doc': [
                    'https://info.shapeshift.io/api',
                ],
            },
            'has': {
                'cancelInstantTransaction': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
                'startInstantTransaction': false,
            },
            'api': {
                'public': {
                    'post': [
                        'getCurrencies',
                        'getCurrenciesFull',
                        'getExchangeAmount',
                        'getMinAmount',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
        });
    }

    static signBody(msg, secret) {
        return crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(msg))
            .digest('hex');
    }

    static formRequestBody(method, params) {
        return {
            'id': Math.floor(Math.random() * Math.floor(10000)),
            'jsonrpc': '2.0',
            method,
            params,
        };
    }

    // params contains any hash you pass into an api call
    // path is the route from the describe hash
    sign(path, api = 'public', method = 'POST', params = {}, headers = undefined, body = undefined) {
        const rpcMethod = path.includes('/') ? path.split('/').shift() : path;
        const rpcBody = changelly.formRequestBody(rpcMethod, params);
        const rpcHeaders = {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
            'sign': changelly.signBody(rpcBody, this.secret),
        };
        return {
            'url': this.urls['api'],
            'method': method,
            'body': JSON.stringify(rpcBody),
            'headers': rpcHeaders,
        };
    }

    // async startInstantTransaction (symbol, side, withdrawalAddress, affiliateAPIKey, params = {}) {
    //     const [base, quote] = symbol.split ('/');
    //     const pair = side === 'buy' ?
    //         `${quote.toLowerCase ()}_${base.toLowerCase ()}` :
    //         `${base.toLowerCase ()}_${quote.toLowerCase ()}`;
    //     const request = {
    //         'withdrawal': withdrawalAddress,
    //         'pair': pair,
    //         'returnAddress': withdrawalAddress,
    //         'apiKey': affiliateAPIKey,
    //     };
    //     const response = await this.publicPostShift (this.extend (request, params));
    //     if (response.error) throw new ExchangeError (response.error);
    //     return {
    //         'transactionId': response.deposit,
    //         'depositAddress': response.deposit,
    //         'info': response,
    //     };
    // }

    // async cancelInstantTransaction (transactionId, params = {}) {
    //     const request = {
    //         'address': transactionId,
    //     };
    //     const response = await this.publicPostCancelpending (this.extend (request, params));
    //     if (response.error) throw new ExchangeError (response.error);
    //     return {
    //         'success': true,
    //         'info': response,
    //     };
    // }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const [base, quote] = symbol.split('/');
        const amount = '1.0';
        const [bid, ask] = await Promise.all([
            this.publicPostGetExchangeAmount({ 'from': base.toLowerCase(), 'to': quote.toLowerCase(), amount }),
            this.publicPostGetExchangeAmount({ 'from': quote.toLowerCase(), 'to': base.toLowerCase(), amount }),
        ]);
        const now = new Date();
        const maxAmount = Number.MAX_SAFE_INTEGER.toString();
        return {
            'timestamp': now.getTime(),
            'datetime': now.toISOString(),
            'nonce': undefined,
            'bids': [
                [parseFloat(bid.result), maxAmount],
            ],
            'asks': [
                [1.0 / parseFloat(ask.result), maxAmount],
            ],
        };
    }

    async getMinimums(currencies, defaultQuote) {
        const numCurrencies = currencies.length;
        const minimums = {};
        const toDelete = new Set(); // delete markets we can't procure a minimum for
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        for (let i = 0; i < numCurrencies; i++) {
            const currency = currencies[i];
            if (currency === defaultQuote.toLowerCase()) continue;
            const toEth = `${currency.toUpperCase()}/${defaultQuote}`;
            const fromEth = `${defaultQuote}/${currency.toUpperCase()}`;
            const paramsToEth = { 'from': currency, 'to': defaultQuote.toLowerCase() };
            const paramsFromEth = { 'from': currency, 'to': defaultQuote.toLowerCase() };
            try {
                [minimums[toEth], minimums[fromEth]] = await Promise.all([
                    this.publicPostGetMinAmount(paramsToEth).then(r => r.result),
                    this.publicPostGetMinAmount(paramsFromEth).then(r => r.result),
                ]);
            } catch (e) {
                toDelete.add(toEth);
                toDelete.add(fromEth);
            }
            await sleep(40);
        }
        let tryCount = 0;
        while (!this.markets && tryCount < 20) {
            await sleep(50);
            tryCount++;
        }
        this.setMinimums(minimums, toDelete);
    }

    setMinimums(minimums, toDelete) {
        const minKeys = Object.keys(minimums);
        for (let i = 0, len = minKeys.length; i < len; i++) {
            const k = minKeys[i];
            if (this.markets[k])
                this.markets[k].limits.amount.min = minimums[k];
        }
        if (toDelete.size) {
            toDelete.forEach((d) => {
                if (this.markets[d]) delete this.markets[d];
            });
        }
    }

    // TODO: this hard-codes the quote to ETH for our needs. Won't bother with others for now.
    async fetchMarkets() {
        const marketsResponse = await this.publicPostGetCurrenciesFull();
        const currencies = marketsResponse.result;
        const defaultQuote = 'ETH';
        const markets = [];
        for (let i = 0, len = currencies.length; i < len; i++) {
            const currency = currencies[i];
            if (!currency.enabled || currency.name === 'eth') {
                continue;
            }
            const uppercaseName = currency.name.toUpperCase();
            const marketToEth = `${uppercaseName}/${defaultQuote}`;
            markets.push({
                'id': marketToEth,
                'symbol': marketToEth,
                'base': uppercaseName,
                'quote': defaultQuote,
                'active': true,
                'limits': {
                    'amount': {},
                },
                'info': currency,
            });
            const marketFromEth = `${defaultQuote}/${uppercaseName}`;
            markets.push({
                'id': marketFromEth,
                'symbol': marketFromEth,
                'base': defaultQuote,
                'quote': uppercaseName,
                'active': true,
                'limits': {
                    'amount': {},
                },
                'info': currency,
            });
        }
        const validCurrencies = markets.map(k => k.symbol.split('/').find(i => i !== 'ETH'));
        const unique = new Set(validCurrencies);
        this.getMinimums(Array.from(unique), defaultQuote); // run in background to stop aggressive throttling
        return markets;
    }
};
