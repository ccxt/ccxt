/**
 * Tests for Has Flags Derivation
 * Tests the logic that derives capability flags from parsers and API endpoints
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    deriveHasFlags,
    deriveFlagsFromParsers,
    deriveFlagsFromAPI,
    matchEndpointToFlags,
    inferWebSocketSupport,
    getDefinedCapabilities,
    hasCapability,
    categorizeCapabilities,
} from '../helpers/has-flags.js';
import type { EDLDocument, APIDefinition } from '../types/edl.js';
import type { HasFlagsSchema } from '../schemas/has-flags.js';

// ============================================================
// Parser Derivation Tests
// ============================================================

test('deriveFlagsFromParsers: ticker parser enables fetchTicker', () => {
    const flags = deriveFlagsFromParsers({
        ticker: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchTicker, true);
});

test('deriveFlagsFromParsers: orderBook parser enables fetchOrderBook', () => {
    const flags = deriveFlagsFromParsers({
        orderBook: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchOrderBook, true);
});

test('deriveFlagsFromParsers: orderbook (lowercase) parser enables fetchOrderBook', () => {
    const flags = deriveFlagsFromParsers({
        orderbook: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchOrderBook, true);
});

test('deriveFlagsFromParsers: trade parser enables fetchTrades', () => {
    const flags = deriveFlagsFromParsers({
        trade: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchTrades, true);
});

test('deriveFlagsFromParsers: trades parser enables fetchTrades', () => {
    const flags = deriveFlagsFromParsers({
        trades: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchTrades, true);
});

test('deriveFlagsFromParsers: myTrades source enables fetchMyTrades', () => {
    const flags = deriveFlagsFromParsers({
        trade: {
            source: 'myTrades',
            mapping: {},
        },
    });

    assert.equal(flags.fetchMyTrades, true);
});

test('deriveFlagsFromParsers: ohlcv parser enables fetchOHLCV', () => {
    const flags = deriveFlagsFromParsers({
        ohlcv: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchOHLCV, true);
});

test('deriveFlagsFromParsers: balance parser enables fetchBalance', () => {
    const flags = deriveFlagsFromParsers({
        balance: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchBalance, true);
});

test('deriveFlagsFromParsers: order parser enables createOrder, cancelOrder, fetchOrder', () => {
    const flags = deriveFlagsFromParsers({
        order: {
            mapping: {},
        },
    });

    assert.equal(flags.createOrder, true);
    assert.equal(flags.cancelOrder, true);
    assert.equal(flags.fetchOrder, true);
});

test('deriveFlagsFromParsers: market parser enables fetchMarkets', () => {
    const flags = deriveFlagsFromParsers({
        market: {
            mapping: {},
        },
    });

    assert.equal(flags.fetchMarkets, true);
});

test('deriveFlagsFromParsers: multiple parsers enable multiple flags', () => {
    const flags = deriveFlagsFromParsers({
        ticker: { mapping: {} },
        orderBook: { mapping: {} },
        trade: { mapping: {} },
        balance: { mapping: {} },
    });

    assert.equal(flags.fetchTicker, true);
    assert.equal(flags.fetchOrderBook, true);
    assert.equal(flags.fetchTrades, true);
    assert.equal(flags.fetchBalance, true);
});

// ============================================================
// API Endpoint Derivation Tests
// ============================================================

test('deriveFlagsFromAPI: GET ticker endpoint enables fetchTicker', () => {
    const api: APIDefinition = {
        public: {
            get: {
                ticker: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchTicker, true);
});

test('deriveFlagsFromAPI: GET orderBook endpoint enables fetchOrderBook', () => {
    const api: APIDefinition = {
        public: {
            get: {
                orderBook: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchOrderBook, true);
});

test('deriveFlagsFromAPI: GET depth endpoint enables fetchOrderBook', () => {
    const api: APIDefinition = {
        public: {
            get: {
                depth: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchOrderBook, true);
});

test('deriveFlagsFromAPI: POST order endpoint enables createOrder', () => {
    const api: APIDefinition = {
        private: {
            post: {
                order: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.createOrder, true);
});

test('deriveFlagsFromAPI: GET order endpoint enables fetchOrder', () => {
    const api: APIDefinition = {
        private: {
            get: {
                order: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchOrder, true);
});

test('deriveFlagsFromAPI: DELETE order endpoint enables cancelOrder', () => {
    const api: APIDefinition = {
        private: {
            delete: {
                order: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.cancelOrder, true);
});

test('deriveFlagsFromAPI: PUT order endpoint enables editOrder', () => {
    const api: APIDefinition = {
        private: {
            put: {
                order: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.editOrder, true);
});

test('deriveFlagsFromAPI: GET openOrders endpoint enables fetchOpenOrders', () => {
    const api: APIDefinition = {
        private: {
            get: {
                openOrders: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchOpenOrders, true);
});

test('deriveFlagsFromAPI: GET myTrades endpoint enables fetchMyTrades', () => {
    const api: APIDefinition = {
        private: {
            get: {
                myTrades: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchMyTrades, true);
});

test('deriveFlagsFromAPI: GET balance endpoint enables fetchBalance', () => {
    const api: APIDefinition = {
        private: {
            get: {
                balance: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.fetchBalance, true);
});

test('deriveFlagsFromAPI: POST withdraw endpoint enables withdraw', () => {
    const api: APIDefinition = {
        private: {
            post: {
                withdraw: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);
    assert.equal(flags.withdraw, true);
});

test('deriveFlagsFromAPI: comprehensive API definition', () => {
    const api: APIDefinition = {
        public: {
            get: {
                ticker: {},
                orderBook: {},
                trades: {},
                klines: {},
                exchangeInfo: {},
            },
        },
        private: {
            get: {
                balance: {},
                openOrders: {},
                myTrades: {},
            },
            post: {
                order: {},
            },
            delete: {
                order: {},
            },
        },
    };

    const flags = deriveFlagsFromAPI(api);

    assert.equal(flags.fetchTicker, true);
    assert.equal(flags.fetchOrderBook, true);
    assert.equal(flags.fetchTrades, true);
    assert.equal(flags.fetchOHLCV, true);
    assert.equal(flags.fetchMarkets, true);
    assert.equal(flags.fetchBalance, true);
    assert.equal(flags.fetchOpenOrders, true);
    assert.equal(flags.fetchMyTrades, true);
    assert.equal(flags.createOrder, true);
    assert.equal(flags.cancelOrder, true);
});

// ============================================================
// Endpoint Pattern Matching Tests
// ============================================================

test('matchEndpointToFlags: ticker with GET', () => {
    const flags = matchEndpointToFlags('ticker', 'get');
    assert.equal(flags.fetchTicker, true);
});

test('matchEndpointToFlags: ticker/24hr with GET', () => {
    const flags = matchEndpointToFlags('ticker/24hr', 'get');
    assert.equal(flags.fetchTicker, true);
});

test('matchEndpointToFlags: order with POST', () => {
    const flags = matchEndpointToFlags('order', 'post');
    assert.equal(flags.createOrder, true);
});

test('matchEndpointToFlags: order with GET', () => {
    const flags = matchEndpointToFlags('order', 'get');
    assert.equal(flags.fetchOrder, true);
});

test('matchEndpointToFlags: order with DELETE', () => {
    const flags = matchEndpointToFlags('order', 'delete');
    assert.equal(flags.cancelOrder, true);
});

test('matchEndpointToFlags: order/test with POST still enables createOrder', () => {
    const flags = matchEndpointToFlags('order/test', 'post');
    assert.equal(flags.createOrder, true);
});

// ============================================================
// Complete Document Derivation Tests
// ============================================================

test('deriveHasFlags: combines parsers and API', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'test',
            name: 'Test Exchange',
            countries: ['US'],
            rateLimit: 1000,
        },
        parsers: {
            ticker: { mapping: {} },
        },
        api: {
            public: {
                get: {
                    orderBook: {},
                },
            },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    assert.equal(flags.fetchTicker, true);
    assert.equal(flags.fetchOrderBook, true);
    assert.equal(flags.spot, true);
});

test('deriveHasFlags: explicit has flags override derived flags', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'test',
            name: 'Test Exchange',
            countries: ['US'],
            rateLimit: 1000,
            has: {
                fetchTicker: false, // Override
                createOrder: true, // Explicit
            },
        },
        parsers: {
            ticker: { mapping: {} },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    assert.equal(flags.fetchTicker, false); // Overridden
    assert.equal(flags.createOrder, true); // Explicit
});

test('deriveHasFlags: publicAPI and privateAPI flags', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'test',
            name: 'Test Exchange',
            countries: ['US'],
            rateLimit: 1000,
        },
        api: {
            public: {
                get: {
                    ticker: {},
                },
            },
            private: {
                get: {
                    balance: {},
                },
            },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    assert.equal(flags.publicAPI, true);
    assert.equal(flags.privateAPI, true);
});

test('deriveHasFlags: only public API', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'test',
            name: 'Test Exchange',
            countries: ['US'],
            rateLimit: 1000,
        },
        api: {
            public: {
                get: {
                    ticker: {},
                },
            },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    assert.equal(flags.publicAPI, true);
    assert.equal(flags.privateAPI, false);
});

test('deriveHasFlags: market type flags are set by default', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'test',
            name: 'Test Exchange',
            countries: ['US'],
            rateLimit: 1000,
        },
    } as any;

    const flags = deriveHasFlags(doc);

    assert.equal(flags.spot, true);
    assert.equal(flags.margin, false);
    assert.equal(flags.swap, false);
    assert.equal(flags.future, false);
    assert.equal(flags.option, false);
});

test('deriveHasFlags: market type flags can be overridden', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'test',
            name: 'Test Exchange',
            countries: ['US'],
            rateLimit: 1000,
            has: {
                spot: true,
                margin: true,
                swap: true,
                future: true,
            },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    assert.equal(flags.spot, true);
    assert.equal(flags.margin, true);
    assert.equal(flags.swap, true);
    assert.equal(flags.future, true);
});

// ============================================================
// Utility Function Tests
// ============================================================

test('inferWebSocketSupport: returns true when watch* methods exist', () => {
    const flags: HasFlagsSchema = {
        watchTicker: true,
        watchOrderBook: true,
    };

    assert.equal(inferWebSocketSupport(flags), true);
});

test('inferWebSocketSupport: returns false when no watch* methods exist', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: true,
        fetchOrderBook: true,
    };

    assert.equal(inferWebSocketSupport(flags), false);
});

test('inferWebSocketSupport: returns false when watch* methods are all false', () => {
    const flags: HasFlagsSchema = {
        watchTicker: false,
        watchOrderBook: false,
    };

    assert.equal(inferWebSocketSupport(flags), false);
});

test('getDefinedCapabilities: returns only defined capabilities', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: true,
        fetchOrderBook: false,
        createOrder: true,
        cancelOrder: undefined as any,
        editOrder: 'emulated',
    };

    const capabilities = getDefinedCapabilities(flags);

    assert.ok(capabilities.includes('fetchTicker'));
    assert.ok(!capabilities.includes('fetchOrderBook')); // false is filtered out
    assert.ok(capabilities.includes('createOrder'));
    assert.ok(!capabilities.includes('cancelOrder')); // undefined is filtered out
    assert.ok(capabilities.includes('editOrder')); // emulated is included
});

test('hasCapability: returns true for boolean true', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: true,
    };

    assert.equal(hasCapability(flags, 'fetchTicker'), true);
});

test('hasCapability: returns false for boolean false', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: false,
    };

    assert.equal(hasCapability(flags, 'fetchTicker'), false);
});

test('hasCapability: returns true for emulated', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: 'emulated',
    };

    assert.equal(hasCapability(flags, 'fetchTicker'), true);
});

test('hasCapability: returns false for null', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: null,
    };

    assert.equal(hasCapability(flags, 'fetchTicker'), false);
});

test('hasCapability: handles market-specific flags', () => {
    const flags: HasFlagsSchema = {
        createOrder: {
            spot: true,
            swap: false,
            future: 'emulated',
        },
    };

    assert.equal(hasCapability(flags, 'createOrder', 'spot'), true);
    assert.equal(hasCapability(flags, 'createOrder', 'swap'), false);
    assert.equal(hasCapability(flags, 'createOrder', 'future'), true); // emulated counts as true
});

test('hasCapability: uses default value for market-specific flags', () => {
    const flags: HasFlagsSchema = {
        createOrder: {
            default: true,
            option: false,
        },
    };

    assert.equal(hasCapability(flags, 'createOrder', 'spot'), true); // uses default
    assert.equal(hasCapability(flags, 'createOrder', 'option'), false);
});

test('categorizeCapabilities: groups capabilities correctly', () => {
    const flags: HasFlagsSchema = {
        fetchTicker: true,
        fetchOrderBook: true,
        createOrder: true,
        fetchBalance: true,
        withdraw: true,
        fetchFundingRate: true,
        watchTicker: true,
    };

    const categories = categorizeCapabilities(flags);

    assert.ok(categories.marketData?.includes('fetchTicker'));
    assert.ok(categories.marketData?.includes('fetchOrderBook'));
    assert.ok(categories.trading?.includes('createOrder'));
    assert.ok(categories.account?.includes('fetchBalance'));
    assert.ok(categories.funding?.includes('withdraw'));
    assert.ok(categories.margin?.includes('fetchFundingRate'));
    assert.ok(categories.websocket?.includes('watchTicker'));
});

test('categorizeCapabilities: handles empty flags', () => {
    const flags: HasFlagsSchema = {};
    const categories = categorizeCapabilities(flags);

    // Should return an object with no categories (or empty categories)
    const keys = Object.keys(categories);
    assert.equal(keys.length, 0);
});

// ============================================================
// Real-World Scenario Tests
// ============================================================

test('Real-world: Binance-like exchange', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'binance',
            name: 'Binance',
            countries: [],
            rateLimit: 50,
            has: {
                spot: true,
                margin: true,
                swap: true,
                future: true,
                option: true,
            },
        },
        parsers: {
            ticker: { mapping: {} },
            orderBook: { mapping: {} },
            trade: { mapping: {} },
            order: { mapping: {} },
            balance: { mapping: {} },
        },
        api: {
            public: {
                get: {
                    ping: {},
                    time: {},
                    exchangeInfo: {},
                    depth: {},
                    trades: {},
                    klines: {},
                    ticker: {},
                },
            },
            private: {
                get: {
                    account: {},
                    myTrades: {},
                    openOrders: {},
                    allOrders: {},
                },
                post: {
                    order: {},
                },
                delete: {
                    order: {},
                    openOrders: {},
                },
            },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    // Market types
    assert.equal(flags.spot, true);
    assert.equal(flags.margin, true);
    assert.equal(flags.swap, true);
    assert.equal(flags.future, true);
    assert.equal(flags.option, true);

    // Market data
    assert.equal(flags.fetchTime, true);
    assert.equal(flags.fetchMarkets, true);
    assert.equal(flags.fetchTicker, true);
    assert.equal(flags.fetchOrderBook, true);
    assert.equal(flags.fetchTrades, true);
    assert.equal(flags.fetchOHLCV, true);

    // Trading
    assert.equal(flags.createOrder, true);
    assert.equal(flags.cancelOrder, true);
    assert.equal(flags.fetchOrder, true);
    assert.equal(flags.fetchOrders, true);
    assert.equal(flags.fetchOpenOrders, true);
    assert.equal(flags.cancelAllOrders, true);

    // Account
    assert.equal(flags.fetchBalance, true);
    assert.equal(flags.fetchMyTrades, true);

    // API flags
    assert.equal(flags.publicAPI, true);
    assert.equal(flags.privateAPI, true);
});

test('Real-world: Simple exchange with limited features', () => {
    const doc: EDLDocument = {
        exchange: {
            id: 'simple',
            name: 'Simple Exchange',
            countries: ['US'],
            rateLimit: 1000,
        },
        parsers: {
            ticker: { mapping: {} },
            orderBook: { mapping: {} },
        },
        api: {
            public: {
                get: {
                    ticker: {},
                    orderBook: {},
                },
            },
        },
    } as any;

    const flags = deriveHasFlags(doc);

    // Should have basic features
    assert.equal(flags.fetchTicker, true);
    assert.equal(flags.fetchOrderBook, true);
    assert.equal(flags.publicAPI, true);
    assert.equal(flags.privateAPI, false);

    // Should not have advanced features
    assert.equal(flags.createOrder, undefined);
    assert.equal(flags.withdraw, undefined);
});
