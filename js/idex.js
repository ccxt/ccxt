'use strict';

const Exchange = require('./base/Exchange');

module.exports = class idex extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': 'US',
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://idex.market/assets/IDEX_sf-color.svg',
                'api': 'https://api.idex.market',
                'www': 'https://idex.market',
                'doc': [
                    'https://github.com/AuroraDAO/idex-api-docs',
                ],
            },
            'has': {
                // 'createDepositAddress': false, TODO: eventually
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
                // 'withdraw': false, TODO: eventually
            },
            'api': {
                'public': {
                    'post': [
                        'returnCurrencies',
                        'returnOrderBook',
                        'returnTicker',
                    ],
                },
            },
        });
    }

    sign(path, api = 'public', method = 'POST', params = {}, headers = undefined, body = {}) {
        const url = `${this.urls['api']}/${path}`;
        headers = { 'Content-Type': 'application/json' };
        return {
            url,
            'method': method,
            'body': JSON.stringify(params),
            headers,
        };
    }

    async fetchCurrencies(params = {}) {
        const response = await this.publicPostReturnCurrencies();
        const currencies = Object.keys(response);
        const result = new Array(currencies.length);
        for (let i = 0, len = currencies.length; i < len; i++) {
            const currency = currencies[i];
            const currencyData = response[currency];
            result[i] = {
                'id': currency,
                'code': currency,
                'info': currencyData,
                'name': currencyData.name,
                'active': true,
                'status': 'ok',
                'precision': currencyData.decimals,
            };
        }
        return result;
    }

    async fetchMarkets() {
        const response = await this.publicPostReturnTicker();
        const markets = Object.keys(response);
        const result = new Array(markets.length);
        for (let i = 0, len = markets.length; i < len; i++) {
            const market = markets[i];
            const [eth, token] = market.split(('_')); // idex incorrectly lists ETH as the base in all markets
            result[i] = {
                'id': market,
                'symbol': `${token}/${eth}`,
                'base': token,
                'quote': eth,
                'active': true,
                'info': response[market],
            };
        }
        return result;
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const [base, quote] = symbol.split('/');
        const response = await this.publicPostReturnOrderBook({
            'market': `${quote}_${base}`,
        });
        const { bids, asks } = response;
        const formattedBids = new Array(bids.length);
        for (let i = 0, len = bids.length; i < len; i++) {
            const bid = bids[i];
            formattedBids[i] = [parseFloat(bid.price), parseFloat(bid.amount), bid];
        }
        const formattedAsks = new Array(asks.length);
        for (let i = 0, len = asks.length; i < len; i++) {
            const ask = asks[i];
            formattedAsks[i] = [parseFloat(ask.price), parseFloat(ask.amount), ask];
        }
        const now = new Date();
        return {
            'timestamp': now.getTime(),
            'datetime': now.toISOString(),
            'nonce': undefined,
            'bids': formattedBids,
            'asks': formattedAsks,
        };
    }
};
