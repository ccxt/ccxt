//  ---------------------------------------------------------------------------
import kucoin from './kucoin.js';
//  ---------------------------------------------------------------------------
export default class kucoineu extends kucoin {
    describe() {
        // the websocket connection url is negotiated through the bullet-public /
        // bullet-private REST endpoints, which already point to the EU host
        return this.deepExtend(super.describe(), {
            'id': 'kucoineu',
            'name': 'KuCoin EU',
            'countries': ['EU'], // European Union
            'hostname': 'kucoin.eu',
            'certified': false,
            'urls': {
                'api': {
                    'public': 'https://api.kucoin.eu',
                    'private': 'https://api.kucoin.eu',
                },
            },
        });
    }
}
