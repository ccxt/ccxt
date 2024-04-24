import assert from 'assert';
import { Exchange } from "../../../../ccxt";
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWsProxies (exchange: Exchange, skippedProperties: object, language: string) {
    // todo: other proxies, i.e. 'socksWsProxy' etc
    if (exchange.inArray (language, [ 'js', 'ts' ])) {
        await exchange.loadHttpProxyAgent ();
    } else if (exchange.inArray (language, [ 'cs', 'php' ])) {
        // skip them for now
        return;
    }
    await testWsProxy (exchange, skippedProperties);
    // todo: below like in "REST" proxy tests
    // await testProxyForExceptions (exchange, skippedProperties);
}

const testVpsServerIp = '5.75.153.75';
let promise = null;

async function testWsProxy (exchange: Exchange, skippedProperties: object) {
    const method = 'wsProxy';
    const [ proxyUrl, httpProxy, httpsProxy, socksProxy ] = testSharedMethods.removeProxyOptions (exchange, skippedProperties);
    exchange.httpProxy = 'http://' + testVpsServerIp + ':8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    exchange.wsProxy = 'http://' + testVpsServerIp + ':8002'; // "wsProxy" or "wssProxy" (depending on your proxy protocol)
    exchange.handleMessage = ws_helper_callback; // todo for PHP: specifically this custom example does not work in PHP to retrieve the target message, however proxies do work in PHP for websockets independently from this example
    const demoServerUrl = 'ws://' + testVpsServerIp + ':9876';
    promise = exchange.watch (demoServerUrl, 'test', 'test');
    // reset the instance property
    testSharedMethods.setProxyOptions (exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
    return await promise;
}

function ws_helper_callback (client, message) {
    const method = 'wsProxy';
    // message like: { msg: "hi from test server", your_ip: "::ffff:5.75.153.75" }
    try {
        if ('your_ip' in message) {
            let ipString = message['your_ip'];
            ipString = ipString.replace ('::ffff:', '');
            assert (ipString === testVpsServerIp,  method + ' test failed. Returned response is ' + ipString + ' while it should be "' + testVpsServerIp + '"');
            console.log ('WS proxy test finished');
            promise.resolve ();
        }
    }
    catch (e) {
        console.log (e);
    }
}


export default testWsProxies;
