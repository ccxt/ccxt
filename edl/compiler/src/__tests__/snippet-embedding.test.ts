/**
 * Tests for snippet embedding mechanism
 * Phase 4-9.2: Implement Snippet Embedding Mechanism
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    SnippetEmbedder,
    createSnippetEmbedder,
    createDualEndpoint,
    createEmbeddedSnippet,
    isValidHookPoint,
    PLACEHOLDER_PATTERN,
    EndpointWithSnippets,
    HookPoint,
} from '../embedding/snippets.js';
import { ImperativeSnippet } from '../schemas/imperative-snippets.js';

test('SnippetEmbedder - basic instantiation', () => {
    const embedder = new SnippetEmbedder();
    assert.ok(embedder instanceof SnippetEmbedder);
    assert.ok(embedder.getRegistry());
});

test('createSnippetEmbedder - factory function', () => {
    const embedder = createSnippetEmbedder();
    assert.ok(embedder instanceof SnippetEmbedder);
});

test('SnippetEmbedder - register and retrieve snippet', () => {
    const embedder = createSnippetEmbedder();
    const snippet: ImperativeSnippet = {
        id: 'test-snippet',
        type: 'inline',
        language: 'typescript',
        code: 'console.log("test");',
    };

    embedder.registerSnippet(snippet);
    const retrieved = embedder.getRegistry().get('test-snippet');

    assert.deepStrictEqual(retrieved, snippet);
});

test('parsePlaceholders - extract snippet placeholders', () => {
    const embedder = createSnippetEmbedder();
    const content = 'Some code {{snippet:auth-check:pre-request}} and {{snippet:transform:post-response}}';

    const placeholders = embedder.parsePlaceholders(content);

    assert.strictEqual(placeholders.length, 2);
    assert.strictEqual(placeholders[0].snippetId, 'auth-check');
    assert.strictEqual(placeholders[0].hookPoint, 'pre-request');
    assert.strictEqual(placeholders[1].snippetId, 'transform');
    assert.strictEqual(placeholders[1].hookPoint, 'post-response');
});

test('parsePlaceholders - no placeholders', () => {
    const embedder = createSnippetEmbedder();
    const content = 'Regular code without placeholders';

    const placeholders = embedder.parsePlaceholders(content);

    assert.strictEqual(placeholders.length, 0);
});

test('embedSnippet - basic snippet embedding', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'log-start',
        type: 'inline',
        language: 'typescript',
        code: 'console.log("Starting request");',
    });

    const result = embedder.embedSnippet('log-start', 'pre-request');

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 1);
    assert.ok(result.code.includes('console.log("Starting request")'));
});

test('embedSnippet - snippet not found error', () => {
    const embedder = createSnippetEmbedder();
    const result = embedder.embedSnippet('non-existent', 'pre-request');

    assert.strictEqual(result.errors.length, 1);
    assert.ok(result.errors[0].includes('Snippet not found'));
    assert.strictEqual(result.code, '');
});

test('embedSnippet - with arguments', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'log-message',
        type: 'function',
        language: 'typescript',
        code: 'console.log("${message}");',
        inputs: [
            { name: 'message', type: 'string', required: true },
        ],
    });

    const result = embedder.embedSnippet('log-message', 'pre-request', 'before', {
        message: 'Custom message',
    });

    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.code.includes('Custom message'));
});

test('replacePlaceholders - replace snippet placeholders', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'auth',
        type: 'inline',
        language: 'typescript',
        code: 'this.checkAuth();',
    });

    const content = 'function request() {\n  {{snippet:auth:pre-request}}\n  return fetch();\n}';
    const result = embedder.replacePlaceholders(content);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 1);
    assert.ok(result.code.includes('this.checkAuth()'));
    assert.ok(!result.code.includes('{{snippet'));
});

test('replacePlaceholders - multiple placeholders', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'validate',
        type: 'inline',
        language: 'typescript',
        code: 'validateParams(params);',
    });

    embedder.registerSnippet({
        id: 'transform',
        type: 'inline',
        language: 'typescript',
        code: 'response = transform(response);',
    });

    const content = '{{snippet:validate:validation}}\nconst data = fetch();\n{{snippet:transform:transformation}}';
    const result = embedder.replacePlaceholders(content);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 2);
    assert.ok(result.code.includes('validateParams'));
    assert.ok(result.code.includes('transform(response)'));
});

test('bindParameters - bind snippet parameters', () => {
    const embedder = createSnippetEmbedder();

    const snippet: ImperativeSnippet = {
        id: 'template',
        type: 'template',
        language: 'typescript',
        code: 'function ${name}(${params}): ${returnType} { ${body} }',
        inputs: [
            { name: 'name', type: 'string', required: true },
            { name: 'params', type: 'string', required: true },
            { name: 'returnType', type: 'string', required: true },
            { name: 'body', type: 'string', required: true },
        ],
    };

    const bound = embedder.bindParameters(snippet, {
        name: 'fetchData',
        params: 'id: string',
        returnType: 'Promise<Data>',
        body: 'return await this.request(id);',
    });

    assert.ok(bound.includes('function fetchData'));
    assert.ok(bound.includes('id: string'));
    assert.ok(bound.includes('Promise<Data>'));
    assert.ok(bound.includes('return await this.request(id);'));
});

test('bindParameters - missing required parameter', () => {
    const embedder = createSnippetEmbedder();

    const snippet: ImperativeSnippet = {
        id: 'requires-param',
        type: 'function',
        language: 'typescript',
        code: 'console.log(${value});',
        inputs: [
            { name: 'value', type: 'string', required: true },
        ],
    };

    assert.throws(
        () => embedder.bindParameters(snippet, {}),
        (err: Error) => err.message.includes('Required parameter')
    );
});

test('bindParameters - use default values', () => {
    const embedder = createSnippetEmbedder();

    const snippet: ImperativeSnippet = {
        id: 'with-defaults',
        type: 'function',
        language: 'typescript',
        code: 'console.log("${message}");',
        inputs: [
            { name: 'message', type: 'string', required: false, default: 'Default message' },
        ],
    };

    const bound = embedder.bindParameters(snippet, {});

    assert.ok(bound.includes('Default message'));
});

test('generateDualEndpointCode - Binance-style dual endpoint', () => {
    const embedder = createSnippetEmbedder();

    const dualEndpoint = {
        primary: '/api/v3/order',
        secondary: '/fapi/v1/order',
        condition: 'market.type === "spot"',
    };

    const code = embedder.generateDualEndpointCode(dualEndpoint);

    assert.ok(code.includes('Dual endpoint'));
    assert.ok(code.includes('/api/v3/order'));
    assert.ok(code.includes('/fapi/v1/order'));
    assert.ok(code.includes('market.type === "spot"'));
});

test('generateDualEndpointCode - default condition', () => {
    const embedder = createSnippetEmbedder();

    const dualEndpoint = {
        primary: '/api/v3/balance',
        secondary: '/fapi/v1/balance',
    };

    const code = embedder.generateDualEndpointCode(dualEndpoint);

    assert.ok(code.includes('marketType === "spot"'));
});

test('substituteVariables - replace variables in code', () => {
    const embedder = createSnippetEmbedder();

    const code = 'const url = "${baseUrl}/${endpoint}";';
    const result = embedder.substituteVariables(code, {
        baseUrl: 'https://api.example.com',
        endpoint: 'orders',
    });

    assert.ok(result.includes('https://api.example.com'));
    assert.ok(result.includes('orders'));
});

test('embedIntoEndpoint - pre-request hooks', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'auth-check',
        type: 'inline',
        language: 'typescript',
        code: 'this.checkAuthentication();',
    });

    const endpoint: EndpointWithSnippets = {
        snippets: [
            createEmbeddedSnippet('auth-check', 'pre-request', 'before'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 1);
    assert.ok(result.code.includes('pre-request hooks'));
    assert.ok(result.code.includes('this.checkAuthentication()'));
});

test('embedIntoEndpoint - post-response hooks', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'transform-response',
        type: 'inline',
        language: 'typescript',
        code: 'response = this.transformResponse(response);',
    });

    const endpoint: EndpointWithSnippets = {
        snippets: [
            createEmbeddedSnippet('transform-response', 'post-response', 'after'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.code.includes('post-response hooks'));
    assert.ok(result.code.includes('this.transformResponse'));
});

test('embedIntoEndpoint - error-handling hooks', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'error-handler',
        type: 'inline',
        language: 'typescript',
        code: 'if (error) { throw new ExchangeError(error.message); }',
    });

    const endpoint: EndpointWithSnippets = {
        snippets: [
            createEmbeddedSnippet('error-handler', 'error-handling', 'wrap'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.code.includes('error-handling hooks'));
    assert.ok(result.code.includes('ExchangeError'));
});

test('embedIntoEndpoint - with dual endpoint', () => {
    const embedder = createSnippetEmbedder();

    const dualEndpoint = createDualEndpoint('/api/v3/order', '/fapi/v1/order');
    assert.ok(dualEndpoint, 'Dual endpoint should be created');

    const endpoint: EndpointWithSnippets = {
        dualEndpoint,
        snippets: [],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    // When snippets array is empty but dualEndpoint exists, code should be generated
    if (endpoint.dualEndpoint) {
        const dualCode = embedder.generateDualEndpointCode(endpoint.dualEndpoint);
        assert.ok(dualCode.includes('Dual endpoint'), 'Generated code should include Dual endpoint comment');
        assert.ok(dualCode.includes('/api/v3/order'), 'Generated code should include primary endpoint');
        assert.ok(dualCode.includes('/fapi/v1/order'), 'Generated code should include secondary endpoint');
    }
});

test('embedIntoEndpoint - multiple hook points', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'validate',
        type: 'inline',
        language: 'typescript',
        code: 'this.validateParams(params);',
    });

    embedder.registerSnippet({
        id: 'transform',
        type: 'inline',
        language: 'typescript',
        code: 'response = this.transformData(response);',
    });

    const endpoint: EndpointWithSnippets = {
        snippets: [
            createEmbeddedSnippet('validate', 'validation', 'before'),
            createEmbeddedSnippet('transform', 'transformation', 'after'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 2);
    assert.ok(result.code.includes('validation hooks'));
    assert.ok(result.code.includes('transformation hooks'));
});

test('embedIntoEndpoint - empty snippets array', () => {
    const embedder = createSnippetEmbedder();

    const endpoint: EndpointWithSnippets = {
        snippets: [],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 0);
    assert.strictEqual(result.code, '');
});

test('embedIntoEndpoint - snippet not found error', () => {
    const embedder = createSnippetEmbedder();

    const endpoint: EndpointWithSnippets = {
        snippets: [
            createEmbeddedSnippet('non-existent', 'pre-request', 'before'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 1);
    assert.ok(result.errors[0].includes('Snippet not found'));
});

test('createDualEndpoint - helper function', () => {
    const dualEndpoint = createDualEndpoint('/api/v1/spot', '/api/v1/futures');

    assert.ok(dualEndpoint);
    assert.strictEqual(dualEndpoint?.primary, '/api/v1/spot');
    assert.strictEqual(dualEndpoint?.secondary, '/api/v1/futures');
    assert.ok(dualEndpoint?.condition);
});

test('createDualEndpoint - custom condition', () => {
    const dualEndpoint = createDualEndpoint(
        '/api/v1/spot',
        '/api/v1/futures',
        'market.linear === true'
    );

    assert.ok(dualEndpoint);
    assert.strictEqual(dualEndpoint?.condition, 'market.linear === true');
});

test('createEmbeddedSnippet - helper function', () => {
    const embedded = createEmbeddedSnippet('test-snippet', 'pre-request');

    assert.strictEqual(embedded.snippetId, 'test-snippet');
    assert.strictEqual(embedded.hookPoint, 'pre-request');
    assert.strictEqual(embedded.location, 'before');
});

test('createEmbeddedSnippet - with arguments', () => {
    const embedded = createEmbeddedSnippet('test-snippet', 'post-response', 'after', {
        transform: true,
    });

    assert.strictEqual(embedded.location, 'after');
    assert.deepStrictEqual(embedded.arguments, { transform: true });
});

test('isValidHookPoint - valid hook points', () => {
    assert.strictEqual(isValidHookPoint('pre-request'), true);
    assert.strictEqual(isValidHookPoint('post-response'), true);
    assert.strictEqual(isValidHookPoint('error-handling'), true);
    assert.strictEqual(isValidHookPoint('validation'), true);
    assert.strictEqual(isValidHookPoint('transformation'), true);
});

test('isValidHookPoint - invalid hook points', () => {
    assert.strictEqual(isValidHookPoint('invalid'), false);
    assert.strictEqual(isValidHookPoint('pre-validation'), false);
    assert.strictEqual(isValidHookPoint(''), false);
});

test('PLACEHOLDER_PATTERN - regex pattern', () => {
    const pattern = PLACEHOLDER_PATTERN;
    const matches = '{{snippet:test:pre-request}}'.match(pattern);

    assert.ok(matches);
    assert.strictEqual(matches.length, 1);
});

test('Integration - Binance dual endpoint with snippets', () => {
    const embedder = createSnippetEmbedder();

    // Register validation snippet
    embedder.registerSnippet({
        id: 'validate-symbol',
        type: 'function',
        language: 'typescript',
        code: 'if (!params.symbol) throw new Error("Symbol required");',
    });

    // Register transformation snippet
    embedder.registerSnippet({
        id: 'parse-order',
        type: 'function',
        language: 'typescript',
        code: 'return this.parseOrder(response, market);',
    });

    const endpoint: EndpointWithSnippets = {
        dualEndpoint: createDualEndpoint(
            '/api/v3/order',
            '/fapi/v1/order',
            'market.type === "spot"'
        ),
        snippets: [
            createEmbeddedSnippet('validate-symbol', 'validation', 'before'),
            createEmbeddedSnippet('parse-order', 'transformation', 'after'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 2);
    assert.ok(result.code.includes('Dual endpoint'));
    assert.ok(result.code.includes('validation hooks'));
    assert.ok(result.code.includes('transformation hooks'));
    assert.ok(result.code.includes('Symbol required'));
    assert.ok(result.code.includes('parseOrder'));
});

test('Integration - Complex endpoint with all hook points', () => {
    const embedder = createSnippetEmbedder();

    embedder.registerSnippet({
        id: 'auth',
        type: 'inline',
        language: 'typescript',
        code: 'this.checkAuth();',
    });

    embedder.registerSnippet({
        id: 'validate',
        type: 'inline',
        language: 'typescript',
        code: 'this.validateParams();',
    });

    embedder.registerSnippet({
        id: 'transform',
        type: 'inline',
        language: 'typescript',
        code: 'response = this.transform(response);',
    });

    embedder.registerSnippet({
        id: 'error-handler',
        type: 'inline',
        language: 'typescript',
        code: 'this.handleError(error);',
    });

    const endpoint: EndpointWithSnippets = {
        snippets: [
            createEmbeddedSnippet('auth', 'pre-request', 'before'),
            createEmbeddedSnippet('validate', 'validation', 'before'),
            createEmbeddedSnippet('transform', 'post-response', 'after'),
            createEmbeddedSnippet('error-handler', 'error-handling', 'wrap'),
        ],
    };

    const result = embedder.embedIntoEndpoint(endpoint);

    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.snippetsEmbedded.length, 4);
    assert.ok(result.code.includes('pre-request hooks'));
    assert.ok(result.code.includes('validation hooks'));
    assert.ok(result.code.includes('post-response hooks'));
    assert.ok(result.code.includes('error-handling hooks'));
});
