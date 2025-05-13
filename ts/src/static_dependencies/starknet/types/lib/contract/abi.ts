/** ABI */
export type Abi = ReadonlyArray<FunctionAbi | EventAbi | StructAbi | InterfaceAbi | any>;

// Basic elements
export type AbiEntry = { name: string; type: 'felt' | 'felt*' | string };

export type EventEntry = { name: string; type: 'felt' | 'felt*' | string; kind: 'key' | 'data' };

enum FunctionAbiType {
  'function',
  'l1_handler',
  'constructor',
}

// Sub elements
export type FunctionAbi = {
  inputs: AbiEntry[];
  name: string;
  outputs: AbiEntry[];
  stateMutability?: 'view';
  state_mutability?: string; // Cairo 1 Abi
  type: FunctionAbiType;
};

export type AbiStructs = { [name: string]: StructAbi };

export type StructAbi = {
  members: (AbiEntry & { offset: number })[];
  name: string;
  size: number;
  type: 'struct';
};

export type AbiInterfaces = { [name: string]: InterfaceAbi };
export type InterfaceAbi = {
  items: FunctionAbi[];
  name: string;
  type: 'interface';
};

export type AbiEnums = { [name: string]: EnumAbi };
export type EnumAbi = {
  variants: (AbiEntry & { offset: number })[];
  name: string;
  size: number;
  type: 'enum/index.js';
};

export type AbiEvents = { [hash: string]: EventAbi };

export type EventAbi = Cairo1Event | LegacyEvent;

export type Cairo1Event = {
  name: string;
  members: EventEntry[];
  kind: 'struct';
  type: 'event';
};

export type LegacyEvent = {
  name: string;
  type: 'event';
  data: EventEntry[];
  keys: EventEntry[];
};
