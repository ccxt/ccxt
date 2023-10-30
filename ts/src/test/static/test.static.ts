// ----------------------------------------------------------------------------
import assert from 'assert';
import log from 'ololog';
import fs from 'fs';
import ccxt from '../../../ccxt.js';
// test statically (without API requests) that order request matches
async function main () {
    // const promises = [
    //     testMexc ()
    // ];
    // await Promise.all (promises);
    const data = loadData ();
    await testExchangeStatically ('bybit', data['bybit']);
    const exchanges = Object.keys (data);

    log.bright.green ('Orders test passed');
}

async function callMethodDynamically (exchange, methodName, args) {
    return await exchange[methodName] (...args);
}

function assertOutput (type: string, skipKeys: string[], storedUrl, requestUrl, storedOutput, newOutput) {
    if (storedUrl !== requestUrl) {
        // improve error message
        // assert (false, 'url mismatch');
    }
    if (type === 'json') {
        if (typeof storedOutput === 'string') {
            storedOutput = JSON.parse (storedOutput);
        }
        if (typeof newOutput === 'string') {
            newOutput = JSON.parse (newOutput);
        }
        const storedOutputKeys = Object.keys (storedOutput);
        const newOutputKeys = Object.keys (newOutput);
        assert (storedOutputKeys.length === newOutputKeys.length, 'output length mismatch');
        for (let i = 0; i < storedOutputKeys.length; i++) {
            const key = storedOutputKeys[i];
            if (skipKeys.includes (key)) {
                continue;
            }
            if (!newOutputKeys.includes (key)) {
                assert (false, 'output key mismatch');
            }
            const storedValue = storedOutput[key];
            const newValue = newOutput[key];
            assert (storedValue === newValue, 'output value mismatch');
        }
    }

}

async function testExchangeStatically (exchangeName, exchangeData) {
    const markets = loadMarkets (exchangeName);
    const exchange = new ccxt[exchangeName] ({ 'markets': markets, 'httpsProxy': 'http://fake:8080', 'apiKey': 'key', 'secret': 'secret', 'password': 'password', 'options': { 'enableUnifiedAccount': true, 'enableUnifiedMargin': false }});
    const methods = exchange.safeValue (exchangeData, 'methods');
    const methodsNames = Object.keys (methods);
    for (let i = 0; i < methodsNames.length; i++) {
        const method = methodsNames[i];
        const results = methods[method];
        for (let j = 0; j < results.length; j++) {
            const result = results[j];
            const type = exchange.safeString (exchangeData, 'outputType');
            const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
            await testMethod (exchange, method, result, type, skipKeys);
        }
    }
}

async function testMethod (exchange, method, data, type, skipKeys) {
    let output = undefined;
    let requestUrl = undefined;
    try {
        const inputArgs = Object.values (data['input']);
        const _res = await callMethodDynamically (exchange, method, inputArgs);

    } catch (e) {
        output = exchange.last_request_body;
        requestUrl = exchange.last_request_url;
    }
    assertOutput (type, skipKeys, data['url'], requestUrl, data['output'], output);
}

function loadData () {
    const folder = './ts/src/test/static/data/';
    const files = fs.readdirSync (folder);
    const result = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const exchangeName = file.replace ('.json', '');
        const content = JSON.parse (fs.readFileSync (folder + file, 'utf8'));
        result[exchangeName] = content;
    }
    return result;
}

function loadMarkets (id) {
    // load markets from file
    // to make this test as fast as possible
    // and basically independent from the exchange
    // so we can run it offline
    const filename = './ts/src/test/static/markets/' + id + '.json';
    const content = JSON.parse (fs.readFileSync (filename, 'utf8'));
    return content;
}

async function getRequestOrder (exchange, symbol, type, side, amount, price, params) {
    let reqBody = undefined;
    await exchange.loadMarkets ();
    try {
        exchange.httpsProxy = 'https://fake:8080'; // prevent real network request
        exchange.apiKey = 'api';
        exchange.secret = 'secret';
        exchange.password = 'password';
        await exchange.createOrder (symbol, type, side, amount, price, params);
    } catch (e) {
        reqBody = exchange.last_request_body;
    }
    return reqBody;
}

async function testMexc () {
    const markets = loadMarkets ('mexc');
    let reqHeaders = undefined;
    const id = 'CCXT';
    const mexc = new ccxt.mexc ({ 'markets': markets });
    assert (mexc.options['broker'] === id, 'id not in options');
    await mexc.loadMarkets ();
    try {
        mexc.apiKey = 'api';
        mexc.secret = 'secret';
        await mexc.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000, reqHeaders);
    } catch (e) {
        // we expect an error here, we're only interested in the headers
        reqHeaders = mexc.last_request_headers;
    }
    assert (reqHeaders['source'] === id, 'id not in headers');
}

await main ();
