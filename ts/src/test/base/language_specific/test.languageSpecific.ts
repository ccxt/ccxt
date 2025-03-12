// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// temporary, these below methods are language-specific, but todo to make them transpilable
import testCamelCase from './test.camelcase.js';
import testUnCamelCase from './test.uncamelcase.js';
import testThrottle from './test.throttle.js';
import testCalculateFee from './test.calculateFee.js';
import testAggregate from './test.aggregate.js';
import testSafeBalance from './test.safeBalance.js';
import testLegacyHas from './test.legacyHas.js';
import testTypes from './test.type.js';
// todo: import testConfig from './test.config.js';
// import './test.time.js' :todo
// import './test.timeout_hang.js' :todo

function testLanguageSpecific () {
    testCamelCase ();
    testUnCamelCase ();
    testThrottle ();
    testCalculateFee ();
    testAggregate ();
    testSafeBalance ();
    testLegacyHas ();
    testTypes ();
    // testConfig ();
}

export default testLanguageSpecific;
