// The playground server runs egress-locked: an internal Docker network with no direct
// internet, all outbound forced through the squid egress proxy (its HTTP_PROXY /
// HTTPS_PROXY / NO_PROXY env vars are set on the container). Node's global fetch (undici)
// does NOT honour those env vars by default, so server-side outbound calls failed with
// `EAI_AGAIN`. Install an env-aware global dispatcher so fetch routes through the proxy
// — and, importantly, still bypasses NO_PROXY hosts, which is how the assistant reaches
// PLAYGROUND_AI_URL on the deployment's own network rather than via the egress proxy.
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
}
