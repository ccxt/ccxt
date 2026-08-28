import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CCXT Playground",
  description:
    "Run CCXT against live public exchange endpoints in TypeScript, Python and PHP — with an AI assistant.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Runs before paint: ?theme=light|dark wins (and is saved), else saved theme,
// else system preference, else dark. Prevents a flash of the wrong theme.
const themeScript = `(function(){try{var q=new URLSearchParams(location.search).get('theme');var t=(q==='light'||q==='dark')?q:null;if(t){try{localStorage.setItem('theme',t);}catch(e){}}if(!t){t=localStorage.getItem('theme');}if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
