// ----------------------------------------------------------------------------
/* eslint-disable max-classes-per-file */
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';
import ccxt, { Exchange } from '../../ccxt.js';
import errorsHierarchy from '../base/errorHierarchy.js';
import { unCamelCase } from '../base/functions/string.js';
import { Dict } from '../base/types.js';

// js specific codes //
const DIR_NAME = path.dirname (fileURLToPath (import.meta.url)) + path.sep;
process.on ('uncaughtException', (e) => {
    throw new Error ('[TEST_FAILURE] ' + exceptionMessage (e));
    // process.exit (1);
});
process.on ('unhandledRejection', (e: any) => {
    // if (e.message.includes ('connection closed by remote server')) {
    //     // because of unbeknown reason, this error is happening somewhere in the middle of WS tests, and it's not caught by the try/catch block. so temporarily ignore it
    //     return;
    // }
    throw new Error ('[TEST_FAILURE] ' + exceptionMessage (e));
    // process.exit (1);
});

const AuthenticationError = ccxt.AuthenticationError;
const NotSupported = ccxt.NotSupported;
const ExchangeError = ccxt.ExchangeError;
const InvalidProxySettings = ccxt.InvalidProxySettings;
const ExchangeNotAvailable = ccxt.ExchangeNotAvailable;
const OperationFailed = ccxt.OperationFailed;
const OnMaintenance = ccxt.OnMaintenance;


// ############## detect cli arguments ############## //
const argv = process.argv.slice (2); // remove first two arguments (which is process and script path "js/src/test/test.js")

function filterArgvs (argsArray: string[], needle: string, include = true) {
    return argsArray.filter ((x: string) => (include && x.includes (needle)) || (!include && !x.includes (needle)));
}
function selectArgv (argsArray: string[], needle: string) {
    const foundArray = argsArray.filter ((x: string) => (x.includes (needle)));
    return foundArray.length ? foundArray[0] : undefined;
}

const argvs_filtered = filterArgvs (argv, '--', false);
const argvExchange = argvs_filtered[0];
const argvSymbol   = selectArgv (argv, '/');
const argvMethod   = selectArgv (argv, '()');
// #################################################### //


function getCliArgValue (arg: string) {
    return process.argv.includes (arg) || false;
}

// non-transpiled part, but shared names among langs
const fileParts = import.meta.url.split ('.');
const EXT = fileParts[fileParts.length - 1];
const LANG = 'JS';
const ROOT_DIR = path.resolve (DIR_NAME, '..', '..', '..') + path.sep;
const ENV_VARS = process.env;
const NEW_LINE = '\n';
const LOG_CHARS_LENGTH = 10000;
const PROXY_TEST_FILE_NAME = "proxies";

function dump (...args: any[]) {
    console.log (...args);
}

function jsonParse (elem: any) {
    return JSON.parse (elem);
}

function jsonStringify (elem: any) {
    return JSON.stringify (elem,  (k, v) => (v === undefined ? null : v)); // preserve undefined values and convert them to null
}

function convertAscii (input: any)
{
    return input; // stub for c#
}

function ioFileExists (path: string) {
    return fs.existsSync (path);
}

function ioFileRead (path: string, decode = true) {
    const content = fs.readFileSync (path, 'utf8');
    return decode ? JSON.parse (content) : content;
}

function ioDirRead (path: string) {
    const files = fs.readdirSync (path);
    return files;
}

async function callMethodSync (testFiles: any, methodName: string, exchange: any, skippedProperties: object, args: any[]) {
    // empty in js
    return {};
}

async function callMethod (testFiles: any, methodName: string, exchange: any, skippedProperties: object, args: any[]) {
    // used for calling methods from test files
    return await testFiles[methodName] (exchange, skippedProperties, ...args);
}

async function callExchangeMethodDynamically (exchange: Exchange, methodName: string, args: any) {
    // used for calling actual exchange methods
    return await exchange[methodName] (...args);
}

function callExchangeMethodDynamicallySync (exchange: Exchange, methodName: string, args: any) {
    throw new Error ("This function shouldn't be called, only async functions apply here");
}

async function callOverridenMethod (exchange: any, methodName: string, args: any[]) {
    // needed in PHP here is just a bridge
    return await callExchangeMethodDynamically (exchange, methodName, args);
}

function exceptionMessage (exc: any) {
    return '[' + exc.constructor.name + '] ' + exc.stack.slice (0, LOG_CHARS_LENGTH);
}

// stub for c#
function getRootException (exc: any) {
    return exc;
}

function exitScript (code = 0) {
    process.exit (code);
}

function getExchangeProp (exchange: any, prop: string, defaultValue: any = undefined) {
    return (prop in exchange) ? exchange[prop] : defaultValue;
}

function setExchangeProp (exchange: any, prop: string, value: any) {
    exchange[prop] = value;
    exchange[unCamelCase (prop)] = value;
}

function initExchange (exchangeId: string, args: any, isWs = false): Exchange {
    const prediction: Dict = ccxt.prediction;
    const hasPrediction = (prediction !== undefined) && (exchangeId in prediction);
    // regular ccxt ids win for ids present in both (e.g. hyperliquid); --prediction forces the
    // prediction-markets namespace for those, and prediction is the fallback for prediction-only ids.
    // the prediction class carries the watch* methods too (no ccxt.pro variant), so route WS there as well
    if (hasPrediction && (getCliArgValue ('--prediction') || !(exchangeId in ccxt))) {
        return new (prediction)[exchangeId] (args);
    }
    if (isWs) {
        return new (ccxt.pro as Dict)[exchangeId] (args);
    }
    return new (ccxt as Dict)[exchangeId] (args);
}

async function importTestFile (filePath: string) {
    // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
    return (await import (pathToFileURL (filePath + '.js') as any) as any)['default'];
}

function getTestFilesSync (properties: string[], ws = false) {
    // empty in js
    return {};
}

async function getTestFiles (properties: string[], ws = false) {
    const targetPath = ws ? DIR_NAME + '../pro/test/' : DIR_NAME;
    // exchange tests
    const tests: Dict = {};
    const finalPropList = properties.concat ([ PROXY_TEST_FILE_NAME, 'features' ]);
    for (let i = 0; i < finalPropList.length; i++) {
        const name = finalPropList[i];
        const filePathWoExt = targetPath + 'Exchange/test.' + name;
        if (ioFileExists (filePathWoExt + '.' + EXT)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            tests[name] = await importTestFile (filePathWoExt);
        }
    }
    // errors tests
    const errorHierarchyKeys = Object.keys (errorsHierarchy);
    for (let i = 0; i < errorHierarchyKeys.length; i++) {
        const name = errorHierarchyKeys[i];
        const filePathWoExt = targetPath + '/base/errors/test.' + name;
        if (ioFileExists (filePathWoExt + '.' + EXT)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            tests[name] = await importTestFile (filePathWoExt);
        }
    }
    return tests;
}

function setFetchResponse (exchange: Exchange, mockResponse: any) {
    exchange.fetch = async (url, method = 'GET', headers: any = undefined, body: any = undefined) => mockResponse;
    return exchange;
}

function isNullValue (value: any) {
    return value === null;
}

async function close (exchange: Exchange) {
    await exchange.close ();
}

function isSync () {
    return false;
}

function getRootDir () {
    return ROOT_DIR;
}

function getEnvVars () {
    return ENV_VARS;
}

function getLang () {
    return LANG;
}

function getExt () {
    return EXT;
}

function isWindows () {
    return process.platform === "win32";
}

function isLinux () {
    return process.platform === "linux";
}

function isAmd64 () {
    return process.arch === "x64";
}


export {
    // errors
    AuthenticationError,
    NotSupported,
    ExchangeError,
    InvalidProxySettings,
    ExchangeNotAvailable,
    OperationFailed,
    OnMaintenance,
    // shared
    getCliArgValue,
    //
    dump,
    jsonParse,
    jsonStringify,
    convertAscii,
    ioFileExists,
    ioFileRead,
    ioDirRead,
    callMethod,
    callMethodSync,
    callExchangeMethodDynamically,
    callExchangeMethodDynamicallySync,
    callOverridenMethod,
    exceptionMessage,
    getRootException,
    exitScript,
    getExchangeProp,
    setExchangeProp,
    initExchange,
    getTestFiles,
    getTestFilesSync,
    setFetchResponse,
    isNullValue,
    close,
    getRootDir,
    argvExchange,
    argvSymbol,
    argvMethod,
    isSync,
    LANG,
    ENV_VARS,
    NEW_LINE,
    EXT,
    getEnvVars,
    getLang,
    getExt,
    isWindows,
    isLinux,
    isAmd64,
};

export default {};
