/**
 * Example: Wallet Transfer Method Generation
 *
 * This example demonstrates how to use the wallet method generator
 * to create transfer methods from EDL schemas.
 */

import { emitTransferMethod } from '../src/generator/wallet-methods.js';
import { emit } from '../src/generator/emitter.js';
import type { WalletEndpointSchema } from '../src/schemas/wallet-operations.js';

// Example 1: Binance-style transfer endpoint
const binanceTransferSchema: WalletEndpointSchema = {
    operation: 'transfer',
    endpoint: '/sapi/v1/asset/transfer',
    method: 'POST',
    params: {
        type: {
            type: 'string',
            required: true,
            enum: ['MAIN_C2C', 'MAIN_UMFUTURE', 'MAIN_CMFUTURE', 'MAIN_MARGIN', 'MAIN_MINING'],
            description: 'Transfer type',
        },
        asset: { type: 'string', required: true },
        amount: { type: 'number', required: true, min: 0 },
    },
    response: {
        mapping: {
            id: { path: 'tranId', transform: 'safeString' },
            currency: { path: 'asset', transform: 'uppercase' },
            amount: { path: 'amount', transform: 'safeNumber' },
            fromAccount: { literal: 'spot' },
            toAccount: { literal: 'futures' },
            status: { literal: 'ok' },
            timestamp: { compute: 'Date.now()' },
        },
    },
    requiresAuth: true,
    cost: 1,
};

// Example 2: Kraken-style transfer endpoint
const krakenTransferSchema: WalletEndpointSchema = {
    operation: 'transfer',
    endpoint: '/0/private/WalletTransfer',
    method: 'POST',
    params: {
        asset: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
        amount: { type: 'string', required: true },
    },
    response: {
        path: 'result',
        mapping: {
            id: { path: 'refid', transform: 'safeString' },
            currency: { path: 'asset' },
            amount: { path: 'amount', transform: 'safeNumber' },
            fromAccount: { path: 'from', transform: 'lowercase' },
            toAccount: { path: 'to', transform: 'lowercase' },
            status: { path: 'status', default: 'ok' },
            timestamp: { path: 'time', transform: 'safeTimestamp' },
        },
    },
    requiresAuth: true,
    cost: 2,
};

// Generate transfer method with all features enabled
console.log('=== Example 1: Binance Transfer Method ===\n');
const binanceResult = emitTransferMethod(binanceTransferSchema, {
    methodName: 'transfer',
    includeBalanceCheck: true,
    recordTransaction: true,
});

console.log('Required imports:', binanceResult.imports.join(', '));
console.log('\nGenerated method structure:');
console.log('- Method name:', binanceResult.method.name);
console.log('- Is async:', binanceResult.method.isAsync);
console.log('- Visibility:', binanceResult.method.visibility);
console.log('- Parameters:', binanceResult.method.params.map(p => p.name).join(', '));
console.log('- Body statements:', binanceResult.method.body.length);

// Generate transfer method with minimal features
console.log('\n=== Example 2: Kraken Transfer Method (minimal) ===\n');
const krakenResult = emitTransferMethod(krakenTransferSchema, {
    methodName: 'executeTransfer',
    includeBalanceCheck: false,
    recordTransaction: false,
});

console.log('Method name:', krakenResult.method.name);
console.log('Parameters:', krakenResult.method.params.map(p => p.name).join(', '));
console.log('Body statements:', krakenResult.method.body.length);

// Example 3: Generate and emit as TypeScript code
console.log('\n=== Example 3: Full TypeScript Code Generation ===\n');

const codeResult = emitTransferMethod(binanceTransferSchema, {
    methodName: 'transferBetweenAccounts',
    includeBalanceCheck: true,
    recordTransaction: true,
});

// Create a complete TypeScript file with the method
const tsFile = {
    imports: [
        {
            names: codeResult.imports,
            from: '../schemas/wallet-operations.js',
            isType: true,
        },
    ],
    statements: [codeResult.method],
};

// Emit the code (this would generate actual TypeScript)
// const generatedCode = emit(tsFile);
// console.log(generatedCode);

console.log('✓ Generated transfer method with:', codeResult.method.body.length, 'statements');

// Example 4: Validation
console.log('\n=== Example 4: Schema Validation ===\n');

import { validateTransferConfig } from '../src/generator/wallet-methods.js';

const validationResult = validateTransferConfig(binanceTransferSchema, {
    includeBalanceCheck: true,
    recordTransaction: true,
});

console.log('Validation result:', validationResult.valid ? '✓ Valid' : '✗ Invalid');
if (!validationResult.valid) {
    console.log('Errors:', validationResult.errors);
}

// Example 5: Invalid schema
const invalidSchema: any = {
    operation: 'withdraw', // Wrong operation type
    endpoint: '',
    method: 'INVALID',
    params: {},
};

const invalidResult = validateTransferConfig(invalidSchema, {});
console.log('\nInvalid schema validation:');
console.log('- Valid:', invalidResult.valid);
console.log('- Errors:', invalidResult.errors);

console.log('\n=== Summary ===');
console.log('✓ Generated transfer methods for multiple exchange formats');
console.log('✓ Supported features: balance checking, transaction recording, validation');
console.log('✓ Flexible configuration for different exchange requirements');
