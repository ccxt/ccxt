/**
 * Tests for enhanced parameter schema features
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type { ParamDefinition, ParamType, ParamLocation } from '../types/edl.js';

describe('Parameter Schema Types', () => {
    test('basic parameter with type and required', () => {
        const param: ParamDefinition = {
            type: 'string',
            required: true,
        };
        assert.equal(param.type, 'string');
        assert.equal(param.required, true);
    });

    test('parameter with enum values', () => {
        const param: ParamDefinition = {
            type: 'string',
            enum: ['buy', 'sell'],
            description: 'Order side',
        };
        assert.ok(param.enum);
        assert.equal(param.enum.length, 2);
        assert.ok(param.enum.includes('buy'));
    });

    test('parameter with location specification', () => {
        const pathParam: ParamDefinition = {
            type: 'string',
            location: 'path',
        };
        const queryParam: ParamDefinition = {
            type: 'int',
            location: 'query',
        };
        const bodyParam: ParamDefinition = {
            type: 'number',
            location: 'body',
        };
        const headerParam: ParamDefinition = {
            type: 'string',
            location: 'header',
        };

        assert.equal(pathParam.location, 'path');
        assert.equal(queryParam.location, 'query');
        assert.equal(bodyParam.location, 'body');
        assert.equal(headerParam.location, 'header');
    });

    test('parameter with single alias', () => {
        const param: ParamDefinition = {
            type: 'string',
            alias: 'trading_pair',
        };
        assert.equal(param.alias, 'trading_pair');
    });

    test('parameter with multiple aliases', () => {
        const param: ParamDefinition = {
            type: 'number',
            alias: ['quantity', 'qty', 'amount'],
        };
        assert.ok(Array.isArray(param.alias));
        assert.equal(param.alias.length, 3);
    });

    test('parameter with validation expression', () => {
        const param: ParamDefinition = {
            type: 'number',
            validate: 'value > 0',
            description: 'Must be positive',
        };
        assert.equal(param.validate, 'value > 0');
    });

    test('parameter with transform expression', () => {
        const param: ParamDefinition = {
            type: 'string',
            transform: 'uppercase',
        };
        assert.equal(param.transform, 'uppercase');
    });

    test('parameter with conditional requirement', () => {
        const param: ParamDefinition = {
            type: 'number',
            required_if: "type == 'limit'",
            dependencies: ['type'],
        };
        assert.equal(param.required_if, "type == 'limit'");
        assert.ok(param.dependencies);
        assert.ok(param.dependencies.includes('type'));
    });

    test('parameter with dependencies', () => {
        const param: ParamDefinition = {
            type: 'timestamp_ms',
            dependencies: ['startTime'],
            validate: '!startTime || value > startTime',
        };
        assert.ok(param.dependencies);
        assert.equal(param.dependencies[0], 'startTime');
    });

    test('parameter with all fields', () => {
        const param: ParamDefinition = {
            type: 'number',
            required: false,
            required_if: "type == 'limit'",
            default: 100,
            description: 'Order amount',
            enum: [10, 50, 100, 500],
            dependencies: ['type'],
            location: 'body',
            alias: ['quantity', 'qty'],
            validate: 'value > 0',
            transform: 'toString()',
        };

        assert.equal(param.type, 'number');
        assert.equal(param.required, false);
        assert.equal(param.required_if, "type == 'limit'");
        assert.equal(param.default, 100);
        assert.equal(param.description, 'Order amount');
        assert.ok(param.enum);
        assert.equal(param.enum.length, 4);
        assert.ok(param.dependencies);
        assert.equal(param.location, 'body');
        assert.ok(Array.isArray(param.alias));
        assert.equal(param.validate, 'value > 0');
        assert.equal(param.transform, 'toString()');
    });

    test('all param types are valid', () => {
        const types: ParamType[] = [
            'string',
            'int',
            'integer',
            'float',
            'number',
            'bool',
            'boolean',
            'timestamp',
            'timestamp_ms',
            'timestamp_ns',
            'object',
            'array',
        ];

        types.forEach(type => {
            const param: ParamDefinition = { type };
            assert.equal(param.type, type);
        });
    });

    test('all param locations are valid', () => {
        const locations: ParamLocation[] = ['query', 'body', 'path', 'header'];

        locations.forEach(location => {
            const param: ParamDefinition = {
                type: 'string',
                location,
            };
            assert.equal(param.location, location);
        });
    });

    test('default values can be different types', () => {
        const stringDefault: ParamDefinition = {
            type: 'string',
            default: 'GTC',
        };
        const numberDefault: ParamDefinition = {
            type: 'int',
            default: 100,
        };
        const boolDefault: ParamDefinition = {
            type: 'bool',
            default: false,
        };
        const nullDefault: ParamDefinition = {
            type: 'string',
            default: null,
        };

        assert.equal(stringDefault.default, 'GTC');
        assert.equal(numberDefault.default, 100);
        assert.equal(boolDefault.default, false);
        assert.equal(nullDefault.default, null);
    });

    test('enum can contain strings', () => {
        const param: ParamDefinition = {
            type: 'string',
            enum: ['spot', 'margin', 'futures'],
        };
        assert.ok(param.enum);
        assert.ok(param.enum.every(v => typeof v === 'string'));
    });

    test('enum can contain numbers', () => {
        const param: ParamDefinition = {
            type: 'int',
            enum: [10, 20, 50, 100],
        };
        assert.ok(param.enum);
        assert.ok(param.enum.every(v => typeof v === 'number'));
    });
});
