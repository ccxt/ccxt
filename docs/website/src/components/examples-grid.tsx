import Link from 'next/link';
import type { IconType } from 'react-icons';
import { SiJavascript, SiPython, SiTypescript, SiPhp, SiGo } from 'react-icons/si';
import { TbBrandCSharp } from 'react-icons/tb';
import { DiJava } from 'react-icons/di';

// Language chooser for the /docs/examples landing — a card grid with brand logos.
const LANGS: { id: string; name: string; blurb: string; Icon: IconType; color: string }[] = [
  { id: 'js', name: 'JavaScript', blurb: 'Node.js and the browser', Icon: SiJavascript, color: '#F7DF1E' },
  { id: 'ts', name: 'TypeScript', blurb: 'Typed, for Node and bundlers', Icon: SiTypescript, color: '#3178C6' },
  { id: 'py', name: 'Python', blurb: 'Sync and async (asyncio)', Icon: SiPython, color: '#3776AB' },
  { id: 'php', name: 'PHP', blurb: 'Sync and async (ReactPHP)', Icon: SiPhp, color: '#777BB4' },
  { id: 'cs', name: 'C#', blurb: '.NET examples', Icon: TbBrandCSharp, color: '#9B4F96' },
  { id: 'go', name: 'Go', blurb: 'Go modules', Icon: SiGo, color: '#00ADD8' },
  { id: 'java', name: 'Java', blurb: 'Java (JVM)', Icon: DiJava, color: '#E76F00' },
];

export function ExamplesGrid() {
  return (
    <div className="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
      {LANGS.map(({ id, name, blurb, Icon, color }) => (
        <Link
          key={id}
          href={`/docs/examples/${id}`}
          className="flex items-center gap-4 rounded-xl border bg-fd-card p-4 transition-colors hover:bg-fd-accent"
        >
          <span
            className="grid size-11 shrink-0 place-items-center rounded-lg border"
            style={{ backgroundColor: `${color}1a`, borderColor: `${color}40` }}
          >
            <Icon size={24} style={{ color }} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-fd-foreground">{name} Examples</span>
            <span className="block text-sm text-fd-muted-foreground">{blurb}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
