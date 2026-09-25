import assert from 'node:assert/strict';
import test from 'node:test';

// `starts_with` / `ends_with` post-pass of build/rustTranspiler.ts:
//   node --import tsx --test build/tests/test.rust-native-string-affix.mjs
const { RustTranspilerBuilder } = await import('../rustTranspiler.ts');
const rewrite = (src) => new RustTranspilerBuilder().rewriteNativeStringAffixChecks(src);

test('literal needle on a local / self field goes native', () => {
    assert.equal(
        rewrite('if (starts_with(&api, &Value::Str("private".into()))) {'),
        'if (matches!(&api, Value::Str(__s) if __s.starts_with("private"))) {');
    assert.equal(
        rewrite('let mut x: Value = Value::Bool(ends_with(&self.secret, &Value::Str("=".into())));'),
        'let mut x: Value = Value::Bool(matches!(&self.secret, Value::Str(__s) if __s.ends_with("=")));');
    // escapes inside the literal are carried verbatim
    assert.equal(
        rewrite('starts_with(&s, &Value::Str("a\\"b".into()))'),
        'matches!(&s, Value::Str(__s) if __s.starts_with("a\\"b"))');
});

test('format! needle and a Value place needle reproduce the helper arms', () => {
    assert.equal(
        rewrite('starts_with(&url, &Value::Str(format!("{}{}", Value::Str("https://".into()), hostname).into()))'),
        'matches!(&url, Value::Str(__s) if __s.starts_with(format!("{}{}", Value::Str("https://".into()), hostname).as_str()))');
    assert.equal(
        rewrite('if (sub != Value::Null) && (starts_with(&sub, &subHash)) {'),
        'if (sub != Value::Null) && (matches!((&sub, &subHash), (Value::Str(__h), Value::Str(__p)) if __h.starts_with(__p.as_ref()))) {');
});

test('non-place haystack, call needle and qualified calls keep the helper', () => {
    for (const src of [
        'starts_with(&self.safe_string_k(x.clone(), "k", &[]), &Value::Str("a".into()))',
        'starts_with(&clientOrderId, &to_string_val(&id))',
        'ccxt::runtime::starts_with(&a, &Value::Str("a".into()))',
        'crate::runtime::ends_with(&a, &b)',
        'x.starts_with("a")',
        'pub fn starts_with(haystack: &Value, prefix: &Value) -> bool {',
    ]) {
        assert.equal(rewrite(src), src, src);
    }
});

test('adjacent sites on one line are all rewritten and the pass is idempotent', () => {
    const src = '(starts_with(&id, &Value::Str("X".into()))) || (starts_with(&id, &Value::Str("Z".into())))';
    const once = rewrite(src);
    assert.equal(once, '(matches!(&id, Value::Str(__s) if __s.starts_with("X"))) || (matches!(&id, Value::Str(__s) if __s.starts_with("Z")))');
    assert.equal(rewrite(once), once);
});
