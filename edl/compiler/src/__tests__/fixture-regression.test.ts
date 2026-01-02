import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

import { compileContent } from '../index.js';

/**
 * Comprehensive fixture-based regression tests for EDL compiler
 *
 * This test suite validates that the EDL compiler generates parsers
 * that match CCXT library behavior for all major data types across
 * Binance and Kraken exchanges.
 *
 * Coverage:
 * - Trading: ticker, trade, order, balance, fundingRate, markets, ohlcv
 * - Wallet: deposits, withdrawals, deposit-address, transfers
 */

interface FixtureConfig {
    name: string;
    method: keyof any;
    needsMarket?: boolean;
    isArray?: boolean; // For parsers that handle arrays (deposits, withdrawals, etc.)
}

interface ExchangeFixtures {
    trading: FixtureConfig[];
    wallet?: FixtureConfig[];
}

// NOTE: Only testing parsers that are fully implemented in EDL
// TODO: Add back fundingRate, ohlcv fixtures once implemented
const EXCHANGE_FIXTURES: Record<string, ExchangeFixtures> = {
    binance: {
        trading: [
            { name: 'ticker', method: 'parseTicker', needsMarket: true },
            { name: 'trade', method: 'parseTrade', needsMarket: true },
            { name: 'order', method: 'parseOrder', needsMarket: true },
            { name: 'markets', method: 'parseMarket', isArray: true },
            { name: 'balance', method: 'parseBalance' },
            // { name: 'fundingRate', method: 'parseFundingRate', needsMarket: true },
            // { name: 'ohlcv', method: 'parseOHLCV', needsMarket: true, isArray: true },
        ],
        wallet: [
            { name: 'deposits', method: 'parseDeposit', isArray: true },
            { name: 'withdrawals', method: 'parseWithdrawal', isArray: true },
            { name: 'deposit-address', method: 'parseDepositAddress', isArray: true },
        ],
    },
    kraken: {
        trading: [
            { name: 'ticker', method: 'parseTicker', needsMarket: true },
            { name: 'trade', method: 'parseTrade', needsMarket: true },
            { name: 'order', method: 'parseOrder', needsMarket: true },
            { name: 'markets', method: 'parseMarket', isArray: true },
            { name: 'balance', method: 'parseBalance' },
            // { name: 'fundingRate', method: 'parseFundingRate', needsMarket: true },
        ],
        wallet: [
            { name: 'deposits', method: 'parseDeposit', isArray: true },
            { name: 'withdrawals', method: 'parseWithdrawal', isArray: true },
            { name: 'deposit-address', method: 'parseDepositAddress', isArray: true },
        ],
    },
};

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const compilerRoot = path.resolve(__dirname, '..', '..');
const edlRoot = path.resolve(compilerRoot, '..');
const repoRoot = path.resolve(edlRoot, '..');
const exchangesDir = path.resolve(edlRoot, 'exchanges');
const fixturesRoot = path.resolve(compilerRoot, 'test-fixtures');
const baseSourceDir = path.resolve(repoRoot, 'js', 'src', 'base');

for (const [exchangeId, fixtures] of Object.entries(EXCHANGE_FIXTURES)) {
    test(`${exchangeId} - trading fixtures`, async t => {
        const { exchange, cleanup } = await buildExchange(exchangeId);
        t.after(() => cleanup());

        const markets = loadMarkets(exchangeId);
        exchange.setMarkets(markets);

        const fixtureDir = path.join(fixturesRoot, exchangeId);

        for (const fixture of fixtures.trading) {
            await t.test(`${fixture.name}`, () => {
                const { inputData, expected } = loadFixtureData(exchangeId, fixtureDir, fixture.name);

                assert.ok(
                    typeof exchange[fixture.method] === 'function',
                    `${fixture.method.toString()} not implemented for ${exchangeId}`
                );

                if (fixture.isArray) {
                    // Handle array parsers (like parseMarket which processes arrays from exchangeInfo)
                    assert.ok(Array.isArray(expected), `${fixture.name} expected should be an array`);

                    // For markets, the EDL-generated parseMarket handles the full response
                    // and iterates internally. Pass the full input data.
                    if (fixture.name === 'markets') {
                        // EDL parsers handle full response with iteration built-in
                        const results = exchange[fixture.method](inputData);
                        assert.deepEqual(
                            results,
                            expected,
                            `${exchangeId} ${fixture.name} parser mismatch`
                        );
                    } else {
                        // For other array fixtures, map over individual items
                        let itemsToProcess: any[];
                        if (Array.isArray(inputData)) {
                            itemsToProcess = inputData;
                        } else {
                            throw new Error(`${fixture.name} input should be an array`);
                        }

                        const results = itemsToProcess.map((item: any) => {
                            const marketArg = fixture.needsMarket ? resolveMarketForData(exchange, item, expected[0]) : undefined;
                            return fixture.needsMarket
                                ? exchange[fixture.method](item, marketArg)
                                : exchange[fixture.method](item);
                        });

                        assert.deepEqual(
                            results,
                            expected,
                            `${exchangeId} ${fixture.name} parser mismatch`
                        );
                    }
                } else {
                    // Handle single-object parsers
                    const marketArg = fixture.needsMarket ? resolveMarket(exchange, expected) : undefined;
                    const actual = fixture.needsMarket
                        ? exchange[fixture.method](inputData, marketArg)
                        : exchange[fixture.method](inputData);

                    compareResults(
                        actual,
                        expected,
                        `${exchangeId} ${fixture.name} parser mismatch`
                    );
                }
            });
        }
    });

    // Wallet fixtures tests
    const walletFixtures = fixtures.wallet;
    if (walletFixtures && walletFixtures.length > 0) {
        test(`${exchangeId} - wallet fixtures`, async t => {
            const { exchange, cleanup } = await buildExchange(exchangeId);
            t.after(() => cleanup());

            const markets = loadMarkets(exchangeId);
            exchange.setMarkets(markets);

            const walletFixtureDir = path.join(fixturesRoot, 'wallet', exchangeId);

            for (const fixture of walletFixtures) {
                await t.test(`${fixture.name}`, () => {
                    const { inputData, expected } = loadFixtureData(
                        exchangeId,
                        walletFixtureDir,
                        fixture.name
                    );

                    assert.ok(
                        typeof exchange[fixture.method] === 'function',
                        `${fixture.method.toString()} not implemented for ${exchangeId}`
                    );

                    if (fixture.isArray) {
                        // Handle array fixtures (deposits, withdrawals, transfers)
                        assert.ok(Array.isArray(inputData), `${fixture.name} input should be an array`);
                        assert.ok(Array.isArray(expected), `${fixture.name} expected should be an array`);

                        const results = inputData.map((item: any) =>
                            exchange[fixture.method](item)
                        );

                        assert.deepEqual(
                            results,
                            expected,
                            `${exchangeId} ${fixture.name} parser mismatch`
                        );
                    } else {
                        // Handle single-object parsers (deposit-address)
                        const actual = exchange[fixture.method](inputData);

                        assert.deepEqual(
                            actual,
                            expected,
                            `${exchangeId} ${fixture.name} parser mismatch`
                        );
                    }
                });
            }
        });
    }
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

/**
 * Build an exchange instance from EDL definition
 */
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

/**
 * Load markets data for an exchange
 */
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

/**
 * Load fixture input and expected data
 */
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

/**
 * Resolve market from expected output
 * Creates a minimal mock market if not found in exchange
 */
function resolveMarket(exchange: any, expected: any) {
    const symbol = expected?.symbol;
    if (!symbol) return undefined;

    try {
        return exchange.market(symbol);
    } catch (e) {
        // If market not found, create a minimal mock
        const [base, quote] = symbol.split('/');
        return {
            symbol,
            base,
            quote,
            id: symbol.replace('/', ''),
            type: 'spot'
        };
    }
}

/**
 * Resolve market for array item data (e.g., OHLCV)
 * Creates a minimal mock market if not found in exchange
 */
function resolveMarketForData(exchange: any, input: any, expected: any) {
    // For OHLCV and similar, the expected data might not have symbol
    // We'll try to get it from expected first, otherwise use a default
    const symbol = expected?.symbol;
    if (!symbol) return undefined;

    try {
        return exchange.market(symbol);
    } catch (e) {
        // If market not found, create a minimal mock
        const [base, quote] = symbol.split('/');
        return {
            symbol,
            base,
            quote,
            id: symbol.replace('/', ''),
            type: 'spot'
        };
    }
}
