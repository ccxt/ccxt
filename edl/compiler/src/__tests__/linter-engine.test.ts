/**
 * Tests for Linter Engine
 * Phase 3-11.3: Test core linting engine functionality
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
    LinterEngine,
    createLinter,
    lintFile,
    lintContent,
    lintDirectory,
    LinterConfig,
} from '../linting/engine.js';
import {
    DSLElement,
    LintContext,
    LintRule,
} from '../linting/schema.js';
import { getAllRules } from '../linting/rules.js';
import type { EDLDocument } from '../types/edl.js';

describe('Linter Engine', () => {
    describe('LinterEngine Construction', () => {
        it('should create linter with default config', () => {
            const linter = new LinterEngine();
            const config = linter.getConfig();

            assert.ok(config.rules.length > 0);
            assert.equal(config.minSeverity, 'info');
            assert.equal(config.maxErrors, 0);
            assert.equal(config.stopOnFirstError, false);
        });

        it('should create linter with custom config', () => {
            const linter = new LinterEngine({
                minSeverity: 'error',
                maxErrors: 10,
                stopOnFirstError: true,
            });

            const config = linter.getConfig();

            assert.equal(config.minSeverity, 'error');
            assert.equal(config.maxErrors, 10);
            assert.equal(config.stopOnFirstError, true);
        });

        it('should filter rules by enabledRules', () => {
            const linter = new LinterEngine({
                enabledRules: ['undefined-placeholder', 'invalid-path'],
            });

            const activeRules = linter.getActiveRules();
            assert.equal(activeRules.length, 2);
            assert.ok(activeRules.some(r => r.id === 'undefined-placeholder'));
            assert.ok(activeRules.some(r => r.id === 'invalid-path'));
        });

        it('should filter rules by disabledRules', () => {
            const allRules = getAllRules();
            const linter = new LinterEngine({
                disabledRules: ['syntax-error'],
            });

            const activeRules = linter.getActiveRules();
            assert.equal(activeRules.length, allRules.length - 1);
            assert.ok(!activeRules.some(r => r.id === 'syntax-error'));
        });

        it('should accept custom rules', () => {
            const customRule: LintRule = {
                id: 'custom-rule',
                name: 'Custom Rule',
                description: 'A custom test rule',
                severity: 'warning',
                check: () => [],
            };

            const linter = new LinterEngine({
                rules: [customRule],
            });

            const activeRules = linter.getActiveRules();
            assert.equal(activeRules.length, 1);
            assert.equal(activeRules[0].id, 'custom-rule');
        });
    });

    describe('DSL Element Linting', () => {
        it('should lint DSL elements with custom context', () => {
            const linter = new LinterEngine();

            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'unknownPlaceholder',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            assert.equal(result.valid, false);
            assert.ok(result.errors.length > 0);
            assert.ok(result.errors.some(e => e.type === 'undefined_placeholder'));
        });

        it('should handle valid DSL elements', () => {
            const linter = new LinterEngine();

            const elements: DSLElement[] = [
                {
                    type: 'path',
                    value: 'data.field.value',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        it('should detect multiple errors in elements', () => {
            const linter = new LinterEngine();

            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'undefined1',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
                {
                    type: 'placeholder',
                    value: 'undefined2',
                    location: { path: 'test.edl', line: 2, column: 1 },
                },
                {
                    type: 'path',
                    value: 'invalid..path',
                    location: { path: 'test.edl', line: 3, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            assert.equal(result.valid, false);
            assert.ok(result.errors.length >= 3);
        });
    });

    describe('EDL Document Linting', () => {
        it('should lint valid EDL document', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
                parsers: {
                    ticker: {
                        source: 'response',
                        mapping: {
                            symbol: { path: 'data.symbol' },
                            price: { path: 'data.price', transform: 'parseNumber' },
                        },
                    },
                },
            };

            const result = linter.lintDocument(document);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        it('should detect errors in EDL document parsers', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
                parsers: {
                    ticker: {
                        source: 'response',
                        mapping: {
                            symbol: { path: '' }, // Empty path - error
                            price: { path: 'data..price' }, // Invalid path - error
                            amount: { path: 'data.amount', transform: 'unknownTransform' }, // Unknown transform - error
                        },
                    },
                },
            };

            const result = linter.lintDocument(document);

            assert.equal(result.valid, false);
            assert.ok(result.errors.length >= 2); // At least empty path and invalid path
        });

        it('should extract elements from parser mappings', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
                parsers: {
                    ticker: {
                        source: 'response',
                        path: 'result.data',
                        mapping: {
                            symbol: { path: 'data.symbol' },
                            price: { path: 'data.price', transform: 'parseNumber' },
                            timestamp: { compute: 'Date.now()' },
                        },
                    },
                },
            };

            const result = linter.lintDocument(document);

            // Should have validated paths, transforms, and expressions
            // Valid document should pass
            assert.equal(result.valid, true);
        });

        it('should handle documents with fromContext references', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
                parsers: {
                    ticker: {
                        source: 'response',
                        mapping: {
                            symbol: { fromContext: 'unknownVariable' },
                        },
                    },
                },
            };

            const result = linter.lintDocument(document);

            // Should detect invalid reference
            assert.equal(result.valid, false);
            assert.ok(result.errors.some(e => e.code === 'E008'));
        });

        it('should handle documents with array transforms', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
                parsers: {
                    ticker: {
                        source: 'response',
                        mapping: {
                            price: {
                                path: 'data.price',
                                transform: ['safeString', 'parseFloat'] as any,
                            },
                        },
                    },
                },
            };

            const result = linter.lintDocument(document);

            // Should validate both transforms
            assert.equal(result.valid, true);
        });
    });

    describe('Content Linting', () => {
        it('should lint valid EDL content', () => {
            const linter = new LinterEngine();

            const content = `
version: "1.0"
exchange:
  id: test
  name: Test Exchange
  countries: [US]
  rateLimit: 1000

parsers:
  ticker:
    mapping:
      symbol:
        path: data.symbol
      price:
        path: data.price
        transform: parseNumber
            `;

            const result = linter.lintContent(content, { filePath: 'test.edl.yaml' });

            assert.equal(result.parseSuccess, true);
            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        it('should handle parse errors in content', () => {
            const linter = new LinterEngine();

            const content = `
invalid yaml content:
  - this is not
    - properly
  formatted
            `;

            const result = linter.lintContent(content, { filePath: 'test.edl.yaml' });

            assert.equal(result.parseSuccess, false);
            assert.ok(result.parseErrors);
            assert.ok(result.parseErrors.length > 0);
        });

        it('should detect errors in content', () => {
            const linter = new LinterEngine();

            const content = `
version: "1.0"
exchange:
  id: test
  name: Test Exchange
  countries: [US]
  rateLimit: 1000

parsers:
  ticker:
    mapping:
      symbol:
        path: ""
      price:
        path: "invalid..path"
      amount:
        transform: unknownTransform
            `;

            const result = linter.lintContent(content, { filePath: 'test.edl.yaml' });

            assert.equal(result.parseSuccess, true);
            assert.equal(result.valid, false);
            assert.ok(result.errors.length > 0);
        });
    });

    describe('File Linting', () => {
        it('should lint existing EDL file', () => {
            // Find a real EDL file to test with
            const edlDir = path.join(process.cwd(), 'edl', 'exchanges');
            const testFiles = fs.existsSync(edlDir)
                ? fs.readdirSync(edlDir).filter(f => f.endsWith('.edl.yaml'))
                : [];

            if (testFiles.length > 0) {
                const linter = new LinterEngine();
                const testFile = path.join(edlDir, testFiles[0]);
                const result = linter.lintFile(testFile);

                assert.equal(result.parseSuccess, true);
                assert.ok(result.filePath.includes(testFiles[0]));
            } else {
                // Skip if no files available
                assert.ok(true, 'No EDL files available for testing');
            }
        });

        it('should handle non-existent file', () => {
            const linter = new LinterEngine();
            const result = linter.lintFile('/nonexistent/file.edl.yaml');

            assert.equal(result.parseSuccess, false);
            assert.ok(result.parseErrors);
            assert.ok(result.parseErrors[0].includes('not found'));
        });
    });

    describe('Directory Linting', () => {
        it('should lint directory with EDL files', () => {
            const edlDir = path.join(process.cwd(), 'edl', 'exchanges');

            if (fs.existsSync(edlDir)) {
                const linter = new LinterEngine();
                const result = linter.lintDirectory(edlDir, { recursive: false });

                assert.ok(result.summary.filesProcessed > 0);
                assert.ok(result.files.length > 0);
                assert.ok(typeof result.totalErrors === 'number');
                assert.ok(typeof result.totalWarnings === 'number');
            } else {
                assert.ok(true, 'EDL directory not available for testing');
            }
        });

        it('should handle empty directory', () => {
            const linter = new LinterEngine();
            const result = linter.lintDirectory('/nonexistent/directory');

            assert.equal(result.summary.filesProcessed, 0);
            assert.equal(result.files.length, 0);
        });

        it('should support custom file pattern', () => {
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linter-test-'));

            // Create test files
            fs.writeFileSync(path.join(tmpDir, 'test1.edl.yaml'), 'version: "1.0"\nexchange:\n  id: test1\n  name: Test1\n  countries: [US]\n  rateLimit: 1000');
            fs.writeFileSync(path.join(tmpDir, 'test2.yml'), 'version: "1.0"\nexchange:\n  id: test2\n  name: Test2\n  countries: [US]\n  rateLimit: 1000');
            fs.writeFileSync(path.join(tmpDir, 'test3.txt'), 'not a yaml file');

            const linter = new LinterEngine();

            // Test default pattern (only .edl.yaml)
            const result1 = linter.lintDirectory(tmpDir, { recursive: false });
            assert.equal(result1.summary.filesProcessed, 1);

            // Test custom pattern (all .yml and .yaml)
            const result2 = linter.lintDirectory(tmpDir, {
                recursive: false,
                pattern: /\.(yaml|yml)$/,
            });
            assert.equal(result2.summary.filesProcessed, 2);

            // Cleanup
            fs.rmSync(tmpDir, { recursive: true });
        });

        it('should support recursive directory scanning', () => {
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linter-test-'));
            const subDir = path.join(tmpDir, 'subdir');
            fs.mkdirSync(subDir);

            // Create test files
            fs.writeFileSync(path.join(tmpDir, 'test1.edl.yaml'), 'version: "1.0"\nexchange:\n  id: test1\n  name: Test1\n  countries: [US]\n  rateLimit: 1000');
            fs.writeFileSync(path.join(subDir, 'test2.edl.yaml'), 'version: "1.0"\nexchange:\n  id: test2\n  name: Test2\n  countries: [US]\n  rateLimit: 1000');

            const linter = new LinterEngine();

            // Non-recursive
            const result1 = linter.lintDirectory(tmpDir, { recursive: false });
            assert.equal(result1.summary.filesProcessed, 1);

            // Recursive
            const result2 = linter.lintDirectory(tmpDir, { recursive: true });
            assert.equal(result2.summary.filesProcessed, 2);

            // Cleanup
            fs.rmSync(tmpDir, { recursive: true });
        });
    });

    describe('Severity Filtering', () => {
        it('should filter by minimum severity', () => {
            const linter = new LinterEngine({
                minSeverity: 'error',
            });

            const elements: DSLElement[] = [
                {
                    type: 'expression',
                    value: 'a + b',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            // Should only include errors, not warnings
            assert.equal(result.warnings.length, 0);
        });

        it('should include all severities with info level', () => {
            const linter = new LinterEngine({
                minSeverity: 'info',
            });

            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'undefined',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            // Should include errors and any warnings/info
            assert.ok(result.errors.length > 0);
        });
    });

    describe('Error Limiting', () => {
        it('should limit number of errors reported', () => {
            const linter = new LinterEngine({
                maxErrors: 2,
            });

            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'undefined1',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
                {
                    type: 'placeholder',
                    value: 'undefined2',
                    location: { path: 'test.edl', line: 2, column: 1 },
                },
                {
                    type: 'placeholder',
                    value: 'undefined3',
                    location: { path: 'test.edl', line: 3, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            // Should stop at maxErrors
            assert.ok(result.errors.length <= 2);
        });

        it('should stop on first error when configured', () => {
            const linter = new LinterEngine({
                stopOnFirstError: true,
            });

            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'undefined1',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
                {
                    type: 'placeholder',
                    value: 'undefined2',
                    location: { path: 'test.edl', line: 2, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = linter.lintElements(elements, context);

            // Should only have errors from first element
            assert.ok(result.errors.length <= 1);
        });
    });

    describe('Convenience Functions', () => {
        it('should create linter with createLinter', () => {
            const linter = createLinter();
            assert.ok(linter instanceof LinterEngine);
        });

        it('should lint file with lintFile function', () => {
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linter-test-'));
            const testFile = path.join(tmpDir, 'test.edl.yaml');

            fs.writeFileSync(testFile, 'version: "1.0"\nexchange:\n  id: test\n  name: Test\n  countries: [US]\n  rateLimit: 1000');

            const result = lintFile(testFile);

            assert.equal(result.parseSuccess, true);
            assert.ok(result.filePath.includes('test.edl.yaml'));

            // Cleanup
            fs.rmSync(tmpDir, { recursive: true });
        });

        it('should lint content with lintContent function', () => {
            const content = 'version: "1.0"\nexchange:\n  id: test\n  name: Test\n  countries: [US]\n  rateLimit: 1000';
            const result = lintContent(content);

            assert.equal(result.parseSuccess, true);
            assert.equal(result.valid, true);
        });

        it('should lint directory with lintDirectory function', () => {
            const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linter-test-'));

            fs.writeFileSync(path.join(tmpDir, 'test.edl.yaml'), 'version: "1.0"\nexchange:\n  id: test\n  name: Test\n  countries: [US]\n  rateLimit: 1000');

            const result = lintDirectory(tmpDir);

            assert.ok(result.summary.filesProcessed >= 1);

            // Cleanup
            fs.rmSync(tmpDir, { recursive: true });
        });
    });

    describe('Context Extraction', () => {
        it('should extract placeholders from document parsers', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
                parsers: {
                    ticker: {
                        source: 'response',
                        mapping: {
                            customField: { path: 'data.custom' },
                        },
                    },
                },
            };

            const result = linter.lintDocument(document);

            // Should have created context with customField placeholder
            // Valid document should pass
            assert.equal(result.valid, true);
        });

        it('should add common EDL placeholders to context', () => {
            const linter = new LinterEngine();

            const document: EDLDocument = {
                version: '1.0',
                exchange: {
                    id: 'test',
                    name: 'Test Exchange',
                    countries: ['US'],
                    rateLimit: 1000,
                },
            };

            // Document should be valid even without parsers
            const result = linter.lintDocument(document);
            assert.equal(result.valid, true);
        });
    });
});
