// ---------------------------------------------------------------------------
import hitbtc from './hitbtc.js';
// ---------------------------------------------------------------------------
export default class bequant extends hitbtc {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bequant',
            'name': 'Bequant',
            'pro': true,
            'countries': ['MT'],
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/0583ef1f-29fe-4b7c-8189-63565a0e2867',
                'api': {
                    // v3
                    'public': 'https://api.bequant.io/api/3',
                    'private': 'https://api.bequant.io/api/3',
                },
                'www': 'https://bequant.io',
                'doc': [
                    'https://api.bequant.io/',
                ],
                'fees': [
                    'https://bequant.io/fees-and-limits',
                ],
                'referral': 'https://bequant.io/referral/dd104e3bee7634ec',
            },
        });
    }
}
