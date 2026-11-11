# Charts for the blog post: final equity per model per round, and one round's equity curves.
#   python3 charts.py <out_dir> runs/round1 runs/round2b runs/round3
import json
import os
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

out = sys.argv[1]
rounds = sys.argv[2:]
os.makedirs(out, exist_ok=True)

LABELS = {
    'claude-opus': 'Claude Opus 5.5', 'claude-sonnet': 'Claude Sonnet 5.5', 'claude-haiku': 'Claude Haiku 5.5',
    'gpt': 'GPT-6.1 Sol', 'gemini': 'Gemini Pro', 'grok': 'Grok 4.7', 'deepseek': 'DeepSeek V4 Pro',
    'qwen': 'Qwen 3.8', 'kimi': 'Kimi K3.1 Pro',
}
INK = '#1f2328'
MUTED = '#8c959f'
GRID = '#eaeef2'
ROUND_COLORS = ['#2f6fdd', '#d9822b', '#2da44e']

plt.rcParams.update({
    'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.edgecolor': GRID, 'axes.labelcolor': INK,
    'xtick.color': MUTED, 'ytick.color': INK, 'axes.spines.top': False, 'axes.spines.right': False,
    'axes.spines.left': False,
})

metrics = [json.load(open(os.path.join(r, 'metrics.json'))) for r in rounds]
agents = [a for a in LABELS if any(a in m and m[a].get('fills') is not None for m in metrics)]


def finals(a):
    vals = []
    for m in metrics:
        v = m.get(a)
        # a model that never got an API response did not take part in that round
        if v is None or (v['toolCalls'] == 0 and v['llmCostUsd'] == 0):
            vals.append(None)
        else:
            vals.append(v['finalEquity'])
    return vals


def mean(vals):
    vals = [v for v in vals if v is not None]
    return sum(vals) / len(vals)


agents.sort(key=lambda a: mean(finals(a)))

# 1. final equity per round
fig, ax = plt.subplots(figsize=(9, 5.2), dpi=200)
ax.axvline(100, color=MUTED, lw=1, ls='--', zorder=1)
for y, a in enumerate(agents):
    vals = finals(a)
    present = [v for v in vals if v is not None]
    ax.plot([min(present), max(present)], [y, y], color=GRID, lw=6, solid_capstyle='round', zorder=1)
    for i, v in enumerate(vals):
        if v is not None:
            ax.scatter(v, y - (i - (len(vals) - 1) / 2) * 0.16, s=60, color=ROUND_COLORS[i], zorder=3, edgecolor='white', linewidth=1.2, label=('Round ' + str(i + 1)) if y == 0 or a == agents[-1] else None)
ax.set_yticks(range(len(agents)))
ax.set_yticklabels([LABELS[a] for a in agents])
ax.set_xlabel('Equity after one hour (started at $100)')
ax.grid(axis='x', color=GRID, lw=0.8)
ax.tick_params(axis='y', length=0)
handles = [plt.Line2D([], [], marker='o', ls='', color=c, markersize=8, label='Round ' + str(i + 1)) for i, c in enumerate(ROUND_COLORS[:len(rounds)])]
ax.legend(handles=handles, frameon=False, loc='lower center', bbox_to_anchor=(0.5, 1.0), ncol=len(handles))
fig.tight_layout()
fig.savefig(os.path.join(out, 'ai-trading-final-equity.png'))

# 2. equity curves for the first round
r = rounds[0]
fig, ax = plt.subplots(figsize=(9, 5), dpi=200)
ax.axhline(100, color=MUTED, lw=1, ls='--')
palette = ['#2f6fdd', '#d9822b', '#2da44e', '#cf222e', '#8250df', '#1b7c83', '#bf3989', '#6e7781', '#9a6700']
labels = []
for i, a in enumerate(LABELS):
    f = os.path.join(r, a, 'equity.csv')
    if not os.path.exists(f) or metrics[0].get(a, {}).get('toolCalls', 0) == 0:
        continue
    rows = [l.strip().split(',') for l in open(f).read().strip().split('\n')[1:]]
    xs = [int(x[0]) for x in rows if int(x[0]) < 60] + [60]
    ys = [float(x[2]) for x in rows if int(x[0]) < 60] + [metrics[0][a]['finalEquity']]
    color = palette[i % len(palette)]
    ax.plot(xs, ys, color=color, lw=1.8)
    labels.append([ys[-1], LABELS[a], color, xs[-1]])
# keep end labels from overlapping: merge identical finals, then space them out
merged = []
for y, name, color, x in sorted(labels):
    if merged and abs(merged[-1][0] - y) < 0.3:
        merged[-1][1] = merged[-1][1].replace(' 5.5', '') + ', ' + name.replace('Claude ', '')
        merged[-1][2] = MUTED
    else:
        merged.append([y, name, color, x])
span = ax.get_ylim()[1] - ax.get_ylim()[0]
gap = span * 0.045
placed = []
for y, name, color, x in merged:
    ty = y if not placed or y - placed[-1] >= gap else placed[-1] + gap
    placed.append(ty)
    ax.annotate(name, (x, y), xytext=(x + 1.5, ty), textcoords='data', va='center', fontsize=9, color=color)
ax.set_xlim(0, 80)
ax.set_xlabel('Minutes')
ax.set_ylabel('Equity ($)')
ax.grid(axis='y', color=GRID, lw=0.8)
fig.tight_layout()
fig.savefig(os.path.join(out, 'ai-trading-equity-round1.png'))
print('ok')

# ---------------------------------------------------------------- extra visuals for the post

from matplotlib.animation import FuncAnimation, PillowWriter
from matplotlib.patches import FancyBboxPatch

COLORS = {
    'claude-opus': '#d9822b', 'claude-sonnet': '#e3a35b', 'claude-haiku': '#b8641a',
    'gpt': '#2da44e', 'gemini': '#2f6fdd', 'grok': '#1f2328', 'deepseek': '#8250df',
    'qwen': '#bf3989', 'kimi': '#cf222e',
}


def aggregate():
    agg = {}
    for m in metrics:
        for k, v in m.items():
            if v['toolCalls'] == 0 and (v.get('llmCostUsd') or 0) == 0:
                continue
            a = agg.setdefault(k, {'n': 0, 'fills': 0, 'lev': 0, 'calls': 0, 'pnl': 0, 'fees': 0, 'eq': 0})
            a['n'] += 1
            a['fills'] += v['fills']
            a['lev'] += v['maxLeverage']
            a['calls'] += v['toolCalls']
            a['pnl'] += v['pnl']
            a['fees'] += v['feesUsd']
            a['eq'] += v['finalEquity']
    return agg


agg = aggregate()

# 3. personality map: trades per hour vs leverage, colored by average result
fig, ax = plt.subplots(figsize=(9, 5.6), dpi=200)
points = {}
for k, a in agg.items():
    n = a['n']
    points[k] = (a['fills'] / n, a['lev'] / n, a['eq'] / n, a['calls'] / n)
# Opus and Sonnet sit on the same spot (no trades at all): one bubble, one label
merged_claude = 'claude-opus' in points and 'claude-sonnet' in points
for k, (x, y, eq, calls) in points.items():
    if merged_claude and k == 'claude-sonnet':
        continue
    color = '#2da44e' if eq >= 100.5 else ('#cf222e' if eq < 99 else MUTED)
    size = 40 + calls * 4
    ax.scatter(x, y, s=size, color=color, alpha=0.85, edgecolor='white', linewidth=1.5, zorder=3)
    name = 'Claude Opus & Sonnet' if (merged_claude and k == 'claude-opus') else LABELS[k]
    pad = 4 + (size ** 0.5) / 2
    left = k == 'deepseek'
    dy = {'claude-haiku': 9, 'claude-opus': -9}.get(k, 0)
    ax.annotate(name + f'  \\${eq:.0f}', (x, y), xytext=(-pad if left else pad, dy), textcoords='offset points', fontsize=9.5, color=INK, va='center', ha='right' if left else 'left')
ax.set_xlabel('Trades (fills) per hour, average')
ax.set_ylabel('Highest leverage used, average')
ax.set_xlim(-1, 14)
ax.set_ylim(-3, 34)
ax.grid(color=GRID, lw=0.8)
ax.text(13.8, -1.8, 'bubble size = tool calls · green: average above \\$100 · red: below \\$99', ha='right', fontsize=8.5, color=MUTED)
fig.tight_layout()
fig.savefig(os.path.join(out, 'ai-trading-personalities.png'))

# 4. fees vs trading P&L before fees, summed over the three rounds
order = sorted([k for k in agg if agg[k]['fills'] > 0], key=lambda k: agg[k]['pnl'] + agg[k]['fees'])
fig, ax = plt.subplots(figsize=(9, 4.8), dpi=200)
for y, k in enumerate(order):
    a = agg[k]
    gross = a['pnl'] + a['fees']
    ax.barh(y + 0.18, gross, height=0.34, color='#2da44e' if gross >= 0 else '#8c959f')
    ax.barh(y - 0.18, -a['fees'], height=0.34, color='#cf222e')
    ax.scatter(a['pnl'], y, marker='D', s=36, color=INK, zorder=3)
ax.axvline(0, color=MUTED, lw=1)
ax.set_yticks(range(len(order)))
ax.set_yticklabels([LABELS[k] for k in order])
ax.tick_params(axis='y', length=0)
ax.set_xlabel('USD, three rounds combined')
ax.grid(axis='x', color=GRID, lw=0.8)
handles = [
    plt.Rectangle((0, 0), 1, 1, color='#2da44e', label='Trading P&L before fees'),
    plt.Rectangle((0, 0), 1, 1, color='#cf222e', label='Fees paid'),
    plt.Line2D([], [], marker='D', ls='', color=INK, label='What was left'),
]
ax.legend(handles=handles, frameon=False, loc='lower center', bbox_to_anchor=(0.5, 1.0), ncol=3, fontsize=9.5)
fig.tight_layout()
fig.savefig(os.path.join(out, 'ai-trading-fees.png'))

# 5. setup diagram
fig, ax = plt.subplots(figsize=(9, 3.4), dpi=200)
ax.set_xlim(0, 100)
ax.set_ylim(0, 40)
ax.axis('off')


def box(x, y, w, h, title, sub, fc):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.4,rounding_size=2', fc=fc, ec='none'))
    ax.text(x + w / 2, y + h * 0.64, title, ha='center', va='center', fontsize=11, weight='bold', color=INK)
    ax.text(x + w / 2, y + h * 0.3, sub, ha='center', va='center', fontsize=8.5, color='#57606a')


box(2, 14, 22, 12, '9 AI models', 'same prompt, same hour', '#f0f3f6')
box(38, 25, 26, 11, 'ccxt-mcp', 'market data, 100+ exchanges', '#ddf4ff')
box(38, 4, 26, 11, 'account (paper)', '$100 · fills vs live books', '#fff8c5')
box(76, 14, 22, 12, 'Live order books', 'OKX · Bitget · Gate\nKuCoin · Hyperliquid', '#dafbe1')
arrow = dict(arrowstyle='->', color=MUTED, lw=1.4)
ax.annotate('', xy=(37.5, 30.5), xytext=(24.5, 22), arrowprops=arrow)
ax.annotate('', xy=(37.5, 9.5), xytext=(24.5, 18), arrowprops=arrow)
ax.annotate('', xy=(75.5, 22), xytext=(64.5, 30.5), arrowprops=arrow)
ax.annotate('', xy=(75.5, 18), xytext=(64.5, 9.5), arrowprops=arrow)
fig.tight_layout()
fig.savefig(os.path.join(out, 'ai-trading-setup.png'))

# 6. animated equity race for the first round
r = rounds[0]
series = {}
for a in LABELS:
    f = os.path.join(r, a, 'equity.csv')
    if not os.path.exists(f) or metrics[0].get(a, {}).get('toolCalls', 0) == 0:
        continue
    rows = [l.strip().split(',') for l in open(f).read().strip().split('\n')[1:]]
    pts = {int(x[0]): float(x[2]) for x in rows if int(x[0]) < 60}
    pts[60] = metrics[0][a]['finalEquity']
    xs = sorted(pts)
    series[a] = (xs, [pts[x] for x in xs])
fig, ax = plt.subplots(figsize=(8, 4.6), dpi=100)
lines = {}
texts = {}
for a, (xs, ys) in series.items():
    lines[a], = ax.plot([], [], color=COLORS[a], lw=2)
    texts[a] = ax.text(0, 100, '', fontsize=9, color=COLORS[a], va='center')
ax.axhline(100, color=MUTED, lw=1, ls='--')
ax.set_xlim(0, 75)
allv = [v for _, ys in series.values() for v in ys]
ax.set_ylim(min(allv) - 1, max(allv) + 1)
ax.set_xlabel('Minutes')
ax.set_ylabel('Equity ($)')
ax.grid(axis='y', color=GRID, lw=0.8)
clock = ax.text(1, max(allv) + 0.2, '', fontsize=11, color=INK, weight='bold', va='top')
fig.tight_layout()
short = {'claude-opus': 'Opus', 'claude-sonnet': 'Sonnet', 'claude-haiku': 'Haiku', 'gpt': 'GPT', 'gemini': 'Gemini', 'grok': 'Grok', 'deepseek': 'DeepSeek', 'qwen': 'Qwen', 'kimi': 'Kimi'}


def frame(i):
    t = min(i, 60)
    heads = []
    for a, (xs, ys) in series.items():
        n = len([x for x in xs if x <= t])
        lines[a].set_data(xs[:n], ys[:n])
        if n:
            heads.append([ys[n - 1], a, xs[n - 1]])
    # Claude Opus/Sonnet/Haiku sit on top of each other at $100: label them once
    heads.sort()
    placed = []
    for y, a, x in heads:
        if a in ('claude-sonnet', 'claude-haiku'):
            texts[a].set_text('')
            continue
        label = 'Claude ×3' if a == 'claude-opus' else short[a]
        ty = y
        span = ax.get_ylim()[1] - ax.get_ylim()[0]
        if placed and ty - placed[-1] < span * 0.05:
            ty = placed[-1] + span * 0.05
        placed.append(ty)
        texts[a].set_position((x + 1, ty))
        texts[a].set_text(label + f' ${y:.0f}')
    clock.set_text(f'Minute {t}')
    return list(lines.values()) + list(texts.values()) + [clock]


anim = FuncAnimation(fig, frame, frames=61 + 16, blit=False)
anim.save(os.path.join(out, 'ai-trading-race.gif'), writer=PillowWriter(fps=7))
print('extra ok')
