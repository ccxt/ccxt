import { z } from 'zod';
import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { paramsParam, paramsParamNoPointer } from './common.js';

// A host injects every listed tool definition into the model's context, and at least one
// caps the total: ChatGPT desktop (Codex inside it, client "Codex Desktop" 26.1120) registered
// all 41 tools of this server and handed the model the first 27 in ALPHABETICAL order plus
// the one tiny no-argument tool of the tail — everything from set_leverage on was dropped,
// which is setup_account and every show_* view. Measured against the definitions of that
// build, the cut puts the cap between 32,703 and 33,031 characters of name + description +
// input-schema JSON (37,730 - 38,275 counting the whole tools/list entry). One observation,
// so the unit the host really counts in is unknown.
//
// The "core" profile is the answer: the tools a conversation cannot do without, sized to
// stay at least 30% under the lower bound (test/schema/tools.test.ts pins that, so a verbose
// description fails CI instead of silently pushing a tool out of a host's window).
//
// What is in it, and why the rest is not:
// - the account setup tools and all six views: they are the product, and they sort last;
// - the six market tools every other call depends on (ids, symbols, prices, books, candles);
// - the account reads and the two order tools a first trade needs (place + cancel);
// - get_safety_status (it also reports this profile) and ONE escape hatch, call_read_method,
//   so no read becomes impossible: get_trades, get_my_trades, funding, ledger, events, ...
// Left out because they did not fit under the budget: describe_method (969 chars),
// edit_order (cancel + create does it), get_my_trades and get_trades (call_read_method),
// search_events, the watch_* streams, the order router, leverage/margin, the funds tier and
// the raw implicit endpoints. An explicit list can add any of them: "core,describe_method".
export const CORE_TOOLS: readonly string[] = [
    'setup_account', 'manage_accounts',
    'show_chart', 'show_orderbook', 'show_tickers', 'show_balance', 'show_orders', 'show_positions',
    'list_exchanges', 'describe_exchange', 'search_markets', 'get_tickers', 'get_orderbook', 'get_ohlcv',
    'get_safety_status', 'call_read_method',
    'list_accounts', 'get_balance', 'get_orders', 'get_positions',
    'create_order', 'cancel_order',
];

// Never hidden: it is where the model learns which profile is active, which tools it hides
// and how the user gets them back — hiding it would leave a filtered session unexplainable.
export const ALWAYS_LISTED_TOOLS: readonly string[] = [ 'get_safety_status' ];

export const TOOLS_ENV = 'CCXT_MCP_TOOLS';
const UNHIDE_HINT = 'to list every tool the user sets ' + TOOLS_ENV + '=all in the MCP server\'s environment (or "tools": "all" under "settings" in the ccxt-mcp config file) and restarts the server; an explicit list also works, e.g. "core,describe_method"';

export class ToolProfile {
    // 'all', 'core', or 'custom' for an explicit list
    name: string;
    // undefined = no filter
    private allowed: Set<string> | undefined;
    // the names an explicit list asked for by name (never the ones "core" expanded to)
    private requested: string[];
    // every name a register function has offered, listed or not
    private known: Set<string> = new Set ();
    // true while registerAllTools walks a tier that hideDisabledTools keeps off the list:
    // its names are learnt (so they are not mistaken for typos) but nothing is registered
    learnOnly = false;

    constructor (value: string | undefined) {
        const tokens = (value ?? '').split (',').map ((token) => token.trim ()).filter ((token) => token.length > 0);
        const keywords = tokens.map ((token) => token.toLowerCase ());
        this.requested = [];
        if (tokens.length === 0 || keywords.includes ('all')) {
            this.name = 'all';
            this.allowed = undefined;
            return;
        }
        this.name = (tokens.length === 1 && keywords[0] === 'core') ? 'core' : 'custom';
        this.allowed = new Set (ALWAYS_LISTED_TOOLS);
        tokens.forEach ((token, index) => {
            if (keywords[index] === 'core') {
                CORE_TOOLS.forEach ((name) => this.allowed!.add (name));
            } else {
                this.allowed!.add (token);
                this.requested.push (token);
            }
        });
    }

    filters (): boolean {
        return this.allowed !== undefined;
    }

    allows (name: string): boolean {
        return this.allowed === undefined || this.allowed.has (name);
    }

    // the names this profile can list, for the server instructions (which are written before
    // any tool is registered) — undefined when it lists everything
    allowedNames (): string[] | undefined {
        return (this.allowed === undefined) ? undefined : [ ...this.allowed ].sort ();
    }

    learn (name: string): void {
        this.known.add (name);
    }

    hiddenTools (): string[] {
        return [ ...this.known ].filter ((name) => !this.allows (name)).sort ();
    }

    // names of an explicit list that no register function offers. Only meaningful once every
    // tier has been walked (registerAllTools does that even for the tiers it does not list).
    unknownNames (): string[] {
        return this.requested.filter ((name) => !this.known.has (name));
    }

    status (): Record<string, any> {
        const status: Record<string, any> = { 'profile': this.name, 'hiddenTools': this.hiddenTools () };
        if (this.filters ()) {
            const unknown = this.unknownNames ();
            if (unknown.length > 0) {
                status['unknownNames'] = unknown;
            }
            status['hint'] = 'the hidden tools are not registered in this session — ' + UNHIDE_HINT;
        }
        return status;
    }
}

const WRAPPED = Symbol ('ccxt-mcp.toolProfile');

// What a caller gets back for a tool the profile keeps off the list. Same shape as the SDK's
// RegisteredTool so code holding the handle keeps working, but it is attached to nothing:
// enable () and update ({ enabled: true }) must not be a way around the profile, so they
// change this object only and the server never hears of the tool.
function inertTool (config: any, handler: any): RegisteredTool {
    const asObject = (schema: any): any => {
        if (schema === undefined) {
            return undefined;
        }
        return (schema instanceof z.ZodType) ? schema : z.object (schema);
    };
    const tool: any = {
        'title': config.title,
        'description': config.description,
        'inputSchema': asObject (config.inputSchema),
        'outputSchema': asObject (config.outputSchema),
        'annotations': config.annotations,
        'execution': { 'taskSupport': 'forbidden' },
        '_meta': config._meta,
        handler,
        'enabled': false,
        'enable': () => undefined,
        'disable': () => undefined,
        'remove': () => undefined,
        'update': (updates: any) => {
            if (updates.title !== undefined) {
                tool.title = updates.title;
            }
            if (updates.description !== undefined) {
                tool.description = updates.description;
            }
            if (updates.paramsSchema !== undefined) {
                tool.inputSchema = asObject (updates.paramsSchema);
            }
            if (updates.outputSchema !== undefined) {
                tool.outputSchema = asObject (updates.outputSchema);
            }
            if (updates.callback !== undefined) {
                tool.handler = updates.callback;
            }
            if (updates.annotations !== undefined) {
                tool.annotations = updates.annotations;
            }
            if (updates._meta !== undefined) {
                tool._meta = updates._meta;
            }
        },
    };
    return tool as RegisteredTool;
}

// The one choke point: every tool of this server is registered through server.registerTool,
// so replacing that method on the instance filters startup registration AND whatever is
// registered later (the setup form lists a tier while the server runs — ./setup.ts). A
// hidden tool is never handed to the SDK: it is absent from tools/list and calling it is
// "tool not found", exactly like a tier that hideDisabledTools leaves out.
export function applyToolProfile (server: McpServer, profile: ToolProfile): void {
    if ((server as any)[WRAPPED] !== undefined) {
        return;
    }
    (server as any)[WRAPPED] = profile;
    const register = server.registerTool.bind (server) as (name: string, config: any, handler: any) => RegisteredTool;
    // describe_method is the pointer every "params" description ends with; where the profile
    // hides it the pointer would send the model to a tool that does not exist
    const dropPointer = !profile.allows ('describe_method');
    (server as any).registerTool = (name: string, config: any, handler: any): RegisteredTool => {
        profile.learn (name);
        if (profile.learnOnly || !profile.allows (name)) {
            return inertTool (config, handler);
        }
        if (dropPointer && config.inputSchema !== undefined && config.inputSchema['params'] === paramsParam) {
            config = { ...config, 'inputSchema': { ...config.inputSchema, 'params': paramsParamNoPointer } };
        }
        return register (name, config, handler);
    };
}

// Bullets of SERVER_INSTRUCTIONS that introduce one family of tools, by how they start. When
// the profile hides the tool the bullet is about, the bullet goes: instructions must not
// promise a tool the session does not have. (test/schema/tools.test.ts checks that every
// prefix still matches exactly one bullet, so rewording one cannot silently disable this.)
export const INSTRUCTION_BULLETS: readonly (readonly [ string, string ])[] = [
    [ '- To SHOW data to the user', 'show_chart' ],
    [ '- To find the best price or execution route', 'fetch_route' ],
    [ '- The long tail of read methods', 'call_read_method' ],
    [ '- For LIVE data over WebSocket', 'watch_subscribe' ],
    [ '- To connect an exchange account', 'setup_account' ],
];

// Under "all" the server cannot know whether the host passed every definition on to the
// model. Where it did not, the model reads about setup_account and finds no such tool — this
// is the one line that lets it tell the user what to change.
const TRUNCATED_LIST_BULLET = '- If a tool named here is missing from your tool list, the host cut the list for size (some cap the total size of tool definitions and drop the alphabetically last ones — setup_account and the show_* views among them). Tell the user to set ' + TOOLS_ENV + '=core in this MCP server\'s environment and restart it: that profile lists the essential tools within the cap.';

export function profileInstructions (instructions: string, profile: ToolProfile): string {
    const allowed = profile.allowedNames ();
    if (allowed === undefined) {
        return instructions + '\n' + TRUNCATED_LIST_BULLET;
    }
    const lines = instructions.split ('\n').filter ((line) => !INSTRUCTION_BULLETS.some (([ prefix, tool ]) => line.startsWith (prefix) && !profile.allows (tool)));
    lines.push ('- TOOL PROFILE "' + profile.name + '": this server lists a reduced tool set (hosts cap the total size of tool definitions). At most these exist in this session: ' + allowed.join (', ') + '. Any other tool named above or in a tool description is hidden — do not call or promise it; get_safety_status names the hidden tools, and ' + UNHIDE_HINT + '.'
        + (profile.allows ('call_read_method') ? ' Reads without a listed tool (public trades, own trades, funding rates, prediction events, …) still work through call_read_method.' : ''));
    return lines.join ('\n');
}
