/**
 * Runtime Behavior Schemas
 * Data structures and schemas for representing runtime behaviors such as
 * auto-resubscribe, ping/pong, connection limits, and CCXT integrations.
 */

// ============================================================
// Reconnection Strategy Types
// ============================================================

/**
 * Reconnection strategy type
 * Defines how the system should reconnect after a disconnection
 */
export type ReconnectionStrategy =
    | 'immediate'           // Reconnect immediately without delay
    | 'linear-backoff'      // Reconnect with linearly increasing delays
    | 'exponential-backoff' // Reconnect with exponentially increasing delays
    | 'none';               // No automatic reconnection

// ============================================================
// Auto-Resubscribe Configuration
// ============================================================

/**
 * Auto-resubscribe configuration
 * Controls automatic resubscription behavior after reconnection
 */
export interface AutoResubscribeConfig {
    /**
     * Whether auto-resubscribe is enabled
     */
    enabled: boolean;

    /**
     * Reconnection strategy to use
     */
    strategy: ReconnectionStrategy;

    /**
     * Maximum number of retry attempts
     * undefined means unlimited retries
     */
    maxRetries?: number;

    /**
     * Initial delay in milliseconds before first retry
     * @default 1000
     */
    initialDelayMs?: number;

    /**
     * Maximum delay in milliseconds between retries
     * @default 60000
     */
    maxDelayMs?: number;

    /**
     * Backoff multiplier for exponential/linear backoff
     * For exponential: delay = previous * multiplier
     * For linear: delay = previous + (initialDelay * multiplier)
     * @default 2
     */
    backoffMultiplier?: number;

    /**
     * Specific channels to auto-resubscribe
     * Empty array or undefined means all channels
     */
    channels?: string[];

    /**
     * Whether to preserve subscription state across reconnections
     * If true, maintains the exact state of subscriptions before disconnect
     * @default true
     */
    preserveSubscriptionState?: boolean;
}

// ============================================================
// Ping/Pong Configuration
// ============================================================

/**
 * Action to take on ping/pong timeout
 */
export type PingPongTimeoutAction = 'reconnect' | 'error' | 'ignore';

/**
 * Ping/Pong configuration
 * Controls WebSocket heartbeat mechanism using ping/pong frames
 */
export interface PingPongConfig {
    /**
     * Whether ping/pong is enabled
     */
    enabled: boolean;

    /**
     * Interval in milliseconds between ping messages
     */
    intervalMs: number;

    /**
     * Timeout in milliseconds to wait for pong response
     */
    timeoutMs: number;

    /**
     * Custom ping message payload
     * Can be a string or object for exchanges with custom ping formats
     */
    pingMessage?: string | object;

    /**
     * Field name to check in the pong response
     * Used for exchanges with custom pong message structures
     */
    pongField?: string;

    /**
     * Action to take when pong timeout occurs
     * @default 'reconnect'
     */
    onTimeout?: PingPongTimeoutAction;
}

// ============================================================
// Connection Limits Configuration
// ============================================================

/**
 * Connection limits configuration
 * Controls connection pool size and rate limits
 */
export interface ConnectionLimitsConfig {
    /**
     * Maximum number of concurrent WebSocket connections
     */
    maxConnections: number;

    /**
     * Maximum number of subscriptions per WebSocket connection
     * undefined means no limit
     */
    maxSubscriptionsPerConnection?: number;

    /**
     * Maximum number of messages that can be sent per second
     * undefined means no limit
     */
    maxMessagesPerSecond?: number;

    /**
     * Connection timeout in milliseconds
     * Time to wait for connection establishment
     * @default 30000
     */
    connectionTimeoutMs?: number;

    /**
     * Idle timeout in milliseconds
     * Time to keep connection alive without activity before closing
     * undefined means no idle timeout
     */
    idleTimeoutMs?: number;
}

// ============================================================
// Heartbeat Configuration
// ============================================================

/**
 * Heartbeat configuration
 * Controls application-level heartbeat mechanism (distinct from ping/pong)
 */
export interface HeartbeatConfig {
    /**
     * Whether heartbeat is enabled
     */
    enabled: boolean;

    /**
     * Interval in milliseconds between heartbeat messages
     */
    intervalMs: number;

    /**
     * Custom heartbeat message payload
     * Can be a string or object for exchange-specific formats
     */
    message?: string | object;

    /**
     * Expected response message or pattern
     * Used to verify heartbeat is acknowledged
     */
    expectedResponse?: string;
}

// ============================================================
// CCXT Integration Configuration
// ============================================================

/**
 * Watch method configuration
 * Maps CCXT watch methods to WebSocket channels and parsers
 */
export interface WatchMethodConfig {
    /**
     * CCXT watch method name
     * Examples: 'watchTicker', 'watchOrderBook', 'watchTrades', 'watchOHLCV'
     */
    method: string;

    /**
     * WebSocket channel name this method uses
     */
    channel: string;

    /**
     * Parser function name to use for this channel
     */
    parser: string;

    /**
     * Whether this method requires authentication
     * @default false
     */
    requiresAuth?: boolean;
}

/**
 * CCXT integration configuration
 * Maps CCXT watch methods to EDL WebSocket channels and parsers
 */
export interface CCXTIntegrationConfig {
    /**
     * List of watch method configurations
     */
    watchMethods: WatchMethodConfig[];

    /**
     * Default order book depth for watchOrderBook
     * @default 20
     */
    orderBookDepth?: number;

    /**
     * Default trades limit for watchTrades
     * @default 50
     */
    tradesLimit?: number;

    /**
     * Whether to fetch a snapshot on connection
     * @default true
     */
    snapshotOnConnect?: boolean;
}

// ============================================================
// Runtime Behavior Schema (Main Configuration)
// ============================================================

/**
 * Runtime behavior schema
 * Combines all runtime behavior configurations
 */
export interface RuntimeBehaviorSchema {
    /**
     * Auto-reconnection and resubscription configuration
     */
    reconnection?: AutoResubscribeConfig;

    /**
     * Ping/Pong heartbeat configuration
     */
    pingPong?: PingPongConfig;

    /**
     * Connection limits and pool configuration
     */
    connectionLimits?: ConnectionLimitsConfig;

    /**
     * Application-level heartbeat configuration
     */
    heartbeat?: HeartbeatConfig;

    /**
     * CCXT integration mapping configuration
     */
    ccxtIntegration?: CCXTIntegrationConfig;
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validation error type
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validation result type
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * Validate auto-resubscribe configuration
 */
export function validateAutoResubscribeConfig(
    config: AutoResubscribeConfig
): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (typeof config.enabled !== 'boolean') {
        errors.push({
            field: 'enabled',
            message: 'enabled must be a boolean',
        });
    }

    if (!config.strategy) {
        errors.push({
            field: 'strategy',
            message: 'strategy is required',
        });
    } else {
        const validStrategies: ReconnectionStrategy[] = [
            'immediate',
            'linear-backoff',
            'exponential-backoff',
            'none',
        ];
        if (!validStrategies.includes(config.strategy)) {
            errors.push({
                field: 'strategy',
                message: `strategy must be one of: ${validStrategies.join(', ')}`,
            });
        }
    }

    // Validate optional numeric fields
    if (config.maxRetries !== undefined && config.maxRetries < 0) {
        errors.push({
            field: 'maxRetries',
            message: 'maxRetries must be non-negative',
        });
    }

    if (config.initialDelayMs !== undefined && config.initialDelayMs < 0) {
        errors.push({
            field: 'initialDelayMs',
            message: 'initialDelayMs must be non-negative',
        });
    }

    if (config.maxDelayMs !== undefined && config.maxDelayMs < 0) {
        errors.push({
            field: 'maxDelayMs',
            message: 'maxDelayMs must be non-negative',
        });
    }

    if (config.backoffMultiplier !== undefined && config.backoffMultiplier <= 0) {
        errors.push({
            field: 'backoffMultiplier',
            message: 'backoffMultiplier must be positive',
        });
    }

    // Validate delay constraints
    if (
        config.initialDelayMs !== undefined &&
        config.maxDelayMs !== undefined &&
        config.initialDelayMs > config.maxDelayMs
    ) {
        errors.push({
            field: 'maxDelayMs',
            message: 'maxDelayMs must be greater than or equal to initialDelayMs',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate ping/pong configuration
 */
export function validatePingPongConfig(config: PingPongConfig): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof config.enabled !== 'boolean') {
        errors.push({
            field: 'enabled',
            message: 'enabled must be a boolean',
        });
    }

    if (typeof config.intervalMs !== 'number' || config.intervalMs <= 0) {
        errors.push({
            field: 'intervalMs',
            message: 'intervalMs must be a positive number',
        });
    }

    if (typeof config.timeoutMs !== 'number' || config.timeoutMs <= 0) {
        errors.push({
            field: 'timeoutMs',
            message: 'timeoutMs must be a positive number',
        });
    }

    if (config.intervalMs && config.timeoutMs && config.timeoutMs >= config.intervalMs) {
        errors.push({
            field: 'timeoutMs',
            message: 'timeoutMs must be less than intervalMs',
        });
    }

    if (config.onTimeout !== undefined) {
        const validActions: PingPongTimeoutAction[] = ['reconnect', 'error', 'ignore'];
        if (!validActions.includes(config.onTimeout)) {
            errors.push({
                field: 'onTimeout',
                message: `onTimeout must be one of: ${validActions.join(', ')}`,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate connection limits configuration
 */
export function validateConnectionLimitsConfig(
    config: ConnectionLimitsConfig
): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof config.maxConnections !== 'number' || config.maxConnections <= 0) {
        errors.push({
            field: 'maxConnections',
            message: 'maxConnections must be a positive number',
        });
    }

    if (
        config.maxSubscriptionsPerConnection !== undefined &&
        config.maxSubscriptionsPerConnection <= 0
    ) {
        errors.push({
            field: 'maxSubscriptionsPerConnection',
            message: 'maxSubscriptionsPerConnection must be positive',
        });
    }

    if (
        config.maxMessagesPerSecond !== undefined &&
        config.maxMessagesPerSecond <= 0
    ) {
        errors.push({
            field: 'maxMessagesPerSecond',
            message: 'maxMessagesPerSecond must be positive',
        });
    }

    if (
        config.connectionTimeoutMs !== undefined &&
        config.connectionTimeoutMs <= 0
    ) {
        errors.push({
            field: 'connectionTimeoutMs',
            message: 'connectionTimeoutMs must be positive',
        });
    }

    if (config.idleTimeoutMs !== undefined && config.idleTimeoutMs <= 0) {
        errors.push({
            field: 'idleTimeoutMs',
            message: 'idleTimeoutMs must be positive',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate heartbeat configuration
 */
export function validateHeartbeatConfig(config: HeartbeatConfig): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof config.enabled !== 'boolean') {
        errors.push({
            field: 'enabled',
            message: 'enabled must be a boolean',
        });
    }

    if (typeof config.intervalMs !== 'number' || config.intervalMs <= 0) {
        errors.push({
            field: 'intervalMs',
            message: 'intervalMs must be a positive number',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate CCXT integration configuration
 */
export function validateCCXTIntegrationConfig(
    config: CCXTIntegrationConfig
): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(config.watchMethods)) {
        errors.push({
            field: 'watchMethods',
            message: 'watchMethods must be an array',
        });
    } else {
        config.watchMethods.forEach((watchMethod, index) => {
            if (!watchMethod.method || typeof watchMethod.method !== 'string') {
                errors.push({
                    field: `watchMethods[${index}].method`,
                    message: 'method is required and must be a string',
                });
            }

            if (!watchMethod.channel || typeof watchMethod.channel !== 'string') {
                errors.push({
                    field: `watchMethods[${index}].channel`,
                    message: 'channel is required and must be a string',
                });
            }

            if (!watchMethod.parser || typeof watchMethod.parser !== 'string') {
                errors.push({
                    field: `watchMethods[${index}].parser`,
                    message: 'parser is required and must be a string',
                });
            }
        });
    }

    if (config.orderBookDepth !== undefined && config.orderBookDepth <= 0) {
        errors.push({
            field: 'orderBookDepth',
            message: 'orderBookDepth must be positive',
        });
    }

    if (config.tradesLimit !== undefined && config.tradesLimit <= 0) {
        errors.push({
            field: 'tradesLimit',
            message: 'tradesLimit must be positive',
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate complete runtime behavior configuration
 */
export function validateRuntimeBehavior(
    config: RuntimeBehaviorSchema
): ValidationResult {
    const errors: ValidationError[] = [];

    if (config.reconnection) {
        const result = validateAutoResubscribeConfig(config.reconnection);
        errors.push(...result.errors);
    }

    if (config.pingPong) {
        const result = validatePingPongConfig(config.pingPong);
        errors.push(...result.errors);
    }

    if (config.connectionLimits) {
        const result = validateConnectionLimitsConfig(config.connectionLimits);
        errors.push(...result.errors);
    }

    if (config.heartbeat) {
        const result = validateHeartbeatConfig(config.heartbeat);
        errors.push(...result.errors);
    }

    if (config.ccxtIntegration) {
        const result = validateCCXTIntegrationConfig(config.ccxtIntegration);
        errors.push(...result.errors);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================
// Default Configuration
// ============================================================

/**
 * Get default runtime behavior configuration
 * Provides sensible defaults for all runtime behavior settings
 */
export function getDefaultRuntimeBehavior(): RuntimeBehaviorSchema {
    return {
        reconnection: {
            enabled: true,
            strategy: 'exponential-backoff',
            maxRetries: 10,
            initialDelayMs: 1000,
            maxDelayMs: 60000,
            backoffMultiplier: 2,
            preserveSubscriptionState: true,
        },
        pingPong: {
            enabled: true,
            intervalMs: 30000,
            timeoutMs: 10000,
            onTimeout: 'reconnect',
        },
        connectionLimits: {
            maxConnections: 5,
            maxSubscriptionsPerConnection: 200,
            connectionTimeoutMs: 30000,
            idleTimeoutMs: 300000, // 5 minutes
        },
        heartbeat: {
            enabled: false,
            intervalMs: 30000,
        },
        ccxtIntegration: {
            watchMethods: [],
            orderBookDepth: 20,
            tradesLimit: 50,
            snapshotOnConnect: true,
        },
    };
}

/**
 * Merge user configuration with defaults
 * Deep merges user config over default config
 */
export function mergeWithDefaults(
    userConfig: Partial<RuntimeBehaviorSchema>
): RuntimeBehaviorSchema {
    const defaults = getDefaultRuntimeBehavior();

    return {
        reconnection: userConfig.reconnection
            ? { ...defaults.reconnection, ...userConfig.reconnection }
            : defaults.reconnection,
        pingPong: userConfig.pingPong
            ? { ...defaults.pingPong, ...userConfig.pingPong }
            : defaults.pingPong,
        connectionLimits: userConfig.connectionLimits
            ? { ...defaults.connectionLimits, ...userConfig.connectionLimits }
            : defaults.connectionLimits,
        heartbeat: userConfig.heartbeat
            ? { ...defaults.heartbeat, ...userConfig.heartbeat }
            : defaults.heartbeat,
        ccxtIntegration: userConfig.ccxtIntegration
            ? {
                  ...defaults.ccxtIntegration,
                  ...userConfig.ccxtIntegration,
                  watchMethods:
                      userConfig.ccxtIntegration.watchMethods ||
                      defaults.ccxtIntegration!.watchMethods,
              }
            : defaults.ccxtIntegration,
    };
}
