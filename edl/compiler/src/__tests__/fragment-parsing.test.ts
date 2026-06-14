/**
 * Tests for fragment reference parsing
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    FragmentReferenceParser,
    parseFragmentReferences,
    validateFragmentReferences,
    extractFragmentContext,
    collectFragmentDependencies,
    detectCircularReferences,
    findCircularFragmentReferences,
    type ParsedFragmentReference,
    type FragmentContext,
} from '../parsing/fragments.js';
import { createFragmentRegistry, type FragmentDefinition } from '../schemas/fragments.js';
import type { AuthMethod, ParserDefinition } from '../types/edl.js';

describe('Fragment Reference Parsing', () => {
    describe('FragmentReferenceParser', () => {
        test('parses simple $ref style reference', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                auth: {
                    $ref: 'common-auth',
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'common-auth');
            assert.equal(refs[0].referenceType, 'ref');
            assert.equal(refs[0].context, 'auth');
        });

        test('parses $use style with arguments', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                parsers: {
                    ticker: {
                        $use: {
                            fragment: 'standard-parser',
                            with: {
                                basePath: 'data.ticker',
                                format: 'json',
                            },
                        },
                    },
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'standard-parser');
            assert.equal(refs[0].referenceType, 'use');
            assert.ok(refs[0].arguments);
            assert.equal(refs[0].arguments?.basePath, 'data.ticker');
            assert.equal(refs[0].arguments?.format, 'json');
        });

        test('parses @include style reference', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                api: {
                    '@include': 'rest-endpoints',
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'rest-endpoints');
            assert.equal(refs[0].referenceType, 'include');
        });

        test('parses extends style reference', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                errors: {
                    extends: 'base-errors',
                    patterns: [
                        { match: 'custom error', type: 'ExchangeError' },
                    ],
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'base-errors');
            assert.equal(refs[0].referenceType, 'extends');
        });

        test('parses multiple references in document', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                auth: { $ref: 'hmac-auth' },
                api: {
                    public: { $ref: 'public-endpoints' },
                    private: { $ref: 'private-endpoints' },
                },
                parsers: {
                    ticker: { $use: { fragment: 'ticker-parser' } },
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 4);

            const fragmentIds = refs.map(r => r.fragmentId);
            assert.ok(fragmentIds.includes('hmac-auth'));
            assert.ok(fragmentIds.includes('public-endpoints'));
            assert.ok(fragmentIds.includes('private-endpoints'));
            assert.ok(fragmentIds.includes('ticker-parser'));
        });

        test('extracts fragment ID from string', () => {
            const parser = new FragmentReferenceParser();
            const id = parser.extractFragmentId('my-fragment');
            assert.equal(id, 'my-fragment');
        });

        test('extracts fragment ID from object with fragment key', () => {
            const parser = new FragmentReferenceParser();
            const id = parser.extractFragmentId({ fragment: 'my-fragment' });
            assert.equal(id, 'my-fragment');
        });

        test('extracts fragment ID from object with id key', () => {
            const parser = new FragmentReferenceParser();
            const id = parser.extractFragmentId({ id: 'my-fragment' });
            assert.equal(id, 'my-fragment');
        });

        test('returns empty string for invalid fragment reference', () => {
            const parser = new FragmentReferenceParser();
            const id = parser.extractFragmentId({ invalid: 'value' });
            assert.equal(id, '');
        });

        test('extracts arguments from with clause', () => {
            const parser = new FragmentReferenceParser();
            const args = parser.extractArguments({
                fragment: 'test',
                with: { param1: 'value1', param2: 42 },
            });
            assert.ok(args);
            assert.equal(args.param1, 'value1');
            assert.equal(args.param2, 42);
        });

        test('extracts arguments from args clause', () => {
            const parser = new FragmentReferenceParser();
            const args = parser.extractArguments({
                fragment: 'test',
                args: { param1: 'value1' },
            });
            assert.ok(args);
            assert.equal(args.param1, 'value1');
        });

        test('extracts arguments from inline properties', () => {
            const parser = new FragmentReferenceParser();
            const args = parser.extractArguments({
                fragment: 'test',
                param1: 'value1',
                param2: 42,
            });
            assert.ok(args);
            assert.equal(args.param1, 'value1');
            assert.equal(args.param2, 42);
        });

        test('returns undefined when no arguments present', () => {
            const parser = new FragmentReferenceParser();
            const args = parser.extractArguments({
                fragment: 'test',
            });
            assert.equal(args, undefined);
        });

        test('parses $use with simple string value', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                parsers: {
                    ticker: {
                        $use: 'standard-parser',
                    },
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'standard-parser');
            assert.equal(refs[0].referenceType, 'use');
        });

        test('parses $ref with inline overrides', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                auth: {
                    $ref: 'hmac-auth',
                    algorithm: 'sha512', // override
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'hmac-auth');
            assert.ok(refs[0].overrides);
            assert.equal(refs[0].overrides?.algorithm, 'sha512');
        });

        test('parses $use with overrides clause', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                parsers: {
                    ticker: {
                        $use: {
                            fragment: 'standard-parser',
                            override: {
                                isArray: true,
                            },
                        },
                    },
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.ok(refs[0].overrides);
            assert.equal(refs[0].overrides?.isArray, true);
        });

        test('finds references in nested arrays', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                api: {
                    endpoints: [
                        { $ref: 'endpoint-1' },
                        { $ref: 'endpoint-2' },
                        { $ref: 'endpoint-3' },
                    ],
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 3);
        });

        test('finds references deeply nested', () => {
            const parser = new FragmentReferenceParser();
            const doc = {
                level1: {
                    level2: {
                        level3: {
                            level4: {
                                $ref: 'deeply-nested',
                            },
                        },
                    },
                },
            };

            const refs = parser.parse(doc);
            assert.equal(refs.length, 1);
            assert.equal(refs[0].fragmentId, 'deeply-nested');
            assert.equal(refs[0].location.path, 'level1.level2.level3.level4');
        });

        test('parses string content with YAML-style references', () => {
            const parser = new FragmentReferenceParser();
            const content = `
auth:
  $ref: "common-auth"
api:
  public:
    $ref: "public-api"
            `;

            const refs = parser.parse(content);
            assert.ok(refs.length >= 2);
            const ids = refs.map(r => r.fragmentId);
            assert.ok(ids.includes('common-auth'));
            assert.ok(ids.includes('public-api'));
        });

        test('parses string content with @include syntax', () => {
            const parser = new FragmentReferenceParser();
            const content = `
api:
  @include("rest-endpoints")
            `;

            const refs = parser.parse(content);
            assert.ok(refs.length >= 1);
            const ids = refs.map(r => r.fragmentId);
            assert.ok(ids.includes('rest-endpoints'));
        });
    });

    describe('Fragment Context Detection', () => {
        test('detects api context', () => {
            const context = extractFragmentContext('api.public.get.ticker');
            assert.equal(context, 'api');
        });

        test('detects parser context', () => {
            const context = extractFragmentContext('parsers.ticker');
            assert.equal(context, 'parser');
        });

        test('detects auth context', () => {
            const context = extractFragmentContext('auth.hmac');
            assert.equal(context, 'auth');
        });

        test('detects errors context', () => {
            const context = extractFragmentContext('errors.patterns[0]');
            assert.equal(context, 'errors');
        });

        test('detects markets context', () => {
            const context = extractFragmentContext('markets.endpoint');
            assert.equal(context, 'markets');
        });

        test('returns unknown for unrecognized context', () => {
            const context = extractFragmentContext('custom.section');
            assert.equal(context, 'unknown');
        });
    });

    describe('Fragment Reference Validation', () => {
        test('validates references against registry', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'test-fragment',
                type: 'auth',
                name: 'Test Fragment',
                content: { type: 'hmac' } as AuthMethod,
            };
            registry.register(fragment);

            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'test-fragment',
                    location: { path: 'auth' },
                    context: 'auth',
                    referenceType: 'ref',
                },
            ];

            const errors = validateFragmentReferences(refs, registry);
            assert.equal(errors.length, 0);
        });

        test('reports missing fragment', () => {
            const registry = createFragmentRegistry();
            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'non-existent',
                    location: { path: 'auth' },
                    context: 'auth',
                    referenceType: 'ref',
                },
            ];

            const errors = validateFragmentReferences(refs, registry);
            assert.equal(errors.length, 1);
            assert.ok(errors[0].error.includes('not found'));
        });

        test('reports deprecated fragment', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'old-fragment',
                type: 'auth',
                name: 'Old Fragment',
                content: { type: 'hmac' } as AuthMethod,
                metadata: {
                    deprecated: true,
                    replacedBy: 'new-fragment',
                },
            };
            registry.register(fragment);

            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'old-fragment',
                    location: { path: 'auth' },
                    context: 'auth',
                    referenceType: 'ref',
                },
            ];

            const errors = validateFragmentReferences(refs, registry);
            assert.equal(errors.length, 1);
            assert.ok(errors[0].error.includes('deprecated'));
            assert.ok(errors[0].error.includes('new-fragment'));
        });

        test('reports context mismatch', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'auth-fragment',
                type: 'auth',
                name: 'Auth Fragment',
                content: { type: 'hmac' } as AuthMethod,
            };
            registry.register(fragment);

            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'auth-fragment',
                    location: { path: 'parsers.ticker' },
                    context: 'parser',
                    referenceType: 'ref',
                },
            ];

            const errors = validateFragmentReferences(refs, registry);
            assert.equal(errors.length, 1);
            assert.ok(errors[0].error.includes('type'));
            assert.ok(errors[0].error.includes('context'));
        });

        test('allows unknown context without error', () => {
            const registry = createFragmentRegistry();
            const fragment: FragmentDefinition = {
                id: 'auth-fragment',
                type: 'auth',
                name: 'Auth Fragment',
                content: { type: 'hmac' } as AuthMethod,
            };
            registry.register(fragment);

            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'auth-fragment',
                    location: { path: 'custom.section' },
                    context: 'unknown',
                    referenceType: 'ref',
                },
            ];

            const errors = validateFragmentReferences(refs, registry);
            // Should only have 0 errors (unknown context doesn't trigger type mismatch)
            assert.equal(errors.length, 0);
        });
    });

    describe('Fragment Dependency Collection', () => {
        test('collects dependencies from references', () => {
            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'fragment-a',
                    location: { path: 'auth' },
                    context: 'auth',
                    referenceType: 'ref',
                },
                {
                    fragmentId: 'fragment-b',
                    location: { path: 'api' },
                    context: 'api',
                    referenceType: 'ref',
                },
            ];

            const deps = collectFragmentDependencies(refs);
            assert.ok(deps.has('auth'));
            assert.ok(deps.has('api'));
            assert.deepEqual(deps.get('auth')?.dependencies, ['fragment-a']);
            assert.deepEqual(deps.get('api')?.dependencies, ['fragment-b']);
        });

        test('groups multiple dependencies from same section', () => {
            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'fragment-a',
                    location: { path: 'api.public' },
                    context: 'api',
                    referenceType: 'ref',
                },
                {
                    fragmentId: 'fragment-b',
                    location: { path: 'api.private' },
                    context: 'api',
                    referenceType: 'ref',
                },
            ];

            const deps = collectFragmentDependencies(refs);
            assert.ok(deps.has('api'));
            assert.equal(deps.get('api')?.dependencies.length, 2);
        });

        test('removes duplicate dependencies', () => {
            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'fragment-a',
                    location: { path: 'auth.method1' },
                    context: 'auth',
                    referenceType: 'ref',
                },
                {
                    fragmentId: 'fragment-a',
                    location: { path: 'auth.method2' },
                    context: 'auth',
                    referenceType: 'ref',
                },
            ];

            const deps = collectFragmentDependencies(refs);
            assert.ok(deps.has('auth'));
            assert.equal(deps.get('auth')?.dependencies.length, 1);
            assert.deepEqual(deps.get('auth')?.dependencies, ['fragment-a']);
        });
    });

    describe('Circular Reference Detection', () => {
        test('detects simple circular dependency', () => {
            const deps = new Map([
                ['a', { fragmentId: 'a', dependencies: ['b'] }],
                ['b', { fragmentId: 'b', dependencies: ['a'] }],
            ]);

            const cycles = detectCircularReferences(deps);
            assert.ok(cycles.length > 0);
        });

        test('detects longer circular chain', () => {
            const deps = new Map([
                ['a', { fragmentId: 'a', dependencies: ['b'] }],
                ['b', { fragmentId: 'b', dependencies: ['c'] }],
                ['c', { fragmentId: 'c', dependencies: ['a'] }],
            ]);

            const cycles = detectCircularReferences(deps);
            assert.ok(cycles.length > 0);
        });

        test('returns empty for acyclic graph', () => {
            const deps = new Map([
                ['a', { fragmentId: 'a', dependencies: ['b'] }],
                ['b', { fragmentId: 'b', dependencies: ['c'] }],
                ['c', { fragmentId: 'c', dependencies: [] }],
            ]);

            const cycles = detectCircularReferences(deps);
            assert.equal(cycles.length, 0);
        });

        test('handles graph with no dependencies', () => {
            const deps = new Map([
                ['a', { fragmentId: 'a', dependencies: [] }],
                ['b', { fragmentId: 'b', dependencies: [] }],
            ]);

            const cycles = detectCircularReferences(deps);
            assert.equal(cycles.length, 0);
        });

        test('detects self-reference', () => {
            const deps = new Map([
                ['a', { fragmentId: 'a', dependencies: ['a'] }],
            ]);

            const cycles = detectCircularReferences(deps);
            assert.ok(cycles.length > 0);
        });
    });

    describe('Circular Fragment References', () => {
        test('detects circular references in fragments', () => {
            const registry = createFragmentRegistry();

            // Create fragment A that references B
            const fragmentA: FragmentDefinition = {
                id: 'fragment-a',
                type: 'parser',
                name: 'Fragment A',
                content: {
                    source: 'response',
                    mapping: {
                        nested: { $ref: 'fragment-b' },
                    },
                } as any,
            };

            // Create fragment B that references A (circular!)
            const fragmentB: FragmentDefinition = {
                id: 'fragment-b',
                type: 'parser',
                name: 'Fragment B',
                content: {
                    source: 'response',
                    mapping: {
                        nested: { $ref: 'fragment-a' },
                    },
                } as any,
            };

            registry.register(fragmentA);
            registry.register(fragmentB);

            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'fragment-a',
                    location: { path: 'parsers.main' },
                    context: 'parser',
                    referenceType: 'ref',
                },
            ];

            const cycles = findCircularFragmentReferences(refs, registry);
            assert.ok(cycles.length > 0);
        });

        test('returns empty for non-circular fragments', () => {
            const registry = createFragmentRegistry();

            const fragmentA: FragmentDefinition = {
                id: 'fragment-a',
                type: 'parser',
                name: 'Fragment A',
                content: {
                    source: 'response',
                    mapping: {},
                } as ParserDefinition,
            };

            const fragmentB: FragmentDefinition = {
                id: 'fragment-b',
                type: 'parser',
                name: 'Fragment B',
                content: {
                    source: 'response',
                    mapping: {
                        nested: { $ref: 'fragment-a' },
                    },
                } as any,
            };

            registry.register(fragmentA);
            registry.register(fragmentB);

            const refs: ParsedFragmentReference[] = [
                {
                    fragmentId: 'fragment-b',
                    location: { path: 'parsers.main' },
                    context: 'parser',
                    referenceType: 'ref',
                },
            ];

            const cycles = findCircularFragmentReferences(refs, registry);
            assert.equal(cycles.length, 0);
        });
    });

    describe('parseFragmentReferences utility', () => {
        test('parses references from document', () => {
            const doc = {
                auth: { $ref: 'hmac-auth' },
                api: { $ref: 'rest-api' },
            };

            const refs = parseFragmentReferences(doc);
            assert.equal(refs.length, 2);
        });

        test('works with empty document', () => {
            const refs = parseFragmentReferences({});
            assert.equal(refs.length, 0);
        });

        test('works with document without references', () => {
            const doc = {
                auth: { type: 'hmac' },
                api: { public: {} },
            };

            const refs = parseFragmentReferences(doc);
            assert.equal(refs.length, 0);
        });
    });

    describe('Edge Cases', () => {
        test('handles null values', () => {
            const parser = new FragmentReferenceParser();
            const refs = parser.findReferences(null, 'test');
            assert.equal(refs.length, 0);
        });

        test('handles undefined values', () => {
            const parser = new FragmentReferenceParser();
            const refs = parser.findReferences(undefined, 'test');
            assert.equal(refs.length, 0);
        });

        test('handles primitive values', () => {
            const parser = new FragmentReferenceParser();
            const refs = parser.findReferences('string', 'test');
            assert.equal(refs.length, 0);
        });

        test('handles empty arrays', () => {
            const parser = new FragmentReferenceParser();
            const refs = parser.findReferences([], 'test');
            assert.equal(refs.length, 0);
        });

        test('handles empty objects', () => {
            const parser = new FragmentReferenceParser();
            const refs = parser.findReferences({}, 'test');
            assert.equal(refs.length, 0);
        });

        test('handles malformed JSON string', () => {
            const parser = new FragmentReferenceParser();
            const refs = parser.parse('{ invalid json }');
            assert.equal(refs.length, 0);
        });
    });
});
