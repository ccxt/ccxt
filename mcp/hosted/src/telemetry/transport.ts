// The one fetch every PostHog request goes through (analytics, logs and the start-up
// check). It exists for three reasons:
// - the token travels in an Authorization header, never in a URL: posthog-node's logs
//   lane puts it in "?token=", where proxies and access logs would record it;
// - shutdown can abort whatever is still in flight, so a hung PostHog cannot hold the
//   process open past the shutdown deadline;
// - the HTTP status of each kind of request feeds status (). A 2xx is not proof that
//   PostHog accepted anything (its capture endpoints answer 200 to a bogus token); a
//   non-2xx, or a network failure, is proof that something is wrong.

export type EndpointKind = 'analytics' | 'logs' | 'flags' | 'other';

export interface TransportObservation {
    kind: EndpointKind;
    status: number; // 0 for a network failure or an abort
    body?: string; // response body, read only when a test asked for it
}

export interface Transport {
    fetch: (url: string, options: any) => Promise<any>;
    abortAll: () => void;
    inFlight: () => number;
}

export function endpointKind (url: string): EndpointKind {
    const path = (() => {
        try {
            return new URL (url).pathname;
        } catch (e) {
            return '';
        }
    }) ();
    if (path.startsWith ('/i/v1/logs')) {
        return 'logs';
    }
    if (path.startsWith ('/flags')) {
        return 'flags';
    }
    if (path.startsWith ('/i/v1/analytics') || path.startsWith ('/batch') || path.startsWith ('/i/v0/e') || path.startsWith ('/capture')) {
        return 'analytics';
    }
    return 'other';
}

export function createTransport (options: {
    token: string;
    fetch?: typeof globalThis.fetch;
    observe: (observation: TransportObservation) => void;
    captureBodies?: boolean;
}): Transport {
    const baseFetch = options.fetch ?? globalThis.fetch;
    const shutdown = new AbortController ();
    // After shutdown every request, in flight or new, ends with this answer. A rejection
    // would not do: posthog-node treats a network error as retryable and sleeps (3 s by
    // default, not unref'd) before trying again, which holds the process open long after
    // the deadline. 499 is in neither of its retryable sets, so the batch is dropped at once.
    const closedResponse = (): Response => new Response ('{"error":"telemetry shut down"}', { 'status': 499, 'headers': { 'content-type': 'application/json' } });
    const closed = new Promise<Response> ((resolve) => {
        shutdown.signal.addEventListener ('abort', () => resolve (closedResponse ()), { 'once': true });
    });
    let inFlight = 0;
    const wrapped = async (url: string, init: any = {}): Promise<any> => {
        if (shutdown.signal.aborted) {
            return closedResponse ();
        }
        const kind = endpointKind (url);
        const target = new URL (url);
        const headers: Record<string, string> = { ...(init.headers ?? {}) };
        if (target.searchParams.has ('token')) {
            target.searchParams.delete ('token');
            headers['Authorization'] = 'Bearer ' + options.token;
        }
        const signals = [ shutdown.signal ];
        if (init.signal !== undefined) {
            signals.push (init.signal);
        }
        inFlight += 1;
        try {
            const request = baseFetch (target.toString (), { ...init, headers, 'signal': AbortSignal.any (signals) });
            // the abort that frees the socket also rejects this; that rejection is expected
            request.catch (() => undefined);
            const response = await Promise.race ([ request, closed ]);
            if (shutdown.signal.aborted) {
                return response;
            }
            let body: string | undefined;
            if (options.captureBodies === true) {
                body = await response.clone ().text ().catch (() => undefined);
            }
            options.observe ({ kind, 'status': response.status, body });
            return response;
        } catch (error) {
            if (!shutdown.signal.aborted) {
                options.observe ({ kind, 'status': 0 });
            }
            throw error;
        } finally {
            inFlight -= 1;
        }
    };
    return {
        'fetch': wrapped,
        'abortAll': () => shutdown.abort (new Error ('telemetry shut down')),
        'inFlight': () => inFlight,
    };
}
