//  ---------------------------------------------------------------------------
import okx from './okx.js';
// ---------------------------------------------------------------------------
export default class okxus extends okx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okxus',
            'name': 'OKX (US)',
            'hostname': 'us.okx.com',
            'urls': {
                'api': {
                    'rest': 'https://{hostname}',
                    'ws': 'wss://wsus.okx.com:8443/ws/v5',
                },
                'www': 'https://app.okx.com',
                'doc': 'https://app.okx.com/docs-v5/en/#overview',
                'fees': 'https://app.okx.com/pages/products/fees.html',
                'referral': {
                    'url': 'https://www.app.okx.com/join/CCXT2023',
                    'discount': 0.2,
                },
                'test': {
                    'ws': 'wss://wsuspap.okx.com:8443/ws/v5',
                },
            },
            'has': {
                'swap': false,
                'future': false,
                'option': false,
            },
        });
    }
}
