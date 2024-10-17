export type UUIDTypes = string | Uint8Array;

export type Version1Options = {
  node?: Uint8Array;
  clockseq?: number;
  random?: Uint8Array;
  rng?: () => Uint8Array;
  msecs?: number;
  nsecs?: number;
  _v6?: boolean; // Internal use only!
};

export type Version4Options = {
  random?: Uint8Array;
  rng?: () => Uint8Array;
};

export type Version6Options = Version1Options;

export type Version7Options = {
  random?: Uint8Array;
  msecs?: number;
  seq?: number;
  rng?: () => Uint8Array;
};