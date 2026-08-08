/**
 * Has Flags Example
 * Demonstrates automatic derivation of capability flags from EDL definitions
 */

import { deriveHasFlags, categorizeCapabilities } from '../dist/helpers/has-flags.js';

// Example 1: Simple exchange with parsers
const simpleExchange = {
    exchange: {
        id: 'simple',
        name: 'Simple Exchange',
        countries: ['US'],
        rateLimit: 1000,
    },
    parsers: {
        ticker: { mapping: {} },
        orderBook: { mapping: {} },
        trade: { mapping: {} },
    },
};

console.log('=== Simple Exchange ===');
const simpleFlags = deriveHasFlags(simpleExchange);
console.log('Derived Flags:', simpleFlags);
console.log('Categories:', categorizeCapabilities(simpleFlags));
console.log('');

// Example 2: Exchange with API endpoints
const apiExchange = {
    exchange: {
        id: 'api-example',
        name: 'API Example Exchange',
        countries: ['UK'],
        rateLimit: 500,
    },
    api: {
        public: {
            get: {
                ticker: {},
                depth: {},
                trades: {},
                klines: {},
            },
        },
        private: {
            get: {
                balance: {},
                openOrders: {},
            },
            post: {
                order: {},
            },
            delete: {
                order: {},
            },
        },
    },
};

console.log('=== API Exchange ===');
const apiFlags = deriveHasFlags(apiExchange);
console.log('Derived Flags:', apiFlags);
console.log('Categories:', categorizeCapabilities(apiFlags));
console.log('');

// Example 3: Exchange with explicit has flags
const explicitExchange = {
    exchange: {
        id: 'explicit',
        name: 'Explicit Exchange',
        countries: ['JP'],
        rateLimit: 100,
        has: {
            spot: true,
            margin: true,
            swap: true,
            future: false,
            fetchTicker: false,  // Override
            createOrder: true,
            withdraw: true,
            fetchFundingRate: {
                spot: false,
                swap: true,
                future: false,
            },
        },
    },
    parsers: {
        ticker: { mapping: {} },  // Will be overridden by explicit has
    },
};

console.log('=== Explicit Exchange ===');
const explicitFlags = deriveHasFlags(explicitExchange);
console.log('Derived Flags:', explicitFlags);
console.log('Categories:', categorizeCapabilities(explicitFlags));
console.log('');

// Example 4: Comprehensive exchange
const comprehensiveExchange = {
    exchange: {
        id: 'comprehensive',
        name: 'Comprehensive Exchange',
        countries: ['US', 'UK', 'JP'],
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
        trade: { source: 'myTrades', mapping: {} },
        order: { mapping: {} },
        balance: { mapping: {} },
        market: { mapping: {} },
    },
    api: {
        public: {
            get: {
                ping: {},
                time: {},
                exchangeInfo: {},
                ticker: {},
                depth: {},
                trades: {},
                klines: {},
                fundingRate: {},
            },
        },
        private: {
            get: {
                account: {},
                balance: {},
                myTrades: {},
                openOrders: {},
                allOrders: {},
                deposits: {},
                withdrawals: {},
            },
            post: {
                order: {},
                withdraw: {},
                transfer: {},
            },
            put: {
                order: {},
                leverage: {},
            },
            delete: {
                order: {},
                openOrders: {},
            },
        },
    },
};

console.log('=== Comprehensive Exchange ===');
const comprehensiveFlags = deriveHasFlags(comprehensiveExchange);
console.log('Derived Flags:');
const categories = categorizeCapabilities(comprehensiveFlags);
for (const [category, flags] of Object.entries(categories)) {
    console.log(`  ${category}:`, flags);
}
console.log('');

// Example 5: Count capabilities
console.log('=== Capability Counts ===');
console.log('Simple Exchange:', Object.keys(simpleFlags).filter(k => simpleFlags[k] === true).length, 'capabilities');
console.log('API Exchange:', Object.keys(apiFlags).filter(k => apiFlags[k] === true).length, 'capabilities');
console.log('Explicit Exchange:', Object.keys(explicitFlags).filter(k => explicitFlags[k] === true || explicitFlags[k] === 'emulated' || typeof explicitFlags[k] === 'object').length, 'capabilities');
console.log('Comprehensive Exchange:', Object.keys(comprehensiveFlags).filter(k => comprehensiveFlags[k] === true).length, 'capabilities');
