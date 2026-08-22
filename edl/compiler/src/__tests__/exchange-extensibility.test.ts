/**
 * Tests for Exchange Extensibility
 * Tests exchange-specific order schema extensions and parameter resolution
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
    ExchangeOrderExtension,
    ExchangeCapabilities,
    OrderSchema,
    ExtensibleOrderSchema,
    mergeOrderSchemas,
    createExtensibleOrderSchema,
    resolveParamNameForExchange,
    resolveParamValueForExchange,
    resolveParamForExchange,
    validateExchangeExtension,
    validateExchangeCapabilities,
    getSupportedOrderTypes,
    supportsOrderType,
    getAllParamsForExchange,
} from '../schemas/exchange-extensibility.js';
import { OrderType, TimeInForce } from '../types/edl.js';

// ============================================================
// Test Fixtures
// ============================================================

const baseOrderSchema: OrderSchema = {
    orderTypes: ['market', 'limit', 'stop', 'stopLimit'],
    baseParams: {
        symbol: {
            type: 'string',
            required: true,
        },
        side: {
            type: 'string',
            required: true,
            enum: ['buy', 'sell'],
        },
        amount: {
            type: 'float',
            required: true,
        },
    },
    optionalParams: {
        price: {
            type: 'float',
            required: false,
        },
        stopPrice: {
            type: 'float',
            required: false,
        },
        timeInForce: {
            type: 'string',
            enum: ['GTC', 'IOC', 'FOK'],
        },
    },
};

const binanceExtension: ExchangeOrderExtension = {
    exchangeId: 'binance',
    customOrderTypes: ['trailingStop', 'oco'],
    customParams: {
        callbackRate: {
            type: 'float',
            description: 'Binance-specific callback rate for trailing stops',
        },
        icebergQty: {
            type: 'float',
            description: 'Iceberg order quantity',
        },
    },
    paramAliases: {
        amount: 'quantity',
        stopPrice: 'stopLossPrice',
    },
    requiredOverrides: ['timeInForce'],
    defaultOverrides: {
        timeInForce: 'GTC',
    },
    description: 'Binance-specific order extensions',
};

const krakenExtension: ExchangeOrderExtension = {
    exchangeId: 'kraken',
    customOrderTypes: ['stopLossLimit', 'takeProfitLimit'],
    customParams: {
        leverage: {
            type: 'int',
            min: 1,
            max: 5,
        },
        oflags: {
            type: 'string',
            description: 'Order flags (comma-delimited)',
        },
    },
    paramAliases: {
        symbol: 'pair',
        amount: 'volume',
    },
};

const coinbaseExtension: ExchangeOrderExtension = {
    exchangeId: 'coinbase',
    customParams: {
        selfTradePrevention: {
            type: 'string',
            enum: ['dc', 'co', 'cn', 'cb'],
        },
    },
    requiredOverrides: ['clientOrderId'],
};

// ============================================================
// Schema Merging Tests
// ============================================================

describe('Schema Merging', () => {
    test('should merge base schema with Binance extension', () => {
        const merged = mergeOrderSchemas(baseOrderSchema, binanceExtension);

        // Check custom order types added
        assert.ok(merged.orderTypes.includes('trailingStop'));
        assert.ok(merged.orderTypes.includes('oco'));
        assert.ok(merged.orderTypes.includes('limit')); // Base types preserved

        // Check custom params added
        assert.ok(merged.optionalParams.callbackRate);
        assert.strictEqual(merged.optionalParams.callbackRate?.type, 'float');
        assert.ok(merged.optionalParams.icebergQty);

        // Check parameter aliases applied
        assert.strictEqual(merged.baseParams.amount?.alias, 'quantity');
        assert.strictEqual(merged.optionalParams.stopPrice?.alias, 'stopLossPrice');

        // Check required overrides applied
        assert.ok(merged.baseParams.timeInForce);
        assert.strictEqual(merged.baseParams.timeInForce?.required, true);
        assert.ok(!merged.optionalParams.timeInForce); // Moved to baseParams

        // Check default overrides applied
        assert.strictEqual(merged.baseParams.timeInForce?.default, 'GTC');
    });

    test('should merge base schema with Kraken extension', () => {
        const merged = mergeOrderSchemas(baseOrderSchema, krakenExtension);

        // Check custom order types
        assert.ok(merged.orderTypes.includes('stopLossLimit'));
        assert.ok(merged.orderTypes.includes('takeProfitLimit'));

        // Check custom params
        assert.ok(merged.optionalParams.leverage);
        assert.strictEqual(merged.optionalParams.leverage?.min, 1);
        assert.strictEqual(merged.optionalParams.leverage?.max, 5);

        // Check parameter aliases
        assert.strictEqual(merged.baseParams.symbol?.alias, 'pair');
        assert.strictEqual(merged.baseParams.amount?.alias, 'volume');
    });

    test('should merge base schema with Coinbase extension', () => {
        const merged = mergeOrderSchemas(baseOrderSchema, coinbaseExtension);

        // Check custom params
        assert.ok(merged.optionalParams.selfTradePrevention);
        assert.deepStrictEqual(merged.optionalParams.selfTradePrevention?.enum, [
            'dc',
            'co',
            'cn',
            'cb',
        ]);

        // Check required overrides - clientOrderId should be added if not in base
        // Since clientOrderId is not in baseOrderSchema, it won't be moved to baseParams
        // This is expected behavior - we can only override existing params
    });

    test('should preserve base schema when merging with empty extension', () => {
        const emptyExtension: ExchangeOrderExtension = {
            exchangeId: 'test',
        };

        const merged = mergeOrderSchemas(baseOrderSchema, emptyExtension);

        // Should be equivalent to base schema
        assert.deepStrictEqual(merged.orderTypes, baseOrderSchema.orderTypes);
        assert.strictEqual(Object.keys(merged.baseParams).length, 3);
        assert.strictEqual(Object.keys(merged.optionalParams).length, 3);
    });
});

// ============================================================
// Extensible Schema Tests
// ============================================================

describe('Extensible Order Schema', () => {
    test('should create extensible schema and get schema for exchange', () => {
        const extensible = createExtensibleOrderSchema(baseOrderSchema, [
            binanceExtension,
            krakenExtension,
        ]);

        // Get Binance schema
        const binanceSchema = extensible.getSchemaForExchange('binance');
        assert.ok(binanceSchema.orderTypes.includes('trailingStop'));
        assert.ok(binanceSchema.optionalParams.callbackRate);

        // Get Kraken schema
        const krakenSchema = extensible.getSchemaForExchange('kraken');
        assert.ok(krakenSchema.orderTypes.includes('stopLossLimit'));
        assert.ok(krakenSchema.optionalParams.leverage);
    });

    test('should return base schema for unknown exchange', () => {
        const extensible = createExtensibleOrderSchema(baseOrderSchema, [binanceExtension]);

        const unknownSchema = extensible.getSchemaForExchange('unknown');

        // Should be base schema
        assert.deepStrictEqual(unknownSchema.orderTypes, baseOrderSchema.orderTypes);
        assert.ok(!unknownSchema.optionalParams.callbackRate);
    });
});

// ============================================================
// Parameter Resolution Tests
// ============================================================

describe('Parameter Resolution', () => {
    test('should resolve parameter name for Binance', () => {
        const extensions = [binanceExtension, krakenExtension];

        const amountName = resolveParamNameForExchange('amount', 'binance', extensions);
        assert.strictEqual(amountName, 'quantity');

        const stopPriceName = resolveParamNameForExchange('stopPrice', 'binance', extensions);
        assert.strictEqual(stopPriceName, 'stopLossPrice');

        // Param without alias
        const symbolName = resolveParamNameForExchange('symbol', 'binance', extensions);
        assert.strictEqual(symbolName, 'symbol');
    });

    test('should resolve parameter name for Kraken', () => {
        const extensions = [binanceExtension, krakenExtension];

        const symbolName = resolveParamNameForExchange('symbol', 'kraken', extensions);
        assert.strictEqual(symbolName, 'pair');

        const amountName = resolveParamNameForExchange('amount', 'kraken', extensions);
        assert.strictEqual(amountName, 'volume');
    });

    test('should resolve parameter value with defaults', () => {
        const extensions = [binanceExtension];

        // Value provided - should return it
        const providedValue = resolveParamValueForExchange(
            'timeInForce',
            'IOC',
            'binance',
            extensions
        );
        assert.strictEqual(providedValue, 'IOC');

        // No value provided - should use default
        const defaultValue = resolveParamValueForExchange(
            'timeInForce',
            undefined,
            'binance',
            extensions
        );
        assert.strictEqual(defaultValue, 'GTC');

        // No value and no default
        const noDefault = resolveParamValueForExchange('symbol', undefined, 'binance', extensions);
        assert.strictEqual(noDefault, undefined);
    });

    test('should resolve full parameter for exchange', () => {
        const extensions = [binanceExtension];

        // With value
        const resolved1 = resolveParamForExchange('amount', 10.5, 'binance', extensions);
        assert.strictEqual(resolved1.name, 'quantity');
        assert.strictEqual(resolved1.value, 10.5);

        // With default
        const resolved2 = resolveParamForExchange('timeInForce', undefined, 'binance', extensions);
        assert.strictEqual(resolved2.name, 'timeInForce');
        assert.strictEqual(resolved2.value, 'GTC');
    });
});

// ============================================================
// Validation Tests
// ============================================================

describe('Extension Validation', () => {
    test('should validate correct extension', () => {
        const result = validateExchangeExtension(binanceExtension);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject extension without exchangeId', () => {
        const invalid: ExchangeOrderExtension = {
            exchangeId: '',
            customOrderTypes: ['test'],
        };

        const result = validateExchangeExtension(invalid);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('exchangeId')));
    });

    test('should reject custom param without type', () => {
        const invalid: ExchangeOrderExtension = {
            exchangeId: 'test',
            customParams: {
                badParam: {} as any, // Missing type
            },
        };

        const result = validateExchangeExtension(invalid);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('badParam') && e.includes('type')));
    });

    test('should reject empty parameter alias', () => {
        const invalid: ExchangeOrderExtension = {
            exchangeId: 'test',
            paramAliases: {
                amount: '', // Empty alias
            },
        };

        const result = validateExchangeExtension(invalid);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('alias') && e.includes('amount')));
    });

    test('should warn about self-referencing alias', () => {
        const warning: ExchangeOrderExtension = {
            exchangeId: 'test',
            paramAliases: {
                amount: 'amount', // Maps to itself
            },
        };

        const result = validateExchangeExtension(warning);
        assert.strictEqual(result.valid, true); // Valid but warning
        assert.ok(result.warnings.some(w => w.includes('amount') && w.includes('itself')));
    });

    test('should warn about required param with default', () => {
        const warning: ExchangeOrderExtension = {
            exchangeId: 'test',
            requiredOverrides: ['timeInForce'],
            defaultOverrides: {
                timeInForce: 'GTC',
            },
        };

        const result = validateExchangeExtension(warning);
        assert.strictEqual(result.valid, true);
        assert.ok(
            result.warnings.some(w => w.includes('timeInForce') && w.includes('default value'))
        );
    });
});

describe('Capabilities Validation', () => {
    test('should validate correct capabilities', () => {
        const capabilities: ExchangeCapabilities = {
            supportedOrderTypes: ['market', 'limit', 'stop'],
            supportedTimeInForce: ['GTC', 'IOC', 'FOK'],
            supportsStopLoss: true,
            supportsTakeProfit: true,
            supportsTrailingStop: false,
            supportsReduceOnly: true,
            supportsPostOnly: true,
            customCapabilities: {
                supportsIcebergOrders: true,
                supportsOCO: true,
            },
        };

        const result = validateExchangeCapabilities(capabilities);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.errors.length, 0);
    });

    test('should reject capabilities without supported order types', () => {
        const invalid: ExchangeCapabilities = {
            supportedOrderTypes: [],
            supportedTimeInForce: ['GTC'],
            supportsStopLoss: true,
            supportsTakeProfit: true,
            supportsTrailingStop: true,
            supportsReduceOnly: false,
            supportsPostOnly: false,
        };

        const result = validateExchangeCapabilities(invalid);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('supportedOrderTypes')));
    });

    test('should warn about empty time-in-force', () => {
        const warning: ExchangeCapabilities = {
            supportedOrderTypes: ['market', 'limit'],
            supportedTimeInForce: [],
            supportsStopLoss: true,
            supportsTakeProfit: true,
            supportsTrailingStop: false,
            supportsReduceOnly: false,
            supportsPostOnly: false,
        };

        const result = validateExchangeCapabilities(warning);
        assert.strictEqual(result.valid, true);
        assert.ok(result.warnings.some(w => w.includes('supportedTimeInForce')));
    });

    test('should reject non-boolean capability flags', () => {
        const invalid: any = {
            supportedOrderTypes: ['market', 'limit'],
            supportedTimeInForce: ['GTC'],
            supportsStopLoss: 'yes', // Should be boolean
            supportsTakeProfit: true,
            supportsTrailingStop: false,
            supportsReduceOnly: false,
            supportsPostOnly: false,
        };

        const result = validateExchangeCapabilities(invalid);
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.some(e => e.includes('supportsStopLoss') && e.includes('boolean')));
    });

    test('should reject non-boolean custom capabilities', () => {
        const invalid: ExchangeCapabilities = {
            supportedOrderTypes: ['market'],
            supportedTimeInForce: ['GTC'],
            supportsStopLoss: true,
            supportsTakeProfit: true,
            supportsTrailingStop: false,
            supportsReduceOnly: false,
            supportsPostOnly: false,
            customCapabilities: {
                supportsIceberg: 'maybe' as any, // Should be boolean
            },
        };

        const result = validateExchangeCapabilities(invalid);
        assert.strictEqual(result.valid, false);
        assert.ok(
            result.errors.some(e => e.includes('supportsIceberg') && e.includes('boolean'))
        );
    });
});

// ============================================================
// Helper Function Tests
// ============================================================

describe('Helper Functions', () => {
    test('should get supported order types for exchange', () => {
        const extensions = [binanceExtension, krakenExtension];

        const binanceTypes = getSupportedOrderTypes(baseOrderSchema, 'binance', extensions);
        assert.ok(binanceTypes.includes('market'));
        assert.ok(binanceTypes.includes('limit'));
        assert.ok(binanceTypes.includes('trailingStop'));
        assert.ok(binanceTypes.includes('oco'));

        const krakenTypes = getSupportedOrderTypes(baseOrderSchema, 'kraken', extensions);
        assert.ok(krakenTypes.includes('stopLossLimit'));
        assert.ok(krakenTypes.includes('takeProfitLimit'));
    });

    test('should check if exchange supports order type', () => {
        const extensions = [binanceExtension, krakenExtension];

        // Binance supports trailingStop
        assert.strictEqual(
            supportsOrderType('trailingStop', 'binance', extensions, baseOrderSchema),
            true
        );

        // Kraken does not support trailingStop
        assert.strictEqual(
            supportsOrderType('trailingStop', 'kraken', extensions, baseOrderSchema),
            false
        );

        // Both support base types
        assert.strictEqual(
            supportsOrderType('market', 'binance', extensions, baseOrderSchema),
            true
        );
        assert.strictEqual(
            supportsOrderType('limit', 'kraken', extensions, baseOrderSchema),
            true
        );
    });

    test('should get all params for exchange', () => {
        const extensions = [binanceExtension];

        const binanceParams = getAllParamsForExchange(baseOrderSchema, 'binance', extensions);

        // Base params
        assert.ok(binanceParams.symbol);
        assert.ok(binanceParams.side);
        assert.ok(binanceParams.amount);

        // Optional params from base
        assert.ok(binanceParams.price);
        assert.ok(binanceParams.stopPrice);

        // Required override
        assert.ok(binanceParams.timeInForce);

        // Custom params
        assert.ok(binanceParams.callbackRate);
        assert.ok(binanceParams.icebergQty);
    });

    test('should get base params for unknown exchange', () => {
        const extensions = [binanceExtension];

        const unknownParams = getAllParamsForExchange(baseOrderSchema, 'unknown', extensions);

        // Should only have base params
        assert.ok(unknownParams.symbol);
        assert.ok(unknownParams.side);
        assert.ok(unknownParams.amount);
        assert.ok(unknownParams.price);

        // Should not have custom params
        assert.ok(!unknownParams.callbackRate);
    });
});

// ============================================================
// Custom Order Types Tests
// ============================================================

describe('Custom Order Types', () => {
    test('should add multiple custom order types', () => {
        const extension: ExchangeOrderExtension = {
            exchangeId: 'custom',
            customOrderTypes: ['type1', 'type2', 'type3'],
        };

        const merged = mergeOrderSchemas(baseOrderSchema, extension);

        assert.ok(merged.orderTypes.includes('type1'));
        assert.ok(merged.orderTypes.includes('type2'));
        assert.ok(merged.orderTypes.includes('type3'));
    });

    test('should not duplicate order types', () => {
        const extension: ExchangeOrderExtension = {
            exchangeId: 'custom',
            customOrderTypes: ['limit', 'market'], // Already in base
        };

        const merged = mergeOrderSchemas(baseOrderSchema, extension);

        // Count occurrences of 'limit'
        const limitCount = merged.orderTypes.filter(t => t === 'limit').length;
        assert.strictEqual(limitCount, 1);
    });
});

// ============================================================
// Default Override Tests
// ============================================================

describe('Default Overrides', () => {
    test('should apply default to optional param', () => {
        const extension: ExchangeOrderExtension = {
            exchangeId: 'test',
            defaultOverrides: {
                price: 100,
                stopPrice: 95,
            },
        };

        const merged = mergeOrderSchemas(baseOrderSchema, extension);

        assert.strictEqual(merged.optionalParams.price?.default, 100);
        assert.strictEqual(merged.optionalParams.stopPrice?.default, 95);
    });

    test('should apply default to base param', () => {
        const extension: ExchangeOrderExtension = {
            exchangeId: 'test',
            defaultOverrides: {
                side: 'buy',
            },
        };

        const merged = mergeOrderSchemas(baseOrderSchema, extension);

        assert.strictEqual(merged.baseParams.side?.default, 'buy');
    });
});
