'use client';

// Small dismissible bottom-right toast pointing users to the CCXT survey.
// The whole card is a link to the survey; the × button only dismisses.
// Shows once per browser: dismissing it (or clicking through) sets a
// localStorage flag so it never comes back.

import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';

const SHOW_DELAY_MS = 0;
const SURVEY_URL = 'https://ccxt.com/survey/?utm_source=docs.ccxt.com';

export function SurveyPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // try {
    //   if (localStorage.getItem(STORAGE_KEY)) return;
    // } catch {
    //   // localStorage unavailable (private mode) — still show, just without persistence
    // }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    // try {
    //   localStorage.setItem(STORAGE_KEY, '1');
    // } catch {
    //   // ignore
    // }
  };

  if (!visible) return null;

  return (
    <a
      href={SURVEY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={dismiss}
      aria-label="CCXT survey invitation"
      // bottom-20 clears the floating "Ask AI" trigger (fixed bottom-4, ~3rem tall)
      // rendered by the home/docs layouts so the popup never covers it.
      className="fixed right-4 bottom-20 left-4 z-50 block max-w-xs rounded-lg border bg-fd-card p-4 pr-8 text-sm text-fd-card-foreground shadow-lg transition-colors hover:border-fd-primary/50 hover:bg-fd-accent sm:left-auto"
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        className="absolute top-2 right-2 rounded p-1 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        <XIcon className="size-4" />
      </button>
      🚀 We&apos;re building something new —{' '}
      <span className="font-semibold text-fd-primary underline-offset-2">
        fill in this short survey
      </span>{' '}
      to get early access.
    </a>
  );
}
