import assert from 'node:assert/strict';
import test from 'node:test';
import { createPostHog } from '../../ts/posthog.js';

test ('analytics stays off without a project token', () => {
    assert.equal (createPostHog (undefined, undefined), undefined);
    assert.equal (createPostHog ('  ', 'https://eu.i.posthog.com'), undefined);
});
