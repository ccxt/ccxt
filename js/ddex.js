'use strict';

const HydroClient = require ('@hydro-protocol/sdk').HydroClient;
const Exchange = require ('./base/Exchange');

module.exports = class ddex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ddex',
            'name': 'DDEX',
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://cdn.ddex.io/static/media/logo.941784ff.png',
                'api': 'https://api.ddex.io',
                'www': 'https://ddex.io/',
                'doc': [
                    'https://docs.ddex.io',
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
                'fetchOHLCV': false,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
            },
            // 'requiredCredentials': {
            //     'apiKey': false,
            //     'secret': false,
            // },
        });
    }

    /**
     * Instantiates and/or returns an instance of the Hydro SDK client.
     * @returns {HydroClient}
     */
    ddexAPI () {
        if (!this.hydroClient) {
            this.hydroClient = HydroClient.withoutAuth ();
        }
        return this.hydroClient;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const [baseSymbol, quoteSymbol] = symbol.split ('/');
        const orderbook = await this.ddexAPI ().getOrderbook (`${baseSymbol}-${quoteSymbol}`);
        const { bids, asks } = orderbook;

        const formattedBids = new Array (bids.length);
        for (let i = 0; i < bids.length; i++) {
            const bid = bids[i];
            formattedBids[i] = [bid.price.toString (), bid.amount.toString ()];
        }
        const formattedAsks = new Array (asks.length);
        for (let i = 0; i < asks.length; i++) {
            const ask = asks[i];
            formattedBids[i] = [ask.price.toString (), ask.amount.toString ()];
        }
        const now = new Date ();
        return {
            'timestamp': now.getTime (),
            'datetime': now.toISOString (),
            'nonce': undefined,
            'bids': formattedBids,
            'asks': formattedAsks,
        };
    }

    async fetchMarkets () {
        const markets = await this.ddexAPI ().listMarkets ();
        const numMarkets = markets.length;
        const result = new Array (numMarkets);
        for (let i = 0; i < numMarkets; i++) {
            const market = markets[i];
            const { baseToken, quoteToken } = market;
            result[i] = {
                'id': market.id,
                'symbol': `${quoteToken}/${baseToken}`, // yes I know this is the wrong way round...tell that to DDEX
                'base': quoteToken,
                'quote': baseToken,
                'active': true,
                'precision': { 'amount': 8 },
                'limits': {
                    'amount': {
                        'min': market.minOrderSize,
                        'max': market.maxOrderSize,
                    },
                },
                'info': market,
            };
        }
        return result;
    }
};
