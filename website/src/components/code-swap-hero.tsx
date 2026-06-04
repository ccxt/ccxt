'use client';

// CCXT "Code Swap" hero — change one token (ccxt.binance() -> ccxt.coinbase())
// and the unified response re-routes to a different venue. Same code, any exchange.
// Auto-cycles; click any exchange to swap; pick a language to see the same call in
// TS / Python / PHP / Go / C# / Java. Adapted from a self-contained HTML/CSS/JS
// animation into a React client component for this Fumadocs (Tailwind v4) stack.
// Theming follows the Fumadocs light/dark theme (fd- tokens / .dark class).

import { useCallback, useEffect, useRef, useState } from 'react';
import { CcxtMark } from './ccxt-mark';

type Exchange = readonly [id: string, label: string, color: string, price: number];
type Lang = readonly [id: string, label: string, file: string];

const EXCH: readonly Exchange[] = [
  ['binance', 'Binance', '#F0B90B', 67214.5],
  ['coinbase', 'Coinbase', '#0052FF', 67198.2],
  ['kraken', 'Kraken', '#7132F5', 67225.8],
  ['okx', 'OKX', '#7C8593', 67209.1],
  ['bybit', 'Bybit', '#F7A600', 67231.4],
  ['kucoin', 'KuCoin', '#22D3A6', 67188.9],
  ['gate', 'Gate.io', '#E6004C', 67242.0],
  ['bitget', 'Bitget', '#00E0D5', 67203.3],
] as const;

const LANGS: readonly Lang[] = [
  ['ts', 'TypeScript', 'strategy.ts'],
  ['py', 'Python', 'strategy.py'],
  ['php', 'PHP', 'strategy.php'],
  ['go', 'Go', 'strategy.go'],
  ['cs', 'C#', 'Strategy.cs'],
  ['java', 'Java', 'Strategy.java'],
] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function tokText(langId: string, exId: string) {
  if (langId === 'go') return 'New' + cap(exId);
  if (langId === 'java') return cap(exId);
  return exId;
}

// Build the code snippet as React nodes; `tokenNode` is the live, animated token.
function CodeSnippet({
  langId,
  tokenNode,
}: {
  langId: string;
  tokenNode: React.ReactNode;
}) {
  const K = (t: string) => <span className="csh-k">{t}</span>;
  const FN = (t: string) => <span className="csh-fn">{t}</span>;
  const STR = (t: string) => <span className="csh-str">{t}</span>;
  const COM = (t: string) => <span className="csh-com">{t}</span>;
  const PUN = (t: string) => <span className="csh-pun">{t}</span>;

  switch (langId) {
    case 'py':
      return (
        <>
          {COM('# one unified API — pick any venue')}
          {'\n'}
          {K('import')} ccxt{'\n\n'}
          ex {PUN('=')} ccxt.{tokenNode}
          {PUN('()')}
          {'\n'}t {' '}
          {PUN('=')} ex.{FN('fetch_ticker')}
          {PUN('(')}
          {STR("'BTC/USDT'")}
          {PUN(')')}
        </>
      );
    case 'php':
      return (
        <>
          {COM('// one unified API — pick any venue')}
          {'\n'}
          {K('use')} {FN('ccxt')}
          {PUN(';')}
          {'\n\n'}
          {K('$ex')} {PUN('=')} {K('new')} \ccxt\{tokenNode}
          {PUN('();')}
          {'\n'}
          {K('$t')} {' '}
          {PUN('=')} {K('$ex')}
          {PUN('->')}
          {FN('fetch_ticker')}
          {PUN('(')}
          {STR("'BTC/USDT'")}
          {PUN(');')}
        </>
      );
    case 'go':
      return (
        <>
          {COM('// one unified API — pick any venue')}
          {'\n'}
          {K('import')} ccxt {STR('"github.com/ccxt/ccxt/go/v4"')}
          {'\n\n'}ex {PUN(':=')} ccxt.{tokenNode}
          {PUN('(')}
          {K('nil')}
          {PUN(')')}
          {'\n'}t{PUN(',')} _ {PUN(':=')} ex.{FN('FetchTicker')}
          {PUN('(')}
          {STR('"BTC/USDT"')}
          {PUN(')')}
        </>
      );
    case 'cs':
      return (
        <>
          {COM('// one unified API — pick any venue')}
          {'\n'}
          {K('using')} ccxt{PUN(';')}
          {'\n\n'}
          {K('var')} ex {PUN('=')} {K('new')} ccxt.{tokenNode}
          {PUN('();')}
          {'\n'}
          {K('var')} t {' '}
          {PUN('=')} {K('await')} ex.{FN('FetchTicker')}
          {PUN('(')}
          {STR('"BTC/USDT"')}
          {PUN(');')}
        </>
      );
    case 'java':
      return (
        <>
          {COM('// one unified API — pick any venue')}
          {'\n'}
          {K('import')} ccxt{PUN('.*;')}
          {'\n\n'}
          {K('var')} ex {PUN('=')} {K('new')} {tokenNode}
          {PUN('();')}
          {'\n'}Ticker t {PUN('=')} ex.{FN('fetchTicker')}
          {PUN('(')}
          {STR('"BTC/USDT"')}
          {PUN(')')}
          {PUN(';')}
        </>
      );
    default:
      return (
        <>
          {COM('// one unified API — pick any venue')}
          {'\n'}
          {K('import')} ccxt {K('from')} {STR("'ccxt'")}
          {'\n\n'}
          {K('const')} ex {PUN('=')} {K('new')} ccxt.{tokenNode}
          {PUN('()')}
          {'\n'}
          {K('const')} t {' '}
          {PUN('=')} {K('await')} ex.{FN('fetchTicker')}
          {PUN('(')}
          {STR("'BTC/USDT'")}
          {PUN(')')}
        </>
      );
  }
}

export function CodeSwapHero() {
  const [cur, setCur] = useState(0);
  const [curLang, setCurLang] = useState(0);
  const [tokenText, setTokenText] = useState(tokText('ts', EXCH[0][0]));
  const [typing, setTyping] = useState(false);
  const [price, setPrice] = useState(EXCH[0][3]);

  const curRef = useRef(cur);
  const curLangRef = useRef(curLang);
  curRef.current = cur;
  curLangRef.current = curLang;

  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useRef(false);

  // beam: a glowing line + traveling comet drawn from the active exchange chip up to
  // the swapping token in the code, colored by the exchange's brand color (--bm).
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<HTMLSpanElement | null>(null);
  const excRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const beamSvgRef = useRef<SVGSVGElement | null>(null);
  const beamBaseRef = useRef<SVGPathElement | null>(null);
  const beamFlowRef = useRef<SVGPathElement | null>(null);
  const cometRef = useRef<SVGCircleElement | null>(null);

  const ex = EXCH[cur];
  const lang = LANGS[curLang];

  // animate the token text: delete old name, type new name
  const typeSwap = useCallback((from: string, to: string) => {
    typeTimers.current.forEach(clearTimeout);
    typeTimers.current = [];
    if (reduceMotion.current) {
      setTokenText(to);
      setTyping(false);
      return;
    }
    setTyping(true);
    let i = from.length;
    const del = () => {
      if (i > 0) {
        setTokenText(from.slice(0, i - 1));
        i -= 1;
        typeTimers.current.push(setTimeout(del, 32));
      } else {
        let j = 0;
        const ins = () => {
          if (j < to.length) {
            setTokenText(to.slice(0, j + 1));
            j += 1;
            typeTimers.current.push(setTimeout(ins, 50));
          } else {
            setTyping(false);
          }
        };
        ins();
      }
    };
    del();
  }, []);

  // animate price count-up
  const countUp = useCallback((toVal: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (reduceMotion.current) {
      setPrice(toVal);
      return;
    }
    const from = price;
    const start = performance.now();
    const dur = 520;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setPrice(from + (toVal - from) * e);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const selectIdx = useCallback(
    (idx: number, userInitiated: boolean) => {
      const prev = EXCH[curRef.current];
      if (idx === curRef.current && userInitiated) return;
      const next = EXCH[idx];
      typeSwap(
        tokText(LANGS[curLangRef.current][0], prev[0]),
        tokText(LANGS[curLangRef.current][0], next[0]),
      );
      setCur(idx);
      countUp(next[3]);
      if (userInitiated) restartAuto();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeSwap, countUp],
  );

  const nextAuto = useCallback(() => {
    selectIdx((curRef.current + 1) % EXCH.length, false);
  }, [selectIdx]);

  const restartAuto = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    if (reduceMotion.current) return;
    autoTimer.current = setInterval(() => {
      if (!document.hidden) nextAuto();
    }, 2900);
  }, [nextAuto]);

  // pause auto-cycling while the user is reading/interacting (hover or keyboard focus)
  const pauseAuto = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = null;
  }, []);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    restartAuto();
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      typeTimers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw + animate the beam every frame so it tracks swaps, typing, theme and resize
  useEffect(() => {
    const svg = beamSvgRef.current;
    const base = beamBaseRef.current;
    const flow = beamFlowRef.current;
    const comet = cometRef.current;
    if (!svg || !base || !flow || !comet) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = () => {
      const stage = stageRef.current;
      const token = tokenRef.current;
      const btn = excRefs.current[curRef.current];
      if (!stage || !token || !btn) return false;
      const sr = stage.getBoundingClientRect();
      if (sr.width === 0) return false;
      const br = btn.getBoundingClientRect();
      const tr = token.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
      const x1 = br.left - sr.left + br.width / 2;
      const y1 = br.top - sr.top;
      const x2 = tr.left - sr.left + tr.width / 2;
      const y2 = tr.bottom - sr.top;
      const midY = (y1 + y2) / 2;
      const d = `M${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`;
      base.setAttribute('d', d);
      flow.setAttribute('d', d);
      return true;
    };

    if (reduce) {
      draw();
      comet.style.display = 'none';
      return;
    }

    // Only do the per-frame layout work when the beam is actually visible: not on a
    // backgrounded tab, not on mobile (<=760px, where the beam is display:none), and
    // not while scrolled out of view. The rAF keeps ticking cheaply so it resumes.
    const mq = window.matchMedia('(max-width: 760px)');
    let hiddenByWidth = mq.matches;
    const onMq = () => (hiddenByWidth = mq.matches);
    mq.addEventListener('change', onMq);
    let onScreen = true;
    const io = new IntersectionObserver(
      (entries) => (onScreen = entries[0]?.isIntersecting ?? true),
      { rootMargin: '120px' },
    );
    if (stageRef.current) io.observe(stageRef.current);

    let raf = 0;
    let dash = 0;
    let t = 0;
    const tick = () => {
      if (!document.hidden && !hiddenByWidth && onScreen && draw()) {
        dash = (dash + 0.7) % 1000;
        flow.setAttribute('stroke-dashoffset', String(dash));
        const len = flow.getTotalLength();
        if (len > 0) {
          t = (t + 1 / 72) % 1; // ~1.2s per pass at 60fps
          const pt = flow.getPointAtLength(len * (1 - t));
          comet.setAttribute('cx', String(pt.x));
          comet.setAttribute('cy', String(pt.y));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener('change', onMq);
      io.disconnect();
    };
  }, []);

  // when language changes, re-render the token text for the current exchange
  const onLang = (idx: number) => {
    if (idx === curLang) return;
    setCurLang(idx);
    setTokenText(tokText(LANGS[idx][0], EXCH[curRef.current][0]));
  };

  const tokenNode = (
    <span
      ref={tokenRef}
      className={`csh-tok${typing ? ' csh-typing' : ''}`}
      style={{ ['--exc' as string]: ex[2] }}
    >
      <span>{tokenText}</span>
      <span className="csh-caret" />
    </span>
  );

  const baLow = (price - 1.5).toFixed(1);
  const baHigh = (price + 0.5).toFixed(1);

  return (
    <div className="csh-root">
      <div
        className="csh-stage"
        ref={stageRef}
        onMouseEnter={pauseAuto}
        onMouseLeave={restartAuto}
        onFocusCapture={pauseAuto}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) restartAuto();
        }}
      >
        <svg
          ref={beamSvgRef}
          className="csh-beam"
          aria-hidden="true"
          style={{ ['--bm' as string]: ex[2] }}
        >
          <path ref={beamBaseRef} className="csh-beam-base" d="" />
          <path ref={beamFlowRef} className="csh-beam-flow" d="" />
          <circle ref={cometRef} className="csh-beam-comet" r={3.2} />
        </svg>
        <div className="csh-cards">
          {/* editor card */}
          <div className="csh-card" style={{ ['--exc' as string]: ex[2] }}>
            <div className="csh-ch">
              <span className="csh-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="csh-name">{lang[2]}</span>
              <span className="csh-pill">
                <CcxtMark className="csh-pill-mark" /> ccxt
              </span>
            </div>
            <div className="csh-langs" aria-label="Language">
              {LANGS.map((l, idx) => (
                <button
                  key={l[0]}
                  type="button"
                  aria-pressed={idx === curLang}
                  className={`csh-lang${idx === curLang ? ' csh-active' : ''}`}
                  onClick={() => onLang(idx)}
                >
                  {l[1]}
                </button>
              ))}
            </div>
            <pre className="csh-pre">
              <code>
                <CodeSnippet langId={lang[0]} tokenNode={tokenNode} />
              </code>
            </pre>
          </div>

          {/* response card */}
          <div className="csh-card csh-resp">
            <div className="csh-ch">
              <span className="csh-name">response · unified</span>
            </div>
            <div className="csh-resp-body">
              <div className="csh-row">
                <span className="csh-key">symbol</span>
                <span className="csh-v">&quot;BTC/USDT&quot;</span>
              </div>
              <div className="csh-row">
                <span className="csh-key">last</span>
                <span className="csh-v csh-num">{price.toFixed(2)}</span>
              </div>
              <div className="csh-row">
                <span className="csh-key">bid / ask</span>
                <span className="csh-v">
                  {baLow} / {baHigh}
                </span>
              </div>
              <div className="csh-row">
                <span className="csh-key">exchange</span>
                <span
                  className="csh-v csh-venue"
                  style={{ ['--exc' as string]: ex[2] }}
                >
                  <span className="csh-vd" />
                  {ex[0]}
                </span>
              </div>
              <div className="csh-ok">
                <span className="csh-live" /> identical shape, every exchange
              </div>
            </div>
          </div>
        </div>

        {/* exchange picker */}
        <div className="csh-picker" aria-label="Exchange">
          {EXCH.map((e, idx) => (
            <button
              key={e[0]}
              ref={(el) => {
                excRefs.current[idx] = el;
              }}
              type="button"
              aria-pressed={idx === cur}
              aria-label={`Show ${e[1]} example`}
              className={`csh-exc${idx === cur ? ' csh-active' : ''}`}
              style={{ ['--exc' as string]: e[2] }}
              onClick={() => selectIdx(idx, true)}
            >
              <span className="csh-exc-dot" />
              <span className="csh-exc-lbl">{e[1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
