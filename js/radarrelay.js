'use strict';

const StandardRelayer = require ('./base/StandardRelayer');

const { toUnitAmount } = require ('0x.js').ZeroEx;
const { BigNumber } = require ('@0xproject/utils');

module.exports = class radarrelay extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'radarrelay',
            'name': 'Radar Relay',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 2000,
            'urls': {
                'logo': 'https://radarrelay.com/img/radar-logo-beta.svg',
                'api': 'https://api.radarrelay.com/0x/v0/',
                'www': 'https://radarrelay.com',
                'doc': [
                    'https://radarrelay.com/standard-relayer-api/',
                ],
            },
            'has': {
                'cancelInstantTransaction': false,
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': false,
                'privateAPI': false,
                'startInstantTransaction': false,
                'ethIsWeth': true,
            },
        });
    }

    async fetchCurrencies () {
        return await StandardRelayer.tokenRegistry ();
    }

    static calculateRates (orders, isBid, decimals) {
        const orderCount = orders.length;
        const rates = new Array (orderCount);
        const one = new BigNumber (1.0);
        for (let i = 0; i < orderCount; i++) {
            const order = orders[i];
            const { makerTokenAmount, takerTokenAmount } = order;
            const rate = isBid ?
                new BigNumber (makerTokenAmount).div (new BigNumber (takerTokenAmount)) :
                one.div (new BigNumber (makerTokenAmount).div (new BigNumber (takerTokenAmount)));
            const limit = toUnitAmount (new BigNumber (takerTokenAmount), decimals);
            rates[i] = [rate.toString (), limit.toString (), order];
        }
        return rates;
    } // TODO: figure out the rules for the limit

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await Promise.all ([this.loadMarkets (), this.fetchCurrencies ()]);
        const marketEntry = this.markets[symbol];
        const response = await this.client ().getOrderbookAsync ({
            'baseTokenAddress': marketEntry.info.tokenB.address, // ZRX, eg
            'quoteTokenAddress': marketEntry.info.tokenA.address, // WETH
        });
        const [baseSymbol, quoteSymbol] = symbol.split ('/');
        const baseDecimals = this.currencies[baseSymbol].precision;
        const quoteDecimals = this.currencies[quoteSymbol].precision;

        const { asks, bids } = response;
        const sortedBids = StandardRelayer.sortOrders (bids);
        const sortedAsks = StandardRelayer.sortOrders (asks);

        const bidRates = radarrelay.calculateRates (sortedBids, true, baseDecimals);
        const askRates = radarrelay.calculateRates (sortedAsks, false, quoteDecimals);
        return {
            'timestamp': new Date ().getTime (),
            'bids': bidRates,
            'asks': askRates,
            'info': response,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const marketEntry = this.markets[symbol];
        const orderbookResponse = await this.client ().getOrderbookAsync ({
            'baseTokenAddress': marketEntry.info.tokenA.address,
            'quoteTokenAddress': marketEntry.info.tokenB.address,
        });
        const { asks, bids } = orderbookResponse;
        const [bestAsk, bestBid] = [asks[0], bids[0]];
        const ask = bestAsk.makerTokenAmount.div (bestAsk.takerTokenAmount).toNumber ();
        const bid = bestBid.makerTokenAmount.div (bestBid.takerTokenAmount).toNumber ();
        const now = new Date ();
        return {
            'symbol': symbol,
            'info': orderbookResponse,
            'timestamp': now.getTime (),
            'datetime': now.toISOString (),
            'bid': bid,
            'bidVolume': toUnitAmount (bestBid.takerTokenAmount, marketEntry.info.tokenB.precision),
            'ask': ask,
            'askVolume': toUnitAmount (bestAsk.takerTokenAmount, marketEntry.info.tokenA.precision),
        };
    }

    async fetchMarkets () {
        return await this.tokenPairs ();
    }
};
