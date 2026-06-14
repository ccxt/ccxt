import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { FieldMapping } from '../types/edl.js';
import {
    analyzeComputeDependencies,
    extractFieldReferences,
    resolveComputeOrder,
} from '../helpers/mapping-dependencies.js';

describe('Mapping Dependency Utilities', () => {
    test('extractFieldReferences parses placeholders', () => {
        const refs = extractFieldReferences('({last} - {open}) / {open}');
        assert.deepEqual(refs, ['last', 'open', 'open']);
    });

    test('analyzeComputeDependencies orders fields respecting dependencies', () => {
        const mapping: Record<string, FieldMapping> = {
            last: { path: 'lastPrice' },
            open: { path: 'openPrice' },
            change: {
                compute: '{last} - {open}',
            },
            changePercent: {
                compute: '({change} / {open}) * 100',
            },
        };

        const analysis = analyzeComputeDependencies(mapping);
        assert.equal(analysis.cycles.length, 0);
        assert.equal(analysis.missing.size, 0);
        assert.deepEqual(analysis.ordered, ['change', 'changePercent']);
        assert.deepEqual(analysis.unresolved, []);
    });

    test('analyzeComputeDependencies detects missing references', () => {
        const mapping: Record<string, FieldMapping> = {
            price: { path: 'price' },
            normalized: {
                compute: '{price} / {divider}',
            },
        };

        const analysis = analyzeComputeDependencies(mapping);
        assert.equal(analysis.cycles.length, 0);
        assert.equal(analysis.missing.size, 1);
        assert.deepEqual(analysis.missing.get('normalized'), ['divider']);
    });

    test('analyzeComputeDependencies detects cycles', () => {
        const mapping: Record<string, FieldMapping> = {
            a: {
                compute: '{b}',
                dependencies: ['b'],
            },
            b: {
                compute: '{a}',
                dependencies: ['a'],
            },
        };

        const analysis = analyzeComputeDependencies(mapping);
        assert.equal(analysis.missing.size, 0);
        assert.equal(analysis.cycles.length, 1);
        assert.deepEqual(analysis.cycles[0], ['a', 'b', 'a']);
        assert.deepEqual(new Set(analysis.unresolved), new Set(['a', 'b']));
    });

    test('resolveComputeOrder falls back to definition order when needed', () => {
        const mapping: Record<string, FieldMapping> = {
            base: { path: 'price' },
            derived: {
                compute: '{base}',
            },
            independent: {
                compute: '42',
            },
        };

        const order = resolveComputeOrder(mapping);
        assert.deepEqual(order, ['derived', 'independent']);
    });
});
