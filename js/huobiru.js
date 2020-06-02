'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');

// ---------------------------------------------------------------------------

module.exports = class huobiru extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobiru',
            'name': 'Huobi Russia',
            'countries': [ 'RU' ],
            'hostname': 'www.huobi.com.ru',
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/52978816-e8552e00-33e3-11e9-98ed-845acfece834.jpg',
                'api': {
                    'market': 'https://{hostname}/api',
                    'public': 'https://{hostname}/api',
                    'private': 'https://{hostname}/api',
                    'zendesk': 'https://huobiglobal.zendesk.com/hc/en-us/articles',
                },
                'www': 'https://www.huobi.com.ru/ru-ru',
                'referral': 'https://www.huobi.com.ru/invite?invite_code=esc74',
                'doc': 'https://github.com/cloudapidoc/API_Docs_en',
                'fees': 'https://www.huobi.com.ru/ru-ru/about/fee/',
            },
        });
    }
};
