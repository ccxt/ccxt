declare function base(ALPHABET: any): {
    encode: (source: any) => any;
    decodeUnsafe: (source: any) => Uint8Array;
    decode: (string: any) => Uint8Array;
};
export default base;
