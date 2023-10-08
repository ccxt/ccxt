
import assert from 'assert';

async function testHttpProxy (exchange, skippedProperties) {
    const method = 'httpProxy';
    const proxyServerIp = '5.75.153.75';
    const currentProxyValue = exchange.httpProxy;
    exchange.httpProxy = 'http://' + proxyServerIp + ':8002';
    const ipCheckUrl = 'https://api.ipify.org/';
    const response = await exchange.fetch (ipCheckUrl);
    assert (response === proxyServerIp, exchange.id + ' ' + method + ' test failed. Returned response is ' + response + ' while it should be "' + proxyServerIp + '"');
    // reset the instance property
    exchange.httpProxy = currentProxyValue;
}

export default testHttpProxy;
