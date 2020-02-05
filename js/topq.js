'use strict';

//  ---------------------------------------------------------------------------

const bw = require ('./bw.js');

//  ---------------------------------------------------------------------------

module.exports = class topq extends bw {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'topq',
            'name': 'TOP.Q',
            'hostname': 'topliq.com',
            'urls': {
                'api': 'https://www.{hostname}',
                'www': 'https://www.topliq.com',
                'doc': 'https://github.com/topq-exchange/api_docs_en/wiki/REST_api_reference',
                'fees': 'https://www.topliq.com/feesRate',
            },
        });
    }
};
