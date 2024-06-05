

// ########## imports ##########

import assert from 'assert';
import { Exchange } from '../../ccxt.js';
import { Str } from '../base/types.js';
import { DIR_NAME, AuthenticationError, NotSupported, ExchangeError, ProxyError, ExchangeNotAvailable, OperationFailed, OnMaintenance, getCliArgValue, proxyTestFileName, baseMainTestClass, dump, jsonParse, jsonStringify, convertAscii, getTestName, ioFileExists, ioFileRead, ioDirRead, callMethod, callExchangeMethodDynamically, callOverridenMethod, exceptionMessage, exitScript, getExchangeProp, setExchangeProp, initExchange, importTestFile, getTestFiles, setFetchResponse, isNullValue, close, argvExchange, argvSymbol, argvMethod, } from './helpers_for_tests.js';

import testMainClass from './tests.js';

import baseTestsInitRest from './base/tests.init.js';
import baseTestsInitWs from '../pro/test/base/tests.init.js';


// ########### args ###########

const isWs = getCliArgValue ('--ws');
const isBaseTests = getCliArgValue ('--baseTests');
const isExchangeTests = getCliArgValue ('--exchangeTests');
const reqResTests = getCliArgValue ('--responseTests') || getCliArgValue ('--requestTests');
const isAllTest = !reqResTests && !isBaseTests && !isExchangeTests; // if neither was chosen

// ####### base tests #######
if (isBaseTests) {
    const exchange = new Exchange ({
        'id': 'xyzexchange',
    });
    if (isWs) {
        baseTestsInitWs ();
    } else {
        baseTestsInitRest (exchange);
    }
}

// ####### exchange tests #######
if (isExchangeTests || reqResTests || isAllTest) {
    (new testMainClass ()).init (argvExchange, argvSymbol, argvMethod);
}
