
import assert from 'assert';

async function testProxyUrl (exchange, skippedProperties) {
    const method = 'proxyUrl';
    const proxyServerIp = '5.75.153.75';
    const currentProxyValue = exchange.proxyUrl;
    exchange.proxyUrl = 'http://' + proxyServerIp + ':8090/proxy.php?url=';
    const ipCheckUrl = 'https://api.ipify.org/';
    const response = await exchange.fetch (ipCheckUrl);
    assert (response === proxyServerIp, exchange.id + ' ' + method + ' test failed. Returned response is ' + response + ' while it should be "' + proxyServerIp + '"');
    // reset the instance property
    exchange.proxyUrl = currentProxyValue;
}

export default testProxyUrl;
