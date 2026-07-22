import { redact } from './redact.js';
import { ccxt } from './ccxt-loader.js';
import type { Envelope } from './format.js';

interface ErrorMapping {
    classes: string[];
    code: string;
    retryable: boolean;
    hint: (exchangeId: string | undefined, accountName: string | undefined) => string;
}

// most-specific first — matched by walking the ccxt error class prototype chain by name
const MAPPINGS: ErrorMapping[] = [
    {
        'classes': [ 'AuthenticationError', 'PermissionDenied', 'AccountSuspended' ],
        'code': 'AUTH_FAILED',
        'retryable': false,
        'hint': (exchangeId, accountName) => 'credentials for ' + (accountName ? 'account ' + JSON.stringify (accountName) : 'this account') + ' were rejected by ' + (exchangeId ?? 'the exchange') + ' — the key may lack permission for this call, be expired, or be live keys pointed at a testnet (or vice versa); the user must fix the local ccxt-mcp config',
    },
    {
        'classes': [ 'InsufficientFunds' ],
        'code': 'INSUFFICIENT_FUNDS',
        'retryable': false,
        'hint': () => 'check available balance with get_balance before retrying with a smaller amount',
    },
    {
        'classes': [ 'RateLimitExceeded', 'DDoSProtection' ],
        'code': 'RATE_LIMITED',
        'retryable': true,
        'hint': () => 'the exchange throttled this call — wait a few seconds before retrying',
    },
    {
        'classes': [ 'BadSymbol' ],
        'code': 'BAD_SYMBOL',
        'retryable': false,
        'hint': () => 'symbol not found on this exchange — resolve symbols with search_markets (or search_events on prediction exchanges)',
    },
    {
        'classes': [ 'OrderNotFound' ],
        'code': 'ORDER_NOT_FOUND',
        'retryable': false,
        'hint': () => 'the order may already be filled or canceled — verify with get_orders (status "closed" or "canceled")',
    },
    {
        'classes': [ 'InvalidOrder', 'DuplicateOrderId', 'OrderNotFillable', 'OrderImmediatelyFillable', 'ContractUnavailable' ],
        'code': 'INVALID_ORDER',
        'retryable': false,
        'hint': (exchangeId) => 'the exchange rejected the order parameters — check amount/price against the market limits from search_markets, and supported features via describe_method {"method": "createOrder", "exchange": "' + (exchangeId ?? '<exchange>') + '"}',
    },
    {
        'classes': [ 'NotSupported' ],
        'code': 'NOT_SUPPORTED',
        'retryable': false,
        'hint': (exchangeId) => (exchangeId ?? 'this exchange') + ' does not implement this method — check capabilities with describe_exchange',
    },
    {
        'classes': [ 'BadRequest', 'BadResponse', 'NullResponse', 'ArgumentsRequired' ],
        'code': 'BAD_REQUEST',
        'retryable': false,
        'hint': () => 'check the arguments against describe_method for this method',
    },
    {
        'classes': [ 'RequestTimeout' ],
        'code': 'TIMEOUT',
        'retryable': true,
        'hint': () => 'the request timed out — safe to retry for reads; for writes, reconcile first (see UNKNOWN_OUTCOME semantics)',
    },
    {
        'classes': [ 'ExchangeNotAvailable', 'OnMaintenance', 'NetworkError' ],
        'code': 'EXCHANGE_UNAVAILABLE',
        'retryable': true,
        'hint': () => 'the exchange is unreachable or under maintenance — retry later',
    },
];

function errorClassNames (error: any): string[] {
    const names: string[] = [];
    let proto = Object.getPrototypeOf (error);
    while (proto && proto.constructor && proto.constructor.name !== 'Object') {
        names.push (proto.constructor.name);
        proto = Object.getPrototypeOf (proto);
    }
    return names;
}

export function isCcxtError (error: any): boolean {
    try {
        return (ccxt.BaseError !== undefined) && (error instanceof ccxt.BaseError);
    } catch (e) {
        return false;
    }
}

export interface ErrorContext {
    exchange?: string;
    account?: string;
    tool?: string;
    mutating?: boolean;
    clientOrderId?: string;
}

export function toErrorEnvelope (error: any, context: ErrorContext = {}): Envelope {
    const names = errorClassNames (error);
    let code = 'EXCHANGE_ERROR';
    let retryable = false;
    let hint = 'unexpected exchange error — the message above is the exchange\'s own response';
    for (const mapping of MAPPINGS) {
        if (mapping.classes.some ((cls) => names.includes (cls))) {
            code = mapping.code;
            retryable = mapping.retryable;
            hint = mapping.hint (context.exchange, context.account);
            break;
        }
    }
    if (!isCcxtError (error) && code === 'EXCHANGE_ERROR') {
        code = 'INTERNAL_ERROR';
        hint = 'this is a ccxt-mcp bug or environment problem, not an exchange response — report it at https://github.com/ccxt/ccxt/issues';
    }
    // a timeout/network failure AFTER a mutating call was dispatched means the order may
    // or may not exist — never auto-retry, reconcile instead
    if (context.mutating && (code === 'TIMEOUT' || code === 'EXCHANGE_UNAVAILABLE')) {
        code = 'UNKNOWN_OUTCOME';
        retryable = false;
        hint = 'the write was dispatched but its outcome is unknown — do NOT resubmit; reconcile with get_orders (status "open") '
            + (context.clientOrderId ? 'looking for clientOrderId ' + context.clientOrderId + ' ' : '')
            + 'before doing anything else';
    }
    const message = redact (String (error?.message ?? error));
    const errorBody: Record<string, any> = {
        code,
        'type': names[0] ?? 'Error',
        message,
        retryable,
        hint,
    };
    if (context.exchange !== undefined) {
        errorBody['exchange'] = context.exchange;
    }
    return { 'ok': false, 'error': errorBody };
}
