import { TOOL_ACCESS, accessClassOf, type ToolProfile } from './access.js';
import { paramsParam, paramsParamNoPointer } from './common.js';

// A host injects every listed tool definition into the model's context, and at least one
// caps the total: ChatGPT desktop (Codex inside it, client "Codex Desktop" 26.1120) registered
// every tool of this server and handed the model the first ones in ALPHABETICAL order —
// everything from set_leverage on was dropped, the show_* views among them. Measured
// against the definitions of that build, the cut put the cap between 32,703 and 33,031
// characters of name + description + input-schema JSON. One observation, so the unit the
// host really counts in is unknown.
//
// The "core" profile is the answer: the tools a conversation cannot do without, sized to
// stay well under that bound (test/schema/profile.test.ts pins it, so a verbose description
// fails CI instead of silently pushing a tool out of a host's window).
//
// What is in it, and why the rest is not:
// - the three views: they sort last, so they are the first to be cut;
// - the six market tools every other call depends on (ids, symbols, prices, books, candles);
// - the account reads and the two order tools a first trade needs (place + cancel);
// - get_safety_status (it also reports this profile) and ONE escape hatch, call_read_method,
//   so no read becomes impossible: get_trades, get_my_trades, funding, ledger, events, ...
// An explicit list can add any other tool: "core,describe_method".
export const CORE_TOOLS: readonly string[] = [
    'show_chart', 'show_orderbook', 'show_tickers',
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

// every tool name this server can register, in any tier: the access table is the one list
// (a test fails when it and the registered tools drift apart)
export function registrableTools (): string[] {
    return Object.keys (TOOL_ACCESS).sort ();
}

// The profile chosen by CCXT_MCP_TOOLS / settings.tools on the local server: "all" (no
// filter), "core" or an explicit comma-separated list (which may include "core"). It filters
// by name; the hosted server's curated profile filters by access class instead, through the
// same ToolProfile interface.
export class NamedToolProfile implements ToolProfile {
    name: 'all' | 'core' | 'custom';
    private allowed: Set<string> | undefined; // undefined = no filter
    private requested: string[]; // the names an explicit list asked for by name

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
        const allowed = new Set (ALWAYS_LISTED_TOOLS);
        tokens.forEach ((token, index) => {
            if (keywords[index] === 'core') {
                CORE_TOOLS.forEach ((name) => allowed.add (name));
            } else {
                allowed.add (token);
                this.requested.push (token);
            }
        });
        this.allowed = allowed;
    }

    filters (): boolean {
        return this.allowed !== undefined;
    }

    allows (tool: string): boolean {
        return this.allowed === undefined || this.allowed.has (tool);
    }

    // describe_method is the pointer every "params" description ends with; where the profile
    // hides it the pointer would send the model to a tool that does not exist
    adjust (_tool: string, config: any): any {
        const shape = config?.inputSchema?.shape;
        if (this.allows ('describe_method') || shape === undefined || shape['params'] !== paramsParam) {
            return config;
        }
        return { ...config, 'inputSchema': config.inputSchema.extend ({ 'params': paramsParamNoPointer }) };
    }

    // the real tool names this profile lists, for the server instructions — undefined when it
    // lists everything. An unknown name in an explicit list is not something the session has
    allowedNames (): string[] | undefined {
        return (this.allowed === undefined) ? undefined : registrableTools ().filter ((name) => this.allowed!.has (name));
    }

    // hidden by the profile, whatever the tiers (hideDisabledTools hides tiers separately)
    hiddenTools (): string[] {
        return registrableTools ().filter ((name) => !this.allows (name));
    }

    // names of an explicit list that are no tool of this server (a typo, or a tool removed)
    unknownNames (): string[] {
        return this.requested.filter ((name) => accessClassOf (name) === undefined);
    }

    // a typo in an explicit list must not crash the server or pass silently: it is a config
    // problem like any other, reported by get_safety_status
    problems (): string[] {
        const unknown = this.unknownNames ();
        if (unknown.length === 0) {
            return [];
        }
        return [ 'tool profile (' + TOOLS_ENV + ' / settings.tools): ignored unknown tool name(s) ' + unknown.map ((name) => JSON.stringify (name)).join (', ') + ' — use "all", "core" or names from the tool list' ];
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

// Bullets of SERVER_INSTRUCTIONS that introduce one family of tools, by how they start. When
// the profile hides the tool the bullet is about, the bullet goes: instructions must not
// promise a tool the session does not have. (test/schema/profile.test.ts checks that every
// prefix still matches exactly one bullet, so rewording one cannot silently disable this.)
export const INSTRUCTION_BULLETS: readonly (readonly [ string, string ])[] = [
    [ '- To SHOW data to the user', 'show_chart' ],
    [ '- To find the best price or execution route', 'fetch_route' ],
    [ '- The long tail of read methods', 'call_read_method' ],
    [ '- For LIVE data over WebSocket', 'watch_subscribe' ],
];

// Under "all" the server cannot know whether the host passed every definition on to the
// model. Where it did not, the model reads about show_chart and finds no such tool — this
// is the one line that lets it tell the user what to change.
const TRUNCATED_LIST_BULLET = '- If a tool named here is missing from your tool list, the host cut the list for size (some cap the total size of tool definitions and drop the alphabetically last ones — the show_* views among them). Tell the user to set ' + TOOLS_ENV + '=core in this MCP server\'s environment and restart it: that profile lists the essential tools within the cap.';

export function profileInstructions (instructions: string, profile: NamedToolProfile): string {
    const allowed = profile.allowedNames ();
    if (allowed === undefined) {
        return instructions + '\n' + TRUNCATED_LIST_BULLET;
    }
    const lines = instructions.split ('\n').filter ((line) => !INSTRUCTION_BULLETS.some (([ prefix, tool ]) => line.startsWith (prefix) && !profile.allows (tool)));
    lines.push ('- TOOL PROFILE "' + profile.name + '": this server lists a reduced tool set (hosts cap the total size of tool definitions). At most these exist in this session: ' + allowed.join (', ') + '. Any other tool named above or in a tool description is hidden — do not call or promise it; get_safety_status names the hidden tools, and ' + UNHIDE_HINT + '.'
        + (profile.allows ('call_read_method') ? ' Reads without a listed tool (public trades, own trades, funding rates, prediction events, …) still work through call_read_method.' : ''));
    return lines.join ('\n');
}
