import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

import { compileContent } from '../index.js';

interface FixtureConfig {
    name: string;
    method: keyof any;
    needsMarket?: boolean;
    returnsArray?: boolean;  // Parser uses iterator mode and returns array of results
}

interface FetchFixtureConfig {
    fixture: string;
    method: keyof any;
    args?: (expected: any) => any[];
    request?: {
        path: string;
        api: string;
        httpMethod: string;
    };
    needsMarket?: boolean;
    responseFactory?: (input: any) => any;
    resultTransform?: (result: any) => any;
}

// NOTE: Only testing parsers that are fully implemented in EDL
// returnsArray: true means parser uses iterator mode and returns array of results
const EXCHANGE_FIXTURES: Record<string, FixtureConfig[]> = {
    binance: [
        { name: 'ticker', method: 'parseTicker', needsMarket: true },
        { name: 'trade', method: 'parseTrade', needsMarket: true, returnsArray: true },
        // { name: 'order', method: 'parseOrder', needsMarket: true },  // Needs complex mapping
        // { name: 'balance', method: 'parseBalance', returnsArray: true },  // Balance output is a dictionary keyed by currency, not array
    ],
    kraken: [
        { name: 'ticker', method: 'parseTicker', needsMarket: true },
        // { name: 'trade', method: 'parseTrade', needsMarket: true, returnsArray: true },  // Fixture uses public API format, EDL uses TradesHistory (entries)
        // { name: 'order', method: 'parseOrder', needsMarket: true },  // Needs complex mapping
        // { name: 'balance', method: 'parseBalance', returnsArray: true },  // EDL needs nested path support for entries values
    ],
};

// NOTE: Only testing fetch methods for fully implemented parsers
// TODO: Add back fetchTrades once iterator parsers are implemented
const EXCHANGE_FETCH_FIXTURES: Record<string, FetchFixtureConfig[]> = {
    binance: [
        {
            fixture: 'ticker',
            method: 'fetchTicker',
            request: { path: 'ticker/24hr', api: 'public', httpMethod: 'GET' },
            needsMarket: true,
        },
        // { fixture: 'trade', ... }  // Needs iterator + parseCurrencyCode
    ],
    kraken: [
        {
            fixture: 'ticker',
            method: 'fetchTicker',
            request: { path: 'Ticker', api: 'public', httpMethod: 'GET' },
            needsMarket: true,
        },
        // { fixture: 'trade', ... }  // Needs iterator (entries)
    ],
};

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const compilerRoot = path.resolve(__dirname, '..', '..');
const edlRoot = path.resolve(compilerRoot, '..');
const repoRoot = path.resolve(edlRoot, '..');
const exchangesDir = path.resolve(edlRoot, 'exchanges');
const fixturesRoot = path.resolve(compilerRoot, 'test-fixtures');
const baseSourceDir = path.resolve(repoRoot, 'js', 'src', 'base');

for (const [exchangeId, fixtures] of Object.entries(EXCHANGE_FIXTURES)) {
    test(`${exchangeId} parser fixtures`, async t => {
        const { exchange, cleanup } = await buildExchange(exchangeId);
        t.after(() => cleanup());

        const markets = loadMarkets(exchangeId);
        exchange.setMarkets(markets);

        const fixtureDir = path.join(fixturesRoot, exchangeId);

        for (const fixture of fixtures) {
            const { inputData, expected } = loadFixtureData(exchangeId, fixtureDir, fixture.name);

            assert.ok(typeof exchange[fixture.method] === 'function', `${fixture.method.toString()} not implemented for ${exchangeId}`);

            const marketArg = fixture.needsMarket ? resolveMarket(exchange, expected) : undefined;
            let actual = fixture.needsMarket
                ? exchange[fixture.method](inputData, marketArg)
                : exchange[fixture.method](inputData);

            // For iterator parsers that return arrays, extract first element for comparison
            // with single-item fixtures
            if (fixture.returnsArray && Array.isArray(actual) && !Array.isArray(expected)) {
                actual = actual[0];
            }

            compareResults(actual, expected, `${exchangeId} ${fixture.name} parser mismatch`);
        }

        const fetchFixtures = EXCHANGE_FETCH_FIXTURES[exchangeId] || [];
        if (fetchFixtures.length > 0) {
            exchange.loadMarkets = async () => exchange.markets;
        }

        for (const fetchFixture of fetchFixtures) {
            const { inputData, expected } = loadFixtureData(exchangeId, fixtureDir, fetchFixture.fixture);
            assert.ok(typeof exchange[fetchFixture.method] === 'function', `${fetchFixture.method.toString()} not implemented for ${exchangeId}`);

            const symbol = expected?.symbol;
            assert.ok(symbol, `${fetchFixture.fixture} expected fixture missing symbol`);

            const args = fetchFixture.args ? fetchFixture.args(expected) : [symbol];
            const calls: Array<{ path: string; api: string; method: string; params: any }> = [];
            const responsePayload = fetchFixture.responseFactory ? fetchFixture.responseFactory(inputData) : inputData;
            exchange.request = async (pathArg: any, apiArg: any, methodArg: any, paramsArg: any) => {
                calls.push({ path: pathArg, api: apiArg, method: methodArg, params: paramsArg });
                return responsePayload;
            };

            const marketArg = fetchFixture.needsMarket ? resolveMarket(exchange, expected) : undefined;
            if (marketArg) {
                // ensure market cache is populated for direct access
                exchange.markets[marketArg.symbol] = marketArg;
            }

            const rawResult = await exchange[fetchFixture.method](...args);
            const result = fetchFixture.resultTransform ? fetchFixture.resultTransform(rawResult) : rawResult;

            compareResults(result, expected, `${exchangeId} ${fetchFixture.fixture} fetch mismatch`);

            assert.ok(calls.length > 0, 'fetch helper did not invoke request');
            if (fetchFixture.request) {
                const call = calls[0];
                assert.equal(call.path, fetchFixture.request.path, 'request path mismatch');
                assert.equal(call.api, fetchFixture.request.api, 'request api mismatch');
                assert.equal(call.method, fetchFixture.request.httpMethod, 'request HTTP method mismatch');
            }
        }
    });
}

async function buildExchange(exchangeId: string): Promise<{ exchange: any; cleanup: () => void }> {
    const edlPath = path.join(exchangesDir, `${exchangeId}.edl.yaml`);
    const source = fs.readFileSync(edlPath, 'utf-8');
    const { code, result } = compileContent(source, { includeComments: false });

    assert.ok(result.success, `Compilation failed for ${exchangeId}: ${result.errors.join(', ')}`);
    assert.ok(code, `No code emitted for ${exchangeId}`);

    const jsCode = ts.transpileModule(code, {
        compilerOptions: {
            module: ts.ModuleKind.ES2020,
            target: ts.ScriptTarget.ES2020,
            moduleResolution: ts.ModuleResolutionKind.Node10,
            importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
        },
    }).outputText;

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `edl-${exchangeId}-`));
    const baseLink = path.join(tempDir, 'base');
    fs.symlinkSync(baseSourceDir, baseLink, 'dir');

    const outfile = path.join(tempDir, `${exchangeId}.mjs`);
    fs.writeFileSync(outfile, jsCode, 'utf-8');

    const module = await import(pathToFileURL(outfile).href);
    const ExchangeClass = module.default;
    const exchange = new ExchangeClass();

    const cleanup = () => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    };

    return { exchange, cleanup };
}

function loadMarkets(exchangeId: string): Record<string, any> {
    const marketsPath = path.join(fixturesRoot, exchangeId, 'markets-expected.json');
    const raw = JSON.parse(fs.readFileSync(marketsPath, 'utf-8'));
    const bySymbol: Record<string, any> = {};
    for (const market of raw) {
        if (market?.symbol) {
            bySymbol[market.symbol] = market;
        }
    }
    return bySymbol;
}

function loadFixtureData(exchangeId: string, fixtureDir: string, fixtureName: string) {
    const inputPath = path.join(fixtureDir, `${fixtureName}-input.json`);
    const expectedPath = path.join(fixtureDir, `${fixtureName}-expected.json`);

    assert.ok(fs.existsSync(inputPath), `Missing ${fixtureName} input fixture for ${exchangeId}`);
    assert.ok(fs.existsSync(expectedPath), `Missing ${fixtureName} expected fixture for ${exchangeId}`);

    return {
        inputData: JSON.parse(fs.readFileSync(inputPath, 'utf-8')),
        expected: JSON.parse(fs.readFileSync(expectedPath, 'utf-8')),
    };
}

function resolveMarket(exchange: any, expected: any) {
    const symbol = expected?.symbol;
    assert.ok(symbol, 'Expected fixture is missing symbol');
    return exchange.market(symbol);
}

/**
 * Normalize result for comparison
 * - Handles dynamic timestamps by using placeholder
 * - Normalizes null/undefined differences
 */
function normalizeResult(obj: any, isDynamic: (key: string) => boolean): any {
    if (obj === null || obj === undefined) {
        return null; // Normalize undefined to null for comparison
    }
    if (typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => normalizeResult(item, isDynamic));
    }
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (isDynamic(key)) {
            // For dynamic fields, just check type
            result[key] = typeof value === 'number' ? 'TIMESTAMP' :
                          typeof value === 'string' ? 'DATETIME' :
                          normalizeResult(value, isDynamic);
        } else {
            result[key] = normalizeResult(value, isDynamic);
        }
    }
    return result;
}

/**
 * Check if a key is a dynamic timestamp field
 */
function isDynamicField(key: string): boolean {
    return key === 'timestamp' || key === 'datetime';
}

/**
 * Compare results with tolerance for dynamic values and floating point
 */
function compareResults(actual: any, expected: any, label: string) {
    const normalizedActual = normalizeResult(actual, isDynamicField);
    const normalizedExpected = normalizeResult(expected, isDynamicField);
    // Debug: log normalized values if there's a mismatch
    try {
        assert.deepEqual(normalizedActual, normalizedExpected, label);
    } catch (e) {
        console.log('Normalized actual:', JSON.stringify(normalizedActual, null, 2));
        console.log('Normalized expected:', JSON.stringify(normalizedExpected, null, 2));
        throw e;
    }
}
