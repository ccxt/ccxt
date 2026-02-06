/**
 * WebSocket Reconciliation Types
 * TypeScript types for WebSocket data reconciliation in CCXT
 */

// ============================================================
// Snapshot Types
// ============================================================

/**
 * Type of snapshot data
 */
export type SnapshotType = 'orderBook' | 'trades' | 'ticker' | 'balance';

/**
 * Snapshot definition for WebSocket reconciliation
 * Represents a complete state snapshot at a point in time
 */
export interface SnapshotDefinition {
    /**
     * Type of snapshot data
     */
    type: SnapshotType;

    /**
     * Trading pair symbol
     */
    symbol: string;

    /**
     * The snapshot data structure (varies by type)
     */
    data: any;

    /**
     * Snapshot timestamp in milliseconds
     */
    timestamp: number;

    /**
     * Monotonic sequence number (optional)
     */
    nonce?: number;

    /**
     * Alternative to nonce - sequence identifier (optional)
     */
    sequenceId?: number;

    /**
     * Optional checksum of the snapshot data
     */
    checksum?: string;
}

// ============================================================
// Typed Snapshot Variants
// ============================================================

/**
 * Generic snapshot with typed data
 * Extends SnapshotDefinition with type-safe data field
 */
export interface TypedSnapshot<T> extends Omit<SnapshotDefinition, 'data'> {
    /**
     * Typed snapshot data
     */
    data: T;
}

/**
 * Order book snapshot data structure
 * Represents a complete order book state
 */
export interface OrderBookSnapshot {
    /**
     * Bid orders sorted by price (descending)
     * Each entry is [price, amount]
     */
    bids: [number, number][];

    /**
     * Ask orders sorted by price (ascending)
     * Each entry is [price, amount]
     */
    asks: [number, number][];

    /**
     * Optional nonce/sequence number for the order book state
     */
    nonce?: number;
}

/**
 * Trades snapshot data structure
 * Represents a list of recent trades
 */
export interface TradesSnapshot {
    /**
     * List of trades
     */
    trades: Array<{
        /**
         * Unique trade identifier
         */
        id: string | number;

        /**
         * Trade price
         */
        price: number;

        /**
         * Trade amount/size
         */
        amount: number;

        /**
         * Trade side
         */
        side: 'buy' | 'sell';

        /**
         * Trade timestamp in milliseconds
         */
        timestamp: number;
    }>;
}

/**
 * Ticker snapshot data structure
 * Represents current market ticker state
 */
export interface TickerSnapshot {
    /**
     * Trading pair symbol
     */
    symbol: string;

    /**
     * 24h high price
     */
    high: number;

    /**
     * 24h low price
     */
    low: number;

    /**
     * Current best bid price
     */
    bid: number;

    /**
     * Current best ask price
     */
    ask: number;

    /**
     * Last trade price
     */
    last: number;

    /**
     * 24h trading volume
     */
    volume: number;

    /**
     * Timestamp of ticker data
     */
    timestamp: number;
}

// ============================================================
// Delta Types
// ============================================================

/**
 * Type of delta operation
 */
export type DeltaType = 'insert' | 'update' | 'delete' | 'snapshot';

/**
 * Delta (incremental update) definition for WebSocket reconciliation
 * Represents a change to be applied to existing state
 */
export interface DeltaDefinition {
    /**
     * Type of delta operation
     */
    type: DeltaType;

    /**
     * JSONPath or dotted path indicating where in the data structure to apply the delta
     * Examples: "bids[0]", "data.price", "asks"
     */
    path: string;

    /**
     * The delta change data
     */
    data: any;

    /**
     * Sequence ID of this delta
     */
    sequenceId: number;

    /**
     * Previous sequence ID (for validation)
     * Helps detect missing messages
     */
    previousSequenceId?: number;
}

// ============================================================
// Checksum Types
// ============================================================

/**
 * Checksum algorithm types
 */
export type ChecksumAlgorithm = 'crc32' | 'sha256' | 'md5' | 'custom';

/**
 * Checksum configuration for WebSocket data validation
 * Used to verify data integrity
 */
export interface ChecksumDefinition {
    /**
     * Hashing algorithm to use for checksum validation
     */
    algorithm: ChecksumAlgorithm;

    /**
     * List of field names to include in checksum calculation
     * Example: ["price", "amount", "timestamp"]
     */
    fields: string[];

    /**
     * Format string or template describing how to format data before hashing
     * Example: "{price}:{amount}" or "price,amount,timestamp"
     */
    format?: string;

    /**
     * JSONPath or dotted path to the checksum value in the WebSocket message
     * Example: "data.checksum" or "checksum"
     */
    expectedPath?: string;

    /**
     * Name of custom checksum function for exchange-specific algorithms
     * Used when algorithm is 'custom'
     */
    customFunction?: string;
}

// ============================================================
// Reconciliation Rules Types
// ============================================================

/**
 * Action to take when mismatch is detected
 */
export type OnMismatchAction = 'resync' | 'error' | 'warn';

/**
 * Reconciliation rules and behavior configuration
 * Defines how the reconciliation process should behave
 */
export interface ReconciliationRules {
    /**
     * How often to request a full snapshot (in milliseconds)
     * 0 means snapshot-only mode (no incremental updates)
     * null or undefined means delta-only mode (no periodic snapshots)
     */
    snapshotInterval?: number;

    /**
     * Maximum allowed gap in sequence IDs before triggering a resync
     * 0 disables gap detection
     */
    maxGapBeforeResync?: number;

    /**
     * Whether to validate checksums if available
     */
    checksumValidation?: boolean;

    /**
     * Action to take when checksum or sequence mismatch is detected
     * - 'resync': Request a new snapshot and rebuild state
     * - 'error': Throw an error
     * - 'warn': Log a warning but continue
     */
    onMismatch?: OnMismatchAction;

    /**
     * Whether to buffer deltas while waiting for snapshot
     * If true, deltas received before initial snapshot will be queued
     */
    bufferDeltas?: boolean;

    /**
     * Maximum number of deltas to buffer before discarding
     * Prevents memory issues from unbounded buffers
     */
    maxBufferSize?: number;
}

// ============================================================
// WebSocket Reconciliation Configuration
// ============================================================

/**
 * Channel-specific snapshot configurations
 */
export interface SnapshotConfigurations {
    [channel: string]: SnapshotDefinition;
}

/**
 * Channel-specific delta configurations
 */
export interface DeltaConfigurations {
    [channel: string]: DeltaDefinition;
}

/**
 * Channel-specific checksum configurations
 */
export interface ChecksumConfigurations {
    [channel: string]: ChecksumDefinition;
}

/**
 * WebSocket reconciliation configuration
 * Main configuration object for WebSocket data reconciliation
 */
export interface WebSocketReconciliationConfig {
    /**
     * Enable WebSocket data reconciliation
     */
    enabled?: boolean;

    /**
     * Snapshot configuration for each channel
     */
    snapshots?: SnapshotConfigurations;

    /**
     * Delta configuration for each channel
     */
    deltas?: DeltaConfigurations;

    /**
     * Checksum configuration for each channel
     */
    checksums?: ChecksumConfigurations;

    /**
     * Global reconciliation rules
     */
    rules?: ReconciliationRules;
}

/**
 * WebSocket configuration
 * Top-level WebSocket configuration object
 */
export interface WebSocketConfig {
    /**
     * Reconciliation configuration
     */
    reconciliation?: WebSocketReconciliationConfig;

    /**
     * Channel definitions
     * Maps channel names to their configurations
     */
    channels?: Record<string, ChannelDefinition>;
}

// ============================================================
// Runtime State Types (for implementation)
// ============================================================

/**
 * Runtime state for reconciliation
 * Used internally to track reconciliation state
 */
export interface ReconciliationState {
    /**
     * Last processed sequence ID
     */
    lastSequenceId?: number;

    /**
     * Current snapshot
     */
    currentSnapshot?: SnapshotDefinition;

    /**
     * Buffered deltas waiting to be applied
     */
    deltaBuffer: DeltaDefinition[];

    /**
     * Whether we're waiting for a snapshot
     */
    waitingForSnapshot: boolean;

    /**
     * Last successful checksum validation timestamp
     */
    lastChecksumValidation?: number;

    /**
     * Count of checksum mismatches
     */
    checksumMismatchCount: number;

    /**
     * Count of sequence gaps detected
     */
    sequenceGapCount: number;
}

// ============================================================
// Delta Application Utilities
// ============================================================

/**
 * Result of applying a delta to a snapshot
 * Contains success status, updated state, and metadata
 */
export interface DeltaApplicationResult<T> {
    /**
     * Whether the delta was successfully applied
     */
    success: boolean;

    /**
     * The new state after applying the delta
     */
    newState: T;

    /**
     * The sequence ID of the applied delta
     */
    appliedSequenceId: number;

    /**
     * Number of deltas that were dropped (e.g., due to sequence gaps)
     */
    droppedDeltas?: number;

    /**
     * Error message if application failed
     */
    error?: string;
}

/**
 * Delta queue management information
 * Tracks the state of buffered deltas
 */
export interface DeltaQueue {
    /**
     * Maximum number of deltas that can be queued
     */
    maxSize: number;

    /**
     * Current number of deltas in the queue
     */
    currentSize: number;

    /**
     * Sequence ID of the oldest delta in the queue
     */
    oldestSequenceId?: number;

    /**
     * Sequence ID of the newest delta in the queue
     */
    newestSequenceId?: number;
}

/**
 * Statistics for reconciliation operations
 * Tracks metrics for monitoring and debugging
 */
export interface ReconciliationStats {
    /**
     * Total number of snapshots received
     */
    snapshotsReceived: number;

    /**
     * Total number of deltas successfully applied
     */
    deltasApplied: number;

    /**
     * Total number of deltas dropped (e.g., due to gaps or errors)
     */
    deltasDropped: number;

    /**
     * Total number of checksum validations performed
     */
    checksumValidations: number;

    /**
     * Total number of checksum validation failures
     */
    checksumFailures: number;

    /**
     * Total number of resyncs triggered
     */
    resyncs: number;

    /**
     * Timestamp of last successful synchronization
     */
    lastSyncTimestamp?: number;
}

/**
 * Reconciliation event types
 */
export type ReconciliationEventType =
    | 'snapshot_received'
    | 'delta_applied'
    | 'checksum_validated'
    | 'checksum_failed'
    | 'sequence_gap_detected'
    | 'resync_triggered'
    | 'buffer_overflow';

/**
 * Reconciliation event
 */
export interface ReconciliationEvent {
    /**
     * Event type
     */
    type: ReconciliationEventType;

    /**
     * Channel identifier
     */
    channel: string;

    /**
     * Symbol (if applicable)
     */
    symbol?: string;

    /**
     * Timestamp of the event
     */
    timestamp: number;

    /**
     * Additional event data
     */
    data?: any;

    /**
     * Error information (if applicable)
     */
    error?: Error;
}

/**
 * Reconciliation event handler
 */
export type ReconciliationEventHandler = (event: ReconciliationEvent) => void;

// ============================================================
// Channel Types
// ============================================================

/**
 * Type of channel (public or private)
 */
export type ChannelType = 'public' | 'private';

/**
 * Type of data provided by the channel
 */
export type ChannelDataType = 'ticker' | 'trades' | 'orderbook' | 'ohlcv' | 'orders' | 'balance' | 'positions';

/**
 * Channel definition
 * Represents a WebSocket channel configuration including subscription payloads,
 * message filtering, throttling, multiplexing, and authentication
 */
export interface ChannelDefinition {
    /**
     * Channel name identifier
     */
    name: string;

    /**
     * Channel type (public or private)
     */
    type: ChannelType;

    /**
     * Type of data this channel provides
     */
    dataType: ChannelDataType;

    /**
     * Payload template for subscribing to this channel
     */
    subscribePayload: PayloadTemplate;

    /**
     * Optional payload template for unsubscribing from this channel
     */
    unsubscribePayload?: PayloadTemplate;

    /**
     * Optional message filter for identifying channel responses
     */
    messageFilter?: MessageFilter;

    /**
     * Optional throttling configuration
     */
    throttling?: ThrottlingConfig;

    /**
     * Optional multiplexing configuration
     */
    multiplexing?: MultiplexingConfig;

    /**
     * Optional authentication configuration for private channels
     */
    auth?: ChannelAuthConfig;
}

// ============================================================
// Payload Template Types
// ============================================================

/**
 * Payload template with variable substitution
 * Supports both string and object templates with dynamic variable injection
 */
export interface PayloadTemplate {
    /**
     * Template as string or object
     * Variables in the template will be substituted at runtime
     */
    template: string | object;

    /**
     * Variable definitions for template substitution
     */
    variables?: Record<string, VariableDefinition>;
}

/**
 * Variable definition for payload templates
 */
export interface VariableDefinition {
    /**
     * Source of the variable value
     * - parameter: From function parameters
     * - context: From execution context
     * - computed: Computed from an expression
     */
    source: 'parameter' | 'context' | 'computed';

    /**
     * Path to extract value from source
     * JSONPath or dotted notation
     */
    path?: string;

    /**
     * Expression to compute the value
     * Used when source is 'computed'
     */
    compute?: string;

    /**
     * Default value if variable is not available
     */
    default?: any;
}

// ============================================================
// Message Filter Types
// ============================================================

/**
 * Message filter for identifying channel responses
 * Used to filter incoming WebSocket messages for this channel
 */
export interface MessageFilter {
    /**
     * Field name to check in the message
     */
    field: string;

    /**
     * Exact value to match (if not using pattern)
     */
    value?: string | number;

    /**
     * Regular expression pattern to match
     */
    pattern?: string;
}

// ============================================================
// Throttling Types
// ============================================================

/**
 * Throttling configuration for channel subscriptions
 * Controls rate limiting and backoff behavior
 */
export interface ThrottlingConfig {
    /**
     * Maximum number of subscriptions allowed per second
     */
    maxSubscriptionsPerSecond?: number;

    /**
     * Minimum interval between subscriptions in milliseconds
     */
    minSubscriptionInterval?: number;

    /**
     * Backoff configuration for handling rate limits
     */
    backoff?: BackoffConfig;
}

/**
 * Backoff algorithm configuration
 */
export interface BackoffConfig {
    /**
     * Backoff algorithm type
     * - linear: Add a fixed amount on each retry
     * - exponential: Multiply by a factor on each retry
     */
    type: 'linear' | 'exponential';

    /**
     * Initial backoff delay in milliseconds
     */
    initial: number;

    /**
     * Maximum backoff delay in milliseconds
     */
    max: number;

    /**
     * Multiplier for exponential backoff
     * Used when type is 'exponential'
     */
    multiplier?: number;
}

// ============================================================
// Multiplexing Types
// ============================================================

/**
 * Multiplexing configuration for combining multiple streams
 * Controls how multiple subscriptions are managed across connections
 */
export interface MultiplexingConfig {
    /**
     * Whether multiplexing is enabled
     */
    enabled: boolean;

    /**
     * Maximum number of symbols per WebSocket connection
     */
    maxSymbolsPerConnection?: number;

    /**
     * Maximum number of channels per WebSocket connection
     */
    maxChannelsPerConnection?: number;

    /**
     * Size of the connection pool for load distribution
     */
    connectionPoolSize?: number;
}

// ============================================================
// Channel Authentication Types
// ============================================================

/**
 * Authentication configuration for private channels
 * Supports various authentication patterns used by exchanges
 */
export interface ChannelAuthConfig {
    /**
     * Authentication type
     * - listenKey: Listen key style (e.g., Binance)
     * - signature: HMAC signature style (e.g., Kraken)
     * - token: Bearer token style
     * - challenge: Challenge-response authentication
     */
    type: 'listenKey' | 'signature' | 'token' | 'challenge';

    /**
     * REST API endpoint to obtain listen key
     * Used when type is 'listenKey'
     */
    listenKeyEndpoint?: string;

    /**
     * Refresh interval for listen key in milliseconds
     * Used when type is 'listenKey'
     */
    listenKeyRefreshInterval?: number;

    /**
     * List of fields to include in signature calculation
     * Used when type is 'signature'
     */
    signatureFields?: string[];

    /**
     * Name of custom handler function for challenge-response
     * Used when type is 'challenge'
     */
    challengeHandler?: string;
}
