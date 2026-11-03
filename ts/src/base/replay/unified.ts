interface UnifiedCall {
    method: string;
    callId: number;
    chain: string[];
}
interface CallTracker {
    storage: any;
    counter: number;
}
const ALWAYS_WRAPPED = [ 'loadMarkets', 'fetchMarkets', 'fetchCurrencies' ];

function unifiedMethodNames (exchange: any): string[] {
    const names: string[] = [];
    const has = exchange.has || {};
    const candidates = Object.keys (has).concat (ALWAYS_WRAPPED);
    for (let i = 0; i < candidates.length; i++) {
        const name = candidates[i];
        if (names.indexOf (name) === -1 && typeof exchange[name] === 'function') {
            names.push (name);
        }
    }
    return names;
}

function wrapUnifiedMethods (exchange: any, tracker: CallTracker, originals: { [name: string]: any }, own: { [name: string]: boolean }): void {
    const names = unifiedMethodNames (exchange);
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const original = exchange[name];
        originals[name] = original;
        own[name] = Object.prototype.hasOwnProperty.call (exchange, name);
        exchange[name] = function unifiedCall (this: any, ...args: any[]) {
            const current: UnifiedCall | undefined = tracker.storage.getStore ();
            let next: UnifiedCall;
            if (current === undefined) {
                tracker.counter += 1;
                next = { 'method': name, 'callId': tracker.counter, 'chain': [ name ] };
            } else {
                next = { 'method': current.method, 'callId': current.callId, 'chain': current.chain.concat ([ name ]) };
            }
            return tracker.storage.run (next, () => original.apply (this, args));
        };
    }
}

function currentCall (tracker: CallTracker): UnifiedCall | undefined {
    return tracker.storage.getStore ();
}

export { UnifiedCall, CallTracker, unifiedMethodNames, wrapUnifiedMethods, currentCall };
