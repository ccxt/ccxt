import testTypes from './test.type.js';
import testNumber from './test.number.js';
import testDatetime from './test.datetime.js';
import testCrypto from './test.crypto.js';
import testExtend from './test.extend.js';
import languageSpecific from './test.languageSpecific.js';

function baseTestsInit (exchange) {
    languageSpecific ();
    testExtend ();
    testCrypto ();
    testDatetime ();
    testNumber ();
    testTypes ();
    console.log ('base tests passed!');
}

export default baseTestsInit;
