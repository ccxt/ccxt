// Run: npx tsx --test build/tests/test.hx10w10-CP06.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { cp06FromIsIdentity, cp06NativeCoreReturn, cp06SnippetChecks } from '../hx10w10-CP06.js';

const method = [
    'public async override Task<Int64> FetchTime(object parameters = null)',
    '{',
    '    Int64? timestamp = this.safeInteger(response, "timestamp");',
    '    Int64 fixedTimestamp = this.safeTimestamp(response, "ts");',
    '    object boxed = this.safeInteger(response, "ts");',
    '    Int64? shadowed = null;',
    '    foreach (var row in new List<object>() {})',
    '    {',
    '        Int64? shadowed = null;',
    '    }',
    '    return null;',
    '}',
];

test('FromDict is the identity, its siblings are not', () => {
    assert.equal(cp06FromIsIdentity('ccxt.BaseExchange.FromDict'), true);
    assert.equal(cp06FromIsIdentity('ccxt.BaseExchange.ToDict'), false);
    assert.equal(cp06FromIsIdentity('ccxt.BaseExchange.FromDictList'), false);
    assert.equal(cp06FromIsIdentity('ccxt.BaseExchange.FromInt64'), false);
});

test('FromDict funnel wrap collapses to the bare operand', () => {
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.FromDict', ' await this.FetchWallet(parameters) ', method, method), 'await this.FetchWallet(parameters)');
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.ToOHLCVDict', 'payload', method, method), '');
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.FromDictList', 'payload', method, method), '');
});

test('ToOrderBookSnapshot on a proven IOrderBook limit() prints the native Copy()', () => {
    const out = cp06NativeCoreReturn('ccxt.BaseExchange.ToOrderBookSnapshot', '(orderbook as IOrderBook).limit()', method, method);
    assert.equal(out, '(orderbook as IOrderBook).limit().Copy()');
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.ToOrderBookSnapshot', '(orderbook as ccxt.pro.IOrderBook).limit()', method, method), '(orderbook as ccxt.pro.IOrderBook).limit().Copy()');
});

test('ToOrderBookSnapshot keeps every unproven operand', () => {
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.ToOrderBookSnapshot', 'orderbook', method, method), '');
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.ToOrderBookSnapshot', 'await this.watch(((string)url), messageHash, request, messageHash)', method, method), '');
    assert.equal(cp06NativeCoreReturn('ccxt.BaseExchange.ToPredictionOrderBookSnapshot', '(orderbook as IOrderBook).limit()', method, method), '');
});

test('ToInt64Value folds on Int64 / Int64? operands only', () => {
    const native = (expr: string) => cp06NativeCoreReturn('ccxt.BaseExchange.ToInt64Value', expr, method.join('\n'), method);
    assert.equal(native('timestamp'), 'timestamp ?? 0');
    assert.equal(native('fixedTimestamp'), 'fixedTimestamp');
    assert.equal(native('this.milliseconds()'), 'this.milliseconds()');
    assert.equal(native('boxed'), '');
    assert.equal(native('parameters'), '');
    assert.equal(native('shadowed'), '');
    assert.equal(native('this.safeInteger(response, "ts")'), 'this.safeInteger(response, "ts") ?? 0');
    assert.equal(native('this.safeTimestamp(response, "ts")'), 'this.safeTimestamp(response, "ts") ?? 0');
    assert.equal(native('this.parseToInt(nonce)'), '');
    assert.equal(native('this.safeIntegerProduct2(response, "a", "b")'), '');
    assert.equal(native('null'), '');
});

test('module self-test is clean', () => {
    assert.deepEqual(cp06SnippetChecks(), []);
});
