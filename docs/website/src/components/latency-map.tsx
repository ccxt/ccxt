'use client';

// Animated world map of exchange API latency, for the "How far is your exchange?" blog
// post. Everything is self-contained: the world outline is an inline equirectangular SVG
// path (src/data/world-map.json, generated from Natural Earth 110m) and the numbers are a
// committed snapshot (src/data/latency-data.json, produced by scripts/collect-latency.mjs
// against the free Globalping probe network). Nothing is fetched at render time.
//
// Pick an exchange: arcs fly from each vantage city to the city where that exchange
// answered fastest (a stand-in for where it is hosted). Arc colour = measured median TTFB;
// the pulse travels slower the higher the latency. A colour-coded table underneath gives
// the exchange-vs-region comparison for anyone who prefers numbers (and for screen readers).

import { useEffect, useMemo, useState } from 'react';
import world from '@/data/world-map.json';
import dataset from '@/data/latency-data.json';

const EXCHANGE_COLORS: Record<string, string> = {
  binance: '#F0B90B',
  coinbase: '#0052FF',
  kraken: '#7132F5',
  okx: '#7C8593',
  bybit: '#F7A600',
  kucoin: '#22D3A6',
  gate: '#E6004C',
  bitget: '#00E0D5',
  hyperliquid: '#50D2C1',
  polymarket: '#2D6EF5',
};

// Short badge for the non-spot venues (perps DEX, prediction market).
const KIND_LABEL: Record<string, string> = { perp: 'perp', prediction: 'prediction' };

const { width: W, height: H } = world;

type Cell = (typeof dataset.data)[number];
type Region = (typeof dataset.regions)[number];

const projX = (lon: number) => ((lon + 180) * W) / 360;
const projY = (lat: number) => ((90 - lat) * H) / 180;

// Latency -> colour ramp (green fast ... red slow), in ms of median TTFB.
function latColor(ms: number | null): string {
  if (ms == null) return '#6b7280';
  if (ms < 30) return '#22c55e';
  if (ms < 75) return '#84cc16';
  if (ms < 150) return '#eab308';
  if (ms < 250) return '#f97316';
  return '#ef4444';
}

function latLabel(ms: number | null): string {
  if (ms == null) return 'n/a';
  return `${Math.round(ms)} ms`;
}

const regionByKey: Record<string, Region> = Object.fromEntries(
  dataset.regions.map((r) => [r.key, r]),
);

export function LatencyMap() {
  const exchangeIds = useMemo(() => dataset.exchanges.map((e) => e.id), [dataset.exchanges]);
  const [selected, setSelected] = useState<string>(exchangeIds[0]);
  const [playing, setPlaying] = useState<boolean>(true);

  // Auto-cycle through exchanges until the user interacts.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setSelected((cur) => {
        const i = exchangeIds.indexOf(cur);
        return exchangeIds[(i + 1) % exchangeIds.length];
      });
    }, 3500);
    return () => clearInterval(t);
  }, [playing, exchangeIds]);

  const pick = (id: string) => {
    setPlaying(false);
    setSelected(id);
  };

  const cells = useMemo(
    () => dataset.data.filter((d) => d.exchange === selected),
    [selected],
  );

  // Anchor = the vantage city where this exchange answered fastest (proxy for hosting).
  const anchor = useMemo(() => {
    const usable = cells.filter((c) => c.ttfb != null);
    if (!usable.length) return null;
    const best = usable.reduce((a, b) => (a.ttfb! <= b.ttfb! ? a : b));
    const r = regionByKey[best.region];
    return { region: r, cell: best, x: projX(r.lon), y: projY(r.lat) };
  }, [cells]);

  const exchangeMeta = dataset.exchanges.find((e) => e.id === selected)!;
  const accent = EXCHANGE_COLORS[selected] ?? '#3b82f6';

  return (
    <div className="not-prose my-8">
      {/* Exchange selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {dataset.exchanges.map((e) => {
          const on = e.id === selected;
          return (
            <button
              key={e.id}
              onClick={() => pick(e.id)}
              className="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
              style={{
                borderColor: on ? EXCHANGE_COLORS[e.id] : 'var(--color-fd-border)',
                background: on ? EXCHANGE_COLORS[e.id] : 'transparent',
                color: on ? '#000' : 'var(--color-fd-muted-foreground)',
              }}
            >
              {e.name}
            </button>
          );
        })}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto rounded-full border px-3 py-1 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent"
          title={playing ? 'Pause auto-cycle' : 'Auto-cycle exchanges'}
          aria-pressed={playing}
          aria-label={playing ? 'Pause auto-cycle' : 'Auto-cycle exchanges'}
        >
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border bg-fd-card">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`World map of ${exchangeMeta.name} API latency from eight regions`}
        >
          {/* ocean */}
          <rect x={0} y={0} width={W} height={H} fill="var(--color-fd-background)" />
          {/* land */}
          <path
            d={world.path}
            fill="var(--color-fd-muted)"
            stroke="var(--color-fd-border)"
            strokeWidth={0.4}
            opacity={0.55}
          />

          {/* arcs from every region to the fastest-responding city */}
          {anchor &&
            cells.map((c, i) => {
              const r = regionByKey[c.region];
              const x1 = projX(r.lon);
              const y1 = projY(r.lat);
              const x2 = anchor.x;
              const y2 = anchor.y;
              const isAnchor = c.region === anchor.region.key;
              const blocked = c.ttfb == null && c.blocked > 0;
              if (isAnchor) return null;
              // control point: lift the arc off the surface
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const lift = Math.min(120, Math.hypot(x2 - x1, y2 - y1) * 0.28);
              const cx = mx;
              const cy = my - lift;
              const d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
              const color = blocked ? '#6b7280' : latColor(c.ttfb);
              const pathId = `arc-${selected}-${c.region}`;
              // pulse travel time grows with latency (slower = higher latency)
              const dur = blocked ? 2.4 : Math.min(4, Math.max(0.7, (c.ttfb ?? 100) / 90));
              return (
                <g key={c.region}>
                  <path
                    id={pathId}
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={blocked ? 0.8 : 1.1}
                    strokeOpacity={blocked ? 0.35 : 0.65}
                    strokeDasharray={blocked ? '3 3' : undefined}
                  />
                  {!blocked && (
                    <circle r={2.6} fill={color}>
                      <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.25}s`}>
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                    </circle>
                  )}
                </g>
              );
            })}

          {/* region markers */}
          {dataset.regions.map((r) => {
            const c = cells.find((d) => d.region === r.key);
            const x = projX(r.lon);
            const y = projY(r.lat);
            const isAnchor = anchor?.region.key === r.key;
            const blocked = c && c.ttfb == null && c.blocked > 0;
            const color = blocked ? '#ef4444' : latColor(c?.ttfb ?? null);
            return (
              <g key={r.key}>
                {isAnchor && (
                  <circle cx={x} cy={y} r={9} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.9}>
                    <animate attributeName="r" values="6;13;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={x} cy={y} r={isAnchor ? 4.2 : 3.2} fill={color} stroke="#fff" strokeWidth={0.6} />
                {blocked && (
                  <text x={x} y={y + 1.6} textAnchor="middle" fontSize={5} fill="#fff" fontWeight="bold">
                    ×
                  </text>
                )}
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={8}
                  fill="var(--color-fd-foreground)"
                  style={{ paintOrder: 'stroke', fontWeight: 600 }}
                >
                  {r.label}
                </text>
                <text x={x} y={y + 12} textAnchor="middle" fontSize={7} fill="var(--color-fd-muted-foreground)">
                  {blocked ? 'blocked' : latLabel(c?.ttfb ?? null)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* caption + legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fd-muted-foreground">
        <span>
          Pulses fly toward <strong style={{ color: accent }}>{exchangeMeta.name}</strong>&rsquo;s fastest
          vantage ({anchor?.region.label ?? 'n/a'}, {latLabel(anchor?.cell.ttfb ?? null)}). Slower pulse = higher latency.
        </span>
        <span className="flex items-center gap-3">
          {[
            ['<30', '#22c55e'],
            ['<75', '#84cc16'],
            ['<150', '#eab308'],
            ['<250', '#f97316'],
            ['250+', '#ef4444'],
            ['blocked', '#6b7280'],
          ].map(([lbl, col]) => (
            <span key={lbl} className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-full" style={{ background: col }} />
              {lbl}
            </span>
          ))}
          <span>ms TTFB</span>
        </span>
      </div>

      {/* full heatmap table */}
      <LatencyTable />
    </div>
  );
}

// Exchange x region heatmap — the per-exchange AND per-region comparison, and the
// accessible fallback for the animated map above.
export function LatencyTable() {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr className="bg-fd-muted/50">
            <th className="sticky left-0 bg-fd-muted/50 px-3 py-2 text-left font-semibold">Exchange</th>
            {dataset.regions.map((r) => (
              <th key={r.key} className="px-2 py-2 font-medium text-fd-muted-foreground whitespace-nowrap">
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.exchanges.map((e) => (
            <tr key={e.id} className="border-t">
              <th className="sticky left-0 bg-fd-card px-3 py-2 text-left font-medium whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block size-2.5 rounded-full" style={{ background: EXCHANGE_COLORS[e.id] }} />
                  {e.name}
                  {KIND_LABEL[(e as { kind?: string }).kind ?? ''] ? (
                    <span className="rounded bg-fd-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fd-muted-foreground">
                      {KIND_LABEL[(e as { kind?: string }).kind ?? '']}
                    </span>
                  ) : null}
                </span>
              </th>
              {dataset.regions.map((r) => {
                const c = dataset.data.find((d) => d.exchange === e.id && d.region === r.key);
                const blocked = c && c.ttfb == null && c.blocked > 0;
                const col = blocked ? '#6b7280' : latColor(c?.ttfb ?? null);
                const range =
                  c && c.ttfbMin != null && c.ttfbMax != null && c.ttfbMax !== c.ttfbMin
                    ? ` (range ${Math.round(c.ttfbMin)}–${Math.round(c.ttfbMax)} ms)`
                    : '';
                return (
                  <td key={r.key} className="px-2 py-2">
                    <span
                      className="inline-block min-w-[3.2rem] rounded px-1.5 py-0.5 text-xs font-semibold text-white"
                      style={{ background: col }}
                      title={blocked ? `blocked ${c?.blocked}/${c?.samples} samples (HTTP ${c?.statusCodes.join('/')})` : latLabel(c?.ttfb ?? null) + range}
                    >
                      {blocked ? 'blk' : latLabel(c?.ttfb ?? null)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
