/**
 * Array DSL Demo
 *
 * Demonstrates the array iteration DSL capabilities for the EDL compiler.
 */

import { executeArrayDSL, parseArrayDSL, validateArrayDSL } from '../dist/dsl/array-dsl.js';

console.log('='.repeat(60));
console.log('Array DSL Demo - Exchange Data Processing');
console.log('='.repeat(60));

// Example 1: Processing exchange ticker data
console.log('\n📊 Example 1: Process Exchange Tickers\n');

const tickerData = {
  tickers: [
    { symbol: 'BTC/USDT', bid: 42150.50, ask: 42151.00, volume: 125.5 },
    { symbol: 'ETH/USDT', bid: 2245.75, ask: 2246.00, volume: 850.2 },
    { symbol: 'BNB/USDT', bid: 315.20, ask: 315.30, volume: 1200.0 },
    { symbol: 'SOL/USDT', bid: 98.45, ask: 98.50, volume: 450.8 }
  ]
};

// Get high-volume pairs only
console.log('DSL: "tickers | filter(t => t.volume > 500)"');
const highVolume = executeArrayDSL(
  'tickers | filter(t => t.volume > 500)',
  tickerData
);
console.log('High Volume Pairs:', highVolume.map(t => t.symbol));

// Calculate spreads and filter
console.log('\nDSL: "tickers | map(t => t.ask - t.bid) | filter(s => s > 0.3)"');
const largeSpreads = executeArrayDSL(
  'tickers | map(t => t.ask - t.bid) | filter(s => s > 0.3)',
  tickerData
);
console.log('Large Spreads:', largeSpreads);

// Example 2: Processing order book data
console.log('\n\n📖 Example 2: Process Order Book\n');

const orderBookData = {
  bids: [
    { price: 42150.50, volume: 1.5 },
    { price: 42150.00, volume: 2.3 },
    { price: 42149.50, volume: 0.8 },
    { price: 42149.00, volume: 1.2 },
    { price: 42148.50, volume: 3.1 }
  ],
  asks: [
    { price: 42151.00, volume: 1.2 },
    { price: 42151.50, volume: 2.1 },
    { price: 42152.00, volume: 0.9 },
    { price: 42152.50, volume: 1.8 },
    { price: 42153.00, volume: 2.5 }
  ]
};

// Get top 3 bids and calculate total volume
console.log('DSL: "bids | slice(0, 3) | map(b => b.volume) | reduce((sum, vol) => sum + vol, 0)"');
const topBidVolume = executeArrayDSL(
  'bids | slice(0, 3) | map(b => b.volume) | reduce((sum, vol) => sum + vol, 0)',
  orderBookData
);
console.log('Top 3 Bid Volume:', topBidVolume.toFixed(2));

// Example 3: Processing trade history
console.log('\n\n💹 Example 3: Process Trade History\n');

const tradeData = {
  trades: [
    { id: 1, side: 'buy', price: 42150, amount: 0.5, fee: 21.075 },
    { id: 2, side: 'sell', price: 42160, amount: 0.3, fee: 12.648 },
    { id: 3, side: 'buy', price: 42155, amount: 1.2, fee: 50.586 },
    { id: 4, side: 'buy', price: 42145, amount: 0.8, fee: 33.716 },
    { id: 5, side: 'sell', price: 42170, amount: 0.6, fee: 25.302 }
  ]
};

// Calculate total buy volume (filtering buy trades)
console.log('DSL: "trades | map(t => t.amount) | reduce((sum, a) => sum + a, 0)"');
const totalVolume = executeArrayDSL(
  'trades | map(t => t.amount) | reduce((sum, a) => sum + a, 0)',
  tradeData
);
console.log('Total Trade Volume:', totalVolume.toFixed(2), 'BTC');

// Calculate total fees paid
console.log('\nDSL: "trades | map(t => t.fee) | reduce((sum, f) => sum + f, 0)"');
const totalFees = executeArrayDSL(
  'trades | map(t => t.fee) | reduce((sum, f) => sum + f, 0)',
  tradeData
);
console.log('Total Fees Paid:', totalFees.toFixed(2), 'USDT');

// Example 4: Processing multi-level exchange data
console.log('\n\n🏦 Example 4: Process Multi-Exchange Portfolio\n');

const portfolioData = {
  exchanges: [
    {
      name: 'Binance',
      balances: [
        { asset: 'BTC', free: 1.5, locked: 0.2 },
        { asset: 'ETH', free: 10.0, locked: 2.0 },
        { asset: 'USDT', free: 5000, locked: 1000 }
      ]
    },
    {
      name: 'Coinbase',
      balances: [
        { asset: 'BTC', free: 0.8, locked: 0.0 },
        { asset: 'ETH', free: 5.5, locked: 0.5 },
        { asset: 'USDT', free: 3000, locked: 0 }
      ]
    }
  ]
};

// Get all balances from all exchanges
console.log('DSL: "exchanges | flatMap(e => e.balances)"');
const allBalances = executeArrayDSL(
  'exchanges | flatMap(e => e.balances)',
  portfolioData
);
console.log('Total Balance Entries:', allBalances.length);
console.log('Sample:', allBalances.slice(0, 3));

// Get total free + locked across all balances
console.log('\nDSL: "exchanges | flatMap(e => e.balances) | map(b => b.free + b.locked) | reduce((sum, amt) => sum + amt, 0)"');
const totalValue = executeArrayDSL(
  'exchanges | flatMap(e => e.balances) | map(b => b.free + b.locked) | reduce((sum, amt) => sum + amt, 0)',
  portfolioData
);
console.log('Total Value (all assets):', totalValue.toFixed(4));

// Example 5: Validation and Error Handling
console.log('\n\n✅ Example 5: DSL Validation\n');

const validDSL = 'items | map(x => x * 2) | filter(x => x > 10)';
const invalidDSL = 'items | invalidOp(x => x)';

console.log('Valid DSL:', validDSL);
const validResult = validateArrayDSL(validDSL);
console.log('Validation Result:', validResult);

console.log('\nInvalid DSL:', invalidDSL);
const invalidResult = validateArrayDSL(invalidDSL);
console.log('Validation Result:', invalidResult);

// Example 6: Parsing DSL to see structure
console.log('\n\n🔍 Example 6: DSL Structure Analysis\n');

const dsl = 'items | map(x => x * 2) | filter(x => x > 5)';
console.log('DSL:', dsl);

const parsed = parseArrayDSL(dsl);
console.log('\nParsed Structure:');
console.log(JSON.stringify(parsed, null, 2));

console.log('\n' + '='.repeat(60));
console.log('Demo Complete!');
console.log('='.repeat(60));
