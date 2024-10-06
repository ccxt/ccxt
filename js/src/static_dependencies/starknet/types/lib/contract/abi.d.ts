/** ABI */
export declare type Abi = ReadonlyArray<FunctionAbi | EventAbi | StructAbi | InterfaceAbi | any>;
export declare type AbiEntry = {
    name: string;
    type: 'felt' | 'felt*' | string;
};
export declare type EventEntry = {
    name: string;
    type: 'felt' | 'felt*' | string;
    kind: 'key' | 'data';
};
declare enum FunctionAbiType {
    'function' = 0,
    'l1_handler' = 1,
    'constructor' = 2
}
export declare type FunctionAbi = {
    inputs: AbiEntry[];
    name: string;
    outputs: AbiEntry[];
    stateMutability?: 'view';
    state_mutability?: string;
    type: FunctionAbiType;
};
export declare type AbiStructs = {
    [name: string]: StructAbi;
};
export declare type StructAbi = {
    members: (AbiEntry & {
        offset: number;
    })[];
    name: string;
    size: number;
    type: 'struct';
};
export declare type AbiInterfaces = {
    [name: string]: InterfaceAbi;
};
export declare type InterfaceAbi = {
    items: FunctionAbi[];
    name: string;
    type: 'interface';
};
export declare type AbiEnums = {
    [name: string]: EnumAbi;
};
export declare type EnumAbi = {
    variants: (AbiEntry & {
        offset: number;
    })[];
    name: string;
    size: number;
    type: 'enum/index.js';
};
export declare type AbiEvents = {
    [hash: string]: EventAbi;
};
export declare type EventAbi = Cairo1Event | LegacyEvent;
export declare type Cairo1Event = {
    name: string;
    members: EventEntry[];
    kind: 'struct';
    type: 'event';
};
export declare type LegacyEvent = {
    name: string;
    type: 'event';
    data: EventEntry[];
    keys: EventEntry[];
};
export {};
