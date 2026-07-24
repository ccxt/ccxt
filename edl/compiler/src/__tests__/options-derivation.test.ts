/**
 * Tests for options derivation logic
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
    deriveStrike,
    deriveExpiry,
    deriveOptionType,
    deriveQuantoMultiplier,
    deriveQuantoCurrency,
    deriveQuantoSettle,
    deriveFullOptionDetails,
    type OptionStrikeDerivation,
    type ExpiryDerivation,
    type OptionTypeDerivation,
    type QuantoLegDerivation,
    type OptionDerivationRules,
} from '../derivation/options.js';

describe('Options Derivation', () => {
    describe('deriveStrike', () => {
        it('should derive strike from path', () => {
            const marketData = {
                strikePrice: 50000,
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'strikePrice',
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, 50000);
        });

        it('should derive strike from nested path', () => {
            const marketData = {
                option: {
                    details: {
                        strike: 55000,
                    },
                },
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'option.details.strike',
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, 55000);
        });

        it('should apply multiplier to strike', () => {
            const marketData = {
                strikePrice: 500,
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'strikePrice',
                strikeMultiplier: 100,
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, 50000);
        });

        it('should apply precision to strike', () => {
            const marketData = {
                strikePrice: 50000.123456,
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'strikePrice',
                strikePrecision: 2,
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, 50000.12);
        });

        it('should apply both multiplier and precision', () => {
            const marketData = {
                strikePrice: 500.123456,
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'strikePrice',
                strikeMultiplier: 100,
                strikePrecision: 2,
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, 50012.35);
        });

        it('should return undefined if strike not found', () => {
            const marketData = {
                someOtherField: 123,
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'strikePrice',
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, undefined);
        });

        it('should handle string strike values', () => {
            const marketData = {
                strikePrice: '50000',
            };

            const rules: OptionStrikeDerivation = {
                strikePath: 'strikePrice',
            };

            const result = deriveStrike(marketData, rules);
            assert.strictEqual(result, 50000);
        });
    });

    describe('deriveExpiry', () => {
        it('should parse timestamp in seconds', () => {
            const marketData = {
                expiry: 1735689599, // Dec 31, 2024 23:59:59 UTC
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiry',
                expiryFormat: 'timestamp',
            };

            const result = deriveExpiry(marketData, rules);
            assert.strictEqual(result.expiry, 1735689599000);
            assert.ok(result.expiryDatetime?.startsWith('2024-12-31'));
        });

        it('should parse timestamp in milliseconds', () => {
            const marketData = {
                expiry: 1735689599000, // Dec 31, 2024 23:59:59 UTC
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiry',
                expiryFormat: 'timestamp',
            };

            const result = deriveExpiry(marketData, rules);
            assert.strictEqual(result.expiry, 1735689599000);
            assert.ok(result.expiryDatetime?.startsWith('2024-12-31'));
        });

        it('should parse ISO format', () => {
            const marketData = {
                expiryDate: '2024-12-31T23:59:59Z',
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiryDate',
                expiryFormat: 'iso',
            };

            const result = deriveExpiry(marketData, rules);
            assert.strictEqual(result.expiryDatetime, '2024-12-31T23:59:59.000Z');
            assert.ok(result.expiry);
        });

        it('should parse YYMMDD format', () => {
            const marketData = {
                expiryDate: '241231',
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiryDate',
                expiryFormat: 'yymmdd',
            };

            const result = deriveExpiry(marketData, rules);
            assert.ok(result.expiry);
            assert.ok(result.expiryDatetime?.startsWith('2024-12-31'));
        });

        it('should parse custom format YYYYMMDD', () => {
            const marketData = {
                expiryDate: '20241231',
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiryDate',
                expiryFormat: 'custom',
                expiryPattern: 'YYYYMMDD',
            };

            const result = deriveExpiry(marketData, rules);
            assert.ok(result.expiry);
            assert.ok(result.expiryDatetime?.startsWith('2024-12-31'));
        });

        it('should parse custom format with time', () => {
            const marketData = {
                expiryDate: '2024-12-31 23:59:59',
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiryDate',
                expiryFormat: 'custom',
                expiryPattern: 'YYYY-MM-DD HH:mm:ss',
            };

            const result = deriveExpiry(marketData, rules);
            assert.ok(result.expiry);
            assert.strictEqual(result.expiryDatetime, '2024-12-31T23:59:59.000Z');
        });

        it('should return empty object if expiry not found', () => {
            const marketData = {
                someOtherField: 123,
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiry',
                expiryFormat: 'timestamp',
            };

            const result = deriveExpiry(marketData, rules);
            assert.strictEqual(result.expiry, undefined);
            assert.strictEqual(result.expiryDatetime, undefined);
        });

        it('should default to timestamp format', () => {
            const marketData = {
                expiry: 1735689599,
            };

            const rules: ExpiryDerivation = {
                expiryPath: 'expiry',
            };

            const result = deriveExpiry(marketData, rules);
            assert.strictEqual(result.expiry, 1735689599000);
        });
    });

    describe('deriveOptionType', () => {
        it('should identify call option with default values', () => {
            const marketData = {
                type: 'call',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'call');
        });

        it('should identify put option with default values', () => {
            const marketData = {
                type: 'put',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'put');
        });

        it('should identify call with single character', () => {
            const marketData = {
                optType: 'C',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'optType',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'call');
        });

        it('should identify put with single character', () => {
            const marketData = {
                optType: 'P',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'optType',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'put');
        });

        it('should use custom call values', () => {
            const marketData = {
                type: '1',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
                callValue: ['1', 'CALL'],
                putValue: ['0', 'PUT'],
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'call');
        });

        it('should use custom put values', () => {
            const marketData = {
                type: '0',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
                callValue: ['1', 'CALL'],
                putValue: ['0', 'PUT'],
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'put');
        });

        it('should handle array of custom values', () => {
            const marketData = {
                type: 'BUY',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
                callValue: ['1', 'CALL', 'BUY'],
                putValue: ['0', 'PUT', 'SELL'],
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'call');
        });

        it('should be case insensitive', () => {
            const marketData = {
                type: 'CALL',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, 'call');
        });

        it('should return undefined if type not found', () => {
            const marketData = {
                someOtherField: 'value',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined for unknown type value', () => {
            const marketData = {
                type: 'unknown',
            };

            const rules: OptionTypeDerivation = {
                typePath: 'type',
            };

            const result = deriveOptionType(marketData, rules);
            assert.strictEqual(result, undefined);
        });
    });

    describe('deriveQuantoMultiplier', () => {
        it('should derive quanto multiplier from path', () => {
            const marketData = {
                quantoMultiplier: 0.001,
            };

            const rules: QuantoLegDerivation = {
                quantoMultiplierPath: 'quantoMultiplier',
            };

            const result = deriveQuantoMultiplier(marketData, rules);
            assert.strictEqual(result, 0.001);
        });

        it('should derive quanto multiplier from nested path', () => {
            const marketData = {
                quanto: {
                    multiplier: 0.0001,
                },
            };

            const rules: QuantoLegDerivation = {
                quantoMultiplierPath: 'quanto.multiplier',
            };

            const result = deriveQuantoMultiplier(marketData, rules);
            assert.strictEqual(result, 0.0001);
        });

        it('should return undefined if multiplier not found', () => {
            const marketData = {
                someOtherField: 123,
            };

            const rules: QuantoLegDerivation = {
                quantoMultiplierPath: 'quantoMultiplier',
            };

            const result = deriveQuantoMultiplier(marketData, rules);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined if rules not provided', () => {
            const marketData = {
                quantoMultiplier: 0.001,
            };

            const result = deriveQuantoMultiplier(marketData, undefined);
            assert.strictEqual(result, undefined);
        });

        it('should handle string multiplier values', () => {
            const marketData = {
                quantoMultiplier: '0.001',
            };

            const rules: QuantoLegDerivation = {
                quantoMultiplierPath: 'quantoMultiplier',
            };

            const result = deriveQuantoMultiplier(marketData, rules);
            assert.strictEqual(result, 0.001);
        });
    });

    describe('deriveQuantoCurrency', () => {
        it('should derive quanto currency from path', () => {
            const marketData = {
                quantoCurrency: 'usd',
            };

            const rules: QuantoLegDerivation = {
                quantoCurrencyPath: 'quantoCurrency',
            };

            const result = deriveQuantoCurrency(marketData, rules);
            assert.strictEqual(result, 'USD');
        });

        it('should uppercase currency code', () => {
            const marketData = {
                currency: 'btc',
            };

            const rules: QuantoLegDerivation = {
                quantoCurrencyPath: 'currency',
            };

            const result = deriveQuantoCurrency(marketData, rules);
            assert.strictEqual(result, 'BTC');
        });

        it('should return undefined if currency not found', () => {
            const marketData = {
                someOtherField: 'value',
            };

            const rules: QuantoLegDerivation = {
                quantoCurrencyPath: 'quantoCurrency',
            };

            const result = deriveQuantoCurrency(marketData, rules);
            assert.strictEqual(result, undefined);
        });
    });

    describe('deriveQuantoSettle', () => {
        it('should derive quanto settle currency from path', () => {
            const marketData = {
                settleCurrency: 'usdt',
            };

            const rules: QuantoLegDerivation = {
                quantoSettlePath: 'settleCurrency',
            };

            const result = deriveQuantoSettle(marketData, rules);
            assert.strictEqual(result, 'USDT');
        });

        it('should uppercase settle currency code', () => {
            const marketData = {
                settle: 'eth',
            };

            const rules: QuantoLegDerivation = {
                quantoSettlePath: 'settle',
            };

            const result = deriveQuantoSettle(marketData, rules);
            assert.strictEqual(result, 'ETH');
        });

        it('should return undefined if settle not found', () => {
            const marketData = {
                someOtherField: 'value',
            };

            const rules: QuantoLegDerivation = {
                quantoSettlePath: 'settleCurrency',
            };

            const result = deriveQuantoSettle(marketData, rules);
            assert.strictEqual(result, undefined);
        });
    });

    describe('deriveFullOptionDetails', () => {
        it('should derive complete option details', () => {
            const marketData = {
                strikePrice: 50000,
                expiryTimestamp: 1735689599,
                optionType: 'call',
            };

            const rules: OptionDerivationRules = {
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

            const result = deriveFullOptionDetails(marketData, rules);
            assert.strictEqual(result.strike, 50000);
            assert.strictEqual(result.expiry, 1735689599000);
            assert.ok(result.expiryDatetime?.startsWith('2024-12-31'));
            assert.strictEqual(result.optionType, 'call');
        });

        it('should derive option with quanto properties', () => {
            const marketData = {
                strikePrice: 60000,
                expiryDate: '241231',
                type: 'P',
                quantoMultiplier: 0.001,
                quantoCurrency: 'USD',
                settleCurrency: 'USDT',
            };

            const rules: OptionDerivationRules = {
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

            const result = deriveFullOptionDetails(marketData, rules);
            assert.strictEqual(result.strike, 60000);
            assert.ok(result.expiry);
            assert.strictEqual(result.optionType, 'put');
            assert.strictEqual(result.quantoMultiplier, 0.001);
            assert.strictEqual(result.quantoCurrency, 'USD');
            assert.strictEqual(result.quantoSettle, 'USDT');
        });

        it('should handle missing optional fields', () => {
            const marketData = {
                strikePrice: 55000,
            };

            const rules: OptionDerivationRules = {
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

            const result = deriveFullOptionDetails(marketData, rules);
            assert.strictEqual(result.strike, 55000);
            assert.strictEqual(result.expiry, undefined);
            assert.strictEqual(result.expiryDatetime, undefined);
            assert.strictEqual(result.optionType, undefined);
        });

        it('should apply strike multiplier and precision', () => {
            const marketData = {
                strike: 500.123456,
                expiry: '2024-12-31T23:59:59Z',
                type: 'call',
            };

            const rules: OptionDerivationRules = {
                strike: {
                    strikePath: 'strike',
                    strikeMultiplier: 100,
                    strikePrecision: 2,
                },
                expiry: {
                    expiryPath: 'expiry',
                    expiryFormat: 'iso',
                },
                optionType: {
                    typePath: 'type',
                },
            };

            const result = deriveFullOptionDetails(marketData, rules);
            assert.strictEqual(result.strike, 50012.35);
            assert.strictEqual(result.optionType, 'call');
        });

        it('should work without quanto rules', () => {
            const marketData = {
                strikePrice: 45000,
                expiry: 1735689599,
                type: 'put',
            };

            const rules: OptionDerivationRules = {
                strike: {
                    strikePath: 'strikePrice',
                },
                expiry: {
                    expiryPath: 'expiry',
                    expiryFormat: 'timestamp',
                },
                optionType: {
                    typePath: 'type',
                },
            };

            const result = deriveFullOptionDetails(marketData, rules);
            assert.strictEqual(result.strike, 45000);
            assert.strictEqual(result.expiry, 1735689599000);
            assert.strictEqual(result.optionType, 'put');
            assert.strictEqual(result.quantoMultiplier, undefined);
            assert.strictEqual(result.quantoCurrency, undefined);
            assert.strictEqual(result.quantoSettle, undefined);
        });
    });
});
