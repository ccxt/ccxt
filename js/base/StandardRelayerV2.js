'use strict';

const { flatten } = require('lodash');
const { assetDataUtils } = require('0x.js');
const { HttpClient } = require('@0xproject/connect');
const { rateUtils, orderParsingUtils } = require('@0xproject/order-utils');
const { BigNumber } = require('@0xproject/utils');
const { Web3Wrapper } = require('@0xproject/web3-wrapper');

const Exchange = require('./Exchange');
const TokenInfo = require('./TokenInfo');

module.exports = class StandardRelayerV2 extends Exchange {
    static decodeTokenInfo(assetDataHash) {
        const decoded = assetDataUtils.decodeAssetDataOrThrow(assetDataHash);
        const { tokenAddress } = decoded;
        return TokenInfo.getFromAddress(tokenAddress);
    }

    static encodeTokenInfo(tokenSymbol) {
        const info = TokenInfo.getFromSymbol(tokenSymbol);
        if (!info) return null;
        return assetDataUtils.encodeERC20AssetData(info.address);
    }

    constructor() {
        super();
        if (this.constructor === StandardRelayerV2) {
            throw new TypeError('Abstract class "StandardRelayer" cannot be instantiated directly.');
        }
    }

    sraClient() {
        if (!this._sraClient) {
            this._sraClient = new HttpClient(this.describe().urls.api);
        }
        return this._sraClient;
    }

    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'ethIsWeth': true,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTrades': false,
                'is0xProtocol': true,
                'needsEthereumNodeEndpoint': false,
                'privateAPI': false,
            },
            'perPage': 500,
            'networkId': 1,
        });
    }

    async paginateOrderbook(baseSymbol, quoteSymbol) {
        const baseAssetData = StandardRelayerV2.encodeTokenInfo(baseSymbol);
        const quoteAssetData = StandardRelayerV2.encodeTokenInfo(quoteSymbol);
        const firstResponse = await this.sraClient().getOrderbookAsync({
            baseAssetData,
            quoteAssetData,
        });
        const total = Math.max(firstResponse.bids.total, firstResponse.asks.total);
        const { perPage } = firstResponse.bids;
        const promises = [];
        const pagesNeeded = Math.ceil(total / perPage);
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(this.sraClient().getOrderbookAsync({ baseAssetData, quoteAssetData }));
        }
        const responses = await Promise.all(promises);
        responses.push(firstResponse);
        const bids = responses.reduce(((acc, current) => acc.concat(current.bids.records)), []);
        const asks = responses.reduce(((acc, current) => acc.concat(current.asks.records)), []);
        return { bids, asks }
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        const { bids, asks } = await this.paginateOrderbook(baseSymbol, quoteSymbol);

        const one = new BigNumber(1);
        const baseInfo = TokenInfo.getFromSymbol(baseSymbol);
        const quoteInfo = TokenInfo.getFromSymbol(quoteSymbol);
        const formattedBids = bids.map((record) => {
            // selling ZRX
            // taker (user) is ZRX, maker is WETH
            const order = orderParsingUtils.convertOrderStringFieldsToBigNumber(record.order);
            const { makerAssetAmount, takerAssetAmount } = order;
            const makerUnit = Web3Wrapper.toUnitAmount(makerAssetAmount, quoteInfo.decimals);
            const takerUnit = Web3Wrapper.toUnitAmount(takerAssetAmount, baseInfo.decimals);
            const rate = makerUnit.div(takerUnit);
            return [rate.toNumber(), takerUnit.toNumber(), order];
        });
        const formattedAsks = asks.map((record) => {
            const order = orderParsingUtils.convertOrderStringFieldsToBigNumber(record.order);
            const { makerAssetAmount, takerAssetAmount } = order;
            const makerUnit = Web3Wrapper.toUnitAmount(makerAssetAmount, baseInfo.decimals);
            const takerUnit = Web3Wrapper.toUnitAmount(takerAssetAmount, quoteInfo.decimals);
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
        const client = this.sraClient();
        const firstRequest = await client.getAssetPairsAsync();
        const { total, perPage } = firstRequest;
        const promises = [];
        const pagesNeeded = Math.ceil(total / perPage);
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(client.getAssetPairsAsync({ page }));
        }
        const resolved = await Promise.all(promises);
        resolved.push(firstRequest);
        const records = flatten(resolved.map(response => response.records));

        const markets = [];
        for (let i = 0, len = records.length; i < len; i++) {
            const record = records[i];
            const { assetDataA, assetDataB } = record;
            const tokenA = StandardRelayerV2.decodeTokenInfo(assetDataA.assetData);
            const tokenB = StandardRelayerV2.decodeTokenInfo(assetDataB.assetData);
            if (tokenA && tokenB) {
                // create markets for both
                const symbolA = tokenA.symbol;
                const symbolB = tokenB.symbol;
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
        }
        return markets;
    }

};
