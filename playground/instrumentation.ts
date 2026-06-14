// The playground server runs egress-locked: an internal Docker network with no direct
// internet, all outbound forced through the squid egress proxy (its HTTP_PROXY /
// HTTPS_PROXY / NO_PROXY env vars are set on the container). Node's global fetch (undici)
// does NOT honour those env vars by default, so server-side calls to OpenRouter for the
// AI assistant failed with `EAI_AGAIN openrouter.ai`. Install an env-aware global
// dispatcher so fetch routes through the proxy (and still bypasses NO_PROXY hosts).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.HTTP_PROXY && !process.env.HTTPS_PROXY) return;
  const { setGlobalDispatcher, EnvHttpProxyAgent } = await import('undici');
  setGlobalDispatcher(new EnvHttpProxyAgent());
}
