'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from 'lucide-react';

// Sortable / filterable Supported-Exchanges table. The dataset is parsed from the wiki
// markdown by build/wiki-to-fumadocs.ts (crypto + prediction merged) and passed in as a
// JSON string `data` prop via the exchanges-table fence (see website/source.config.ts).

type Row = {
  id: string;
  name: string;
  site: string;
  logo: string;
  version: string;
  doclink: string;
  type: 'CEX' | 'DEX' | 'Prediction';
  certified: boolean;
  pro: boolean;
  docs: string;
};

type SortKey = 'name' | 'id' | 'type' | 'version' | 'certified' | 'pro';

const TYPE_BADGE: Record<Row['type'], string> = {
  CEX: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  DEX: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  Prediction: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500',
];

function Logo({ row }: { row: Row }) {
  const [failed, setFailed] = useState(!row.logo);
  if (failed) {
    let h = 0;
    for (let i = 0; i < row.id.length; i++) h = (h * 31 + row.id.charCodeAt(i)) >>> 0;
    return (
      <span className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${AVATAR_COLORS[h % AVATAR_COLORS.length]}`}>
        {row.name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // plain <img>: logos are remote without known dimensions (next/image needs them);
    // fall back to a colored letter avatar when the URL 404s (e.g. some favicons)
    <img
      src={row.logo}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="size-7 shrink-0 rounded-md bg-white object-contain p-0.5 ring-1 ring-fd-border"
    />
  );
}

function SortHeader({
  label, col, sortKey, sortDir, onSort, className,
}: {
  label: string; col: SortKey; sortKey: SortKey; sortDir: 'asc' | 'desc';
  onSort: (c: SortKey) => void; className?: string;
}) {
  const active = sortKey === col;
  return (
    <th className={`px-3 py-2 text-left font-semibold ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-fd-foreground ${active ? 'text-fd-foreground' : 'text-fd-muted-foreground'}`}
      >
        {label}
        {active ? (sortDir === 'asc' ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />) : <ChevronsUpDown className="size-3.5 opacity-40" />}
      </button>
    </th>
  );
}

export function ExchangesTable({ data }: { data: string }) {
  const rows = useMemo<Row[]>(() => {
    try { return JSON.parse(data) as Row[]; } catch { return []; }
  }, [data]);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | Row['type']>('All');
  const [onlyCertified, setOnlyCertified] = useState(false);
  const [onlyPro, setOnlyPro] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const counts = useMemo(() => ({
    All: rows.length,
    CEX: rows.filter((r) => r.type === 'CEX').length,
    DEX: rows.filter((r) => r.type === 'DEX').length,
    Prediction: rows.filter((r) => r.type === 'Prediction').length,
  }), [rows]);

  const onSort = (c: SortKey) => {
    if (c === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(c); setSortDir(c === 'certified' || c === 'pro' ? 'desc' : 'asc'); }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (typeFilter !== 'All' && r.type !== typeFilter) return false;
      if (onlyCertified && !r.certified) return false;
      if (onlyPro && !r.pro) return false;
      if (q && !r.id.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'certified' || sortKey === 'pro') cmp = Number(a[sortKey]) - Number(b[sortKey]);
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true, sensitivity: 'base' });
      return (cmp || a.name.localeCompare(b.name)) * dir;
    });
  }, [rows, query, typeFilter, onlyCertified, onlyPro, sortKey, sortDir]);

  const TYPES: ('All' | Row['type'])[] = ['All', 'CEX', 'DEX', 'Prediction'];

  return (
    <div className="not-prose my-6">
      {/* filters */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fd-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or id…"
            className="w-full rounded-lg border bg-fd-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-fd-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${typeFilter === t ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:bg-fd-accent'}`}
            >
              {t} <span className="opacity-60">{counts[t]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyCertified((v) => !v)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${onlyCertified ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'text-fd-muted-foreground hover:bg-fd-accent'}`}
          >
            Certified
          </button>
          <button
            type="button"
            onClick={() => setOnlyPro((v) => !v)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${onlyPro ? 'border-fd-foreground bg-fd-foreground text-fd-background' : 'text-fd-muted-foreground hover:bg-fd-accent'}`}
          >
            Pro
          </button>
        </div>
      </div>

      <div className="mb-2 text-xs text-fd-muted-foreground">
        Showing <b className="text-fd-foreground">{visible.length}</b> of {rows.length} exchanges
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b bg-fd-muted/40 text-xs">
            <tr>
              <th className="px-3 py-2" />
              <SortHeader label="Name" col="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Id" col="id" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Ver" col="version" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Type" col="type" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Certified" col="certified" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="hidden sm:table-cell" />
              <SortHeader label="Pro" col="pro" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="hidden sm:table-cell" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={`${r.type}:${r.id}`} className="border-b last:border-0 transition-colors hover:bg-fd-accent/50">
                <td className="px-3 py-2"><Logo row={r} /></td>
                <td className="px-3 py-2">
                  <Link href={r.docs} className="font-medium text-fd-foreground hover:text-fd-primary hover:underline">{r.name}</Link>
                </td>
                <td className="px-3 py-2">
                  {r.site
                    ? <a href={r.site} target="_blank" rel="noreferrer" className="font-mono text-xs text-fd-muted-foreground hover:text-fd-primary hover:underline">{r.id}</a>
                    : <span className="font-mono text-xs text-fd-muted-foreground">{r.id}</span>}
                </td>
                <td className="px-3 py-2">
                  {r.doclink
                    ? <a href={r.doclink} target="_blank" rel="noreferrer" className="font-mono text-xs text-fd-muted-foreground hover:text-fd-primary hover:underline">{r.version}</a>
                    : <span className="font-mono text-xs text-fd-muted-foreground">{r.version}</span>}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${TYPE_BADGE[r.type]}`}>{r.type}</span>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  {r.certified && <Link href="/docs/certification" className="text-emerald-600 hover:underline dark:text-emerald-400">✓</Link>}
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  {r.pro && <Link href="/docs/pro-manual" className="font-semibold text-fd-foreground hover:underline">Pro</Link>}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-fd-muted-foreground">No exchanges match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
