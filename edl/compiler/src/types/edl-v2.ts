/**
 * Enhanced EDL Types - Version 2
 * Supports complex exchange patterns without overrides
 */

// ============================================================
// Core Expression Language
// ============================================================

/**
 * Expression types for computed values
 * Supports path access, literals, operations, and function calls
 */
export type Expression =
    | PathExpression
    | LiteralExpression
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | ConditionalExpression
    | ArrayExpression
    | ObjectExpression
    | TemplateExpression;

export interface PathExpression {
    type: 'path';
    path: string;  // e.g., "response.data.balance", "this.apiKey", "params.symbol"
}

export interface LiteralExpression {
    type: 'literal';
    value: string | number | boolean | null;
}

export interface BinaryExpression {
    type: 'binary';
    operator: '+' | '-' | '*' | '/' | '==' | '!=' | '>' | '<' | '>=' | '<=' | '&&' | '||' | '??' | 'in' | 'contains' | 'startsWith' | 'endsWith';
    left: Expression;
    right: Expression;
}

export interface UnaryExpression {
    type: 'unary';
    operator: '!' | '-' | 'typeof';
    operand: Expression;
}

export interface CallExpression {
    type: 'call';
    function: string;  // Built-in functions: encode, decode, hmac, hash, base64, urlencode, json, etc.
    args: Expression[];
}

export interface ConditionalExpression {
    type: 'conditional';
    condition: Expression;
    then: Expression;
    else: Expression;
}

export interface ArrayExpression {
    type: 'array';
    elements: Expression[];
}

export interface ObjectExpression {
    type: 'object';
    properties: Record<string, Expression>;
}

export interface TemplateExpression {
    type: 'template';
    parts: (string | Expression)[];  // "Hello {name}" → ["Hello ", {type: 'path', path: 'name'}]
}

// ============================================================
// Enhanced Authentication Types
// ============================================================

/**
 * Multi-variant authentication supporting runtime selection
 */
export interface EnhancedAuthMethod {
    // Default variant
    default?: AuthVariant;

    // Named variants for runtime selection
    variants?: Record<string, AuthVariant>;

    // Selection logic - which variant to use based on conditions
    select?: AuthSelector[];

    // Per-endpoint overrides
    endpoints?: Record<string, AuthVariant | string>;  // string = variant name reference
}

export interface AuthVariant {
    type: 'hmac' | 'rsa' | 'eddsa' | 'jwt' | 'apiKey' | 'custom';

    // Signing pipeline - multiple steps executed in sequence
    pipeline?: SigningStep[];

    // Simple single-step signing (shorthand for pipeline with one step)
    algorithm?: string;
    encoding?: 'hex' | 'base64' | 'binary';

    // What gets signed
    signatureInput?: SignatureInput;

    // Where signature goes
    signatureOutput?: SignatureOutput;

    // Headers to add
    headers?: Record<string, Expression>;

    // Custom nonce generation
    nonce?: NonceConfig;
}

export interface SigningStep {
    operation: 'hash' | 'hmac' | 'rsa' | 'eddsa' | 'encode' | 'decode' | 'concat' | 'urlencode' | 'urlencodeNested' | 'json';
    algorithm?: string;  // sha256, sha512, ed25519, etc.
    input: Expression;   // What to process
    key?: Expression;    // For HMAC/RSA/EdDSA
    encoding?: 'hex' | 'base64' | 'binary' | 'utf8';
    output?: string;     // Variable name to store result (default: $result)
}

export interface SignatureInput {
    // What components make up the signature input
    components: SignatureComponent[];
    separator?: string;
}

export interface SignatureComponent {
    source: 'nonce' | 'timestamp' | 'method' | 'path' | 'query' | 'body' | 'params' | 'custom';
    value?: Expression;  // For custom source
    transform?: 'urlencode' | 'json' | 'sort' | 'uppercase' | 'lowercase';
}

export interface SignatureOutput {
    location: 'header' | 'query' | 'body';
    name: string;
    format?: 'raw' | 'prefixed';
    prefix?: string;
}

export interface NonceConfig {
    type: 'timestamp_ms' | 'timestamp_s' | 'counter' | 'uuid' | 'custom';
    adjustment?: Expression;  // e.g., "this.options.timeDifference"
}

export interface AuthSelector {
    condition: Expression;
    variant: string;
}

// ============================================================
// Enhanced API Definition Types
// ============================================================

export interface EnhancedAPIDefinition {
    // Base URL(s)
    baseUrls?: Record<string, string | Record<string, string>>;

    // API categories
    public?: EnhancedAPICategory;
    private?: EnhancedAPICategory;
    [key: string]: EnhancedAPICategory | Record<string, string | Record<string, string>> | undefined;
}

export interface EnhancedAPICategory {
    // HTTP methods
    get?: Record<string, EnhancedEndpoint>;
    post?: Record<string, EnhancedEndpoint>;
    put?: Record<string, EnhancedEndpoint>;
    delete?: Record<string, EnhancedEndpoint>;

    // Default auth variant for this category
    auth?: string;

    // Default rate limit cost
    defaultCost?: number;
}

export interface EnhancedEndpoint {
    path?: string;
    cost?: number | CostConfig;

    // Parameter definitions
    params?: Record<string, EnhancedParamDefinition>;

    // Request body configuration
    body?: BodyConfig;

    // Response configuration
    response?: EnhancedResponseDefinition;

    // Override auth for this endpoint
    auth?: string;

    // Rate limiting
    rateLimit?: RateLimitConfig;

    // Special handling flags
    flags?: EndpointFlags;
}

export interface CostConfig {
    default: number;
    // Dynamic cost based on params
    byParam?: Record<string, number>;
    byLimit?: [number, number][];  // [[limitThreshold, cost], ...]
}

export interface EnhancedParamDefinition {
    type: ParamType;
    required?: boolean;
    requiredIf?: Expression;
    default?: any;
    alias?: string;
    transform?: Expression | TransformType;
    validate?: Expression;
    description?: string;
}

export type ParamType =
    | 'string' | 'number' | 'integer' | 'float' | 'boolean'
    | 'timestamp' | 'timestamp_ms' | 'timestamp_s'
    | 'array' | 'object' | 'symbol' | 'currency';

export interface BodyConfig {
    encoding: 'json' | 'urlencode' | 'urlencodeNested' | 'form' | 'raw';
    // Conditional encoding based on endpoint or params
    conditional?: ConditionalEncoding[];
}

export interface ConditionalEncoding {
    condition: Expression;
    encoding: 'json' | 'urlencode' | 'urlencodeNested' | 'form' | 'raw';
}

export interface EndpointFlags {
    noAuth?: boolean;
    specialAuth?: string;  // e.g., "apiKeyOnly" for historicalTrades
}

export interface RateLimitConfig {
    cost: number;
    interval?: number;
    limit?: number;
    // Conditional costs
    conditions?: Array<{ when: Expression; cost: number }>;
}

// ============================================================
// Enhanced Response & Parser Types
// ============================================================

export interface EnhancedResponseDefinition {
    // Detect response format
    formatDetection?: FormatDetection;

    // Different parsers for different formats
    parsers?: Record<string, string>;

    // Single parser (shorthand)
    parser?: string;

    // Error detection
    errorDetection?: ErrorDetection;
}

export interface FormatDetection {
    // How to determine which parser to use
    rules: FormatRule[];
    default?: string;  // Default parser name
}

export interface FormatRule {
    condition: Expression;  // e.g., "Array.isArray(response)", "'positionSide' in response"
    parser: string;
}

export interface ErrorDetection {
    // Check if response is an error
    isError: Expression;
    // Extract error info
    errorCode?: Expression;
    errorMessage?: Expression;
}

// ============================================================
// Enhanced Parser Definition
// ============================================================

export interface EnhancedParserDefinition {
    // Source data path
    source?: string;  // e.g., "response.result", "response.data"

    // Is the source an array?
    isArray?: boolean;

    // Iteration config for arrays
    iterate?: IterationConfig;

    // Field mappings
    mapping: Record<string, EnhancedFieldMapping>;

    // Post-processing steps
    postProcess?: PostProcessStep[];

    // Context variables available during parsing
    context?: Record<string, Expression>;
}

export interface IterationConfig {
    // Array to iterate over
    array?: Expression;
    // Variable name for current item
    itemVar?: string;  // default: 'item'
    // Variable name for index
    indexVar?: string;  // default: 'index'
}

export type EnhancedFieldMapping =
    | string  // Simple path shorthand
    | PathMapping
    | ComputeMapping
    | ConditionalMapping
    | ArrayMapping
    | SwitchMapping;

export interface PathMapping {
    path: string | string[];  // string[] for fallback chain
    transform?: TransformType | TransformType[];
    default?: any;
}

export interface ComputeMapping {
    compute: Expression;
}

export interface ConditionalMapping {
    if: Expression;
    then: EnhancedFieldMapping;
    else?: EnhancedFieldMapping;
}

export interface ArrayMapping {
    map: string;  // Path to array
    itemMapping: Record<string, EnhancedFieldMapping>;
}

export interface SwitchMapping {
    switch: Expression;
    cases: Record<string, EnhancedFieldMapping>;
    default?: EnhancedFieldMapping;
}

export type TransformType =
    | 'safeString' | 'safeNumber' | 'safeInteger' | 'safeTimestamp' | 'safeBoolean'
    | 'parseNumber' | 'parseString' | 'parseTimestamp' | 'parseBoolean'
    | 'parseCurrencyCode' | 'parseSymbol' | 'parseOrderStatus' | 'parseOrderType' | 'parseOrderSide'
    | 'lowercase' | 'uppercase' | 'trim'
    | 'omitZero' | 'stringDiv100'
    | CustomTransform;

export interface CustomTransform {
    name: string;
    args?: Expression[];
}

export interface PostProcessStep {
    operation: 'safeBalance' | 'sortBy' | 'filterBy' | 'custom';
    args?: Expression[];
}

// ============================================================
// Method Variants - Multiple implementations per method
// ============================================================

export interface MethodVariants {
    // Different implementations based on account type, market type, etc.
    variants: MethodVariant[];

    // How to select which variant to use
    selection: VariantSelection;
}

export interface MethodVariant {
    name: string;
    condition?: Expression;  // When to use this variant
    endpoint: string;  // API endpoint to call
    request?: RequestConfig;
    response?: string;  // Parser name
}

export interface VariantSelection {
    // Parameter that determines variant
    param?: string;  // e.g., 'type' for account type

    // Or complex condition
    rules?: VariantRule[];

    default?: string;  // Default variant name
}

export interface VariantRule {
    condition: Expression;
    variant: string;
}

export interface RequestConfig {
    // Parameters to include in request
    params?: Record<string, Expression>;

    // Transform parameters
    transforms?: Record<string, Expression>;
}

// ============================================================
// Exchange Definition Document (Enhanced)
// ============================================================

export interface EnhancedEDLDocument {
    version: string;

    exchange: EnhancedExchangeMetadata;

    // Authentication configuration
    auth?: EnhancedAuthMethod;

    // API definition
    api?: EnhancedAPIDefinition;

    // Markets configuration
    markets?: MarketsDefinition;

    // Parser definitions
    parsers?: Record<string, EnhancedParserDefinition>;

    // Method implementations with variants
    methods?: Record<string, MethodVariants | MethodVariant>;

    // Error handling
    errors?: EnhancedErrorDefinition;

    // Feature flags
    features?: Record<string, boolean>;

    // Exchange-specific options
    options?: Record<string, any>;
}

export interface EnhancedExchangeMetadata {
    id: string;
    name: string;
    countries: string[];
    version?: string;
    rateLimit: number;
    certified?: boolean;
    pro?: boolean;

    urls?: {
        logo?: string;
        api?: Record<string, string | Record<string, string>>;
        www?: string;
        doc?: string[];
        fees?: string;
        referral?: string;
    };

    requiredCredentials?: {
        apiKey?: boolean;
        secret?: boolean;
        uid?: boolean;
        login?: boolean;
        password?: boolean;
        twofa?: boolean;
        privateKey?: boolean;
        walletAddress?: boolean;
        token?: boolean;
    };

    // Time synchronization
    timeSync?: {
        enabled: boolean;
        endpoint?: string;
        interval?: number;
    };

    // Broker ID configuration
    broker?: Record<string, string>;
}

export interface MarketsDefinition {
    endpoint: string;
    path?: string;
    parser?: string;
    symbolMapping?: {
        template: string;
        baseId: string;
        quoteId: string;
        settleId?: string;
    };
    filters?: MarketFilter[];
}

export interface MarketFilter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
    value: any;
}

export interface EnhancedErrorDefinition {
    // Per-market-type error mappings
    mappings?: Record<string, ErrorMapping>;

    // Default error mapping
    default?: ErrorMapping;

    // HTTP status code mappings
    httpCodes?: Record<string, string>;
}

export interface ErrorMapping {
    exact?: Record<string, string>;  // Exact error code → exception class
    broad?: Record<string, string>;  // Pattern matching
}

// ============================================================
// Helper type for easy YAML authoring
// ============================================================

/**
 * Shorthand expression syntax for YAML:
 * - "$path.to.value" → PathExpression
 * - "{{template}}" → TemplateExpression
 * - Direct values → LiteralExpression
 * - Objects with 'if/then/else' → ConditionalExpression
 */
export type ExpressionShorthand = string | number | boolean | null | {
    if: ExpressionShorthand;
    then: ExpressionShorthand;
    else?: ExpressionShorthand;
} | {
    call: string;
    args: ExpressionShorthand[];
} | {
    op: string;
    left: ExpressionShorthand;
    right: ExpressionShorthand;
};
