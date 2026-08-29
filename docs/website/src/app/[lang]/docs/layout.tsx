import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import { MessageCircleIcon } from 'lucide-react';

export default async function Layout({ params, children }: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;
  // Show "Ask AI" only when enabled at build AND the OpenRouter key is present at runtime
  // (read per-render) — otherwise the button would render and then fail on first message.
  const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === 'true' && Boolean(process.env.OPENROUTER_API_KEY);
  return (
    // tabs={false}: drop the redundant sidebar root-switcher dropdown — the
    // Guide/Exchanges/Examples navbar links (baseOptions) already switch sections.
    // The sidebar still scopes to the active section by URL.
    <DocsLayout tree={source.getPageTree(lang)} tabs={false} {...baseOptions(lang)}>
      {aiEnabled ? (
        <AISearch>
          <AISearchPanel />
          <AISearchTrigger
            position="float"
            className={cn(buttonVariants({ variant: 'secondary' }), 'text-fd-muted-foreground rounded-2xl')}
          >
            <MessageCircleIcon className="size-4" />
            Ask AI
          </AISearchTrigger>
        </AISearch>
      ) : null}
      {children}
    </DocsLayout>
  );
}
