import { PostHog } from 'posthog-node';
import { instrument } from '@posthog/mcp';
import { SIGN_STEP_TOOL } from './browser-signing.js';

// Server-side MCP analytics through PostHog (@posthog/mcp). Hosted server only, and only when
// POSTHOG_PROJECT_TOKEN is set. Nothing runs in the browser pages or widgets.

const DEFAULT_HOST = 'https://eu.i.posthog.com';
const REMOVED = '[removed]';
// never recorded, wherever they appear in a captured value: the signing steps carry the user's
// exchange API key and signatures in, and account data (balances, positions, order ids) out
const SENSITIVE_KEYS = new Set ([ 'apikey', 'api_key', 'secret', 'signature', 'signatures', 'signing', 'password', 'privatekey', 'token' ]);

export function createPostHog (token: string | undefined, host: string | undefined): PostHog | undefined {
    if (token === undefined || token.trim () === '') {
        return undefined;
    }
    return new PostHog (token.trim (), { 'host': (host !== undefined && host.trim () !== '') ? host.trim () : DEFAULT_HOST });
}

function scrub (value: any, depth = 0): any {
    if (depth > 12 || value === null || typeof value !== 'object') {
        return value;
    }
    if (Array.isArray (value)) {
        return value.map ((entry) => scrub (entry, depth + 1));
    }
    const out: Record<string, any> = {};
    for (const [ key, entry ] of Object.entries (value)) {
        out[key] = SENSITIVE_KEYS.has (key.toLowerCase ()) ? REMOVED : scrub (entry, depth + 1);
    }
    return out;
}

// true when a captured value shows this call was one of the widget's signing steps
function isSigningStep (properties: Record<string, any>): boolean {
    if (properties['$mcp_tool_name'] === SIGN_STEP_TOOL) {
        return true;
    }
    const text = JSON.stringify (properties['$mcp_parameters'] ?? null) ?? '';
    return text.includes ('"signing"') || text.includes ('"' + SIGN_STEP_TOOL + '"');
}

// exported for tests: what is allowed to leave for PostHog
export function redactEvent<T extends { properties?: Record<string, any> }> (event: T): T {
    const properties = event.properties;
    if (properties === undefined || properties === null) {
        return event;
    }
    if (isSigningStep (properties)) {
        // keep that the step happened and how it went; drop what went in and what came out
        if ('$mcp_parameters' in properties) properties['$mcp_parameters'] = REMOVED;
        if ('$mcp_response' in properties) properties['$mcp_response'] = REMOVED;
    }
    for (const name of [ '$mcp_parameters', '$mcp_response' ]) {
        if (name in properties) properties[name] = scrub (properties[name]);
    }
    return event;
}

export function instrumentServer (server: unknown, posthog: PostHog): void {
    instrument (server, posthog, {
        'context': false,
        'captureModel': false,
        'enableConversationId': false,
        'beforeSend': (event) => redactEvent (event as any) as any,
    });
}
