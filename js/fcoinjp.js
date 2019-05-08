'use strict';

// ---------------------------------------------------------------------------

const fcoin = require ('./fcoin.js');

// ---------------------------------------------------------------------------

module.exports = class fcoinjp extends fcoin {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fcoinjp',
            'name': 'FCoinJP',
            'countries': [ 'JP' ],
            'hostname': 'fcoinjp.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/54219174-08b66b00-4500-11e9-862d-f522d0fe08c6.jpg',
                'fees': 'https://fcoinjp.zendesk.com/hc/en-us/articles/360018727371',
                'www': 'https://www.fcoinjp.com',
                'referral': undefined,
            },
        });
    }
};
