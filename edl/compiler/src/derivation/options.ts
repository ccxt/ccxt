/**
 * Options Derivation Logic
 * Derives option-specific properties including strikes, expiry, option type, and quanto legs
 */

import type { OptionType } from '../types/edl.js';

// ============================================================
// Option Derivation Types
// ============================================================

/**
 * Rules for deriving option strike price
 */
export interface OptionStrikeDerivation {
    /** Path to strike in market data */
    strikePath?: string;
    /** Formula to calculate strike */
    strikeFormula?: string;
    /** Multiplier for raw value */
    strikeMultiplier?: number;
    /** Decimal precision */
    strikePrecision?: number;
}

/**
 * Rules for deriving expiry date/time
 */
export interface ExpiryDerivation {
    /** Path to expiry in market data */
    expiryPath?: string;
    /** Format of expiry data */
    expiryFormat?: 'timestamp' | 'iso' | 'yymmdd' | 'custom';
    /** Pattern for custom format parsing */
    expiryPattern?: string;
}

/**
 * Rules for deriving option type (call/put)
 */
export interface OptionTypeDerivation {
    /** Path to option type in market data */
    typePath?: string;
    /** Values that mean 'call' */
    callValue?: string | string[];
    /** Values that mean 'put' */
    putValue?: string | string[];
}

/**
 * Rules for deriving quanto leg properties
 */
export interface QuantoLegDerivation {
    /** Path to quanto multiplier */
    quantoMultiplierPath?: string;
    /** Path to quanto currency */
    quantoCurrencyPath?: string;
    /** Path to quanto settlement currency */
    quantoSettlePath?: string;
    /** Condition to determine if quanto */
    isQuantoCondition?: string;
}

/**
 * Complete option derivation rules
 */
export interface OptionDerivationRules {
    strike: OptionStrikeDerivation;
    expiry: ExpiryDerivation;
    optionType: OptionTypeDerivation;
    quanto?: QuantoLegDerivation;
}

/**
 * Result of option derivation
 */
export interface OptionDetails {
    strike?: number;
    expiry?: number;
    expiryDatetime?: string;
    optionType?: OptionType;
    quantoMultiplier?: number;
    quantoCurrency?: string;
    quantoSettle?: string;
}

// ============================================================
// Strike Derivation
// ============================================================

/**
 * Derives option strike price from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Strike derivation rules
 * @returns The derived strike price or undefined
 */
export function deriveStrike(
    marketData: any,
    rules: OptionStrikeDerivation
): number | undefined {
    let rawStrike: any;

    // Try path-based extraction first
    if (rules.strikePath) {
        rawStrike = getNestedValue(marketData, rules.strikePath);
    }

    // Try formula-based calculation
    if (rawStrike === undefined && rules.strikeFormula) {
        rawStrike = evaluateFormula(marketData, rules.strikeFormula);
    }

    // Convert to number
    if (rawStrike === undefined || rawStrike === null) {
        return undefined;
    }

    let strike = Number(rawStrike);
    if (isNaN(strike)) {
        return undefined;
    }

    // Apply multiplier if specified
    if (rules.strikeMultiplier !== undefined) {
        strike = strike * rules.strikeMultiplier;
    }

    // Apply precision if specified
    if (rules.strikePrecision !== undefined) {
        strike = Number(strike.toFixed(rules.strikePrecision));
    }

    return strike;
}

// ============================================================
// Expiry Derivation
// ============================================================

/**
 * Derives option expiry from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Expiry derivation rules
 * @returns Object containing expiry timestamp and datetime string
 */
export function deriveExpiry(
    marketData: any,
    rules: ExpiryDerivation
): { expiry?: number; expiryDatetime?: string } {
    const result: { expiry?: number; expiryDatetime?: string } = {};

    if (!rules.expiryPath) {
        return result;
    }

    const rawExpiry = getNestedValue(marketData, rules.expiryPath);
    if (rawExpiry === undefined || rawExpiry === null) {
        return result;
    }

    const format = rules.expiryFormat || 'timestamp';

    switch (format) {
        case 'timestamp': {
            // Unix timestamp (seconds or milliseconds)
            const timestamp = Number(rawExpiry);
            if (!isNaN(timestamp)) {
                // Normalize to milliseconds
                const ms = timestamp > 10000000000 ? timestamp : timestamp * 1000;
                result.expiry = ms;
                result.expiryDatetime = new Date(ms).toISOString();
            }
            break;
        }

        case 'iso': {
            // ISO 8601 format (e.g., "2024-12-31T23:59:59Z")
            const date = new Date(String(rawExpiry));
            if (!isNaN(date.getTime())) {
                result.expiry = date.getTime();
                result.expiryDatetime = date.toISOString();
            }
            break;
        }

        case 'yymmdd': {
            // YYMMDD format (e.g., "241231")
            const parsed = parseYYMMDD(String(rawExpiry));
            if (parsed) {
                result.expiry = parsed.getTime();
                result.expiryDatetime = parsed.toISOString();
            }
            break;
        }

        case 'custom': {
            // Custom format with pattern
            if (rules.expiryPattern) {
                const parsed = parseCustomDate(String(rawExpiry), rules.expiryPattern);
                if (parsed) {
                    result.expiry = parsed.getTime();
                    result.expiryDatetime = parsed.toISOString();
                }
            }
            break;
        }
    }

    return result;
}

/**
 * Parses YYMMDD format date string
 *
 * @param dateStr - Date string in YYMMDD format
 * @returns Parsed Date object or undefined
 */
function parseYYMMDD(dateStr: string): Date | undefined {
    if (dateStr.length !== 6) {
        return undefined;
    }

    const yy = parseInt(dateStr.substring(0, 2), 10);
    const mm = parseInt(dateStr.substring(2, 4), 10);
    const dd = parseInt(dateStr.substring(4, 6), 10);

    if (isNaN(yy) || isNaN(mm) || isNaN(dd)) {
        return undefined;
    }

    // Assume 2000s for now (can be enhanced with pivot year logic)
    const year = 2000 + yy;
    const date = new Date(Date.UTC(year, mm - 1, dd));

    if (isNaN(date.getTime())) {
        return undefined;
    }

    return date;
}

/**
 * Parses custom date format using a pattern
 * Pattern tokens: YYYY, YY, MM, DD, HH, mm, ss
 *
 * @param dateStr - Date string
 * @param pattern - Format pattern
 * @returns Parsed Date object or undefined
 */
function parseCustomDate(dateStr: string, pattern: string): Date | undefined {
    try {
        const tokens: Record<string, number> = {};

        // Token definitions with priority (longer tokens first to avoid partial matches)
        const tokenDefs: Array<{ token: string; regex: string }> = [
            { token: 'YYYY', regex: '(\\d{4})' },
            { token: 'MM', regex: '(\\d{2})' },
            { token: 'DD', regex: '(\\d{2})' },
            { token: 'HH', regex: '(\\d{2})' },
            { token: 'mm', regex: '(\\d{2})' },
            { token: 'ss', regex: '(\\d{2})' },
            { token: 'YY', regex: '(\\d{2})' },
        ];

        let regex = pattern;
        const tokenOrder: string[] = [];

        // Build regex by replacing tokens in order, tracking which tokens are used
        for (const { token, regex: tokenRegex } of tokenDefs) {
            if (regex.includes(token)) {
                regex = regex.replace(token, tokenRegex);
                tokenOrder.push(token);
            }
        }

        const match = dateStr.match(new RegExp(`^${regex}$`));
        if (!match) {
            return undefined;
        }

        // Extract values from matched groups
        tokenOrder.forEach((token, index) => {
            tokens[token] = parseInt(match[index + 1], 10);
        });

        // Build date
        const year = tokens['YYYY'] || (tokens['YY'] ? 2000 + tokens['YY'] : 0);
        const month = (tokens['MM'] || 1) - 1;
        const day = tokens['DD'] || 1;
        const hours = tokens['HH'] || 0;
        const minutes = tokens['mm'] || 0;
        const seconds = tokens['ss'] || 0;

        const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

        if (isNaN(date.getTime())) {
            return undefined;
        }

        return date;
    } catch (error) {
        return undefined;
    }
}

// ============================================================
// Option Type Derivation
// ============================================================

/**
 * Derives option type (call or put) from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Option type derivation rules
 * @returns 'call', 'put', or undefined
 */
export function deriveOptionType(
    marketData: any,
    rules: OptionTypeDerivation
): OptionType | undefined {
    if (!rules.typePath) {
        return undefined;
    }

    const rawType = getNestedValue(marketData, rules.typePath);
    if (rawType === undefined || rawType === null) {
        return undefined;
    }

    const typeStr = String(rawType).toLowerCase();

    // Check call values
    const callValues = Array.isArray(rules.callValue)
        ? rules.callValue
        : rules.callValue
        ? [rules.callValue]
        : ['call', 'c'];

    for (const callValue of callValues) {
        if (typeStr === callValue.toLowerCase()) {
            return 'call';
        }
    }

    // Check put values
    const putValues = Array.isArray(rules.putValue)
        ? rules.putValue
        : rules.putValue
        ? [rules.putValue]
        : ['put', 'p'];

    for (const putValue of putValues) {
        if (typeStr === putValue.toLowerCase()) {
            return 'put';
        }
    }

    return undefined;
}

// ============================================================
// Quanto Derivation
// ============================================================

/**
 * Derives quanto multiplier from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Quanto leg derivation rules
 * @returns The quanto multiplier or undefined
 */
export function deriveQuantoMultiplier(
    marketData: any,
    rules?: QuantoLegDerivation
): number | undefined {
    if (!rules || !rules.quantoMultiplierPath) {
        return undefined;
    }

    const rawMultiplier = getNestedValue(marketData, rules.quantoMultiplierPath);
    if (rawMultiplier === undefined || rawMultiplier === null) {
        return undefined;
    }

    const multiplier = Number(rawMultiplier);
    if (isNaN(multiplier)) {
        return undefined;
    }

    return multiplier;
}

/**
 * Derives quanto currency from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Quanto leg derivation rules
 * @returns The quanto currency code or undefined
 */
export function deriveQuantoCurrency(
    marketData: any,
    rules?: QuantoLegDerivation
): string | undefined {
    if (!rules || !rules.quantoCurrencyPath) {
        return undefined;
    }

    const currency = getNestedValue(marketData, rules.quantoCurrencyPath);
    if (currency === undefined || currency === null) {
        return undefined;
    }

    return String(currency).toUpperCase();
}

/**
 * Derives quanto settlement currency from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Quanto leg derivation rules
 * @returns The quanto settlement currency code or undefined
 */
export function deriveQuantoSettle(
    marketData: any,
    rules?: QuantoLegDerivation
): string | undefined {
    if (!rules || !rules.quantoSettlePath) {
        return undefined;
    }

    const settle = getNestedValue(marketData, rules.quantoSettlePath);
    if (settle === undefined || settle === null) {
        return undefined;
    }

    return String(settle).toUpperCase();
}

// ============================================================
// Comprehensive Option Derivation
// ============================================================

/**
 * Derives complete option details from market data
 *
 * @param marketData - Raw market data from the exchange
 * @param rules - Complete option derivation rules
 * @returns Object containing all derived option properties
 */
export function deriveFullOptionDetails(
    marketData: any,
    rules: OptionDerivationRules
): OptionDetails {
    const result: OptionDetails = {};

    // Derive strike
    result.strike = deriveStrike(marketData, rules.strike);

    // Derive expiry
    const expiryResult = deriveExpiry(marketData, rules.expiry);
    result.expiry = expiryResult.expiry;
    result.expiryDatetime = expiryResult.expiryDatetime;

    // Derive option type
    result.optionType = deriveOptionType(marketData, rules.optionType);

    // Derive quanto properties if specified
    if (rules.quanto) {
        result.quantoMultiplier = deriveQuantoMultiplier(marketData, rules.quanto);
        result.quantoCurrency = deriveQuantoCurrency(marketData, rules.quanto);
        result.quantoSettle = deriveQuantoSettle(marketData, rules.quanto);
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
