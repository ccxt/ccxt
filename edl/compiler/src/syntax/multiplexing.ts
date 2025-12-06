/**
 * Multiplexing Rules DSL Syntax
 *
 * Defines types and syntax for WebSocket channel multiplexing rules.
 * Supports symbol grouping, load balancing, connection affinity, and overflow behavior.
 */

import type { MultiplexingConfig } from '../types/websocket.js';

// ============================================================
// Load Balancing Strategy Types
// ============================================================

/**
 * Load balancing strategy types for distributing subscriptions across connections
 */
export type LoadBalancingStrategy = 'round-robin' | 'hash-based' | 'least-connections' | 'random';

/**
 * Load balancing configuration
 * Defines how subscriptions are distributed across connection pool
 */
export interface LoadBalancingConfig {
    /**
     * Strategy to use for load balancing
     */
    strategy: LoadBalancingStrategy;

    /**
     * Hash function for hash-based strategy
     * Options: 'symbol', 'base-currency', 'quote-currency', 'custom'
     */
    hashFunction?: 'symbol' | 'base-currency' | 'quote-currency' | 'custom';

    /**
     * Custom hash function name (when hashFunction is 'custom')
     */
    customHashFunction?: string;

    /**
     * Weight distribution for weighted strategies
     * Maps connection index to weight value
     */
    weights?: Record<number, number>;
}

// ============================================================
// Symbol Grouping Types
// ============================================================

/**
 * Symbol grouping rule types
 */
export type SymbolGroupingType =
    | 'base-currency'
    | 'quote-currency'
    | 'exchange-segment'
    | 'market-type'
    | 'custom';

/**
 * Symbol grouping rule
 * Defines how symbols should be grouped on the same connection
 */
export interface SymbolGroupingRule {
    /**
     * Type of grouping to apply
     */
    type: SymbolGroupingType;

    /**
     * Custom grouping function name (when type is 'custom')
     */
    customFunction?: string;

    /**
     * Maximum symbols per group
     * Overrides maxSymbolsPerConnection for this specific grouping
     */
    maxSymbolsPerGroup?: number;

    /**
     * Whether to enforce strict grouping (reject if can't group)
     */
    strict?: boolean;
}

// ============================================================
// Connection Affinity Types
// ============================================================

/**
 * Connection affinity rule
 * Defines which symbols should stay together on the same connection
 */
export interface ConnectionAffinityRule {
    /**
     * List of symbol patterns that should share a connection
     * Supports wildcards for pattern matching
     */
    symbols: string[];

    /**
     * Affinity strength: 'required' or 'preferred'
     * - required: Must be on same connection or fail
     * - preferred: Attempt to place on same connection, but allow split if needed
     */
    strength: 'required' | 'preferred';

    /**
     * Priority level for affinity resolution (higher = more important)
     */
    priority?: number;

    /**
     * Channel restrictions - only apply affinity to these channels
     */
    channels?: string[];
}

// ============================================================
// Overflow Behavior Types
// ============================================================

/**
 * Overflow behavior when connection limits are reached
 */
export type OverflowBehavior = 'create-connection' | 'reject' | 'queue' | 'replace-oldest';

/**
 * Overflow configuration
 * Defines what happens when connection capacity is exceeded
 */
export interface OverflowConfig {
    /**
     * Behavior to apply when overflow occurs
     */
    behavior: OverflowBehavior;

    /**
     * Maximum queue size for 'queue' behavior
     */
    maxQueueSize?: number;

    /**
     * Queue timeout in milliseconds
     * How long to wait before giving up on queued subscriptions
     */
    queueTimeout?: number;

    /**
     * Maximum number of connections to create for 'create-connection' behavior
     */
    maxConnections?: number;

    /**
     * Error handler function name when overflow cannot be handled
     */
    onOverflowError?: string;
}

// ============================================================
// Stream Routing Types
// ============================================================

/**
 * Stream routing condition
 * Defines conditions for routing messages to handlers
 */
export interface StreamRoutingCondition {
    /**
     * Field path in the message to check
     * Supports dot notation: "data.symbol", "channel.name"
     */
    field: string;

    /**
     * Operator for comparison
     */
    operator: 'equals' | 'contains' | 'matches' | 'in' | 'startsWith' | 'endsWith';

    /**
     * Value to compare against
     */
    value: string | number | boolean | string[];

    /**
     * Regular expression pattern (when operator is 'matches')
     */
    pattern?: string;
}

/**
 * Stream routing rule
 * Defines how to route incoming messages to the correct handler
 */
export interface StreamRoutingRule {
    /**
     * Unique identifier for this routing rule
     */
    id: string;

    /**
     * Conditions that must be met for this rule to apply
     * Multiple conditions are AND-ed together
     */
    conditions: StreamRoutingCondition[];

    /**
     * Target channel type for messages matching this rule
     */
    targetChannel: string;

    /**
     * Target symbol for messages matching this rule
     * Can be extracted from message using a field path
     */
    targetSymbol?: string;

    /**
     * Field path to extract symbol from message
     * Example: "data.s", "symbol", "pair"
     */
    symbolField?: string;

    /**
     * Priority for rule matching (higher = checked first)
     */
    priority?: number;

    /**
     * Whether to stop processing rules after this one matches
     */
    stopOnMatch?: boolean;
}

// ============================================================
// Connection Assignment Types
// ============================================================

/**
 * Connection assignment strategy
 * Defines how subscriptions are assigned to specific connections
 */
export interface ConnectionAssignment {
    /**
     * Assignment strategy type
     */
    strategy: 'auto' | 'manual' | 'sticky' | 'dedicated';

    /**
     * Manual connection assignments
     * Maps symbol patterns to connection indices
     */
    manualAssignments?: Record<string, number>;

    /**
     * Sticky session configuration
     * When enabled, symbols maintain their connection assignment
     */
    stickySession?: {
        /**
         * Enable sticky sessions
         */
        enabled: boolean;

        /**
         * Duration to maintain sticky session in milliseconds
         */
        duration?: number;

        /**
         * Storage mechanism for sticky session data
         */
        storage?: 'memory' | 'persistent';
    };

    /**
     * Dedicated connection configuration
     * Assigns specific symbols to dedicated connections
     */
    dedicatedConnections?: {
        /**
         * Symbol patterns that require dedicated connections
         */
        symbols: string[];

        /**
         * Number of dedicated connections to maintain
         */
        count: number;
    }[];

    /**
     * Connection rebalancing configuration
     */
    rebalancing?: {
        /**
         * Enable automatic rebalancing
         */
        enabled: boolean;

        /**
         * Rebalancing interval in milliseconds
         */
        interval?: number;

        /**
         * Threshold for triggering rebalancing (load imbalance %)
         */
        threshold?: number;
    };
}

// ============================================================
// Multiplexing Rule Types
// ============================================================

/**
 * Multiplexing rule
 * Complete configuration for how streams combine on connections
 */
export interface MultiplexingRule {
    /**
     * Enable multiplexing
     */
    enabled: boolean;

    /**
     * Maximum symbols per connection
     */
    maxSymbolsPerConnection: number;

    /**
     * Maximum channels per connection
     */
    maxChannelsPerConnection?: number;

    /**
     * Connection pool size
     */
    connectionPoolSize: number;

    /**
     * Load balancing configuration
     */
    loadBalancing: LoadBalancingConfig;

    /**
     * Symbol grouping rules
     */
    symbolGrouping?: SymbolGroupingRule[];

    /**
     * Connection affinity rules
     */
    connectionAffinity?: ConnectionAffinityRule[];

    /**
     * Overflow behavior configuration
     */
    overflow: OverflowConfig;

    /**
     * Stream routing rules
     */
    routing?: StreamRoutingRule[];

    /**
     * Connection assignment configuration
     */
    connectionAssignment?: ConnectionAssignment;
}

// ============================================================
// Multiplexing Syntax DSL Types
// ============================================================

/**
 * Multiplexing syntax configuration for EDL
 * Simplified DSL version for exchange definition files
 */
export interface MultiplexingSyntax {
    /**
     * Base multiplexing config (from websocket types)
     */
    config: MultiplexingConfig;

    /**
     * Extended multiplexing rules
     */
    rules?: Partial<MultiplexingRule>;

    /**
     * Named rule presets that can be referenced
     */
    presets?: Record<string, Partial<MultiplexingRule>>;

    /**
     * Channel-specific multiplexing overrides
     */
    channelOverrides?: Record<string, Partial<MultiplexingRule>>;
}

// ============================================================
// Parsing Functions
// ============================================================

/**
 * Parse multiplexing configuration into a complete rule set
 * @param config - Multiplexing configuration from EDL
 * @returns Complete multiplexing rule with defaults applied
 */
export function parseMultiplexingRule(config: MultiplexingConfig): MultiplexingRule {
    return {
        enabled: config.enabled ?? false,
        maxSymbolsPerConnection: config.maxSymbolsPerConnection ?? 100,
        maxChannelsPerConnection: config.maxChannelsPerConnection,
        connectionPoolSize: config.connectionPoolSize ?? 1,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'create-connection',
            maxConnections: config.connectionPoolSize ? config.connectionPoolSize * 2 : 10,
        },
    };
}

/**
 * Parse symbol grouping rule from DSL syntax
 * @param rule - Symbol grouping rule configuration
 * @returns Validated symbol grouping rule
 */
export function parseSymbolGroupingRule(rule: SymbolGroupingRule): SymbolGroupingRule {
    if (rule.type === 'custom' && !rule.customFunction) {
        throw new Error('Symbol grouping rule with type "custom" must specify customFunction');
    }
    return {
        ...rule,
        strict: rule.strict ?? false,
    };
}

/**
 * Parse connection affinity rule from DSL syntax
 * @param rule - Connection affinity rule configuration
 * @returns Validated connection affinity rule
 */
export function parseConnectionAffinityRule(rule: ConnectionAffinityRule): ConnectionAffinityRule {
    if (!rule.symbols || rule.symbols.length === 0) {
        throw new Error('Connection affinity rule must specify at least one symbol pattern');
    }
    return {
        ...rule,
        priority: rule.priority ?? 0,
    };
}

/**
 * Parse stream routing rule from DSL syntax
 * @param rule - Stream routing rule configuration
 * @returns Validated stream routing rule
 */
export function parseStreamRoutingRule(rule: StreamRoutingRule): StreamRoutingRule {
    if (!rule.conditions || rule.conditions.length === 0) {
        throw new Error('Stream routing rule must have at least one condition');
    }
    if (!rule.targetChannel) {
        throw new Error('Stream routing rule must specify targetChannel');
    }
    return {
        ...rule,
        priority: rule.priority ?? 0,
        stopOnMatch: rule.stopOnMatch ?? false,
    };
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate multiplexing configuration
 * @param config - Multiplexing configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateMultiplexingConfig(config: MultiplexingConfig): string[] {
    const errors: string[] = [];

    if (config.enabled) {
        if (config.maxSymbolsPerConnection !== undefined) {
            if (typeof config.maxSymbolsPerConnection !== 'number' || config.maxSymbolsPerConnection <= 0) {
                errors.push('maxSymbolsPerConnection must be a positive number');
            }
        }

        if (config.maxChannelsPerConnection !== undefined) {
            if (typeof config.maxChannelsPerConnection !== 'number' || config.maxChannelsPerConnection <= 0) {
                errors.push('maxChannelsPerConnection must be a positive number');
            }
        }

        if (config.connectionPoolSize !== undefined) {
            if (typeof config.connectionPoolSize !== 'number' || config.connectionPoolSize <= 0) {
                errors.push('connectionPoolSize must be a positive number');
            }
        }
    }

    return errors;
}

/**
 * Validate complete multiplexing rule
 * @param rule - Multiplexing rule to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateMultiplexingRule(rule: MultiplexingRule): string[] {
    const errors: string[] = [];

    // Validate basic config
    if (rule.maxSymbolsPerConnection <= 0) {
        errors.push('maxSymbolsPerConnection must be positive');
    }

    if (rule.connectionPoolSize <= 0) {
        errors.push('connectionPoolSize must be positive');
    }

    if (rule.maxChannelsPerConnection !== undefined && rule.maxChannelsPerConnection <= 0) {
        errors.push('maxChannelsPerConnection must be positive if specified');
    }

    // Validate load balancing
    const validStrategies: LoadBalancingStrategy[] = ['round-robin', 'hash-based', 'least-connections', 'random'];
    if (!validStrategies.includes(rule.loadBalancing.strategy)) {
        errors.push(`Invalid load balancing strategy: ${rule.loadBalancing.strategy}`);
    }

    if (rule.loadBalancing.strategy === 'hash-based') {
        if (!rule.loadBalancing.hashFunction) {
            errors.push('Hash-based strategy requires hashFunction to be specified');
        }
        if (rule.loadBalancing.hashFunction === 'custom' && !rule.loadBalancing.customHashFunction) {
            errors.push('Custom hash function requires customHashFunction name');
        }
    }

    // Validate overflow config
    const validOverflowBehaviors: OverflowBehavior[] = ['create-connection', 'reject', 'queue', 'replace-oldest'];
    if (!validOverflowBehaviors.includes(rule.overflow.behavior)) {
        errors.push(`Invalid overflow behavior: ${rule.overflow.behavior}`);
    }

    if (rule.overflow.behavior === 'queue') {
        if (rule.overflow.maxQueueSize !== undefined && rule.overflow.maxQueueSize <= 0) {
            errors.push('maxQueueSize must be positive if specified');
        }
    }

    if (rule.overflow.behavior === 'create-connection') {
        if (rule.overflow.maxConnections !== undefined && rule.overflow.maxConnections <= 0) {
            errors.push('maxConnections must be positive if specified');
        }
    }

    // Validate symbol grouping rules
    if (rule.symbolGrouping) {
        for (const groupRule of rule.symbolGrouping) {
            if (groupRule.type === 'custom' && !groupRule.customFunction) {
                errors.push('Symbol grouping rule with type "custom" must specify customFunction');
            }
            if (groupRule.maxSymbolsPerGroup !== undefined && groupRule.maxSymbolsPerGroup <= 0) {
                errors.push('maxSymbolsPerGroup must be positive if specified');
            }
        }
    }

    // Validate connection affinity rules
    if (rule.connectionAffinity) {
        for (const affinityRule of rule.connectionAffinity) {
            if (!affinityRule.symbols || affinityRule.symbols.length === 0) {
                errors.push('Connection affinity rule must specify at least one symbol');
            }
            if (!['required', 'preferred'].includes(affinityRule.strength)) {
                errors.push(`Invalid affinity strength: ${affinityRule.strength}`);
            }
        }
    }

    // Validate routing rules
    if (rule.routing) {
        for (const routingRule of rule.routing) {
            if (!routingRule.conditions || routingRule.conditions.length === 0) {
                errors.push(`Routing rule ${routingRule.id} must have at least one condition`);
            }
            if (!routingRule.targetChannel) {
                errors.push(`Routing rule ${routingRule.id} must specify targetChannel`);
            }

            // Validate routing conditions
            for (const condition of routingRule.conditions) {
                const validOperators = ['equals', 'contains', 'matches', 'in', 'startsWith', 'endsWith'];
                if (!validOperators.includes(condition.operator)) {
                    errors.push(`Invalid routing condition operator: ${condition.operator}`);
                }

                if (condition.operator === 'matches' && !condition.pattern) {
                    errors.push('Routing condition with "matches" operator must specify pattern');
                }

                if (condition.operator === 'in' && !Array.isArray(condition.value)) {
                    errors.push('Routing condition with "in" operator must have array value');
                }
            }
        }
    }

    return errors;
}

/**
 * Validate connection assignment configuration
 * @param assignment - Connection assignment to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateConnectionAssignment(assignment: ConnectionAssignment): string[] {
    const errors: string[] = [];

    const validStrategies = ['auto', 'manual', 'sticky', 'dedicated'];
    if (!validStrategies.includes(assignment.strategy)) {
        errors.push(`Invalid connection assignment strategy: ${assignment.strategy}`);
    }

    if (assignment.strategy === 'manual' && !assignment.manualAssignments) {
        errors.push('Manual assignment strategy requires manualAssignments to be specified');
    }

    if (assignment.stickySession?.enabled) {
        if (assignment.stickySession.duration !== undefined && assignment.stickySession.duration <= 0) {
            errors.push('Sticky session duration must be positive if specified');
        }
    }

    if (assignment.dedicatedConnections) {
        for (const dedicated of assignment.dedicatedConnections) {
            if (!dedicated.symbols || dedicated.symbols.length === 0) {
                errors.push('Dedicated connection must specify at least one symbol');
            }
            if (dedicated.count <= 0) {
                errors.push('Dedicated connection count must be positive');
            }
        }
    }

    if (assignment.rebalancing?.enabled) {
        if (assignment.rebalancing.threshold !== undefined) {
            if (assignment.rebalancing.threshold < 0 || assignment.rebalancing.threshold > 100) {
                errors.push('Rebalancing threshold must be between 0 and 100');
            }
        }
    }

    return errors;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * Type guard to check if value is a multiplexing rule
 * @param value - Value to check
 * @returns True if value is a MultiplexingRule
 */
export function isMultiplexingRule(value: any): value is MultiplexingRule {
    return (
        typeof value === 'object' &&
        value !== null &&
        'enabled' in value &&
        'maxSymbolsPerConnection' in value &&
        'connectionPoolSize' in value &&
        'loadBalancing' in value &&
        'overflow' in value
    );
}

/**
 * Type guard to check if value is a stream routing rule
 * @param value - Value to check
 * @returns True if value is a StreamRoutingRule
 */
export function isStreamRoutingRule(value: any): value is StreamRoutingRule {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'conditions' in value &&
        Array.isArray(value.conditions) &&
        'targetChannel' in value
    );
}

/**
 * Type guard to check if value is a connection affinity rule
 * @param value - Value to check
 * @returns True if value is a ConnectionAffinityRule
 */
export function isConnectionAffinityRule(value: any): value is ConnectionAffinityRule {
    return (
        typeof value === 'object' &&
        value !== null &&
        'symbols' in value &&
        Array.isArray(value.symbols) &&
        'strength' in value &&
        ['required', 'preferred'].includes(value.strength)
    );
}

/**
 * Type guard to check if value is a symbol grouping rule
 * @param value - Value to check
 * @returns True if value is a SymbolGroupingRule
 */
export function isSymbolGroupingRule(value: any): value is SymbolGroupingRule {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        ['base-currency', 'quote-currency', 'exchange-segment', 'market-type', 'custom'].includes(value.type)
    );
}
