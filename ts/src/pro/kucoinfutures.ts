
//  ---------------------------------------------------------------------------

import kucoin from './kucoin.js';
import type { Balances, Dict, Strings } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class kucoinfutures extends kucoin {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'kucoinfutures',
            'name': 'KuCoin Futures',
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
                    'fetchTickersFees': false,
                },
                'defaultType': 'swap',
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

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue (response, 'data');
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'availableBalance');
        account['total'] = this.safeString (data, 'accountEquity');
        result[code] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name kucoinfutures#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-futures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.code] the unified currency code to fetch the balance for, if not provided, the default .options['fetchBalance']['code'] will be used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        // only fetches one balance at a time
        let defaultCode = this.safeString (this.options, 'code');
        const fetchBalanceOptions = this.safeValue (this.options, 'fetchBalance', {});
        defaultCode = this.safeString (fetchBalanceOptions, 'code', defaultCode);
        const code = this.safeString (params, 'code', defaultCode);
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        const response = await this.futuresPrivateGetAccountOverview (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "accountEquity": 0.00005,
        //             "unrealisedPNL": 0,
        //             "marginBalance": 0.00005,
        //             "positionMargin": 0,
        //             "orderMargin": 0,
        //             "frozenFunds": 0,
        //             "availableBalance": 0.00005,
        //             "currency": "XBT"
        //         }
        //     }
        //
        return this.parseBalance (response);
    }
}
