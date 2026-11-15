'use client';

// Brand mark for fumadocs `slots.navTitle`. Fumadocs passes slots into client
// layout chrome, so this has to be a client module reference — an inline function
// from the server-side baseOptions() cannot cross the RSC boundary.
import type { ComponentProps } from 'react';
import { CcxtMark } from '@/components/ccxt-mark';
import { appName } from '@/lib/shared';

export function CcxtNavTitle({ className }: ComponentProps<'a'>) {
  return (
    <a href="https://ccxt.com" className={className}>
      <CcxtMark className="size-5" />
      <span className="font-semibold">{appName}</span>
    </a>
  );
}
