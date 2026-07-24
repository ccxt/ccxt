/**
 * Rate Limit Schema Definitions
 * Comprehensive rate limiting configuration for exchange API endpoints
 */

// ============================================================
// Rate Limit Strategy Types
// ============================================================

/**
 * Rate limit calculation strategies
 * - sliding: Sliding window - tracks requests in moving time window
 * - fixed: Fixed window - resets at fixed intervals
 * - token-bucket: Token bucket algorithm - allows bursts with replenishment
 */
export type RateLimitStrategy = 'sliding' | 'fixed' | 'token-bucket';

/**
 * Cost calculation units
 * - requests: Count by number of requests
 * - weight: Use endpoint-specific weights
 * - custom: Custom cost calculation
 */
export type CostUnit = 'requests' | 'weight' | 'custom';

// ============================================================
// Global Rate Limit Configuration
// ============================================================

/**
 * Global rate limit configuration
 * Defines default rate limiting behavior for all endpoints
 */
export interface GlobalRateLimitSchema {
    /** Maximum number of requests (or cost units) allowed per window */
    defaultLimit: number;

    /** Window duration in milliseconds */
    windowMs: number;

    /** Optional burst limit - allows brief bursts above defaultLimit */
    burstLimit?: number;

    /** Cost calculation unit (default: 'requests') */
    costUnit?: CostUnit;

    /** Rate limiting strategy (default: 'sliding') */
    strategy: RateLimitStrategy;

    /** Description of the rate limit policy */
    description?: string;
}

// ============================================================
// Endpoint-Specific Rate Limits
// ============================================================

/**
 * Endpoint-specific rate limit configuration
 * Allows per-endpoint overrides and cost specifications
 */
export interface EndpointRateLimitSchema {
    /** Cost/weight of this endpoint (default: 1) */
    cost: number;

    /** Detailed cost metadata for dynamic calculations */
    costMetadata?: EndpointCostMetadata;

    /** Override global limit for this endpoint */
    limit?: number;

    /** Override global window duration for this endpoint */
    windowMs?: number;

    /** Rate limit group this endpoint belongs to */
    group?: string;

    /** Description of endpoint-specific rate limit */
    description?: string;

    /** Override strategy for this endpoint */
    strategy?: RateLimitStrategy;
}

// ============================================================
// Rate Limit Groups
// ============================================================

/**
 * Rate limit group configuration
 * Groups endpoints that share a common rate limit pool
 */
export interface RateLimitGroupSchema {
    /** Unique group identifier */
    name: string;

    /** Group-specific rate limit */
    limit: number;

    /** Window duration for this group (in milliseconds) */
    windowMs: number;

    /** List of endpoint patterns that belong to this group */
    endpoints: string[];

    /** Optional description of the group */
    description?: string;

    /** Rate limiting strategy for this group */
    strategy?: RateLimitStrategy;
}

// ============================================================
// Throttle Configuration
// ============================================================

/**
 * Throttle configuration for request pacing
 * Controls delays and backoff behavior
 */
export interface ThrottleConfig {
    /** Minimum delay between requests (in milliseconds) */
    minDelay: number;

    /** Maximum backoff delay (in milliseconds) */
    maxDelay: number;

    /** Exponential backoff multiplier (e.g., 2.0 for doubling) */
    backoffMultiplier: number;

    /** Initial delay for first retry (in milliseconds) */
    initialDelay?: number;

    /** Maximum number of retry attempts */
    maxRetries?: number;

    /** Jitter factor to randomize delays (0.0 - 1.0) */
    jitter?: number;
}

// ============================================================
// Complete Rate Limit Schema
// ============================================================

/**
 * Complete rate limit schema
 * Combines global limits, endpoint overrides, groups, and throttling
 */
export interface RateLimitSchema {
    /** Global rate limit configuration */
    global: GlobalRateLimitSchema;

    /** Per-endpoint rate limit overrides */
    endpoints?: Record<string, EndpointRateLimitSchema>;

    /** Rate limit groups */
    groups?: RateLimitGroupSchema[];

    /** Throttle configuration */
    throttle?: ThrottleConfig;

    /** Schema version */
    version?: string;
}

// ============================================================
// Validation Results
// ============================================================

/**
 * Validation error details
 */
export interface RateLimitValidationError {
    /** Path to the invalid field */
    path: string;

    /** Error message */
    message: string;

    /** Severity level */
    severity: 'error' | 'warning';
}

/**
 * Validation result
 */
export interface RateLimitValidationResult {
    /** Whether the schema is valid */
    valid: boolean;

    /** List of validation errors */
    errors: RateLimitValidationError[];

    /** List of warnings */
    warnings: RateLimitValidationError[];
}

// ============================================================
// Request Cost Calculation
// ============================================================

/**
 * Request cost calculation result
 */
export interface RequestCost {
    /** Calculated cost for the request */
    cost: number;

    /** Rate limit that applies to this request */
    limit: number;

    /** Window duration in milliseconds */
    windowMs: number;

    /** Strategy used for this request */
    strategy: RateLimitStrategy;

    /** Group name if applicable */
    group?: string;
}

// ============================================================
// Dynamic Cost Metadata
// ============================================================

/** Comparison operator for tiered costs */
export type CostComparisonOperator = 'lte' | 'gte';

/** Tier definition for limit-based costs */
export interface LimitCostTier {
    /** Threshold value that triggers this cost */
    threshold: number;

    /** Cost applied when threshold matches */
    cost: number;
}

/** Limit-based cost configuration */
export interface LimitCostConfig {
    /** Parameter used for comparison (defaults to 'limit') */
    param?: string;

    /** Comparison operator (<= by default) */
    operator?: CostComparisonOperator;

    /** Ordered list of tiers */
    tiers: LimitCostTier[];
}

/** Param-based overrides */
export interface ParamCostRule {
    /** Parameter name */
    param: string;

    /** Cost applied when rule matches */
    cost: number;

    /** Whether rule is triggered when param is present or absent (default: present) */
    when?: 'present' | 'absent';
}

/** Conditional cost rule using higher level expressions */
export interface ConditionalCostRule {
    /** Expression or condition payload */
    when: unknown;

    /** Cost applied when condition matches */
    cost: number;

    /** Optional human readable description */
    description?: string;
}

/** Metadata describing how an endpoint's cost can change */
export interface EndpointCostMetadata {
    /** Baseline/default cost */
    defaultCost?: number;

    /** Cost overrides triggered by parameter presence/absence */
    paramCosts?: ParamCostRule[];

    /** Tiered cost rules driven by numeric limits */
    limitCosts?: LimitCostConfig;

    /** Advanced conditional overrides */
    conditionalCosts?: ConditionalCostRule[];
}

/** Context supplied when calculating a request's cost */
export interface CostEvaluationContext {
    /** Request parameters (query/body) */
    params?: Record<string, unknown>;

    /** Additional metadata that cost evaluators might need */
    metadata?: Record<string, unknown>;
}

/** Raw configuration from endpoint definitions (before normalization) */
export interface RawCostConfig {
    /** Default/base cost */
    default: number;

    /** Overrides when specific params are present */
    byParam?: Record<string, number>;

    /** Tiered overrides driven by numeric limits */
    byLimit?: [number, number][];

    /** Custom parameter to inspect for byLimit comparisons */
    limitParam?: string;

    /** Comparison strategy for byLimit */
    operator?: CostComparisonOperator;

    /** Advanced conditional overrides */
    conditions?: Array<{ when: unknown; cost: number; description?: string }>;
}

interface NormalizedCostResult {
    baseCost: number;
    metadata?: EndpointCostMetadata;
}

/**
 * Normalize raw cost configuration into endpoint metadata
 * @param cost - Numeric cost or structured cost config
 * @returns Normalized cost + metadata
 */
export function normalizeCostConfig(cost?: number | RawCostConfig): NormalizedCostResult {
    if (cost === undefined) {
        return { baseCost: 1 };
    }

    if (typeof cost === 'number') {
        return { baseCost: cost };
    }

    const metadata: EndpointCostMetadata = {
        defaultCost: cost.default,
    };

    if (cost.byParam) {
        metadata.paramCosts = Object.entries(cost.byParam).map(([param, value]) => ({
            param,
            cost: value,
            when: 'present' as const,
        }));
    }

    if (cost.byLimit && cost.byLimit.length > 0) {
        metadata.limitCosts = {
            param: cost.limitParam ?? 'limit',
            operator: cost.operator ?? 'lte',
            tiers: cost.byLimit.map(([threshold, tierCost]) => ({
                threshold,
                cost: tierCost,
            })),
        };
    }

    if (cost.conditions && cost.conditions.length > 0) {
        metadata.conditionalCosts = cost.conditions.map(condition => ({
            when: condition.when,
            cost: condition.cost,
            description: condition.description,
        }));
    }

    return {
        baseCost: cost.default,
        metadata,
    };
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validates a rate limit schema
 * @param schema - The rate limit schema to validate
 * @returns Validation result with errors and warnings
 */
export function validateRateLimitSchema(schema: RateLimitSchema): RateLimitValidationResult {
    const errors: RateLimitValidationError[] = [];
    const warnings: RateLimitValidationError[] = [];

    // Validate global configuration
    if (!schema.global) {
        errors.push({
            path: 'global',
            message: 'Global rate limit configuration is required',
            severity: 'error',
        });
        return { valid: false, errors, warnings };
    }

    // Validate global limits
    if (schema.global.defaultLimit <= 0) {
        errors.push({
            path: 'global.defaultLimit',
            message: 'Default limit must be greater than 0',
            severity: 'error',
        });
    }

    if (schema.global.windowMs <= 0) {
        errors.push({
            path: 'global.windowMs',
            message: 'Window duration must be greater than 0',
            severity: 'error',
        });
    }

    // Validate burst limit
    if (schema.global.burstLimit !== undefined) {
        if (schema.global.burstLimit < schema.global.defaultLimit) {
            errors.push({
                path: 'global.burstLimit',
                message: 'Burst limit must be greater than or equal to default limit',
                severity: 'error',
            });
        }
    }

    // Validate strategy
    const validStrategies: RateLimitStrategy[] = ['sliding', 'fixed', 'token-bucket'];
    if (!validStrategies.includes(schema.global.strategy)) {
        errors.push({
            path: 'global.strategy',
            message: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}`,
            severity: 'error',
        });
    }

    // Validate endpoint overrides
    if (schema.endpoints) {
        for (const [endpoint, config] of Object.entries(schema.endpoints)) {
            if (config.cost <= 0) {
                errors.push({
                    path: `endpoints.${endpoint}.cost`,
                    message: 'Endpoint cost must be greater than 0',
                    severity: 'error',
                });
            }

            if (config.limit !== undefined && config.limit <= 0) {
                errors.push({
                    path: `endpoints.${endpoint}.limit`,
                    message: 'Endpoint limit must be greater than 0',
                    severity: 'error',
                });
            }

            if (config.windowMs !== undefined && config.windowMs <= 0) {
                errors.push({
                    path: `endpoints.${endpoint}.windowMs`,
                    message: 'Endpoint window must be greater than 0',
                    severity: 'error',
                });
            }

            // Warn if endpoint has both group and custom limit
            if (config.group && (config.limit !== undefined || config.windowMs !== undefined)) {
                warnings.push({
                    path: `endpoints.${endpoint}`,
                    message: 'Endpoint has both group and custom limit. Custom limit takes precedence.',
                    severity: 'warning',
                });
            }
        }
    }

    // Collect group names and validate groups
    const groupNames = new Set<string>();
    if (schema.groups) {
        for (const group of schema.groups) {
            // Check for duplicate group names
            if (groupNames.has(group.name)) {
                errors.push({
                    path: `groups.${group.name}`,
                    message: 'Duplicate group name',
                    severity: 'error',
                });
            }
            groupNames.add(group.name);

            if (group.limit <= 0) {
                errors.push({
                    path: `groups.${group.name}.limit`,
                    message: 'Group limit must be greater than 0',
                    severity: 'error',
                });
            }

            if (group.windowMs <= 0) {
                errors.push({
                    path: `groups.${group.name}.windowMs`,
                    message: 'Group window must be greater than 0',
                    severity: 'error',
                });
            }

            if (group.endpoints.length === 0) {
                warnings.push({
                    path: `groups.${group.name}.endpoints`,
                    message: 'Group has no endpoints',
                    severity: 'warning',
                });
            }
        }
    }

    // Validate group references in endpoints
    if (schema.endpoints) {
        for (const [endpoint, config] of Object.entries(schema.endpoints)) {
            if (config.group && !groupNames.has(config.group)) {
                errors.push({
                    path: `endpoints.${endpoint}.group`,
                    message: `Referenced group '${config.group}' does not exist`,
                    severity: 'error',
                });
            }

            if (config.costMetadata) {
                validateCostMetadata(config.costMetadata, `endpoints.${endpoint}.costMetadata`, errors);
            }
        }
    }

    // Validate throttle configuration
    if (schema.throttle) {
        if (schema.throttle.minDelay < 0) {
            errors.push({
                path: 'throttle.minDelay',
                message: 'Minimum delay cannot be negative',
                severity: 'error',
            });
        }

        if (schema.throttle.maxDelay < schema.throttle.minDelay) {
            errors.push({
                path: 'throttle.maxDelay',
                message: 'Maximum delay must be greater than or equal to minimum delay',
                severity: 'error',
            });
        }

        if (schema.throttle.backoffMultiplier <= 0) {
            errors.push({
                path: 'throttle.backoffMultiplier',
                message: 'Backoff multiplier must be greater than 0',
                severity: 'error',
            });
        }

        if (schema.throttle.backoffMultiplier < 1) {
            warnings.push({
                path: 'throttle.backoffMultiplier',
                message: 'Backoff multiplier less than 1 will decrease delay on retries',
                severity: 'warning',
            });
        }

        if (schema.throttle.jitter !== undefined) {
            if (schema.throttle.jitter < 0 || schema.throttle.jitter > 1) {
                errors.push({
                    path: 'throttle.jitter',
                    message: 'Jitter must be between 0.0 and 1.0',
                    severity: 'error',
                });
            }
        }

        if (schema.throttle.maxRetries !== undefined && schema.throttle.maxRetries < 0) {
            errors.push({
                path: 'throttle.maxRetries',
                message: 'Maximum retries cannot be negative',
                severity: 'error',
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

function validateCostMetadata(
    metadata: EndpointCostMetadata,
    basePath: string,
    errors: RateLimitValidationError[]
): void {
    if (metadata.defaultCost !== undefined && metadata.defaultCost <= 0) {
        errors.push({
            path: `${basePath}.defaultCost`,
            message: 'Default cost must be greater than 0',
            severity: 'error',
        });
    }

    if (metadata.paramCosts) {
        metadata.paramCosts.forEach((rule, index) => {
            if (!rule.param || typeof rule.param !== 'string') {
                errors.push({
                    path: `${basePath}.paramCosts[${index}].param`,
                    message: 'Parameter name is required for param cost rules',
                    severity: 'error',
                });
            }
            if (rule.cost <= 0) {
                errors.push({
                    path: `${basePath}.paramCosts[${index}].cost`,
                    message: 'Param cost override must be greater than 0',
                    severity: 'error',
                });
            }
        });
    }

    if (metadata.limitCosts) {
        if (!metadata.limitCosts.tiers || metadata.limitCosts.tiers.length === 0) {
            errors.push({
                path: `${basePath}.limitCosts.tiers`,
                message: 'Limit cost tiers must include at least one entry',
                severity: 'error',
            });
        } else {
            metadata.limitCosts.tiers.forEach((tier, index) => {
                if (tier.threshold < 0) {
                    errors.push({
                        path: `${basePath}.limitCosts.tiers[${index}].threshold`,
                        message: 'Limit threshold must be non-negative',
                        severity: 'error',
                    });
                }
                if (tier.cost <= 0) {
                    errors.push({
                        path: `${basePath}.limitCosts.tiers[${index}].cost`,
                        message: 'Limit tier cost must be greater than 0',
                        severity: 'error',
                    });
                }
            });
        }
    }

    if (metadata.conditionalCosts) {
        metadata.conditionalCosts.forEach((condition, index) => {
            if (condition.cost <= 0) {
                errors.push({
                    path: `${basePath}.conditionalCosts[${index}].cost`,
                    message: 'Conditional cost must be greater than 0',
                    severity: 'error',
                });
            }
        });
    }
}

// ============================================================
// Cost Calculation Functions
// ============================================================

/**
 * Calculates the cost for a specific endpoint
 * @param endpoint - The endpoint path or name
 * @param schema - The rate limit schema
 * @returns Request cost details
 */
export function calculateRequestCost(
    endpoint: string,
    schema: RateLimitSchema,
    context?: CostEvaluationContext
): RequestCost {
    // Default cost calculation
    let cost = 1;
    let limit = schema.global.defaultLimit;
    let windowMs = schema.global.windowMs;
    let strategy = schema.global.strategy;
    let group: string | undefined;

    // Check for endpoint-specific configuration
    if (schema.endpoints && schema.endpoints[endpoint]) {
        const endpointConfig = schema.endpoints[endpoint];
        cost = resolveEndpointCost(endpointConfig, context);

        // Check if endpoint belongs to a group
        if (endpointConfig.group && schema.groups) {
            const groupConfig = schema.groups.find(g => g.name === endpointConfig.group);
            if (groupConfig) {
                limit = groupConfig.limit;
                windowMs = groupConfig.windowMs;
                strategy = groupConfig.strategy || schema.global.strategy;
                group = groupConfig.name;
            }
        }

        // Endpoint-specific overrides take precedence over group
        if (endpointConfig.limit !== undefined) {
            limit = endpointConfig.limit;
        }
        if (endpointConfig.windowMs !== undefined) {
            windowMs = endpointConfig.windowMs;
        }
        if (endpointConfig.strategy !== undefined) {
            strategy = endpointConfig.strategy;
        }
    } else if (schema.groups) {
        // Check if endpoint matches any group pattern
        for (const groupConfig of schema.groups) {
            for (const pattern of groupConfig.endpoints) {
                if (matchEndpointPattern(endpoint, pattern)) {
                    limit = groupConfig.limit;
                    windowMs = groupConfig.windowMs;
                    strategy = groupConfig.strategy || schema.global.strategy;
                    group = groupConfig.name;
                    break;
                }
            }
            if (group) break;
        }
    }

    return {
        cost,
        limit,
        windowMs,
        strategy,
        group,
    };
}

function resolveEndpointCost(
    endpointConfig: EndpointRateLimitSchema,
    context?: CostEvaluationContext
): number {
    let resolvedCost = endpointConfig.cost;
    const metadata = endpointConfig.costMetadata;

    if (!metadata) {
        return resolvedCost;
    }

    const params = context?.params ?? {};

    if (metadata.paramCosts && metadata.paramCosts.length > 0) {
        for (const rule of metadata.paramCosts) {
            const when = rule.when ?? 'present';
            const hasParam = isParamProvided(params, rule.param);
            if ((when === 'present' && hasParam) || (when === 'absent' && !hasParam)) {
                return rule.cost;
            }
        }
    }

    if (metadata.limitCosts && metadata.limitCosts.tiers.length > 0) {
        const limitParam = metadata.limitCosts.param ?? 'limit';
        if (isParamProvided(params, limitParam)) {
            const value = Number((params as Record<string, unknown>)[limitParam]);
            if (!Number.isNaN(value)) {
                return evaluateLimitCost(value, metadata.limitCosts);
            }
        }
    }

    return resolvedCost;
}

function isParamProvided(params: Record<string, unknown>, param: string): boolean {
    if (params === undefined || params === null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(params, param) && params[param] !== undefined && params[param] !== null;
}

function evaluateLimitCost(value: number, limitConfig: LimitCostConfig): number {
    const operator = limitConfig.operator ?? 'lte';
    const tiers = limitConfig.tiers.slice();

    if (tiers.length === 0) {
        return value;
    }

    if (operator === 'lte') {
        tiers.sort((a, b) => a.threshold - b.threshold);
        for (const tier of tiers) {
            if (value <= tier.threshold) {
                return tier.cost;
            }
        }
        return tiers[tiers.length - 1].cost;
    }

    // operator === 'gte'
    tiers.sort((a, b) => b.threshold - a.threshold);
    for (const tier of tiers) {
        if (value >= tier.threshold) {
            return tier.cost;
        }
    }
    return tiers[tiers.length - 1].cost;
}

/**
 * Matches an endpoint against a pattern
 * Supports wildcards and simple pattern matching
 * @param endpoint - The endpoint to match
 * @param pattern - The pattern to match against
 * @returns True if the endpoint matches the pattern
 */
function matchEndpointPattern(endpoint: string, pattern: string): boolean {
    // Exact match
    if (endpoint === pattern) {
        return true;
    }

    // Convert pattern to regex
    // Support * as wildcard
    const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
        .replace(/\*/g, '.*'); // Convert * to .*

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(endpoint);
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Creates a default rate limit schema
 * @param defaultLimit - Default request limit
 * @param windowMs - Window duration in milliseconds
 * @returns A basic rate limit schema
 */
export function createDefaultRateLimitSchema(
    defaultLimit: number = 100,
    windowMs: number = 60000
): RateLimitSchema {
    return {
        global: {
            defaultLimit,
            windowMs,
            strategy: 'sliding',
            costUnit: 'requests',
        },
    };
}

/**
 * Merges multiple rate limit schemas
 * Later schemas override earlier ones
 * @param schemas - Array of schemas to merge
 * @returns Merged schema
 */
export function mergeRateLimitSchemas(...schemas: RateLimitSchema[]): RateLimitSchema {
    if (schemas.length === 0) {
        return createDefaultRateLimitSchema();
    }

    const merged: RateLimitSchema = {
        global: { ...schemas[0].global },
    };

    for (const schema of schemas) {
        // Merge global config
        merged.global = { ...merged.global, ...schema.global };

        // Merge endpoints
        if (schema.endpoints) {
            merged.endpoints = { ...merged.endpoints, ...schema.endpoints };
        }

        // Merge groups
        if (schema.groups) {
            if (!merged.groups) {
                merged.groups = [];
            }
            // Replace groups with same name, append new ones
            for (const group of schema.groups) {
                const existingIndex = merged.groups.findIndex(g => g.name === group.name);
                if (existingIndex >= 0) {
                    merged.groups[existingIndex] = group;
                } else {
                    merged.groups.push(group);
                }
            }
        }

        // Merge throttle
        if (schema.throttle) {
            merged.throttle = { ...merged.throttle, ...schema.throttle };
        }

        // Merge version
        if (schema.version) {
            merged.version = schema.version;
        }
    }

    return merged;
}
