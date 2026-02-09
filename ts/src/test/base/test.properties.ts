
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testProeprties () {
    const exchange = new ccxt.Exchange ({});
    //
    // userAgents
    //
    const keys = [ 'chrome', 'chrome39', 'chrome100' ];
    assert (exchange.userAgents !== undefined);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const userAgent = exchange.userAgents[key];
        assert (userAgent !== undefined);
    }
    //
    // others
    //
    assert (exchange.options === undefined);
    assert (exchange.api === undefined);
    assert (exchange.minFundingAddressLength > 0.9999 && exchange.minFundingAddressLength < 1.0001);
    assert (exchange.isSandboxModeEnabled === false);
    assert (exchange.certified === false);
    assert (exchange.pro === false);
    assert (exchange.countries === undefined);
    // proxies
    assert (exchange.proxy === undefined);
    assert (exchange.proxyUrl === undefined);
    assert (exchange.proxy_url === undefined);
    assert (exchange.proxyUrlCallback === undefined);
    assert (exchange.proxy_url_callback === undefined);
    assert (exchange.httpProxy === undefined);
    assert (exchange.http_proxy === undefined);
    assert (exchange.httpProxyCallback === undefined);
    assert (exchange.http_proxy_callback === undefined);
    assert (exchange.httpsProxy === undefined);
    assert (exchange.https_proxy === undefined);
    assert (exchange.httpsProxyCallback === undefined);
    assert (exchange.https_proxy_callback === undefined);
    assert (exchange.socksProxy === undefined);
    assert (exchange.socks_proxy === undefined);
    assert (exchange.socksProxyCallback === undefined);
    assert (exchange.socks_proxy_callback === undefined);
    assert (exchange.userAgent === undefined);
    assert (exchange.user_agent === undefined);
    assert (exchange.wsProxy === undefined);
    assert (exchange.ws_proxy === undefined);
    assert (exchange.wssProxy === undefined);
    assert (exchange.wss_proxy === undefined);
    assert (exchange.wsSocksProxy === undefined);
    assert (exchange.ws_socks_proxy === undefined);
}

export default testProeprties;
