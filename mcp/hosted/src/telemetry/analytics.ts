import { createHash } from 'node:crypto';
import { relativizePath, sanitizeParameters, scrub, capJson, jsonSize, truncateString, stripPathsInText, stripPathsDeep, redactSecretsInText, REDACTED } from './redact.js';
import { HOSTED_TOOLS } from '../profile.js';

// What beforeSend does to every event @posthog/mcp builds, as a function of the event and
// the request it belongs to, so it can be tested without a server. It runs after the SDK's
// own sanitizer and truncation; what it returns is final.

export const MAX_PARAMETERS_BYTES = 2048;
export const MAX_ERROR_PREVIEW_BYTES = 1024;
export const MAX_INTENT_CHARS = 1024;

// mcp/ts/tools/live.ts LIVE_TOOL (kept literal: this module is loaded by the telemetry tests alone)
export const LIVE_TOOL_NAME = 'live_update';

export interface EventContext {
    sampleRate: number;
    // success events of live_update (the views' refresh poll) use this rate instead
    liveSampleRate?: number;
    expectedErrorCodes: ReadonlySet<string>;
    appRoot: string;
    // per-request values the request scope knows by the time the event is built
    cache?: string;
    exchange?: string;
    // told the id the SDK chose for this request, so log lines can carry the same one
    onIdentity?: (distinctId: string | undefined, sessionId: string | undefined) => void;
}

export interface CaptureEvent {
    event: string;
    distinct_id: string;
    properties: Record<string, unknown>;
    [key: string]: unknown;
}

// Deterministic: the same key always gets the same answer for a given rate, so a session
// (or a request, when there is no session) is kept or dropped whole and a re-run of a test
// sees the same events. Spread is uniform enough at sha256's first 32 bits.
export function sampledIn (key: string, rate: number): boolean {
    if (rate >= 1) {
        return true;
    }
    if (rate <= 0) {
        return false;
    }
    const bucket = createHash ('sha256').update (key).digest ().readUInt32BE (0) / 0x100000000;
    return bucket < rate;
}

const ENVELOPE_CODE = /^[A-Z][A-Z0-9_]{1,63}$/;
const VALIDATION_MESSAGE = /^(MCP error -32602: )?Input validation error/i;

function envelopeCode (text: unknown): string | undefined {
    if (typeof text !== 'string' || text.length === 0) {
        return undefined;
    }
    if (VALIDATION_MESSAGE.test (text)) {
        return 'VALIDATION';
    }
    if (text[0] !== '{') {
        return undefined;
    }
    try {
        const code = JSON.parse (text)?.error?.code;
        return (typeof code === 'string' && ENVELOPE_CODE.test (code)) ? code : undefined;
    } catch (e) {
        return undefined;
    }
}

// The tool's error code: a schema rejection by the SDK, or the code of the {ok:false,
// error:{code}} envelope every ccxt-mcp tool returns. A thrown error has none.
export function errorCodeOf (properties: Record<string, unknown>): string | undefined {
    if (properties['$mcp_error_type'] === 'validation') {
        return 'VALIDATION';
    }
    const response: any = properties['$mcp_response'];
    const first = Array.isArray (response?.content) ? response.content[0] : undefined;
    const exceptions: any = properties['$exception_list'];
    return envelopeCode (first?.text)
        ?? envelopeCode (properties['$mcp_error_message'])
        ?? envelopeCode (Array.isArray (exceptions) ? exceptions[0]?.value : undefined);
}

// the exchange id a call was about, read from its arguments before they are scrubbed; only
// something shaped like a ccxt id is kept, so a property never carries free text
export function exchangeOf (parameters: unknown): string | undefined {
    const value = (parameters as any)?.request?.params?.arguments?.exchange;
    return (typeof value === 'string' && /^[a-z][a-z0-9_]{0,31}$/.test (value)) ? value : undefined;
}

function toolNameOf (props: Record<string, unknown>): string | undefined {
    const fromParameters = (props['$mcp_parameters'] as any)?.request?.params?.name;
    const name = (typeof fromParameters === 'string') ? fromParameters : props['$mcp_tool_name'];
    return (typeof name === 'string') ? name : undefined;
}

// the account stubs never use their arguments on the hosted server, and their arguments are
// where pasted credentials land: only the argument names are kept (and a ccxt-shaped exchange id)
function isAccountTool (props: Record<string, unknown>): boolean {
    const name = toolNameOf (props);
    return name !== undefined && Object.prototype.hasOwnProperty.call (HOSTED_TOOLS, name) && HOSTED_TOOLS[name] === 'account';
}

function withoutArgumentValues (parameters: unknown): unknown {
    const request: any = (parameters as any)?.request;
    const args = request?.params?.arguments;
    if (args === null || typeof args !== 'object') {
        return parameters;
    }
    const exchange = exchangeOf (parameters);
    const names: Record<string, unknown> = {};
    for (const key of Object.keys (args).slice (0, 50)) {
        names[key] = (key === 'exchange' && exchange !== undefined) ? exchange : REDACTED;
    }
    return { ...(parameters as object), 'request': { ...request, 'params': { ...request.params, 'arguments': names } } };
}

function sampleKey (event: CaptureEvent): string {
    const props = event.properties;
    // a session the SDK generated for this one request is as good as random; the request
    // id is the stable key then (and the only one a test can predict)
    const session = props['$session_id'];
    if (typeof session === 'string' && session.length > 0 && props['$mcp_session_source'] !== 'generated') {
        return session;
    }
    const requestId = props['request_id'];
    if (typeof requestId === 'string' && requestId.length > 0) {
        return requestId;
    }
    return String (session ?? event.distinct_id ?? '');
}

function cleanExceptionList (list: unknown, appRoot: string): unknown {
    if (!Array.isArray (list)) {
        return list;
    }
    return list.slice (0, 5).map ((entry: any) => {
        if (entry === null || typeof entry !== 'object') {
            return entry;
        }
        const out: Record<string, unknown> = { ...entry };
        if (typeof entry.value === 'string') {
            out['value'] = truncateString (redactSecretsInText (stripPathsInText (entry.value)), MAX_ERROR_PREVIEW_BYTES);
        }
        const frames = entry.stacktrace?.frames;
        if (Array.isArray (frames)) {
            out['stacktrace'] = {
                ...entry.stacktrace,
                'frames': frames.slice (-50).map ((frame: any) => {
                    if (frame === null || typeof frame !== 'object' || typeof frame.filename !== 'string') {
                        return frame;
                    }
                    const filename = relativizePath (frame.filename, appRoot);
                    // our own frames are the ones worth grouping on in Error Tracking
                    const inApp = !filename.startsWith ('node_modules/') && !filename.startsWith ('node:');
                    const cleaned: Record<string, unknown> = { ...frame, filename, 'in_app': inApp };
                    if (typeof frame.abs_path === 'string') {
                        cleaned['abs_path'] = relativizePath (frame.abs_path, appRoot);
                    }
                    return cleaned;
                }),
            };
        }
        return out;
    });
}

// Returns the event to send, or null to drop it.
export function prepareEvent (event: CaptureEvent, context: EventContext): CaptureEvent | null {
    const props = event.properties;
    const isException = event.event === '$exception';
    const isError = isException || props['$mcp_is_error'] === true;
    context.onIdentity?.(event.distinct_id, (typeof props['$session_id'] === 'string') ? props['$session_id'] as string : undefined);
    const code = isError ? errorCodeOf (props) : undefined;
    if (code !== undefined) {
        props['error_code'] = code;
    }
    // expected failures stay visible on $mcp_tool_call (is_error, error_code) but are not
    // faults, so they do not open Error Tracking issues
    if (isException && code !== undefined && context.expectedErrorCodes.has (code)) {
        return null;
    }
    // errors are always kept: they are rare and the reason to look at the data at all.
    // live_update polls are sampled at their own (much lower) rate: a view on screen polls
    // every few seconds, and one $mcp_tool_call per poll would drown everything else
    const live = toolNameOf (props) === LIVE_TOOL_NAME;
    const rate = (live && context.liveSampleRate !== undefined) ? context.liveSampleRate : context.sampleRate;
    if (!isError && !sampledIn (sampleKey (event), rate)) {
        return null;
    }
    // sample_rate: the success sampling rate in force. effective_sample_rate: the rate THIS
    // event was kept at (1 for errors, which are never sampled) — weight by its inverse
    props['sample_rate'] = rate;
    props['effective_sample_rate'] = isError ? 1 : rate;
    const accountTool = isAccountTool (props);
    if ('$mcp_parameters' in props) {
        const exchange = exchangeOf (props['$mcp_parameters']);
        if (exchange !== undefined) {
            props['exchange'] = exchange;
        }
        const parameters = accountTool ? withoutArgumentValues (props['$mcp_parameters']) : props['$mcp_parameters'];
        props['$mcp_parameters'] = sanitizeParameters (parameters, MAX_PARAMETERS_BYTES);
    }
    if (props['exchange'] === undefined && context.exchange !== undefined) {
        props['exchange'] = context.exchange;
    }
    if (context.cache !== undefined) {
        props['cache'] = context.cache;
    }
    if ('$mcp_response' in props) {
        // market data is public but large, and phase-2 account data must never be sent:
        // successes keep only their size; an error keeps a short preview to debug with
        props['response_bytes'] = jsonSize (props['$mcp_response']);
        if (isError) {
            props['$mcp_response'] = capJson (stripPathsDeep (scrub (props['$mcp_response'], { 'maxString': MAX_ERROR_PREVIEW_BYTES, 'maxArray': 5, 'maxKeys': 20, 'maxDepth': 5 })), MAX_ERROR_PREVIEW_BYTES);
        } else {
            delete props['$mcp_response'];
        }
    }
    if (typeof props['$mcp_error_message'] === 'string') {
        // the tool's error text echoes the caller's arguments (BAD_SYMBOL names the symbol)
        props['$mcp_error_message'] = truncateString (redactSecretsInText (stripPathsInText (props['$mcp_error_message'] as string)), MAX_ERROR_PREVIEW_BYTES);
    }
    if (accountTool) {
        // the path a user who just pasted keys ends up on ("check my balance, here is my
        // key"): the model's explanation of the call is not recorded at all
        delete props['$mcp_intent'];
    } else if (typeof props['$mcp_intent'] === 'string') {
        props['$mcp_intent'] = truncateString (redactSecretsInText (props['$mcp_intent'] as string), MAX_INTENT_CHARS);
    }
    if ('$exception_list' in props) {
        props['$exception_list'] = cleanExceptionList (props['$exception_list'], context.appRoot);
    }
    // the SDK does not send the caller's address, and nothing here may either
    delete props['$ip'];
    return event;
}
