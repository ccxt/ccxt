// The playground server runs egress-locked: an internal Docker network with no direct
// internet, all outbound forced through the squid egress proxy (its HTTP_PROXY /
// HTTPS_PROXY / NO_PROXY env vars are set on the container). Node's global fetch (undici)
// does NOT honour those env vars by default, so server-side calls to OpenRouter for the
// AI assistant failed with `EAI_AGAIN openrouter.ai`. Install an env-aware global
// dispatcher so fetch routes through the proxy (and still bypasses NO_PROXY hosts).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    // webpackIgnore: `next dev` also builds instrumentation for the edge compiler, which
    // has no `node:` scheme externals, so bundling undici's barrel (index.js -> lib/mock/*
    // -> node:console) fails with UnhandledSchemeError and 500s every route. Leaving the
    // specifier to Node's own loader keeps this a plain runtime import.
    const { setGlobalDispatcher, EnvHttpProxyAgent } = await import(/* webpackIgnore: true */ 'undici');
    setGlobalDispatcher(new EnvHttpProxyAgent());
  }
  // Warm the free-model list once at boot (after the dispatcher above, so it
  // goes through the proxy). Fire-and-forget: a failure must not break boot.
  void import('@/lib/ai/openrouter')
    .then((m) => m.getFreeModels())
    .catch(() => {});
}
