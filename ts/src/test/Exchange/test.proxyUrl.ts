
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';

async function testProxyUrl (exchange, skippedProperties) {
    const method = 'proxyUrl';
    const proxyServerIp = '5.75.153.75';
    const [ proxyUrl, httpProxy, httpsProxy, socksProxy ] = testSharedMethods.removeProxyOptions (exchange, skippedProperties);
    exchange.proxyUrl = 'http://' + proxyServerIp + ':8090/proxy.php?url=';
    const encodedColon = '%3A';
    const encodedSlash = '%2F';
    const ipCheckUrl = 'https' + encodedColon + encodedSlash + encodedSlash + 'api.ipify.org';
    const response = await exchange.fetch (ipCheckUrl);
    assert (response === proxyServerIp, exchange.id + ' ' + method + ' test failed. Returned response is ' + response + ' while it should be "' + proxyServerIp + '"');
    // reset the instance property
    testSharedMethods.setProxyOptions (exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
}

export default testProxyUrl;
