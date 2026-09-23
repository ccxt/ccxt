
//  ---------------------------------------------------------------------------

import bybit from './bybit.js';
import { PermissionDenied } from './base/errors.js';

//  ---------------------------------------------------------------------------

export default class bybitid extends bybit {
    override describe (): any {
        // Bybit Indonesia serves the same v5 API as the global exchange, with the
        // same product categories (spot, linear, inverse, option) but its own
        // listings and accounts, so only the identity and hostname differ here.
        return this.deepExtend (super.describe (), {
            'id': 'bybitid',
            'name': 'Bybit Indonesia',
            'countries': [ 'ID' ], // Indonesia
            'hostname': 'bybit.id',
            'certified': false,
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed',
                'www': 'https://www.bybit.id',
                'doc': [
                    'https://bybit-exchange.github.io/docs/v5/intro',
                    'https://github.com/bybit-exchange',
                ],
                'fees': 'https://help.bybit.com/hc/en-us/articles/360039261154',
                'referral': undefined,
            },
            'httpExceptions': {
                '403': PermissionDenied, // error:The Amazon CloudFront distribution is configured to block access from your country
            },
        });
    }
}
