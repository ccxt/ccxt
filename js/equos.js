'use strict';

//  ---------------------------------------------------------------------------

const eqonex = require ('./eqonex.js');

// ----------------------------------------------------------------------------

module.exports = class equos extends eqonex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'equos',
            'name': 'EQUOS',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/107758499-05edd180-6d38-11eb-9e09-0b69602a7a15.jpg',
            },
        });
    }
};
