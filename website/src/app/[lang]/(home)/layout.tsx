import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import { MessageCircleIcon } from 'lucide-react';

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  // Same "Ask AI" widget as the docs — so visitors can try it straight from the homepage.
  // The home page is statically prerendered, so we can't read the runtime key here (it'd
  // evaluate at build); gate on the build flag only. The /api/chat route still returns a
  // clean 503 if the key is ever missing, and the box always provides it.
  const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
  return (
    <HomeLayout {...baseOptions(lang)}>
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
    </HomeLayout>
  );
}
