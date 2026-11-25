import { isSecretKey, looksLikeSecret, scrub, truncateString, REDACTED } from './redact.js';
import type { LogLevel } from './config.js';

// Log lines describe what the server did, never what a caller sent or got back: attribute
// names that would carry payloads, headers or addresses are dropped outright, whatever a
// call site passes, and every value is bounded.

const LEVEL_RANK: Record<LogLevel, number> = { 'debug': 10, 'info': 20, 'warn': 30, 'error': 40 };

export function levelEnabled (level: LogLevel, threshold: LogLevel): boolean {
    return LEVEL_RANK[level] >= LEVEL_RANK[threshold];
}

export const MAX_LOG_VALUE_CHARS = 1024;
export const MAX_LOG_ATTRIBUTES = 40;

// payloads and request metadata (normalized like isSecretKey: lower case, letters and digits)
const FORBIDDEN_LOG_KEYS: ReadonlySet<string> = new Set ([
    'arguments', 'args', 'params', 'parameters', 'input', 'result', 'results', 'response',
    'body', 'payload', 'content', 'structuredcontent', 'headers', 'header', 'ip', 'ipaddress',
    'remoteaddress', 'xforwardedfor', 'forwardedfor', 'clientip', 'clientkey', 'subject',
]);

export function isForbiddenLogKey (key: string): boolean {
    const normalized = String (key).toLowerCase ().replace (/[^a-z0-9]/g, '');
    return FORBIDDEN_LOG_KEYS.has (normalized) || isSecretKey (key);
}

export type LogValue = string | number | boolean | null;

function logValue (value: unknown): LogValue | undefined {
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        return undefined;
    }
    if (value === null || typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return Number.isFinite (value) ? value : String (value);
    }
    if (typeof value === 'bigint') {
        return String (value);
    }
    if (value instanceof Error) {
        const text = value.name + ': ' + value.message;
        return looksLikeSecret (text) ? REDACTED : truncateString (text, MAX_LOG_VALUE_CHARS);
    }
    if (typeof value === 'string') {
        return looksLikeSecret (value) ? REDACTED : truncateString (value, MAX_LOG_VALUE_CHARS);
    }
    // objects are flattened to bounded JSON after the same key redaction events get
    let json: string | undefined;
    try {
        json = JSON.stringify (scrub (value));
    } catch (e) {
        json = '[unserializable]';
    }
    return truncateString (json ?? '', MAX_LOG_VALUE_CHARS);
}

export function sanitizeLogAttributes (attributes: Record<string, unknown> | undefined): Record<string, LogValue> {
    const out: Record<string, LogValue> = {};
    if (attributes === undefined || attributes === null || typeof attributes !== 'object') {
        return out;
    }
    let count = 0;
    for (const key of Object.keys (attributes)) {
        if (count >= MAX_LOG_ATTRIBUTES) {
            break;
        }
        if (isForbiddenLogKey (key)) {
            continue;
        }
        const value = logValue ((attributes as Record<string, unknown>)[key]);
        if (value !== undefined) {
            out[key] = value;
            count += 1;
        }
    }
    return out;
}
