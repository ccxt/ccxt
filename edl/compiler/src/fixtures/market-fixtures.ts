import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// CCXT Market Interface - based on ccxt/ts/src/base/types.ts
export interface CCXTMarketFixture {
    id: string | undefined;
    numericId?: number | undefined;
    uppercaseId?: string | undefined;
    lowercaseId?: string | undefined;
    symbol: string;
    base: string;
    quote: string;
    baseId: string | undefined;
    quoteId: string | undefined;
    active: boolean | undefined;
    type: 'spot' | 'margin' | 'swap' | 'future' | 'option' | 'delivery' | 'index';
    subType?: 'linear' | 'inverse' | undefined;
    spot: boolean;
    margin: boolean;
    swap: boolean;
    future: boolean;
    option: boolean;
    contract: boolean;
    settle: string | undefined;
    settleId: string | undefined;
    contractSize: number | undefined;
    linear: boolean | undefined;
    inverse: boolean | undefined;
    quanto?: boolean;
    expiry: number | undefined;
    expiryDatetime: string | undefined;
    strike: number | undefined;
    optionType: string | undefined;
    taker?: number | undefined;
    maker?: number | undefined;
    percentage?: boolean | undefined;
    tierBased?: boolean | undefined;
    feeSide?: string | undefined;
    precision: {
        amount: number | undefined;
        price: number | undefined;
        cost?: number | undefined;
    };
    marginModes?: {
        isolated: boolean;
        cross: boolean;
    };
    limits: {
        amount?: {
            min: number | undefined;
            max: number | undefined;
        };
        cost?: {
            min: number | undefined;
            max: number | undefined;
        };
        leverage?: {
            min: number | undefined;
            max: number | undefined;
        };
        price?: {
            min: number | undefined;
            max: number | undefined;
        };
        market?: {
            min: number | undefined;
            max: number | undefined;
        };
    };
    created: number | undefined;
    info: any;
}

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to test-fixtures directory
const FIXTURES_DIR = join(__dirname, '../../test-fixtures/markets');

/**
 * Load market fixtures from JSON files
 * @param exchange - Exchange name (binance, kraken)
 * @param marketType - Market type (spot, futures)
 * @returns Array of market fixtures
 */
export function loadMarketFixtures(exchange: string, marketType: 'spot' | 'futures'): CCXTMarketFixture[] {
    const filename = `${exchange}-${marketType}.json`;
    const filepath = join(FIXTURES_DIR, filename);

    try {
        const content = readFileSync(filepath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to load market fixtures from ${filepath}: ${error}`);
    }
}

/**
 * Get a specific market fixture by exchange and symbol
 * @param exchange - Exchange name (binance, kraken)
 * @param symbol - Market symbol (e.g., BTC/USDT, XBT/USD:XBT)
 * @returns Market fixture or undefined if not found
 */
export function getMarketFixture(exchange: string, symbol: string): CCXTMarketFixture | undefined {
    // Try spot first, then futures
    const spotMarkets = loadMarketFixtures(exchange, 'spot');
    let market = spotMarkets.find(m => m.symbol === symbol);

    if (!market) {
        const futuresMarkets = loadMarketFixtures(exchange, 'futures');
        market = futuresMarkets.find(m => m.symbol === symbol);
    }

    return market;
}

/**
 * Validate market structure against CCXT schema
 * @param market - Market object to validate
 * @returns Object with valid flag and error messages
 */
export function validateMarketStructure(market: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!market.symbol) errors.push('Missing required field: symbol');
    if (!market.base) errors.push('Missing required field: base');
    if (!market.quote) errors.push('Missing required field: quote');
    if (!market.type) errors.push('Missing required field: type');

    // Type validation
    const validTypes = ['spot', 'margin', 'swap', 'future', 'option', 'delivery', 'index'];
    if (market.type && !validTypes.includes(market.type)) {
        errors.push(`Invalid type: ${market.type}. Must be one of ${validTypes.join(', ')}`);
    }

    // SubType validation (if present)
    if (market.subType && !['linear', 'inverse'].includes(market.subType)) {
        errors.push(`Invalid subType: ${market.subType}. Must be 'linear' or 'inverse'`);
    }

    // Boolean fields
    const booleanFields = ['spot', 'margin', 'swap', 'future', 'option', 'contract'];
    for (const field of booleanFields) {
        if (market[field] !== undefined && typeof market[field] !== 'boolean') {
            errors.push(`Field ${field} must be a boolean`);
        }
    }

    // Precision validation
    if (!market.precision) {
        errors.push('Missing required field: precision');
    } else {
        if (market.precision.amount === undefined) {
            errors.push('Missing required field: precision.amount');
        }
        if (market.precision.price === undefined) {
            errors.push('Missing required field: precision.price');
        }
    }

    // Limits validation
    if (!market.limits) {
        errors.push('Missing required field: limits');
    }

    // Contract-specific validation
    if (market.contract) {
        if (market.contractSize === undefined) {
            errors.push('Contract markets must have contractSize');
        }
        if (market.settle === undefined) {
            errors.push('Contract markets must have settle currency');
        }
        if (market.linear === undefined && market.inverse === undefined) {
            errors.push('Contract markets must specify linear or inverse');
        }
    }

    // Future-specific validation
    if (market.future && market.type === 'future') {
        if (market.expiry === undefined) {
            errors.push('Future markets must have expiry timestamp');
        }
        if (market.expiryDatetime === undefined) {
            errors.push('Future markets must have expiryDatetime');
        }
    }

    // Option-specific validation
    if (market.option) {
        if (market.strike === undefined) {
            errors.push('Option markets must have strike price');
        }
        if (market.optionType === undefined) {
            errors.push('Option markets must have optionType (call/put)');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Compare two market objects for equality
 * @param generated - Generated market object
 * @param expected - Expected market object
 * @returns Object with equal flag and list of differences
 */
export function compareMarkets(
    generated: CCXTMarketFixture,
    expected: CCXTMarketFixture
): { equal: boolean; differences: string[] } {
    const differences: string[] = [];

    // Compare top-level fields
    const fieldsToCompare = [
        'id', 'symbol', 'base', 'quote', 'baseId', 'quoteId',
        'active', 'type', 'subType', 'spot', 'margin', 'swap',
        'future', 'option', 'contract', 'settle', 'settleId',
        'contractSize', 'linear', 'inverse', 'expiry', 'expiryDatetime',
        'strike', 'optionType', 'taker', 'maker', 'percentage',
        'tierBased', 'feeSide'
    ];

    for (const field of fieldsToCompare) {
        const genValue = (generated as any)[field];
        const expValue = (expected as any)[field];

        if (genValue !== expValue) {
            differences.push(
                `${field}: generated=${JSON.stringify(genValue)}, expected=${JSON.stringify(expValue)}`
            );
        }
    }

    // Compare precision
    if (generated.precision && expected.precision) {
        if (generated.precision.amount !== expected.precision.amount) {
            differences.push(
                `precision.amount: generated=${generated.precision.amount}, expected=${expected.precision.amount}`
            );
        }
        if (generated.precision.price !== expected.precision.price) {
            differences.push(
                `precision.price: generated=${generated.precision.price}, expected=${expected.precision.price}`
            );
        }
        if (generated.precision.cost !== expected.precision.cost) {
            differences.push(
                `precision.cost: generated=${generated.precision.cost}, expected=${expected.precision.cost}`
            );
        }
    } else if (generated.precision || expected.precision) {
        differences.push('precision object mismatch');
    }

    // Compare limits
    if (generated.limits && expected.limits) {
        const limitTypes = ['amount', 'price', 'cost', 'leverage'] as const;
        for (const limitType of limitTypes) {
            const genLimit = generated.limits[limitType];
            const expLimit = expected.limits[limitType];

            if (genLimit && expLimit) {
                if (genLimit.min !== expLimit.min) {
                    differences.push(
                        `limits.${limitType}.min: generated=${genLimit.min}, expected=${expLimit.min}`
                    );
                }
                if (genLimit.max !== expLimit.max) {
                    differences.push(
                        `limits.${limitType}.max: generated=${genLimit.max}, expected=${expLimit.max}`
                    );
                }
            } else if (genLimit || expLimit) {
                differences.push(`limits.${limitType} mismatch`);
            }
        }
    } else if (generated.limits || expected.limits) {
        differences.push('limits object mismatch');
    }

    return {
        equal: differences.length === 0,
        differences
    };
}

/**
 * Get all available exchanges in fixtures
 */
export function getAvailableExchanges(): string[] {
    return ['binance', 'kraken'];
}

/**
 * Get all available market types for an exchange
 */
export function getAvailableMarketTypes(exchange: string): ('spot' | 'futures')[] {
    return ['spot', 'futures'];
}
