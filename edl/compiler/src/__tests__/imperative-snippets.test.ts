/**
 * Tests for imperative snippets schema
 * Phase 4-9.1: Define Schema for Imperative Snippets
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
    ImperativeSnippet,
    SnippetInput,
    SnippetOutput,
    ConditionalSnippet,
    BranchingSnippet,
    SnippetEmbed,
    validateSnippet,
    createSnippetRegistry,
    resolveSnippetEmbed,
    resolveConditionalSnippet,
    resolveBranchingSnippet,
    SnippetValidationError
} from '../schemas/imperative-snippets.js';

describe('ImperativeSnippets', () => {
    describe('validateSnippet', () => {
        it('should validate a valid inline snippet', () => {
            const snippet: ImperativeSnippet = {
                id: 'test-snippet',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("hello");'
            };

            assert.doesNotThrow(() => validateSnippet(snippet));
        });

        it('should validate a valid file-based snippet', () => {
            const snippet: ImperativeSnippet = {
                id: 'file-snippet',
                type: 'file',
                language: 'typescript',
                path: './snippets/test.ts'
            };

            assert.doesNotThrow(() => validateSnippet(snippet));
        });

        it('should validate snippet with inputs and outputs', () => {
            const snippet: ImperativeSnippet = {
                id: 'func-snippet',
                type: 'function',
                language: 'typescript',
                code: 'return ${x} + ${y};',
                inputs: [
                    { name: 'x', type: 'number', required: true },
                    { name: 'y', type: 'number', required: true }
                ],
                outputs: [
                    { name: 'result', type: 'number', description: 'Sum of x and y' }
                ],
                description: 'Add two numbers'
            };

            assert.doesNotThrow(() => validateSnippet(snippet));
        });

        it('should throw error for missing id', () => {
            const snippet = {
                type: 'inline',
                language: 'typescript',
                code: 'console.log("test");'
            } as ImperativeSnippet;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('valid id')
            );
        });

        it('should throw error for invalid type', () => {
            const snippet = {
                id: 'test',
                type: 'invalid',
                language: 'typescript',
                code: 'test'
            } as any;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('Invalid snippet type')
            );
        });

        it('should throw error for invalid language', () => {
            const snippet = {
                id: 'test',
                type: 'inline',
                language: 'python',
                code: 'test'
            } as any;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('Invalid language')
            );
        });

        it('should throw error for inline snippet without code', () => {
            const snippet = {
                id: 'test',
                type: 'inline',
                language: 'typescript'
            } as ImperativeSnippet;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('requires a code property')
            );
        });

        it('should throw error for file snippet without path', () => {
            const snippet = {
                id: 'test',
                type: 'file',
                language: 'typescript'
            } as ImperativeSnippet;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('requires a path property')
            );
        });

        it('should throw error for input without name', () => {
            const snippet = {
                id: 'test',
                type: 'inline',
                language: 'typescript',
                code: 'test',
                inputs: [{ type: 'string' }]
            } as any;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('must have a name')
            );
        });

        it('should throw error for input without type', () => {
            const snippet = {
                id: 'test',
                type: 'inline',
                language: 'typescript',
                code: 'test',
                inputs: [{ name: 'x' }]
            } as any;

            assert.throws(
                () => validateSnippet(snippet),
                (err: Error) => err instanceof SnippetValidationError && err.message.includes('must have a type')
            );
        });
    });

    describe('SnippetRegistry', () => {
        it('should register and retrieve snippets', () => {
            const registry = createSnippetRegistry();
            const snippet: ImperativeSnippet = {
                id: 'test-1',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("test");'
            };

            registry.register(snippet);
            const retrieved = registry.get('test-1');

            assert.strictEqual(retrieved, snippet);
        });

        it('should return undefined for non-existent snippet', () => {
            const registry = createSnippetRegistry();
            const retrieved = registry.get('non-existent');

            assert.strictEqual(retrieved, undefined);
        });

        it('should validate snippet on registration', () => {
            const registry = createSnippetRegistry();
            const invalidSnippet = {
                type: 'inline',
                language: 'typescript',
                code: 'test'
            } as ImperativeSnippet;

            assert.throws(() => registry.register(invalidSnippet));
        });

        it('should store multiple snippets', () => {
            const registry = createSnippetRegistry();

            registry.register({
                id: 'snippet-1',
                type: 'inline',
                language: 'typescript',
                code: 'console.log(1);'
            });

            registry.register({
                id: 'snippet-2',
                type: 'inline',
                language: 'typescript',
                code: 'console.log(2);'
            });

            assert.strictEqual(Object.keys(registry.snippets).length, 2);
        });
    });

    describe('resolveSnippetEmbed', () => {
        it('should resolve snippet embed with "before" location', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'log-snippet',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Starting operation");'
            });

            const embed: SnippetEmbed = {
                snippetId: 'log-snippet',
                location: 'before',
                target: 'fetchBalance'
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.ok(result.includes('console.log("Starting operation")'));
            assert.ok(result.includes('Target: fetchBalance'));
        });

        it('should resolve snippet embed with "after" location', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'log-snippet',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Operation complete");'
            });

            const embed: SnippetEmbed = {
                snippetId: 'log-snippet',
                location: 'after',
                target: 'fetchBalance'
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.ok(result.includes('console.log("Operation complete")'));
            assert.ok(result.includes('Target: fetchBalance'));
        });

        it('should resolve snippet embed with "replace" location', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'custom-impl',
                type: 'inline',
                language: 'typescript',
                code: 'return customFetchBalance();'
            });

            const embed: SnippetEmbed = {
                snippetId: 'custom-impl',
                location: 'replace',
                target: 'fetchBalance'
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.strictEqual(result, 'return customFetchBalance();');
        });

        it('should resolve snippet embed with "wrap" location', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'wrapper',
                type: 'inline',
                language: 'typescript',
                code: 'try {\n  // original code\n} catch(e) { console.error(e); }'
            });

            const embed: SnippetEmbed = {
                snippetId: 'wrapper',
                location: 'wrap',
                target: 'fetchBalance'
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.ok(result.includes('Wrap start'));
            assert.ok(result.includes('Wrap end'));
        });

        it('should resolve snippet embed with arguments', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'log-with-params',
                type: 'function',
                language: 'typescript',
                code: 'console.log("${message}", ${value});',
                inputs: [
                    { name: 'message', type: 'string', required: true },
                    { name: 'value', type: 'any', required: true }
                ]
            });

            const embed: SnippetEmbed = {
                snippetId: 'log-with-params',
                location: 'before',
                target: 'fetchBalance',
                arguments: {
                    message: 'Fetching balance',
                    value: 'true'
                }
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.ok(result.includes('Fetching balance'));
            assert.ok(result.includes('true'));
        });

        it('should use default values for optional arguments', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'log-default',
                type: 'function',
                language: 'typescript',
                code: 'console.log("${message}");',
                inputs: [
                    { name: 'message', type: 'string', required: false, default: 'Default message' }
                ]
            });

            const embed: SnippetEmbed = {
                snippetId: 'log-default',
                location: 'before',
                target: 'fetchBalance'
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.ok(result.includes('Default message'));
        });

        it('should throw error for missing required arguments', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'requires-arg',
                type: 'function',
                language: 'typescript',
                code: 'console.log(${value});',
                inputs: [
                    { name: 'value', type: 'string', required: true }
                ]
            });

            const embed: SnippetEmbed = {
                snippetId: 'requires-arg',
                location: 'before',
                target: 'fetchBalance'
            };

            assert.throws(
                () => resolveSnippetEmbed(embed, registry),
                (err: Error) => err.message.includes('Required argument')
            );
        });

        it('should throw error for non-existent snippet', () => {
            const registry = createSnippetRegistry();

            const embed: SnippetEmbed = {
                snippetId: 'non-existent',
                location: 'before',
                target: 'fetchBalance'
            };

            assert.throws(
                () => resolveSnippetEmbed(embed, registry),
                (err: Error) => err.message.includes('Snippet not found')
            );
        });
    });

    describe('resolveConditionalSnippet', () => {
        it('should resolve conditional snippet with then branch only', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'then-snippet',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Condition is true");'
            });

            const conditional: ConditionalSnippet = {
                condition: 'value > 10',
                thenSnippet: 'then-snippet'
            };

            const result = resolveConditionalSnippet(conditional, registry);

            assert.ok(result.includes('if (value > 10)'));
            assert.ok(result.includes('console.log("Condition is true")'));
            assert.ok(!result.includes('else'));
        });

        it('should resolve conditional snippet with else branch', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'then-snippet',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("True");'
            });
            registry.register({
                id: 'else-snippet',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("False");'
            });

            const conditional: ConditionalSnippet = {
                condition: 'isValid',
                thenSnippet: 'then-snippet',
                elseSnippet: 'else-snippet'
            };

            const result = resolveConditionalSnippet(conditional, registry);

            assert.ok(result.includes('if (isValid)'));
            assert.ok(result.includes('console.log("True")'));
            assert.ok(result.includes('else'));
            assert.ok(result.includes('console.log("False")'));
        });

        it('should resolve conditional snippet with inline snippets', () => {
            const registry = createSnippetRegistry();

            const thenSnippet: ImperativeSnippet = {
                id: 'inline-then',
                type: 'inline',
                language: 'typescript',
                code: 'return true;'
            };

            const conditional: ConditionalSnippet = {
                condition: 'x === 1',
                thenSnippet: thenSnippet
            };

            const result = resolveConditionalSnippet(conditional, registry);

            assert.ok(result.includes('if (x === 1)'));
            assert.ok(result.includes('return true;'));
        });
    });

    describe('resolveBranchingSnippet', () => {
        it('should resolve branching snippet with multiple cases', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'case-1',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Case 1");'
            });
            registry.register({
                id: 'case-2',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Case 2");'
            });

            const branching: BranchingSnippet = {
                expression: 'type',
                cases: {
                    '"market"': 'case-1',
                    '"limit"': 'case-2'
                }
            };

            const result = resolveBranchingSnippet(branching, registry);

            assert.ok(result.includes('switch (type)'));
            assert.ok(result.includes('case "market"'));
            assert.ok(result.includes('console.log("Case 1")'));
            assert.ok(result.includes('case "limit"'));
            assert.ok(result.includes('console.log("Case 2")'));
        });

        it('should resolve branching snippet with default case', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'case-1',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Case 1");'
            });
            registry.register({
                id: 'default-case',
                type: 'inline',
                language: 'typescript',
                code: 'console.log("Default");'
            });

            const branching: BranchingSnippet = {
                expression: 'value',
                cases: {
                    '1': 'case-1'
                },
                default: 'default-case'
            };

            const result = resolveBranchingSnippet(branching, registry);

            assert.ok(result.includes('switch (value)'));
            assert.ok(result.includes('case 1'));
            assert.ok(result.includes('console.log("Case 1")'));
            assert.ok(result.includes('default:'));
            assert.ok(result.includes('console.log("Default")'));
        });

        it('should resolve branching snippet with inline snippets', () => {
            const registry = createSnippetRegistry();

            const caseSnippet: ImperativeSnippet = {
                id: 'inline-case',
                type: 'inline',
                language: 'typescript',
                code: 'return "handled";'
            };

            const branching: BranchingSnippet = {
                expression: 'status',
                cases: {
                    '"success"': caseSnippet
                }
            };

            const result = resolveBranchingSnippet(branching, registry);

            assert.ok(result.includes('switch (status)'));
            assert.ok(result.includes('case "success"'));
            assert.ok(result.includes('return "handled";'));
        });
    });

    describe('Template snippets', () => {
        it('should create template snippet with multiple parameters', () => {
            const snippet: ImperativeSnippet = {
                id: 'api-call-template',
                type: 'template',
                language: 'typescript',
                code: `
async function \$\{functionName\}(\$\{params\}) {
    const response = await this.request('\$\{endpoint\}', '\$\{method\}');
    return response;
}`,
                inputs: [
                    { name: 'functionName', type: 'string', required: true },
                    { name: 'params', type: 'string', required: true },
                    { name: 'endpoint', type: 'string', required: true },
                    { name: 'method', type: 'string', required: true }
                ],
                description: 'Template for API call functions'
            };

            assert.doesNotThrow(() => validateSnippet(snippet));
        });

        it('should resolve template with all parameters', () => {
            const registry = createSnippetRegistry();
            registry.register({
                id: 'method-template',
                type: 'template',
                language: 'typescript',
                code: 'function \${name}(\${params}): \${returnType} { \${body} }',
                inputs: [
                    { name: 'name', type: 'string', required: true },
                    { name: 'params', type: 'string', required: true },
                    { name: 'returnType', type: 'string', required: true },
                    { name: 'body', type: 'string', required: true }
                ]
            });

            const embed: SnippetEmbed = {
                snippetId: 'method-template',
                location: 'replace',
                target: 'methodDef',
                arguments: {
                    name: 'fetchBalance',
                    params: 'symbol: string',
                    returnType: 'Promise<Balance>',
                    body: 'return this.balance(symbol);'
                }
            };

            const result = resolveSnippetEmbed(embed, registry);

            assert.ok(result.includes('function fetchBalance'));
            assert.ok(result.includes('symbol: string'));
            assert.ok(result.includes('Promise<Balance>'));
            assert.ok(result.includes('return this.balance(symbol);'));
        });
    });
});
