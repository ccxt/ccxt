

// ########## imports ##########

import assert from 'assert';
import { Exchange } from '../../ccxt.js';
import { Str } from '../base/types.js';
import { DIR_NAME, AuthenticationError, NotSupported, ExchangeError, ProxyError, ExchangeNotAvailable, OperationFailed, OnMaintenance, getCliArgValue, proxyTestFileName, baseMainTestClass, dump, jsonParse, jsonStringify, convertAscii, getTestName, ioFileExists, ioFileRead, ioDirRead, callMethod, callExchangeMethodDynamically, callOverridenMethod, exceptionMessage, exitScript, getExchangeProp, setExchangeProp, initExchange, importTestFile, getTestFiles, setFetchResponse, isNullValue, close, argvExchange, argvSymbol, argvMethod, } from './helpers_for_tests.js';


import testBaseFunctionsExtend from './base/functions_auto/test.extend.js';

import testMainClass from './test.js';

import base from './base/test.base.js';

var _ = base; // eslint-disable-line




// ########### args ###########

const isBaseTests = getCliArgValue ('--baseTests');
const isExchangeTests = getCliArgValue ('--exchangeTests');
const reqResTests = getCliArgValue ('--responseTests') || getCliArgValue ('--requestTests');
const isAllTest = !reqResTests && !isBaseTests && !isExchangeTests; // if neither was chosen

// ####### base tests #######
if (isBaseTests || isAllTest) {
    const exchange = new Exchange ({
        'id': 'xyzexchange',
    });

    testBaseFunctionsExtend (exchange);
    console.log ('base tests passed!');
}

// ####### exchange tests #######
if (isExchangeTests || reqResTests || isAllTest) {
    (new testMainClass ()).init (argvExchange, argvSymbol, argvMethod);
    console.log ('exchange tests passed!');
}
