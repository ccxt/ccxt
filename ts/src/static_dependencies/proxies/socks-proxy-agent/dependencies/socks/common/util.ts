import {SocksClientOptions, SocksClientChainOptions} from './constants.js';

/**
 * Error wrapper for SocksClient
 */
class SocksClientError extends Error {
  constructor(
    message: string,
    public options: SocksClientOptions | SocksClientChainOptions,
  ) {
    super(message);
  }
}

/**
 * Shuffles a given array.
 * @param array The array to shuffle.
 */
function shuffleArray(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Helper type to require one of N keys.
type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

export {RequireOnlyOne, SocksClientError, shuffleArray};
