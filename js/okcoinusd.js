'use strict';

// ---------------------------------------------------------------------------

const okcoin = require ('./okcoin.js');

// ---------------------------------------------------------------------------

module.exports = class okcoinusd extends okcoin {
    describe () {
        return this.deepExtend (super.describe (), {
            // this is a stub file that will be removed before 2020 Q2
            // it is placed here for temporary backward compatibility
            'id': 'okcoinusd',
        });
    }
};
