
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';

async function testHttpProxy (exchange, skippedProperties) {
    const method = 'httpProxy';
    const proxyServerIp = '5.75.153.75';
    const [ proxyUrl, httpProxy, httpsProxy, socksProxy ] = testSharedMethods.clearProxySettings (exchange, skippedProperties);
    exchange.httpProxy = 'http://' + proxyServerIp + ':8002';
    const ipCheckUrl = 'https://api.ipify.org/';
    const response = await exchange.fetch (ipCheckUrl);
    assert (response === proxyServerIp, exchange.id + ' ' + method + ' test failed. Returned response is ' + response + ' while it should be "' + proxyServerIp + '"');
    // reset the instance property
    testSharedMethods.setProxySettings (exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
}

export default testHttpProxy;
