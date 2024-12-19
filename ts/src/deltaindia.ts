//  ---------------------------------------------------------------------------
import delta from './delta.js';
//  ---------------------------------------------------------------------------

/**
 * The Indian version of Delta Exchange uses the same set of APIs, so we are just extending from the delta exchange.
 * We just need to update the URL section, nothing else.
 * @class deltaindia
 * @augments delta
 */
export default class deltaindia extends delta {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deltaindia',
            'name': 'Delta India Exchange',
            'countries': [ 'IN' ], // India
            'rateLimit': 300,
            'version': 'v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg',
                'test': {
                    'public': 'https://cdn-ind.testnet.deltaex.org',
                    'private': 'https://cdn-ind.testnet.deltaex.org',
                },
                'api': {
                    'public': 'https://api.india.delta.exchange',
                    'private': 'https://api.india.delta.exchange',
                },
                'www': 'https://www.delta.exchange',
                'doc': [
                    'https://docs.delta.exchange',
                ],
                'fees': 'https://www.delta.exchange/fees',
                'referral': 'https://www.delta.exchange/app/signup/?code=IULYNB',
            },
        });
    }
}