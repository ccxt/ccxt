/**
 * Algorithmic Order Schema
 * Defines algorithm-specific order types and their validation rules
 */

// ============================================================
// Algorithmic Order Types
// ============================================================

export type AlgorithmicOrderType =
    | 'iceberg'
    | 'twap'
    | 'vwap'
    | 'trailing'
    | 'oco'
    | 'bracket';

// ============================================================
// Iceberg Order Parameters
// ============================================================

export interface IcebergOrderParams {
    /** Visible quantity displayed in order book */
    displayQty: number;

    /** Total order quantity to be executed */
    totalQty: number;

    /** Optional variance percentage to randomize visible quantity (0-100) */
    variancePercent?: number;

    /** Strategy for refreshing visible quantity */
    refreshStrategy?: 'immediate' | 'delayed';
}

// ============================================================
// Trailing Stop Parameters
// ============================================================

export interface TrailingStopParams {
    /** Absolute trailing amount (price distance) */
    trailingDelta?: number;

    /** Percentage trailing (0-100) */
    trailingPercent?: number;

    /** Price at which to activate the trailing stop */
    activationPrice?: number;

    /** Binance-style callback rate (percentage) */
    callbackRate?: number;
}

// ============================================================
// OCO (One-Cancels-Other) Order Parameters
// ============================================================

export interface OCOOrderParams {
    /** Take profit price level */
    takeProfitPrice: number;

    /** Stop loss price level */
    stopLossPrice: number;

    /** Optional stop loss limit price (for stop limit orders) */
    stopLossLimitPrice?: number;

    /** Take profit order type */
    takeProfitType?: 'limit' | 'market';

    /** Stop loss order type */
    stopLossType?: 'stopLimit' | 'stopMarket';
}

// ============================================================
// Bracket Order Parameters
// ============================================================

export interface BracketOrderParams {
    /** Take profit price */
    takeProfit: number;

    /** Stop loss price */
    stopLoss: number;

    /** Optional trailing stop configuration */
    trailingStop?: TrailingStopParams;
}

// ============================================================
// TWAP (Time-Weighted Average Price) Parameters
// ============================================================

export interface TWAPParams {
    /** Start time (timestamp in milliseconds) */
    startTime: number;

    /** End time (timestamp in milliseconds) */
    endTime: number;

    /** Number of execution slices */
    slices: number;

    /** Whether to randomize interval timing */
    randomizeInterval?: boolean;
}

// ============================================================
// VWAP (Volume-Weighted Average Price) Parameters
// ============================================================

export interface VWAPParams {
    /** Start time (timestamp in milliseconds) */
    startTime: number;

    /** End time (timestamp in milliseconds) */
    endTime: number;

    /** Target participation rate (0-1) */
    participationRate: number;

    /** Maximum deviation from VWAP (percentage) */
    maxDeviation?: number;
}

// ============================================================
// Position Side Parameters
// ============================================================

export interface PositionSideParams {
    /** Only reduce existing position, do not increase */
    reduceOnly?: boolean;

    /** Close entire position */
    closePosition?: boolean;

    /** Position side for hedge mode */
    positionSide?: 'LONG' | 'SHORT' | 'BOTH';
}

// ============================================================
// Base Order Parameters (used by all algorithmic orders)
// ============================================================

export interface BaseOrderParams {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
    timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'GTD' | 'PO';
    clientOrderId?: string;
    positionParams?: PositionSideParams;
}

// ============================================================
// Algorithmic Order Union Type
// ============================================================

export type AlgorithmParams =
    | IcebergOrderParams
    | TrailingStopParams
    | OCOOrderParams
    | BracketOrderParams
    | TWAPParams
    | VWAPParams;

// ============================================================
// Validation Rules
// ============================================================

export interface ValidationRule {
    /** Field name to validate */
    field: string;

    /** Validation type */
    type: 'required' | 'range' | 'dependency' | 'pattern' | 'custom';

    /** Minimum value (for range validation) */
    min?: number;

    /** Maximum value (for range validation) */
    max?: number;

    /** Dependent field (for dependency validation) */
    dependsOn?: string;

    /** Regular expression pattern (for pattern validation) */
    pattern?: string;

    /** Custom validation function name */
    customValidator?: string;

    /** Error message */
    message?: string;
}

// ============================================================
// Algorithmic Order Schema
// ============================================================

export interface AlgorithmicOrderSchema {
    /** Algorithm type */
    type: AlgorithmicOrderType;

    /** Base order parameters */
    baseOrderParams: BaseOrderParams;

    /** Algorithm-specific parameters */
    algorithmParams: AlgorithmParams;

    /** Validation rules for this order type */
    validationRules: ValidationRule[];
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate an algorithmic order
 */
export function validateAlgorithmicOrder(order: AlgorithmicOrderSchema): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validate base parameters
    if (!order.baseOrderParams.symbol) {
        errors.push('Symbol is required');
    }
    if (!order.baseOrderParams.side) {
        errors.push('Side is required');
    }
    if (!order.baseOrderParams.amount || order.baseOrderParams.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    // Validate algorithm-specific parameters based on type
    switch (order.type) {
        case 'iceberg':
            errors.push(...validateIcebergParams(order.algorithmParams as IcebergOrderParams));
            break;
        case 'trailing':
            errors.push(...validateTrailingStopParams(order.algorithmParams as TrailingStopParams));
            break;
        case 'oco':
            errors.push(...validateOCOParams(order.algorithmParams as OCOOrderParams));
            break;
        case 'bracket':
            errors.push(...validateBracketParams(order.algorithmParams as BracketOrderParams));
            break;
        case 'twap':
            errors.push(...validateTWAPParams(order.algorithmParams as TWAPParams));
            break;
        case 'vwap':
            errors.push(...validateVWAPParams(order.algorithmParams as VWAPParams));
            break;
    }

    // Validate position parameters if present
    if (order.baseOrderParams.positionParams) {
        errors.push(...validatePositionParams(order.baseOrderParams.positionParams));
    }

    // Apply custom validation rules
    for (const rule of order.validationRules) {
        const ruleErrors = applyValidationRule(order, rule);
        errors.push(...ruleErrors);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate iceberg order parameters
 */
function validateIcebergParams(params: IcebergOrderParams): string[] {
    const errors: string[] = [];

    if (!params.displayQty || params.displayQty <= 0) {
        errors.push('Iceberg displayQty must be greater than 0');
    }
    if (!params.totalQty || params.totalQty <= 0) {
        errors.push('Iceberg totalQty must be greater than 0');
    }
    if (params.displayQty && params.totalQty && params.displayQty > params.totalQty) {
        errors.push('Iceberg displayQty cannot exceed totalQty');
    }
    if (params.variancePercent !== undefined && (params.variancePercent < 0 || params.variancePercent > 100)) {
        errors.push('Iceberg variancePercent must be between 0 and 100');
    }

    return errors;
}

/**
 * Validate trailing stop parameters
 */
function validateTrailingStopParams(params: TrailingStopParams): string[] {
    const errors: string[] = [];

    const hasDelta = params.trailingDelta !== undefined && params.trailingDelta > 0;
    const hasPercent = params.trailingPercent !== undefined && params.trailingPercent > 0;
    const hasCallback = params.callbackRate !== undefined && params.callbackRate > 0;

    // Must have at least one trailing method
    if (!hasDelta && !hasPercent && !hasCallback) {
        errors.push('Trailing stop must specify trailingDelta, trailingPercent, or callbackRate');
    }

    // Validate ranges
    if (params.trailingDelta !== undefined && params.trailingDelta <= 0) {
        errors.push('Trailing delta must be greater than 0');
    }
    if (params.trailingPercent !== undefined && (params.trailingPercent <= 0 || params.trailingPercent > 100)) {
        errors.push('Trailing percent must be between 0 and 100');
    }
    if (params.callbackRate !== undefined && (params.callbackRate <= 0 || params.callbackRate > 100)) {
        errors.push('Callback rate must be between 0 and 100');
    }
    if (params.activationPrice !== undefined && params.activationPrice <= 0) {
        errors.push('Activation price must be greater than 0');
    }

    return errors;
}

/**
 * Validate OCO order parameters
 */
function validateOCOParams(params: OCOOrderParams): string[] {
    const errors: string[] = [];

    if (!params.takeProfitPrice || params.takeProfitPrice <= 0) {
        errors.push('OCO takeProfitPrice must be greater than 0');
    }
    if (!params.stopLossPrice || params.stopLossPrice <= 0) {
        errors.push('OCO stopLossPrice must be greater than 0');
    }
    if (params.stopLossLimitPrice !== undefined && params.stopLossLimitPrice <= 0) {
        errors.push('OCO stopLossLimitPrice must be greater than 0');
    }

    // If stopLossType is stopLimit, stopLossLimitPrice is required
    if (params.stopLossType === 'stopLimit' && !params.stopLossLimitPrice) {
        errors.push('OCO stopLossLimitPrice is required when stopLossType is stopLimit');
    }

    return errors;
}

/**
 * Validate bracket order parameters
 */
function validateBracketParams(params: BracketOrderParams): string[] {
    const errors: string[] = [];

    if (!params.takeProfit || params.takeProfit <= 0) {
        errors.push('Bracket takeProfit must be greater than 0');
    }
    if (!params.stopLoss || params.stopLoss <= 0) {
        errors.push('Bracket stopLoss must be greater than 0');
    }

    // Validate trailing stop if present
    if (params.trailingStop) {
        errors.push(...validateTrailingStopParams(params.trailingStop));
    }

    return errors;
}

/**
 * Validate TWAP parameters
 */
function validateTWAPParams(params: TWAPParams): string[] {
    const errors: string[] = [];

    if (!params.startTime || params.startTime <= 0) {
        errors.push('TWAP startTime must be greater than 0');
    }
    if (!params.endTime || params.endTime <= 0) {
        errors.push('TWAP endTime must be greater than 0');
    }
    if (params.startTime && params.endTime && params.startTime >= params.endTime) {
        errors.push('TWAP startTime must be before endTime');
    }
    if (!params.slices || params.slices <= 0) {
        errors.push('TWAP slices must be greater than 0');
    }

    return errors;
}

/**
 * Validate VWAP parameters
 */
function validateVWAPParams(params: VWAPParams): string[] {
    const errors: string[] = [];

    if (!params.startTime || params.startTime <= 0) {
        errors.push('VWAP startTime must be greater than 0');
    }
    if (!params.endTime || params.endTime <= 0) {
        errors.push('VWAP endTime must be greater than 0');
    }
    if (params.startTime && params.endTime && params.startTime >= params.endTime) {
        errors.push('VWAP startTime must be before endTime');
    }
    if (params.participationRate <= 0 || params.participationRate > 1) {
        errors.push('VWAP participationRate must be between 0 and 1');
    }
    if (params.maxDeviation !== undefined && (params.maxDeviation <= 0 || params.maxDeviation > 100)) {
        errors.push('VWAP maxDeviation must be between 0 and 100');
    }

    return errors;
}

/**
 * Validate position parameters
 */
function validatePositionParams(params: PositionSideParams): string[] {
    const errors: string[] = [];

    // reduceOnly and closePosition are mutually exclusive
    if (params.reduceOnly && params.closePosition) {
        errors.push('Cannot set both reduceOnly and closePosition');
    }

    // positionSide validation
    if (params.positionSide && !['LONG', 'SHORT', 'BOTH'].includes(params.positionSide)) {
        errors.push('positionSide must be LONG, SHORT, or BOTH');
    }

    return errors;
}

/**
 * Apply a validation rule to an order
 */
function applyValidationRule(order: AlgorithmicOrderSchema, rule: ValidationRule): string[] {
    const errors: string[] = [];

    switch (rule.type) {
        case 'required':
            if (!getFieldValue(order, rule.field)) {
                errors.push(rule.message || `${rule.field} is required`);
            }
            break;

        case 'range':
            const value = getFieldValue(order, rule.field);
            if (value !== undefined && typeof value === 'number') {
                if (rule.min !== undefined && value < rule.min) {
                    errors.push(rule.message || `${rule.field} must be at least ${rule.min}`);
                }
                if (rule.max !== undefined && value > rule.max) {
                    errors.push(rule.message || `${rule.field} must be at most ${rule.max}`);
                }
            }
            break;

        case 'dependency':
            if (getFieldValue(order, rule.field) && rule.dependsOn && !getFieldValue(order, rule.dependsOn)) {
                errors.push(rule.message || `${rule.field} requires ${rule.dependsOn}`);
            }
            break;

        case 'pattern':
            const strValue = getFieldValue(order, rule.field);
            if (strValue !== undefined && rule.pattern && typeof strValue === 'string') {
                const regex = new RegExp(rule.pattern);
                if (!regex.test(strValue)) {
                    errors.push(rule.message || `${rule.field} does not match required pattern`);
                }
            }
            break;
    }

    return errors;
}

/**
 * Get field value from order using dot notation
 */
function getFieldValue(order: AlgorithmicOrderSchema, field: string): any {
    const parts = field.split('.');
    let value: any = order;

    for (const part of parts) {
        if (value === undefined || value === null) {
            return undefined;
        }
        value = value[part];
    }

    return value;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get required parameters for a specific algorithmic order type
 */
export function getRequiredParamsForAlgoType(type: AlgorithmicOrderType): string[] {
    switch (type) {
        case 'iceberg':
            return ['displayQty', 'totalQty'];
        case 'trailing':
            return ['trailingDelta or trailingPercent or callbackRate'];
        case 'oco':
            return ['takeProfitPrice', 'stopLossPrice'];
        case 'bracket':
            return ['takeProfit', 'stopLoss'];
        case 'twap':
            return ['startTime', 'endTime', 'slices'];
        case 'vwap':
            return ['startTime', 'endTime', 'participationRate'];
        default:
            return [];
    }
}

/**
 * Check if a parameter is valid for the given order type
 */
export function isValidParamForOrderType(type: AlgorithmicOrderType, param: string): boolean {
    const validParams: Record<AlgorithmicOrderType, string[]> = {
        iceberg: ['displayQty', 'totalQty', 'variancePercent', 'refreshStrategy'],
        trailing: ['trailingDelta', 'trailingPercent', 'activationPrice', 'callbackRate'],
        oco: ['takeProfitPrice', 'stopLossPrice', 'stopLossLimitPrice', 'takeProfitType', 'stopLossType'],
        bracket: ['takeProfit', 'stopLoss', 'trailingStop'],
        twap: ['startTime', 'endTime', 'slices', 'randomizeInterval'],
        vwap: ['startTime', 'endTime', 'participationRate', 'maxDeviation'],
    };

    return validParams[type].includes(param);
}
