
//  ---------------------------------------------------------------------------

import binance from './binance.js';
import binanceusRest from '../binanceus.js';

// ---------------------------------------------------------------------------

export default class binanceus extends binance {
    describe (): any {
        // eslint-disable-next-line new-cap
        const restInstance = new binanceusRest ();
        const restDescribe = restInstance.describe ();
        const parentWsDescribe = super.describeData ();
        const extended = this.deepExtend (restDescribe, parentWsDescribe);
        return this.deepExtend (extended, {
            'id': 'binanceus',
            'name': 'Binance US',
            'countries': [ 'US' ], // US
            'certified': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg',
                'api': {
                    'ws': {
                        'spot': 'wss://stream.binance.us:9443/ws',
                    },
                    'web': 'https://www.binance.us',
                    'sapi': 'https://api.binance.us/sapi/v1',
                    'wapi': 'https://api.binance.us/wapi/v3',
                    'public': 'https://api.binance.us/api/v3',
                    'private': 'https://api.binance.us/api/v3',
                    'v3': 'https://api.binance.us/api/v3',
                    'v1': 'https://api.binance.us/api/v1',
                },
                'www': 'https://www.binance.us',
                'referral': 'https://www.binance.us/?ref=35005074',
                'doc': 'https://github.com/binance-us/binance-official-api-docs',
                'fees': 'https://www.binance.us/en/fee/schedule',
            },
            'options': {
                'fetchCurrencies': false,
                'quoteOrderQty': false,
                'defaultType': 'spot',
                'fetchMarkets': [ 'spot' ],
            },
        });
    }
}
