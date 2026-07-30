
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function assertNoForcedFamily (options) {
    // dual-stack must not pin a single address family anywhere in the options tree
    assert (options['family'] === undefined, 'family must not be forced on the dispatcher options');
    const nestedKeys = [ 'connect', 'requestTls', 'proxyTls' ];
    for (let i = 0; i < nestedKeys.length; i++) {
        const nested = options[nestedKeys[i]];
        if (nested !== undefined) {
            assert (nested['family'] === undefined, 'family must not be forced inside ' + nestedKeys[i]);
        }
    }
}

function testDualStack () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    // plain undici.Agent path (node rest default)
    const agentOptions = exchange.getDispatcherOptions (true);
    assert (agentOptions['autoSelectFamily'] === true, 'autoSelectFamily must be enabled for happy eyeballs dual-stack');
    assert (agentOptions['autoSelectFamilyAttemptTimeout'] === 10, 'autoSelectFamilyAttemptTimeout should be 10ms');
    assertNoForcedFamily (agentOptions);
    // undici.ProxyAgent path (proxied node rest)
    const proxyAgentOptions = exchange.getDispatcherOptions (false);
    assert (proxyAgentOptions['autoSelectFamily'] === true, 'autoSelectFamily must be enabled on the proxy dispatcher options too');
    assert (proxyAgentOptions['autoSelectFamilyAttemptTimeout'] === 10, 'autoSelectFamilyAttemptTimeout should be 10ms on the proxy dispatcher options too');
    assertNoForcedFamily (proxyAgentOptions);
    // tls-validation-disabled path must keep happy eyeballs alongside the connect/requestTls overrides
    const insecureExchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'validateServerSsl': false,
    });
    const insecureAgentOptions = insecureExchange.getDispatcherOptions (true);
    assert (insecureAgentOptions['autoSelectFamily'] === true, 'autoSelectFamily must survive the connect tls override');
    assert (insecureAgentOptions['connect']['rejectUnauthorized'] === false, 'connect tls override should still be applied');
    assertNoForcedFamily (insecureAgentOptions);
    const insecureProxyOptions = insecureExchange.getDispatcherOptions (false);
    assert (insecureProxyOptions['autoSelectFamily'] === true, 'autoSelectFamily must survive the requestTls override');
    assert (insecureProxyOptions['requestTls']['rejectUnauthorized'] === false, 'requestTls override should still be applied');
    assertNoForcedFamily (insecureProxyOptions);
}

export default testDualStack;
