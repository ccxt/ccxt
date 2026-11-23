import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { CREDENTIAL_FIELDS } from '../types.js';
import { ok } from '../format.js';
import { isValidAccountName } from '../config.js';
import { UnknownExchangeError } from '../pools.js';
import { SetupServer, SetupOpenError } from '../setup.js';
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

    server.registerTool ('setup_account', {
        'title': 'Open the account setup form in the user\'s browser',
        'description': 'Connect an exchange account WITHOUT the API key ever entering this chat: opens a setup form in the user\'s default browser, served from their own machine, where they pick the exchange, type the API credentials, choose testnet/demo/live and whether orders may be placed (live needs a per-order USD cap). The account is saved to the local config file and usable immediately. Use this for "get started", for a first account, or whenever a tool reports an unconfigured account. The result only says the form was opened — you never see what the user types. Never ask the user to paste keys in chat.',
        'inputSchema': {
            'exchange': z.string ().optional ().describe ('exchange id to preselect in the form, e.g. "binance" (list_exchanges) — the user can change it'),
            'account': z.string ().optional ().describe ('account name to prefill (letters, digits, "-", "_"); defaults to the exchange id'),
            'sandbox': z.boolean ().optional ().describe ('environment to preselect: true or omitted = testnet/sandbox (recommended for a first setup), false = live — the user makes the final choice in the form'),
        },
        // the call itself changes nothing: it opens a page. Whatever gets saved is typed and
        // confirmed by the human in that page, outside the model's reach.
        'annotations': { 'readOnlyHint': true, 'idempotentHint': false, 'openWorldHint': false },
    }, async ({ exchange, account, sandbox }) => run ({ 'tool': 'setup_account' }, async () => {
        const directory = ctx.pools.directory ();
        if (exchange !== undefined && !directory.isKnownExchange (exchange)) {
            throw new UnknownExchangeError (exchange, directory.closestMatches (exchange, directory.allExchangeIds ()));
        }
        if (account !== undefined && !isValidAccountName (account)) {
            throw new ArgError ('invalid account name ' + JSON.stringify (account), 'use 1-40 letters, digits, "-" or "_" — or omit it and let the user name the account in the form');
        }
        const configPath = setup.configPath ();
        let opened: { expiresInSeconds: number };
        try {
            opened = await setup.open ({ exchange, account, sandbox });
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
        let credentials: string[] | undefined = undefined;
        if (exchange !== undefined) {
            const required = ctx.pools.getBare (exchange).requiredCredentials ?? {};
            credentials = CREDENTIAL_FIELDS.filter ((field) => required[field] === true);
        }
        return ok ({
            'opened': true,
            'where': 'the user\'s default web browser, on their own computer',
            'asksFor': [
                'exchange',
                'account name',
                (credentials !== undefined) ? ('API credentials for ' + exchange + ': ' + (credentials.join (', ') || 'none required')) : 'the API credentials that exchange requires',
                'environment: testnet/sandbox (default), demo trading, or live',
                'whether orders may be placed (live trading additionally requires a per-order USD cap and an explicit confirmation)',
            ],
            'expiresInSeconds': opened.expiresInSeconds,
            'savesTo': configPath,
        }, {
            'notice': 'A setup form is now open in the user\'s browser. Tell them to switch to it, follow the steps (create an API key on the exchange with withdrawals DISABLED, type it into the form, save) and come back here when it says "Saved". Do NOT ask them to paste or type any key, secret or passphrase in this chat — you never need to see them. The form expires in ' + Math.round (opened.expiresInSeconds / 60) + ' minutes and works once; call setup_account again for a fresh one. When the user says they are done, call list_accounts — the new account is usable immediately, no restart'
                + (ctx.config.settings.hideDisabledTools === true ? ' (this server hides disabled tool tiers, so tools of a newly enabled tier are listed only after the server restarts)' : '') + '.',
        });
    }));
}
