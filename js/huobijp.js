'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');

// ---------------------------------------------------------------------------

module.exports = class huobijp extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobijp',
            'name': 'Huobi Japan',
            'countries': [ 'JP' ],
            'hostname': 'api-cloud.huobi.co.jp',
            'pro': true,
            'urls': {
                'logo': 'https://api-doc.huobi.co.jp/images/logo.png',
                'api': {
                    'market': 'https://{hostname}/api',
                    'public': 'https://{hostname}/api',
                    'private': 'https://{hostname}/api',
                    'zendesk': 'https://huobi.zendesk.com/hc/ja',
                },
                'www': 'https://www.huobi.co.jp',
                'referral': 'https://www.huobi.co.jp/register/?invite_code=Ft5vc',
                'doc': 'https://api-doc.huobi.co.jp/',
                'fees': 'https://www.huobi.co.jp/support/fee/',
            },
        });
    }
};
