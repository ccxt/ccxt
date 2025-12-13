/**
 * Snapshot tests for EDL compiler
 *
 * Verifies that compiling Binance and Kraken EDL definitions produces
 * the expected TypeScript output by comparing against saved snapshots.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { compileFile } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to EDL files and snapshots
const EDL_DIR = path.resolve(__dirname, '../../../exchanges');
const SNAPSHOT_DIR = path.resolve(__dirname, '../../test-snapshots');

/**
 * Read snapshot file content
 */
function readSnapshot(exchangeId: string): string {
    const snapshotPath = path.join(SNAPSHOT_DIR, `${exchangeId}.ts.snap`);
    return fs.readFileSync(snapshotPath, 'utf-8');
}

/**
 * Normalize code for comparison (remove trailing whitespace, normalize newlines)
 */
function normalizeCode(code: string): string {
    return code
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim();
}

/**
 * Extract specific sections from generated code for detailed verification
 */
function extractSections(code: string) {
    const sections = {
        imports: [] as string[],
        classDeclaration: '',
        describe: '',
        sign: '',
        parsers: [] as string[],
        apiHelpers: [] as string[],
        fetchMethods: [] as string[],
    };

    // Extract imports
    const importMatches = code.matchAll(/^import .+;$/gm);
    for (const match of importMatches) {
        sections.imports.push(match[0]);
    }

    // Extract class declaration
    const classMatch = code.match(/export default class \w+ extends Exchange/);
    if (classMatch) {
        sections.classDeclaration = classMatch[0];
    }

    // Extract describe() method
    const describeMatch = code.match(/describe\(\)[\s\S]*?^\s{4}\}/m);
    if (describeMatch) {
        sections.describe = describeMatch[0];
    }

    // Extract sign() method
    const signMatch = code.match(/sign\(path: string[\s\S]*?^\s{4}\}/m);
    if (signMatch) {
        sections.sign = signMatch[0];
    }

    // Extract parser methods (parseTicker, parseOrder, parseTrade, parseBalance, parseMarket)
    const parserMatches = code.matchAll(/^\s{4}parse\w+\([\s\S]*?^\s{4}\}/gm);
    for (const match of parserMatches) {
        sections.parsers.push(match[0]);
    }

    // Extract API helper methods (publicGet*, privatePost*, etc.)
    const helperMatches = code.matchAll(/^\s{4}async (public|private)[A-Z]\w+\([\s\S]*?^\s{4}\}/gm);
    for (const match of helperMatches) {
        sections.apiHelpers.push(match[0]);
    }

    // Extract fetch methods (fetchTicker, fetchTrades, etc.)
    const fetchMatches = code.matchAll(/^\s{4}async fetch\w+\([\s\S]*?^\s{4}\}/gm);
    for (const match of fetchMatches) {
        sections.fetchMethods.push(match[0]);
    }

    return sections;
}

test('Binance snapshot - full compilation matches expected output', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const expectedSnapshot = readSnapshot('binance');

    // Compile the EDL file
    const result = compileFile(edlPath, {
        includeComments: true,
        verbose: false,
    });

    // Compilation should succeed
    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    assert.strictEqual(result.exchangeId, 'binance');
    assert.ok(result.outputPath, 'Output path should be set');

    // Read the generated file
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');

    // Normalize both for comparison
    const normalizedGenerated = normalizeCode(generatedCode);
    const normalizedSnapshot = normalizeCode(expectedSnapshot);

    // Compare full output
    assert.strictEqual(
        normalizedGenerated,
        normalizedSnapshot,
        'Generated Binance code does not match snapshot'
    );
});

test('Kraken snapshot - full compilation matches expected output', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const expectedSnapshot = readSnapshot('kraken');

    // Compile the EDL file
    const result = compileFile(edlPath, {
        includeComments: true,
        verbose: false,
    });

    // Compilation should succeed
    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    assert.strictEqual(result.exchangeId, 'kraken');
    assert.ok(result.outputPath, 'Output path should be set');

    // Read the generated file
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');

    // Normalize both for comparison
    const normalizedGenerated = normalizeCode(generatedCode);
    const normalizedSnapshot = normalizeCode(expectedSnapshot);

    // Compare full output
    assert.strictEqual(
        normalizedGenerated,
        normalizedSnapshot,
        'Generated Kraken code does not match snapshot'
    );
});

test('Binance snapshot - verify describe() method structure', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Verify describe() method exists
    assert.ok(sections.describe, 'describe() method should be present');

    // Verify key properties in describe()
    assert.ok(sections.describe.includes("id: 'binance'"), 'describe() should contain exchange id');
    assert.ok(sections.describe.includes("name: 'Binance'"), 'describe() should contain exchange name');
    assert.ok(sections.describe.includes('urls:'), 'describe() should contain urls block');
    assert.ok(sections.describe.includes('api:'), 'describe() should contain api block');
    assert.ok(sections.describe.includes('has:'), 'describe() should contain has block');
    assert.ok(sections.describe.includes('timeframes:'), 'describe() should contain timeframes');
    assert.ok(sections.describe.includes('requiredCredentials:'), 'describe() should contain requiredCredentials');
});

test('Kraken snapshot - verify describe() method structure', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Verify describe() method exists
    assert.ok(sections.describe, 'describe() method should be present');

    // Verify key properties in describe()
    assert.ok(sections.describe.includes("id: 'kraken'"), 'describe() should contain exchange id');
    assert.ok(sections.describe.includes("name: 'Kraken'"), 'describe() should contain exchange name');
    assert.ok(sections.describe.includes('urls:'), 'describe() should contain urls block');
    assert.ok(sections.describe.includes('api:'), 'describe() should contain api block');
    assert.ok(sections.describe.includes('has:'), 'describe() should contain has block');
});

test('Binance snapshot - verify sign() method generation', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Verify sign() method exists
    assert.ok(sections.sign, 'sign() method should be present');

    // Verify sign() method signature
    assert.ok(
        sections.sign.includes("sign(path: string, api: string = 'public'"),
        'sign() should have correct signature'
    );

    // Verify auth-specific logic
    assert.ok(
        sections.sign.includes("api === 'private'"),
        'sign() should check for private API calls'
    );
    assert.ok(
        sections.sign.includes('this.checkRequiredCredentials()'),
        'sign() should check credentials for private calls'
    );
    assert.ok(
        sections.sign.includes('this.hmac'),
        'sign() should use HMAC for Binance (sha256)'
    );
});

test('Kraken snapshot - verify sign() method generation', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Verify sign() method exists
    assert.ok(sections.sign, 'sign() method should be present');

    // Verify Kraken-specific auth (sha512)
    assert.ok(
        sections.sign.includes('sha512'),
        'sign() should use sha512 for Kraken'
    );
});

test('Binance snapshot - verify parser methods generation', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Should have multiple parser methods
    assert.ok(sections.parsers.length > 0, 'Should have parser methods');

    // Check for specific parsers
    const parserNames = sections.parsers.map(p => {
        const match = p.match(/parse(\w+)\(/);
        return match ? match[1] : '';
    });

    assert.ok(parserNames.includes('Ticker'), 'Should have parseTicker method');
    assert.ok(parserNames.includes('Order'), 'Should have parseOrder method');
    assert.ok(parserNames.includes('Trade'), 'Should have parseTrade method');
    assert.ok(parserNames.includes('Balance'), 'Should have parseBalance method');
    assert.ok(parserNames.includes('Market'), 'Should have parseMarket method');
});

test('Kraken snapshot - verify parser methods generation', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Should have multiple parser methods
    assert.ok(sections.parsers.length > 0, 'Should have parser methods');

    // Check for specific parsers
    const parserNames = sections.parsers.map(p => {
        const match = p.match(/parse(\w+)\(/);
        return match ? match[1] : '';
    });

    assert.ok(parserNames.includes('Ticker'), 'Should have parseTicker method');
    assert.ok(parserNames.includes('Order'), 'Should have parseOrder method');
    assert.ok(parserNames.includes('Trade'), 'Should have parseTrade method');
    assert.ok(parserNames.includes('Balance'), 'Should have parseBalance method');
});

test('Binance snapshot - verify API helper methods generation', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Should have multiple API helper methods
    assert.ok(sections.apiHelpers.length > 0, 'Should have API helper methods');

    // Verify some key public endpoints
    const helperCode = sections.apiHelpers.join('\n');
    assert.ok(helperCode.includes('publicGetPing'), 'Should have publicGetPing helper');
    assert.ok(helperCode.includes('publicGetTime'), 'Should have publicGetTime helper');
    assert.ok(helperCode.includes('publicGetTicker24hr'), 'Should have publicGetTicker24hr helper');

    // Verify some key private endpoints
    assert.ok(helperCode.includes('privateGetAccount'), 'Should have privateGetAccount helper');
    assert.ok(helperCode.includes('privatePostOrder'), 'Should have privatePostOrder helper');
    assert.ok(helperCode.includes('privateDeleteOrder'), 'Should have privateDeleteOrder helper');

    // Verify helper methods call this.request()
    assert.ok(helperCode.includes('this.request('), 'Helpers should call this.request()');

    // Verify cost parameter is passed
    assert.ok(helperCode.includes('cost:'), 'Helpers should include rate limit cost');
});

test('Kraken snapshot - verify API helper methods generation', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Should have multiple API helper methods
    assert.ok(sections.apiHelpers.length > 0, 'Should have API helper methods');

    // Verify some key public endpoints
    const helperCode = sections.apiHelpers.join('\n');
    assert.ok(helperCode.includes('publicGetTime'), 'Should have publicGetTime helper');
    assert.ok(helperCode.includes('publicGetTicker'), 'Should have publicGetTicker helper');
    assert.ok(helperCode.includes('publicGetAssets'), 'Should have publicGetAssets helper');

    // Verify some key private endpoints (Kraken uses POST for private endpoints)
    assert.ok(helperCode.includes('privatePostBalance'), 'Should have privatePostBalance helper');
    assert.ok(helperCode.includes('privatePostAddOrder'), 'Should have privatePostAddOrder helper');
    assert.ok(helperCode.includes('privatePostCancelOrder'), 'Should have privatePostCancelOrder helper');

    // Verify required parameter validation
    assert.ok(
        helperCode.includes('this.checkRequiredArgument'),
        'Helpers should validate required parameters'
    );
});

test('Binance snapshot - verify fetch methods generation', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Should have fetch methods
    assert.ok(sections.fetchMethods.length > 0, 'Should have fetch methods');

    const fetchCode = sections.fetchMethods.join('\n');

    // Verify key fetch methods exist
    assert.ok(fetchCode.includes('fetchTicker'), 'Should have fetchTicker method');
    assert.ok(fetchCode.includes('fetchTrades'), 'Should have fetchTrades method');

    // Verify fetch methods call loadMarkets
    assert.ok(fetchCode.includes('this.loadMarkets()'), 'Fetch methods should call loadMarkets');

    // Verify fetch methods call appropriate API helpers
    assert.ok(
        fetchCode.includes('this.publicGetTicker24hr') || fetchCode.includes('this.privateGetMyTrades'),
        'Fetch methods should call API helpers'
    );

    // Verify fetch methods call parser methods
    assert.ok(
        fetchCode.includes('this.parseTicker') || fetchCode.includes('this.parseTrades'),
        'Fetch methods should call parser methods'
    );
});

test('Kraken snapshot - verify fetch methods generation', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Should have fetch methods
    assert.ok(sections.fetchMethods.length > 0, 'Should have fetch methods');

    const fetchCode = sections.fetchMethods.join('\n');

    // Verify key fetch methods exist
    assert.ok(fetchCode.includes('fetchTicker'), 'Should have fetchTicker method');
    assert.ok(fetchCode.includes('fetchTrades'), 'Should have fetchTrades method');

    // Verify fetch methods integrate with parsers
    assert.ok(
        fetchCode.includes('this.parseTicker') || fetchCode.includes('this.parseTrades'),
        'Fetch methods should call parser methods'
    );
});

test('Binance snapshot - verify required parameter validation', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');

    // Check for required parameter validation in API helpers
    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('publicGetDepth', params.symbol, 'symbol')"),
        'Should validate required symbol parameter for depth endpoint'
    );

    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('privatePostOrder', params.symbol, 'symbol')"),
        'Should validate required symbol parameter for order endpoint'
    );

    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('privatePostOrder', params.side, 'side')"),
        'Should validate required side parameter for order endpoint'
    );

    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('privatePostOrder', params.type, 'type')"),
        'Should validate required type parameter for order endpoint'
    );
});

test('Kraken snapshot - verify required parameter validation', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');

    // Check for required parameter validation in API helpers
    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('publicGetTicker', params.pair, 'pair')"),
        'Should validate required pair parameter for ticker endpoint'
    );

    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('privatePostAddOrder', params.pair, 'pair')"),
        'Should validate required pair parameter for AddOrder endpoint'
    );

    assert.ok(
        generatedCode.includes("this.checkRequiredArgument('privatePostAddOrder', params.volume, 'volume')"),
        'Should validate required volume parameter for AddOrder endpoint'
    );
});

test('Binance snapshot - verify conditional required_if logic', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');

    // Binance order endpoint should have required_if logic for price and stopPrice
    assert.ok(
        generatedCode.includes('if (["LIMIT", "STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT"].includes(params.type))'),
        'Should have conditional check for price parameter based on order type'
    );

    assert.ok(
        generatedCode.includes('if (["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"].includes(params.type))'),
        'Should have conditional check for stopPrice parameter based on order type'
    );
});

test('Kraken snapshot - verify conditional required_if logic', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');

    // Kraken AddOrder endpoint should have required_if logic for price
    assert.ok(
        generatedCode.includes('if (["limit", "stop-loss-limit", "take-profit-limit"].includes(params.ordertype))'),
        'Should have conditional check for price parameter based on ordertype'
    );
});

test('Binance snapshot - verify imports and type annotations', () => {
    const edlPath = path.join(EDL_DIR, 'binance.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Verify imports
    assert.ok(sections.imports.length > 0, 'Should have import statements');

    const importsCode = sections.imports.join('\n');
    assert.ok(importsCode.includes("from './base/Exchange.js'"), 'Should import Exchange base class');
    assert.ok(importsCode.includes("from './base/types.js'"), 'Should import types');
    assert.ok(importsCode.includes('Dict'), 'Should import Dict type');
    assert.ok(importsCode.includes('Ticker'), 'Should import Ticker type');
    assert.ok(importsCode.includes('Trade'), 'Should import Trade type');

    // Verify class declaration
    assert.ok(
        sections.classDeclaration.includes('export default class Binance extends Exchange'),
        'Should have proper class declaration'
    );
});

test('Kraken snapshot - verify imports and type annotations', () => {
    const edlPath = path.join(EDL_DIR, 'kraken.edl.yaml');
    const result = compileFile(edlPath, { includeComments: true });

    assert.ok(result.success, `Compilation failed: ${result.errors.join(', ')}`);
    const generatedCode = fs.readFileSync(result.outputPath!, 'utf-8');
    const sections = extractSections(generatedCode);

    // Verify imports
    assert.ok(sections.imports.length > 0, 'Should have import statements');

    const importsCode = sections.imports.join('\n');
    assert.ok(importsCode.includes("from './base/Exchange.js'"), 'Should import Exchange base class');
    assert.ok(importsCode.includes("from './base/types.js'"), 'Should import types');

    // Verify class declaration
    assert.ok(
        sections.classDeclaration.includes('export default class Kraken extends Exchange'),
        'Should have proper class declaration'
    );
});
