type BigNumberish = string | number | bigint;
interface TypedDataField {
    name: string;
    type: string;
}
type TypedDataTypes = Record<string, TypedDataField[]>;
interface TypedData {
    types: TypedDataTypes;
    primaryType: string;
    domain: Record<string, any>;
    message: Record<string, any>;
}
export declare function encodeShortString(str: string): string;
export declare function felt(it: any): string;
export declare const starknetKeccak: (str: string) => bigint;
export declare const getSelectorFromName: (name: string) => string;
export declare const computeHashOnElements: (data: BigNumberish[]) => string;
export declare const computePoseidonHashOnElements: (data: BigNumberish[]) => string;
export declare function compileCalldata(rawArgs: any): string[];
export declare function calculateContractAddressFromHash(salt: BigNumberish, classHash: BigNumberish, constructorCalldata: any, deployerAddress: BigNumberish): string;
export declare function getStructHash(types: TypedDataTypes, type: string, data: Record<string, any>): string;
export declare function getMessageHash(typedData: TypedData, account: BigNumberish): string;
export {};
