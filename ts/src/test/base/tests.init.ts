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
import testSortBy from './test.sortBy.js';
import testGroupBy from './test.groupBy.js';
import testFilterBy from './test.filterBy.js';
import testOmit from './test.omit.js';
import testSum from './test.sum.js';

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
    testSortBy ();
    testGroupBy ();
    testFilterBy ();
    testOmit ();
    testSum ();
}

export default baseTestsInit;
