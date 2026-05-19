// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// temporary, these below methods are language-specific, but todo to make them transpilable
import testCamelCase from './test.camelcase.js';
import testUnCamelCase from './test.uncamelcase.js';
import testThrottle from './test.throttle.js';
import testCalculateFee from './test.calculateFee.js';
import testSafeBalance from './test.safeBalance.js';
import testLegacyHas from './test.legacyHas.js';
import testTypes from './test.type.js';
import testThrottlerPerformance from './test.throttlerPerformance.js';
import testSetRateLimit from './test.setRateLimit.js';
// todo: import testConfig from './test.config.js';
// import './test.time.js' :todo
// import './test.timeout_hang.js' :todo

async function testLanguageSpecific () {
    testCamelCase ();
    testUnCamelCase ();
    testThrottle ();
    testCalculateFee ();
    testSafeBalance ();
    testLegacyHas ();
    testTypes ();
    await testThrottlerPerformance ();
    await testSetRateLimit ();
    // testConfig ();
}

export default testLanguageSpecific;
