/**
 * EDL (Exchange Definition Language) Core Types
 * TypeScript implementation of EDL ADTs
 */
export interface ExchangeMetadata {
    id: string;
    name: string;
    countries: string[];
    version?: string;
    rateLimit: number;
    certified?: boolean;
    pro?: boolean;
    hostname?: string;
    urls?: URLConfig;
    has?: Record<string, boolean>;
    timeframes?: Record<string, string>;
    requiredCredentials?: RequiredCredentials;
}
export interface URLConfig {
    logo?: string;
    api?: Record<string, string | Record<string, string>>;
    www?: string;
    doc?: string[];
    fees?: string;
    referral?: string;
}
export interface RequiredCredentials {
    apiKey?: boolean;
    secret?: boolean;
    uid?: boolean;
    login?: boolean;
    password?: boolean;
    twofa?: boolean;
    privateKey?: boolean;
    walletAddress?: boolean;
    token?: boolean;
}
export type AuthType = 'hmac' | 'jwt' | 'rsa' | 'eddsa' | 'apiKey' | 'oauth' | 'custom';
export type HashAlgorithm = 'sha256' | 'sha384' | 'sha512' | 'md5';
export type EncodingFormat = 'hex' | 'base64' | 'base58';
export type SignatureLocation = 'query' | 'header' | 'body';
export interface AuthMethod {
    type: AuthType;
    algorithm?: HashAlgorithm | string;
    encoding?: EncodingFormat;
    location?: SignatureLocation;
    headers?: Record<string, string>;
    timestampField?: string;
    nonceField?: string;
    signatureField?: string;
    custom?: CustomAuth;
}
export interface CustomAuth {
    preHash?: string[];
    postHash?: string[];
    template?: string;
}
export interface APIDefinition {
    public?: APICategory;
    private?: APICategory;
    [key: string]: APICategory | undefined;
}
export interface APICategory {
    get?: Record<string, EndpointDefinition>;
    post?: Record<string, EndpointDefinition>;
    put?: Record<string, EndpointDefinition>;
    delete?: Record<string, EndpointDefinition>;
    patch?: Record<string, EndpointDefinition>;
}
export interface EndpointDefinition {
    path?: string;
    cost?: number;
    params?: Record<string, ParamDefinition>;
    response?: ResponseDefinition;
    rateLimit?: RateLimitConfig;
}
export interface ParamDefinition {
    type: ParamType;
    required?: boolean;
    default?: any;
    alias?: string;
    validate?: string;
    transform?: string;
    description?: string;
    requiredIf?: string;
}
export type ParamType = 'string' | 'number' | 'float' | 'integer' | 'boolean' | 'array' | 'object' | 'timestamp';
export interface ResponseDefinition {
    type?: 'json' | 'text' | 'binary';
    path?: string;
    pagination?: PaginationConfig;
}
export interface PaginationConfig {
    type: 'cursor' | 'offset' | 'page';
    cursorPath?: string;
    limitParam?: string;
    offsetParam?: string;
    pageParam?: string;
}
export interface RateLimitConfig {
    cost: number;
    interval?: number;
    limit?: number;
}
export interface ParserDefinition {
    source: string;
    path?: string;
    isArray?: boolean;
    mapping: Record<string, FieldMapping>;
    postProcess?: PostProcess[];
}
export type FieldMapping = {
    path: string;
    transform?: TransformType;
    default?: any;
} | {
    fromContext: string;
} | {
    compute: string;
    dependencies?: string[];
} | {
    literal: any;
} | {
    conditional: ConditionalMapping;
};
export interface ConditionalMapping {
    if: string;
    then: FieldMapping;
    else: FieldMapping;
}
export type TransformType = 'parseNumber' | 'parseString' | 'parseTimestamp' | 'parseTimestampMs' | 'parseCurrencyCode' | 'parseSymbol' | 'parseOrderStatus' | 'parseOrderType' | 'parseOrderSide' | 'lowercase' | 'uppercase' | 'omitZero' | 'safeInteger' | 'safeNumber' | 'safeString' | 'safeTimestamp' | string;
export interface PostProcess {
    name: string;
    args?: any[];
}
export interface MarketsDefinition {
    endpoint: string;
    path?: string;
    parser?: ParserDefinition;
    symbolMapping?: SymbolMapping;
    filters?: MarketFilter[];
}
export interface SymbolMapping {
    template: string;
    baseId: string;
    quoteId: string;
    settleId?: string;
}
export interface MarketFilter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
    value: any;
}
export interface ErrorDefinition {
    patterns?: ErrorPattern[];
    httpCodes?: Record<string, ErrorType>;
    fields?: ErrorField[];
}
export interface ErrorPattern {
    match: string;
    type: ErrorType;
    retry?: RetryStrategy;
    regex?: boolean;
}
export type ErrorType = 'AuthenticationError' | 'PermissionDenied' | 'InsufficientFunds' | 'InvalidOrder' | 'OrderNotFound' | 'RateLimitExceeded' | 'ExchangeError' | 'ExchangeNotAvailable' | 'NetworkError' | 'BadRequest' | 'BadResponse' | 'InvalidAddress' | 'InvalidNonce' | 'DDoSProtection';
export type RetryStrategy = 'none' | 'linear' | 'exponential';
export interface ErrorField {
    path: string;
    successValue?: any;
    errorPath?: string;
}
export interface OverrideDefinition {
    method: string;
    description?: string;
    file: string;
}
export type CapabilityMethod = 'fetchTicker' | 'fetchTickers' | 'fetchOrderBook' | 'fetchTrades' | 'fetchOHLCV' | 'fetchBalance' | 'createOrder' | 'cancelOrder' | 'fetchOrder' | 'fetchOrders' | 'fetchOpenOrders' | 'fetchClosedOrders' | 'fetchMyTrades' | 'fetchDeposits' | 'fetchWithdrawals' | 'fetchLedger' | 'withdraw' | 'deposit' | 'fetchMarkets' | 'fetchCurrencies' | 'fetchTime' | 'fetchStatus' | string;
export interface EDLDocument {
    version?: string;
    exchange: ExchangeMetadata;
    auth?: AuthMethod;
    api?: APIDefinition;
    markets?: MarketsDefinition;
    parsers?: Record<string, ParserDefinition>;
    errors?: ErrorDefinition;
    overrides?: OverrideDefinition[];
    features?: Record<CapabilityMethod, boolean>;
}
export interface ValidationError {
    path: string;
    message: string;
    severity: 'error' | 'warning';
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}
export interface SourceLocation {
    line?: number;
    column?: number;
    path: string;
}
export interface Located<T> {
    value: T;
    location: SourceLocation;
}
//# sourceMappingURL=edl.d.ts.map