import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CCXT Playground",
  description:
    "Run CCXT against live public exchange endpoints in JavaScript, Python and PHP — with an AI assistant.",
};

// Runs before paint: pick saved theme, else system preference, else dark.
// Prevents a flash of the wrong theme on first load.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

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
