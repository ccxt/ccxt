import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerSecret, redact, clearSecrets } from '../../ts/redact.js';

test ('redact replaces exact and uri-encoded secret occurrences', () => {
    clearSecrets ();
    registerSecret ('SUPERSECRETVALUE+/=', 'secret');
    const text = 'error: signature SUPERSECRETVALUE+/= rejected, url sig=' + encodeURIComponent ('SUPERSECRETVALUE+/=');
    const result = redact (text);
    assert.ok (!result.includes ('SUPERSECRETVALUE'));
    assert.ok (result.includes ('[redacted:secret]'));
});

test ('short values are not registered (would mangle unrelated output)', () => {
    clearSecrets ();
    registerSecret ('abc', 'apiKey');
    assert.equal (redact ('abc def'), 'abc def');
});

test ('redact is a no-op without registered secrets', () => {
    clearSecrets ();
    assert.equal (redact ('hello world'), 'hello world');
});
