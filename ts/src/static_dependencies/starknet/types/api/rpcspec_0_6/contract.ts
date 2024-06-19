/**
 * TypeScript Representation of Cairo1 v2+ Starknet Contract ABI
 *
 * starknet_metadata.json - tags/v0.5.0
 *
 * 'starknet-specs' (OpenRpc protocol types)
 * https://github.com/starkware-libs/starknet-specs
 */

export type ABI = Array<
  FUNCTION | CONSTRUCTOR | L1_HANDLER | EVENT | STRUCT | ENUM | INTERFACE | IMPL
>;

type FUNCTION = {
  type: 'function';
  name: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  outputs?: Array<{
    type: string;
  }>;
  state_mutability: 'view' | 'external';
};

type CONSTRUCTOR = {
  type: 'constructor';
  name: 'constructor';
  inputs: Array<{
    name: string;
    type: string;
  }>;
};

type L1_HANDLER = {
  type: 'l1_handler';
  name: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  outputs?: Array<{
    type: string;
  }>;
  state_mutability: 'view' | 'external';
};

type EVENT = {
  type: 'event';
  name: string;
} & (ENUM_EVENT | STRUCT_EVENT);

type STRUCT_EVENT = {
  kind: 'struct';
  members: Array<EVENT_FIELD>;
};

type ENUM_EVENT = {
  kind: 'enum/index.js';
  variants: Array<EVENT_FIELD>;
};

type STRUCT = {
  type: 'struct';
  name: string;
  members: Array<{
    name: string;
    type: string;
  }>;
};

type ENUM = {
  type: 'enum/index.js';
  name: string;
  variants: Array<{
    name: string;
    type: string;
  }>;
};

type INTERFACE = {
  type: 'interface';
  name: string;
  items: Array<FUNCTION>;
};

type IMPL = {
  type: 'impl';
  name: string;
  interface_name: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EVENT_KIND = 'struct' | 'enum/index.js';

type EVENT_FIELD = {
  name: string;
  type: string;
  kind: 'key' | 'data' | 'nested';
};
