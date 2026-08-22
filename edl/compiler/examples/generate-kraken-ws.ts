/**
 * Example: Generate Kraken WebSocket Client
 *
 * This script demonstrates how to use the Kraken WebSocket generator
 * to create a complete TypeScript WebSocket client.
 */

import {
    generateKrakenWsClient,
    generateSubscribePayload,
    generateUnsubscribePayload,
    generateMessageHandler,
    DEFAULT_KRAKEN_CONFIG,
    type KrakenWebSocketConfig
} from '../src/generator/kraken-ws.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('Kraken WebSocket Client Generator Demo\n');
console.log('=' .repeat(50));

// Example 1: Generate complete client with default config
console.log('\n1. Generating complete Kraken WebSocket client...');
const clientCode = generateKrakenWsClient();
console.log(`   ✓ Generated ${clientCode.split('\n').length} lines of code`);

// Save to file
const outputPath = join(process.cwd(), 'examples', 'output', 'KrakenWs.ts');
// writeFileSync(outputPath, clientCode);
// console.log(`   ✓ Saved to: ${outputPath}`);

// Example 2: Generate subscription payload
console.log('\n2. Generating subscription payloads...');

const tickerSub = generateSubscribePayload('ticker', 'XBT/USD', { reqId: 1 });
console.log('   Ticker subscription:', JSON.stringify(tickerSub, null, 2));

const bookSub = generateSubscribePayload('book', 'ETH/USD', { reqId: 2, depth: 10 });
console.log('\n   OrderBook subscription (depth=10):', JSON.stringify(bookSub, null, 2));

// Example 3: Generate unsubscribe payload
console.log('\n3. Generating unsubscription payload...');
const tickerUnsub = generateUnsubscribePayload('ticker', 'XBT/USD', { reqId: 3 });
console.log('   Ticker unsubscribe:', JSON.stringify(tickerUnsub, null, 2));

// Example 4: Generate message handlers
console.log('\n4. Generating message handlers...');
const channels = ['ticker', 'trade', 'book', 'openOrders'];

for (const channel of channels) {
    const handler = generateMessageHandler(channel);
    const lines = handler.split('\n').length;
    console.log(`   ✓ ${channel}: ${lines} lines`);
}

// Example 5: Custom configuration
console.log('\n5. Generating client with custom configuration...');
const customConfig: KrakenWebSocketConfig = {
    exchangeId: 'krakenFutures',
    publicEndpoint: 'wss://futures.kraken.com',
    privateEndpoint: 'wss://futures-auth.kraken.com',
    channels: {
        ticker: 'ticker_lite',
        trade: 'trade',
        book: 'book_snapshot',
        ohlc: 'ohlc',
        spread: 'spread',
        openOrders: 'open_orders',
    },
};

const customCode = generateKrakenWsClient(customConfig);
console.log(`   ✓ Generated custom client: ${customCode.split('\n').length} lines`);

// Example 6: Show configuration details
console.log('\n6. Default Kraken Configuration:');
console.log('   Exchange ID:', DEFAULT_KRAKEN_CONFIG.exchangeId);
console.log('   Public Endpoint:', DEFAULT_KRAKEN_CONFIG.publicEndpoint);
console.log('   Private Endpoint:', DEFAULT_KRAKEN_CONFIG.privateEndpoint);
console.log('   Channels:', Object.keys(DEFAULT_KRAKEN_CONFIG.channels).join(', '));

console.log('\n' + '='.repeat(50));
console.log('Demo completed successfully!\n');
console.log('To use the generator in your code:');
console.log('```typescript');
console.log('import { generateKrakenWsClient } from "./generator/kraken-ws.js";');
console.log('const code = generateKrakenWsClient();');
console.log('// Use the generated code...');
console.log('```\n');
