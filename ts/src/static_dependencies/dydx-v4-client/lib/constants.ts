import { StdFee } from '@cosmjs/stargate';

// Bech32 Prefix
export const BECH32_PREFIX = 'dydx';
export const NOBLE_BECH32_PREFIX = 'noble';

// Broadcast Defaults
export const BROADCAST_POLL_INTERVAL_MS: number = 300;
export const BROADCAST_TIMEOUT_MS: number = 8_000;

// API Defaults
export const API_TIMEOUT_DEFAULT_MS: number = 5_000;

// Gas
export const GAS_MULTIPLIER: number = 1.6;

export const ZERO_FEE: StdFee = {
  amount: [],
  gas: '0',
};

// Validation
export const MAX_UINT_32 = 4_294_967_295;
export const MAX_SUBACCOUNT_NUMBER = 128_000;

export const DEFAULT_SEQUENCE: number = 0;

export const SERIALIZED_INT_ZERO: Uint8Array = Uint8Array.from([0x02]);
