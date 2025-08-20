'use strict';

// ---------------------------------------------------------------------------

const coinsbit = require ('./coinsbit.js');

module.exports = class coinsbitin extends coinsbit {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbitin',
            'name': 'Coinsbit India',
            'countries': [ 'IN' ],
            'hostname': 'coinsbit.in',
            'urls': {
                'logo': '<<<TODO>>>',
            },
        });
    }
};
