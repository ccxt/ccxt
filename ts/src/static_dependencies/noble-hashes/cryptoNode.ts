import * as nc from 'node:crypto';
export const crypto =
  nc && typeof nc === 'object' && 'webcrypto' in nc ? (nc.webcrypto as any) : undefined;
