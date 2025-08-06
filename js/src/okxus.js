// ---------------------------------------------------------------------------
import okx from './okx.js';
// ---------------------------------------------------------------------------
export default class okxus extends okx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okxus',
            'name': 'OKX (US)',
            'certified': false,
            'pro': true,
            'hostname': 'us.okx.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg',
                'api': {
                    'rest': 'https://{hostname}',
                },
                'www': 'https://app.okx.com',
                'doc': 'https://app.okx.com/docs-v5/en/#overview',
                'fees': 'https://app.okx.com/pages/products/fees.html',
                'referral': {
                    'url': 'https://www.app.okx.com/join/CCXT2023',
                    'discount': 0.2,
                },
                'test': {
                    'rest': 'https://{hostname}',
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
            },
            'features': {
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
        });
    }
}
