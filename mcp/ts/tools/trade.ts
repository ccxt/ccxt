import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { accountEnvironment } from '../types.js';
import { ok, project, ORDER_FIELDS } from '../format.js';
import type { Envelope } from '../format.js';
import { run, clampLimit, accountParam, paramsParam, confirmWrite, environmentMeta } from './common.js';
import { requireTier, SafetyError } from '../safety.js';
import { executeWrite, journalRejection, maybeInjectClientOrderId } from './write-common.js';

const confirmParam = z.string ().optional ().describe ('confirmation token from the preview response — repeat the identical call with this token to execute');

// unified write long tail dispatchable via call_write_method; batch order placement is
// deliberately absent (it would bypass the per-order notional caps — place orders one by
// one via create_order), as are funds moves (funds tier) and raw endpoints (implicitWrites)
const WRITE_METHOD_ALLOWLIST = new Set ([
    'cancelOrders', 'cancelOrdersForSymbols', 'cancelAllOrdersAfter',
    'setPositionMode', 'addMargin', 'reduceMargin', 'setMargin',
    'borrowCrossMargin', 'borrowIsolatedMargin', 'repayCrossMargin', 'repayIsolatedMargin',
    'closePosition', 'closeAllPositions',
]);

export function registerTradeTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('create_order', {
        'title': 'Place an order',
        'description': 'Place an order on a trading-enabled account (works on prediction exchanges with outcome handles as the symbol). Validated against market precision/limits and the account\'s notional caps, and gated by a confirmation step. Use "cost" instead of "amount" to market-buy by quote value where supported. Exchange-specific order params (triggerPrice, timeInForce, postOnly, reduceOnly, …): describe_method {"method": "createOrder", "exchange": ...}.',
        'inputSchema': {
            'account': accountParam,
            'symbol': z.string ().describe ('unified symbol (outcome handle on prediction exchanges)'),
            'type': z.string ().describe ('order type — usually "limit" or "market"; exchange-specific types pass through'),
            'side': z.enum ([ 'buy', 'sell' ]),
            'amount': z.number ().positive ().optional ().describe ('amount in base currency / contracts / shares'),
            'cost': z.number ().positive ().optional ().describe ('spend this quote-currency value instead of specifying an amount (market buy/sell by cost, where the exchange supports it)'),
            'price': z.number ().positive ().optional ().describe ('limit price — required for limit orders'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'create_order', 'account': args.account }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (args.account);
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            if (args.amount === undefined && args.cost === undefined) {
                return { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'pass either "amount" (base units) or "cost" (quote value)', 'retryable': false, 'hint': '' } };
            }
            if (args.type === 'limit' && args.price === undefined) {
                return { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'limit orders require a "price"', 'retryable': false, 'hint': 'pass "price", or use type "market"' } };
            }
            const byCost = args.amount === undefined;
            if (byCost && args.side === 'sell' && !exchange.has?.['createMarketSellOrderWithCost']) {
                // there is no safe emulation: passing cost in the amount slot would SELL
                // that many BASE units (the buy-side flag convention is buy-only in ccxt)
                return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchange.id + ' has no createMarketSellOrderWithCost — sell-by-cost cannot be safely emulated', 'retryable': false, 'hint': 'compute the base amount from the current price (get_tickers) and pass "amount" instead' } };
            }
            let guarded;
            try {
                if (byCost) {
                    requireTier (account, 'trading');
                    ctx.safety.checkSymbolAllowed (account, args.symbol);
                    // cost IS the quote-side order value — cap it directly
                    guarded = await ctx.safety.guardCost (exchange, account, args.symbol, args.cost as number);
                } else {
                    guarded = await ctx.safety.guardOrder (exchange, account, {
                        'tool': 'create_order',
                        'symbol': args.symbol,
                        'type': args.type,
                        'side': args.side,
                        'amount': args.amount as number,
                        'price': args.price,
                        'params': args.params ?? {},
                    });
                }
            } catch (error: any) {
                if (error instanceof SafetyError) {
                    journalRejection (ctx, account, 'create_order', 'createOrder', error, { 'symbol': args.symbol, 'type': args.type, 'side': args.side, 'amount': args.amount, 'cost': args.cost, 'price': args.price });
                }
                throw error;
            }
            const resolvedAmount = byCost ? undefined : guarded.amount;
            const resolvedPrice = byCost ? args.price : guarded.price;
            const payload = { 'tool': 'create_order', 'account': account.name, 'symbol': args.symbol, 'type': args.type, 'side': args.side, 'amount': args.amount ?? null, 'cost': args.cost ?? null, 'price': args.price ?? null, 'params': args.params ?? {} };
            const preview: Record<string, any> = {
                'symbol': args.symbol,
                'type': args.type,
                'side': args.side,
                'amount': resolvedAmount,
                'cost': args.cost,
                'price': resolvedPrice,
                'estimatedValueUsd': guarded.orderValue,
                'priceEstimated': guarded.priceEstimated,
                'environment': accountEnvironment (account),
                'params': args.params ?? {},
            };
            const confirmation = await confirmWrite (ctx, account, 'order', payload, preview, args.confirm);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            if (account.dryRun) {
                return ok ({ 'dryRun': true, preview }, { ...environmentMeta (account), 'notice': 'dryRun is enabled on this account — no order was sent' });
            }
            const injected = maybeInjectClientOrderId (exchange, args.params ?? {});
            const dispatch = await executeWrite (ctx, {
                account,
                'tool': 'create_order',
                'method': 'createOrder',
                'params': payload,
                'computed': { 'orderValue': guarded.orderValue, 'orderValueCurrency': guarded.orderValueCurrency },
                'clientOrderId': injected.clientOrderId,
            }, async () => {
                if (byCost) {
                    const method = (args.side === 'buy') ? 'createMarketBuyOrderWithCost' : 'createMarketSellOrderWithCost';
                    if (exchange.has?.[method]) {
                        return exchange[method] (args.symbol, args.cost, injected.params);
                    }
                    // buy-only fallback (the sell case was rejected before the preview):
                    // cost in the amount slot + this flag is the documented ccxt convention
                    return exchange.createOrder (args.symbol, args.type, args.side, args.cost, undefined, { ...injected.params, 'cost': args.cost, 'createMarketBuyOrderRequiresPrice': false });
                }
                return exchange.createOrder (args.symbol, args.type, args.side, resolvedAmount, resolvedPrice, injected.params);
            });
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            return ok (project (dispatch.result, ORDER_FIELDS), { ...environmentMeta (account), 'estimatedValueUsd': guarded.orderValue, 'clientOrderId': injected.clientOrderId });
        });
    }));

    server.registerTool ('edit_order', {
        'title': 'Modify an open order',
        'description': 'Modify price/amount of an open order. On exchanges without native edit, ccxt emulates it as cancel-then-replace — queue position is lost and the cancel can succeed while the replace fails. Runs the full order validation and confirmation.',
        'inputSchema': {
            'account': accountParam,
            'id': z.string ().describe ('order id to modify'),
            'symbol': z.string ().describe ('unified symbol of the order'),
            'type': z.string ().optional (),
            'side': z.enum ([ 'buy', 'sell' ]).optional (),
            'amount': z.number ().positive ().optional (),
            'price': z.number ().positive ().optional (),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'edit_order', 'account': args.account }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (args.account);
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            let existing: any;
            try {
                existing = (exchange.has?.['fetchOrder']) ? await exchange.fetchOrder (args.id, args.symbol) : undefined;
            } catch (e) {
                existing = undefined;
            }
            const type = args.type ?? existing?.type ?? 'limit';
            const side = args.side ?? existing?.side;
            const amount = args.amount ?? existing?.remaining ?? existing?.amount;
            const price = args.price ?? existing?.price;
            if (side === undefined || amount === undefined) {
                return { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'could not resolve the order to edit — pass "side" and "amount" explicitly', 'retryable': false, 'hint': 'fetch the order first with get_orders {"id": "' + args.id + '"}' } };
            }
            let guarded;
            try {
                guarded = await ctx.safety.guardOrder (exchange, account, {
                    'tool': 'edit_order',
                    'symbol': args.symbol,
                    type,
                    side,
                    amount,
                    price,
                    'params': args.params ?? {},
                });
            } catch (error: any) {
                if (error instanceof SafetyError) {
                    journalRejection (ctx, account, 'edit_order', 'editOrder', error, { 'id': args.id, 'symbol': args.symbol, amount, price });
                }
                throw error;
            }
            // token payload uses the RAW args (like create_order) so a byte-identical
            // re-call digests identically even if the live order state drifted meanwhile
            const payload = { 'tool': 'edit_order', 'account': account.name, 'id': args.id, 'symbol': args.symbol, 'type': args.type ?? null, 'side': args.side ?? null, 'amount': args.amount ?? null, 'price': args.price ?? null, 'params': args.params ?? {} };
            const preview = {
                'id': args.id,
                'symbol': args.symbol,
                'previous': existing ? project (existing, [ 'type', 'side', 'amount', 'remaining', 'price', 'status' ]) : 'unknown',
                'new': { type, side, 'amount': guarded.amount, 'price': guarded.price },
                'estimatedValueUsd': guarded.orderValue,
                'environment': accountEnvironment (account),
            };
            const confirmation = await confirmWrite (ctx, account, 'order edit', payload, preview, args.confirm);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            if (account.dryRun) {
                return ok ({ 'dryRun': true, preview }, { ...environmentMeta (account), 'notice': 'dryRun is enabled on this account — no edit was sent' });
            }
            const dispatch = await executeWrite (ctx, {
                account,
                'tool': 'edit_order',
                'method': 'editOrder',
                'params': payload,
                'computed': { 'orderValue': guarded.orderValue },
            }, () => exchange.editOrder (args.id, args.symbol, type, side, guarded.amount, guarded.price, args.params ?? {}));
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            return ok (project (dispatch.result, ORDER_FIELDS), environmentMeta (account));
        });
    }));

    server.registerTool ('cancel_order', {
        'title': 'Cancel an order',
        'description': 'Cancel one open order by id. No confirmation step — canceling reduces risk and must never be blocked.',
        'inputSchema': {
            'account': accountParam,
            'id': z.string ().describe ('order id'),
            'symbol': z.string ().optional ().describe ('unified symbol (required by many exchanges)'),
            'params': paramsParam,
        },
        'annotations': { 'destructiveHint': false, 'idempotentHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, id, symbol, params }) => run ({ 'tool': 'cancel_order', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireTier (account, 'trading');
        const dispatch = await executeWrite (ctx, {
            account,
            'tool': 'cancel_order',
            'method': 'cancelOrder',
            'params': { id, symbol },
        }, () => exchange.cancelOrder (id, symbol, params ?? {}));
        if (dispatch.error !== undefined) {
            return dispatch.error;
        }
        const result = dispatch.result;
        const data = (result !== null && typeof result === 'object') ? project (result, ORDER_FIELDS) : { id, 'status': 'canceled' };
        if (data['id'] === undefined) {
            data['id'] = id;
        }
        return ok (data, environmentMeta (account));
    }));

    server.registerTool ('cancel_all_orders', {
        'title': 'Cancel all open orders',
        'description': 'Cancel every open order on an account, optionally restricted to one symbol. The preview lists the orders that would be canceled.',
        'inputSchema': {
            'account': accountParam,
            'symbol': z.string ().optional ().describe ('only cancel orders on this unified symbol'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'idempotentHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, symbol, params, confirm }) => run ({ 'tool': 'cancel_all_orders', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireTier (account, 'trading');
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            let openOrders: any[] = [];
            try {
                if (exchange.has?.['fetchOpenOrders']) {
                    openOrders = await exchange.fetchOpenOrders (symbol);
                }
            } catch (e) {
                openOrders = [];
            }
            const payload = { 'tool': 'cancel_all_orders', 'account': account.name, 'symbol': symbol ?? null };
            const preview = {
                'symbol': symbol ?? '(all symbols)',
                'openOrders': openOrders.slice (0, 50).map ((order) => project (order, [ 'id', 'symbol', 'type', 'side', 'amount', 'remaining', 'price' ])),
                'openOrderCount': openOrders.length,
                'environment': accountEnvironment (account),
            };
            const confirmation = await confirmWrite (ctx, account, 'bulk cancel', payload, preview, confirm);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            const dispatch = await executeWrite (ctx, {
                account,
                'tool': 'cancel_all_orders',
                'method': 'cancelAllOrders',
                'params': payload,
            }, async () => {
                if (exchange.has?.['cancelAllOrders']) {
                    return exchange.cancelAllOrders (symbol, params ?? {});
                }
                const results = [];
                for (const order of openOrders) {
                    results.push (await exchange.cancelOrder (order.id, order.symbol));
                }
                return results;
            });
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            const result = dispatch.result;
            const canceled = Array.isArray (result) ? result.map ((order: any) => project (order, [ 'id', 'symbol', 'status' ])) : result;
            return ok ({ 'canceled': Array.isArray (canceled) ? canceled.length : openOrders.length, 'orders': Array.isArray (canceled) ? canceled : undefined }, environmentMeta (account));
        });
    }));

    server.registerTool ('set_leverage', {
        'title': 'Set leverage',
        'description': 'Set the leverage multiplier for a derivatives symbol on a trading-enabled account. Changing leverage changes the risk of existing positions.',
        'inputSchema': {
            'account': accountParam,
            'leverage': z.number ().positive ().describe ('leverage multiplier, e.g. 5'),
            'symbol': z.string ().optional ().describe ('unified symbol (required by most exchanges)'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, leverage, symbol, params, confirm }) => run ({ 'tool': 'set_leverage', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireTier (account, 'trading');
        if (symbol !== undefined) {
            ctx.safety.checkSymbolAllowed (account, symbol);
        }
        const payload = { 'tool': 'set_leverage', 'account': account.name, leverage, 'symbol': symbol ?? null };
        const preview = { leverage, 'symbol': symbol, 'environment': accountEnvironment (account), 'warning': 'changing leverage changes the liquidation price of existing positions' };
        const confirmation = await confirmWrite (ctx, account, 'leverage change', payload, preview, confirm);
        if (confirmation !== 'confirmed') {
            return confirmation;
        }
        const dispatch = await executeWrite (ctx, { account, 'tool': 'set_leverage', 'method': 'setLeverage', 'params': payload }, () => exchange.setLeverage (leverage, symbol, params ?? {}));
        if (dispatch.error !== undefined) {
            return dispatch.error;
        }
        return ok ({ 'leverage': leverage, symbol, 'result': 'applied' }, environmentMeta (account));
    }));

    server.registerTool ('set_margin_mode', {
        'title': 'Set margin mode',
        'description': 'Set cross or isolated margin mode for a derivatives symbol on a trading-enabled account.',
        'inputSchema': {
            'account': accountParam,
            'marginMode': z.enum ([ 'cross', 'isolated' ]),
            'symbol': z.string ().optional ().describe ('unified symbol (required by most exchanges)'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, marginMode, symbol, params, confirm }) => run ({ 'tool': 'set_margin_mode', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireTier (account, 'trading');
        if (symbol !== undefined) {
            ctx.safety.checkSymbolAllowed (account, symbol);
        }
        const payload = { 'tool': 'set_margin_mode', 'account': account.name, marginMode, 'symbol': symbol ?? null };
        const preview = { marginMode, symbol, 'environment': accountEnvironment (account) };
        const confirmation = await confirmWrite (ctx, account, 'margin mode change', payload, preview, confirm);
        if (confirmation !== 'confirmed') {
            return confirmation;
        }
        const dispatch = await executeWrite (ctx, { account, 'tool': 'set_margin_mode', 'method': 'setMarginMode', 'params': payload }, () => exchange.setMarginMode (marginMode, symbol, params ?? {}));
        if (dispatch.error !== undefined) {
            return dispatch.error;
        }
        return ok ({ marginMode, symbol, 'result': 'applied' }, environmentMeta (account));
    }));

    server.registerTool ('call_write_method', {
        'title': 'Call an allowlisted unified write method',
        'description': 'Dispatch the unified write long tail on a trading-enabled account: ' + [ ...WRITE_METHOD_ALLOWLIST ].join (', ') + '. Always previews and requires confirmation. Batch order placement is deliberately excluded — use create_order per order so the notional caps apply. Signatures: describe_method.',
        'inputSchema': {
            'account': accountParam,
            'method': z.string ().describe ('one of the allowlisted method names'),
            'args': z.array (z.union ([ z.string (), z.number (), z.boolean (), z.null (), z.array (z.any ()), z.record (z.any ()) ])).optional ().describe ('positional arguments per describe_method; null skips an optional argument'),
            'params': paramsParam,
            'confirm': confirmParam,
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, method, args, params, confirm }) => run ({ 'tool': 'call_write_method', 'account': accountName }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        requireTier (account, 'trading');
        if (!WRITE_METHOD_ALLOWLIST.has (method)) {
            return { 'ok': false, 'error': { 'code': 'METHOD_NOT_ALLOWLISTED', 'message': method + ' is not dispatchable through call_write_method', 'retryable': false, 'hint': 'allowlisted here: ' + [ ...WRITE_METHOD_ALLOWLIST ].join (', ') + '. Orders go through create_order. Funds moves (withdraw/transfer) need the funds tier and raw endpoints need the implicitWrites tier — call get_safety_status to see which tiers are enabled' } };
        }
        if (!exchange.has?.[method]) {
            return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': method + ' is not supported by ' + exchange.id, 'retryable': false, 'hint': 'see describe_exchange' } };
        }
        return ctx.safety.withAccountLock (account.name, async (): Promise<Envelope> => {
            const callArgs = (args ?? []).map ((arg) => ((arg === null) ? undefined : arg));
            if (params !== undefined && Object.keys (params).length > 0) {
                callArgs.push (params);
            }
            // symbol-bearing write methods must honor the account's symbol allow/deny lists
            const symbolArgIndex: Record<string, number> = {
                'addMargin': 0, 'reduceMargin': 0, 'setMargin': 0,
                'closePosition': 0, 'borrowIsolatedMargin': 0, 'repayIsolatedMargin': 0,
                'setPositionMode': 1, 'cancelOrders': 1,
            };
            const index = symbolArgIndex[method];
            if (index !== undefined && typeof callArgs[index] === 'string') {
                try {
                    ctx.safety.checkSymbolAllowed (account, callArgs[index]);
                } catch (error: any) {
                    if (error instanceof SafetyError) {
                        journalRejection (ctx, account, 'call_write_method', method, error, { 'args': args ?? [] });
                    }
                    throw error;
                }
            }
            const payload = { 'tool': 'call_write_method', 'account': account.name, method, 'args': args ?? [], 'params': params ?? {} };
            const preview = { method, 'args': args ?? [], 'params': params ?? {}, 'environment': accountEnvironment (account) };
            const confirmation = await confirmWrite (ctx, account, method, payload, preview, confirm, true);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
            const dispatch = await executeWrite (ctx, { account, 'tool': 'call_write_method', method, 'params': payload }, () => exchange[method] (...callArgs));
            if (dispatch.error !== undefined) {
                return dispatch.error;
            }
            return ok (dispatch.result, { ...environmentMeta (account), method });
        });
    }));
}
