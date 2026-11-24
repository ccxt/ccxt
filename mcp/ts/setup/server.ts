import type { AccountConfig, ServerContext } from '../types.js';
import { SessionServer } from './session.js';
import type { SessionDeps } from './session.js';
import { AccountActions, DEFAULT_TEST_TIMEOUT_MS } from './accounts.js';
import type { AccountDeps, TierListing } from './accounts.js';

export interface SetupDeps extends SessionDeps, AccountDeps {}

// The account pages as the rest of the server knows them: the security core (session.ts)
// answering with the account actions (accounts.ts). The dependency runs one way — this file
// is the only place the two meet.
export class SetupServer extends SessionServer {
    declare deps: SetupDeps;
    private actions: AccountActions;

    constructor (ctx: ServerContext, deps: Partial<SetupDeps> = {}) {
        // the core fills in its own defaults; the one object is then shared with the actions,
        // so whatever is swapped on `deps` later (tests do) reaches both
        const shared = { 'testTimeoutMs': deps.testTimeoutMs ?? DEFAULT_TEST_TIMEOUT_MS } as SetupDeps;
        const actions = new AccountActions (ctx, shared);
        super (actions, deps);
        Object.assign (shared, this.deps);
        this.deps = shared;
        this.actions = actions;
    }

    // set by tools/setup.ts: lists the tool tiers a saved account newly enables
    get listTiers (): ((account: AccountConfig) => TierListing) | undefined {
        return this.actions.listTiers;
    }

    set listTiers (value: ((account: AccountConfig) => TierListing) | undefined) {
        this.actions.listTiers = value;
    }

    // where a save lands: the file this server loaded, else the one the next start would load
    configPath (): string {
        return this.actions.configPath ();
    }
}
