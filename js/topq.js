'use strict';

//  ---------------------------------------------------------------------------

const bw = require ('./bw.js');

//  ---------------------------------------------------------------------------

module.exports = class topq extends bw {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'topq',
            'countries': [ 'SG' ],
            'name': 'TOP.Q',
            'hostname': 'topliq.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/74596147-50247000-505c-11ea-9224-4fd347cfbb49.jpg',
                'api': 'https://www.{hostname}',
                'www': 'https://www.topliq.com',
                'doc': 'https://github.com/topq-exchange/api_docs_en/wiki/REST_api_reference',
                'fees': 'https://www.topliq.com/feesRate',
            },
        });
    }
};
