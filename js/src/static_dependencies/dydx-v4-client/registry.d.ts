import { Any } from "./google/protobuf/any.js";
export declare const registry: Record<string, any>;
export interface EncodeObject {
    readonly typeUrl: string;
    readonly value: any;
}
export declare function encodeAsAny(encodeObject: EncodeObject): Any;
