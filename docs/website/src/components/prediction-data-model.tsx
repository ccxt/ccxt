'use client';

// Bespoke animated diagram of the prediction-market data model, rendered on the
// /docs/prediction overview. wiki-to-fumadocs swaps the wiki's ```mermaid fence for a
// ```prediction-diagram fence, which source.config.ts turns into <PredictionDataModel/>.
// Pure CSS animations (no runtime dep): cards fade up on mount, a dot flows down each
// connector to show data feeding from one level to the next, the tradeable Outcome glows,
// and reduced-motion users get a static layout.

type Level = {
  key: string;
  name: string;
  blurb: string;
  fields: string[];
  accent: 'event' | 'market' | 'outcome';
};

const LEVELS: Level[] = [
  {
    key: 'event',
    name: 'Event',
    blurb: 'groups markets — e.g. "2026 World Cup"',
    fields: ['id', 'slug', 'title', 'active', 'resolved', 'end', 'volume'],
    accent: 'event',
  },
  {
    key: 'market',
    name: 'Market',
    blurb: 'one question — e.g. "Brazil to win?" · binary · categorical · scalar',
    fields: ['id', 'market', 'marketType', 'executionModel', 'collateral', 'tickSize', 'fees'],
    accent: 'market',
  },
  {
    key: 'outcome',
    name: 'Outcome',
    blurb: 'the tradeable unit — e.g. "…:YES"',
    fields: ['outcome', 'outcomeId', 'label', 'price 0..1', 'bid', 'ask'],
    accent: 'outcome',
  },
];

const EDGES = ['contains 1..N markets', 'contains 1..N outcomes'];

const METHODS = [
  { type: 'Order', via: 'createOrder' },
  { type: 'Trade', via: 'fetchMyTrades' },
  { type: 'Position', via: 'fetchPositions' },
  { type: 'Ticker', via: 'fetchTicker' },
  { type: 'OrderBook', via: 'fetchOrderBook' },
];

const ACCENT: Record<Level['accent'], string> = {
  event: 'border-blue-400/60 bg-blue-500/5 dark:border-blue-400/40',
  market: 'border-indigo-400/60 bg-indigo-500/5 dark:border-indigo-400/40',
  outcome: 'pdm-glow border-emerald-500/70 bg-emerald-500/10 dark:border-emerald-400/60',
};

const CHIP_ACCENT: Record<Level['accent'], string> = {
  event: 'border-blue-400/30 text-blue-700 dark:text-blue-300',
  market: 'border-indigo-400/30 text-indigo-700 dark:text-indigo-300',
  outcome: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
};

const css = `
@keyframes pdm-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes pdm-flow { 0% { top: 0; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
@keyframes pdm-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow: 0 0 28px 1px rgba(16,185,129,0.30); } }
.pdm-card { opacity: 0; animation: pdm-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
.pdm-glow { animation: pdm-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards, pdm-glow 3.2s ease-in-out 0.8s infinite; }
.pdm-dot { animation: pdm-flow 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .pdm-card, .pdm-glow { opacity: 1 !important; transform: none !important; animation: none !important; }
  .pdm-dot { display: none !important; }
}
`;

function Connector({ label, delay, accent }: { label: string; delay: number; accent: string }) {
  return (
    <div className="pdm-card flex flex-col items-center" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative h-12 w-px overflow-visible bg-fd-border">
        <span className={`pdm-dot absolute left-1/2 size-2 -translate-x-1/2 rounded-full ${accent}`} style={{ animationDelay: `${delay + 200}ms` }} />
      </div>
      <span className="-my-2 rounded-full border bg-fd-card px-2.5 py-0.5 text-xs text-fd-muted-foreground shadow-sm">
        {label}
      </span>
      <div className="h-12 w-px bg-fd-border" />
    </div>
  );
}

export function PredictionDataModel() {
  return (
    <div className="not-prose my-8">
      <style>{css}</style>
      <div className="flex flex-col items-center rounded-2xl border bg-gradient-to-b from-fd-card to-fd-background p-5 sm:p-8">
        {LEVELS.map((lvl, i) => (
          <div key={lvl.key} className="flex w-full flex-col items-center">
            <div
              className={`pdm-card w-full max-w-xl rounded-xl border-2 px-5 py-4 ${ACCENT[lvl.accent]}`}
              style={{ animationDelay: `${i * 260}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="m-0 text-lg font-bold text-fd-foreground">{lvl.name}</h3>
                {lvl.accent === 'outcome' && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    tradeable unit
                  </span>
                )}
              </div>
              <p className="mt-1 mb-3 text-sm text-fd-muted-foreground">{lvl.blurb}</p>
              <div className="flex flex-wrap gap-1.5">
                {lvl.fields.map((f) => (
                  <code
                    key={f}
                    className={`rounded-md border bg-fd-background/60 px-1.5 py-0.5 text-[11px] font-medium ${CHIP_ACCENT[lvl.accent]}`}
                  >
                    {f}
                  </code>
                ))}
              </div>
            </div>
            {i < LEVELS.length - 1 && (
              <Connector
                label={EDGES[i]}
                delay={i * 260 + 180}
                accent={lvl.accent === 'event' ? 'bg-blue-500' : 'bg-indigo-500'}
              />
            )}
          </div>
        ))}

        {/* fan-out: every price/trade method takes the outcome handle */}
        <Connector label="referenced by the outcome handle" delay={LEVELS.length * 260} accent="bg-emerald-500" />
        <div className="grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3">
          {METHODS.map((m, i) => (
            <div
              key={m.type}
              className="pdm-card flex flex-col items-center rounded-lg border bg-fd-card px-2 py-2.5 text-center shadow-sm transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
              style={{ animationDelay: `${LEVELS.length * 260 + 200 + i * 90}ms` }}
            >
              <span className="text-sm font-semibold text-fd-foreground">{m.type}</span>
              <code className="mt-0.5 text-[10px] text-fd-muted-foreground">{m.via}()</code>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-fd-muted-foreground">
          prices are probabilities <b className="font-semibold text-fd-foreground">0..1</b> per share · amount = shares · cost = collateral
        </p>
      </div>
    </div>
  );
}
