/**
 * Exchange Extensibility Example
 * Demonstrates how to use exchange-specific order schema extensions
 */

import {
    ExchangeOrderExtension,
    ExchangeCapabilities,
    OrderSchema,
    createExtensibleOrderSchema,
    resolveParamForExchange,
    validateExchangeExtension,
    validateExchangeCapabilities,
    getSupportedOrderTypes,
    getAllParamsForExchange,
} from '../schemas/exchange-extensibility.js';

// ============================================================
// 1. Define Base Order Schema (Common Across All Exchanges)
// ============================================================

const baseOrderSchema: OrderSchema = {
    orderTypes: ['market', 'limit', 'stop', 'stopLimit'],
    baseParams: {
        symbol: {
            type: 'string',
            required: true,
            description: 'Trading pair symbol',
        },
        side: {
            type: 'string',
            required: true,
            enum: ['buy', 'sell'],
        },
        amount: {
            type: 'float',
            required: true,
            min: 0,
        },
    },
    optionalParams: {
        price: {
            type: 'float',
            description: 'Limit order price',
        },
        stopPrice: {
            type: 'float',
            description: 'Stop order trigger price',
        },
        timeInForce: {
            type: 'string',
            enum: ['GTC', 'IOC', 'FOK', 'GTD'],
        },
        clientOrderId: {
            type: 'string',
            description: 'Client-provided order ID',
        },
    },
};

// ============================================================
// 2. Define Exchange-Specific Extensions
// ============================================================

// Binance Extension
const binanceExtension: ExchangeOrderExtension = {
    exchangeId: 'binance',
    description: 'Binance-specific order features',

    // Binance supports additional order types
    customOrderTypes: ['trailingStop', 'oco'],

    // Binance-specific parameters
    customParams: {
        callbackRate: {
            type: 'float',
            description: 'Callback rate for trailing stop (0-5%)',
            min: 0,
            max: 5,
        },
        icebergQty: {
            type: 'float',
            description: 'Iceberg order visible quantity',
            min: 0,
        },
        newOrderRespType: {
            type: 'string',
            enum: ['ACK', 'RESULT', 'FULL'],
            default: 'RESULT',
        },
    },

    // Binance uses different parameter names
    paramAliases: {
        amount: 'quantity',
        stopPrice: 'stopLossPrice',
    },

    // Binance requires timeInForce for limit orders
    requiredOverrides: ['timeInForce'],

    // Binance defaults
    defaultOverrides: {
        timeInForce: 'GTC',
        newOrderRespType: 'RESULT',
    },
};

// Kraken Extension
const krakenExtension: ExchangeOrderExtension = {
    exchangeId: 'kraken',
    description: 'Kraken-specific order features',

    customOrderTypes: ['stopLossLimit', 'takeProfitLimit'],

    customParams: {
        leverage: {
            type: 'int',
            description: 'Leverage multiplier',
            min: 1,
            max: 5,
        },
        oflags: {
            type: 'string',
            description: 'Order flags: post,fcib,fciq,nompp',
        },
        starttm: {
            type: 'timestamp',
            description: 'Scheduled start time',
        },
        expiretm: {
            type: 'timestamp',
            description: 'Expiration time',
        },
    },

    paramAliases: {
        symbol: 'pair',
        amount: 'volume',
        clientOrderId: 'userref',
    },
};

// Coinbase Extension
const coinbaseExtension: ExchangeOrderExtension = {
    exchangeId: 'coinbase',
    description: 'Coinbase Pro order features',

    customParams: {
        selfTradePrevention: {
            type: 'string',
            description: 'Self-trade prevention mode',
            enum: ['dc', 'co', 'cn', 'cb'],
            default: 'dc',
        },
        stop: {
            type: 'string',
            enum: ['loss', 'entry'],
            description: 'Stop order type',
        },
    },

    requiredOverrides: ['clientOrderId'],
};

// ============================================================
// 3. Define Exchange Capabilities
// ============================================================

const binanceCapabilities: ExchangeCapabilities = {
    exchangeId: 'binance',
    supportedOrderTypes: ['market', 'limit', 'stop', 'stopLimit', 'trailingStop', 'oco'],
    supportedTimeInForce: ['GTC', 'IOC', 'FOK', 'GTD'],
    supportsStopLoss: true,
    supportsTakeProfit: true,
    supportsTrailingStop: true,
    supportsReduceOnly: true,
    supportsPostOnly: true,
    customCapabilities: {
        supportsIcebergOrders: true,
        supportsOCO: true,
        supportsMarginTrading: true,
    },
};

const krakenCapabilities: ExchangeCapabilities = {
    exchangeId: 'kraken',
    supportedOrderTypes: ['market', 'limit', 'stopLoss', 'stopLossLimit', 'takeProfit', 'takeProfitLimit'],
    supportedTimeInForce: ['GTC', 'IOC'],
    supportsStopLoss: true,
    supportsTakeProfit: true,
    supportsTrailingStop: false,
    supportsReduceOnly: false,
    supportsPostOnly: true,
    customCapabilities: {
        supportsLeverage: true,
        supportsScheduledOrders: true,
    },
};

// ============================================================
// 4. Create Extensible Schema
// ============================================================

const extensibleSchema = createExtensibleOrderSchema(baseOrderSchema, [
    binanceExtension,
    krakenExtension,
    coinbaseExtension,
]);

// ============================================================
// 5. Validate Extensions
// ============================================================

console.log('=== Validating Extensions ===\n');

const binanceValidation = validateExchangeExtension(binanceExtension);
console.log('Binance Extension Valid:', binanceValidation.valid);
if (!binanceValidation.valid) {
    console.log('Errors:', binanceValidation.errors);
}
if (binanceValidation.warnings.length > 0) {
    console.log('Warnings:', binanceValidation.warnings);
}

const krakenValidation = validateExchangeExtension(krakenExtension);
console.log('Kraken Extension Valid:', krakenValidation.valid);

// ============================================================
// 6. Validate Capabilities
// ============================================================

console.log('\n=== Validating Capabilities ===\n');

const binanceCapValidation = validateExchangeCapabilities(binanceCapabilities);
console.log('Binance Capabilities Valid:', binanceCapValidation.valid);

const krakenCapValidation = validateExchangeCapabilities(krakenCapabilities);
console.log('Kraken Capabilities Valid:', krakenCapValidation.valid);

// ============================================================
// 7. Get Exchange-Specific Schemas
// ============================================================

console.log('\n=== Exchange-Specific Schemas ===\n');

const binanceSchema = extensibleSchema.getSchemaForExchange('binance');
console.log('Binance Order Types:', binanceSchema.orderTypes);
console.log('Binance Custom Params:', Object.keys(binanceSchema.optionalParams).filter(
    key => ['callbackRate', 'icebergQty', 'newOrderRespType'].includes(key)
));

const krakenSchema = extensibleSchema.getSchemaForExchange('kraken');
console.log('Kraken Order Types:', krakenSchema.orderTypes);
console.log('Kraken Custom Params:', Object.keys(krakenSchema.optionalParams).filter(
    key => ['leverage', 'oflags', 'starttm', 'expiretm'].includes(key)
));

// ============================================================
// 8. Get Supported Order Types
// ============================================================

console.log('\n=== Supported Order Types ===\n');

const binanceTypes = getSupportedOrderTypes(baseOrderSchema, 'binance', [binanceExtension]);
console.log('Binance supports:', binanceTypes);

const krakenTypes = getSupportedOrderTypes(baseOrderSchema, 'kraken', [krakenExtension]);
console.log('Kraken supports:', krakenTypes);

// ============================================================
// 9. Resolve Parameters for Different Exchanges
// ============================================================

console.log('\n=== Parameter Resolution ===\n');

const extensions = [binanceExtension, krakenExtension, coinbaseExtension];

// Example order parameters
const orderParams = {
    symbol: 'BTC/USDT',
    side: 'buy',
    amount: 1.5,
    price: 50000,
    timeInForce: undefined,
};

// Resolve for Binance
console.log('Binance Parameters:');
for (const [param, value] of Object.entries(orderParams)) {
    const resolved = resolveParamForExchange(param, value, 'binance', extensions);
    console.log(`  ${param} -> ${resolved.name}: ${resolved.value}`);
}

// Resolve for Kraken
console.log('\nKraken Parameters:');
for (const [param, value] of Object.entries(orderParams)) {
    const resolved = resolveParamForExchange(param, value, 'kraken', extensions);
    console.log(`  ${param} -> ${resolved.name}: ${resolved.value}`);
}

// ============================================================
// 10. Get All Parameters for Exchange
// ============================================================

console.log('\n=== All Parameters for Binance ===\n');

const binanceParams = getAllParamsForExchange(baseOrderSchema, 'binance', extensions);
console.log('Total parameters:', Object.keys(binanceParams).length);
console.log('Required params:', Object.entries(binanceParams)
    .filter(([_, def]) => (def as any).required)
    .map(([name, _]) => name)
);
console.log('Custom params:', Object.entries(binanceParams)
    .filter(([name, _]) => ['callbackRate', 'icebergQty', 'newOrderRespType'].includes(name))
    .map(([name, _]) => name)
);

// ============================================================
// 11. Practical Example: Creating Orders
// ============================================================

console.log('\n=== Creating Orders for Different Exchanges ===\n');

// Binance limit order
const binanceLimitOrder = {
    symbol: 'BTC/USDT',
    side: 'buy',
    type: 'limit',
    amount: 1.0,
    price: 50000,
    timeInForce: 'GTC',
};

console.log('Binance Limit Order (CCXT format):', binanceLimitOrder);

// Resolve to Binance format
const binanceApiOrder = Object.fromEntries(
    Object.entries(binanceLimitOrder).map(([key, value]) => {
        const resolved = resolveParamForExchange(key, value, 'binance', extensions);
        return [resolved.name, resolved.value];
    })
);
console.log('Binance Limit Order (API format):', binanceApiOrder);

// Binance trailing stop order
const binanceTrailingStop = {
    symbol: 'ETH/USDT',
    side: 'sell',
    type: 'trailingStop',
    amount: 5.0,
    callbackRate: 1.0,
};

console.log('\nBinance Trailing Stop Order:', binanceTrailingStop);

// Kraken order
const krakenLimitOrder = {
    symbol: 'BTC/USD',
    side: 'buy',
    type: 'limit',
    amount: 0.5,
    price: 50000,
};

// Resolve to Kraken format
const krakenApiOrder = Object.fromEntries(
    Object.entries(krakenLimitOrder).map(([key, value]) => {
        const resolved = resolveParamForExchange(key, value, 'kraken', extensions);
        return [resolved.name, resolved.value];
    })
);
console.log('\nKraken Limit Order (CCXT format):', krakenLimitOrder);
console.log('Kraken Limit Order (API format):', krakenApiOrder);

// ============================================================
// 12. Example: Handling Exchange-Specific Features
// ============================================================

console.log('\n=== Exchange-Specific Features ===\n');

// Binance iceberg order
if (binanceCapabilities.customCapabilities?.supportsIcebergOrders) {
    const icebergOrder = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: 10.0,
        price: 50000,
        icebergQty: 1.0, // Show only 1 BTC at a time
    };
    console.log('Binance Iceberg Order:', icebergOrder);
}

// Kraken leverage order
if (krakenCapabilities.customCapabilities?.supportsLeverage) {
    const leverageOrder = {
        symbol: 'ETH/USD',
        side: 'buy',
        type: 'limit',
        amount: 10.0,
        price: 3000,
        leverage: 3, // 3x leverage
    };
    console.log('Kraken Leverage Order:', leverageOrder);
}

console.log('\n=== Example Complete ===\n');
