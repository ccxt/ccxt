import assert from 'node:assert/strict';
import Transpiler from 'ast-transpiler';
import { installCacheRemoveCall } from '../cache-remove-call.js';
const path = new URL('./fixtures/cache-remove.ts', import.meta.url).pathname;
for (const language of ['go', 'csharp', 'java']) {
 const t = new Transpiler({ verbose: false });
 installCacheRemoveCall(t, language);
 const output = language === 'go' ? t.transpileGoByPath(path).content : t.transpileCSharpByPath(path).content;
 const calls = output.match(language === 'go' ? /interface\{ Remove\(string\) \}/g : /callDynamically\(/g) || [];
 assert.equal(calls.length, 2, language + ': only the two real cache calls');
 assert.match(output, language === 'go' ? /this\.Other\.Remove\(/ : /this\.other\.remove\(/);
 console.log('PASS', language, 'typed local/member dispatch; unrelated method unchanged');
}
