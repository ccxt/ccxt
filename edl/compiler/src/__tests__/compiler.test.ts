import test from 'node:test';
import assert from 'node:assert/strict';

import { compileContent } from '../index.js';

const baseHeader = `
exchange:
  id: demo
  name: Demo Exchange
  countries: [US]
  rateLimit: 1000
`;

test('top-level metadata merges into exchange describe()', () => {
    const edl = `
${baseHeader}

urls:
  api:
    public: https://api.demo.com
  www: https://demo.com
has:
  fetchTicker: true
requiredCredentials:
  apiKey: true

api:
  public:
    get:
      ticker:
        cost: 1

parsers:
  ticker:
    source: ticker
    mapping:
      symbol:
        literal: BTC/USDT
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes("urls: {"), 'urls block missing in describe');
    assert.ok(code?.includes("requiredCredentials"), 'requiredCredentials not merged');
});

test('array parsers support compute mappings and iterator alias', () => {
    const edl = `
${baseHeader}

api:
  public:
    get:
      trades:
        cost: 1

parsers:
  trades:
    source: trades
    iterator: array
    path: data
    mapping:
      price:
        path: price
        transform: parse_number
      amount:
        path: amount
        transform: parse_number
      cost:
        compute: '{price} * {amount}'
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes('const items = Array.isArray'), 'array normalization missing');
    assert.ok(code?.includes('entry.cost = entry.price * entry.amount'), 'compute field not emitted');
});

test('entries iterator generates Object.entries iteration', () => {
    const edl = `
${baseHeader}

api:
  private:
    get:
      balance:
        cost: 1

parsers:
  balance:
    source: balance
    iterator: entries
    path: result
    mapping:
      currency:
        from_context: currencyId
        transform: parse_currency_code
      free:
        from_context: value
        transform: parse_number
      used:
        literal: undefined
      total:
        from_context: value
        transform: parse_number
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    // Should use Object.entries for iteration
    assert.ok(code?.includes('Object.entries(data)'), 'Object.entries iteration missing');
    // Should destructure key and value
    assert.ok(code?.includes('currencyId, _value'), 'key/value destructuring missing');
    // Should reference _value for 'value' context
    assert.ok(code?.includes('this.safeNumber(_value)') || code?.includes('this.parseNumber(_value)'),
        'value context variable reference missing');
});

test('entries iterator uses correct key variable name from from_context', () => {
    const edl = `
${baseHeader}

api:
  private:
    get:
      trades:
        cost: 1

parsers:
  trade:
    source: trades
    iterator: entries
    path: result.trades
    mapping:
      id:
        from_context: tradeId
      order:
        path: ordertxid
        transform: parse_string
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    // Should use tradeId as the key variable
    assert.ok(code?.includes('tradeId, _value'), 'tradeId key variable missing');
    // The id field should use the tradeId variable
    assert.ok(code?.includes('id: tradeId'), 'id field should use tradeId');
});

test('fetch methods honor parser source endpoints', () => {
    const edl = `
${baseHeader}

api:
  public:
    get:
      customTicker:
        cost: 1

parsers:
  ticker:
    source: public.get.customTicker
    path: data
    mapping:
      symbol:
        literal: BTC/USDT
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes('this.publicGetCustomTicker'), 'fetchTicker did not call resolved endpoint');
});

test('fetch methods resolve slash-separated parser sources', () => {
    const edl = `
${baseHeader}

api:
  public:
    get:
      customTicker:
        cost: 1

parsers:
  ticker:
    source: public/get/customTicker
    path: data
    mapping:
      symbol:
        literal: BTC/USDT
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes('this.publicGetCustomTicker'), 'slash-separated source did not resolve endpoint');
});

test('fetch methods resolve endpoints with prefixed category paths', () => {
    const edl = `
${baseHeader}

api:
  test_public:
    get:
      public/ticker:
        cost: 1

parsers:
  ticker:
    source: public/ticker
    path: data
    mapping:
      symbol:
        literal: BTC/USDT
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes('this.test_publicGetPublicTicker'), 'prefixed category source did not resolve endpoint');
});

test('fetch methods route private parser sources through private helpers', () => {
    const edl = `
${baseHeader}

api:
  private:
    get:
      accountInfo:
        cost: 1

parsers:
  ticker:
    source: private.get.accountInfo
    mapping:
      symbol:
        literal: BTC/USDT
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes('this.privateGetAccountInfo'), 'private parser source did not call private helper');
});

test('compiler emits sign() when auth configuration is provided', () => {
    const edl = `
${baseHeader}

auth:
  type: hmac
  algorithm: sha256

api:
  public:
    get:
      ping:
        cost: 1
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes("sign(path: string, api: string = 'public'"), 'sign method signature missing');
    assert.ok(code?.includes('this.checkRequiredCredentials();'), 'sign method missing credential enforcement');
});

test('generates api helper methods for defined endpoints', () => {
    const edl = `
${baseHeader}

api:
  public:
    get:
      ticker:
        cost: 2
        params:
          symbol:
            type: string
            required: true
          type:
            type: string
            required: false
            enum: [spot, margin]
  private:
    post:
      order:
        path: order
        rateLimit:
          cost: 5
          limit: 10
          interval: 1000
        params:
          side:
            type: string
            required: true
            enum: [buy, sell]
          orderType:
            type: string
            enum: [limit, market]
          price:
            type: float
            required_if: "orderType == 'limit' || orderType == 'stop'"
`;

    const { code, result } = compileContent(edl);
    assert.ok(result.success, `expected compile success: ${result.errors.join(', ')}`);
    assert.ok(code?.includes('async publicGetTicker(params: Dict = {}, context: Dict = {}): Promise<any>'), 'public helper signature missing');
    assert.ok(code?.includes("return await this.request('ticker', 'public', 'GET', params, undefined, undefined, { cost: 2 }, context);"), 'public helper request missing');
    assert.ok(code?.includes("this.checkRequiredArgument('publicGetTicker', params.symbol, 'symbol');"), 'required param validation missing');
    assert.ok(code?.includes("if (params.type !== undefined) {"), 'optional enum guard missing');
    assert.ok(code?.includes("this.checkRequiredArgument('publicGetTicker', params.type, 'type', ['spot', 'margin']);"), 'optional enum validation missing');
    assert.ok(code?.includes('async privatePostOrder(params: Dict = {}, context: Dict = {}): Promise<any>'), 'private helper signature missing');
    assert.ok(code?.includes("return await this.request('order', 'private', 'POST', params, undefined, undefined, { cost: 5, limit: 10, interval: 1000 }, context);"), 'private helper request missing');
    assert.ok(code?.includes("this.checkRequiredArgument('privatePostOrder', params.side, 'side', ['buy', 'sell']);"), 'private enum validation missing');
    assert.ok(code?.includes("this.checkRequiredArgument('privatePostOrder', params.orderType, 'orderType', ['limit', 'market']);"), 'optional private enum validation missing');
    assert.ok(code?.includes('if ((params.orderType === "limit" || params.orderType === "stop")) {'), 'required_if condition missing');
    assert.ok(code?.includes("this.checkRequiredArgument('privatePostOrder', params.price, 'price');"), 'required_if enforcement missing');
});
