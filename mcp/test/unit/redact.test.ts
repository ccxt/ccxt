import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerSecret, unregisterSecret, redact, clearSecrets } from '../../ts/redact.js';

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

test ('registerSecret reports whether it added the value, so a provisional registration can be taken back safely', () => {
    clearSecrets ();
    assert.equal (registerSecret ('ACCOUNTSECRET-123456', 'secret'), true);
    // the same value again (a form re-testing keys an account already uses) is not "added"…
    assert.equal (registerSecret ('ACCOUNTSECRET-123456', 'secret'), false);
    assert.equal (registerSecret ('abc', 'secret'), false, 'too short to register at all');
    assert.equal (registerSecret (undefined, 'secret'), false);
    // …and one that was added can be removed without touching the others
    assert.equal (registerSecret ('ONLYTESTED-123456', 'apiKey'), true);
    unregisterSecret ('ONLYTESTED-123456');
    unregisterSecret (undefined);
    unregisterSecret ('never-registered');
    assert.equal (redact ('ONLYTESTED-123456 ACCOUNTSECRET-123456'), 'ONLYTESTED-123456 [redacted:secret]');
});
