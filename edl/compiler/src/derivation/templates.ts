/**
 * Derivation Templates
 * Provides template-based derivation rules for different market types
 */

import type { MarketType, MarketDefinition } from '../types/edl.js';
import type { MarketDerivationRules } from './market.js';
import type { OptionDerivationRules } from './options.js';
import { deriveMarketDetails } from './market.js';
import { deriveFullOptionDetails } from './options.js';

// ============================================================
// Template Types
// ============================================================

/**
 * Model template for deriving market data
 */
export interface ModelTemplate {
    /** Market type this template applies to */
    marketType: MarketType;
    /** Name/identifier for this template */
    name: string;
    /** Description of what this template does */
    description?: string;
    /** Market derivation rules */
    marketRules: MarketDerivationRules;
    /** Option-specific derivation rules (for option markets) */
    optionRules?: OptionDerivationRules;
    /** Additional field mappings */
    fieldMappings?: Record<string, FieldMapping>;
    /** Post-processing functions to apply after derivation */
    postProcess?: PostProcessFunction[];
}

/**
 * Field mapping for custom field extraction
 */
export interface FieldMapping {
    /** Path to extract from market data */
    path?: string;
    /** Formula to compute the value */
    formula?: string;
    /** Literal value to assign */
    literal?: any;
    /** Conditional mapping */
    conditional?: {
        /** Condition to evaluate */
        if: string;
        /** Mapping if condition is true */
        then: FieldMapping;
        /** Mapping if condition is false */
        else?: FieldMapping;
    };
    /** Default value if extraction fails */
    default?: any;
    /** Transform function name to apply */
    transform?: string;
}

/**
 * Post-processing function signature
 */
export type PostProcessFunction = (market: Partial<MarketDefinition>, rawData: any) => Partial<MarketDefinition>;

/**
 * Template resolution result
 */
export interface TemplateResolution {
    /** Resolved market definition */
    market: Partial<MarketDefinition>;
    /** Template that was applied */
    template: ModelTemplate;
    /** Any errors encountered during resolution */
    errors?: string[];
}

// ============================================================
// Pre-defined Market Templates
// ============================================================

/**
 * Standard spot market template
 */
export const SPOT_TEMPLATE: ModelTemplate = {
    marketType: 'spot',
    name: 'standard-spot',
    description: 'Standard spot market template',
    marketRules: {
        symbolMapping: {
            template: '{base}/{quote}',
            baseIdPath: 'base',
            quoteIdPath: 'quote',
            contractTypeDerivation: {
                spotCondition: 'type == "spot"'
            }
        },
        contractSize: {
            default: null
        },
        flags: {
            activeCondition: 'active == true'
        }
    }
};

/**
 * Standard futures market template
 */
export const FUTURES_TEMPLATE: ModelTemplate = {
    marketType: 'future',
    name: 'standard-futures',
    description: 'Standard futures market template',
    marketRules: {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'base',
            quoteIdPath: 'quote',
            settleIdPath: 'settle',
            contractTypeDerivation: {
                futureCondition: 'type == "future"'
            },
            linearInverseDerivation: {
                linearCondition: 'linear == true',
                inverseCondition: 'inverse == true'
            }
        },
        contractSize: {
            path: 'contractSize'
        },
        settlement: {
            settleCurrencyPath: 'settle',
            expiryPath: 'expiry',
            expiryDatetimePath: 'expiryDatetime'
        },
        flags: {
            contractCondition: 'contract == true',
            activeCondition: 'active == true'
        }
    }
};

/**
 * Standard swap (perpetual) market template
 */
export const SWAP_TEMPLATE: ModelTemplate = {
    marketType: 'swap',
    name: 'standard-swap',
    description: 'Standard perpetual swap template',
    marketRules: {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'base',
            quoteIdPath: 'quote',
            settleIdPath: 'settle',
            contractTypeDerivation: {
                swapCondition: 'type == "swap"'
            },
            linearInverseDerivation: {
                linearCondition: 'linear == true',
                inverseCondition: 'inverse == true',
                quantoCondition: 'quanto == true'
            }
        },
        contractSize: {
            path: 'contractSize'
        },
        settlement: {
            settleCurrencyPath: 'settle'
        },
        flags: {
            contractCondition: 'contract == true',
            activeCondition: 'active == true'
        }
    }
};

/**
 * Standard options market template
 */
export const OPTIONS_TEMPLATE: ModelTemplate = {
    marketType: 'option',
    name: 'standard-options',
    description: 'Standard options market template',
    marketRules: {
        symbolMapping: {
            template: '{base}/{quote}:{settle}',
            baseIdPath: 'base',
            quoteIdPath: 'quote',
            settleIdPath: 'settle',
            contractTypeDerivation: {
                optionCondition: 'type == "option"'
            },
            legDerivation: {
                strikePathOrFormula: 'strike',
                expiryPathOrFormula: 'expiry',
                optionTypePathOrFormula: 'optionType'
            }
        },
        contractSize: {
            path: 'contractSize'
        },
        settlement: {
            settleCurrencyPath: 'settle',
            expiryPath: 'expiry',
            expiryDatetimePath: 'expiryDatetime'
        },
        flags: {
            contractCondition: 'contract == true',
            activeCondition: 'active == true'
        }
    },
    optionRules: {
        strike: {
            strikePath: 'strike'
        },
        expiry: {
            expiryPath: 'expiry',
            expiryFormat: 'timestamp'
        },
        optionType: {
            typePath: 'optionType',
            callValue: ['call', 'C'],
            putValue: ['put', 'P']
        }
    }
};

// ============================================================
// Template Registry
// ============================================================

/**
 * Global template registry
 */
const templateRegistry = new Map<string, ModelTemplate>();

// Register default templates
templateRegistry.set('spot', SPOT_TEMPLATE);
templateRegistry.set('future', FUTURES_TEMPLATE);
templateRegistry.set('futures', FUTURES_TEMPLATE); // Alias
templateRegistry.set('swap', SWAP_TEMPLATE);
templateRegistry.set('perpetual', SWAP_TEMPLATE); // Alias
templateRegistry.set('option', OPTIONS_TEMPLATE);
templateRegistry.set('options', OPTIONS_TEMPLATE); // Alias

/**
 * Register a custom template
 */
export function registerTemplate(name: string, template: ModelTemplate): void {
    templateRegistry.set(name, template);
}

/**
 * Get a template by name
 */
export function getTemplate(name: string): ModelTemplate | undefined {
    return templateRegistry.get(name);
}

/**
 * Get all registered templates
 */
export function getAllTemplates(): Map<string, ModelTemplate> {
    return new Map(templateRegistry);
}

/**
 * Clear all templates (useful for testing)
 */
export function clearTemplates(): void {
    templateRegistry.clear();
}

// ============================================================
// Template Application
// ============================================================

/**
 * Apply a template to market data
 */
export function applyTemplate(
    marketData: any,
    template: ModelTemplate | string
): TemplateResolution {
    const errors: string[] = [];

    // Resolve template if string name is provided
    let resolvedTemplate: ModelTemplate;
    if (typeof template === 'string') {
        const found = getTemplate(template);
        if (!found) {
            errors.push(`Template "${template}" not found`);
            return {
                market: {},
                template: SPOT_TEMPLATE, // Fallback
                errors
            };
        }
        resolvedTemplate = found;
    } else {
        resolvedTemplate = template;
    }

    // Derive market details using market rules
    let market = deriveMarketDetails(marketData, resolvedTemplate.marketRules);

    // Derive option details if this is an option template
    if (resolvedTemplate.optionRules && resolvedTemplate.marketType === 'option') {
        try {
            const optionDetails = deriveFullOptionDetails(marketData, resolvedTemplate.optionRules);
            market = { ...market, ...optionDetails };
        } catch (error) {
            errors.push(`Failed to derive option details: ${error}`);
        }
    }

    // Apply additional field mappings
    if (resolvedTemplate.fieldMappings) {
        for (const [fieldName, mapping] of Object.entries(resolvedTemplate.fieldMappings)) {
            try {
                const value = applyFieldMapping(marketData, mapping, market);
                if (value !== undefined) {
                    (market as any)[fieldName] = value;
                }
            } catch (error) {
                errors.push(`Failed to apply mapping for field "${fieldName}": ${error}`);
            }
        }
    }

    // Apply post-processing functions
    if (resolvedTemplate.postProcess) {
        for (const postProcessFn of resolvedTemplate.postProcess) {
            try {
                market = postProcessFn(market, marketData);
            } catch (error) {
                errors.push(`Post-processing failed: ${error}`);
            }
        }
    }

    return {
        market,
        template: resolvedTemplate,
        errors: errors.length > 0 ? errors : undefined
    };
}

/**
 * Apply multiple templates to market data
 */
export function applyTemplates(
    marketData: any,
    templates: Array<ModelTemplate | string>
): TemplateResolution[] {
    return templates.map(template => applyTemplate(marketData, template));
}

/**
 * Apply the best matching template based on market type
 */
export function applyBestTemplate(marketData: any): TemplateResolution {
    // Try to determine market type from data
    const type = marketData.type || marketData.marketType || 'spot';

    // Get the appropriate template
    const template = getTemplate(type) || SPOT_TEMPLATE;

    return applyTemplate(marketData, template);
}

// ============================================================
// Field Mapping Resolution
// ============================================================

/**
 * Apply a field mapping to extract a value
 */
export function applyFieldMapping(
    marketData: any,
    mapping: FieldMapping,
    derivedMarket?: Partial<MarketDefinition>
): any {
    // Handle conditional mapping
    if (mapping.conditional) {
        const condition = evaluateCondition(marketData, mapping.conditional.if, derivedMarket);
        const nextMapping = condition ? mapping.conditional.then : mapping.conditional.else;
        if (!nextMapping) {
            return mapping.default;
        }
        return applyFieldMapping(marketData, nextMapping, derivedMarket);
    }

    // Handle literal value
    if (mapping.literal !== undefined) {
        return mapping.literal;
    }

    // Handle path extraction
    if (mapping.path) {
        let value = getNestedValue(marketData, mapping.path);

        // Try derived market if not found in raw data
        if (value === undefined && derivedMarket) {
            value = getNestedValue(derivedMarket, mapping.path);
        }

        // Apply transform if specified
        if (value !== undefined && mapping.transform) {
            value = applyTransform(value, mapping.transform);
        }

        return value !== undefined ? value : mapping.default;
    }

    // Handle formula evaluation
    if (mapping.formula) {
        try {
            const value = evaluateFormula(marketData, mapping.formula);
            return value !== undefined ? value : mapping.default;
        } catch (error) {
            return mapping.default;
        }
    }

    return mapping.default;
}

// ============================================================
// Template Composition
// ============================================================

/**
 * Merge multiple templates into one
 */
export function mergeTemplates(
    base: ModelTemplate,
    ...overrides: Partial<ModelTemplate>[]
): ModelTemplate {
    let merged = { ...base };

    for (const override of overrides) {
        merged = {
            ...merged,
            ...override,
            marketRules: {
                ...merged.marketRules,
                ...(override.marketRules || {}),
                symbolMapping: {
                    ...merged.marketRules.symbolMapping,
                    ...(override.marketRules?.symbolMapping || {})
                }
            },
            optionRules: override.optionRules
                ? {
                    ...merged.optionRules,
                    ...override.optionRules
                }
                : merged.optionRules,
            fieldMappings: {
                ...merged.fieldMappings,
                ...(override.fieldMappings || {})
            },
            postProcess: [
                ...(merged.postProcess || []),
                ...(override.postProcess || [])
            ]
        };
    }

    return merged;
}

/**
 * Create a custom template by extending a base template
 */
export function extendTemplate(
    baseTemplateName: string,
    customizations: Partial<ModelTemplate>
): ModelTemplate {
    const baseTemplate = getTemplate(baseTemplateName);
    if (!baseTemplate) {
        throw new Error(`Base template "${baseTemplateName}" not found`);
    }

    return mergeTemplates(baseTemplate, customizations);
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Gets a nested value from an object using a path string
 */
function getNestedValue(obj: any, path: string): any {
    if (!path || !obj) {
        return undefined;
    }

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
 * Evaluates a simple condition
 */
function evaluateCondition(
    marketData: any,
    condition: string,
    derivedMarket?: Partial<MarketDefinition>
): boolean {
    if (!condition) {
        return false;
    }

    try {
        // Handle null checks
        if (condition.includes('!= null')) {
            const field = condition.replace('!= null', '').trim();
            let value = getNestedValue(marketData, field);
            if (value === undefined && derivedMarket) {
                value = getNestedValue(derivedMarket, field);
            }
            return value !== null && value !== undefined;
        }

        if (condition.includes('== null')) {
            const field = condition.replace('== null', '').trim();
            let value = getNestedValue(marketData, field);
            if (value === undefined && derivedMarket) {
                value = getNestedValue(derivedMarket, field);
            }
            return value === null || value === undefined;
        }

        // Handle equality checks with strings
        const eqMatch = condition.match(/^(.+?)\s*==\s*['"](.+?)['"]$/);
        if (eqMatch) {
            const field = eqMatch[1].trim();
            const expectedValue = eqMatch[2];
            let actualValue = getNestedValue(marketData, field);
            if (actualValue === undefined && derivedMarket) {
                actualValue = getNestedValue(derivedMarket, field);
            }
            return String(actualValue) === expectedValue;
        }

        // Handle boolean checks
        const boolMatch = condition.match(/^(.+?)\s*==\s*(true|false)$/);
        if (boolMatch) {
            const field = boolMatch[1].trim();
            const expectedValue = boolMatch[2] === 'true';
            let actualValue = getNestedValue(marketData, field);
            if (actualValue === undefined && derivedMarket) {
                actualValue = getNestedValue(derivedMarket, field);
            }
            return Boolean(actualValue) === expectedValue;
        }

        // Default: check if field exists and is truthy
        let value = getNestedValue(marketData, condition.trim());
        if (value === undefined && derivedMarket) {
            value = getNestedValue(derivedMarket, condition.trim());
        }
        return Boolean(value);
    } catch (error) {
        return false;
    }
}

/**
 * Evaluates a simple formula
 */
function evaluateFormula(marketData: any, formula: string): number | undefined {
    if (!formula) {
        return undefined;
    }

    try {
        let expression = formula;
        const fieldPattern = /[a-zA-Z_][a-zA-Z0-9_.[\]]*(?!\s*[=!<>])/g;
        const fields = formula.match(fieldPattern) || [];

        for (const field of fields) {
            if (['true', 'false', 'null', 'undefined', 'NaN'].includes(field)) {
                continue;
            }

            const value = getNestedValue(marketData, field);
            if (value !== undefined && value !== null) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    const regex = new RegExp(`\\b${field}\\b`, 'g');
                    expression = expression.replace(regex, String(numValue));
                }
            }
        }

        // Only allow safe arithmetic operators
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

/**
 * Apply a transformation to a value
 */
function applyTransform(value: any, transformName: string): any {
    const transforms: Record<string, (v: any) => any> = {
        uppercase: (v) => String(v).toUpperCase(),
        lowercase: (v) => String(v).toLowerCase(),
        number: (v) => Number(v),
        string: (v) => String(v),
        boolean: (v) => Boolean(v),
        parseFloat: (v) => parseFloat(String(v)),
        parseInt: (v) => parseInt(String(v), 10),
        trim: (v) => String(v).trim(),
        abs: (v) => Math.abs(Number(v)),
        floor: (v) => Math.floor(Number(v)),
        ceil: (v) => Math.ceil(Number(v)),
        round: (v) => Math.round(Number(v))
    };

    const transformFn = transforms[transformName];
    if (!transformFn) {
        return value;
    }

    try {
        return transformFn(value);
    } catch (error) {
        return value;
    }
}
