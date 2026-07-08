// Per-language metadata for the playground.
// Runnable languages execute in the backend sandbox (lib/runners/). Java is shown
// as a tab so users know CCXT supports it — with a one-line local install instead
// of in-browser execution (its dependency tree can't be resolved in the sandbox).

export type RunnableLanguageId = "js" | "ts" | "python" | "php" | "go" | "csharp";
export type LanguageId = RunnableLanguageId | "java";

export type Install = {
  via: string; // heading for the command block, e.g. "Terminal" or "build.gradle.kts"
  command: string;
  docs: string;
  note?: string;
};

export type Language = {
  id: LanguageId;
  label: string;
  monaco: string;
  ext: string;
  hint: string;
  available: boolean;
  // Runnable languages not covered by the shared examples fall back to this.
  defaultCode?: string;
  // Present when available === false.
  install?: Install;
  sample?: string;
};

// Languages listed here are forced install-only (not executed) — e.g. to shed
// load or protect a small shared host from a memory-heavy compiler. Comma-
// separated ids (e.g. "go" or "go,csharp"). Set the Docker build arg
// PLAYGROUND_DISABLED, which the image exposes as NEXT_PUBLIC_PLAYGROUND_DISABLED
// (read here, client + server) and PLAYGROUND_DISABLED (read by setup-runtimes.sh).
const DISABLED = new Set(
  (process.env.NEXT_PUBLIC_PLAYGROUND_DISABLED ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
const enabled = (id: string, base: boolean) => base && !DISABLED.has(id);

export const languages: Language[] = [
  {
    id: "js",
    label: "JavaScript",
    monaco: "javascript",
    ext: "mjs",
    hint: "Node.js (ESM, top-level await)",
    available: enabled("js", true),
  },
  {
    id: "ts",
    label: "TypeScript",
    monaco: "typescript",
    ext: "mts",
    hint: "Node.js native type-stripping",
    available: enabled("ts", true),
  },
  {
    id: "python",
    label: "Python",
    monaco: "python",
    ext: "py",
    hint: "CPython (synchronous ccxt)",
    available: enabled("python", true),
  },
  {
    id: "php",
    label: "PHP",
    monaco: "php",
    ext: "php",
    hint: "PHP CLI (synchronous ccxt)",
    available: enabled("php", true),
  },
  {
    id: "go",
    label: "Go",
    monaco: "go",
    ext: "go",
    hint: "compiled — runs server-side",
    available: enabled("go", true),
    install: {
      via: "Terminal",
      command: "go get github.com/ccxt/ccxt/go/v4",
      docs: "https://github.com/ccxt/ccxt/tree/master/go",
    },
    sample: `package main

import (
    "fmt"
    ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
    exchange := ccxt.NewBinance(nil)
    ticker, err := exchange.FetchTicker("BTC/USDT")
    if err != nil {
        fmt.Println("error:", err)
        return
    }
    fmt.Printf("%s  last=%v\\n", *ticker.Symbol, *ticker.Last)
}`,
    defaultCode: `package main

import (
    "fmt"
    ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
    exchange := ccxt.NewBinance(nil)
    ticker, err := exchange.FetchTicker("BTC/USDT")
    if err != nil {
        fmt.Println("error:", err)
        return
    }
    fmt.Printf("%s  last=%v  bid=%v  ask=%v\\n", *ticker.Symbol, *ticker.Last, *ticker.Bid, *ticker.Ask)
}
`,
  },
  {
    id: "csharp",
    label: "C#",
    monaco: "csharp",
    ext: "cs",
    hint: "compiled — .NET, build ~3s",
    available: enabled("csharp", true),
    install: {
      via: "Terminal",
      command: "dotnet add package ccxt",
      docs: "https://www.nuget.org/packages/ccxt",
    },
    sample: `using ccxt;

var exchange = new Binance();
var ticker = await exchange.FetchTicker("BTC/USDT");
Console.WriteLine(ticker);`,
    defaultCode: `using ccxt;

var exchange = new Binance();
var ticker = await exchange.FetchTicker("BTC/USDT");
Console.WriteLine($"{ticker.symbol}  last={ticker.last}  bid={ticker.bid}  ask={ticker.ask}");
`,
  },
  {
    id: "java",
    label: "Java",
    monaco: "java",
    ext: "java",
    hint: "compiled — run it locally (Java 21+)",
    available: false,
    install: {
      via: "build.gradle.kts",
      command: 'implementation("io.github.ccxt:ccxt:4.5.56")',
      docs: "https://central.sonatype.com/artifact/io.github.ccxt/ccxt",
      note: "Maven Central · requires Java 21+",
    },
    sample: `import io.github.ccxt.exchanges.Binance;

public class Main {
    public static void main(String[] args) {
        Binance exchange = new Binance();
        Object ticker = exchange.fetchTicker("BTC/USDT").join();
        System.out.println(ticker);
    }
}`,
  },
];

export const languageIds = languages.map((l) => l.id);

export function getLanguage(id: string): Language | undefined {
  return languages.find((l) => l.id === id);
}

export function isLanguageId(id: string): id is LanguageId {
  return languages.some((l) => l.id === id);
}

export function isRunnable(id: string): id is RunnableLanguageId {
  const lang = getLanguage(id);
  return !!lang && lang.available;
}
