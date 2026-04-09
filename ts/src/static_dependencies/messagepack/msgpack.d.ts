/**
 * Serializes a value to a MessagePack byte array.
 * @param data The value to serialize. This can be a scalar, array or object, but not a function.
 * @param options An object that defined additional options.
 */
export function serialize(
    data: any,
    options?: {
        /** Indicates whether multiple values in data are concatenated to multiple MessagePack arrays. If undefined, the default is `false`. */
        multiple?: boolean,
        /** The value that is used to replace values of unsupported types, or a function that returns such a value, given the original value as parameter. */
        invalidTypeReplacement?: ((value: any) => (boolean | number | string | [] | object | null)) | boolean | number | string | [] | object | null,
    }): Uint8Array;

/**
 * Deserializes a MessagePack byte array to a value.
 * @param array The MessagePack byte array to deserialize.
 * @param options An object that defined additional options.
 */
export function deserialize(
    array: Uint8Array | ArrayBuffer | [],
    options?: {
		/** Indicates whether multiple concatenated MessagePack arrays are returned as an array. If undefined, the default is `false`. */
		multiple?: boolean,
    }): any;

export { serialize as encode };
export { deserialize as decode };