// ----------------------------------------------------------------------------

import assert from 'assert';
import { Exchange } from '../../ccxt.js';
import { Str } from '../base/types.js';


import {
    DIR_NAME,
    // errors
    AuthenticationError,
    NotSupported,
    ExchangeError,
    ProxyError,
    ExchangeNotAvailable,
    OperationFailed,
    OnMaintenance,
    // shared
    getCliArgValue,
    //
    proxyTestFileName,
    baseMainTestClass,
    dump,
    jsonParse,
    jsonStringify,
    convertAscii,
    getTestName,
    ioFileExists,
    ioFileRead,
    ioDirRead,
    callMethod,
    callExchangeMethodDynamically,
    callOverridenMethod,
    exceptionMessage,
    exitScript,
    getExchangeProp,
    setExchangeProp,
    initExchange,
    importTestFile,
    getTestFiles,
    setFetchResponse,
    isNullValue,
    close,
    argvExchange,
    argvSymbol,
    argvMethod,
} from './test-helper-methods.js';

// *********************************
import base from './base/test.base.js';
import BaseFunctionalitiesTestClass from './base_auto.js';
import testMainClass from './test.js';
// *********************************
var _ = base; // eslint-disable-line

const isBaseTests = getCliArgValue ('--baseTests');
const isExchangeTests = getCliArgValue ('--exchangeTests');
const reqResTests = getCliArgValue ('--responseTests') || getCliArgValue ('--requestTests');
const isAllTest = !reqResTests && !isBaseTests && !isExchangeTests; // if neither was chosen


// ####### base tests #######
if (isBaseTests || isAllTest) {
    (new BaseFunctionalitiesTestClass ()).init ();
    console.log ('base tests passed!');
}

// ####### exchange tests #######
if (isExchangeTests || isAllTest) {
    (new testMainClass ()).init (argvExchange, argvSymbol, argvMethod);
    console.log ('exchange tests passed!');
}
