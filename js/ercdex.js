'use strict';

const { flatten } = require('lodash');
const { ErcDex } = require('@ercdex/core');
const { BigNumber } = require('@0xproject/utils');
const { Web3Wrapper } = require('@0xproject/web3-wrapper');

const Exchange = require('./base/Exchange');
const StandardRelayerV2 = require('./base/StandardRelayerV2');
const TokenInfo = require('./base/TokenInfo');

module.exports = class ercdex extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'ercdex2',
            'name': 'ERC dEX',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://pbs.twimg.com/profile_images/941139790916861953/Q7GLIM7D_400x400.jpg',
                'api': 'https://app.ercdex.com/api/v2',
                'www': 'https://ercdex.com',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://docs.ercdex.com',
                ],
            },
            'has': {
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
            },
            'api': {
                'public': {
                    'get': [
                        'asset_pairs',
                    ],
                    // 'post': [
                    //     'cancelpending',
                    //     'shift',
                    // ],
                },
            },
            'perPage': 99,
        });
    }

    constructor() {
        super();
        ErcDex.Initialize({ 'host': 'app.ercdex.com' });
    }

    // get assetPairsClient() {
    //     if (!this._assetPairsClient) {
    //         ErcDex.Initialize({ 'host': 'app.ercdex.com' });
    //         this._assetPairsClient = new ErcDex.Api.AssetPairsService();
    //     }
    //     return this._assetPairsClient;
    // }

    // {
    //     "assetDataA": {
    //         "id": 53,
    //         "dateCreated": "2018-09-23T22:27:51.667Z",
    //         "dateUpdated": "2018-09-23T22:27:51.667Z",
    //         "address": "0xd6e49800decb64c0e195f791348c1e87a5864fd7",
    //         "symbol": "RC",
    //         "name": "ReceiptCoin",
    //         "decimals": 9,
    //         "quoteable": false
    //     },
    //     "assetDataB": {
    //         "id": 1,
    //         "dateCreated": "2018-09-23T22:27:43.108Z",
    //         "dateUpdated": "2018-09-23T22:27:43.108Z",
    //         "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    //         "symbol": "WETH",
    //         "name": "Wrapped Ether",
    //         "decimals": 18,
    //         "quoteable": true
    //     },
    //     "minAmount": "571000000000",
    //     "maxAmount": "999999999999999999999999999999",
    //     "baseVolume": "0",
    //     "quoteVolume": "0",
    //     "precision": 7
    // }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        const baseAssetData = StandardRelayerV2.encodeTokenInfo(baseSymbol);
        const quoteAssetData = StandardRelayerV2.encodeTokenInfo(quoteSymbol);
        const client = new ErcDex.Api.OrdersService();
        const firstResponse = await client.getOrderbook({ baseAssetData, quoteAssetData });
        const { total, perPage } = firstResponse;
        const pagesNeeded = Math.ceil(total / perPage);

        const promises = [];
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(client.getOrderbook({
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
            'timestamp': now.getTime(),
            'datetime': now.toISOString(),
            'nonce': undefined,
            'bids': formattedBids,
            'asks': formattedAsks,
        };
    }

    async fetchMarkets() {
        const client = new ErcDex.Api.AssetPairsService();
        const firstResponse = await client.get();
        const { total, perPage } = firstResponse;
        const pagesNeeded = Math.ceil(total / perPage);

        const promises = [];
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(client.get({ page }));
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
                'id': marketOne,
                'symbol': marketOne,
                'base': symbolA,
                'quote': symbolB,
                'active': true,
                'info': {
                    'baseInfo': assetDataA,
                    'quoteInfo': assetDataB,
                },
            });
            const marketTwo = `${symbolB}/${symbolA}`;
            markets.push({
                'id': marketTwo,
                'symbol': marketTwo,
                'base': symbolB,
                'quote': symbolA,
                'active': true,
                'info': {
                    'baseInfo': assetDataB,
                    'quoteInfo': assetDataA,
                },
            });
        }
        return markets;
    }
};
