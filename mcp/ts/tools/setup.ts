import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AccountConfig, ServerContext } from '../types.js';
import { CREDENTIAL_FIELDS } from '../types.js';
import { ok } from '../format.js';
import { isValidAccountName } from '../config.js';
import { UnknownExchangeError } from '../pools.js';
import { SetupServer, SetupOpenError } from '../setup.js';
import type { SetupOpened, TierListing } from '../setup.js';
import { log } from '../logging.js';
import { registerReadTools } from './read.js';
import { registerAccountUiTools } from './ui-account.js';
import { registerTradeTools } from './trade.js';
import { registerRouteExecuteTool } from './route.js';
import { run, ArgError } from './common.js';

// setup_account is the only way an account is created from a conversation, and it is built so
// the conversation never holds a credential: the tool opens a page in the user's browser
// (served by this process on 127.0.0.1, see ../setup.ts) and reports back nothing but "opened".
// The page's address carries the session token, so it is deliberately absent from the result —
// a model with a shell or a fetch tool could otherwise fill in the form itself.
export function registerSetupTools (server: McpServer, ctx: ServerContext): void {
    const setup = new SetupServer (ctx);
    // server.ts closes it on shutdown; tests reach it here to inject the browser opener
    ctx.setup = setup;

    // With hideDisabledTools the read and trade tiers are listed only when an account enables
    // them — the same two conditions as registerAllTools, taken at the same moment (startup).
    // An account saved from the form can enable either while the server runs, so the form
    // lists that tier then: McpServer accepts registrations after connect and announces them
    // with notifications/tools/list_changed. The funds and raw-write tiers are not here
    // because the form cannot enable them.
    const hideDisabled = ctx.config.settings.hideDisabledTools === true;
    const startAccounts = Object.values (ctx.config.accounts);
    const listed: Record<string, boolean> = {
        'read': !hideDisabled || startAccounts.length > 0,
        'trading': !hideDisabled || startAccounts.some ((account) => (account.trading ?? false) !== false),
    };
    const unlistable: Record<string, boolean> = {};
    const listTier = (tier: string, register: () => void, listing: TierListing): void => {
        if (listed[tier]) {
            return;
        }
        if (!unlistable[tier]) {
            try {
                register ();
                listed[tier] = true;
                listing.added.push (tier);
                return;
            } catch (e: any) {
                // half a tier may now be registered; it is not retried, the restart lists it
                unlistable[tier] = true;
                log ('warning', 'the ' + tier + ' tools could not be added to the running server (' + String (e?.message ?? e) + ') — they are listed after a restart');
            }
        }
        listing.restartNeeded = true;
    };
    setup.listTiers = (account: AccountConfig): TierListing => {
        const listing: TierListing = { 'added': [], 'restartNeeded': false };
        listTier ('read', () => {
            registerReadTools (server, ctx);
            registerAccountUiTools (server, ctx);
        }, listing);
        if ((account.trading ?? false) !== false) {
            listTier ('trading', () => {
                registerTradeTools (server, ctx);
                registerRouteExecuteTool (server, ctx);
            }, listing);
        }
        return listing;
    };

    server.registerTool ('setup_account', {
        'title': 'Open the account setup form in the user\'s browser',
        'description': 'Connect an exchange account WITHOUT the API key ever entering this chat: opens a setup form in the user\'s default browser, served from their own machine, where they pick the exchange, type the API credentials, choose testnet/demo/live and whether orders may be placed (live needs a per-order USD cap). The account is saved to the local config file and usable immediately. Use this for "get started", for a first account, or whenever a tool reports an unconfigured account. The result only says the form was opened — you never see what the user types. Never ask the user to paste keys in chat. Call it once and wait for the user: while a form is open, calling again opens nothing new and leaves what they typed alone.',
        'inputSchema': {
            'exchange': z.string ().optional ().describe ('exchange id to preselect in the form, e.g. "binance" (list_exchanges) — the user can change it'),
            'account': z.string ().optional ().describe ('account name to prefill (letters, digits, "-", "_"); defaults to the exchange id'),
            'sandbox': z.boolean ().optional ().describe ('environment to preselect: true or omitted = testnet/sandbox (recommended for a first setup), false = live — the user makes the final choice in the form'),
            'restart': z.boolean ().optional ().describe ('true = throw away the form that is currently open, INCLUDING anything the user has typed into it, and open a fresh one. Only when the user says they closed or lost the form; never to change the preselected values'),
        },
        // Not read-only, although nothing is saved by the call itself (whatever gets saved is
        // typed and confirmed by the human in the page, outside the model's reach): it starts
        // a browser window on the user's desktop and, with restart, discards a form they may
        // be typing into. A host that auto-approves read-only tools must not run this unasked.
        // Not destructive either — it cannot change or remove an account.
        'annotations': { 'readOnlyHint': false, 'destructiveHint': false, 'idempotentHint': false, 'openWorldHint': false },
    }, async ({ exchange, account, sandbox, restart }) => run ({ 'tool': 'setup_account' }, async () => {
        const directory = ctx.pools.directory ();
        if (exchange !== undefined && !directory.isKnownExchange (exchange)) {
            throw new UnknownExchangeError (exchange, directory.closestMatches (exchange, directory.allExchangeIds ()));
        }
        if (account !== undefined && !isValidAccountName (account)) {
            throw new ArgError ('invalid account name ' + JSON.stringify (account), 'use 1-40 letters, digits, "-" or "_" — or omit it and let the user name the account in the form');
        }
        const configPath = setup.configPath ();
        let opened: SetupOpened;
        try {
            opened = await setup.open ({ exchange, account, sandbox }, { 'restart': restart === true });
        } catch (e: any) {
            if (!(e instanceof SetupOpenError)) {
                throw e;
            }
            return {
                'ok': false,
                'error': {
                    'code': 'SETUP_FORM_UNAVAILABLE',
                    'message': 'the setup form could not be shown: ' + e.message + ' (no desktop browser is reachable from the ccxt-mcp process)',
                    'retryable': false,
                    'hint': 'Tell the user to add the account to the ccxt-mcp config file at "' + configPath + '" instead — e.g. {"accounts":{"binance":{"exchange":"binance","apiKey":"...","secret":"...","sandbox":true}}} — then restart the server (get_safety_status shows the config path and what is active). API keys go ONLY in that file, never in this chat.',
                },
            };
        }
        const minutes = Math.max (1, Math.round (opened.expiresInSeconds / 60));
        // what happens to the tool list when the user saves, which depends on what is listed now
        let afterSave = 'call list_accounts — the new account is usable immediately, no restart';
        if (!listed['read']) {
            afterSave = 'call list_accounts — it and the other account tools are added to this server\'s tool list the moment the account is saved (this server hides the tiers that have no account) and the account is usable immediately. If those tools do not show up for you, the host did not refresh its tool list: tell the user to restart the assistant app once';
        } else if (hideDisabled) {
            afterSave += ' (this server hides disabled tool tiers: the tools of a tier the new account enables are added to the tool list when it is saved — if they do not show up for you, the user restarts the assistant app once)';
        }
        if (opened.state === 'already-open') {
            return ok ({
                'opened': false,
                'alreadyOpen': true,
                'where': 'the user\'s default web browser, on their own computer',
                'expiresInSeconds': opened.expiresInSeconds,
                'savesTo': configPath,
            }, {
                'notice': 'The setup form from the earlier call is still open in the user\'s browser, so nothing new was opened and whatever they have typed is untouched (the exchange, account and sandbox arguments of this call were not applied — the user picks those in the form). Tell them to switch to that browser tab and finish there; it expires in about ' + minutes + ' minutes. Only if they say they closed or cannot find it: call setup_account again with restart: true, which discards that form and anything typed into it. Do NOT ask them to paste or type any key, secret or passphrase in this chat. When the user says they are done, ' + afterSave + '.',
            });
        }
        let credentials = 'the API credentials that exchange requires';
        if (exchange !== undefined) {
            const required = ctx.pools.getBare (exchange).requiredCredentials ?? {};
            const fields = CREDENTIAL_FIELDS.filter ((field) => required[field] === true);
            credentials = (fields.length > 0)
                ? ('API credentials for ' + exchange + ': ' + fields.join (', '))
                : (exchange + ' takes its credentials in a way the form cannot collect — the form will tell the user to add this account to the config file instead');
        }
        return ok ({
            'opened': true,
            'where': 'the user\'s default web browser, on their own computer',
            'asksFor': [
                'exchange',
                'account name',
                credentials,
                'environment: testnet/sandbox (default), demo trading, or live',
                'whether orders may be placed (live trading additionally requires a per-order USD cap and an explicit confirmation)',
            ],
            'expiresInSeconds': opened.expiresInSeconds,
            'savesTo': configPath,
        }, {
            'notice': 'A setup form is now open in the user\'s browser. Tell them to switch to it, follow the steps (create an API key on the exchange with withdrawals DISABLED, type it into the form, save) and come back here when it says "Saved". Do NOT ask them to paste or type any key, secret or passphrase in this chat — you never need to see them. The form expires in ' + minutes + ' minutes and works once. Do not call setup_account again while they are filling it in; if they lost the form, restart: true opens a fresh one. When the user says they are done, ' + afterSave + '.',
        });
    }));
}
