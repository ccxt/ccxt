
// AUTO_TRANSPILE_ENABLED

import testNumber from './test.number.js';
import testDatetime from './test.datetime.js';
import testCryptography from './test.cryptography.js';
import testExtend from './test.extend.js';
import testDeepExtend from './test.deepExtend.js';
import testLanguageSpecific from './language_specific/test.languageSpecific.js';
import testSafeMethods from './test.safeMethods.js';
// import testJson from './test.json.js';
import testSortBy from './test.sortBy.js';
import testSum from './test.sum.js';
import testOmit from './test.omit.js';
import testGroupBy from './test.groupBy.js';
import testFilterBy from './test.filterBy.js';
import testAfterConstructor from './test.afterConstructor.js';

function baseTestsInit () {
    testLanguageSpecific ();
    testAfterConstructor ();
    testExtend ();
    testDeepExtend ();
    testCryptography ();
    testDatetime ();
    testNumber ();
    testSafeMethods ();
    // testJson ();
    testSortBy ();
    testSum ();
    testOmit ();
    testGroupBy ();
    testFilterBy ();
}

export default baseTestsInit;
