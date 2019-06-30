'use strict';

//  ---------------------------------------------------------------------------

const zb = require ('./zb.js');

//  ---------------------------------------------------------------------------

module.exports = class bitkk extends zb {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitkk',
            'name': 'bitkk',
            'comment': 'a Chinese ZB clone',
            'urls': {
                'api': {
                    'public': 'http://api.bitkk.com/data', // no https for public API
                    'private': 'https://trade.bitkk.com/api',
                },
                'www': 'https://www.bitkk.com',
                'doc': 'https://www.bitkk.com/i/developer',
                'fees': 'https://www.bitkk.com/i/rate',
            },
        });
    }
};
