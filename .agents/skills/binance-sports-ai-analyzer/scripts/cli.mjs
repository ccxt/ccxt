#!/usr/bin/env node
// Sports AI analyzer CLI - self-contained, zero-dep, Node >= 22
// Usage: node cli.mjs <command> '<json_params>'

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TIMEOUT_MS = 10_000;
const DEFAULT_BASE_URL = 'https://web3.binance.com/bapi/defi';
const UA = {
  'Accept-Encoding': 'identity',
  'User-Agent': 'binance-web3/0.1 (SportsAiAnalyzerSkill)',
};

const qs = (p) => Object.entries(p)
  .filter(([, v]) => v !== undefined && v !== null && v !== '')
  .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  .join('&');

const trimTrailingSlash = (s) => String(s || '').replace(/\/+$/, '');

function isDirectExecution() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

function baseUrl(p = {}) {
  return trimTrailingSlash(DEFAULT_BASE_URL);
}

function requireParam(p, name, command) {
  if (p[name] === undefined || p[name] === null || p[name] === '') {
    throw Object.assign(new Error(`${command}: missing required param "${name}"`), { exitCode: 1 });
  }
  return p[name];
}

function slugsFromParams(p) {
  if (Array.isArray(p.slugs)) return p.slugs;
  if (typeof p.slug === 'string' && p.slug) return [p.slug];
  throw Object.assign(new Error('resolve-by-slug: missing required param "slug" or "slugs"'), { exitCode: 1 });
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function toMatchOption(match) {
  return {
    slug: match.event_slug,
    canonical_match_id: match.canonical_match_id,
    home_team: match.home_team?.name,
    away_team: match.away_team?.name,
    kickoff_at: match.kickoff_at,
    match_date: match.match_date,
    status: match.status,
    tournament: match.tournament,
    stage: match.stage,
    group_code: match.group_code,
  };
}

function validateRecomputeSignals(signals) {
  if (!Array.isArray(signals)) return;
  for (const [index, signal] of signals.entries()) {
    if (!signal?.signal_id) {
      throw Object.assign(new Error(`recompute-final: signals[${index}] missing required param "signal_id"`), { exitCode: 1 });
    }
    if (signal.team_side !== 'home' && signal.team_side !== 'away') {
      throw Object.assign(new Error(`recompute-final: signals[${index}] must include team_side "home" or "away" from prediction.data.signals[]`), { exitCode: 1 });
    }
  }
}

function validatePredictionPlatform(platform) {
  if (platform == null || platform === '') return undefined;
  if (platform !== 'PREDICT_FUN') {
    throw Object.assign(new Error('prediction: optional platform currently supports only "PREDICT_FUN"'), { exitCode: 1 });
  }
  return platform;
}

async function call({ url, method = 'GET', body, headers = {} }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const opts = { method, headers: { ...UA, ...headers }, signal: ctrl.signal };
  if (method === 'POST') {
    opts.headers['content-type'] = 'application/json';
    opts.body = JSON.stringify(body || {});
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    clearTimeout(timer);
    const reason = err?.cause?.code ? `: ${err.cause.code}` : '';
    throw Object.assign(new Error(`Network request failed${reason}`), { exitCode: 3 });
  }
  clearTimeout(timer);

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; }
  catch { data = text; }

  if (res.status >= 400) {
    throw Object.assign(new Error(`HTTP ${res.status}`), { exitCode: 1, body: data });
  }
  return data;
}

async function recentMatchOptions(p) {
  const recent = await call(COMMANDS['recent-unfinished'](p));
  const slugs = Array.isArray(recent?.data) ? recent.data : [];
  const limit = p.limit == null ? slugs.length : Number(p.limit);
  const selectedSlugs = Number.isFinite(limit) && limit > 0 ? slugs.slice(0, limit) : slugs;
  const matches = [];
  for (const batch of chunk(selectedSlugs, 50)) {
    const resolved = await call(COMMANDS['resolve-by-slug']({ ...p, slugs: batch }));
    if (Array.isArray(resolved?.data)) matches.push(...resolved.data);
  }
  return {
    code: recent?.code,
    message: recent?.message,
    messageDetail: recent?.messageDetail,
    data: matches.map(toMatchOption),
    success: recent?.success,
  };
}

function stripInternalMarketFields(result) {
  if (result?.data && typeof result.data === 'object') {
    delete result.data.vendor;
  }
  return result;
}

function stripBase64Fields(value) {
  if (Array.isArray(value)) return value.map(stripBase64Fields);
  if (!value || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) {
    if (key === 'flag_image' || key === 'flag_mime_type') {
      delete value[key];
    } else {
      value[key] = stripBase64Fields(value[key]);
    }
  }
  return value;
}

const COMMANDS = {
  'recent-unfinished': (p) => {
    return {
      url: `${baseUrl(p)}/v1/public/wc-assistant/match/recent-unfinished`,
    };
  },

  'recent-match-options': {
    run: recentMatchOptions,
  },

  'resolve-by-slug': (p) => ({
    url: `${baseUrl(p)}/v1/public/wc-assistant/match/resolve-by-slug`,
    method: 'POST',
    body: { slugs: slugsFromParams(p).slice(0, 50) },
  }),

  prediction: (p) => {
    const cmid = requireParam(p, 'cmid', 'prediction');
    const query = qs({ platform: validatePredictionPlatform(p.platform) });
    return {
      url: `${baseUrl(p)}/v1/public/wc-assistant/match/prediction/${encodeURIComponent(cmid)}${query ? `?${query}` : ''}`,
    };
  },

  'news-insights': (p) => {
    const cmid = requireParam(p, 'cmid', 'news-insights');
    return {
      url: `${baseUrl(p)}/v1/public/wc-assistant/match/news-insights/${encodeURIComponent(cmid)}`,
    };
  },

  'recompute-final': (p) => {
    const cmid = requireParam(p, 'cmid', 'recompute-final');
    const body = {};
    if (Array.isArray(p.signals)) {
      validateRecomputeSignals(p.signals);
      body.signals = p.signals;
    }
    return {
      url: `${baseUrl(p)}/v1/public/wc-assistant/match/recompute-final/${encodeURIComponent(cmid)}`,
      method: 'POST',
      body,
    };
  },

  'master-analysis': (p) => {
    const cmid = requireParam(p, 'cmid', 'master-analysis');
    return {
      url: `${baseUrl(p)}/v1/public/wc-assistant/match/master-analysis/${encodeURIComponent(cmid)}`,
    };
  },

  'market-detail-by-slug': (p) => ({
    url: `${baseUrl(p)}/v1/public/wallet-direct/prediction/web/market/detail-by-slug`,
    method: 'POST',
    body: { slug: requireParam(p, 'slug', 'market-detail-by-slug') },
  }),
};

if (isDirectExecution()) {
  const [cmd, paramsStr] = process.argv.slice(2);

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log("Usage: node cli.mjs <command> '<json_params>'\n\nCommands:");
    for (const name of Object.keys(COMMANDS)) console.log(`  ${name}`);
    process.exit(0);
  }

  const builder = COMMANDS[cmd];
  if (!builder) {
    console.error(`Unknown command: ${cmd}\nRun with --help to see available commands.`);
    process.exit(1);
  }

  let params = {};
  if (paramsStr) {
    try { params = JSON.parse(paramsStr); }
    catch { console.error('Invalid JSON params'); process.exit(1); }
  }

  try {
    let result = typeof builder === 'function' ? await call(builder(params)) : await builder.run(params);
    result = stripBase64Fields(result);
    if (cmd === 'market-detail-by-slug') result = stripInternalMarketFields(result);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err.message);
    if (err.body) console.log(JSON.stringify(err.body, null, 2));
    process.exit(err.exitCode || 1);
  }
}
