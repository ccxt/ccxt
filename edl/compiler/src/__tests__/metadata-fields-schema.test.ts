/**
 * Tests for Metadata Fields Schema
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    STANDARD_METADATA_FIELDS,
    getRequiredMetadataFields,
    getOptionalMetadataFields,
    validateMetadataField,
    validateMetadata,
    getMetadataFieldDefault,
    isMetadataFieldRequired,
    getMetadataFieldType,
    getAllMetadataFieldNames,
    createMetadataDefaults,
    type MetadataFieldsSchema,
    type PrecisionMode,
    type FeeStructure,
} from '../schemas/metadata-fields.js';

describe('Metadata Fields Schema', () => {
    describe('STANDARD_METADATA_FIELDS', () => {
        test('contains all required CCXT metadata fields', () => {
            const requiredFields = ['id', 'name', 'countries', 'rateLimit'];

            for (const fieldName of requiredFields) {
                assert.ok(
                    STANDARD_METADATA_FIELDS[fieldName as keyof MetadataFieldsSchema],
                    `Missing required field: ${fieldName}`
                );
            }
        });

        test('all fields have required properties', () => {
            for (const [fieldName, field] of Object.entries(STANDARD_METADATA_FIELDS)) {
                assert.ok(field.name, `Field ${fieldName} missing name`);
                assert.ok(field.description, `Field ${fieldName} missing description`);
                assert.ok(field.type, `Field ${fieldName} missing type`);
                assert.ok(
                    typeof field.required === 'boolean',
                    `Field ${fieldName} missing required property`
                );
            }
        });

        test('id field has correct properties', () => {
            const idField = STANDARD_METADATA_FIELDS.id;

            assert.equal(idField.name, 'id');
            assert.equal(idField.type, 'string');
            assert.equal(idField.required, true);
            assert.ok(idField.validate);
        });

        test('rateLimit field has correct properties', () => {
            const rateLimitField = STANDARD_METADATA_FIELDS.rateLimit;

            assert.equal(rateLimitField.name, 'rateLimit');
            assert.equal(rateLimitField.type, 'number');
            assert.equal(rateLimitField.required, true);
            assert.equal(rateLimitField.defaultValue, 1000);
            assert.ok(rateLimitField.validate);
        });

        test('optional fields have correct default values', () => {
            assert.equal(STANDARD_METADATA_FIELDS.pro.defaultValue, false);
            assert.equal(STANDARD_METADATA_FIELDS.certified.defaultValue, false);
            assert.equal(STANDARD_METADATA_FIELDS.precisionMode.defaultValue, 'DECIMAL_PLACES');
        });
    });

    describe('getRequiredMetadataFields', () => {
        test('returns all required field names', () => {
            const required = getRequiredMetadataFields();

            assert.ok(required.includes('id'));
            assert.ok(required.includes('name'));
            assert.ok(required.includes('countries'));
            assert.ok(required.includes('rateLimit'));
        });

        test('does not include optional fields', () => {
            const required = getRequiredMetadataFields();

            assert.ok(!required.includes('version'));
            assert.ok(!required.includes('certified'));
            assert.ok(!required.includes('pro'));
        });

        test('returns array of strings', () => {
            const required = getRequiredMetadataFields();

            assert.ok(Array.isArray(required));
            for (const fieldName of required) {
                assert.equal(typeof fieldName, 'string');
            }
        });
    });

    describe('getOptionalMetadataFields', () => {
        test('returns all optional field names', () => {
            const optional = getOptionalMetadataFields();

            assert.ok(optional.includes('version'));
            assert.ok(optional.includes('certified'));
            assert.ok(optional.includes('pro'));
            assert.ok(optional.includes('hostname'));
        });

        test('does not include required fields', () => {
            const optional = getOptionalMetadataFields();

            assert.ok(!optional.includes('id'));
            assert.ok(!optional.includes('name'));
            assert.ok(!optional.includes('rateLimit'));
        });
    });

    describe('validateMetadataField', () => {
        test('validates valid id field', () => {
            const result = validateMetadataField('id', 'binance');

            assert.equal(result.valid, true);
            assert.equal(result.error, undefined);
        });

        test('rejects invalid id with spaces', () => {
            const result = validateMetadataField('id', 'binance test');

            assert.equal(result.valid, false);
            assert.ok(result.error);
        });

        test('rejects invalid id with uppercase', () => {
            const result = validateMetadataField('id', 'Binance');

            assert.equal(result.valid, false);
            assert.ok(result.error);
        });

        test('validates valid rateLimit', () => {
            const result = validateMetadataField('rateLimit', 50);

            assert.equal(result.valid, true);
        });

        test('rejects negative rateLimit', () => {
            const result = validateMetadataField('rateLimit', -10);

            assert.equal(result.valid, false);
            assert.ok(result.error);
        });

        test('rejects zero rateLimit', () => {
            const result = validateMetadataField('rateLimit', 0);

            assert.equal(result.valid, false);
            assert.ok(result.error);
        });

        test('rejects missing required field', () => {
            const result = validateMetadataField('id', undefined);

            assert.equal(result.valid, false);
            assert.ok(result.error);
        });

        test('allows missing optional field', () => {
            const result = validateMetadataField('version', undefined);

            assert.equal(result.valid, true);
        });

        test('rejects unknown field', () => {
            const result = validateMetadataField('unknownField', 'value');

            assert.equal(result.valid, false);
            assert.ok(result.error);
        });
    });

    describe('validateMetadata', () => {
        test('validates complete valid metadata', () => {
            const metadata = {
                id: 'binance',
                name: 'Binance',
                countries: ['JP', 'MT'],
                rateLimit: 50,
                certified: true,
                pro: true,
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('validates minimal valid metadata', () => {
            const metadata = {
                id: 'kraken',
                name: 'Kraken',
                countries: ['US'],
                rateLimit: 1000,
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });

        test('rejects metadata missing required id', () => {
            const metadata = {
                name: 'Binance',
                countries: ['JP'],
                rateLimit: 50,
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, false);
            assert.ok(result.errors.length > 0);
            assert.ok(result.errors.some(err => err.includes('id')));
        });

        test('rejects metadata missing required name', () => {
            const metadata = {
                id: 'binance',
                countries: ['JP'],
                rateLimit: 50,
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(err => err.includes('name')));
        });

        test('rejects metadata with invalid id format', () => {
            const metadata = {
                id: 'Binance Test',
                name: 'Binance',
                countries: ['JP'],
                rateLimit: 50,
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, false);
            assert.ok(result.errors.length > 0);
        });

        test('rejects metadata with invalid rateLimit', () => {
            const metadata = {
                id: 'binance',
                name: 'Binance',
                countries: ['JP'],
                rateLimit: -50,
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, false);
            assert.ok(result.errors.some(err => err.includes('rateLimit')));
        });

        test('allows optional fields to be present', () => {
            const metadata = {
                id: 'binance',
                name: 'Binance',
                countries: ['JP', 'MT'],
                rateLimit: 50,
                version: 'v3',
                certified: true,
                pro: true,
                hostname: 'api.binance.com',
            };

            const result = validateMetadata(metadata);

            assert.equal(result.valid, true);
        });
    });

    describe('getMetadataFieldDefault', () => {
        test('returns default for rateLimit', () => {
            const defaultValue = getMetadataFieldDefault<number>('rateLimit');

            assert.equal(defaultValue, 1000);
        });

        test('returns default for pro', () => {
            const defaultValue = getMetadataFieldDefault<boolean>('pro');

            assert.equal(defaultValue, false);
        });

        test('returns default for certified', () => {
            const defaultValue = getMetadataFieldDefault<boolean>('certified');

            assert.equal(defaultValue, false);
        });

        test('returns default for precisionMode', () => {
            const defaultValue = getMetadataFieldDefault<PrecisionMode>('precisionMode');

            assert.equal(defaultValue, 'DECIMAL_PLACES');
        });

        test('returns undefined for field without default', () => {
            const defaultValue = getMetadataFieldDefault('id');

            assert.equal(defaultValue, undefined);
        });

        test('returns undefined for unknown field', () => {
            const defaultValue = getMetadataFieldDefault('unknownField');

            assert.equal(defaultValue, undefined);
        });
    });

    describe('isMetadataFieldRequired', () => {
        test('returns true for required fields', () => {
            assert.equal(isMetadataFieldRequired('id'), true);
            assert.equal(isMetadataFieldRequired('name'), true);
            assert.equal(isMetadataFieldRequired('countries'), true);
            assert.equal(isMetadataFieldRequired('rateLimit'), true);
        });

        test('returns false for optional fields', () => {
            assert.equal(isMetadataFieldRequired('version'), false);
            assert.equal(isMetadataFieldRequired('certified'), false);
            assert.equal(isMetadataFieldRequired('pro'), false);
            assert.equal(isMetadataFieldRequired('hostname'), false);
        });

        test('returns false for unknown fields', () => {
            assert.equal(isMetadataFieldRequired('unknownField'), false);
        });
    });

    describe('getMetadataFieldType', () => {
        test('returns correct type for string fields', () => {
            assert.equal(getMetadataFieldType('id'), 'string');
            assert.equal(getMetadataFieldType('name'), 'string');
            assert.equal(getMetadataFieldType('version'), 'string');
        });

        test('returns correct type for number fields', () => {
            assert.equal(getMetadataFieldType('rateLimit'), 'number');
        });

        test('returns correct type for boolean fields', () => {
            assert.equal(getMetadataFieldType('pro'), 'boolean');
            assert.equal(getMetadataFieldType('certified'), 'boolean');
        });

        test('returns correct type for array fields', () => {
            assert.equal(getMetadataFieldType('countries'), 'string[]');
        });

        test('returns correct type for object fields', () => {
            assert.equal(getMetadataFieldType('urls'), 'URLConfig');
            assert.equal(getMetadataFieldType('fees'), 'FeeStructure');
            assert.equal(getMetadataFieldType('requiredCredentials'), 'RequiredCredentials');
        });

        test('returns undefined for unknown fields', () => {
            assert.equal(getMetadataFieldType('unknownField'), undefined);
        });
    });

    describe('getAllMetadataFieldNames', () => {
        test('returns all field names', () => {
            const allFields = getAllMetadataFieldNames();

            assert.ok(Array.isArray(allFields));
            assert.ok(allFields.length > 0);
        });

        test('includes both required and optional fields', () => {
            const allFields = getAllMetadataFieldNames();

            assert.ok(allFields.includes('id'));
            assert.ok(allFields.includes('name'));
            assert.ok(allFields.includes('version'));
            assert.ok(allFields.includes('certified'));
        });

        test('returns all CCXT standard fields', () => {
            const allFields = getAllMetadataFieldNames();

            const expectedFields = [
                'id',
                'name',
                'countries',
                'version',
                'rateLimit',
                'pro',
                'certified',
                'hostname',
                'urls',
                'api',
                'timeframes',
                'fees',
                'requiredCredentials',
                'precisionMode',
            ];

            for (const expected of expectedFields) {
                assert.ok(
                    allFields.includes(expected),
                    `Missing expected field: ${expected}`
                );
            }
        });
    });

    describe('createMetadataDefaults', () => {
        test('creates object with default values', () => {
            const defaults = createMetadataDefaults();

            assert.ok(typeof defaults === 'object');
            assert.ok(defaults !== null);
        });

        test('includes rateLimit default', () => {
            const defaults = createMetadataDefaults();

            assert.equal(defaults.rateLimit, 1000);
        });

        test('includes pro default', () => {
            const defaults = createMetadataDefaults();

            assert.equal(defaults.pro, false);
        });

        test('includes certified default', () => {
            const defaults = createMetadataDefaults();

            assert.equal(defaults.certified, false);
        });

        test('includes precisionMode default', () => {
            const defaults = createMetadataDefaults();

            assert.equal(defaults.precisionMode, 'DECIMAL_PLACES');
        });

        test('does not include fields without defaults', () => {
            const defaults = createMetadataDefaults();

            assert.equal(defaults.id, undefined);
            assert.equal(defaults.name, undefined);
            assert.equal(defaults.version, undefined);
        });

        test('includes countries default (empty array)', () => {
            const defaults = createMetadataDefaults();

            assert.ok(Array.isArray(defaults.countries));
            assert.equal(defaults.countries?.length, 0);
        });

        test('includes requiredCredentials default', () => {
            const defaults = createMetadataDefaults();

            assert.ok(defaults.requiredCredentials);
            assert.equal(defaults.requiredCredentials?.apiKey, false);
            assert.equal(defaults.requiredCredentials?.secret, false);
        });
    });

    describe('Complex type validation', () => {
        test('validates fee structure', () => {
            const fees: FeeStructure = {
                trading: {
                    spot: {
                        percentage: true,
                        tierBased: false,
                        maker: 0.001,
                        taker: 0.001,
                    },
                },
                funding: {
                    withdraw: {
                        BTC: 0.0005,
                        ETH: 0.005,
                    },
                },
            };

            const metadata = {
                id: 'test',
                name: 'Test',
                countries: ['US'],
                rateLimit: 100,
                fees,
            };

            const result = validateMetadata(metadata);
            assert.equal(result.valid, true);
        });

        test('validates timeframes structure', () => {
            const timeframes = {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            };

            const metadata = {
                id: 'test',
                name: 'Test',
                countries: ['US'],
                rateLimit: 100,
                timeframes,
            };

            const result = validateMetadata(metadata);
            assert.equal(result.valid, true);
        });

        test('validates URLs structure', () => {
            const urls = {
                logo: 'https://example.com/logo.png',
                api: {
                    public: 'https://api.example.com/v1',
                    private: 'https://api.example.com/v1',
                },
                www: 'https://example.com',
                doc: ['https://docs.example.com'],
                fees: 'https://example.com/fees',
            };

            const metadata = {
                id: 'test',
                name: 'Test',
                countries: ['US'],
                rateLimit: 100,
                urls,
            };

            const result = validateMetadata(metadata);
            assert.equal(result.valid, true);
        });
    });
});
