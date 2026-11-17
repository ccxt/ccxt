import crypto from 'crypto';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext, AccountConfig } from '../types.js';
import { accountEnvironment } from '../types.js';
import { ok, project, type Envelope } from '../format.js';
import { toErrorEnvelope } from '../errors.js';
import { requireTier, SafetyError } from '../safety.js';
import { run, confirmWrite, ArgError } from './common.js';
import { executeWrite, journalRejection, maybeInjectClientOrderId } from './write-common.js';
import { log } from '../logging.js';

// ---------------------------------------------------------------------------
// fetch_route / execute_route — thin wrappers over ccxt's own OrderRouter client
// (ts/src/base/OrderRouter.ts), so routing and execution logic stay version-locked to the
// library. The tools add only what the server owns: response projection, the route cache,
// and — for execution — the user's account rails (tier, caps, symbol lists, confirmation,
// journal), applied to every order OrderRouter places. Every execution decision (strategy,
// slippage, market fallback, freshness, retries) is the calling agent's, passed through.
// ---------------------------------------------------------------------------

export function routerUserAgent (ccxtModule: any, version: string): string {
    return 'ccxt-mcp/' + version + ' (ccxt ' + String (ccxtModule?.version ?? 'unknown') + ')';
}

export function createRouter (ccxtModule: any, version: string): any {
    const OrderRouter = ccxtModule?.OrderRouter;
    if (typeof OrderRouter !== 'function') {
        return undefined;
    }
    // userAgent attributes router traffic to ccxt-mcp; a ccxt build that predates the option
    // ignores unknown config keys, so this is safe against older installs
    return new OrderRouter ({ 'userAgent': routerUserAgent (ccxtModule, version) });
}

// routes returned by fetch_route, so execute_route runs exactly the route the agent saw —
// passed by id, never as a model-supplied blob (cheaper on context, and the plan always
// originates from the router, not from text the model could alter)
export const ROUTE_TTL_MS = 15 * 60 * 1000;
const ROUTE_CACHE_MAX = 100;

export class RouteCache {
    private entries = new Map<string, { route: any, storedAt: number }> ();

    put (route: any): string {
        // the id is minted here, never taken from the router's requestId: an entry is
        // immutable once stored, so a confirm token bound to a routeId always means this route
        const routeId = crypto.randomUUID ();
        this.entries.set (routeId, { route, 'storedAt': Date.now () });
        while (this.entries.size > ROUTE_CACHE_MAX) {
            const oldest = this.entries.keys ().next ().value as string;
            this.entries.delete (oldest);
        }
        return routeId;
    }

    get (routeId: string): any {
        const entry = this.entries.get (routeId);
        if (entry === undefined) {
            return undefined;
        }
        if (Date.now () - entry.storedAt > ROUTE_TTL_MS) {
            this.entries.delete (routeId);
            return undefined;
        }
        return entry.route;
    }
}

const ROUTE_FIELDS = [ 'requestId', 'calculatedAt', 'calculatedAtIso', 'from', 'to', 'exactSide', 'strategy', 'requestedAmount', 'amountIn', 'amountOut', 'effectiveRate', 'referenceRate', 'impactBps', 'fullyFillable', 'fillRatio', 'unfilledAmount', 'unroutableReason', 'unroutableHopIndex', 'savingVsBestSingleBps' ];
const HOP_FIELDS = [ 'pair', 'side', 'base', 'quote', 'amountIn', 'amountOut', 'feeCost', 'feeCurrency', 'referencePrice', 'impactBps', 'fullyFillable' ];
const LEG_FIELDS = [ 'exchangeId', 'amount', 'averagePrice', 'effectivePrice', 'feeCost', 'balanceLimited' ];
const QUOTE_FIELDS = [ 'exchangeId', 'filledAmount', 'averagePrice', 'effectivePriceWithFee', 'takerFeeRate', 'fullyFillable', 'bookAgeMs' ];

export function projectRoute (route: any, includeQuotes: boolean): Record<string, any> {
    const data: Record<string, any> = project (route, ROUTE_FIELDS);
    const warnings = Array.isArray (route?.warnings) ? route.warnings : [];
    if (warnings.length > 0) {
        data['warnings'] = warnings;
    }
    const hops = Array.isArray (route?.hops) ? route.hops : [];
    data['hops'] = hops.map ((hop: any) => {
        const projected: Record<string, any> = project (hop, HOP_FIELDS);
        projected['legs'] = (Array.isArray (hop?.legs) ? hop.legs : []).map ((leg: any) => project (leg, LEG_FIELDS));
        if (includeQuotes && Array.isArray (hop?.quotes)) {
            projected['quotes'] = hop.quotes.map ((quote: any) => project (quote, QUOTE_FIELDS));
        }
        return projected;
    });
    return data;
}

const RETRY_AFTER_PATTERN = /retry after ([0-9]+(?:\.[0-9]+)?)s/;

// OrderRouter folds the service's retry-after header into the exception message — lift it
// back out as a number so the agent does not have to parse prose
export function routerErrorEnvelope (error: any, tool: string): Envelope {
    const envelope = toErrorEnvelope (error, { tool });
    const body = envelope.error as Record<string, any>;
    const match = RETRY_AFTER_PATTERN.exec (String (error?.message ?? ''));
    if (match !== null) {
        body['retryAfterSeconds'] = Number (match[1]);
    }
    if (body['code'] === 'RATE_LIMITED') {
        body['hint'] = 'the CCXT order router allows 5 requests/s per IP — wait ' + (match !== null ? match[1] + 's' : 'a second') + ' and retry';
    } else if (body['type'] === 'PermissionDenied') {
        body['code'] = 'ROUTER_REFUSED';
        body['hint'] = 'the order router serves IPv4 clients only — this host reached it over IPv6';
    } else if (body['code'] === 'EXCHANGE_UNAVAILABLE' || body['code'] === 'TIMEOUT') {
        body['hint'] = 'the order router is unreachable or still warming its order books — retry ' + (match !== null ? 'after ' + match[1] + 's' : 'shortly');
    }
    return envelope;
}

function routerMissing (): Envelope {
    return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': 'the installed ccxt has no OrderRouter', 'retryable': false, 'hint': 'upgrade the ccxt dependency (OrderRouter ships in ccxt >= 4.5.84)' } };
}

const assetParam = (role: string) => z.string ().min (1).describe ('the asset ' + role + ', e.g. "USDT" — a currency code, not a market symbol');

export function registerRouteTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('fetch_route', {
        'title': 'Find the best execution route',
        'description': 'Ask the CCXT order router for the best way to convert one asset into another at a given size, across ~50 exchanges: walks live L2 books, accounts for fees and depth, can split across venues and bridge through USDT/USDC/BTC/ETH. A QUOTE, not an order — no account or keys needed. Use this instead of comparing get_orderbook/get_tickers across venues by hand. Read fillRatio before effectiveRate: a great rate on a partial fill is not a great route. An unroutable pair is a normal result carrying unroutableReason. The returned routeId can be executed with execute_route.',
        'inputSchema': {
            'from': assetParam ('being spent'),
            'to': assetParam ('being acquired'),
            'amountIn': z.number ().positive ().optional ().describe ('exact amount of "from" to spend — pass this OR amountOut, never both'),
            'amountOut': z.number ().positive ().optional ().describe ('exact amount of "to" to acquire — pass this OR amountIn, never both'),
            'strategy': z.enum ([ 'best_single', 'split_optimal', 'split_capped' ]).optional ().describe ('best_single: one venue per hop; split_optimal: split across venues; split_capped: split across at most maxVenues'),
            'maxVenues': z.number ().int ().positive ().optional ().describe ('per-hop venue cap for split_capped'),
            'exchanges': z.array (z.string ()).optional ().describe ('venue allowlist (exchange ids) — e.g. only the exchanges you hold accounts on'),
            'bridges': z.array (z.string ()).optional ().describe ('intermediary assets to consider, e.g. ["USDT","BTC"]'),
            'certified': z.boolean ().optional ().describe ('restrict to CCXT-certified venues'),
            'requireFullFill': z.boolean ().optional ().describe ('refuse partial fills instead of returning the largest fillable size'),
            'minLegNotional': z.number ().nonnegative ().optional ().describe ('suppress legs below this quote notional'),
            'includeQuotes': z.boolean ().optional ().describe ('also return the per-venue quote diagnostic for each hop (larger result)'),
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'fetch_route' }, async () => {
        if (ctx.router === undefined) {
            return routerMissing ();
        }
        if ((args.amountIn === undefined) === (args.amountOut === undefined)) {
            throw new ArgError ('pass exactly one of "amountIn" or "amountOut"', 'amountIn = exact amount of "from" to spend; amountOut = exact amount of "to" to acquire');
        }
        const params: Record<string, any> = {};
        for (const key of [ 'amountIn', 'amountOut', 'strategy', 'maxVenues', 'exchanges', 'bridges', 'certified', 'requireFullFill', 'minLegNotional', 'includeQuotes' ] as const) {
            if (args[key] !== undefined) {
                params[key] = args[key];
            }
        }
        let route: any;
        try {
            route = await ctx.router.fetchRoute (args.from, args.to, params);
        } catch (error: any) {
            return routerErrorEnvelope (error, 'fetch_route');
        }
        const routeId = ctx.routes.put (route);
        const data = { routeId, ...projectRoute (route, args.includeQuotes === true) };
        const meta: Record<string, any> = { 'source': 'ccxt order router' };
        if (typeof route?.unroutableReason === 'string' && route.unroutableReason !== '') {
            meta['notice'] = 'no route: ' + route.unroutableReason + ' — this is a routing result, not an error; try other bridges/exchanges, a smaller size, or drop requireFullFill';
        } else if (typeof route?.fillRatio === 'number' && route.fillRatio < 1) {
            meta['notice'] = 'partial fill: only ' + (route.fillRatio * 100).toFixed (2) + '% of the requested size is fillable at current depth';
        }
        return ok (data, meta);
    }));
}

// ---------------------------------------------------------------------------
// execute_route
// ---------------------------------------------------------------------------

// OrderRouter.execute options the agent may pass through. Deliberately absent: onStep (a
// callback), usdRates/maxNotionalUsd (the account caps are enforced by this server per
// order instead), idempotencyKey (always the routeId) and live (removed upstream).
const PASSTHROUGH_OPTIONS = [ 'reconcileToleranceRatio', 'orderTimeoutMs', 'pollIntervalMs', 'retryFailedSteps', 'retryDelayMs', 'maxOrders', 'acknowledgeDispersion', 'orderParams', 'precisionMode' ];

const REPORT_FIELDS = [ 'planId', 'strategy', 'dryRun', 'from', 'to', 'planAgeMs', 'slippageBps', 'stepCount', 'wouldPlaceOrders', 'ordersPlaced', 'halted', 'haltReason', 'haltStepIndex', 'filledIn', 'filledOut' ];
const STEP_FIELDS = [ 'stepIndex', 'hopIndex', 'legIndex', 'exchangeId', 'symbol', 'side', 'status', 'requestedAmount', 'filledAmount', 'averagePrice', 'expectedPrice', 'cost', 'inAsset', 'inAmount', 'outAsset', 'outAmount', 'orderId', 'clientOrderId', 'errorCode', 'attempt' ];
const UNWIND_STEP_FIELDS = [ 'stepIndex', 'exchangeId', 'symbol', 'side', 'asset', 'counterAsset', 'amount', 'expectedPrice', 'limitPrice', 'reachesFrom', 'isDestination' ];

// OrderRouter never emits nulls ('' = unknown string): drop the empty strings so the
// projection stays small
function compact (value: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [ key, entry ] of Object.entries (value)) {
        if (entry !== '') {
            result[key] = entry;
        }
    }
    return result;
}

function routeVenues (route: any): string[] {
    const venues = new Set<string> ();
    for (const hop of (Array.isArray (route?.hops) ? route.hops : [])) {
        for (const leg of (Array.isArray (hop?.legs) ? hop.legs : [])) {
            if (typeof leg?.exchangeId === 'string' && leg.exchangeId !== '') {
                venues.add (leg.exchangeId);
            }
        }
    }
    return [ ...venues ].sort ();
}

function routeError (code: string, message: string, hint: string): Envelope {
    return { 'ok': false, 'error': { code, message, 'retryable': false, hint } };
}

// venue exchangeId -> the configured account that will trade it
function resolveAccounts (ctx: ServerContext, venues: string[], requested: string[] | undefined): Record<string, AccountConfig> | Envelope {
    const all = Object.values (ctx.config.accounts);
    const byVenue: Record<string, AccountConfig> = {};
    if (requested !== undefined) {
        for (const name of requested) {
            const account = ctx.config.accounts[name];
            if (account === undefined) {
                return routeError ('UNKNOWN_ACCOUNT', 'no configured account named ' + JSON.stringify (name), 'list configured accounts with list_accounts');
            }
            if (account.prediction === true) {
                return routeError ('BAD_REQUEST', 'account ' + JSON.stringify (name) + ' is a prediction-market account', 'routes trade spot markets — pass a non-prediction account on ' + account.exchange);
            }
            if (byVenue[account.exchange] !== undefined) {
                return routeError ('BAD_REQUEST', 'accounts ' + JSON.stringify (byVenue[account.exchange].name) + ' and ' + JSON.stringify (name) + ' are both on ' + account.exchange, 'pass at most one account per exchange');
            }
            byVenue[account.exchange] = account;
        }
    }
    const missing: string[] = [];
    const ambiguous: string[] = [];
    for (const venue of venues) {
        if (byVenue[venue] !== undefined) {
            continue;
        }
        const candidates = all.filter ((account) => account.exchange === venue && account.prediction !== true && (account.trading ?? false) !== false);
        if (requested === undefined && candidates.length === 1) {
            byVenue[venue] = candidates[0];
        } else if (requested === undefined && candidates.length > 1) {
            ambiguous.push (venue + ' (' + candidates.map ((account) => account.name).join (', ') + ')');
        } else {
            missing.push (venue);
        }
    }
    if (ambiguous.length > 0) {
        return routeError ('AMBIGUOUS_ACCOUNT', 'several trading accounts match ' + ambiguous.join ('; '), 'pass "accounts" naming one account per exchange the route uses');
    }
    if (missing.length > 0) {
        const tradable = [ ...new Set (all.filter ((account) => account.prediction !== true && (account.trading ?? false) !== false).map ((account) => account.exchange)) ].sort ();
        return routeError ('NO_ACCOUNT_FOR_VENUE', 'the route trades on ' + missing.join (', ') + ' but no trading account is configured' + (requested !== undefined ? ' in "accounts"' : '') + ' for ' + (missing.length > 1 ? 'them' : 'it'),
            tradable.length > 0
                ? 're-quote with fetch_route "exchanges": ' + JSON.stringify (tradable) + ' to route only through venues you can trade on'
                : 'no trading-enabled account is configured — call get_safety_status for the config path; the user enables trading there');
    }
    const resolved: Record<string, AccountConfig> = {};
    for (const venue of venues) {
        resolved[venue] = byVenue[venue];
    }
    return resolved;
}

async function withAccountLocks<T> (ctx: ServerContext, names: string[], fn: () => Promise<T>): Promise<T> {
    if (names.length === 0) {
        return fn ();
    }
    const [ first, ...rest ] = names;
    return ctx.safety.withAccountLock (first, () => withAccountLocks (ctx, rest, fn));
}

interface GuardRejection { exchangeId: string, account: string, symbol: string, side: string, code: string, message: string }

// The account rails at the execution point. OrderRouter calls venue.createOrder directly, so
// each venue is handed over wrapped: every order it places is re-guarded (caps against the
// order actually sent — later hops are resized to the previous fill — symbol lists, market
// limits) and journaled intent-before-dispatch, exactly like create_order. A rejection is
// thrown back to OrderRouter as a definitive refusal (no order was sent), and a dispatch
// failure rethrows the ORIGINAL exception so OrderRouter's outcome-unknown logic still sees it.
function guardedVenue (ctx: ServerContext, exchange: any, account: AccountConfig, rejections: GuardRejection[]): any {
    const createOrder = async (symbol: string, type: string, side: string, amount: number, price?: number, params: any = {}): Promise<any> => {
        let guarded;
        try {
            guarded = await ctx.safety.guardOrder (exchange, account, { 'tool': 'execute_route', symbol, type, side, amount, price, 'params': params ?? {} });
        } catch (error: any) {
            if (error instanceof SafetyError) {
                journalRejection (ctx, account, 'execute_route', 'createOrder', error, { symbol, type, side, amount, price });
                rejections.push ({ 'exchangeId': account.exchange, 'account': account.name, symbol, side, 'code': error.code, 'message': error.message });
            }
            throw error;
        }
        const injected = maybeInjectClientOrderId (exchange, params ?? {});
        const dispatch = await executeWrite (ctx, {
            account,
            'tool': 'execute_route',
            'method': 'createOrder',
            'params': { symbol, type, side, 'amount': guarded.amount, 'price': guarded.price, 'params': params ?? {} },
            'computed': { 'orderValue': guarded.orderValue, 'orderValueCurrency': guarded.orderValueCurrency },
            'clientOrderId': injected.clientOrderId,
        }, async () => exchange.createOrder (symbol, type, side, guarded.amount, guarded.price, injected.params));
        if (dispatch.error !== undefined) {
            throw dispatch.cause;
        }
        return dispatch.result;
    };
    return new Proxy (exchange, {
        get (target, property, receiver) {
            if (property === 'createOrder') {
                return createOrder;
            }
            // bound to the real instance, so ccxt internals never see the proxy as `this`
            const value = Reflect.get (target, property, receiver);
            return (typeof value === 'function') ? value.bind (target) : value;
        },
    });
}

export function registerRouteExecuteTool (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('execute_route', {
        'title': 'Execute a route',
        'description': 'Execute a route from fetch_route (by routeId) with ccxt\'s OrderRouter: places the orders on every venue the route uses, hop by hop, sizing each hop from the previous fill. Each venue needs a trading-enabled account — matched automatically when there is exactly one per exchange, otherwise pass "accounts". Every order is still bound by that account\'s caps, symbol lists, dryRun and confirm policy, and is journaled. Execution choices are yours and pass straight to OrderRouter: strategy, slippageBps (limit offset from the quoted price, default 25), allowMarketOrders (only used on venues that cannot do IOC — a market order has no price protection), maxPlanAgeMs (refuse a stale quote), dryRun. A route can be executed once; on a halt the result includes an unwind suggestion that is NOT executed.',
        'inputSchema': {
            'routeId': z.string ().describe ('routeId returned by fetch_route (kept for 15 minutes)'),
            'accounts': z.array (z.string ()).optional ().describe ('account names to trade with, one per exchange the route uses — omit to auto-match the single trading account per exchange'),
            'strategy': z.enum ([ 'sequential', 'parallel_within_hop', 'limit_protected', 'best_effort', 'atomic_ish' ]).optional ().describe ('how OrderRouter places the orders (default sequential: IOC limit orders one at a time)'),
            'slippageBps': z.number ().nonnegative ().optional ().describe ('how far each limit price sits from the quoted average price, in bps (default 25)'),
            'allowMarketOrders': z.boolean ().optional ().describe ('let a venue that cannot do IOC take a market order instead of failing the step (default false)'),
            'maxPlanAgeMs': z.number ().int ().positive ().optional ().describe ('refuse to execute if the quote is older than this'),
            'dryRun': z.boolean ().optional ().describe ('build, check and report the plan without placing anything'),
            'options': z.record (z.any ()).optional ().describe ('further OrderRouter.execute options: ' + PASSTHROUGH_OPTIONS.join (', ')),
            'confirm': z.string ().optional ().describe ('confirmation token from the preview response — repeat the identical call with this token to execute'),
        },
        'annotations': { 'destructiveHint': true, 'openWorldHint': true },
    }, async (args) => run ({ 'tool': 'execute_route' }, async (): Promise<Envelope> => {
        if (ctx.router === undefined) {
            return routerMissing ();
        }
        const route = ctx.routes.get (args.routeId);
        if (route === undefined) {
            return routeError ('ROUTE_NOT_FOUND', 'no route with id ' + JSON.stringify (args.routeId) + ' (routes are kept for 15 minutes after fetch_route)', 'call fetch_route again and execute the new routeId');
        }
        if ((typeof route.unroutableReason === 'string' && route.unroutableReason !== '') || !Array.isArray (route.hops) || route.hops.length === 0) {
            return routeError ('ROUTE_UNROUTABLE', 'this route is unroutable (' + (route.unroutableReason || 'no hops') + ') and has nothing to execute', 'fetch a different route');
        }
        const extra = args.options ?? {};
        const unknownOptions = Object.keys (extra).filter ((key) => !PASSTHROUGH_OPTIONS.includes (key));
        if (unknownOptions.length > 0) {
            throw new ArgError ('unsupported options: ' + unknownOptions.join (', '), 'supported: ' + PASSTHROUGH_OPTIONS.join (', '));
        }
        const venues = routeVenues (route);
        const resolved = resolveAccounts (ctx, venues, args.accounts);
        if ((resolved as Envelope).ok === false) {
            return resolved as Envelope;
        }
        const accounts = resolved as Record<string, AccountConfig>;
        for (const venue of venues) {
            requireTier (accounts[venue], 'trading');
        }
        const instances: Record<string, any> = {};
        await Promise.all (venues.map (async (venue) => {
            instances[venue] = (await ctx.pools.getAuthenticated (accounts[venue].name)).exchange;
        }));
        const orderParams = extra['orderParams'] ?? {};
        // the preview: OrderRouter's own (pure) plan, each step checked against the account
        // rails up front so a cap/symbol refusal surfaces before anyone is asked to confirm
        const plan = ctx.router.buildExecutionPlan (route, { 'slippageBps': args.slippageBps, 'reconcileToleranceRatio': extra['reconcileToleranceRatio'] });
        const previewSteps: Record<string, any>[] = [];
        // guardOrder checks each order against maxDailyValue on its own; the steps of one route
        // are added up here so a route the cap would stop halfway is refused before it starts
        const plannedValue: Record<string, number> = {};
        for (const step of plan.steps) {
            const account = accounts[step.exchangeId];
            let guarded;
            try {
                guarded = await ctx.safety.guardOrder (instances[step.exchangeId], account, { 'tool': 'execute_route', 'symbol': step.symbol, 'type': 'limit', 'side': step.side, 'amount': step.amount, 'price': step.limitPrice, 'params': orderParams });
            } catch (error: any) {
                if (error instanceof SafetyError) {
                    journalRejection (ctx, account, 'execute_route', 'createOrder', error, { 'routeId': args.routeId, 'stepIndex': step.stepIndex, 'symbol': step.symbol, 'side': step.side, 'amount': step.amount, 'price': step.limitPrice });
                    error.message = 'step ' + step.stepIndex + ' (' + step.side + ' ' + step.symbol + ' on ' + step.exchangeId + '): ' + error.message;
                }
                throw error;
            }
            const dailyCap = account.maxDailyValue;
            if (typeof dailyCap === 'number' && guarded.orderValue !== undefined) {
                plannedValue[account.name] = (plannedValue[account.name] ?? 0) + guarded.orderValue;
                const spent = ctx.journal.dispatchedValueLast24h (account.name);
                if (spent + plannedValue[account.name] > dailyCap) {
                    const error = new SafetyError ('DAILY_VALUE_CAP', 'step ' + step.stepIndex + ' (' + step.side + ' ' + step.symbol + ' on ' + step.exchangeId + '): this route\'s orders on account ' + JSON.stringify (account.name) + ' add up to ≈ ' + plannedValue[account.name].toFixed (2) + ' USD by this step, which with ≈ ' + spent.toFixed (2) + ' USD already dispatched exceeds the rolling 24h maxDailyValue cap of ' + dailyCap, 'quote a smaller amount, wait for the window to roll, or the user can raise the cap');
                    journalRejection (ctx, account, 'execute_route', 'createOrder', error, { 'routeId': args.routeId, 'stepIndex': step.stepIndex, 'symbol': step.symbol, 'side': step.side, 'amount': step.amount, 'price': step.limitPrice });
                    throw error;
                }
            }
            previewSteps.push ({
                'stepIndex': step.stepIndex,
                'hopIndex': step.hopIndex,
                'exchange': step.exchangeId,
                'account': account.name,
                'environment': accountEnvironment (account),
                'symbol': step.symbol,
                'side': step.side,
                'amount': guarded.amount,
                'limitPrice': guarded.price,
                'expectedPrice': step.expectedPrice,
                'estimatedValueUsd': guarded.orderValue,
            });
        }
        const calculatedAt = typeof route.calculatedAt === 'number' ? route.calculatedAt : 0;
        const accountNames = venues.map ((venue) => accounts[venue].name);
        const dryRun = args.dryRun === true || venues.some ((venue) => accounts[venue].dryRun === true);
        const preview = {
            'routeId': args.routeId,
            'from': route.from,
            'to': route.to,
            'amountIn': route.amountIn,
            'amountOut': route.amountOut,
            'fillRatio': route.fillRatio,
            'planAgeMs': calculatedAt > 0 ? Date.now () - calculatedAt : -1,
            'strategy': args.strategy ?? 'sequential',
            'allowMarketOrders': args.allowMarketOrders === true,
            dryRun,
            'steps': previewSteps,
        };
        const payload = {
            'tool': 'execute_route',
            'routeId': args.routeId,
            'accounts': accountNames,
            'strategy': args.strategy ?? null,
            'slippageBps': args.slippageBps ?? null,
            'allowMarketOrders': args.allowMarketOrders ?? null,
            'maxPlanAgeMs': args.maxPlanAgeMs ?? null,
            'dryRun': args.dryRun ?? null,
            'options': extra,
        };
        // one confirmation for the whole route, under the strictest involved account's policy
        const needsConfirm = venues.map ((venue) => accounts[venue]).find ((account) => ctx.safety.confirmationRequired (account));
        if (needsConfirm !== undefined && !dryRun) {
            const confirmation = await confirmWrite (ctx, needsConfirm, 'route execution (' + plan.steps.length + ' orders on ' + venues.join (', ') + ')', payload, preview, args.confirm);
            if (confirmation !== 'confirmed') {
                return confirmation;
            }
        }
        const rejections: GuardRejection[] = [];
        const options: Record<string, any> = { ...extra, 'idempotencyKey': args.routeId, dryRun };
        for (const key of [ 'strategy', 'slippageBps', 'allowMarketOrders', 'maxPlanAgeMs' ] as const) {
            if (args[key] !== undefined) {
                options[key] = args[key];
            }
        }
        log ('info', 'execute_route ' + args.routeId + ' on ' + venues.join (',') + (dryRun ? ' (dry run)' : ''));
        const report = await withAccountLocks (ctx, [ ...accountNames ].sort (), async () => {
            const wrapped: Record<string, any> = {};
            for (const venue of venues) {
                wrapped[venue] = guardedVenue (ctx, instances[venue], accounts[venue], rejections);
            }
            return ctx.router.execute (route, wrapped, options);
        });
        const data: Record<string, any> = project (report, REPORT_FIELDS);
        data['steps'] = (Array.isArray (report.steps) ? report.steps : []).map ((step: any) => compact ({ ...project (step, STEP_FIELDS), 'account': accounts[step.exchangeId]?.name ?? '' }));
        for (const key of [ 'openOrders', 'errors' ]) {
            if (Array.isArray (report[key]) && report[key].length > 0) {
                data[key] = report[key].map ((entry: any) => compact (entry));
            }
        }
        if (rejections.length > 0) {
            data['guardRejections'] = rejections;
        }
        const meta: Record<string, any> = {
            'accounts': venues.map ((venue) => ({ 'exchange': venue, 'account': accounts[venue].name, 'environment': accountEnvironment (accounts[venue]) })),
        };
        if (dryRun) {
            meta['notice'] = 'dry run — no order was sent' + ((args.dryRun !== true) ? ' (dryRun is enabled on an involved account)' : '');
        } else if (report.halted === true) {
            meta['notice'] = 'route halted at step ' + report.haltStepIndex + ' (' + report.haltReason + ') — funds may be left in an intermediate asset; data.unwind is a suggestion only and was NOT executed';
            try {
                const unwind = ctx.router.buildUnwindPlan (report);
                data['unwind'] = {
                    'residualCount': unwind.residualCount,
                    'steps': (Array.isArray (unwind.steps) ? unwind.steps : []).map ((step: any) => project (step, UNWIND_STEP_FIELDS)),
                    'unresolved': unwind.unresolved,
                };
            } catch (e) {
                // the report is the authoritative account of what happened — never lose it
            }
        }
        return ok (data, meta);
    }));
}

// re-exported for tests
export { routeVenues, resolveAccounts };
