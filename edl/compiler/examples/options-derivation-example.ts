/**
 * Example: Using Options Derivation
 * Demonstrates how to derive option strikes, expiry, type, and quanto properties
 */

import {
    deriveStrike,
    deriveExpiry,
    deriveOptionType,
    deriveFullOptionDetails,
    type OptionDerivationRules,
    type OptionStrikeDerivation,
    type ExpiryDerivation,
    type OptionTypeDerivation,
    type QuantoLegDerivation,
} from '../src/derivation/options.js';

// ============================================================
// Example 1: Deriving Strike Price
// ============================================================

console.log('=== Example 1: Strike Price Derivation ===');

const marketData1 = {
    strikePrice: 50000,
};

const strikeRules1: OptionStrikeDerivation = {
    strikePath: 'strikePrice',
};

const strike1 = deriveStrike(marketData1, strikeRules1);
console.log('Strike (simple path):', strike1); // Output: 50000

// Example with multiplier and precision
const marketData2 = {
    strike: 500.123456,
};

const strikeRules2: OptionStrikeDerivation = {
    strikePath: 'strike',
    strikeMultiplier: 100,
    strikePrecision: 2,
};

const strike2 = deriveStrike(marketData2, strikeRules2);
console.log('Strike (with multiplier and precision):', strike2); // Output: 50012.35

// ============================================================
// Example 2: Deriving Expiry
// ============================================================

console.log('\n=== Example 2: Expiry Derivation ===');

// Timestamp format
const marketData3 = {
    expiry: 1735689599,
};

const expiryRules1: ExpiryDerivation = {
    expiryPath: 'expiry',
    expiryFormat: 'timestamp',
};

const expiry1 = deriveExpiry(marketData3, expiryRules1);
console.log('Expiry (timestamp):', expiry1);

// ISO format
const marketData4 = {
    expiryDate: '2024-12-31T23:59:59Z',
};

const expiryRules2: ExpiryDerivation = {
    expiryPath: 'expiryDate',
    expiryFormat: 'iso',
};

const expiry2 = deriveExpiry(marketData4, expiryRules2);
console.log('Expiry (ISO):', expiry2);

// YYMMDD format
const marketData5 = {
    expiryDate: '241231',
};

const expiryRules3: ExpiryDerivation = {
    expiryPath: 'expiryDate',
    expiryFormat: 'yymmdd',
};

const expiry3 = deriveExpiry(marketData5, expiryRules3);
console.log('Expiry (YYMMDD):', expiry3);

// Custom format
const marketData6 = {
    expiryDate: '20241231',
};

const expiryRules4: ExpiryDerivation = {
    expiryPath: 'expiryDate',
    expiryFormat: 'custom',
    expiryPattern: 'YYYYMMDD',
};

const expiry4 = deriveExpiry(marketData6, expiryRules4);
console.log('Expiry (custom YYYYMMDD):', expiry4);

// ============================================================
// Example 3: Deriving Option Type
// ============================================================

console.log('\n=== Example 3: Option Type Derivation ===');

// Default values (call/put, c/p)
const marketData7 = {
    type: 'call',
};

const typeRules1: OptionTypeDerivation = {
    typePath: 'type',
};

const optionType1 = deriveOptionType(marketData7, typeRules1);
console.log('Option Type (default):', optionType1); // Output: call

// Single character
const marketData8 = {
    optType: 'P',
};

const typeRules2: OptionTypeDerivation = {
    typePath: 'optType',
};

const optionType2 = deriveOptionType(marketData8, typeRules2);
console.log('Option Type (single char):', optionType2); // Output: put

// Custom values
const marketData9 = {
    type: '1',
};

const typeRules3: OptionTypeDerivation = {
    typePath: 'type',
    callValue: ['1', 'CALL', 'BUY'],
    putValue: ['0', 'PUT', 'SELL'],
};

const optionType3 = deriveOptionType(marketData9, typeRules3);
console.log('Option Type (custom values):', optionType3); // Output: call

// ============================================================
// Example 4: Complete Option Derivation
// ============================================================

console.log('\n=== Example 4: Complete Option Derivation ===');

const marketData10 = {
    strikePrice: 50000,
    expiryTimestamp: 1735689599,
    optionType: 'call',
};

const optionRules1: OptionDerivationRules = {
    strike: {
        strikePath: 'strikePrice',
    },
    expiry: {
        expiryPath: 'expiryTimestamp',
        expiryFormat: 'timestamp',
    },
    optionType: {
        typePath: 'optionType',
    },
};

const optionDetails1 = deriveFullOptionDetails(marketData10, optionRules1);
console.log('Complete Option Details:', optionDetails1);

// ============================================================
// Example 5: Option with Quanto Properties
// ============================================================

console.log('\n=== Example 5: Option with Quanto ===');

const marketData11 = {
    strikePrice: 60000,
    expiryDate: '241231',
    type: 'P',
    quantoMultiplier: 0.001,
    quantoCurrency: 'USD',
    settleCurrency: 'USDT',
};

const optionRules2: OptionDerivationRules = {
    strike: {
        strikePath: 'strikePrice',
        strikePrecision: 2,
    },
    expiry: {
        expiryPath: 'expiryDate',
        expiryFormat: 'yymmdd',
    },
    optionType: {
        typePath: 'type',
    },
    quanto: {
        quantoMultiplierPath: 'quantoMultiplier',
        quantoCurrencyPath: 'quantoCurrency',
        quantoSettlePath: 'settleCurrency',
    },
};

const optionDetails2 = deriveFullOptionDetails(marketData11, optionRules2);
console.log('Option with Quanto Details:', optionDetails2);

// ============================================================
// Example 6: Real-World Exchange Data
// ============================================================

console.log('\n=== Example 6: Real-World Exchange Data ===');

// Example: Deribit-style option data
const deribitOption = {
    instrument_name: 'BTC-31DEC24-50000-C',
    kind: 'option',
    option_type: 'call',
    strike: 50000,
    expiration_timestamp: 1735689599000,
    settlement_currency: 'BTC',
};

const deribitRules: OptionDerivationRules = {
    strike: {
        strikePath: 'strike',
    },
    expiry: {
        expiryPath: 'expiration_timestamp',
        expiryFormat: 'timestamp',
    },
    optionType: {
        typePath: 'option_type',
    },
};

const deribitDetails = deriveFullOptionDetails(deribitOption, deribitRules);
console.log('Deribit Option:', deribitDetails);

// Example: Binance-style option data
const binanceOption = {
    symbol: 'BTC-241231-50000-C',
    strikePrice: '50000',
    expiryDate: 1735689599000,
    side: 'CALL',
};

const binanceRules: OptionDerivationRules = {
    strike: {
        strikePath: 'strikePrice',
    },
    expiry: {
        expiryPath: 'expiryDate',
        expiryFormat: 'timestamp',
    },
    optionType: {
        typePath: 'side',
        callValue: ['CALL', 'C'],
        putValue: ['PUT', 'P'],
    },
};

const binanceDetails = deriveFullOptionDetails(binanceOption, binanceRules);
console.log('Binance Option:', binanceDetails);
