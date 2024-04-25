import assert from 'assert';
import { Exchange } from "../../../../ccxt";
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

// SKIP_TRANSPILER_CSHARP

async function testWsProxies (exchange: Exchange, skippedProperties: object, language: string) {
    // todo: other proxies, i.e. 'socksWsProxy' etc
    if (exchange.inArray (language, [ 'js', 'ts' ])) {
        const dynamicMethodName = 'loadHttpProxyAgent'; // c# trick
        await exchange[dynamicMethodName] ();
    } else if (exchange.inArray (language, [ 'cs', 'php' ])) {
        // skip them for now
        return;
    }
    const [ proxyUrl, httpProxy, httpsProxy, socksProxy ] = testSharedMethods.removeProxyOptions (exchange, skippedProperties);
    await testWsProxy (exchange, skippedProperties);
    // reset the instance property
    testSharedMethods.setProxyOptions (exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
    // todo: below like in "REST" proxy tests
    // await testProxyForExceptions (exchange, skippedProperties);
}


async function testWsProxy (exchange: Exchange, skippedProperties: object) {
    const method = 'wsProxy';
    const testVpsServerIp = '5.75.153.75';
    exchange.httpProxy = 'http://' + testVpsServerIp + ':8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    exchange.wsProxy = 'http://' + testVpsServerIp + ':8002'; // "wsProxy" or "wssProxy" (depending on your proxy protocol)
    exchange.handleMessage = ws_helper_callback; // todo for PHP: specifically this custom example does not work in PHP to retrieve the target message, however proxies do work in PHP for websockets independently from this example
    const demoServerUrl = 'ws://' + testVpsServerIp + ':9876';
    return await exchange.watch (demoServerUrl, 'ws_proxy_test', 'ws_proxy_test');
}


function ws_helper_callback (client, message) {
    const method = 'wsProxy';
    const testVpsServerIp = '5.75.153.75';
    // message like: { msg: "hi from test server", your_ip: "::ffff:5.75.153.75" }
    if ('your_ip' in message) {
        let ipString = message['your_ip'];
        ipString = ipString.replace ('::ffff:', '');
        assert (ipString === testVpsServerIp,  method + ' test failed. Returned response is ' + ipString + ' while it should be "' + testVpsServerIp + '"');
        client.resolve (null, 'ws_proxy_test');
    }
}


export default testWsProxies;
