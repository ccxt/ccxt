import type { Metadata } from 'next';
import Link from 'next/link';
import { SiDiscord, SiGithub, SiTelegram, SiX } from 'react-icons/si';
import { MailIcon } from 'lucide-react';
import { gitConfig } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Contact — CCXT',
  description: 'How to reach the CCXT team — email, Discord and Telegram.',
};

const CHANNELS: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  external?: boolean;
}[] = [
  {
    href: 'mailto:info@ccxt.trade',
    icon: <MailIcon className="size-5" />,
    title: 'info@ccxt.trade',
    description: 'Business inquiries, partnerships, certification or anything that needs a private channel.',
  },
  {
    href: 'https://discord.gg/ccxt',
    icon: <SiDiscord className="size-5 text-[#5865F2]" />,
    title: 'Discord',
    description: 'The official CCXT Discord server — technical discussion, support and community help.',
    external: true,
  },
  {
    href: 'https://t.me/ccxt_chat',
    icon: <SiTelegram className="size-5 text-[#26A5E4]" />,
    title: 'Telegram Chat',
    description: 'CCXT Chat on Telegram — technical support and community chat.',
    external: true,
  },
  {
    href: 'https://t.me/ccxt_announcements',
    icon: <SiTelegram className="size-5 text-[#26A5E4]" />,
    title: 'Telegram Channel',
    description: 'CCXT Channel on Telegram — important announcements: releases and breaking changes.',
    external: true,
  },
  {
    href: `https://github.com/${gitConfig.user}/${gitConfig.repo}/issues`,
    icon: <SiGithub className="size-5" />,
    title: 'GitHub Issues',
    description: 'Bug reports and feature requests — please read the FAQ and CONTRIBUTING guidelines first.',
    external: true,
  },
  {
    href: 'https://x.com/ccxt_official',
    icon: <SiX className="size-5" />,
    title: 'X (Twitter)',
    description: 'Follow @ccxt_official for news and updates.',
    external: true,
  },
];

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 sm:pt-10 sm:pb-20">
      <div className="mb-10 flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
        <p className="mt-5 max-w-xl text-fd-muted-foreground">
          Reach the CCXT team by email or join the official community channels.
        </p>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="rounded-lg border p-4 transition-colors hover:bg-fd-accent"
          >
            <h2 className="mb-1 inline-flex items-center gap-2 font-semibold">
              {c.icon}
              {c.title}
            </h2>
            <p className="text-sm text-fd-muted-foreground">{c.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
