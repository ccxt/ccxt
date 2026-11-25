import { PostHog } from 'posthog-node';
import { instrument } from '@posthog/mcp';
import { SIGN_STEP_TOOL } from './browser-signing.js';
import { log } from './logging.js';

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
    const client = new PostHog (token.trim (), {
        'host': (host !== undefined && host.trim () !== '') ? host.trim () : DEFAULT_HOST,
        // console trace of what is queued for PostHog: the event name and, for MCP events, the
        // tool or resource and whether it failed. Never arguments or results.
        'beforeSend': (event: any) => {
            if (event !== null && event !== undefined) {
                const properties = event.properties ?? {};
                log ('info', 'posthog queued ' + String (event.event), {
                    'tool': properties['$mcp_tool_name'], 'resource': properties['$mcp_resource_name'], 'isError': properties['$mcp_is_error'],
                    'client': properties['$mcp_client_name'], 'distinctId': event.distinctId ?? event.distinct_id,
                });
            }
            return event;
        },
    });
    // …and of what PostHog answered: a batch it accepted, or why one failed
    client.on ('flush', (messages: any) => {
        log ('info', 'posthog delivered ' + (Array.isArray (messages) ? messages.length : 1) + ' event(s)');
    });
    client.on ('error', (error: any) => {
        log ('warning', 'posthog delivery failed: ' + String (error?.message ?? error).slice (0, 300));
    });
    return client;
}


export function instrumentServer (server: unknown, posthog: PostHog): PostHog {
    instrument (server, posthog, {
        'context': false,
        'captureModel': false,
        'enableConversationId': false,
    });
    return posthog;
}
