/**
 * Rate Limit Configuration Parsing
 * Parses and processes rate limit configurations from YAML/JSON sources
 */

import type {
    RateLimitSchema,
    GlobalRateLimitSchema,
    EndpointRateLimitSchema,
    RateLimitGroupSchema,
    ThrottleConfig,
    RateLimitStrategy,
    CostUnit,
    RateLimitValidationResult,
    EndpointCostMetadata,
    RawCostConfig,
} from '../schemas/rate-limits.js';
import {
    validateRateLimitSchema,
    calculateRequestCost,
    createDefaultRateLimitSchema,
    normalizeCostConfig,
} from '../schemas/rate-limits.js';

// ============================================================
// Parser Configuration Types
// ============================================================

/**
 * Source format for rate limit configuration
 */
export type RateLimitSourceFormat = 'yaml' | 'json' | 'object';

/**
 * Options for rate limit parser
 */
export interface RateLimitParserOptions {
    /** Whether to validate the schema after parsing */
    validate?: boolean;

    /** Whether to apply defaults for missing values */
    applyDefaults?: boolean;

    /** Whether to merge with a base schema */
    baseSchema?: RateLimitSchema;

    /** Strict mode: reject unknown properties */
    strict?: boolean;
}

/**
 * Parse result with metadata
 */
export interface RateLimitParseResult {
    /** Parsed rate limit schema */
    schema: RateLimitSchema;

    /** Validation result (if validation was requested) */
    validation?: RateLimitValidationResult;

    /** Source format detected */
    sourceFormat: RateLimitSourceFormat;

    /** Whether defaults were applied */
    defaultsApplied: boolean;

    /** Warnings during parsing */
    warnings: string[];
}

// ============================================================
// Rate Limit Parser Class
// ============================================================

/**
 * Parser for rate limit configurations
 * Supports YAML, JSON, and object inputs
 */
export class RateLimitParser {
    private options: Required<RateLimitParserOptions>;

    constructor(options: RateLimitParserOptions = {}) {
        this.options = {
            validate: options.validate ?? true,
            applyDefaults: options.applyDefaults ?? true,
            baseSchema: options.baseSchema ?? createDefaultRateLimitSchema(),
            strict: options.strict ?? false,
        };
    }

    /**
     * Parse rate limit configuration from various sources
     * @param source - Configuration source (string or object)
     * @param format - Optional format hint
     * @returns Parsed rate limit schema with metadata
     */
    parse(source: string | object, format?: RateLimitSourceFormat): RateLimitParseResult {
        const warnings: string[] = [];
        let sourceFormat: RateLimitSourceFormat;
        let parsed: any;

        // Detect and parse source format
        if (typeof source === 'string') {
            const trimmed = source.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                sourceFormat = 'json';
                try {
                    parsed = JSON.parse(trimmed);
                } catch (error) {
                    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
                }
            } else {
                sourceFormat = format || 'yaml';
                // For YAML, we'd need a YAML parser library
                // For now, we'll treat it as an error
                throw new Error('YAML parsing requires a YAML parser library. Please pass JSON or object.');
            }
        } else {
            sourceFormat = 'object';
            parsed = source;
        }

        // Build schema from parsed data
        const schema = this.buildSchema(parsed, warnings);

        // Apply defaults if requested
        let defaultsApplied = false;
        if (this.options.applyDefaults) {
            this.applyDefaults(schema);
            defaultsApplied = true;
        }

        // Validate if requested
        let validation: RateLimitValidationResult | undefined;
        if (this.options.validate) {
            validation = validateRateLimitSchema(schema);
            if (!validation.valid) {
                warnings.push(...validation.errors.map(e => `${e.path}: ${e.message}`));
            }
            warnings.push(...validation.warnings.map(w => `${w.path}: ${w.message}`));
        }

        return {
            schema,
            validation,
            sourceFormat,
            defaultsApplied,
            warnings,
        };
    }

    /**
     * Parse from JSON string or object
     * @param source - JSON string or object
     * @returns Parsed schema
     */
    parseJSON(source: string | object): RateLimitParseResult {
        if (typeof source === 'string') {
            return this.parse(source, 'json');
        }
        return this.parse(source, 'object');
    }

    /**
     * Build rate limit schema from parsed data
     * @param data - Parsed configuration data
     * @param warnings - Array to collect warnings
     * @returns Rate limit schema
     */
    private buildSchema(data: any, warnings: string[]): RateLimitSchema {
        if (!data || typeof data !== 'object') {
            throw new Error('Rate limit configuration must be an object');
        }

        const schema: RateLimitSchema = {
            global: this.parseGlobalConfig(data.global, warnings),
        };

        // Parse optional sections
        if (data.endpoints) {
            schema.endpoints = this.parseEndpoints(data.endpoints, warnings);
        }

        if (data.groups) {
            schema.groups = this.parseGroups(data.groups, warnings);
        }

        if (data.throttle) {
            schema.throttle = this.parseThrottle(data.throttle, warnings);
        }

        if (data.version) {
            schema.version = String(data.version);
        }

        // Check for unknown properties in strict mode
        if (this.options.strict) {
            const knownKeys = ['global', 'endpoints', 'groups', 'throttle', 'version'];
            for (const key of Object.keys(data)) {
                if (!knownKeys.includes(key)) {
                    warnings.push(`Unknown property: ${key}`);
                }
            }
        }

        return schema;
    }

    /**
     * Parse global rate limit configuration
     * @param data - Global config data
     * @param warnings - Warnings array
     * @returns Global rate limit schema
     */
    private parseGlobalConfig(data: any, warnings: string[]): GlobalRateLimitSchema {
        if (!data || typeof data !== 'object') {
            throw new Error('Global rate limit configuration is required');
        }

        const global: GlobalRateLimitSchema = {
            defaultLimit: this.parseNumber(data.defaultLimit, 'global.defaultLimit'),
            windowMs: this.parseNumber(data.windowMs, 'global.windowMs'),
            strategy: this.parseStrategy(data.strategy, 'global.strategy'),
        };

        // Parse optional fields
        if (data.burstLimit !== undefined) {
            global.burstLimit = this.parseNumber(data.burstLimit, 'global.burstLimit');
        }

        if (data.costUnit !== undefined) {
            global.costUnit = this.parseCostUnit(data.costUnit, 'global.costUnit');
        }

        if (data.description !== undefined) {
            global.description = String(data.description);
        }

        return global;
    }

    /**
     * Parse endpoint rate limit configurations
     * @param data - Endpoints config data
     * @param warnings - Warnings array
     * @returns Endpoint configurations
     */
    private parseEndpoints(
        data: any,
        warnings: string[]
    ): Record<string, EndpointRateLimitSchema> {
        if (typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Endpoints configuration must be an object');
        }

        const endpoints: Record<string, EndpointRateLimitSchema> = {};

        for (const [path, config] of Object.entries(data)) {
            if (!config || typeof config !== 'object') {
                warnings.push(`Invalid endpoint configuration for ${path}`);
                continue;
            }

            let parsedCost: number | undefined;
            if ((config as any).cost !== undefined) {
                parsedCost = this.parseNumber((config as any).cost, `endpoints.${path}.cost`);
            }

            let parsedMetadata: EndpointCostMetadata | undefined;
            if ((config as any).costMetadata !== undefined) {
                parsedMetadata = this.parseCostMetadata(
                    (config as any).costMetadata,
                    `endpoints.${path}.costMetadata`
                );

                if (parsedCost === undefined && parsedMetadata?.defaultCost !== undefined) {
                    parsedCost = parsedMetadata.defaultCost;
                }
            }

            if (parsedCost === undefined) {
                throw new Error(`endpoints.${path}.cost is required`);
            }

            const endpointConfig: EndpointRateLimitSchema = {
                cost: parsedCost,
            };

            if (parsedMetadata) {
                endpointConfig.costMetadata = parsedMetadata;
            }

            // Parse optional fields
            if ((config as any).limit !== undefined) {
                endpointConfig.limit = this.parseNumber(
                    (config as any).limit,
                    `endpoints.${path}.limit`
                );
            }

            if ((config as any).windowMs !== undefined) {
                endpointConfig.windowMs = this.parseNumber(
                    (config as any).windowMs,
                    `endpoints.${path}.windowMs`
                );
            }

            if ((config as any).group !== undefined) {
                endpointConfig.group = String((config as any).group);
            }

            if ((config as any).description !== undefined) {
                endpointConfig.description = String((config as any).description);
            }

            if ((config as any).strategy !== undefined) {
                endpointConfig.strategy = this.parseStrategy(
                    (config as any).strategy,
                    `endpoints.${path}.strategy`
                );
            }

            endpoints[path] = endpointConfig;
        }

        return endpoints;
    }

    /**
     * Parse cost metadata configuration
     * @param data - Raw metadata definition
     * @param path - Error path
     * @returns Parsed cost metadata
     */
    private parseCostMetadata(data: any, path: string): EndpointCostMetadata {
        if (!data || typeof data !== 'object') {
            throw new Error(`${path} must be an object`);
        }

        const metadata: EndpointCostMetadata = {};

        if (data.default !== undefined) {
            metadata.defaultCost = this.parseNumber(data.default, `${path}.default`);
        }

        if (data.defaultCost !== undefined) {
            metadata.defaultCost = this.parseNumber(data.defaultCost, `${path}.defaultCost`);
        }

        if (data.byParam) {
            if (typeof data.byParam !== 'object' || Array.isArray(data.byParam)) {
                throw new Error(`${path}.byParam must be an object`);
            }

            metadata.paramCosts = Object.entries(data.byParam).map(([param, value]) => ({
                param,
                cost: this.parseNumber(value, `${path}.byParam.${param}`),
                when: 'present' as const,
            }));
        }

        if (data.paramCosts) {
            if (!Array.isArray(data.paramCosts)) {
                throw new Error(`${path}.paramCosts must be an array`);
            }
            const extraRules = data.paramCosts.map((rule: any, index: number) => ({
                param: this.parseString(rule.param, `${path}.paramCosts[${index}].param`),
                cost: this.parseNumber(rule.cost, `${path}.paramCosts[${index}].cost`),
                when: rule.when === 'absent' ? 'absent' : 'present',
            }));
            metadata.paramCosts = [...(metadata.paramCosts ?? []), ...extraRules];
        }

        if (data.byLimit) {
            if (!Array.isArray(data.byLimit)) {
                throw new Error(`${path}.byLimit must be an array`);
            }

            const tiers = data.byLimit.map((entry: any, index: number) => {
                if (!Array.isArray(entry) || entry.length < 2) {
                    throw new Error(`${path}.byLimit[${index}] must be a [threshold, cost] tuple`);
                }
                return {
                    threshold: this.parseNumber(entry[0], `${path}.byLimit[${index}][0]`),
                    cost: this.parseNumber(entry[1], `${path}.byLimit[${index}][1]`),
                };
            });

            metadata.limitCosts = {
                param: typeof data.limitParam === 'string' ? data.limitParam : 'limit',
                operator: data.operator === 'gte' || data.limitOperator === 'gte' ? 'gte' : 'lte',
                tiers,
            };
        }

        if (data.conditions) {
            if (!Array.isArray(data.conditions)) {
                throw new Error(`${path}.conditions must be an array`);
            }

            metadata.conditionalCosts = data.conditions.map((condition: any, index: number) => ({
                when: condition.when,
                cost: this.parseNumber(condition.cost, `${path}.conditions[${index}].cost`),
                description: condition.description ? String(condition.description) : undefined,
            }));
        }

        return metadata;
    }

    /**
     * Parse rate limit groups
     * @param data - Groups config data
     * @param warnings - Warnings array
     * @returns Rate limit groups
     */
    private parseGroups(data: any, warnings: string[]): RateLimitGroupSchema[] {
        if (!Array.isArray(data)) {
            throw new Error('Groups configuration must be an array');
        }

        const groups: RateLimitGroupSchema[] = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (!item || typeof item !== 'object') {
                warnings.push(`Invalid group configuration at index ${i}`);
                continue;
            }

            const group: RateLimitGroupSchema = {
                name: this.parseString(item.name, `groups[${i}].name`),
                limit: this.parseNumber(item.limit, `groups[${i}].limit`),
                windowMs: this.parseNumber(item.windowMs, `groups[${i}].windowMs`),
                endpoints: this.parseStringArray(item.endpoints, `groups[${i}].endpoints`),
            };

            // Parse optional fields
            if (item.description !== undefined) {
                group.description = String(item.description);
            }

            if (item.strategy !== undefined) {
                group.strategy = this.parseStrategy(item.strategy, `groups[${i}].strategy`);
            }

            groups.push(group);
        }

        return groups;
    }

    /**
     * Parse throttle configuration
     * @param data - Throttle config data
     * @param warnings - Warnings array
     * @returns Throttle configuration
     */
    private parseThrottle(data: any, warnings: string[]): ThrottleConfig {
        if (!data || typeof data !== 'object') {
            throw new Error('Throttle configuration must be an object');
        }

        const throttle: ThrottleConfig = {
            minDelay: this.parseNumber(data.minDelay, 'throttle.minDelay'),
            maxDelay: this.parseNumber(data.maxDelay, 'throttle.maxDelay'),
            backoffMultiplier: this.parseNumber(
                data.backoffMultiplier,
                'throttle.backoffMultiplier'
            ),
        };

        // Parse optional fields
        if (data.initialDelay !== undefined) {
            throttle.initialDelay = this.parseNumber(data.initialDelay, 'throttle.initialDelay');
        }

        if (data.maxRetries !== undefined) {
            throttle.maxRetries = this.parseNumber(data.maxRetries, 'throttle.maxRetries');
        }

        if (data.jitter !== undefined) {
            throttle.jitter = this.parseNumber(data.jitter, 'throttle.jitter');
        }

        return throttle;
    }

    /**
     * Parse and validate a number
     * @param value - Value to parse
     * @param path - Field path for error messages
     * @returns Parsed number
     */
    private parseNumber(value: any, path: string): number {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
        throw new Error(`${path} must be a number, got ${typeof value}`);
    }

    /**
     * Parse and validate a string
     * @param value - Value to parse
     * @param path - Field path for error messages
     * @returns Parsed string
     */
    private parseString(value: any, path: string): string {
        if (typeof value === 'string') {
            return value;
        }
        throw new Error(`${path} must be a string, got ${typeof value}`);
    }

    /**
     * Parse and validate a string array
     * @param value - Value to parse
     * @param path - Field path for error messages
     * @returns Parsed string array
     */
    private parseStringArray(value: any, path: string): string[] {
        if (!Array.isArray(value)) {
            throw new Error(`${path} must be an array, got ${typeof value}`);
        }
        return value.map((item, i) => {
            if (typeof item !== 'string') {
                throw new Error(`${path}[${i}] must be a string, got ${typeof item}`);
            }
            return item;
        });
    }

    /**
     * Parse and validate rate limit strategy
     * @param value - Value to parse
     * @param path - Field path for error messages
     * @returns Parsed strategy
     */
    private parseStrategy(value: any, path: string): RateLimitStrategy {
        const validStrategies: RateLimitStrategy[] = ['sliding', 'fixed', 'token-bucket'];
        if (typeof value === 'string' && validStrategies.includes(value as RateLimitStrategy)) {
            return value as RateLimitStrategy;
        }
        throw new Error(
            `${path} must be one of: ${validStrategies.join(', ')}, got ${value}`
        );
    }

    /**
     * Parse and validate cost unit
     * @param value - Value to parse
     * @param path - Field path for error messages
     * @returns Parsed cost unit
     */
    private parseCostUnit(value: any, path: string): CostUnit {
        const validUnits: CostUnit[] = ['requests', 'weight', 'custom'];
        if (typeof value === 'string' && validUnits.includes(value as CostUnit)) {
            return value as CostUnit;
        }
        throw new Error(`${path} must be one of: ${validUnits.join(', ')}, got ${value}`);
    }

    /**
     * Apply default values to schema
     * @param schema - Schema to modify
     */
    private applyDefaults(schema: RateLimitSchema): void {
        // Apply global defaults
        if (!schema.global.costUnit) {
            schema.global.costUnit = 'requests';
        }

        // Apply endpoint defaults
        if (schema.endpoints) {
            for (const [path, config] of Object.entries(schema.endpoints)) {
                if (config.cost === undefined) {
                    config.cost = 1;
                }
            }
        }
    }
}

// ============================================================
// Integration with Endpoint Metadata
// ============================================================

/**
 * Endpoint metadata with rate limit information
 */
export interface EndpointWithRateLimit {
    /** Endpoint path or identifier */
    path: string;

    /** HTTP method */
    method?: string;

    /** Cost metadata from endpoint definition */
    cost?: number | RawCostConfig;

    /** Normalized cost metadata */
    costMetadata?: EndpointCostMetadata;

    /** Rate limit group assignment */
    group?: string;

    /** Custom rate limit override */
    rateLimit?: EndpointRateLimitSchema;
}

/**
 * Extract rate limit information for endpoints from schema
 * @param schema - Rate limit schema
 * @param endpoints - Array of endpoints
 * @returns Endpoints with rate limit information
 */
export function attachRateLimits(
    schema: RateLimitSchema,
    endpoints: EndpointWithRateLimit[]
): EndpointWithRateLimit[] {
    return endpoints.map(endpoint => {
        const endpointConfig = schema.endpoints?.[endpoint.path];
        const cost = calculateRequestCost(endpoint.path, schema);

        return {
            ...endpoint,
            cost: cost.cost,
            group: cost.group,
            rateLimit: endpointConfig,
            costMetadata: endpointConfig?.costMetadata ?? endpoint.costMetadata,
        };
    });
}

/**
 * Build rate limit schema from endpoint definitions
 * Extracts cost metadata from endpoints and builds a schema
 * @param endpoints - Array of endpoints with cost metadata
 * @returns Rate limit schema
 */
export function buildSchemaFromEndpoints(
    endpoints: EndpointWithRateLimit[],
    globalConfig?: Partial<GlobalRateLimitSchema>
): RateLimitSchema {
    const schema: RateLimitSchema = {
        global: {
            defaultLimit: globalConfig?.defaultLimit ?? 100,
            windowMs: globalConfig?.windowMs ?? 60000,
            strategy: globalConfig?.strategy ?? 'sliding',
            costUnit: globalConfig?.costUnit,
            burstLimit: globalConfig?.burstLimit,
            description: globalConfig?.description,
        },
        endpoints: {},
    };

    // Extract endpoint rate limits
    for (const endpoint of endpoints) {
        if (
            endpoint.cost === undefined &&
            endpoint.group === undefined &&
            endpoint.costMetadata === undefined
        ) {
            continue;
        }

        const normalized = normalizeCostConfig(endpoint.cost as number | RawCostConfig | undefined);
        const endpointConfig: EndpointRateLimitSchema = {
            cost: normalized.baseCost ?? 1,
        };

        if (endpoint.group) {
            endpointConfig.group = endpoint.group;
        }

        const metadata = endpoint.costMetadata ?? normalized.metadata;
        if (metadata) {
            endpointConfig.costMetadata = metadata;
        }

        schema.endpoints![endpoint.path] = endpointConfig;
    }

    return schema;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Parse rate limit configuration from JSON
 * @param json - JSON string or object
 * @param options - Parser options
 * @returns Parse result
 */
export function parseRateLimitConfig(
    json: string | object,
    options?: RateLimitParserOptions
): RateLimitParseResult {
    const parser = new RateLimitParser(options);
    return parser.parseJSON(json);
}

/**
 * Validate a parsed rate limit schema
 * @param schema - Schema to validate
 * @returns Validation result
 */
export function validateParsedSchema(schema: RateLimitSchema): RateLimitValidationResult {
    return validateRateLimitSchema(schema);
}

/**
 * Check if a configuration source is valid
 * @param source - Configuration source
 * @returns True if the source can be parsed
 */
export function isValidRateLimitConfig(source: string | object): boolean {
    try {
        const parser = new RateLimitParser({ validate: true });
        const result = parser.parse(source);
        return result.validation?.valid ?? false;
    } catch {
        return false;
    }
}
