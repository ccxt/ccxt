"use client";

import dynamic from "next/dynamic";
import type { Language } from "@/lib/languages";
import { apiUrl } from "@/lib/basePath";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 16, color: "hsl(var(--muted-foreground))" }}>Loading editor…</div>
  ),
});

// Load CCXT's type declarations into Monaco's built-in TypeScript service once,
// so JS/TS get IntelliSense (`exchange.` lists every unified method). No LSP.
let ccxtTypesConfigured = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function configureCcxtTypes(monaco: any) {
  if (ccxtTypesConfigured) return;
  ccxtTypesConfigured = true;
  try {
    const res = await fetch(apiUrl("/api/ccxt-types"));
    if (!res.ok) throw new Error(`types ${res.status}`);
    const { libs, entry, packageJson } = (await res.json()) as {
      libs: { uri: string; content: string }[];
      entry: string;
      packageJson: string;
    };
    const ts = monaco.languages.typescript;
    for (const defaults of [ts.typescriptDefaults, ts.javascriptDefaults]) {
      defaults.setCompilerOptions({
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowJs: true,
        allowNonTsExtensions: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noEmit: true,
        strict: false,
      });
      // Completions without red squiggles — a playground shouldn't nag about types.
      defaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
      defaults.addExtraLib(packageJson, "file:///node_modules/ccxt/package.json");
      defaults.addExtraLib(entry, "file:///node_modules/ccxt/js/ccxt.d.ts");
      for (const lib of libs) defaults.addExtraLib(lib.content, lib.uri);
    }
  } catch {
    ccxtTypesConfigured = false; // allow a retry on next mount
  }
}

export default function Editor({
  language,
  value,
  onChange,
  onRun,
  theme,
}: {
  language: Language;
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  theme: "light" | "dark";
}) {
  return (
    <div className="editor-wrap">
      <Monaco
        language={language.monaco}
        // Root-level file:// path so Monaco's TS module resolver can find the
        // virtual file:///node_modules/ccxt declarations for `import 'ccxt'`.
        path={`file:///main.${language.ext}`}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={(monaco) => {
          void configureCcxtTypes(monaco);
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
          // Monaco frequently mis-measures its flex/grid container on first mount
          // (renders a few px tall) and `automaticLayout` only corrects on a later
          // resize. Force a layout against the settled container, and keep one
          // ResizeObserver as a backstop.
          const node = editor.getContainerDomNode();
          const relayout = () => editor.layout();
          requestAnimationFrame(relayout);
          setTimeout(relayout, 50);
          const parent = node?.parentElement;
          if (parent) {
            const ro = new ResizeObserver(relayout);
            ro.observe(parent);
            editor.onDidDispose(() => ro.disconnect());
          }
        }}
        options={{
          fontSize: 13.5,
          fontFamily: "var(--mono)",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 14 },
          smoothScrolling: true,
          renderLineHighlight: "line",
          lineNumbersMinChars: 3,
          tabSize: 4,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
