declare const crypt: {
    rotl: (n: any, b: any) => number;
    rotr: (n: any, b: any) => number;
    endian: (n: any) => any;
    randomBytes: (n: any) => any[];
    bytesToWords: (bytes: any) => any[];
    wordsToBytes: (words: any) => any[];
    bytesToHex: (bytes: any) => string;
    hexToBytes: (hex: any) => any[];
    bytesToBase64: (bytes: any) => string;
    base64ToBytes: (base64: any) => any[];
};
export default crypt;
