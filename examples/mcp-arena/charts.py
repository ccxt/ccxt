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
    xs = [int(x[0]) for x in rows if int(x[0]) <= 60]
    ys = [float(x[2]) for x in rows if int(x[0]) <= 60]
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
