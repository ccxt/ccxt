'use strict';

// ---------------------------------------------------------------------------

const okex = require ('./okex.js');

// ---------------------------------------------------------------------------

module.exports = class okex3 extends okex {
    describe () {
        return this.deepExtend (super.describe (), {
            // this is a stub file that will be removed before 2020 Q2
            // it is placed here for temporary backward compatibility
            'id': 'okex3',
        });
    }
};
