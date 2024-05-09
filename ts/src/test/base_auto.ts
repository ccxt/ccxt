// @ts-nocheck
/* eslint-disable */
import assert from 'assert';
import ccxt, { Exchange, functions } from '../../ccxt.js';


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
} from './helpers_for_tests.js';

import testBaseFunctionsExtend from './base/functions_auto/test.extend.js';
//
import base from './base/test.base.js';
var _ = base; // eslint-disable-line


class BaseFunctionalitiesTestClass {

    init() {
        const exchange = new ccxt.Exchange ({
            'id': 'xyzexchange',
        });

        testBaseFunctionsExtend(exchange);
    }

}

export default BaseFunctionalitiesTestClass;
