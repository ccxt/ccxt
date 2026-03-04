
//  ---------------------------------------------------------------------------

import kucoin from './kucoin.js';
import type { Strings } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class kucoinfutures extends kucoin {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'kucoinfutures',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg',
                'www': 'https://futures.kucoin.com/',
                'referral': 'https://futures.kucoin.com/?rcode=E5wkqe',
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': undefined,
                'fetchBidsAsks': true,

            },
            'options': {
                'fetchMarkets': {
                    'types': [ 'swap', 'future' ],
                    'fetchTickersFees': true,
                },
                'defaultType': 'contract',
                'defaultAccountType': 'contract',
                'uta': false,
            },
        });
    }

    /**
     * @method
     * @name kucoinfutures#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        const request = {
            'method': 'futuresPublicGetAllTickers',
        };
        return await this.fetchTickers (symbols, this.extend (request, params));
    }
}
