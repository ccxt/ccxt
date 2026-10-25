// hx10w2 J05 — native emission for the java helper family
// `callDynamically` / `isInstance` / `objectValues` / `json` / `parseJson`.
//
// Two outcomes per site: a proven printed type emits the plain native op, anything else keeps the
// helper call exactly as the base emitted it. Nothing here replays a helper body:
//   * objectValues(m)  -> `new java.util.ArrayList<Object>(m.values())` only on a local whose single
//     in-member write declares a Map<..> (the helper's only surviving branch, minus the no-op monitor).
//   * isInstance(e, X.class) -> `(e instanceof X)` only for a catch parameter whose try cannot raise a
//     CompletionException/ExecutionException, because that unwrap is the helper's whole difference.
//   * callDynamically(this, <name>, ..) stays a helper unless <name> is a compile-time constant that the
//     enclosing class declares as a method; the 103 remaining sites dispatch on a runtime string.
//   * json/parseJson stay helpers: their body *is* the runtime JSON codec call, so "going native" would
//     only respell it (banned as census gaming).

const J05_MEMBER_START_RE = /^    (?:public|private|protected)\b/;
const J05_LOCAL_DECL = (name: string) =>
    new RegExp('^\\s*(?:final\\s+)?([A-Za-z_][\\w.]*(?:<[^;()=]*>)?(?:\\[\\])?)\\s+' + name + '\\s*(?:=(?!=)|;)');
const J05_MAP_DECL = (name: string) =>
    new RegExp('^\\s*(?:final\\s+)?(?:java\\.util\\.)?(?:Map|HashMap|LinkedHashMap|ConcurrentHashMap|TreeMap|IdentityHashMap)\\s*<[^;=()]*>\\s+' + name + '\\s*=(?!=)');
const J05_ASSIGN = (name: string) => new RegExp('(?<![\\w.])' + name + '\\s*=(?!=)');
const J05_LAMBDA_PARAM = (name: string) => new RegExp('(?:\\(|, )' + name + '\\)?\\s*->|(?<![\\w.])' + name + '\\s*->');

function j05MemberBounds (lines: string[], lineIndex: number): [number, number] {
    let start = 0;
    for (let j = lineIndex; j >= 0; j--) {
        if (J05_MEMBER_START_RE.test (lines[j])) { start = j; break; }
    }
    let end = lines.length - 1;
    for (let j = lineIndex + 1; j < lines.length; j++) {
        if (J05_MEMBER_START_RE.test (lines[j])) { end = j - 1; break; }
    }
    return [ start, end ];
}

// `x` is a local of this member, declared exactly once as a Map<..>, written only by that declaration
function j05ProvenMapLocal (lines: string[], lineIndex: number, name: string): boolean {
    const [ start, end ] = j05MemberBounds (lines, lineIndex);
    let declared = false;
    for (let j = lineIndex; j >= start; j--) {
        if (J05_MAP_DECL (name).test (lines[j])) { declared = true; break; }
        if (J05_LOCAL_DECL (name).test (lines[j])) { return false; }
    }
    if (!declared) { return false; }
    let writes = 0;
    for (let j = start; j <= end; j++) {
        if (J05_ASSIGN (name).test (lines[j])) { writes++; }
    }
    if (writes !== 1) { return false; }
    return !J05_LAMBDA_PARAM (name).test (lines.slice (start, end + 1).join ('\n'));
}

export function nativeJavaJ05ObjectValues (content: string): string {
    if (!content.includes ('Helpers.objectValues(')) { return content; }
    const lines = content.split ('\n');
    const call = /Helpers\.objectValues\((\w+)\)/g;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes ('Helpers.objectValues(')) { continue; }
        call.lastIndex = 0;
        let out = '';
        let cursor = 0;
        let m: RegExpExecArray | null;
        while ((m = call.exec (lines[i])) !== null) {
            if (!j05ProvenMapLocal (lines, i, m[1])) { continue; }
            out += lines[i].slice (cursor, m.index) + 'new java.util.ArrayList<Object>(' + m[1] + '.values())';
            cursor = m.index + m[0].length;
        }
        if (cursor > 0) { lines[i] = out + lines[i].slice (cursor); }
    }
    return lines.join ('\n');
}

// sync, non-future-producing members: calling any of these cannot wrap its throw in a CompletionException
const J05_SYNC_MEMBERS = new Set ([
    'safeString', 'safeString2', 'safeStringLower', 'safeStringUpper', 'safeInteger', 'safeInteger2',
    'safeValue', 'safeDict', 'safeList', 'safeFloat', 'safeNumber', 'safeTimestamp', 'safeBool',
    'json', 'parseNumber', 'throwExactlyMatchedException', 'throwBroadlyMatchedException', 'throwMatchedException',
]);
const J05_WRAPPER_SOURCE_RE = /\.join\s*\(|\.get\s*\(\s*\)|CompletableFuture|->|\bThread\b|\bawait\b/;

function j05SyncCatch (lines: string[], lineIndex: number, name: string): boolean {
    const catchRe = /^(\s*)\}?\s*catch\s*\(\s*([\w.]+)\s+(\w+)\s*\)/;
    let catchAt = -1;
    let catchIndent = '';
    let catchType = '';
    for (let j = lineIndex; j >= 0; j--) {
        const c = catchRe.exec (lines[j]);
        if (c !== null) {
            if (c[3] !== name) { return false; }
            catchAt = j; catchIndent = c[1]; catchType = c[2];
            break;
        }
        if (J05_MEMBER_START_RE.test (lines[j])) { return false; }
    }
    if (catchAt < 0) { return false; }
    if (!/^(?:Exception|Throwable|RuntimeException)$/.test (catchType)) { return false; }
    let tryAt = -1;
    for (let j = catchAt - 1; j >= 0; j--) {
        const t = /^(\s*)try\s*$/.exec (lines[j]);
        if (t !== null && t[1].length <= catchIndent.length) { tryAt = j; break; }
        if (J05_MEMBER_START_RE.test (lines[j])) { return false; }
    }
    if (tryAt < 0) { return false; }
    const body = lines.slice (tryAt + 1, catchAt).join ('\n');
    if (J05_WRAPPER_SOURCE_RE.test (body)) { return false; }
    for (const call of body.matchAll (/(?<![\w.])this\.(\w+)\s*\(/g)) {
        if (!J05_SYNC_MEMBERS.has (call[1])) { return false; }
    }
    return true;
}

export function nativeJavaJ05IsInstance (content: string): string {
    if (!content.includes ('Helpers.isInstance(')) { return content; }
    const lines = content.split ('\n');
    const call = /Helpers\.isInstance\((\w+), (\w+)\.class\)/g;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes ('Helpers.isInstance(')) { continue; }
        call.lastIndex = 0;
        let out = '';
        let cursor = 0;
        let m: RegExpExecArray | null;
        while ((m = call.exec (lines[i])) !== null) {
            if (!j05SyncCatch (lines, i, m[1])) { continue; }
            out += lines[i].slice (cursor, m.index) + '(' + m[1] + ' instanceof ' + m[2] + ')';
            cursor = m.index + m[0].length;
        }
        if (cursor > 0) { lines[i] = out + lines[i].slice (cursor); }
    }
    return lines.join ('\n');
}

export function nativeJavaJ05 (content: string): string {
    return nativeJavaJ05IsInstance (nativeJavaJ05ObjectValues (content));
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j05FamilySelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => 'public class Bitget extends BitgetRest\n{\n    public Object m(Object message, Client client)\n    {\n' + body + '\n    }\n}';
    const mapCase = [
        'map local',
        '        Map<String, Object> data = (Map<String, Object>) this.safeDict(response, "markets", new HashMap<String, Object>() {{}});\n        Object markets = Helpers.objectValues(data);',
        'new java.util.ArrayList<Object>(data.values())',
    ];
    const mapCases: [string, string, string | undefined][] = [
        [ mapCase[0], wrap (mapCase[1]), mapCase[2] ],
        [ 'Object local', wrap ('        Object data = this.safeDict(response, "markets", null);\n        Object markets = Helpers.objectValues(data);'), undefined ],
        [ 'reassigned map local', wrap ('        Map<String, Object> data = new HashMap<String, Object>() {{}};\n        data = this.safeDict(response, "markets", null);\n        Object markets = Helpers.objectValues(data);'), undefined ],
        [ 'map parameter', 'public class Bitget extends BitgetRest\n{\n    public Object m(Map<String, Object> data)\n    {\n        return Helpers.objectValues(data);\n    }\n}', undefined ],
    ];
    for (const [ name, input, expect ] of mapCases) {
        const out = nativeJavaJ05ObjectValues (input);
        const ok = expect === undefined ? out === input : (out.includes (expect) && !out.includes ('Helpers.objectValues('));
        if (!ok) { problems.push ('hx10w2 J05 objectValues: ' + name + '\n' + out); }
    }
    const syncTry = 'public class Bitget extends BitgetRest\n{\n    public Boolean handleErrorMessage(Client client, Object message)\n    {\n        try\n        {\n            this.throwExactlyMatchedException(((Map<String, Object>)this.exceptions.get("ws")).get("exact"), this.safeString(message, "code"), this.json(message));\n        } catch(Exception e)\n        {\n            if (Helpers.isInstance(e, AuthenticationError.class))\n            {\n                return false;\n            }\n        }\n        return true;\n    }\n}';
    const joinedTry = syncTry.replace ('this.json(message)', 'this.fetchStatus().join()');
    const foreignVar = syncTry.replace ('Helpers.isInstance(e,', 'Helpers.isInstance(error,');
    const instanceCases: [string, string, string | undefined][] = [
        [ 'sync catch', syncTry, '(e instanceof AuthenticationError)' ],
        [ 'negated', syncTry.replace ('Helpers.isInstance(e,', '!Helpers.isInstance(e,'), '!(e instanceof AuthenticationError)' ],
        [ 'join in try', joinedTry, undefined ],
        [ 'not the catch parameter', foreignVar, undefined ],
    ];
    for (const [ name, input, expect ] of instanceCases) {
        const out = nativeJavaJ05IsInstance (input);
        const ok = expect === undefined ? out === input : (out.includes (expect) && !out.includes ('Helpers.isInstance('));
        if (!ok) { problems.push ('hx10w2 J05 isInstance: ' + name + '\n' + out); }
    }
    return problems;
}
