

import assert from 'assert';
import { ROUND, TRUNCATE, ROUND_UP, ROUND_DOWN, DECIMAL_PLACES, SIGNIFICANT_DIGITS, TICK_SIZE, NO_PADDING, PAD_WITH_ZERO } from '../../base/functions/number.js';

function testBaseConstants () {
    // assert all
    assert.strictEqual (ROUND, 1, 'ROUND should be 1');
    assert.strictEqual (TRUNCATE, 0, 'TRUNCATE should be 0');
    assert.strictEqual (ROUND_UP, 2, 'ROUND_UP should be 2');
    assert.strictEqual (ROUND_DOWN, 3, 'ROUND_DOWN should be 3');
    assert.strictEqual (DECIMAL_PLACES, 2, 'DECIMAL_PLACES should be 2');
    assert.strictEqual (SIGNIFICANT_DIGITS, 3, 'SIGNIFICANT_DIGITS should be 3');
    assert.strictEqual (TICK_SIZE, 4, 'TICK_SIZE should be 4');
    assert.strictEqual (NO_PADDING, 5, 'NO_PADDING should be 5');
    assert.strictEqual (PAD_WITH_ZERO, 6, 'PAD_WITH_ZERO should be 6');
}

export default testBaseConstants;
