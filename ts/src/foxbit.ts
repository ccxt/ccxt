import Exchange from './abstract/foxbit';

/**
 * @class foxbit
 * @augments Exchange
 */
export default class foxbit extends Exchange {
    decribe () {
        return this.deepExtend (super.describe (), {
            'id': 'foxbit',
        });
    }
}

