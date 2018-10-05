'use strict';

const { HttpClient } = require('@0xproject/connect');
const { BigNumber } = require('@0xproject/utils');
const { toUnitAmount } = require('@0xproject/web3-wrapper');

const Exchange = require('./Exchange');
const TokenInfo = require('./TokenInfo');

class StandardRelayer extends Exchange {

    constructor() {
        super();
        if (this.constructor === StandardRelayer) {
            throw new TypeError('Abstract class "StandardRelayer" cannot be instantiated directly.');
        }
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
                'fetchTicker': false, // it does implement this in `ticker()`, but doesn't pass the stringent test requirements
                'fetchTrades': false,
                'privateAPI': false,
                'needsEthereumNodeEndpoint': true,
                'is0xProtocol': true
            },
            'requiredCredentials': {
                'ethereumNodeAddress': true,
            },
            'perPage': 500,
            'networkId': 1,
        });
    }

    // network clients ------------------------------------------

    client() {
        if (!this.zeroXClient) {
            this.zeroXClient = new HttpClient(this.describe()['urls']['api']);
        }
        return this.zeroXClient;
    }

    // static web3 () {
    //     if (!this.web3Client) {
    //         if (!this.ethereumNodeAddress) {
    //             throw new Error ('ethereumNodeAddress not found. Make sure to loadKeys() before using StandardRelayer subclasses');
    //         }
    //         const provider = new Web3.providers.HttpProvider (this.ethereumNodeAddress);
    //         this.web3Client = new Web3 (provider);
    //     }
    //     return this.web3Client;
    // }
    //
    // static provider () {
    //     if (!this.zeroExNetwork) {
    //         if (!this.ethereumNodeAddress) {
    //             throw new Error ('ethereumNodeAddress not found. Make sure to loadKeys() before using StandardRelayer subclasses');
    //         }
    //         const provider = new Web3.providers.HttpProvider (this.ethereumNodeAddress);
    //         this.zeroExNetwork = new ZeroEx (provider, { 'networkId': this.networkId });
    //     }
    //     return this.zeroExNetwork;
    // }

    // ccxt equivalents -----------------------------------------

    async orderbook(symbol) {
        await this.loadMarkets();
        const marketEntry = this.markets[symbol];
        if (!marketEntry) return {
            'timestamp': new Date().getTime(),
            'bids': undefined,
            'asks': undefined,
            'info': undefined,
        };
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        let baseAddress = undefined;
        let quoteAddress = undefined;
        if (TokenInfo.getFromAddress(marketEntry.info.tokenB.address).symbol === baseSymbol) {
            baseAddress = marketEntry.info.tokenB.address;
            quoteAddress = marketEntry.info.tokenA.address;
        } else {
            baseAddress = marketEntry.info.tokenA.address;
            quoteAddress = marketEntry.info.tokenB.address;
        }
        const response = await this.client().getOrderbookAsync({
            'baseTokenAddress': baseAddress,
            'quoteTokenAddress': quoteAddress,
        }, {});
        const baseDecimals = this.currencies[baseSymbol].precision;
        const quoteDecimals = this.currencies[quoteSymbol].precision;
        const { bidRates, askRates } = StandardRelayer
            .sortOrderbookResponse(response, baseDecimals, quoteDecimals);
        const now = new Date();
        return {
            'asks': askRates,
            'bids': bidRates,
            'datetime': now.toISOString(),
            'nonce': undefined,
            'timestamp': now.getTime(),
            'info': response,
        };
    }

    async ticker(symbol) {
        if (!this.currencies) {
            await Promise.all([this.loadMarkets(), this.fetchCurrencies()]);
        } else {
            await this.loadMarkets();
        }
        const marketEntry = this.markets[symbol];
        const response = await this.client().getOrderbookAsync({
            'baseTokenAddress': marketEntry.info.tokenA.address,
            'quoteTokenAddress': marketEntry.info.tokenB.address,
        });
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        const baseDecimals = this.currencies[baseSymbol].precision;
        const quoteDecimals = this.currencies[quoteSymbol].precision;
        const { bidRates, askRates } = StandardRelayer.sortOrderbookResponse(response, baseDecimals, quoteDecimals);
        const bestBid = bidRates[0];
        const bestAsk = askRates[0];
        const now = new Date();
        return {
            'symbol': symbol,
            'timestamp': now.getTime(),
            'datetime': now.toISOString(),
            'bid': bestBid[0],
            'bidVolume': bestBid[1],
            'ask': bestAsk[0],
            'askVolume': bestAsk[1],
            'info': response,
        };
    }

    async listedCurrencies() {
        const marketsResponse = await this.paginateTokenPairs();
        const currencies = new Set();
        const result = {};
        for (let i = 0; i < marketsResponse.length; i++) {
            const { tokenA, tokenB } = marketsResponse[i];
            const tokenAInfo = TokenInfo.getFromAddress(tokenA.address);
            const tokenBInfo = TokenInfo.getFromAddress(tokenB.address);
            if (!tokenAInfo || !tokenBInfo) continue;
            if (!currencies.has(tokenAInfo.symbol)) {
                result[tokenAInfo.symbol] = {
                    'id': tokenAInfo.symbol,
                    'code': tokenAInfo.symbol,
                    'info': tokenA,
                    'name': tokenAInfo.name,
                    'active': true,
                    'status': 'ok',
                    'precision': tokenAInfo.decimals,
                };
                currencies.add(tokenAInfo.symbol);
            }
            if (!currencies.has(tokenBInfo.symbol)) {
                result[tokenBInfo.symbol] = {
                    'id': tokenBInfo.symbol,
                    'code': tokenBInfo.symbol,
                    'info': tokenB,
                    'name': tokenBInfo.name,
                    'active': true,
                    'status': 'ok',
                    'precision': tokenBInfo.decimals,
                };
                currencies.add(tokenBInfo.symbol);
            }
        }
        return result;
    }

    async paginateTokenPairs() {
        let pageNumber = 1;
        let response = [];
        let nextPage = await this.client().getTokenPairsAsync({
            'page': pageNumber,
            'perPage': this.perPage
        });
        response = response.concat(nextPage);
        while (nextPage.length) {
            pageNumber++;
            nextPage = await this.client().getTokenPairsAsync({
                'page': pageNumber,
                'perPage': this.perPage
            });
            response = response.concat(nextPage);
            if (nextPage.length < this.perPage) break;
        }
        return response;
    }

    async tokenPairs() {
        const marketsResponse = await this.paginateTokenPairs();
        const result = [];
        for (let i = 0; i < marketsResponse.length; i++) {
            const market = marketsResponse[i];
            const baseInfo = TokenInfo.getFromAddress(market.tokenA.address);
            const quoteInfo = TokenInfo.getFromAddress(market.tokenB.address);
            if (!baseInfo || !quoteInfo) continue;
            const base = baseInfo.symbol;
            const quote = quoteInfo.symbol;
            const aToBSymbol = `${base}/${quote}`;
            result.push({
                'id': aToBSymbol,
                'symbol': aToBSymbol,
                base,
                quote,
                'active': true,
                'limits': {
                    'amount': {
                        'min': market.tokenA.minAmount,
                        'max': market.tokenA.maxAmount,
                    },
                },
                'info': market,
            });
            const bToASymbol = `${quote}/${base}`;
            result.push({
                'id': bToASymbol,
                'symbol': bToASymbol,
                'base': quote,
                'quote': base,
                'active': true,
                'limits': {
                    'amount': {
                        'min': market.tokenB.minAmount,
                        'max': market.tokenB.maxAmount,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    // helpers --------------------------------------------------

    static calculateRates(orders, baseDecimals, quoteDecimals, isBid) {
        const orderCount = orders.length;
        const rates = new Array(orderCount);
        const one = new BigNumber(1.0);
        for (let i = 0; i < orderCount; i++) {
            const order = orders[i];
            const { makerTokenAmount, takerTokenAmount } = order;
            const unitMaker = toUnitAmount(makerTokenAmount, baseDecimals);
            const unitTaker = toUnitAmount(takerTokenAmount, quoteDecimals);
            let rate = unitMaker.div(unitTaker);
            let limit = toUnitAmount(new BigNumber(takerTokenAmount), quoteDecimals);
            if (!isBid) {
                rate = one.div(rate);
                limit = toUnitAmount(new BigNumber(makerTokenAmount), baseDecimals);
            }
            rates[i] = [rate.toNumber(), limit.toNumber(), order];
        }
        return rates;
    }

    static sortOrders(orders) {
        return orders.sort((orderA, orderB) => {
            const orderRateA = new BigNumber(orderA.makerTokenAmount).div(new BigNumber(orderA.takerTokenAmount));
            const orderRateB = new BigNumber(orderB.makerTokenAmount).div(new BigNumber(orderB.takerTokenAmount));
            return orderRateB.comparedTo(orderRateA);
        });
    }

    static sortOrderbookResponse(response, baseDecimals, quoteDecimals) {
        const { asks, bids } = response;
        const sortedBids = StandardRelayer.sortOrders(bids);
        const sortedAsks = StandardRelayer.sortOrders(asks);
        const bidRates = StandardRelayer.calculateRates(sortedBids, quoteDecimals, baseDecimals, true);
        const askRates = StandardRelayer.calculateRates(sortedAsks, baseDecimals, quoteDecimals, false);
        return { bidRates, askRates };
    }
}

module.exports = StandardRelayer;
