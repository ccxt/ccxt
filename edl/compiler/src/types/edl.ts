/**
 * EDL (Exchange Definition Language) Core Types
 * TypeScript implementation of EDL ADTs
 */

// ============================================================
// Exchange Metadata Types
// ============================================================

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
    has?: Record<string, boolean | null | 'emulated'>;
    timeframes?: Record<string, string>;
    requiredCredentials?: RequiredCredentials;
    commonCurrencies?: Record<string, string>;
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

// ============================================================
// Authentication Types
// ============================================================

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

// ============================================================
// API Definition Types
// ============================================================

export interface APIDefinition {
    public?: APICategory;
    private?: APICategory;
    [key: string]: APICategory | undefined; // Allow custom API categories
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
    required_if?: string;
    default?: string | number | boolean | null;
    description?: string;
    enum?: Array<string | number>;
    dependencies?: string[];
    location?: ParamLocation;
    alias?: string | string[];
    validate?: string;
    transform?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}

export type ParamType =
    | 'string'
    | 'int'
    | 'integer'
    | 'float'
    | 'number'
    | 'bool'
    | 'boolean'
    | 'timestamp'
    | 'timestamp_ms'
    | 'timestamp_ns'
    | 'object'
    | 'array';

export type ParamLocation = 'query' | 'body' | 'path' | 'header';

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

// ============================================================
// Parser Definition Types
// ============================================================

export type IteratorMode = 'array' | 'entries' | 'values';

export interface ParserDefinition {
    source: string;
    path?: string;
    isArray?: boolean;  // Deprecated: use iterator: 'array' instead
    iterator?: IteratorMode;
    mapping: Record<string, FieldMapping>;
    postProcess?: PostProcess[];
    structure?: 'balance' | 'default';  // Special structure handling for parsers
}

export type FieldMapping =
    | { path: string | string[]; transform?: TransformType; default?: any; map?: Record<string, any> }
    | { fromContext: string; transform?: TransformType }
    | { compute: string; dependencies?: string[] }
    | { literal: any }
    | { conditional: ConditionalMapping };

export interface ConditionalMapping {
    // If/then/else conditional
    if?: string;
    then?: FieldMapping;
    else?: FieldMapping;

    // Fallback chain
    fallback?: any[];

    // Conditional presence
    when?: string;
    value?: any;

    // Type-based conditionals
    ifNumber?: any;
    ifString?: any;
    ifBoolean?: any;
    ifArray?: any;
    ifObject?: any;
    ifNull?: any;

    // Switch/case
    switch?: any;
    cases?: Record<string, any>;
    default?: any;

    // Coalesce (null coalescing)
    coalesce?: any[];
}

export type TransformType =
    | 'parseNumber'
    | 'parseString'
    | 'parseTimestamp'
    | 'parseTimestampMs'
    | 'parseCurrencyCode'
    | 'parseSymbol'
    | 'parseOrderStatus'
    | 'parseOrderType'
    | 'parseOrderSide'
    | 'lowercase'
    | 'uppercase'
    | 'omitZero'
    | 'safeInteger'
    | 'safeNumber'
    | 'safeString'
    | 'safeTimestamp'
    | string; // Allow custom transforms

export interface PostProcess {
    name: string;
    args?: any[];
}

// ============================================================
// Markets Definition Types
// ============================================================

export type MarketType = 'spot' | 'margin' | 'swap' | 'future' | 'option' | 'index';
export type OptionType = 'call' | 'put';
export type FeeSide = 'get' | 'give' | 'base' | 'quote' | 'other';

export interface MarketDefinition {
    id: string;
    symbol: string;
    base: string;
    quote: string;
    baseId?: string;
    quoteId?: string;
    type?: MarketType;
    spot?: boolean;
    margin?: boolean;
    swap?: boolean;
    future?: boolean;
    option?: boolean;
    active?: boolean;
    settle?: string;
    settleId?: string;
    contract?: boolean;
    contractSize?: number | null;
    linear?: boolean;
    inverse?: boolean;
    quanto?: boolean;
    expiry?: number | null;
    expiryDatetime?: string | null;
    strike?: number | null;
    optionType?: OptionType;
    precision?: {
        amount?: number | null;
        price?: number | null;
        base?: number | null;
        quote?: number | null;
    };
    limits?: {
        amount?: { min?: number | null; max?: number | null };
        price?: { min?: number | null; max?: number | null };
        cost?: { min?: number | null; max?: number | null };
        leverage?: { min?: number | null; max?: number | null };
        market?: { min?: number | null; max?: number | null };
    };
    info?: any;
    percentage?: boolean;
    tierBased?: boolean;
    taker?: number | null;
    maker?: number | null;
    feeSide?: FeeSide;
}

export interface ContractTypeDerivation {
    spotCondition?: string;
    futureCondition?: string;
    swapCondition?: string;
    optionCondition?: string;
    marginCondition?: string;
}

export interface LinearInverseDerivation {
    linearCondition?: string;
    inverseCondition?: string;
    quantoCondition?: string;
}

export interface LegDerivation {
    strikePathOrFormula?: string;
    expiryPathOrFormula?: string;
    optionTypePathOrFormula?: string;
}

export interface SymbolMapping {
    template: string;
    baseIdPath?: string;
    quoteIdPath?: string;
    settleIdPath?: string;
    separator?: string;
    contractTypeDerivation?: ContractTypeDerivation;
    linearInverseDerivation?: LinearInverseDerivation;
    legDerivation?: LegDerivation;
}

export interface MarketFilter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'matches';
    value: any;
}

export interface MarketsDefinition {
    endpoint: string;
    path?: string;
    iterator?: 'array' | 'entries' | 'values' | 'keys';
    parser?: ParserDefinition;
    symbolMapping?: SymbolMapping;
    mapping?: Record<string, FieldMapping>;
    filters?: MarketFilter[];
}

// ============================================================
// Error Handling Types
// ============================================================

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

export type ErrorType =
    | 'AuthenticationError'
    | 'PermissionDenied'
    | 'InsufficientFunds'
    | 'InvalidOrder'
    | 'OrderNotFound'
    | 'RateLimitExceeded'
    | 'ExchangeError'
    | 'ExchangeNotAvailable'
    | 'NetworkError'
    | 'BadRequest'
    | 'BadResponse'
    | 'InvalidAddress'
    | 'InvalidNonce'
    | 'DDoSProtection';

export type RetryStrategy = 'none' | 'linear' | 'exponential';

export interface ErrorField {
    path: string;
    successValue?: any;
    errorPath?: string;
}

// ============================================================
// Override Types
// ============================================================

export interface OverrideDefinition {
    method: string;
    description?: string;
    file: string;
}

// ============================================================
// Wallet Operations Types
// ============================================================

export interface WalletOperations {
    fetchBalance?: WalletEndpointDefinition;
    fetchDeposits?: WalletEndpointDefinition;
    fetchWithdrawals?: WalletEndpointDefinition;
    fetchTransfers?: WalletEndpointDefinition;
    withdraw?: WalletEndpointDefinition;
    fetchDepositAddress?: WalletEndpointDefinition;
    fetchDepositAddresses?: WalletEndpointDefinition;
    transfer?: WalletEndpointDefinition;
}

export interface WalletEndpointDefinition {
    endpoint: string;
    params?: Record<string, ParamDefinition>;
}

export interface NetworkDefinition {
    id: string;
    network: string;
    name?: string;
    active?: boolean;
    fee?: number;
    precision?: number;
    limits?: {
        withdraw?: {
            min?: number | null;
            max?: number | null;
        };
        deposit?: {
            min?: number | null;
            max?: number | null;
        };
    };
    addressRegex?: string;
    tagRequired?: boolean;
    memoRegex?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';
export type TransactionStatus = 'pending' | 'ok' | 'failed' | 'canceled';

export interface TransactionDefinition {
    id: string;
    txid?: string | null;
    type: TransactionType;
    currency: string;
    amount: number;
    status: TransactionStatus;
    address?: string | null;
    addressFrom?: string | null;
    addressTo?: string | null;
    tag?: string | null;
    tagFrom?: string | null;
    tagTo?: string | null;
    network?: string | null;
    fee?: {
        cost: number;
        currency: string;
    };
    timestamp?: number | null;
    datetime?: string | null;
    updated?: number | null;
    comment?: string | null;
    internal?: boolean;
    info?: any;
}

// ============================================================
// Trading Types
// ============================================================

export type OrderType =
    | 'market'
    | 'limit'
    | 'stop'
    | 'stopLimit'
    | 'stopMarket'
    | 'trailingStop'
    | 'trailingStopMarket'
    | 'iceberg'
    | 'oco'
    | 'fok'
    | 'ioc'
    | 'postOnly';

export type OrderSide = 'buy' | 'sell';

export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTD' | 'PO';

export interface OrderTypeDefinition {
    name: OrderType;
    requiredParams?: string[];
    optionalParams?: string[];
    description?: string;
}

export interface OrderParameterDefinition {
    type: 'string' | 'number' | 'float' | 'integer' | 'boolean';
    required?: boolean;
    requiredIf?: string;
    default?: any;
    enum?: string[] | number[];
    description?: string;
}

export interface OrderParameters {
    symbol?: OrderParameterDefinition;
    side?: OrderParameterDefinition;
    type?: OrderParameterDefinition;
    amount?: OrderParameterDefinition;
    price?: OrderParameterDefinition;
    stopPrice?: OrderParameterDefinition;
    triggerPrice?: OrderParameterDefinition;
    trailingDelta?: OrderParameterDefinition;
    timeInForce?: OrderParameterDefinition;
    postOnly?: OrderParameterDefinition;
    reduceOnly?: OrderParameterDefinition;
    closePosition?: OrderParameterDefinition;
    clientOrderId?: OrderParameterDefinition;
    leverage?: OrderParameterDefinition;
    iceberg?: {
        displayQty?: OrderParameterDefinition;
    };
    oco?: {
        takeProfitPrice?: OrderParameterDefinition;
        stopLossPrice?: OrderParameterDefinition;
    };
}

export interface OrderEndpointMapping {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    params?: Record<string, any>;
}

export interface TradingDefinition {
    supportedOrderTypes?: string[];
    defaultOrderType?: string;
    orderParameters?: OrderParameters;
    endpoints?: {
        createOrder?: OrderEndpointMapping;
        cancelOrder?: OrderEndpointMapping;
        editOrder?: OrderEndpointMapping;
    };
    orderTypes?: OrderTypeDefinition[];
}

// ============================================================
// Capability Types (for 'has' generation)
// ============================================================

export type CapabilityMethod =
    | 'fetchTicker'
    | 'fetchTickers'
    | 'fetchOrderBook'
    | 'fetchTrades'
    | 'fetchOHLCV'
    | 'fetchBalance'
    | 'createOrder'
    | 'cancelOrder'
    | 'fetchOrder'
    | 'fetchOrders'
    | 'fetchOpenOrders'
    | 'fetchClosedOrders'
    | 'fetchMyTrades'
    | 'fetchDeposits'
    | 'fetchWithdrawals'
    | 'fetchTransfers'
    | 'fetchLedger'
    | 'withdraw'
    | 'deposit'
    | 'transfer'
    | 'fetchDepositAddress'
    | 'fetchDepositAddresses'
    | 'fetchMarkets'
    | 'fetchCurrencies'
    | 'fetchTime'
    | 'fetchStatus'
    | string;

// ============================================================
// Main EDL Document Type
// ============================================================

export interface EDLDocument {
    version?: string;
    exchange: ExchangeMetadata;
    auth?: AuthMethod;
    api?: APIDefinition;
    markets?: MarketsDefinition;
    wallet?: WalletOperations;
    trading?: TradingDefinition;
    parsers?: Record<string, ParserDefinition>;
    errors?: ErrorDefinition;
    overrides?: OverrideDefinition[];
    features?: Record<CapabilityMethod, boolean>;
}

// ============================================================
// Validation Result Types
// ============================================================

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

// ============================================================
// Parsed Location for Error Reporting
// ============================================================

export interface SourceLocation {
    line?: number;
    column?: number;
    path: string;
}

export interface Located<T> {
    value: T;
    location: SourceLocation;
}
