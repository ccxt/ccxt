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
// test base things
import base from './base/test.base.js';
import BaseFunctionalitiesTestClass from './base/test.base_auto.js';
import testMainClass from './test.js';



(new BaseFunctionalitiesTestClass ()).init ();
console.log ('base tests passed!');
// (new testMainClass ()).init (argvExchange, argvSymbol, argvMethod);
