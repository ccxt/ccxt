// Summarise an arena run: behaviour metrics per agent, as JSON and a markdown table.
//
//   node analyze.mjs runs/round1

import fs from 'node:fs';
import path from 'node:path';

const runDir = process.argv[2];
const run = JSON.parse (fs.readFileSync (path.join (runDir, 'run.json'), 'utf8'));
const summary = fs.existsSync (path.join (runDir, 'summary.json')) ? JSON.parse (fs.readFileSync (path.join (runDir, 'summary.json'), 'utf8')) : {};
const start = Date.parse (run.start);

// fill events carry their own ISO "t", which overrides the log timestamp
const ts = (e) => (typeof e.t === 'string') ? Date.parse (e.t) : e.t;
const readJsonl = (file) => fs.existsSync (file) ? fs.readFileSync (file, 'utf8').split ('\n').filter (Boolean).map ((l) => JSON.parse (l)) : [];

// tool calls as seen by the model, for either transcript format
const toolCalls = (agent, transcript) => {
    const calls = [];
    for (const e of transcript) {
        if (agent.kind === 'openrouter' && e.type === 'assistant') {
            for (const c of e.tool_calls ?? []) {
                let input = {};
                try {
                    input = JSON.parse (c.function.arguments || '{}');
                } catch (err) {
                    // ignore
                }
                calls.push ({ 'name': c.function.name, input, 't': Date.parse (e.t) });
            }
        }
        if (agent.kind === 'claude' && e.type === 'assistant') {
            for (const c of e.message?.content ?? []) {
                if (c.type === 'tool_use') {
                    calls.push ({ 'name': c.name, 'input': c.input, 't': undefined });
                }
            }
        }
    }
    return calls;
};

const out = {};
for (const agent of run.agents) {
    const dir = path.join (runDir, agent.id);
    const events = readJsonl (path.join (dir, 'events.jsonl'));
    const transcript = readJsonl (path.join (dir, 'transcript.jsonl'));
    const equity = fs.existsSync (path.join (dir, 'equity.csv')) ? fs.readFileSync (path.join (dir, 'equity.csv'), 'utf8').trim ().split ('\n').slice (1).map ((l) => Number (l.split (',')[2])) : [];
    const calls = toolCalls (agent, transcript);
    const fills = events.filter ((e) => e.type === 'fill');
    const brokerCalls = events.filter ((e) => e.type === 'call');
    const orders = brokerCalls.filter ((e) => e.tool === 'place_order');
    const errors = events.filter ((e) => e.type === 'error');
    const waits = brokerCalls.filter ((e) => e.tool === 'wait');
    const researched = new Set (calls.filter ((c) => c.name.startsWith ('mcp__ccxt__') && c.input?.exchange).map ((c) => c.input.exchange));
    const toolCount = {};
    for (const c of calls) {
        const n = c.name.replace (/^mcp__\w+?__/, '');
        toolCount[n] = (toolCount[n] ?? 0) + 1;
    }
    let peak = -Infinity;
    let maxDd = 0;
    for (const v of equity) {
        peak = Math.max (peak, v);
        maxDd = Math.max (maxDd, peak - v);
    }
    const s = summary[agent.id] ?? {};
    const final = s.final ?? {};
    out[agent.id] = {
        'model': agent.model,
        'finalEquity': final.equityUsd,
        'pnl': final.pnlUsd,
        'peakEquity': equity.length ? Math.max (...equity) : undefined,
        'troughEquity': equity.length ? Math.min (...equity) : undefined,
        'maxDrawdownUsd': Number (maxDd.toFixed (2)),
        'toolCalls': calls.length,
        'marketDataCalls': calls.filter ((c) => c.name.startsWith ('mcp__ccxt__')).length,
        'exchangesResearched': [ ...researched ],
        'ordersAttempted': orders.length,
        'ordersRejected': errors.filter ((e) => e.tool === 'place_order').length,
        'fills': fills.length,
        'firstFillMinute': fills.length ? Number (((ts (fills[0]) - start) / 60_000).toFixed (1)) : undefined,
        'venuesTraded': [ ...new Set (fills.map ((f) => f.venue)) ],
        'symbolsTraded': [ ...new Set (fills.map ((f) => f.symbol)) ],
        'maxLeverage': Math.max (0, ...orders.map ((o) => o.input?.leverage ?? 1)),
        'usedPerps': fills.some ((f) => f.symbol.indexOf (':') !== -1),
        'shorted': fills.some ((f) => f.symbol.indexOf (':') !== -1 && f.side === 'sell' && f.realizedPnlUsd === 0),
        'stopsOrTriggers': orders.filter ((o) => o.input?.triggerPrice !== undefined).length,
        'limitOrders': orders.filter ((o) => o.input?.type === 'limit').length,
        'transfers': brokerCalls.filter ((e) => e.tool === 'transfer').length,
        'liquidations': events.filter ((e) => e.type === 'liquidation').length,
        'minutesWaited': Number (waits.reduce ((a, w) => a + (w.input?.minutes ?? 0), 0).toFixed (1)),
        'feesUsd': final.stats ? Number (final.stats.fees.toFixed (2)) : undefined,
        'fundingUsd': final.stats ? Number (final.stats.funding.toFixed (4)) : undefined,
        'openAtEnd': (final.positions ?? []).map ((p) => p.side + ' ' + p.symbol + ' ' + p.leverage + 'x').concat ((Object.entries (final.venues ?? {})).flatMap (([ v, x ]) => (x.spot ?? []).map ((h) => h.asset + ' spot on ' + v))),
        'saidDoneAtMinute': s.stats?.done !== undefined ? Number (s.stats.done.toFixed (1)) : undefined,
        'nudges': s.stats?.nudges,
        'llmCostUsd': s.stats?.cost !== undefined ? Number (s.stats.cost.toFixed (2)) : undefined,
        'tools': toolCount,
        'finalWords': s.stats?.finalWords,
    };
}

fs.writeFileSync (path.join (runDir, 'metrics.json'), JSON.stringify (out, null, 2));
const rows = Object.entries (out).sort ((a, b) => (b[1].finalEquity ?? 0) - (a[1].finalEquity ?? 0));
console.log ('| agent | final $ | fills | first fill (min) | max lev | stops | venues | tool calls | waited (min) | fees $ | LLM $ |');
console.log ('|---|---|---|---|---|---|---|---|---|---|---|');
for (const [ id, m ] of rows) {
    console.log ('| ' + [ id, m.finalEquity, m.fills, m.firstFillMinute ?? '-', m.maxLeverage, m.stopsOrTriggers, m.venuesTraded.join (' ') || '-', m.toolCalls, m.minutesWaited, m.feesUsd, m.llmCostUsd ].join (' | ') + ' |');
}
