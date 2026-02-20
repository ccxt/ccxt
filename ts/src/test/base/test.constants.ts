

import assert from 'assert';
import { ROUND, TRUNCATE, ROUND_UP, ROUND_DOWN, DECIMAL_PLACES, SIGNIFICANT_DIGITS, TICK_SIZE, NO_PADDING, PAD_WITH_ZERO } from '../../base/functions/number.js';

function testConstants () {
    // assert all
    assert (ROUND === 1, 'ROUND should be 1');
    assert (TRUNCATE === 0, 'TRUNCATE should be 0');
    assert (ROUND_UP === 2, 'ROUND_UP should be 2');
    assert (ROUND_DOWN === 3, 'ROUND_DOWN should be 3');
    assert (DECIMAL_PLACES === 2, 'DECIMAL_PLACES should be 2');
    assert (SIGNIFICANT_DIGITS === 3, 'SIGNIFICANT_DIGITS should be 3');
    assert (TICK_SIZE === 4, 'TICK_SIZE should be 4');
    assert (NO_PADDING === 5, 'NO_PADDING should be 5');
    assert (PAD_WITH_ZERO === 6, 'PAD_WITH_ZERO should be 6');
}

export default testConstants;
