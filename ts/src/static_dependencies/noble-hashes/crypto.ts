declare const globalThis: Record<string, any> | undefined;
export const crypto =
  typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;
