
// ---------------------------------------------------------------------------

import onetrading from './onetrading.js';

// ---------------------------------------------------------------------------
/**
 * @class bitpanda
 * @augments Exchange
 * @description This is the former name for exchange onetrading. Please update your code to use the onetrading exchange class
 */
export default class bitpanda extends onetrading {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitpanda',
            'name': 'Bitpanda Pro',
            'alias': true,
        });
    }
}
