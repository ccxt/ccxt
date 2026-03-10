//  ---------------------------------------------------------------------------

import kucoin from './kucoin.js';

// ---------------------------------------------------------------------------

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
            'options': {
                'fetchMarkets': {
                    'types': [ 'swap', 'future' ],
                    'fetchTickersFees': false,
                },
                'defaultType': 'swap',
                'defaultAccountType': 'contract',
            },
        });
    }
}
