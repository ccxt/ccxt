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
                        'createTransaction',
                        'getCurrencies',
                        'getCurrenciesFull',
                        'getExchangeAmount',
                        'getMinAmount',
                        'getStatus',
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

    // TODO: fee is included
    // calculateFee(symbol, type = undefined, side, amount = undefined, price = undefined, takerOrMaker = 'taker', params = {}) {
    //     const quote = symbol.split('/')[1];
    //     return {
    //         'included': true,
    //         'type': undefined,
    //         'currency': quote,
    //         'rate': 0.5,
    //         'cost': undefined,
    //     };
    // }

    async instantTransactionStatus(transactionId, params = {}) {
        const out = await this.publicPostGetStatus({ 'id': transactionId });
        return out.result;
    }

    async startInstantTransaction(input, output, amount = undefined, address, affiliateAPIKey, params = {}) {
        const request = {
            'from': input.toLowerCase(),
            'to': output.toLowerCase(),
            address,
            amount,
            'extraId': null,
            'refundAddress': address,
        };
        const response = await this.publicPostCreateTransaction(request);
        if (response.error) throw new Error(response.error.message);
        const { result } = response;
        return {
            'transactionId': result.id,
            'depositAddress': result.payinAddress,
            'info': response,
        };
    }

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

    async getMinimums(requests) {
        const response = await this.publicPostGetMinAmount(requests);
        return response.result;
    }

    // TODO: this hard-codes the quote to ETH for our needs. Won't bother with others for now.
    async fetchMarkets() {
        const marketsResponse = await this.publicPostGetCurrenciesFull();
        const currencies = marketsResponse.result;
        const defaultQuote = 'ETH';
        const marketsObj = {};
        const minimumRequests = [];
        for (let i = 0, len = currencies.length; i < len; i++) {
            const currency = currencies[i];
            if (!currency.enabled || currency.name === 'eth') {
                continue;
            }
            minimumRequests.push({ 'from': 'eth', 'to': currency.name });
            minimumRequests.push({ 'from': currency.name, 'to': 'eth' });

            const uppercaseName = currency.name.toUpperCase();
            const marketToEth = `${uppercaseName}/${defaultQuote}`;
            marketsObj[marketToEth] = {
                'id': marketToEth,
                'symbol': marketToEth,
                'base': uppercaseName,
                'quote': defaultQuote,
                'active': true,
                'limits': {
                    'amount': {},
                },
                'info': currency,
            };
            const marketFromEth = `${defaultQuote}/${uppercaseName}`;
            marketsObj[marketFromEth] = {
                'id': marketFromEth,
                'symbol': marketFromEth,
                'base': defaultQuote,
                'quote': uppercaseName,
                'active': true,
                'limits': {
                    'amount': {},
                },
                'info': currency,
            };
        }
        let minimumResponses = [];
        try {
            minimumResponses = await this.getMinimums(minimumRequests);
        } catch (e) {
            console.error(e);
            minimumResponses = [];
        }
        const result = [];
        for (let i = 0, len = minimumResponses.length; i < len; i++) {
            const minimum = minimumResponses[i];
            const symbol = `${minimum.from.toUpperCase()}/${minimum.to.toUpperCase()}`;
            marketsObj[symbol].limits.amount.min = minimum.minAmount;
            result.push(marketsObj[symbol]);
        }
        return result;
    }
};
