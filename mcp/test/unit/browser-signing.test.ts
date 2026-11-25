import assert from 'node:assert/strict';
import test from 'node:test';
import { createHmac } from 'node:crypto';
import { signStep } from '../../ts/browser-signing.js';

const secret = 'the-secret-that-only-the-widget-has';
const apiKey = 'api-key-identifier';

// Stands in for a ccxt exchange: signs the way ccxt does (this.hmac) and sends through
// this.fetchImplementation, which is exactly what browser-signing.ts replaces.
function fakeExchangeClass (behaviour: { parallel?: boolean; fail?: boolean } = {}) {
    return class FakeExchange {
        apiKey: string;
        secret: string;
        options: Record<string, any>;
        has: Record<string, any> = {};
        hmac: any;
        fetchImplementation: any;
        constructor (config: any) {
            this.apiKey = config.apiKey;
            this.secret = config.secret;
            this.options = config.options;
        }
        setSandboxMode (): void { /* testnet */ }
        enableDemoTrading (): void { /* demo */ }
        async call (method: string, path: string, query: string): Promise<any> {
            const signature = this.hmac (new TextEncoder ().encode (query), new TextEncoder ().encode (this.secret), undefined);
            const response = await this.fetchImplementation ('https://api-testnet.bybit.com' + path + '?' + query + '&sign=' + signature, {
                method, 'headers': { 'X-BAPI-API-KEY': this.apiKey, 'X-BAPI-SIGN': signature },
            });
            return JSON.parse (await response.text ());
        }
        async fetchBalance (): Promise<any> {
            if (behaviour.parallel) {
                // two signed requests in flight at once, like bybit's account-mode check
                await Promise.all ([ this.call ('GET', '/v5/user/query-api', 'a=1'), this.call ('GET', '/v5/account/info', 'b=2') ]);
            }
            const reply = await this.call ('GET', '/v5/account/wallet-balance', 'accountType=UNIFIED');
            return { 'total': { 'USDT': reply.usdt, 'DUST': 0 }, 'free': { 'USDT': reply.usdt }, 'used': { 'USDT': 0 } };
        }
        async createOrder (): Promise<any> {
            const reply = await this.call ('POST', behaviour.fail ? '/v5/asset/withdraw/create' : '/v5/order/create', 'symbol=BTCUSDT');
            return { 'id': reply.orderId, 'status': 'open' };
        }
    };
}

function harness (behaviour: { parallel?: boolean; fail?: boolean } = {}) {
    const sent: { url: string; headers: Record<string, string> }[] = [];
    const deps = {
        'exchangeClass': () => fakeExchangeClass (behaviour),
        'fetchUpstream': async (url: string, init: any) => {
            sent.push ({ url, 'headers': init.headers });
            return { 'status': 200, 'text': JSON.stringify ({ 'usdt': 12.5, 'orderId': 'order-1' }) };
        },
    };
    // what the widget does: HMAC each message with the secret it alone holds
    const sign = (need: any[]) => need.map ((entry) => ({ 'id': entry.id, 'signature': createHmac ('sha256', secret).update (Buffer.from (entry.message, 'base64')).digest ('hex') }));
    return { deps, sent, sign };
}

const balance = { 'action': 'browser_fetch_balance', 'exchange': 'bybit', 'network': 'testnet', 'market': 'spot' };

test ('a request is signed in the widget: the server never holds the secret, the exchange gets a real signature', async () => {
    const { deps, sent, sign } = harness ();
    const first: any = await signStep (deps, { 'intent': balance, apiKey });
    assert.equal (first.status, 'sign');
    assert.equal (first.need.length, 1);
    assert.equal (Buffer.from (first.need[0].message, 'base64').toString (), 'accountType=UNIFIED');
    assert.equal (sent.length, 0, 'nothing is sent before the widget has signed');
    const { serverMs, ...done }: any = await signStep (deps, { 'session': first.session, 'signatures': sign (first.need) });
    assert.equal (typeof serverMs, 'number');
    assert.deepEqual (done, { 'status': 'done', 'result': { 'kind': 'balance', 'balances': { 'USDT': { 'total': 12.5, 'free': 12.5, 'used': 0 } } } });
    const expected = createHmac ('sha256', secret).update ('accountType=UNIFIED').digest ('hex');
    assert.equal (sent[0].url, 'https://api-testnet.bybit.com/v5/account/wallet-balance?accountType=UNIFIED&sign=' + expected);
    assert.equal (sent[0].headers['x-bapi-sign'], expected);
    assert.ok (!JSON.stringify (sent).includes (first.need[0].id), 'no placeholder reaches the exchange');
    // the session is single-use
    assert.equal (((await signStep (deps, { 'session': first.session, 'signatures': [] })) as any).error.code, 'SessionExpired');
});

test ('requests signed in parallel are all released, across as many rounds as it takes', async () => {
    const { deps, sent, sign } = harness ({ 'parallel': true });
    let step: any = await signStep (deps, { 'intent': balance, apiKey });
    assert.equal (step.status, 'sign');
    assert.equal (step.need.length, 2, 'both parallel requests are offered in one round');
    let rounds = 0;
    while (step.status === 'sign') {
        rounds += 1;
        assert.ok (rounds < 5);
        step = await signStep (deps, { 'session': step.session, 'signatures': sign (step.need) });
    }
    assert.equal (step.status, 'done');
    assert.equal (rounds, 2);
    assert.deepEqual (sent.map ((entry) => new URL (entry.url).pathname).sort (), [ '/v5/account/info', '/v5/account/wallet-balance', '/v5/user/query-api' ]);
});

test ('a route outside the allowlist is never sent, and bad input is refused', async () => {
    const order = { 'action': 'browser_create_order', 'exchange': 'bybit', 'network': 'testnet', 'market': 'spot', 'symbol': 'BTC/USDT', 'side': 'buy', 'type': 'limit', 'amount': 0.001, 'price': 20000 };
    const blocked = harness ({ 'fail': true });
    let step: any = await signStep (blocked.deps, { 'intent': order, apiKey });
    step = await signStep (blocked.deps, { 'session': step.session, 'signatures': blocked.sign (step.need) });
    assert.equal (step.status, 'error');
    assert.match (step.error.message, /not enabled/);
    assert.equal (blocked.sent.length, 0);
    const { deps, sign } = harness ();
    assert.equal (((await signStep (deps, { 'intent': { ...order, 'price': undefined }, apiKey })) as any).error.message, 'A limit order requires a price.');
    assert.equal (((await signStep (deps, { 'intent': { ...order, 'exchange': 'kraken' }, apiKey })) as any).status, 'error');
    assert.equal (((await signStep (deps, { 'intent': order, 'apiKey': '' })) as any).error.message, 'Enter the API key.');
    const open: any = await signStep (deps, { 'intent': order, apiKey });
    assert.equal (((await signStep (deps, { 'session': open.session, 'signatures': [ { 'id': open.need[0].id, 'signature': 'not-a-signature' } ] })) as any).error.message, 'The signature is not valid.');
    const done: any = await signStep (deps, { 'session': open.session, 'signatures': sign (open.need) });
    assert.deepEqual (done.result, { 'kind': 'order', 'id': 'order-1', 'status': 'open', 'symbol': undefined, 'side': undefined, 'type': undefined, 'amount': undefined, 'price': undefined, 'filled': undefined, 'average': undefined });
});
