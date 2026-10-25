// hx10 wave 10 JO01: the java runtime state is single-owner, so a counter that lives in
// `this.options` is one owner task (BaseExchange.nextCounterAbove) instead of a read-modify-write
// bracket. The printer emitted `synchronized (this) { read; put; }` for ts `lockId()/unlockId()`
// and a ReentrantLock pair for ts `lockLastNonce()/unlockLastNonce()`; the monitor never excluded
// the other options writers (they do not take it), so it made the RMW *look* atomic only against
// itself. Both shapes below print as the single hand-off that is actually atomic.

// the per-venue counter (`requestId`): `Long x; synchronized (this) { ... }` -> one owner task
const DECL = /^ {8}(Long|Object) (\w+);$/;
const SYNC = /^ {8}synchronized \(this\) \{$/;
const PREV_LOCAL = /^ {8}Long (\w+) = this\.safeInteger\(this\.options, "([^"]+)", 0\);$/;
const ASSIGN_SUM_PREV = /^ {8}(\w+) = (?:\(Long\) )?this\.sum\((\w+), 1\);$/;
const ASSIGN_SUM_READ = /^ {8}(\w+) = (?:\(Long\) )?this\.sum\(this\.safeInteger\(this\.options, "([^"]+)", 0\), 1\);$/;
const PUT = /^ {8}this\.options\.put\("([^"]+)", (\w+)\);$/;

// the base `incrementingNonce` guard: the clock floor is read outside, the sequence is owner-side
const NONCE_SPAN = /^ {8}this\.lockLastNonce\(\);\n {8}Long (\w+) = this\.safeInteger\(this\.options, "lastNonce", 0\);\n {8}Object (\w+) = [^\n]*\? (\w+) : \(\1 \+ 1L\);[^\n]*\n {8}this\.options\.put\("lastNonce", \2\);\n {8}this\.unlockLastNonce\(\);\n/m;

/** The counter body as a `[assignName, readKey, putKey, putName]` tuple, or undefined. */
function counterBody (lines: string[]): string[] | undefined {
    if (lines.length === 2) {
        const a = ASSIGN_SUM_READ.exec (lines[0]);
        const p = PUT.exec (lines[1]);
        if (a === null || p === null) return undefined;
        if (a[1] !== p[2] || a[2] !== p[1]) return undefined;
        return [ a[1], a[2], p[1], p[2] ];
    }
    if (lines.length === 3) {
        const pre = PREV_LOCAL.exec (lines[0]);
        const a = ASSIGN_SUM_PREV.exec (lines[1]);
        const p = PUT.exec (lines[2]);
        if (pre === null || a === null || p === null) return undefined;
        if (pre[1] !== a[2] || a[1] !== p[2] || pre[2] !== p[1]) return undefined;
        return [ a[1], pre[2], p[1], p[2] ];
    }
    return undefined;
}

// `Long requestId;\n        synchronized (this) {\n ... \n        }` -> one `nextCounter` hand-off
export function hx10w10JO01Counters (content: string): string {
    if (!content.includes ('synchronized (this) {')) return content;
    const lines = content.split ('\n');
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (i + 1 < lines.length && DECL.test (lines[i]) && SYNC.test (lines[i + 1])) {
            const decl = DECL.exec (lines[i]) as RegExpExecArray;
            const body: string[] = [];
            let j = i + 2;
            while (j < lines.length && lines[j] !== '        }') { body.push (lines[j]); j++; }
            const shape = (j < lines.length) ? counterBody (body) : undefined;
            if (shape !== undefined && shape[0] === decl[2]) {
                out.push ('        Long ' + decl[2] + ' = this.nextCounter("' + shape[1] + '", 1L);');
                i = j;
                continue;
            }
        }
        out.push (lines[i]);
    }
    return out.join ('\n');
}

// `incrementingNonce`: the clock floor is read on the caller, the sequence on the owner
export function hx10w10JO01Nonce (content: string): string {
    return content.replace (NONCE_SPAN, (_m: string, _last: string, result: string, floor: string) =>
        '        Object ' + result + ' = this.nextCounterAbove("lastNonce", 1L, ' + floor + ');\n');
}

export function hx10w10JO01 (content: string): string {
    return hx10w10JO01Nonce (hx10w10JO01Counters (content));
}

export function jo01SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => 'public class Gate extends GateRest\n{\n' + body + '\n}\n';
    const run = (body: string) => hx10w10JO01 (cls (body));
    const same = (body: string) => hx10w10JO01 (cls (body)) === cls (body);
    const pos: [string, string, string][] = [
        [ 'cast sum of options read',
          '    public Long requestId()\n    {\n        Long reqid;\n        synchronized (this) {\n        reqid = (Long) this.sum(this.safeInteger(this.options, "reqid", 0), 1);\n        this.options.put("reqid", reqid);\n        }\n        return reqid;\n    }',
          '        Long reqid = this.nextCounter("reqid", 1L);' ],
        [ 'object local, previous local form',
          '    public Long requestId()\n    {\n        Long next;\n        synchronized (this) {\n        Long previous = this.safeInteger(this.options, "requestId", 0);\n        next = (Long) this.sum(previous, 1);\n        this.options.put("requestId", next);\n        }\n        return next;\n    }',
          '        Long next = this.nextCounter("requestId", 1L);' ],
        [ 'uncast sum, object declaration',
          '    public String requestId()\n    {\n        Object requestId;\n        synchronized (this) {\n        requestId = this.sum(this.safeInteger(this.options, "requestId", 0), 1);\n        this.options.put("requestId", requestId);\n        }\n        return (String) (String.valueOf(requestId));\n    }',
          '        Long requestId = this.nextCounter("requestId", 1L);' ],
    ];
    for (const [ name, body, expect ] of pos) {
        const out = run (body);
        if (!out.includes (expect)) problems.push ('hx10w10 JO01: ' + name + ' expected ' + expect + ' in\n' + out);
        if (run (body) !== out) problems.push ('hx10w10 JO01: ' + name + ' not idempotent');
    }
    const nonceBody = '    public Object incrementingNonce()\n    {\n        Long currentNonce = this.nonce();\n        this.lockLastNonce();\n        Long lastNonce = this.safeInteger(this.options, "lastNonce", 0);\n        Object result = ((((currentNonce != null && (lastNonce == null || currentNonce > lastNonce))))) ? currentNonce : (lastNonce + 1L);\n        this.options.put("lastNonce", result);\n        this.unlockLastNonce();\n        return result;\n    }';
    const nonceOut = run (nonceBody);
    if (!nonceOut.includes ('Object result = this.nextCounterAbove("lastNonce", 1L, currentNonce);')) {
        problems.push ('hx10w10 JO01: incrementingNonce hand-off missing in\n' + nonceOut);
    }
    if (nonceOut.includes ('lockLastNonce')) problems.push ('hx10w10 JO01: incrementingNonce kept the lock bracket');
    // a monitor that does not guard a counter RMW is not ours to remove
    const neg: [string, string][] = [
        [ 'unrelated monitor',
          '    public void put(Object value)\n    {\n        synchronized (this) {\n        this.something = value;\n        }\n    }' ],
        [ 'read key differs from put key',
          '    public Long requestId()\n    {\n        Long reqid;\n        synchronized (this) {\n        reqid = (Long) this.sum(this.safeInteger(this.options, "reqid", 0), 1);\n        this.options.put("other", reqid);\n        }\n        return reqid;\n    }' ],
        [ 'different counter step',
          '    public Long requestId()\n    {\n        Long reqid;\n        synchronized (this) {\n        reqid = (Long) this.sum(this.safeInteger(this.options, "reqid", 0), 2);\n        this.options.put("reqid", reqid);\n        }\n        return reqid;\n    }' ],
        [ 'declared name not assigned',
          '    public Long requestId()\n    {\n        Long reqid;\n        synchronized (this) {\n        Long other = (Long) this.sum(this.safeInteger(this.options, "reqid", 0), 1);\n        this.options.put("reqid", other);\n        }\n        return reqid;\n    }' ],
    ];
    for (const [ name, body ] of neg) {
        if (!same (body)) problems.push ('hx10w10 JO01: ' + name + ' must keep the monitor\n' + run (body));
    }
    return problems;
}
