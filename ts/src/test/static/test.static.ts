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
    const exchanges = Object.keys (data);

    log.bright.green ('Orders test passed');
}

function assertOutput (storedOutput, newOutput) {
    // to do
}

async function testExchangeStatically (exchangeName, exchangeData) {
    const markets = loadMarkets (exchangeName);
    const exchange = new ccxt[exchangeName] ({ 'markets': markets, 'httpsProxy': 'http://fake:8080', 'apiKey': 'key', 'secret': 'secret', 'password': 'password' });
    const methods = exchange.safeValue (exchangeData, 'methods');
    const methodsNames = Object.keys (methods);
    for (let i = 0; i < methodsNames.length; i++) {
        const method = methodsNames[i];
        const results = methods[method];
        for (let j = 0; j < results.length; j++) {
            const result = results[j];
            const input = result[0];
            const storedOutput = result[1];
            await testMethod (exchange, method, input, storedOutput);
        }
    }
}

async function testMethod (exchange, method, input, storedOutput) {
    let output = undefined;
    try {
        const inputArgs = Object.values (input);
        const _res = await exchange[method] (inputArgs);

    } catch (e) {
        output = exchange.last_request_body;
    }
    assertOutput (storedOutput, output);
}

function loadData () {
    const folder = './ts/src/test/static/data/';
    const files = fs.readdirSync (folder);
    const result = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const exchangeName = file.replace ('.json', '');
        const content = JSON.parse (fs.readFileSync (exchangeName, 'utf8'));
        result[exchangeName] = content;
    }
    return result;
}

function loadMarkets (id) {
    // load markets from file
    // to make this test as fast as possible
    // and basically independent from the exchange
    // so we can run it offline
    const filename = `./ts/src/test/static/markets/${id}.json`;
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
