/**
 * Tests for shared fragment schema
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    createFragmentRegistry,
    validateFragmentDefinition,
    resolveFragmentReference,
    mergeFragmentContent,
    type FragmentDefinition,
    type FragmentReference,
    type FragmentRegistry,
} from '../schemas/fragments.js';
import type { ParserDefinition, AuthMethod } from '../types/edl.js';

describe('Fragment Schema', () => {
    describe('Fragment Validation', () => {
        test('validates a valid fragment definition', () => {
            const fragment: FragmentDefinition = {
                id: 'common-auth',
                type: 'auth',
                name: 'Common HMAC Auth',
                content: {
                    type: 'hmac',
                    algorithm: 'sha256',
                    encoding: 'hex',
                } as AuthMethod,
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('rejects fragment without ID', () => {
            const fragment = {
                type: 'auth',
                name: 'Test',
                content: {},
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'id'));
        });

        test('rejects fragment without type', () => {
            const fragment = {
                id: 'test',
                name: 'Test',
                content: {},
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'type'));
        });

        test('rejects fragment with invalid type', () => {
            const fragment = {
                id: 'test',
                type: 'invalid',
                name: 'Test',
                content: {},
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'type'));
        });

        test('rejects fragment without name', () => {
            const fragment = {
                id: 'test',
                type: 'auth',
                content: {},
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'name'));
        });

        test('rejects fragment without content', () => {
            const fragment = {
                id: 'test',
                type: 'auth',
                name: 'Test',
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field === 'content'));
        });

        test('validates fragment with parameters', () => {
            const fragment: FragmentDefinition = {
                id: 'parameterized-parser',
                type: 'parser',
                name: 'Parameterized Parser',
                content: {
                    source: 'response',
                    mapping: {},
                } as ParserDefinition,
                parameters: [
                    { name: 'basePath', type: 'string', required: true },
                    { name: 'useArray', type: 'boolean', default: false },
                ],
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('rejects fragment with invalid parameters', () => {
            const fragment = {
                id: 'test',
                type: 'parser',
                name: 'Test',
                content: {},
                parameters: [
                    { name: 'test', type: 'invalid' },
                ],
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.field.includes('parameters')));
        });

        test('validates fragment with metadata', () => {
            const fragment: FragmentDefinition = {
                id: 'versioned-fragment',
                type: 'auth',
                name: 'Versioned Fragment',
                content: { type: 'hmac' } as AuthMethod,
                metadata: {
                    version: '1.0.0',
                    author: 'CCXT',
                    tags: ['common', 'auth'],
                    deprecated: false,
                },
            };

            const result = validateFragmentDefinition(fragment);
            assert.equal(result.valid, true);
        });
    });

    describe('Fragment Registry', () => {
        test('creates empty registry', () => {
            const registry = createFragmentRegistry();
            assert.ok(registry);
            assert.ok(registry.fragments);
            assert.equal(Object.keys(registry.fragments).length, 0);
        });

        test('registers a fragment', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'test-fragment',
                type: 'auth',
                name: 'Test Fragment',
                content: { type: 'apiKey' } as AuthMethod,
            };

            registry.register(fragment);
            assert.equal(Object.keys(registry.fragments).length, 1);
            assert.ok(registry.fragments['test-fragment']);
        });

        test('retrieves registered fragment', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'retrieve-test',
                type: 'auth',
                name: 'Retrieve Test',
                content: { type: 'hmac' } as AuthMethod,
            };

            registry.register(fragment);
            const retrieved = registry.get('retrieve-test');
            assert.ok(retrieved);
            assert.equal(retrieved.id, 'retrieve-test');
            assert.equal(retrieved.name, 'Retrieve Test');
        });

        test('returns undefined for non-existent fragment', () => {
            const registry = createFragmentRegistry();
            const retrieved = registry.get('non-existent');
            assert.equal(retrieved, undefined);
        });

        test('rejects duplicate fragment IDs', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'duplicate',
                type: 'auth',
                name: 'First',
                content: { type: 'hmac' } as AuthMethod,
            };

            registry.register(fragment);

            const duplicate: FragmentDefinition = {
                id: 'duplicate',
                type: 'auth',
                name: 'Second',
                content: { type: 'apiKey' } as AuthMethod,
            };

            assert.throws(() => {
                registry.register(duplicate);
            }, /already registered/);
        });

        test('rejects invalid fragment on registration', () => {
            const registry = createFragmentRegistry();
            const invalid = {
                id: 'invalid',
                type: 'wrong',
                name: 'Invalid',
                content: {},
            } as any;

            assert.throws(() => {
                registry.register(invalid);
            }, /Invalid fragment definition/);
        });
    });

    describe('Fragment Resolution', () => {
        test('resolves simple fragment reference', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'simple-auth',
                type: 'auth',
                name: 'Simple Auth',
                content: {
                    type: 'hmac',
                    algorithm: 'sha256',
                } as AuthMethod,
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'simple-auth',
            };

            const resolved = registry.resolve(ref);
            assert.ok(resolved);
            assert.equal((resolved as AuthMethod).type, 'hmac');
            assert.equal((resolved as AuthMethod).algorithm, 'sha256');
        });

        test('throws error for non-existent fragment', () => {
            const registry = createFragmentRegistry();
            const ref: FragmentReference = {
                fragmentId: 'non-existent',
            };

            assert.throws(() => {
                registry.resolve(ref);
            }, /not found/);
        });

        test('resolves fragment with parameters', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'parameterized',
                type: 'parser',
                name: 'Parameterized Parser',
                content: {
                    source: '{{sourcePath}}',
                    path: '{{dataPath}}',
                    mapping: {},
                } as ParserDefinition,
                parameters: [
                    { name: 'sourcePath', type: 'string', required: true },
                    { name: 'dataPath', type: 'string', required: true },
                ],
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'parameterized',
                arguments: {
                    sourcePath: 'response.data',
                    dataPath: 'items',
                },
            };

            const resolved = registry.resolve(ref) as ParserDefinition;
            assert.equal(resolved.source, 'response.data');
            assert.equal(resolved.path, 'items');
        });

        test('applies default parameter values', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'with-defaults',
                type: 'parser',
                name: 'Parser with Defaults',
                content: {
                    source: '{{source}}',
                    isArray: false,
                    mapping: {},
                } as any,
                parameters: [
                    { name: 'source', type: 'string', default: 'response' },
                ],
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'with-defaults',
            };

            const resolved = registry.resolve(ref) as ParserDefinition;
            assert.equal(resolved.source, 'response');
        });

        test('throws error for missing required parameters', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'requires-params',
                type: 'parser',
                name: 'Requires Params',
                content: {
                    source: '{{source}}',
                    mapping: {},
                } as ParserDefinition,
                parameters: [
                    { name: 'source', type: 'string', required: true },
                ],
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'requires-params',
            };

            assert.throws(() => {
                registry.resolve(ref);
            }, /Required parameter/);
        });

        test('validates parameter types', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'typed-params',
                type: 'parser',
                name: 'Typed Params',
                content: {
                    source: 'response',
                    mapping: {},
                } as ParserDefinition,
                parameters: [
                    { name: 'count', type: 'number', required: true },
                ],
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'typed-params',
                arguments: {
                    count: 'not-a-number',
                },
            };

            assert.throws(() => {
                registry.resolve(ref);
            }, /Invalid fragment parameters/);
        });
    });

    describe('Fragment Overrides', () => {
        test('applies simple overrides', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'base-auth',
                type: 'auth',
                name: 'Base Auth',
                content: {
                    type: 'hmac',
                    algorithm: 'sha256',
                    encoding: 'hex',
                } as AuthMethod,
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'base-auth',
                overrides: {
                    algorithm: 'sha512',
                },
            };

            const resolved = registry.resolve(ref) as AuthMethod;
            assert.equal(resolved.type, 'hmac');
            assert.equal(resolved.algorithm, 'sha512');
            assert.equal(resolved.encoding, 'hex');
        });

        test('merges nested overrides', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'nested',
                type: 'parser',
                name: 'Nested',
                content: {
                    source: 'response',
                    mapping: {
                        id: { path: 'id' },
                        name: { path: 'name' },
                    },
                } as any,
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'nested',
                overrides: {
                    mapping: {
                        id: { path: 'identifier' },
                        symbol: { path: 'symbol' },
                    },
                },
            };

            const resolved = registry.resolve(ref) as any;
            assert.equal(resolved.mapping.id.path, 'identifier');
            assert.equal(resolved.mapping.name.path, 'name');
            assert.equal(resolved.mapping.symbol.path, 'symbol');
        });

        test('deletes fields with null overrides', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'with-optional',
                type: 'auth',
                name: 'With Optional',
                content: {
                    type: 'hmac',
                    algorithm: 'sha256',
                    encoding: 'hex',
                    location: 'header',
                } as AuthMethod,
            };

            registry.register(fragment);

            const ref: FragmentReference = {
                fragmentId: 'with-optional',
                overrides: {
                    location: null,
                },
            };

            const resolved = registry.resolve(ref) as AuthMethod;
            assert.equal(resolved.type, 'hmac');
            assert.equal(resolved.algorithm, 'sha256');
            assert.equal(resolved.location, undefined);
        });
    });

    describe('Merge Fragment Content', () => {
        test('merges simple objects', () => {
            const base = { a: 1, b: 2 };
            const overrides = { b: 3, c: 4 };
            const result = mergeFragmentContent(base, overrides);

            assert.equal(result.a, 1);
            assert.equal(result.b, 3);
            assert.equal(result.c, 4);
        });

        test('merges nested objects', () => {
            const base = {
                level1: {
                    level2: {
                        a: 1,
                        b: 2,
                    },
                },
            };
            const overrides = {
                level1: {
                    level2: {
                        b: 3,
                        c: 4,
                    },
                },
            };
            const result = mergeFragmentContent(base, overrides);

            assert.equal(result.level1.level2.a, 1);
            assert.equal(result.level1.level2.b, 3);
            assert.equal(result.level1.level2.c, 4);
        });

        test('replaces arrays', () => {
            const base = { items: [1, 2, 3] };
            const overrides = { items: [4, 5] };
            const result = mergeFragmentContent(base, overrides);

            assert.deepEqual(result.items, [4, 5]);
        });

        test('deletes fields with null', () => {
            const base = { a: 1, b: 2, c: 3 };
            const overrides = { b: null };
            const result = mergeFragmentContent(base, overrides);

            assert.equal(result.a, 1);
            assert.equal(result.b, undefined);
            assert.equal(result.c, 3);
        });

        test('handles non-object base', () => {
            const base = 'string';
            const overrides = { a: 1 };
            const result = mergeFragmentContent(base, overrides);

            assert.equal(result, 'string');
        });
    });

    describe('Fragment Types', () => {
        test('supports api fragment type', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'api-fragment',
                type: 'api',
                name: 'API Fragment',
                content: {
                    get: {
                        ticker: { path: '/ticker/{symbol}' },
                    },
                },
            };

            registry.register(fragment);
            const retrieved = registry.get('api-fragment');
            assert.equal(retrieved?.type, 'api');
        });

        test('supports parser fragment type', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'parser-fragment',
                type: 'parser',
                name: 'Parser Fragment',
                content: {
                    source: 'response',
                    mapping: {},
                } as ParserDefinition,
            };

            registry.register(fragment);
            const retrieved = registry.get('parser-fragment');
            assert.equal(retrieved?.type, 'parser');
        });

        test('supports auth fragment type', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'auth-fragment',
                type: 'auth',
                name: 'Auth Fragment',
                content: { type: 'hmac' } as AuthMethod,
            };

            registry.register(fragment);
            const retrieved = registry.get('auth-fragment');
            assert.equal(retrieved?.type, 'auth');
        });

        test('supports errors fragment type', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'errors-fragment',
                type: 'errors',
                name: 'Errors Fragment',
                content: {
                    patterns: [],
                },
            };

            registry.register(fragment);
            const retrieved = registry.get('errors-fragment');
            assert.equal(retrieved?.type, 'errors');
        });

        test('supports markets fragment type', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'markets-fragment',
                type: 'markets',
                name: 'Markets Fragment',
                content: {
                    endpoint: '/markets',
                },
            };

            registry.register(fragment);
            const retrieved = registry.get('markets-fragment');
            assert.equal(retrieved?.type, 'markets');
        });
    });

    describe('Fragment Metadata', () => {
        test('stores and retrieves metadata', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'with-metadata',
                type: 'auth',
                name: 'With Metadata',
                content: { type: 'hmac' } as AuthMethod,
                metadata: {
                    version: '2.1.0',
                    author: 'CCXT Team',
                    createdAt: '2025-01-01T00:00:00Z',
                    tags: ['auth', 'hmac', 'common'],
                },
            };

            registry.register(fragment);
            const retrieved = registry.get('with-metadata');

            assert.ok(retrieved?.metadata);
            assert.equal(retrieved.metadata.version, '2.1.0');
            assert.equal(retrieved.metadata.author, 'CCXT Team');
            assert.equal(retrieved.metadata.tags?.length, 3);
        });

        test('handles deprecated fragments', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'deprecated-fragment',
                type: 'auth',
                name: 'Deprecated Fragment',
                content: { type: 'apiKey' } as AuthMethod,
                metadata: {
                    deprecated: true,
                    replacedBy: 'new-fragment',
                },
            };

            registry.register(fragment);
            const retrieved = registry.get('deprecated-fragment');

            assert.equal(retrieved?.metadata?.deprecated, true);
            assert.equal(retrieved?.metadata?.replacedBy, 'new-fragment');
        });
    });
});
