


import testDecimalToPrecision from './test.decimalToPrecision.js';
import testBinaryToBase64 from './test.binaryToBase64.js';
import testNumberToString from './test.numberToString.js';
import testPrecise from './test.precise.js';
import testDatetime from './test.datetime.js';
import testCryptography from './test.cryptography.js';
import testExtend from './test.extend.js';
import testDeepExtend from './test.deepExtend.js';
import testLanguageSpecific from './language_specific/test.languageSpecific.js';
import testSafeMethods from './test.safeMethods.js';
import testSafeTicker from './test.safeTicker.js';
import testJson from './test.json.js';
import testExtractParams from './test.extractParams.js';
import testSortBy from './test.sortBy.js';
import testSum from './test.sum.js';
import testOmit from './test.omit.js';
import testGroupBy from './test.groupBy.js';
import testIndexBy from './test.indexBy.js';
import testFilterBy from './test.filterBy.js';
import testPrecisionFromString from './test.precisionFromString.js';
import testUrlencodeBase64 from './test.urlencodeBase64.js';
import testAfterConstructor from './test.afterConstructor.js';
import testHandleMethods from './test.handleMethods.js';
import testRemoveRepeatedElementsFromArray from './test.removeRepeatedElementsFromArray.js';
import testParsePrecision from './test.parsePrecision.js';
import testArraysConcat from './test.arraysConcat.js';
import testSleep from './test.sleep.js';
import testEthMethods from './test.ethMethods.js';
import testCapitalize from './test.capitalize.js';
import testConstants from './test.constants.js';

async function baseTestsInit () {
    testLanguageSpecific ();
    testConstants ();
    testAfterConstructor ();
    testExtend ();
    testDeepExtend ();
    testCryptography ();
    testBinaryToBase64 ();
    testDatetime ();
    testDecimalToPrecision ();
    testCapitalize ();
    testNumberToString ();
    testPrecise ();
    testSafeMethods ();
    testSafeTicker ();
    testJson ();
    testSortBy ();
    testSum ();
    testUrlencodeBase64 ();
    testOmit ();
    testGroupBy ();
    testIndexBy ();
    testFilterBy ();
    testHandleMethods ();
    testRemoveRepeatedElementsFromArray ();
    testParsePrecision ();
    testPrecisionFromString ();
    testExtractParams ();
    testArraysConcat ();
    testEthMethods ();
    await testSleep ();
}

export default baseTestsInit;
