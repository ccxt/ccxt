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
        });
    }
};
