// AUTO_TRANSPILE_ENABLED

import testNumber from './test.number.js';
import testDatetime from './test.datetime.js';
import testCryptography from './test.cryptography.js';
import testExtend from './test.extend.js';
import testLanguageSpecific from './test.languageSpecific.js';
import testSafeMethods from './test.safeMethods.js';
import testCalculateFee from './test.calculateFee.js';
import testAggregate from './test.aggregate.js';
import testConfig from './test.config.js';
import tesSortBy from './test.sortBy.js';

function baseTestsInit () {
    testLanguageSpecific ();
    testExtend ();
    testCryptography ();
    testDatetime ();
    testNumber ();
    testSafeMethods ();
    testCalculateFee ();
    testAggregate ();
    testConfig ();
    tesSortBy ();
}

export default baseTestsInit;
