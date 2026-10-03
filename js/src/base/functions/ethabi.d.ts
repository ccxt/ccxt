interface TypedDataField {
    name: string;
    type: string;
}
type TypedDataTypes = Record<string, TypedDataField[]>;
type FieldEncoder = (value: any) => string;
export declare const keccak: (bytes: Uint8Array) => Uint8Array;
export declare function abiEncode(types: string[], values: any[]): string;
export declare class TypedDataEncoder {
    types: TypedDataTypes;
    primaryType: string;
    fullTypes: Record<string, string>;
    encoderCache: Record<string, FieldEncoder>;
    constructor(types: TypedDataTypes);
    static from(types: TypedDataTypes): TypedDataEncoder;
    encodeType(name: string): string;
    private buildEncoder;
    getEncoder(type: string): FieldEncoder;
    encodeData(type: string, value: any): string;
    hashStruct(name: string, value: any): string;
    static hashDomain(domain: Record<string, any>): string;
    static encode(domain: Record<string, any>, types: TypedDataTypes, value: Record<string, any>): string;
}
export {};
