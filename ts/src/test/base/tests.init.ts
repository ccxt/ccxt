// AUTO_TRANSPILE_ENABLED

import testNumber from './test.number.js';
import testDatetime from './test.datetime.js';
import testCryptography from './test.cryptography.js';
import testExtend from './test.extend.js';
import testLanguageSpecific from './test.languageSpecific.js';

function baseTestsInit () {
    testLanguageSpecific ();
    testExtend ();
    testCryptography ();
    testDatetime ();
    testNumber ();
    console.log ('base tests passed!');
}

export default baseTestsInit;
