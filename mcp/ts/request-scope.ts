import { AsyncLocalStorage } from 'async_hooks';
import type { AuthInfo, ServerContext as ToolRequestContext } from '@modelcontextprotocol/server';

// Per-call scope for the one tool call being handled. The registration guard in
// tools/access.ts opens it around every handler, so helpers deep in the call stack
// (run () sanitising errors, confirmWrite () asking the human) can see the SDK request
// context and the deployment without every one of ~40 handlers threading them through.
// It never carries authority of its own: each value is copied from the ServerContext or
// the SDK request context at the single choke point that opens the scope.
export interface RequestScope {
    request: ToolRequestContext | undefined;
    hosted: boolean;
    authInfo: AuthInfo | undefined;
}

const storage = new AsyncLocalStorage<RequestScope> ();

export function runInRequestScope<T> (scope: RequestScope, fn: () => T): T {
    return storage.run (scope, fn);
}

export function currentRequestScope (): RequestScope | undefined {
    return storage.getStore ();
}
