/**
 * Symbol Derivation Logic
 * Derives CCXT unified symbols from exchange-specific market data
 */

import type {
    SymbolMapping,
    ContractTypeDerivation,
    LinearInverseDerivation,
    LegDerivation,
    MarketType,
} from '../types/edl.js';

/**
 * Derives a CCXT unified symbol from exchange market data
 *
 * @param marketData - Raw market data from the exchange
 * @param mapping - Symbol mapping configuration from EDL
 * @returns The unified CCXT symbol string (e.g., "BTC/USDT", "BTC/USDT:USDT")
 */
export function deriveSymbol(marketData: any, mapping: SymbolMapping): string {
    const { base, quote } = deriveBaseQuote(marketData, mapping);
    const settle = deriveSettleCurrency(marketData, mapping);

    // Apply the template
    let symbol = mapping.template
        .replace('{base}', base)
        .replace('{quote}', quote);

    if (settle && mapping.template.includes('{settle}')) {
        symbol = symbol.replace('{settle}', settle);
    } else if (settle) {
        // If settle exists but template doesn't include it, append with colon
        symbol = `${symbol}:${settle}`;
    }

    return symbol;
}

/**
 * Derives base and quote currencies from exchange market ID or data
 *
 * @param marketData - Raw market data from the exchange
 * @param mapping - Symbol mapping configuration
 * @returns Object containing base and quote currency codes
 */
export function deriveBaseQuote(
    marketData: any,
    mapping: SymbolMapping
): { base: string; quote: string } {
    let baseId: string = '';
    let quoteId: string = '';

    // Extract base and quote IDs from the market data using configured paths
    if (mapping.baseIdPath) {
        baseId = getNestedValue(marketData, mapping.baseIdPath) || '';
    } else {
        // Fallback: try to parse from the market ID
        const id = marketData.id || marketData.symbol || '';
        const separator = mapping.separator || '';

        if (separator && id.includes(separator)) {
            const parts = id.split(separator);
            baseId = parts[0] || '';
            quoteId = parts[1] || '';
        } else {
            // Try common patterns for exchanges without separators
            baseId = marketData.baseAsset || marketData.base || '';
            quoteId = marketData.quoteAsset || marketData.quote || '';
        }
    }

    if (mapping.quoteIdPath) {
        quoteId = getNestedValue(marketData, mapping.quoteIdPath) || '';
    }

    // Normalize currency codes (typically uppercase)
    const base = normalizeCurrencyCode(baseId);
    const quote = normalizeCurrencyCode(quoteId);

    return { base, quote };
}

/**
 * Derives the settlement currency for derivative contracts
 *
 * @param marketData - Raw market data from the exchange
 * @param mapping - Symbol mapping configuration
 * @returns Settlement currency code or undefined if not applicable
 */
export function deriveSettleCurrency(
    marketData: any,
    mapping: SymbolMapping
): string | undefined {
    if (!mapping.settleIdPath) {
        return undefined;
    }

    const settleId = getNestedValue(marketData, mapping.settleIdPath);

    if (!settleId) {
        return undefined;
    }

    return normalizeCurrencyCode(settleId);
}

/**
 * Derives the market type from raw market data
 *
 * @param marketData - Raw market data from the exchange
 * @param derivation - Contract type derivation rules
 * @returns The market type
 */
export function deriveMarketType(
    marketData: any,
    derivation: ContractTypeDerivation
): MarketType {
    // Check each condition in order of specificity
    if (derivation.optionCondition && evaluateCondition(marketData, derivation.optionCondition)) {
        return 'option';
    }

    if (derivation.futureCondition && evaluateCondition(marketData, derivation.futureCondition)) {
        return 'future';
    }

    if (derivation.swapCondition && evaluateCondition(marketData, derivation.swapCondition)) {
        return 'swap';
    }

    if (derivation.marginCondition && evaluateCondition(marketData, derivation.marginCondition)) {
        return 'margin';
    }

    if (derivation.spotCondition && evaluateCondition(marketData, derivation.spotCondition)) {
        return 'spot';
    }

    // Default to spot if no conditions match
    return 'spot';
}

/**
 * Determines if a contract is linear (settled in quote/stablecoin)
 *
 * @param marketData - Raw market data from the exchange
 * @param derivation - Linear/inverse derivation rules
 * @returns True if the contract is linear
 */
export function isLinear(
    marketData: any,
    derivation: LinearInverseDerivation
): boolean {
    // Check linear condition first
    if (derivation.linearCondition && evaluateCondition(marketData, derivation.linearCondition)) {
        return true;
    }

    // Check inverse condition
    if (derivation.inverseCondition && evaluateCondition(marketData, derivation.inverseCondition)) {
        return false;
    }

    // Default to linear if no conditions specified
    return true;
}

/**
 * Determines if a contract is inverse (settled in base currency)
 *
 * @param marketData - Raw market data from the exchange
 * @param derivation - Linear/inverse derivation rules
 * @returns True if the contract is inverse
 */
export function isInverse(
    marketData: any,
    derivation: LinearInverseDerivation
): boolean {
    return !isLinear(marketData, derivation);
}

/**
 * Determines if a contract is quanto (settled in third currency)
 *
 * @param marketData - Raw market data from the exchange
 * @param derivation - Linear/inverse derivation rules
 * @returns True if the contract is quanto
 */
export function isQuanto(
    marketData: any,
    derivation: LinearInverseDerivation
): boolean {
    if (derivation.quantoCondition && evaluateCondition(marketData, derivation.quantoCondition)) {
        return true;
    }

    return false;
}

/**
 * Derives option-specific properties (strike, expiry, option type)
 *
 * @param marketData - Raw market data from the exchange
 * @param derivation - Leg derivation rules for options
 * @returns Object containing strike, expiry, and option type
 */
export function deriveOptionProperties(
    marketData: any,
    derivation: LegDerivation
): {
    strike?: number;
    expiry?: number;
    optionType?: 'call' | 'put';
} {
    const result: {
        strike?: number;
        expiry?: number;
        optionType?: 'call' | 'put';
    } = {};

    // Derive strike price
    if (derivation.strikePathOrFormula) {
        const strikeValue = evaluatePathOrFormula(marketData, derivation.strikePathOrFormula);
        if (strikeValue !== undefined && strikeValue !== null) {
            result.strike = Number(strikeValue);
        }
    }

    // Derive expiry
    if (derivation.expiryPathOrFormula) {
        const expiryValue = evaluatePathOrFormula(marketData, derivation.expiryPathOrFormula);
        if (expiryValue !== undefined && expiryValue !== null) {
            result.expiry = Number(expiryValue);
        }
    }

    // Derive option type (call/put)
    if (derivation.optionTypePathOrFormula) {
        const optionTypeValue = evaluatePathOrFormula(marketData, derivation.optionTypePathOrFormula);
        if (optionTypeValue) {
            const normalized = String(optionTypeValue).toLowerCase();
            if (normalized === 'call' || normalized === 'c') {
                result.optionType = 'call';
            } else if (normalized === 'put' || normalized === 'p') {
                result.optionType = 'put';
            }
        }
    }

    return result;
}

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
    let normalized = code.toUpperCase();

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
 * Evaluates a path or formula to extract a value
 *
 * @param marketData - The market data object
 * @param pathOrFormula - Either a simple path or a formula expression
 * @returns The evaluated value
 */
function evaluatePathOrFormula(marketData: any, pathOrFormula: string): any {
    if (!pathOrFormula) {
        return undefined;
    }

    // Check if it's a formula (contains operators or functions)
    if (pathOrFormula.includes('+') ||
        pathOrFormula.includes('-') ||
        pathOrFormula.includes('*') ||
        pathOrFormula.includes('/') ||
        pathOrFormula.includes('(')) {
        // For now, return undefined for formulas - can be enhanced later
        return undefined;
    }

    // Otherwise, treat it as a path
    return getNestedValue(marketData, pathOrFormula);
}
