// AUTO_TRANSPILE_ENABLED

import testNumber from './test.number.js';
import testDatetime from './test.datetime.js';
import testCryptography from './test.cryptography.js';
import testExtend from './test.extend.js';
import testLanguageSpecific from './test.languageSpecific.js';
import testSafeMethods from './test.safeMethods.js';
// import testJson from './test.json.js';

function baseTestsInit () {
    testLanguageSpecific ();
    testExtend ();
    testCryptography ();
    testDatetime ();
    testNumber ();
    testSafeMethods ();
    // testJson (); // remove temporarily
}

export default baseTestsInit;
