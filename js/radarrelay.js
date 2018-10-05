'use strict';

const { flatten } = require('lodash');
const { assetDataUtils } = require('0x.js');
const { BigNumber } = require('@0xproject/utils');
const { rateUtils, orderParsingUtils } = require('@0xproject/order-utils');
const { Web3Wrapper } = require('@0xproject/web3-wrapper');

const Exchange = require('./base/Exchange');
const TokenInfo = require('./base/TokenInfo');

module.exports = class radarrelay extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'radarrelay',
            'name': 'Radar Relay - 0x V2',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 500,
            'urls': {
                'logo': 'https://radarrelay.com/img/radar-logo-beta.svg',
                'api': 'https://api.radarrelay.com/0x/v2',
                'www': 'https://radarrelay.com',
                'doc': [
                    'https://radarrelay.com/standard-relayer-api/',
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
                        'orderbook',
                    ],
                },
            },
        });
    }

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

    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const route = this.url(path, params);
        const url = this.urls['api'] + '/' + route;
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        const encodedBase = radarrelay.encodeTokenInfo(baseSymbol);
        const encodedQuote = radarrelay.encodeTokenInfo(quoteSymbol);
        const response = await this.publicGetOrderbook({
            'baseAssetData': encodedBase,
            'quoteAssetData': encodedQuote,
        });
        // we're not going to do pagination here...
        const { bids, asks } = response;
        const one = new BigNumber(1);
        const baseInfo = TokenInfo.getFromSymbol(baseSymbol);
        const quoteInfo = TokenInfo.getFromSymbol(quoteSymbol);
        const formattedBids = bids.records.map((record) => {
            // selling ZRX
            // taker (user) is ZRX, maker is WETH
            const order = orderParsingUtils.convertOrderStringFieldsToBigNumber(record.order);
            const rate = rateUtils.getFeeAdjustedRateOfFeeOrder(order);
            const makerPrecision = baseInfo.decimals;
            const takerUnit = Web3Wrapper.toUnitAmount(order.takerAssetAmount, makerPrecision);
            return [one.div(rate).toNumber(), takerUnit.toNumber(), order];
        });
        const formattedAsks = asks.records.map((record) => {
            const order = orderParsingUtils.convertOrderStringFieldsToBigNumber(record.order);
            const rate = rateUtils.getFeeAdjustedRateOfFeeOrder(order);
            const makerPrecision = quoteInfo.decimals;
            const makerUnit = Web3Wrapper.toUnitAmount(order.makerAssetAmount, makerPrecision);
            return [rate.toNumber(), makerUnit.toNumber(), order];
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
        const firstRequest = await this.publicGetAssetPairs();
        const { total, perPage } = firstRequest;
        const promises = [];
        const pagesNeeded = Math.ceil(total / perPage);
        for (let page = 2; page <= pagesNeeded; page++) {
            promises.push(this.publicGetAssetPairs({ page }));
        }
        const resolved = await Promise.all(promises);
        resolved.push(firstRequest);
        const records = flatten(resolved.map(response => response.records));

        // need to decode the records now
        const markets = [];
        for (let i = 0, len = records.length; i < len; i++) {
            const record = records[i];
            const { assetDataA, assetDataB } = record;
            const tokenA = radarrelay.decodeTokenInfo(assetDataA.assetData);
            const tokenB = radarrelay.decodeTokenInfo(assetDataB.assetData);
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
        this._markets_only = markets;
        return markets;
    }
};
