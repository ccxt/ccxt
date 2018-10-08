'use strict';

const { flatten } = require('lodash');
const { BigNumber } = require('@0xproject/utils');
const { Web3Wrapper } = require('@0xproject/web3-wrapper');

const Exchange = require('./base/Exchange');
const StandardRelayerV2 = require('./base/StandardRelayerV2');
const TokenInfo = require('./base/TokenInfo');

module.exports = class ercdex extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            id: 'ercdex2',
            name: 'ERC dEX',
            countries: 'USA',
            version: undefined,
            userAgent: undefined,
            rateLimit: 1000,
            urls: {
                logo: 'https://raw.githubusercontent.com/0xProject/0x-relayer-registry/master/images/logos/ercdex.png',
                api: 'https://app.ercdex.com/api/v2',
                www: 'https://ercdex.com',
                doc: [
                    'https://0xproject.com/docs/connect',
                    'https://docs.ercdex.com',
                ],
            },
            has: {
                createOrder: false,
                createMarketOrder: false,
                createLimitOrder: false,
                fetchBalance: false,
                fetchCurrencies: false,
                fetchL2OrderBook: false,
                fetchMarkets: true,
                fetchOrderBook: true,
                fetchTicker: false,
                fetchTrades: false,
                privateAPI: false,
            },
            api: {
                public: {
                    get: [
                        'asset_pairs',
                        'orderbook',
                    ],
                },
            },
            perPage: 99,
        });
    }

    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.url(path, params);
        const url = this.urls['api'] + '/' + request;
        return {
            url,
            method,
            body,
            headers,
        };
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        const baseAssetData = StandardRelayerV2.encodeTokenInfo(baseSymbol);
        const quoteAssetData = StandardRelayerV2.encodeTokenInfo(quoteSymbol);
        const firstResponse = await this.publicGetOrderbook({
            baseAssetData,
            quoteAssetData,
        });
        const { total, perPage } = firstResponse;
        const pagesNeeded = Math.ceil(total / perPage);

        const promises = [];
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(this.publicGetOrderbook({
                baseAssetData,
                quoteAssetData,
                page,
            }));
        }
        const resolved = await Promise.all(promises);
        resolved.unshift(firstResponse);

        const bids = resolved.reduce(((acc, current) => acc.concat(current.bids.records)), []);
        const asks = resolved.reduce(((acc, current) => acc.concat(current.asks.records)), []);

        const one = new BigNumber(1);
        const baseInfo = TokenInfo.getFromSymbol(baseSymbol);
        const quoteInfo = TokenInfo.getFromSymbol(quoteSymbol);

        const formattedBids = bids.map((record) => {
            const { order } = record;
            const makerAmount = new BigNumber(order.makerAssetAmount);
            const takerAmount = new BigNumber(order.takerAssetAmount);
            const makerUnit = Web3Wrapper.toUnitAmount(makerAmount, quoteInfo.decimals);
            const takerUnit = Web3Wrapper.toUnitAmount(takerAmount, baseInfo.decimals);
            const rate = makerUnit.div(takerUnit);
            return [rate.toNumber(), takerUnit.toNumber(), order];
        });
        const formattedAsks = asks.map((record) => {
            const { order } = record;
            const makerAmount = new BigNumber(order.makerAssetAmount);
            const takerAmount = new BigNumber(order.takerAssetAmount);
            const makerUnit = Web3Wrapper.toUnitAmount(makerAmount, baseInfo.decimals);
            const takerUnit = Web3Wrapper.toUnitAmount(takerAmount, quoteInfo.decimals);
            const rate = makerUnit.div(takerUnit);
            return [one.div(rate).toNumber(), makerUnit.toNumber(), order];
        });
        const now = new Date();
        return {
            timestamp: now.getTime(),
            datetime: now.toISOString(),
            nonce: undefined,
            bids: formattedBids,
            asks: formattedAsks,
        };
    }

    async fetchMarkets() {
        const firstResponse = await this.publicGetAssetPairs();
        const { total, perPage } = firstResponse;
        const pagesNeeded = Math.ceil(total / perPage);

        const promises = [];
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(this.publicGetAssetPairs({ page }));
        }
        const resolved = await Promise.all(promises);
        resolved.unshift(firstResponse);
        const records = flatten(resolved.map(entry => entry.records));

        const markets = [];
        for (let i = 0, len = records.length; i < len; i++) {
            const record = records[i];
            const { assetDataA, assetDataB } = record;
            // create markets for both
            const symbolA = assetDataA.symbol;
            const symbolB = assetDataB.symbol;
            const marketOne = `${symbolA}/${symbolB}`;
            markets.push({
                id: marketOne,
                symbol: marketOne,
                base: symbolA,
                quote: symbolB,
                active: true,
                info: {
                    baseInfo: assetDataA,
                    quoteInfo: assetDataB,
                },
            });
            const marketTwo = `${symbolB}/${symbolA}`;
            markets.push({
                id: marketTwo,
                symbol: marketTwo,
                base: symbolB,
                quote: symbolA,
                active: true,
                info: {
                    baseInfo: assetDataB,
                    quoteInfo: assetDataA,
                },
            });
        }
        return markets;
    }
};
