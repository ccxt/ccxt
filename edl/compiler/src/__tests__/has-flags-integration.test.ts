/**
 * Integration Tests for Has Flags Parser with EDL Documents
 * Tests the integration of has flags parsing with the main EDL parser
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEDLContent } from '../parser/index.js';

test('EDL parser integrates has flags for exchange metadata', () => {
    const edl = `
version: "1.0"
exchange:
  id: test-exchange
  name: Test Exchange
  countries: [US]
  has:
    fetchTicker: true
    fetchOrderBook: false
    createOrder: true
    editOrder: null
    fetchOHLCV: emulated
`;

    const result = parseEDLContent(edl, 'test.edl');

    assert.equal(result.success, true);
    assert.ok(result.document);
    assert.ok(result.document.exchange.has);
    assert.equal(result.document.exchange.has.fetchTicker, true);
    assert.equal(result.document.exchange.has.fetchOrderBook, false);
    assert.equal(result.document.exchange.has.createOrder, true);
    assert.equal(result.document.exchange.has.editOrder, null);
    assert.equal(result.document.exchange.has.fetchOHLCV, 'emulated');
});

test('EDL parser handles market-specific has flags', () => {
    const edl = `
version: "1.0"
exchange:
  id: test-exchange
  name: Test Exchange
  countries: [US]
  has:
    fetchTicker: true
    createOrder:
      default: true
      option: false
    setLeverage:
      spot: false
      margin: true
      swap: true
      future: true
`;

    const result = parseEDLContent(edl, 'test.edl');

    assert.equal(result.success, true);
    assert.ok(result.document);
    assert.ok(result.document.exchange.has);

    assert.equal(result.document.exchange.has.fetchTicker, true);

    const createOrder = result.document.exchange.has.createOrder as any;
    assert.equal(createOrder.default, true);
    assert.equal(createOrder.option, false);

    const setLeverage = result.document.exchange.has.setLeverage as any;
    assert.equal(setLeverage.spot, false);
    assert.equal(setLeverage.margin, true);
    assert.equal(setLeverage.swap, true);
    assert.equal(setLeverage.future, true);
});

test('EDL parser reports errors for invalid has flags', () => {
    const edl = `
version: "1.0"
exchange:
  id: test-exchange
  name: Test Exchange
  countries: [US]
  has:
    fetchTicker: invalid
    createOrder: 123
`;

    const result = parseEDLContent(edl, 'test.edl');

    // Should have errors but still parse the document
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors.some(e => e.message.includes('fetchTicker')));
    assert.ok(result.errors.some(e => e.message.includes('createOrder')));
});

test('EDL parser supports top-level has flags (legacy format)', () => {
    const edl = `
version: "1.0"
exchange:
  id: test-exchange
  name: Test Exchange
  countries: [US]
has:
  fetchTicker: true
  fetchOrderBook: true
  createOrder: false
`;

    const result = parseEDLContent(edl, 'test.edl');

    assert.equal(result.success, true);
    assert.ok(result.document);
    assert.ok(result.document.exchange.has);
    assert.equal(result.document.exchange.has.fetchTicker, true);
    assert.equal(result.document.exchange.has.fetchOrderBook, true);
    assert.equal(result.document.exchange.has.createOrder, false);
});

test('EDL parser handles complex real-world exchange definition', () => {
    const edl = `
version: "1.0"
exchange:
  id: example-exchange
  name: Example Exchange
  countries: [US, UK]
  rateLimit: 1000
  certified: true
  has:
    # Market Data
    fetchMarkets: true
    fetchCurrencies: true
    fetchTicker: true
    fetchTickers: true
    fetchOrderBook: true
    fetchTrades: true
    fetchOHLCV: true

    # Trading
    createOrder: true
    cancelOrder: true
    editOrder:
      spot: true
      swap: emulated
      future: false
    fetchOrder: true
    fetchOpenOrders: true

    # Account
    fetchBalance: true
    fetchMyTrades: true

    # Advanced Features
    fetchFundingRate:
      spot: false
      swap: true
      future: true
    setLeverage:
      margin: true
      swap: true
      future: true

    # WebSocket
    watchTicker: emulated
    watchOrderBook: emulated
    watchTrades: false

    # Unknown
    fetchStatus: null
    customMethod: true
`;

    const result = parseEDLContent(edl, 'example.edl');

    assert.equal(result.success, true);
    assert.ok(result.document);

    const has = result.document.exchange.has!;
    assert.equal(has.fetchMarkets, true);
    assert.equal(has.createOrder, true);
    assert.equal(has.watchTicker, 'emulated');
    assert.equal(has.fetchStatus, null);
    assert.equal(has.customMethod, true);

    const editOrder = has.editOrder as any;
    assert.equal(editOrder.spot, true);
    assert.equal(editOrder.swap, 'emulated');
    assert.equal(editOrder.future, false);

    const fundingRate = has.fetchFundingRate as any;
    assert.equal(fundingRate.spot, false);
    assert.equal(fundingRate.swap, true);
    assert.equal(fundingRate.future, true);
});
