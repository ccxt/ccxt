'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { basePath } from '@/lib/shared';

// Small dismissible promo card pinned to the bottom-start corner (the AI search
// trigger owns the bottom-end corner). Banners are 16:9 cards: stacked on desktop,
// side by side on phones, sharing one close button. To run different campaigns,
// edit `banners` and change `id` so visitors who closed the previous set see the
// new one.
const id = 'bithumb-2026-11';

const banners = [
  {
    href: 'https://feed.bithumb.com/notice/1653746?utm_source=docs.ccxt.com',
    image: '/images/campaigns/bithumb-api-trading-event.png',
    alt: 'Bithumb API Trading Event: trade with CCXT on Bithumb with zero fees',
  },
  {
    href: 'https://feed.bithumb.com/notice/1653910?utm_source=docs.ccxt.com',
    image: '/images/campaigns/bithumb-vip-matching-program.png',
    alt: 'Bithumb VIP Matching Program: your track record on other exchanges is recognised on Bithumb',
  },
];

// every banner is exported at this size; set explicitly to avoid layout shift
const bannerWidth = 960;
const bannerHeight = 540;

const storageKey = `ccxt-campaign-dismissed:${id}`;

// shown to visitors on the Korean docs (/ko) or with a Seoul browser timezone
const targetLang = 'ko';
const targetTimeZone: string | undefined = 'Asia/Seoul';

function isTargetAudience(lang: string): boolean {
  if (targetTimeZone === undefined) return true;
  if (lang === targetLang) return true;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === targetTimeZone;
  } catch {
    return false;
  }
}

export function CampaignPopup({ lang }: { lang: string }) {
  // Hidden on the server and on first paint: the timezone and the dismissed flag
  // are only known in the browser, so rendering eagerly would flash for everyone else.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isTargetAudience(lang)) {
      setOpen(false);
      return;
    }
    try {
      if (localStorage.getItem(storageKey) === '1') return;
    } catch {
      // storage blocked (private mode) — still show, it just won't be remembered
    }
    setOpen(true);
  }, [lang]);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
  };

  return (
    <aside
      aria-label="Promotion"
      className="fixed z-20 bottom-20 inset-x-4 sm:bottom-4 sm:inset-x-auto sm:start-4 sm:w-[300px] flex flex-row sm:flex-col gap-px overflow-hidden rounded-xl border bg-fd-border shadow-lg animate-fd-fade-in"
    >
      {banners.map((banner) => (
        <a
          key={banner.href}
          href={banner.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block flex-1 min-w-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}${banner.image}`}
            alt={banner.alt}
            width={bannerWidth}
            height={bannerHeight}
            className="block w-full h-auto"
          />
        </a>
      ))}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close"
        className="absolute top-1.5 end-1.5 inline-flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <X className="size-3.5" />
      </button>
    </aside>
  );
}
