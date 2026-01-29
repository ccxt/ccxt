import Exchange from './abstract/o2exchange.js';
import type { Market, Dict } from './base/types.js';
/**
 * @class o2exchange
 * @augments Exchange
 * @description O2 Exchange - Decentralized exchange on Fuel blockchain
 */
export default class o2exchange extends Exchange {
    describe(): any;
    /**
     * @method
     * @name o2exchange#fetchMarkets
     * @description retrieves data on all markets for o2exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    sign(path: string, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
