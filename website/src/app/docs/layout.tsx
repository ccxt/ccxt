import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import { MessageCircleIcon } from 'lucide-react';

// Shown only when AI is enabled at build (and OPENROUTER_API_KEY is set at runtime).
const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={source.getPageTree()} tabMode="top" {...baseOptions()}>
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
