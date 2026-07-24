import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { accountEnvironment } from '../types.js';
import { ok, stripInfo } from '../format.js';
import type { Envelope } from '../format.js';
import { run, accountParam, paramsParam, confirmWrite, environmentMeta } from './common.js';
import { requireTier, requireImplicitWrites, SafetyError } from '../safety.js';
import { executeWrite, journalRejection } from './write-common.js';
import { implicitVerb, isImplicitMethod } from '../introspect.js';

const confirmParam = z.string ().optional ().describe ('confirmation token from the preview response — repeat the identical call with this token to execute');

export function registerFundsTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('withdraw', {
        'title': 'Withdraw funds',
        'description': 'Withdraw cryptocurrency from a funds-enabled account to an external address. Irreversible once dispatched. The preview echoes the exact destination address and network — verify them before confirming.',
        'inputSchema': {
            'account': accountParam,
            'code': z.string ().describe ('unified currency code, e.g. "USDT"'),
            'amount': z.number ().positive (),
            'address': z.string ().describe ('destination address'),
            'tag': z.string ().optional ().describe ('memo/tag where the network needs one'),
            'network': z.string ().optional ().describe ('unified network code, e.g. "TRC20" — check describe_method {"method": "withdraw", "exchange": ...}'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'withdraw', 'account': args.account }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (args.account);
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            let valuation;
            try {
                valuation = await ctx.safety.guardTransfer (exchange, account, args.code, args.amount);
            } catch (error: any) {
                if (error instanceof SafetyError) {
                    journalRejection (ctx, account, 'withdraw', 'withdraw', error, { 'code': args.code, 'amount': args.amount, 'address': args.address });
                }
                throw error;
            }
            const requestParams: Record<string, any> = { ...(args.params ?? {}) };
            if (args.network !== undefined) {
                requestParams['network'] = args.network;
            }
            const payload = { 'tool': 'withdraw', 'account': account.name, 'code': args.code, 'amount': args.amount, 'address': args.address, 'tag': args.tag ?? null, 'network': args.network ?? null, 'params': requestParams };
            const preview = {
                'currency': args.code,
                'amount': args.amount,
                'estimatedValueUsd': valuation.value,
                'destinationAddress': args.address,
                'tag': args.tag,
                'network': args.network ?? '(exchange default)',
                'environment': accountEnvironment (account),
                'warning': 'withdrawals are IRREVERSIBLE — verify the address and network character by character',
            };
            const confirmation = await confirmWrite (ctx, account, 'withdrawal', payload, preview, args.confirm, true);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            if (account.dryRun) {
                return ok ({ 'dryRun': true, preview }, { ...environmentMeta (account), 'notice': 'dryRun is enabled on this account — no withdrawal was sent' });
            }
            const dispatch = await executeWrite (ctx, {
                account,
                'tool': 'withdraw',
                'method': 'withdraw',
                'params': payload,
                'computed': { 'orderValue': valuation.value },
            }, () => exchange.withdraw (args.code, args.amount, args.address, args.tag, requestParams));
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            return ok (stripInfo (dispatch.result), environmentMeta (account));
        });
    }));

    server.registerTool ('transfer', {
        'title': 'Transfer between account wallets',
        'description': 'Move funds between wallets of the same exchange account (e.g. spot ↔ swap, main ↔ funding) on a funds-enabled account. Wallet names are exchange-specific — see describe_method {"method": "transfer", "exchange": ...}.',
        'inputSchema': {
            'account': accountParam,
            'code': z.string ().describe ('unified currency code'),
            'amount': z.number ().positive (),
            'fromAccount': z.string ().describe ('source wallet, e.g. "spot"'),
            'toAccount': z.string ().describe ('destination wallet, e.g. "swap"'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'transfer', 'account': args.account }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (args.account);
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            let valuation;
            try {
                valuation = await ctx.safety.guardTransfer (exchange, account, args.code, args.amount);
            } catch (error: any) {
                if (error instanceof SafetyError) {
                    journalRejection (ctx, account, 'transfer', 'transfer', error, { 'code': args.code, 'amount': args.amount, 'from': args.fromAccount, 'to': args.toAccount });
                }
                throw error;
            }
            const payload = { 'tool': 'transfer', 'account': account.name, 'code': args.code, 'amount': args.amount, 'fromAccount': args.fromAccount, 'toAccount': args.toAccount, 'params': args.params ?? {} };
            const preview = {
                'currency': args.code,
                'amount': args.amount,
                'estimatedValueUsd': valuation.value,
                'from': args.fromAccount,
                'to': args.toAccount,
                'environment': accountEnvironment (account),
            };
            const confirmation = await confirmWrite (ctx, account, 'transfer', payload, preview, args.confirm, true);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            if (account.dryRun) {
                return ok ({ 'dryRun': true, preview }, { ...environmentMeta (account), 'notice': 'dryRun is enabled on this account — no transfer was sent' });
            }
            const dispatch = await executeWrite (ctx, {
                account,
                'tool': 'transfer',
                'method': 'transfer',
                'params': payload,
                'computed': { 'orderValue': valuation.value },
            }, () => exchange.transfer (args.code, args.amount, args.fromAccount, args.toAccount, args.params ?? {}));
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            return ok (stripInfo (dispatch.result), environmentMeta (account));
        });
    }));

    server.registerTool ('get_deposit_address', {
        'title': 'Get a deposit address',
        'description': 'Deposit address for a currency on a funds-enabled account (creates one where none exists and the exchange supports creation). Gated behind the funds tier because transcript-visible addresses invite substitution scams — always verify addresses out-of-band before sending funds.',
        'inputSchema': {
            'account': accountParam,
            'code': z.string ().describe ('unified currency code'),
            'network': z.string ().optional ().describe ('unified network code'),
            'params': paramsParam,
        },
        // not readOnly: the createDepositAddress fallback creates an address server-side
        'annotations': { 'readOnlyHint': false, 'destructiveHint': false, 'openWorldHint': true },
    }, async ({ account: accountName, code, network, params }) => run ({ 'tool': 'get_deposit_address', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireTier (account, 'funds');
        const requestParams: Record<string, any> = { ...(params ?? {}) };
        if (network !== undefined) {
            requestParams['network'] = network;
        }
        let result: any;
        if (exchange.has?.['fetchDepositAddress']) {
            try {
                result = await exchange.fetchDepositAddress (code, requestParams);
            } catch (e) {
                if (exchange.has?.['createDepositAddress']) {
                    result = await exchange.createDepositAddress (code, requestParams);
                } else {
                    throw e;
                }
            }
        } else if (exchange.has?.['createDepositAddress']) {
            result = await exchange.createDepositAddress (code, requestParams);
        } else {
            return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchange.id + ' supports neither fetchDepositAddress nor createDepositAddress', 'retryable': false, 'hint': '' } };
        }
        return ok (stripInfo (result), { ...environmentMeta (account), 'warning': 'verify this address out-of-band before sending funds — transcripts are not a trusted channel for addresses' });
    }));
}

export function registerImplicitWriteTool (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('call_implicit_write', {
        'title': 'Call a raw non-GET endpoint (implicit API)',
        'description': 'Call an exchange-specific implicit REST endpoint over POST/PUT/DELETE/PATCH on an account with "implicitWrites" enabled — covers exchange features the unified API does not (including account/key management). No unified validation exists for raw endpoints, so every call previews and requires confirmation, and is journaled. Endpoint names: describe_method {"query": ..., "exchange": ...}; payload per the exchange API reference (describe_exchange .urls.doc).',
        'inputSchema': {
            'account': accountParam,
            'method': z.string ().describe ('implicit method name with a non-GET verb, e.g. "privatePostMarginOrder"'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, method, params, confirm }) => run ({ 'tool': 'call_implicit_write', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireImplicitWrites (account);
        if (!isImplicitMethod (exchange, method)) {
            return { 'ok': false, 'error': { 'code': 'UNKNOWN_ENDPOINT', 'message': method + ' is not an implicit endpoint of ' + exchange.id, 'retryable': false, 'hint': 'search endpoint names with describe_method {"query": "...", "exchange": "' + exchange.id + '"}' } };
        }
        const verb = implicitVerb (method);
        if (verb === 'Get') {
            return { 'ok': false, 'error': { 'code': 'USE_GET_TOOL', 'message': method + ' is a GET endpoint — use call_implicit_get', 'retryable': false, 'hint': '' } };
        }
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            const payload = { 'tool': 'call_implicit_write', 'account': account.name, method, 'params': params ?? {} };
            const preview = {
                'endpoint': method,
                'httpVerb': (verb ?? 'unknown').toUpperCase (),
                'request': params ?? {},
                'environment': accountEnvironment (account),
                'warning': 'raw endpoint — ccxt-mcp cannot validate or cap this request; it goes to the exchange as-is',
            };
            const confirmation = await confirmWrite (ctx, account, 'raw ' + (verb ?? '').toUpperCase () + ' call', payload, preview, confirm, true);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            const dispatch = await executeWrite (ctx, { account, 'tool': 'call_implicit_write', method, 'params': payload }, () => exchange[method] (params ?? {}));
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            return ok (dispatch.result, { ...environmentMeta (account), method, 'docsUrl': exchange.urls?.doc });
        });
    }));
}
