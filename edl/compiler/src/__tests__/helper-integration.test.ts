/**
 * Helper Integration Tests
 *
 * Tests for the helper library integration system that injects helper imports
 * and function calls into DSL-generated code.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    HelperIntegrator,
    createDeltaSnapshotIntegrator,
    createArrayOperationsIntegrator,
    analyzeCodeForHelpers,
    type HelperFunction,
    type CodeGenContext,
    type ImportStatements,
} from '../generator/helper-integration.js';
import type { ArrayOperation } from '../syntax/array-operations.js';

describe('HelperIntegrator', () => {
    describe('constructor', () => {
        it('should create integrator with default context', () => {
            const integrator = new HelperIntegrator();
            const context = integrator.getContext();

            assert.equal(context.usesDeltaSnapshot, false);
            assert.equal(context.usesExpressions, false);
            assert.equal(context.arrayOperations.length, 0);
            assert.equal(context.usedFeatures.size, 0);
        });

        it('should create integrator with custom context', () => {
            const integrator = new HelperIntegrator({
                usesDeltaSnapshot: true,
                usesExpressions: true,
            });
            const context = integrator.getContext();

            assert.equal(context.usesDeltaSnapshot, true);
            assert.equal(context.usesExpressions, true);
        });
    });

    describe('detectRequiredHelpers', () => {
        it('should detect delta/snapshot helpers', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('applyDelta'));
            assert.ok(helpers.includes('createSnapshot'));
            assert.ok(helpers.includes('cloneSnapshot'));
        });

        it('should detect orderbook helpers when orderbook feature is used', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();
            integrator.addFeature('orderbook');

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('applyOrderBookDelta'));
            assert.ok(helpers.includes('mergeOrderBookLevels'));
            assert.ok(helpers.includes('sortOrderBook'));
        });

        it('should detect validation helpers', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();
            integrator.addFeature('validation');

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('validateDelta'));
        });

        it('should detect sequence tracking helpers', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();
            integrator.addFeature('sequence-tracking');

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('sortDeltasBySequence'));
            assert.ok(helpers.includes('findGaps'));
        });

        it('should detect array operation helpers', () => {
            const integrator = new HelperIntegrator();
            const mapOp: ArrayOperation = {
                op: 'map',
                array: 'items',
                transform: { params: ['x'], body: 'x.price' },
            };
            integrator.addArrayOperation(mapOp);

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('evaluateMapOperation'));
        });

        it('should use generic evaluator for multiple operation types', () => {
            const integrator = new HelperIntegrator();

            const mapOp: ArrayOperation = {
                op: 'map',
                array: 'items',
                transform: { params: ['x'], body: 'x.price' },
            };
            const filterOp: ArrayOperation = {
                op: 'filter',
                array: 'items',
                predicate: { params: ['x'], body: 'x > 100' },
            };

            integrator.addArrayOperation(mapOp);
            integrator.addArrayOperation(filterOp);

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('evaluateArrayOperation'));
        });

        it('should detect expression evaluator', () => {
            const integrator = new HelperIntegrator();
            integrator.enableExpressions();

            const helpers = integrator.detectRequiredHelpers();

            assert.ok(helpers.includes('SafeExpressionEvaluator'));
        });
    });

    describe('generateImportStatements', () => {
        it('should generate import statements for delta/snapshot helpers', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();

            const imports = integrator.generateImportStatements();

            assert.ok(imports.namedImports.includes('applyDelta'));
            assert.ok(imports.namedImports.includes('createSnapshot'));
            assert.ok(imports.statements.length > 0);

            // Check that import statement contains helper path
            const deltaImport = imports.statements.find(stmt =>
                stmt.includes('../helpers/delta-snapshot.js')
            );
            assert.ok(deltaImport);
            assert.ok(deltaImport.includes('applyDelta'));
        });

        it('should generate import statements for array helpers', () => {
            const integrator = new HelperIntegrator();
            const mapOp: ArrayOperation = {
                op: 'map',
                array: 'items',
                transform: { params: ['x'], body: 'x.price' },
            };
            integrator.addArrayOperation(mapOp);

            const imports = integrator.generateImportStatements();

            assert.ok(imports.namedImports.includes('evaluateMapOperation'));

            const arrayImport = imports.statements.find(stmt =>
                stmt.includes('../evaluation/array-functions.js')
            );
            assert.ok(arrayImport);
        });

        it('should group imports by path', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();
            integrator.addFeature('orderbook');
            integrator.addFeature('validation');

            const imports = integrator.generateImportStatements();

            // All delta/snapshot helpers should be in one import
            const deltaImports = imports.statements.filter(stmt =>
                stmt.includes('../helpers/delta-snapshot.js')
            );
            assert.equal(deltaImports.length, 1);

            // Should include multiple helpers in single import
            const deltaImport = deltaImports[0];
            assert.ok(deltaImport.includes('applyDelta'));
            assert.ok(deltaImport.includes('validateDelta'));
            assert.ok(deltaImport.includes('applyOrderBookDelta'));
        });

        it('should sort imports alphabetically', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();
            integrator.addFeature('validation');

            const imports = integrator.generateImportStatements();
            const namedImports = imports.namedImports;

            // Check if sorted
            const sorted = [...namedImports].sort();
            assert.deepEqual(namedImports, sorted);
        });
    });

    describe('generateHelperCall', () => {
        it('should generate basic helper call', () => {
            const integrator = new HelperIntegrator();
            const call = integrator.generateHelperCall('applyDelta', [
                'snapshot',
                'delta',
            ]);

            assert.equal(call, 'applyDelta(snapshot, delta);');
        });

        it('should generate helper call with assignment', () => {
            const integrator = new HelperIntegrator();
            const call = integrator.generateHelperCall(
                'applyDelta',
                ['snapshot', 'delta'],
                { assignTo: 'newSnapshot' }
            );

            assert.equal(call, 'newSnapshot = applyDelta(snapshot, delta);');
        });

        it('should generate async helper call', () => {
            const integrator = new HelperIntegrator();
            const call = integrator.generateHelperCall(
                'applyDelta',
                ['snapshot', 'delta'],
                { isAsync: true }
            );

            assert.equal(call, 'await applyDelta(snapshot, delta);');
        });

        it('should generate async helper call with assignment', () => {
            const integrator = new HelperIntegrator();
            const call = integrator.generateHelperCall(
                'applyDelta',
                ['snapshot', 'delta'],
                { assignTo: 'newSnapshot', isAsync: true }
            );

            assert.equal(
                call,
                'newSnapshot = await applyDelta(snapshot, delta);'
            );
        });

        it('should throw error for unknown helper', () => {
            const integrator = new HelperIntegrator();
            assert.throws(
                () => integrator.generateHelperCall('unknownHelper', []),
                /Unknown helper function/
            );
        });
    });

    describe('helper metadata', () => {
        it('should get helper metadata', () => {
            const integrator = new HelperIntegrator();
            const metadata = integrator.getHelperMetadata('applyDelta');

            assert.ok(metadata);
            assert.equal(metadata.name, 'applyDelta');
            assert.equal(metadata.category, 'delta-snapshot');
            assert.equal(metadata.importPath, '../helpers/delta-snapshot.js');
            assert.equal(metadata.isNamedExport, true);
        });

        it('should get helpers by category', () => {
            const integrator = new HelperIntegrator();
            const deltaHelpers = integrator.getHelpersByCategory('delta-snapshot');

            assert.ok(deltaHelpers.length > 0);
            assert.ok(deltaHelpers.every(h => h.category === 'delta-snapshot'));
            assert.ok(deltaHelpers.some(h => h.name === 'applyDelta'));
            assert.ok(deltaHelpers.some(h => h.name === 'createSnapshot'));
        });

        it('should get array operation helpers by category', () => {
            const integrator = new HelperIntegrator();
            const arrayHelpers = integrator.getHelpersByCategory('array-operations');

            assert.ok(arrayHelpers.length > 0);
            assert.ok(arrayHelpers.every(h => h.category === 'array-operations'));
            assert.ok(arrayHelpers.some(h => h.name === 'evaluateMapOperation'));
            assert.ok(arrayHelpers.some(h => h.name === 'evaluateFilterOperation'));
        });
    });

    describe('isHelperRequired', () => {
        it('should check if helper is required', () => {
            const integrator = new HelperIntegrator();
            integrator.enableDeltaSnapshot();

            assert.equal(integrator.isHelperRequired('applyDelta'), true);
            assert.equal(integrator.isHelperRequired('createSnapshot'), true);
            assert.equal(
                integrator.isHelperRequired('evaluateMapOperation'),
                false
            );
        });
    });
});

describe('createDeltaSnapshotIntegrator', () => {
    it('should create integrator with basic delta/snapshot support', () => {
        const integrator = createDeltaSnapshotIntegrator();
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('applyDelta'));
        assert.ok(helpers.includes('createSnapshot'));
    });

    it('should include orderbook helpers when specified', () => {
        const integrator = createDeltaSnapshotIntegrator({
            includeOrderBook: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('applyOrderBookDelta'));
        assert.ok(helpers.includes('mergeOrderBookLevels'));
    });

    it('should include validation helpers when specified', () => {
        const integrator = createDeltaSnapshotIntegrator({
            includeValidation: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('validateDelta'));
    });

    it('should include sequence tracking helpers when specified', () => {
        const integrator = createDeltaSnapshotIntegrator({
            includeSequenceTracking: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('sortDeltasBySequence'));
        assert.ok(helpers.includes('findGaps'));
    });

    it('should include merge helpers when specified', () => {
        const integrator = createDeltaSnapshotIntegrator({
            includeMerge: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('mergeDelta'));
    });

    it('should support multiple options together', () => {
        const integrator = createDeltaSnapshotIntegrator({
            includeOrderBook: true,
            includeValidation: true,
            includeSequenceTracking: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('applyOrderBookDelta'));
        assert.ok(helpers.includes('validateDelta'));
        assert.ok(helpers.includes('findGaps'));
    });
});

describe('createArrayOperationsIntegrator', () => {
    it('should create integrator for map operation', () => {
        const mapOp: ArrayOperation = {
            op: 'map',
            array: 'items',
            transform: { params: ['x'], body: 'x.price' },
        };

        const integrator = createArrayOperationsIntegrator([mapOp]);
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('evaluateMapOperation'));
    });

    it('should create integrator for multiple operations', () => {
        const mapOp: ArrayOperation = {
            op: 'map',
            array: 'items',
            transform: { params: ['x'], body: 'x.price' },
        };
        const filterOp: ArrayOperation = {
            op: 'filter',
            array: 'items',
            predicate: { params: ['x'], body: 'x > 100' },
        };

        const integrator = createArrayOperationsIntegrator([mapOp, filterOp]);
        const helpers = integrator.detectRequiredHelpers();

        // Should use generic evaluator for multiple operation types
        assert.ok(helpers.includes('evaluateArrayOperation'));
    });

    it('should include validation when specified', () => {
        const mapOp: ArrayOperation = {
            op: 'map',
            array: 'items',
            transform: { params: ['x'], body: 'x.price' },
        };

        const integrator = createArrayOperationsIntegrator([mapOp], {
            includeValidation: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('validateArrayOperation'));
    });

    it('should include expression evaluator when specified', () => {
        const mapOp: ArrayOperation = {
            op: 'map',
            array: 'items',
            transform: { params: ['x'], body: 'x.price' },
        };

        const integrator = createArrayOperationsIntegrator([mapOp], {
            includeExpressions: true,
        });
        const helpers = integrator.detectRequiredHelpers();

        assert.ok(helpers.includes('SafeExpressionEvaluator'));
    });
});

describe('analyzeCodeForHelpers', () => {
    it('should detect applyDelta usage', () => {
        const code = `
            const newSnapshot = applyDelta(snapshot, delta);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('applyDelta'));
    });

    it('should detect orderbook helpers', () => {
        const code = `
            const orderbook = applyOrderBookDelta(currentOrderBook, delta);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('applyOrderBookDelta'));
    });

    it('should detect validation helpers', () => {
        const code = `
            const valid = validateDelta(delta, snapshot);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('validateDelta'));
    });

    it('should detect map operation', () => {
        const code = `
            const prices = items.map(x => x.price);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('evaluateMapOperation'));
    });

    it('should detect filter operation', () => {
        const code = `
            const filtered = items.filter(x => x > 100);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('evaluateFilterOperation'));
    });

    it('should detect reduce operation', () => {
        const code = `
            const sum = items.reduce((acc, x) => acc + x, 0);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('evaluateReduceOperation'));
    });

    it('should detect slice operation', () => {
        const code = `
            const subset = items.slice(0, 10);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('evaluateSliceOperation'));
    });

    it('should detect flatMap operation', () => {
        const code = `
            const flattened = items.flatMap(x => x.items);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('evaluateFlatMapOperation'));
    });

    it('should detect multiple helpers in complex code', () => {
        const code = `
            const newSnapshot = applyDelta(snapshot, delta);
            const prices = items.map(x => x.price);
            const filtered = prices.filter(p => p > 100);
            const orderbook = applyOrderBookDelta(currentOrderBook, bookDelta);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.ok(helpers.includes('applyDelta'));
        assert.ok(helpers.includes('evaluateMapOperation'));
        assert.ok(helpers.includes('evaluateFilterOperation'));
        assert.ok(helpers.includes('applyOrderBookDelta'));
    });

    it('should return empty array for code without helpers', () => {
        const code = `
            const x = 5;
            const y = x + 10;
            console.log(y);
        `;
        const helpers = analyzeCodeForHelpers(code);

        assert.equal(helpers.length, 0);
    });
});

describe('Integration scenarios', () => {
    it('should support WebSocket orderbook reconciliation scenario', () => {
        const integrator = createDeltaSnapshotIntegrator({
            includeOrderBook: true,
            includeValidation: true,
            includeSequenceTracking: true,
        });

        const imports = integrator.generateImportStatements();

        // Should include all necessary helpers for orderbook reconciliation
        assert.ok(imports.namedImports.includes('applyOrderBookDelta'));
        assert.ok(imports.namedImports.includes('validateDelta'));
        assert.ok(imports.namedImports.includes('findGaps'));
        assert.ok(imports.namedImports.includes('sortOrderBook'));
    });

    it('should support data transformation pipeline scenario', () => {
        const operations: ArrayOperation[] = [
            {
                op: 'map',
                array: 'trades',
                transform: { params: ['t'], body: 't.price' },
            },
            {
                op: 'filter',
                array: 'prices',
                predicate: { params: ['p'], body: 'p > 1000' },
            },
            {
                op: 'reduce',
                array: 'filtered',
                reducer: { params: ['sum', 'p'], body: 'sum + p' },
                initial: 0,
            },
        ];

        const integrator = createArrayOperationsIntegrator(operations, {
            includeExpressions: true,
        });

        const imports = integrator.generateImportStatements();

        // Should use generic evaluator for multiple operation types
        assert.ok(imports.namedImports.includes('evaluateArrayOperation'));
        assert.ok(imports.namedImports.includes('SafeExpressionEvaluator'));
    });

    it('should support combined delta/array operations scenario', () => {
        const integrator = new HelperIntegrator();
        integrator.enableDeltaSnapshot();
        integrator.enableExpressions();

        const mapOp: ArrayOperation = {
            op: 'map',
            array: 'items',
            transform: { params: ['x'], body: 'x.price' },
        };
        integrator.addArrayOperation(mapOp);

        const helpers = integrator.detectRequiredHelpers();

        // Should include both delta and array helpers
        assert.ok(helpers.includes('applyDelta'));
        assert.ok(helpers.includes('evaluateMapOperation'));
        assert.ok(helpers.includes('SafeExpressionEvaluator'));
    });
});
