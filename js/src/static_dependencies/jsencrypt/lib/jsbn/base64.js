import { base16, base64 } from "../../../scure-base/index.js";
export function hex2b64(h) {
    return base64.encode(base16.decode(h));
}
// convert a base64 string to hex
export function b64tohex(s) {
    return base16.encode(base64.decode(s));
}
// convert a base64 string to a byte/number array
export function b64toBA(s) {
    // piggyback on b64tohex for now, optimize later
    const h = b64tohex(s);
    let i;
    const a = [];
    for (i = 0; 2 * i < h.length; ++i) {
        a[i] = parseInt(h.substring(2 * i, 2 * i + 2), 16);
    }
    return a;
}
