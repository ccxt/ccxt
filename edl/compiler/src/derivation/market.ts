/**
 * Market Derivation Logic
 * Derives market details including contract size, settlement, and market flags
 */

import type {
    MarketDefinition,
    MarketType,
    SymbolMapping,
    LinearInverseDerivation,
    LegDerivation,
} from '../types/edl.js';
import {
    deriveSymbol,
    deriveBaseQuote,
    deriveSettleCurrency,
    deriveMarketType,
    isLinear,
    isInverse,
    isQuanto,
    deriveOptionProperties,
} from './symbol.js';

// ============================================================
// Market Derivation Types
// ============================================================

/**
 * Rules for deriving contract size from market data
 */
export interface ContractSizeDerivation {
    /** Path to contract size field in market data */
    path?: string;
    /** Formula to calculate contract size (e.g., "10 * contractMultiplier") */
    formula?: string;
    /** Default contract size if not found */
    default?: number | null;
}

/**
 * Rules for deriving settlement details
 */
export interface SettlementDerivation {
    /** Path to settlement currency in market data */
    settleCurrencyPath?: string;
    /** Path to expiry timestamp in market data */
    expiryPath?: string;
    /** Path to expiry datetime string in market data */
    expiryDatetimePath?: string;
}

/**
 * Rules for deriving market boolean flags
 */
export interface MarketFlagsDerivation {
    /** Condition to determine if market is a contract */
    contractCondition?: string;
    /** Condition to determine if market is active */
    activeCondition?: string;
    /** Path to active field in market data */
    activePath?: string;
}

/**
 * Complete market derivation rules
 */
export interface MarketDerivationRules {
    /** Symbol mapping rules */
    symbolMapping: SymbolMapping;
    /** Contract size derivation rules */
    contractSize?: ContractSizeDerivation;
    /** Settlement derivation rules */
    settlement?: SettlementDerivation;
    /** Market flags derivation rules */
    flags?: MarketFlagsDerivation;
}

// ============================================================
// Contract Size Derivation
// ============================================================

/**
 * Derives contract size from exchange market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Contract size derivation rules
 * @returns Contract size number or null if not applicable
 */
export function deriveContractSize(
    marketData: any,
    rules?: ContractSizeDerivation
): number | null {
    if (!rules) {
        return null;
    }

    // Try path-based extraction first
    if (rules.path) {
        const value = getNestedValue(marketData, rules.path);
        if (value !== undefined && value !== null) {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                return numValue;
            }
        }
    }

    // Try formula-based calculation
    if (rules.formula) {
        try {
            const calculatedValue = evaluateFormula(marketData, rules.formula);
            if (calculatedValue !== undefined && calculatedValue !== null) {
                const numValue = Number(calculatedValue);
                if (!isNaN(numValue)) {
                    return numValue;
                }
            }
        } catch (error) {
            // Formula evaluation failed, continue to default
        }
    }

    // Return default value
    return rules.default !== undefined ? rules.default : null;
}

// ============================================================
// Settlement Derivation
// ============================================================

/**
 * Derives settlement details from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Settlement derivation rules
 * @returns Object containing settlement currency, expiry, and expiry datetime
 */
export function deriveSettlement(
    marketData: any,
    rules?: SettlementDerivation
): {
    settle?: string;
    settleId?: string;
    expiry?: number | null;
    expiryDatetime?: string | null;
} {
    const result: {
        settle?: string;
        settleId?: string;
        expiry?: number | null;
        expiryDatetime?: string | null;
    } = {};

    if (!rules) {
        return result;
    }

    // Derive settlement currency
    if (rules.settleCurrencyPath) {
        const settleId = getNestedValue(marketData, rules.settleCurrencyPath);
        if (settleId) {
            result.settleId = String(settleId);
            result.settle = normalizeCurrencyCode(settleId);
        }
    }

    // Derive expiry timestamp
    if (rules.expiryPath) {
        const expiryValue = getNestedValue(marketData, rules.expiryPath);
        if (expiryValue !== undefined && expiryValue !== null) {
            const numValue = Number(expiryValue);
            if (!isNaN(numValue)) {
                result.expiry = numValue;
            }
        }
    }

    // Derive expiry datetime
    if (rules.expiryDatetimePath) {
        const expiryDatetime = getNestedValue(marketData, rules.expiryDatetimePath);
        if (expiryDatetime) {
            result.expiryDatetime = String(expiryDatetime);
        }
    }

    return result;
}

// ============================================================
// Market Flags Derivation
// ============================================================

/**
 * Derives market boolean flags from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Market flags derivation rules
 * @param marketType - The derived market type
 * @returns Object containing contract and active flags
 */
export function deriveMarketFlags(
    marketData: any,
    rules: MarketFlagsDerivation | undefined,
    marketType: MarketType
): {
    contract?: boolean;
    active?: boolean;
    spot?: boolean;
    margin?: boolean;
    swap?: boolean;
    future?: boolean;
    option?: boolean;
} {
    const result: {
        contract?: boolean;
        active?: boolean;
        spot?: boolean;
        margin?: boolean;
        swap?: boolean;
        future?: boolean;
        option?: boolean;
    } = {};

    // Derive contract flag
    if (rules?.contractCondition) {
        result.contract = evaluateCondition(marketData, rules.contractCondition);
    } else {
        // Default: contract is true for swap, future, option
        result.contract = marketType === 'swap' || marketType === 'future' || marketType === 'option';
    }

    // Derive active flag
    if (rules?.activePath) {
        const activeValue = getNestedValue(marketData, rules.activePath);
        result.active = Boolean(activeValue);
    } else if (rules?.activeCondition) {
        result.active = evaluateCondition(marketData, rules.activeCondition);
    } else {
        // Default to true if not specified
        result.active = true;
    }

    // Derive market type boolean flags
    result.spot = marketType === 'spot';
    result.margin = marketType === 'margin';
    result.swap = marketType === 'swap';
    result.future = marketType === 'future';
    result.option = marketType === 'option';

    return result;
}

// ============================================================
// Comprehensive Market Derivation
// ============================================================

/**
 * Derives comprehensive market details from exchange data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Complete market derivation rules
 * @returns Partial MarketDefinition with all derived fields
 */
export function deriveMarketDetails(
    marketData: any,
    rules: MarketDerivationRules
): Partial<MarketDefinition> {
    const result: Partial<MarketDefinition> = {};

    // Store raw market data in info field
    result.info = marketData;

    // Extract market ID
    result.id = String(marketData.id || marketData.symbol || '');

    // Derive symbol
    result.symbol = deriveSymbol(marketData, rules.symbolMapping);

    // Derive base and quote
    const { base, quote } = deriveBaseQuote(marketData, rules.symbolMapping);
    result.base = base;
    result.quote = quote;

    // Store base and quote IDs if they exist in raw data
    if (rules.symbolMapping.baseIdPath) {
        const baseId = getNestedValue(marketData, rules.symbolMapping.baseIdPath);
        if (baseId) {
            result.baseId = String(baseId);
        }
    }
    if (rules.symbolMapping.quoteIdPath) {
        const quoteId = getNestedValue(marketData, rules.symbolMapping.quoteIdPath);
        if (quoteId) {
            result.quoteId = String(quoteId);
        }
    }

    // Derive market type
    if (rules.symbolMapping.contractTypeDerivation) {
        result.type = deriveMarketType(marketData, rules.symbolMapping.contractTypeDerivation);
    }

    // Derive settlement currency
    const settleCurrency = deriveSettleCurrency(marketData, rules.symbolMapping);
    if (settleCurrency) {
        result.settle = settleCurrency;
    }

    // Derive settlement details
    if (rules.settlement) {
        const settlement = deriveSettlement(marketData, rules.settlement);
        Object.assign(result, settlement);
    }

    // Derive linear/inverse/quanto
    if (rules.symbolMapping.linearInverseDerivation && result.type !== 'spot') {
        const derivation = rules.symbolMapping.linearInverseDerivation;
        result.linear = isLinear(marketData, derivation);
        result.inverse = isInverse(marketData, derivation);
        result.quanto = isQuanto(marketData, derivation);
    }

    // Derive contract size
    if (rules.contractSize) {
        result.contractSize = deriveContractSize(marketData, rules.contractSize);
    }

    // Derive market flags
    const flags = deriveMarketFlags(marketData, rules.flags, result.type || 'spot');
    Object.assign(result, flags);

    // Derive option properties
    if (result.type === 'option' && rules.symbolMapping.legDerivation) {
        const optionProps = deriveOptionProperties(marketData, rules.symbolMapping.legDerivation);
        Object.assign(result, optionProps);
    }

    return result;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Gets a nested value from an object using a path string
 * Supports dot notation (e.g., "data.symbol") and bracket notation (e.g., "data[0].symbol")
 *
 * @param obj - The object to extract value from
 * @param path - The path string
 * @returns The value at the path, or undefined if not found
 */
function getNestedValue(obj: any, path: string): any {
    if (!path || !obj) {
        return undefined;
    }

    // Handle bracket notation like "data[0]" or "symbols[0].name"
    const keys = path.split('.').flatMap(key => {
        const bracketMatch = key.match(/([^\[]+)\[(\d+)\]/);
        if (bracketMatch) {
            return [bracketMatch[1], Number(bracketMatch[2])];
        }
        return [key];
    });

    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[key];
    }

    return current;
}

/**
 * Normalizes a currency code to CCXT standard format
 *
 * @param code - Raw currency code from exchange
 * @returns Normalized currency code (uppercase)
 */
function normalizeCurrencyCode(code: string): string {
    if (!code) {
        return '';
    }

    // Convert to uppercase
    let normalized = String(code).toUpperCase();

    // Common currency code mappings (can be extended)
    const currencyMap: Record<string, string> = {
        'XBT': 'BTC',  // Some exchanges use XBT for Bitcoin
    };

    return currencyMap[normalized] || normalized;
}

/**
 * Evaluates a condition string against market data
 * Supports simple comparison operators: ==, !=, >, <, >=, <=, &&, ||
 *
 * @param marketData - The market data object
 * @param condition - Condition string (e.g., "type == 'SPOT'", "expiry != null")
 * @returns True if condition evaluates to true
 */
function evaluateCondition(marketData: any, condition: string): boolean {
    if (!condition) {
        return false;
    }

    try {
        // Simple expression evaluator for common patterns
        // This is a basic implementation - can be enhanced for complex expressions

        // Handle null checks
        if (condition.includes('!= null')) {
            const field = condition.replace('!= null', '').trim();
            const value = getNestedValue(marketData, field);
            return value !== null && value !== undefined;
        }

        if (condition.includes('== null')) {
            const field = condition.replace('== null', '').trim();
            const value = getNestedValue(marketData, field);
            return value === null || value === undefined;
        }

        // Handle equality checks with strings
        const eqMatch = condition.match(/^(.+?)\s*==\s*['"](.+?)['"]$/);
        if (eqMatch) {
            const field = eqMatch[1].trim();
            const expectedValue = eqMatch[2];
            const actualValue = getNestedValue(marketData, field);
            return String(actualValue) === expectedValue;
        }

        // Handle inequality checks with strings
        const neqMatch = condition.match(/^(.+?)\s*!=\s*['"](.+?)['"]$/);
        if (neqMatch) {
            const field = neqMatch[1].trim();
            const expectedValue = neqMatch[2];
            const actualValue = getNestedValue(marketData, field);
            return String(actualValue) !== expectedValue;
        }

        // Handle numeric comparisons
        const numCompMatch = condition.match(/^(.+?)\s*(>=|<=|>|<)\s*(.+)$/);
        if (numCompMatch) {
            const field = numCompMatch[1].trim();
            const operator = numCompMatch[2];
            const compValue = Number(numCompMatch[3].trim());
            const actualValue = Number(getNestedValue(marketData, field));

            if (isNaN(actualValue) || isNaN(compValue)) {
                return false;
            }

            switch (operator) {
                case '>': return actualValue > compValue;
                case '<': return actualValue < compValue;
                case '>=': return actualValue >= compValue;
                case '<=': return actualValue <= compValue;
                default: return false;
            }
        }

        // Handle boolean field checks
        const boolMatch = condition.match(/^(.+?)\s*==\s*(true|false)$/);
        if (boolMatch) {
            const field = boolMatch[1].trim();
            const expectedValue = boolMatch[2] === 'true';
            const actualValue = getNestedValue(marketData, field);
            return Boolean(actualValue) === expectedValue;
        }

        // Default: check if field exists and is truthy
        const value = getNestedValue(marketData, condition.trim());
        return Boolean(value);

    } catch (error) {
        // If evaluation fails, return false
        return false;
    }
}

/**
 * Evaluates a formula expression with market data
 * Supports basic arithmetic: +, -, *, /, and field references
 *
 * @param marketData - The market data object
 * @param formula - Formula string (e.g., "10 * contractMultiplier", "amount / price")
 * @returns The calculated value
 */
function evaluateFormula(marketData: any, formula: string): number | undefined {
    if (!formula) {
        return undefined;
    }

    try {
        // Replace field references with their values
        let expression = formula;

        // Find all field references (words that aren't operators or numbers)
        const fieldPattern = /[a-zA-Z_][a-zA-Z0-9_.[\]]*(?!\s*[=!<>])/g;
        const fields = formula.match(fieldPattern) || [];

        // Replace each field with its value
        for (const field of fields) {
            // Skip if it's a JavaScript keyword or operator
            if (['true', 'false', 'null', 'undefined', 'NaN'].includes(field)) {
                continue;
            }

            const value = getNestedValue(marketData, field);
            if (value !== undefined && value !== null) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    // Use a regex to replace the field name with its value
                    // Make sure we don't replace parts of other field names
                    const regex = new RegExp(`\\b${field}\\b`, 'g');
                    expression = expression.replace(regex, String(numValue));
                }
            }
        }

        // Evaluate the arithmetic expression
        // For security, we only allow basic arithmetic operators
        if (/^[\d\s+\-*/.()]+$/.test(expression)) {
            // eslint-disable-next-line no-eval
            const result = eval(expression);
            return Number(result);
        }

        return undefined;
    } catch (error) {
        return undefined;
    }
}
