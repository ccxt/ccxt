import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { CcxtMark } from '@/components/ccxt-mark';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <CcxtMark className="size-5" />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
    // Always-visible section nav so you can jump between the Guide, per-exchange
    // reference, and code Examples from any page (the sidebar root switcher alone isn't
    // obvious). URLs are basePath-aware via Next <Link>.
    links: [
      { text: 'Guide', url: '/docs' },
      { text: 'Exchanges', url: '/docs/exchanges/binance' },
      { text: 'Examples', url: '/docs/examples' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
