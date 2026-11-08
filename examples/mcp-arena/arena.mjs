// CCXT MCP arena: give several LLMs $100 of paper money, one hour and the CCXT MCP
// server, all at the same time, with the same prompt. Record everything.
//
//   OPENROUTER_API_KEY=... node arena.mjs --run round1 --minutes 60 [--only gpt,claude-haiku]
//
// Non-Anthropic models run through OpenRouter with the minimal tool loop below.
// Anthropic models run through the Claude Code CLI (`claude -p`) with its default
// system prompt replaced and every built-in tool disabled, so they see the same
// prompt and the same two MCP servers.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const HERE = path.dirname (fileURLToPath (import.meta.url));
const args = Object.fromEntries (process.argv.slice (2).reduce ((acc, a, i, all) => {
    if (a.startsWith ('--')) {
        acc.push ([ a.slice (2), all[i + 1] ]);
    }
    return acc;
}, []));

const RUN = args.run ?? ('run-' + new Date ().toISOString ().slice (0, 16).replace (/[:T]/g, '-'));
const MINUTES = Number (args.minutes ?? 60);
const COST_CAP = Number (args.costCap ?? 5); // USD per OpenRouter agent
const MAX_STEPS = Number (args.maxSteps ?? 250);
const RUN_DIR = path.resolve (args.out ?? path.join (HERE, 'runs'), RUN);
const CCXT_MCP = path.join (HERE, 'node_modules', 'ccxt-mcp', 'js', 'server.js');
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const AGENTS = [
    { 'id': 'claude-opus', 'kind': 'claude', 'model': 'claude-opus-5-5' },
    { 'id': 'claude-sonnet', 'kind': 'claude', 'model': 'claude-sonnet-5-5' },
    { 'id': 'claude-haiku', 'kind': 'claude', 'model': 'claude-haiku-5-5' },
    { 'id': 'gpt', 'kind': 'openrouter', 'model': 'openai/gpt-6.1-sol' },
    { 'id': 'gemini', 'kind': 'openrouter', 'model': '~google/gemini-pro-latest' },
    { 'id': 'grok', 'kind': 'openrouter', 'model': 'x-ai/grok-4.7' },
    { 'id': 'deepseek', 'kind': 'openrouter', 'model': 'deepseek/deepseek-v4-pro' },
    { 'id': 'qwen', 'kind': 'openrouter', 'model': 'qwen/qwen3.8-2.4t-a95b' },
    { 'id': 'kimi', 'kind': 'openrouter', 'model': 'moonshotai/kimi-k3.1-pro' },
];

const BASE_SYSTEM = `You are an autonomous trading agent running unattended. Nobody will answer questions during the session.

You have two sets of tools:
- ccxt: the CCXT MCP server. Live public market data from 100+ crypto exchanges and prediction markets (tickers, order books, candles, trades, funding rates, WebSocket streams).
- account: your trading account. It can trade spot and perpetuals on okx, bitget, gate, kucoin and hyperliquid. It starts with 100 USDT on okx.

The session lasts ${MINUTES} minutes of wall-clock time. When it ends, everything in the account is valued in USD at market prices, with open positions marked to market. Use the wait tool when you want time to pass.`;

// prompt variants (--variant): base | fees | mustTrade | feesMustTrade
const VARIANT = args.variant ?? 'base';

const FEES = `

Trading costs on these venues, charged on the full position notional (so leverage multiplies fees exactly as much as it multiplies P&L):
- okx: perpetuals 0.05% taker / 0.02% maker; spot 0.15% taker / 0.10% maker
- bitget: perpetuals 0.06% / 0.02%; spot 0.20% / 0.20%
- gate: perpetuals 0.05% / 0.02%; spot 0.20% / 0.20%
- kucoin: spot 0.10% / 0.10%
- hyperliquid: perpetuals 0.045% / 0.015%
Market orders also pay the spread and any slippage through the book. A round trip with market orders on an okx perpetual costs about 0.1% of notional, so the price has to move more than that before a trade makes money, whatever the leverage.`;

const MUST_TRADE = ' Sitting in cash for the whole hour does not complete the task: you need to actually trade.';

const SYSTEM = BASE_SYSTEM + ((VARIANT === 'fees' || VARIANT === 'feesMustTrade') ? FEES : '');

const TASK = `Here's $100. You have one hour. Make as much money as you can.` + ((VARIANT === 'mustTrade' || VARIANT === 'feesMustTrade') ? MUST_TRADE : '');

const DONE_HINT = 'If you are finished, reply DONE.';

// ---------------------------------------------------------------- helpers

const sleep = (ms) => new Promise ((res) => setTimeout (res, ms));
const now = () => new Date ().toISOString ();
const appendJsonl = (file, obj) => fs.appendFileSync (file, JSON.stringify ({ 't': now (), ...obj }) + '\n');

const snapshot = async (port) => {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch ('http://127.0.0.1:' + port + '/snapshot');
            return await res.json ();
        } catch (e) {
            await sleep (2000);
        }
    }
    return undefined;
};

const writeCcxtConfig = (dir) => {
    const file = path.join (dir, 'ccxt-mcp.json');
    // no accounts: market data only, and hide the tools that would need one
    fs.writeFileSync (file, JSON.stringify ({ 'accounts': {}, 'settings': { 'hideDisabledTools': true } }));
    return file;
};

const startBroker = (agent, port, start, dir) => {
    const child = spawn (process.execPath, [ path.join (HERE, 'paper-broker.mjs'), '--port', String (port), '--dir', dir, '--start', String (start), '--minutes', String (MINUTES) ], { 'stdio': [ 'ignore', 'ignore', fs.openSync (path.join (dir, 'broker.log'), 'a') ] });
    return child;
};

// ---------------------------------------------------------------- OpenRouter agent

const runOpenRouter = async (agent, port, start, end, dir) => {
    const transcript = path.join (dir, 'transcript.jsonl');
    const ccxtCfg = writeCcxtConfig (dir);
    const ccxtClient = new Client ({ 'name': 'arena', 'version': '1.0.0' });
    await ccxtClient.connect (new StdioClientTransport ({ 'command': process.execPath, 'args': [ CCXT_MCP ], 'env': { ...process.env, 'CCXT_MCP_CONFIG': ccxtCfg }, 'stderr': 'ignore' }));
    const accountClient = new Client ({ 'name': 'arena', 'version': '1.0.0' });
    await accountClient.connect (new StreamableHTTPClientTransport (new URL ('http://127.0.0.1:' + port + '/mcp')));
    const clients = { 'ccxt': ccxtClient, 'account': accountClient };
    const tools = [];
    const route = {};
    for (const [ server, client ] of Object.entries (clients)) {
        for (const t of (await client.listTools ()).tools) {
            const name = 'mcp__' + server + '__' + t.name;
            route[name] = [ server, t.name ];
            tools.push ({ 'type': 'function', 'function': { name, 'description': t.description ?? '', 'parameters': t.inputSchema } });
        }
    }
    // MCP servers' own instructions go into the system prompt, as Claude Code does
    let system = SYSTEM;
    const instructions = ccxtClient.getInstructions?.();
    if (instructions) {
        system += '\n\n# MCP Server Instructions\n\n## ccxt\n' + instructions;
    }
    const messages = [ { 'role': 'system', 'content': system }, { 'role': 'user', 'content': TASK } ];
    appendJsonl (transcript, { 'type': 'start', 'model': agent.model, 'tools': tools.map ((t) => t.function.name) });
    const stats = { 'steps': 0, 'toolCalls': 0, 'cost': 0, 'promptTokens': 0, 'completionTokens': 0, 'cachedTokens': 0, 'reasoningTokens': 0, 'nudges': 0, 'done': undefined, 'stopReason': undefined, 'servedModel': undefined, 'errors': 0 };

    const complete = async (toolChoice = 'auto') => {
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const res = await fetch ('https://openrouter.ai/api/v1/chat/completions', {
                    'method': 'POST',
                    'headers': { 'authorization': 'Bearer ' + OPENROUTER_KEY, 'content-type': 'application/json', 'x-title': 'ccxt-mcp-arena' },
                    'body': JSON.stringify ({ 'model': agent.model, messages, tools, 'tool_choice': toolChoice, 'usage': { 'include': true }, 'max_tokens': 16000 }),
                });
                const body = await res.json ();
                if (!res.ok || body.error) {
                    throw new Error ((body.error?.message ?? res.statusText) + ' (' + res.status + ')');
                }
                return body;
            } catch (e) {
                stats.errors += 1;
                appendJsonl (transcript, { 'type': 'api_error', 'error': e.message, attempt });
                await sleep (2000 * 2 ** attempt);
            }
        }
        throw new Error ('model API failed 5 times');
    };

    const account = async () => (await snapshot (port)) ?? {};

    let finished = false;
    while (!finished) {
        if (Date.now () >= end) {
            stats.stopReason = 'time';
            break;
        }
        if (stats.cost >= COST_CAP) {
            stats.stopReason = 'cost_cap';
            break;
        }
        if (stats.steps >= MAX_STEPS) {
            stats.stopReason = 'max_steps';
            break;
        }
        let body;
        try {
            body = await complete ();
        } catch (e) {
            stats.stopReason = 'api_error';
            break;
        }
        stats.steps += 1;
        stats.servedModel = body.model;
        const u = body.usage ?? {};
        stats.cost += u.cost ?? 0;
        stats.promptTokens += u.prompt_tokens ?? 0;
        stats.completionTokens += u.completion_tokens ?? 0;
        stats.cachedTokens += u.prompt_tokens_details?.cached_tokens ?? 0;
        stats.reasoningTokens += u.completion_tokens_details?.reasoning_tokens ?? 0;
        const msg = body.choices?.[0]?.message ?? { 'role': 'assistant', 'content': '' };
        const keep = { 'role': 'assistant', 'content': msg.content ?? '' };
        if (msg.tool_calls?.length) {
            keep.tool_calls = msg.tool_calls;
        }
        if (msg.reasoning_details) {
            keep.reasoning_details = msg.reasoning_details;
        }
        messages.push (keep);
        appendJsonl (transcript, { 'type': 'assistant', 'content': msg.content, 'reasoning': msg.reasoning, 'tool_calls': msg.tool_calls, 'usage': u, 'minute': (Date.now () - start) / 60_000 });
        if (msg.tool_calls?.length) {
            for (const call of msg.tool_calls) {
                stats.toolCalls += 1;
                let text;
                try {
                    const [ server, name ] = route[call.function.name] ?? [];
                    if (!server) {
                        throw new Error ('unknown tool ' + call.function.name);
                    }
                    const input = call.function.arguments ? JSON.parse (call.function.arguments) : {};
                    const res = await clients[server].callTool ({ name, 'arguments': input }, undefined, { 'timeout': 20 * 60_000, 'maxTotalTimeout': 20 * 60_000 });
                    text = (res.content ?? []).map ((c) => c.text ?? '').join ('\n');
                } catch (e) {
                    text = JSON.stringify ({ 'ok': false, 'error': e.message });
                }
                if (text.length > 100000) {
                    text = text.slice (0, 100000) + '\n…[truncated]';
                }
                messages.push ({ 'role': 'tool', 'tool_call_id': call.id, 'content': text });
                appendJsonl (transcript, { 'type': 'tool_result', 'name': call.function.name, 'args': call.function.arguments, 'result': text.slice (0, 4000) });
            }
            continue;
        }
        // the model ended its turn
        if (/\bDONE\b/.test (msg.content ?? '') && stats.nudges > 0) {
            stats.done = (Date.now () - start) / 60_000;
            finished = true;
            break;
        }
        const left = (end - Date.now ()) / 60_000;
        if (left < 1) {
            stats.stopReason = 'time';
            break;
        }
        const acc = await account ();
        stats.nudges += 1;
        const nudge = 'The session is still running: ' + left.toFixed (0) + ' minutes left, equity $' + acc.equityUsd + '. ' + DONE_HINT;
        messages.push ({ 'role': 'user', 'content': nudge });
        appendJsonl (transcript, { 'type': 'nudge', 'content': nudge });
    }
    // wait for the bell
    while (Date.now () < end) {
        await sleep (5000);
    }
    const acc = await account ();
    messages.push ({ 'role': 'user', 'content': 'Time is up. Final equity: $' + acc.equityUsd + ' (P&L $' + acc.pnlUsd + '). In a few sentences: what did you do, and why?' });
    try {
        const body = await complete ('none');
        stats.cost += body.usage?.cost ?? 0;
        const msg = body.choices?.[0]?.message ?? {};
        appendJsonl (transcript, { 'type': 'final', 'content': msg.content, 'reasoning': msg.reasoning });
        stats.finalWords = msg.content;
    } catch (e) {
        appendJsonl (transcript, { 'type': 'final_error', 'error': e.message });
    }
    await ccxtClient.close ().catch (() => {});
    await accountClient.close ().catch (() => {});
    return stats;
};

// ---------------------------------------------------------------- Claude agent (Claude Code CLI)

const claudeEnv = () => {
    // a clean environment: auth + network only, so the nested CLI does not pick up
    // this repository's CLAUDE.md, skills or the parent session's context
    const keep = [ 'PATH', 'HOME', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_API_KEY', 'CLAUDE_CODE_OAUTH_TOKEN', 'HTTPS_PROXY', 'HTTP_PROXY', 'https_proxy', 'http_proxy', 'NO_PROXY', 'no_proxy', 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE' ];
    const env = {};
    for (const k of keep) {
        if (process.env[k] !== undefined) {
            env[k] = process.env[k];
        }
    }
    env.MCP_TOOL_TIMEOUT = String (20 * 60_000);
    env.MCP_TIMEOUT = '60000';
    env.MAX_MCP_OUTPUT_TOKENS = '60000'; // let ccxt-mcp's own 80k-char cap govern, as in the OpenRouter loop
    env.DISABLE_AUTOUPDATER = '1';
    return env;
};

const runClaudeTurn = (agent, dir, cwd, mcpFile, prompt, sessionId, transcript) => new Promise ((resolve) => {
    const argv = [ '-p', prompt, '--model', agent.model, '--system-prompt', SYSTEM, '--mcp-config', mcpFile, '--strict-mcp-config', '--tools', '', '--allowedTools', 'mcp__ccxt,mcp__account', '--setting-sources', '', '--output-format', 'stream-json', '--verbose' ];
    if (sessionId) {
        argv.push ('--resume', sessionId);
    }
    const child = spawn ('claude', argv, { cwd, 'env': claudeEnv (), 'stdio': [ 'ignore', 'pipe', 'pipe' ] });
    let buf = '';
    let result;
    let sid = sessionId;
    const out = fs.openSync (transcript, 'a');
    child.stdout.on ('data', (d) => {
        buf += d.toString ();
        let i;
        while ((i = buf.indexOf ('\n')) !== -1) {
            const line = buf.slice (0, i);
            buf = buf.slice (i + 1);
            if (!line.trim ()) {
                continue;
            }
            fs.writeSync (out, line + '\n');
            try {
                const ev = JSON.parse (line);
                if (ev.session_id) {
                    sid = ev.session_id;
                }
                if (ev.type === 'result') {
                    result = ev;
                }
            } catch (e) {
                // ignore
            }
        }
    });
    child.stderr.on ('data', (d) => fs.appendFileSync (path.join (dir, 'claude.stderr'), d));
    child.on ('close', (code) => {
        fs.closeSync (out);
        resolve ({ code, result, 'sessionId': sid, child });
    });
    agent._child = child;
});

const runClaude = async (agent, port, start, end, dir) => {
    const transcript = path.join (dir, 'transcript.jsonl');
    // run outside the repository so no CLAUDE.md is discovered
    const cwd = fs.mkdtempSync (path.join (os.tmpdir (), 'arena-' + agent.id + '-'));
    const ccxtCfg = writeCcxtConfig (dir);
    const mcpFile = path.join (dir, 'mcp.json');
    fs.writeFileSync (mcpFile, JSON.stringify ({ 'mcpServers': {
        'ccxt': { 'command': process.execPath, 'args': [ CCXT_MCP ], 'env': { 'CCXT_MCP_CONFIG': ccxtCfg } },
        'account': { 'type': 'http', 'url': 'http://127.0.0.1:' + port + '/mcp' },
    } }));
    const stats = { 'turns': 0, 'nudges': 0, 'cost': 0, 'done': undefined, 'stopReason': undefined, 'numTurns': 0 };
    let sessionId;
    let prompt = TASK;
    const killer = setTimeout (() => agent._child?.kill ('SIGINT'), end - Date.now () + 5000);
    while (true) {
        const turn = await runClaudeTurn (agent, dir, cwd, mcpFile, prompt, sessionId, transcript);
        sessionId = turn.sessionId;
        stats.turns += 1;
        stats.cost += turn.result?.total_cost_usd ?? 0;
        stats.numTurns += turn.result?.num_turns ?? 0;
        const text = turn.result?.result ?? '';
        if (Date.now () >= end - 60_000) {
            stats.stopReason = 'time';
            break;
        }
        if (/\bDONE\b/.test (text) && stats.nudges > 0) {
            stats.done = (Date.now () - start) / 60_000;
            break;
        }
        if (turn.code !== 0 && !turn.result) {
            stats.stopReason = 'cli_error';
            await sleep (10_000);
        }
        const acc = (await snapshot (port)) ?? {};
        stats.nudges += 1;
        prompt = 'The session is still running: ' + ((end - Date.now ()) / 60_000).toFixed (0) + ' minutes left, equity $' + acc.equityUsd + '. ' + DONE_HINT;
        if (stats.nudges > 40) {
            stats.stopReason = 'too_many_nudges';
            break;
        }
    }
    clearTimeout (killer);
    while (Date.now () < end) {
        await sleep (5000);
    }
    const acc = (await snapshot (port)) ?? {};
    if (sessionId) {
        const turn = await runClaudeTurn (agent, dir, cwd, mcpFile, 'Time is up. Final equity: $' + acc.equityUsd + ' (P&L $' + acc.pnlUsd + '). In a few sentences: what did you do, and why? Do not call any tools.', sessionId, transcript);
        stats.cost += turn.result?.total_cost_usd ?? 0;
        stats.finalWords = turn.result?.result;
    }
    return stats;
};

// ---------------------------------------------------------------- main

const main = async () => {
    let agents = AGENTS;
    if (args.only) {
        const only = args.only.split (',');
        agents = agents.filter ((a) => only.indexOf (a.id) !== -1);
    }
    if (agents.some ((a) => a.kind === 'openrouter') && !OPENROUTER_KEY) {
        throw new Error ('set OPENROUTER_API_KEY');
    }
    fs.mkdirSync (RUN_DIR, { 'recursive': true });
    // brokers warm up, then everyone starts together; --startAt (ms) aligns separate arena processes
    const start = args.startAt ? Number (args.startAt) : Date.now () + 20_000;
    const end = start + MINUTES * 60_000;
    fs.writeFileSync (path.join (RUN_DIR, 'run.json'), JSON.stringify ({ RUN, MINUTES, 'start': new Date (start).toISOString (), 'end': new Date (end).toISOString (), 'variant': VARIANT, 'system': SYSTEM, 'task': TASK, 'agents': agents }, null, 2));
    const brokers = [];
    let port = Number (args.portBase ?? 7810);
    for (const a of agents) {
        a.port = port++;
        a.dir = path.join (RUN_DIR, a.id);
        fs.mkdirSync (a.dir, { 'recursive': true });
        brokers.push (startBroker (a, a.port, start, a.dir));
    }
    await sleep (start - Date.now ());
    console.log (now (), 'start', RUN, agents.map ((a) => a.id).join (', '));
    const results = await Promise.all (agents.map (async (a) => {
        try {
            const stats = a.kind === 'claude' ? await runClaude (a, a.port, start, end, a.dir) : await runOpenRouter (a, a.port, start, end, a.dir);
            console.log (now (), a.id, 'finished', JSON.stringify (stats).slice (0, 300));
            return [ a.id, stats ];
        } catch (e) {
            console.log (now (), a.id, 'crashed', e.stack);
            return [ a.id, { 'crash': e.message } ];
        }
    }));
    const summary = {};
    for (const [ id, stats ] of results) {
        const a = agents.find ((x) => x.id === id);
        const snap = await snapshot (a.port);
        summary[id] = { 'model': a.model, 'kind': a.kind, stats, 'final': snap };
    }
    fs.writeFileSync (path.join (RUN_DIR, 'summary.json'), JSON.stringify (summary, null, 2));
    for (const b of brokers) {
        b.kill ();
    }
    for (const [ id, s ] of Object.entries (summary)) {
        console.log (id.padEnd (14), String (s.final?.equityUsd).padStart (8), 'fills', s.final?.fills?.length, 'cost $' + (s.stats.cost ?? 0).toFixed (2));
    }
};

main ().catch ((e) => {
    console.error (e);
    process.exit (1);
});
