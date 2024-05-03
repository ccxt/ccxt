// @ts-nocheck
/* eslint-disable */
import ccxt, { Exchange } from '../../../../ccxt.js';
import assert from 'assert';
import { functions } from '../../../../ccxt.js';

// import all methods from "test-helper-methods.ts"
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
    argvExchange,
    argvSymbol,
    argvMethod,
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
} from './../test-helper-methods.js';

import testBaseFunctionsExtend from './functions/test.extend.js';
 
class BaseFunctionalitiesTestClass {

    init() {
        const exchange = new ccxt.Exchange ({
            'id': 'xyzexchange',
        });

        testBaseFunctionsExtend(exchange);
    }

}

export default BaseFunctionalitiesTestClass;
