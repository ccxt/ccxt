/**
 * Enhanced EDL Types - Version 2
 * Supports complex exchange patterns without overrides
 */
/**
 * Expression types for computed values
 * Supports path access, literals, operations, and function calls
 */
export type Expression = PathExpression | LiteralExpression | BinaryExpression | UnaryExpression | CallExpression | ConditionalExpression | ArrayExpression | ObjectExpression | TemplateExpression;
export interface PathExpression {
    type: 'path';
    path: string;
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
    function: string;
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
    parts: (string | Expression)[];
}
/**
 * Multi-variant authentication supporting runtime selection
 */
export interface EnhancedAuthMethod {
    default?: AuthVariant;
    variants?: Record<string, AuthVariant>;
    select?: AuthSelector[];
    endpoints?: Record<string, AuthVariant | string>;
}
export interface AuthVariant {
    type: 'hmac' | 'rsa' | 'eddsa' | 'jwt' | 'apiKey' | 'custom';
    pipeline?: SigningStep[];
    algorithm?: string;
    encoding?: 'hex' | 'base64' | 'binary';
    signatureInput?: SignatureInput;
    signatureOutput?: SignatureOutput;
    headers?: Record<string, Expression>;
    nonce?: NonceConfig;
}
export interface SigningStep {
    operation: 'hash' | 'hmac' | 'rsa' | 'eddsa' | 'encode' | 'decode' | 'concat' | 'urlencode' | 'urlencodeNested' | 'json';
    algorithm?: string;
    input: Expression;
    key?: Expression;
    encoding?: 'hex' | 'base64' | 'binary' | 'utf8';
    output?: string;
}
export interface SignatureInput {
    components: SignatureComponent[];
    separator?: string;
}
export interface SignatureComponent {
    source: 'nonce' | 'timestamp' | 'method' | 'path' | 'query' | 'body' | 'params' | 'custom';
    value?: Expression;
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
    adjustment?: Expression;
}
export interface AuthSelector {
    condition: Expression;
    variant: string;
}
export interface EnhancedAPIDefinition {
    baseUrls?: Record<string, string | Record<string, string>>;
    public?: EnhancedAPICategory;
    private?: EnhancedAPICategory;
    [key: string]: EnhancedAPICategory | Record<string, string | Record<string, string>> | undefined;
}
export interface EnhancedAPICategory {
    get?: Record<string, EnhancedEndpoint>;
    post?: Record<string, EnhancedEndpoint>;
    put?: Record<string, EnhancedEndpoint>;
    delete?: Record<string, EnhancedEndpoint>;
    auth?: string;
    defaultCost?: number;
}
export interface EnhancedEndpoint {
    path?: string;
    cost?: number | CostConfig;
    params?: Record<string, EnhancedParamDefinition>;
    body?: BodyConfig;
    response?: EnhancedResponseDefinition;
    auth?: string;
    rateLimit?: RateLimitConfig;
    flags?: EndpointFlags;
}
export interface CostConfig {
    default: number;
    byParam?: Record<string, number>;
    byLimit?: [number, number][];
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
export type ParamType = 'string' | 'number' | 'integer' | 'float' | 'boolean' | 'timestamp' | 'timestamp_ms' | 'timestamp_s' | 'array' | 'object' | 'symbol' | 'currency';
export interface BodyConfig {
    encoding: 'json' | 'urlencode' | 'urlencodeNested' | 'form' | 'raw';
    conditional?: ConditionalEncoding[];
}
export interface ConditionalEncoding {
    condition: Expression;
    encoding: 'json' | 'urlencode' | 'urlencodeNested' | 'form' | 'raw';
}
export interface EndpointFlags {
    noAuth?: boolean;
    specialAuth?: string;
}
export interface RateLimitConfig {
    cost: number;
    interval?: number;
    limit?: number;
    conditions?: Array<{
        when: Expression;
        cost: number;
    }>;
}
export interface EnhancedResponseDefinition {
    formatDetection?: FormatDetection;
    parsers?: Record<string, string>;
    parser?: string;
    errorDetection?: ErrorDetection;
}
export interface FormatDetection {
    rules: FormatRule[];
    default?: string;
}
export interface FormatRule {
    condition: Expression;
    parser: string;
}
export interface ErrorDetection {
    isError: Expression;
    errorCode?: Expression;
    errorMessage?: Expression;
}
export interface EnhancedParserDefinition {
    source?: string;
    isArray?: boolean;
    iterate?: IterationConfig;
    mapping: Record<string, EnhancedFieldMapping>;
    postProcess?: PostProcessStep[];
    context?: Record<string, Expression>;
}
export interface IterationConfig {
    array?: Expression;
    itemVar?: string;
    indexVar?: string;
}
export type EnhancedFieldMapping = string | PathMapping | ComputeMapping | ConditionalMapping | ArrayMapping | SwitchMapping;
export interface PathMapping {
    path: string | string[];
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
    map: string;
    itemMapping: Record<string, EnhancedFieldMapping>;
}
export interface SwitchMapping {
    switch: Expression;
    cases: Record<string, EnhancedFieldMapping>;
    default?: EnhancedFieldMapping;
}
export type TransformType = 'safeString' | 'safeNumber' | 'safeInteger' | 'safeTimestamp' | 'safeBoolean' | 'parseNumber' | 'parseString' | 'parseTimestamp' | 'parseBoolean' | 'parseCurrencyCode' | 'parseSymbol' | 'parseOrderStatus' | 'parseOrderType' | 'parseOrderSide' | 'lowercase' | 'uppercase' | 'trim' | 'omitZero' | 'stringDiv100' | CustomTransform;
export interface CustomTransform {
    name: string;
    args?: Expression[];
}
export interface PostProcessStep {
    operation: 'safeBalance' | 'sortBy' | 'filterBy' | 'custom';
    args?: Expression[];
}
export interface MethodVariants {
    variants: MethodVariant[];
    selection: VariantSelection;
}
export interface MethodVariant {
    name: string;
    condition?: Expression;
    endpoint: string;
    request?: RequestConfig;
    response?: string;
}
export interface VariantSelection {
    param?: string;
    rules?: VariantRule[];
    default?: string;
}
export interface VariantRule {
    condition: Expression;
    variant: string;
}
export interface RequestConfig {
    params?: Record<string, Expression>;
    transforms?: Record<string, Expression>;
}
export interface EnhancedEDLDocument {
    version: string;
    exchange: EnhancedExchangeMetadata;
    auth?: EnhancedAuthMethod;
    api?: EnhancedAPIDefinition;
    markets?: MarketsDefinition;
    parsers?: Record<string, EnhancedParserDefinition>;
    methods?: Record<string, MethodVariants | MethodVariant>;
    errors?: EnhancedErrorDefinition;
    features?: Record<string, boolean>;
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
    timeSync?: {
        enabled: boolean;
        endpoint?: string;
        interval?: number;
    };
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
    mappings?: Record<string, ErrorMapping>;
    default?: ErrorMapping;
    httpCodes?: Record<string, string>;
}
export interface ErrorMapping {
    exact?: Record<string, string>;
    broad?: Record<string, string>;
}
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
//# sourceMappingURL=edl-v2.d.ts.map