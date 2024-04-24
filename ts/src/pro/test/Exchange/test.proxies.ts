import assert from 'assert';
import { Exchange } from "../../../../ccxt";
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWsProxies (exchange: Exchange, skippedProperties: object, language: string) {
    // todo: other proxies, i.e. 'socksWsProxy' etc
    await testWsProxy (exchange, skippedProperties);
    // todo: below like in "REST" proxy tests
    // await testProxyForExceptions (exchange, skippedProperties);
}


async function testWsProxy (exchange: Exchange, skippedProperties: object) {
    const method = 'wsProxy';
    const proxyServerIp = '5.75.153.75';
    const [ proxyUrl, httpProxy, httpsProxy, socksProxy ] = testSharedMethods.removeProxyOptions (exchange, skippedProperties);
    exchange.httpProxy = 'http://' + proxyServerIp + ':8002'; // "httpProxy" or "httpsProxy" (depending on your proxy protocol)
    exchange.wsProxy = 'http://' + proxyServerIp + ':8002'; // "wsProxy" or "wssProxy" (depending on your proxy protocol)
    exchange.handleMessage = ws_helper_callback; // todo for PHP: specifically this custom example does not work in PHP to retrieve the target message, however proxies do work in PHP for websockets independently from this example
    const demoServerUrl = 'ws://5.75.153.75:9876';
    const response = await exchange.watch (demoServerUrl, 'test', 'test');
    console.log ('WS proxy test finished');
    assert (response === proxyServerIp, exchange.id + ' ' + method + ' test failed. Returned response is ' + response + ' while it should be "' + proxyServerIp + '"');
    // reset the instance property
    testSharedMethods.setProxyOptions (exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
}

function ws_helper_callback (client, message) {
    console.log ('WS received:', message);
}


export default testWsProxies;
