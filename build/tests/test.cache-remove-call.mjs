import assert from 'node:assert/strict';
import Transpiler from 'ast-transpiler';
import { installCacheRemoveCall } from '../cache-remove-call.js';
const path = new URL('./fixtures/cache-remove.ts', import.meta.url).pathname;
for (const language of ['go', 'csharp', 'java', 'rust']) {
 const t = new Transpiler({ verbose: false });
 installCacheRemoveCall(t, language);
 const output = language === 'go' ? t.transpileGoByPath(path).content : (language === 'rust' ? t.transpileRustByPath(path).content : (language === 'java' ? t.transpileJavaByPath(path).content : t.transpileCSharpByPath(path).content));
 const calls = output.match(language === 'go' ? /\(\*ccxt\.ArrayCacheBySymbolBySide\)/g : (language === 'csharp' ? /ccxt\.pro\.ArrayCacheBySymbolBySide/g : (language === 'rust' ? /remove_cache_symbol\(/g : /ArrayCache\.ArrayCacheBySymbolBySide/g))) || [];
 assert.equal(calls.length, 2, language + ': only the two real cache calls');
 assert.match(output, language === 'go' ? /this\.Other\.Remove\(/ : (language === 'rust' ? /other[\s\S]*\.remove\(/ : /this\.other\.remove\(/));
 console.log('PASS', language, 'typed local/member dispatch; unrelated method unchanged');
}

// Exercise the real consumer: Exchange.positions is any, so its local cache must be typed.
const bingxPath = new URL('../../ts/src/pro/bingx.ts', import.meta.url).pathname;
for (const language of ['go', 'csharp', 'java', 'rust']) {
    const t = new Transpiler({ verbose: false });
    installCacheRemoveCall(t, language);
    const output = language === 'go' ? t.transpileGoByPath(bingxPath).content : (language === 'rust' ? t.transpileRustByPath(bingxPath).content : (language === 'java' ? t.transpileJavaByPath(bingxPath).content : t.transpileCSharpByPath(bingxPath).content));
    const expected = language === 'go' ? /\(\*ccxt\.ArrayCacheBySymbolBySide\)/ : (language === 'csharp' ? /\(\(ccxt\.pro\.ArrayCacheBySymbolBySide\)cache\)\.remove/ : (language === 'rust' ? /cache\.remove_cache_symbol\(/ : /\(\(ArrayCache\.ArrayCacheBySymbolBySide\)cache\)\.remove/));
    assert.match(output, expected, language + ': real BingX position removal must use the adapter');
    console.log('PASS', language, 'real BingX position removal dispatch');
}
