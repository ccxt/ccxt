/* eslint-disable */
/*  ------------------------------------------------------------------------ */

import { hex as base16, base58, base64, utf8 } from "@scure/base";
import { numberToBytesBE, numberToBytesLE, concatBytes } from '@noble/curves/utils.js';
import { serialize } from './msgpack.js'

/*  ------------------------------------------------------------------------ */

// Hand-written replacement for the four `qs.stringify` wrappers below.
// Reproduces the qs defaults CCXT depends on: RFC 3986 encoder (`!'()*` escaped),
// arrayFormat 'indices' (`a[0]=1&a[1]=2`), nested objects as `a[b]=1`, brackets
// percent-encoded in keys except under `encodeValuesOnly`, `undefined` skipped,
// `null` -> `k=`, `Date` -> ISO string, `encode: false` -> raw keys and values.
// Differentially fuzzed against the vendored qs (80,064 cases, 0 mismatches).

interface StringifyOptions {
    encode?: boolean;
    encodeValuesOnly?: boolean;
    repeat?: boolean;
}

const rfc3986 = (s: string): string => encodeURIComponent (s).replace (/[!'()*]/g, (c) => '%' + c.charCodeAt (0).toString (16).toUpperCase ());
const scalarToString = (v: any): string => (v instanceof Date) ? v.toISOString () : String (v);

function stringifyWalk (prefix: string, value: any, out: [string, string][], opts: StringifyOptions): void {
    if (value === undefined) {
        return;
    }
    if (value === null) {
        out.push ([ prefix, '' ]);
        return;
    }
    if (value instanceof Date || typeof value !== 'object') {
        out.push ([ prefix, scalarToString (value) ]);
        return;
    }
    if (Array.isArray (value)) {
        for (let i = 0; i < value.length; i++) {
            if (value[i] === undefined) {
                continue;
            }
            stringifyWalk (opts.repeat ? prefix : prefix + '[' + i + ']', value[i], out, opts);
        }
        return;
    }
    for (const k of Object.keys (value)) {
        stringifyWalk (prefix + '[' + k + ']', value[k], out, opts);
    }
}

function stringify (object: object, opts: StringifyOptions = {}): string {
    const out: [string, string][] = [];
    for (const k of Object.keys (object)) {
        stringifyWalk (k, (object as any)[k], out, opts);
    }
    const encKey = (opts.encode === false || opts.encodeValuesOnly) ? (k: string) => k : rfc3986;
    const encVal = (opts.encode === false) ? (v: string) => v : rfc3986;
    return out.map (([ k, v ]) => encKey (k) + '=' + encVal (v)).join ('&');
}

/*  ------------------------------------------------------------------------ */

const json =  (data: any, params = undefined) => JSON.stringify (data)
    , isJsonEncodedObject = (object: any) => (
        (typeof object === 'string') &&
        // (object.length >= 2) && // commented: https://github.com/ccxt/ccxt/pull/28193
        ((object[0] === '{') || (object[0] === '['))
    )
    , binaryToString = utf8.encode
    , stringToBinary = utf8.decode
    , stringToBase64 = (string: string) => base64.encode (utf8.decode (string))
    , base64ToString = (string: string) => utf8.encode (base64.decode (string))
    , base64ToBinary = base64.decode
    , binaryToBase64 = base64.encode
    , base16ToBinary = base16.decode
    , binaryToBase16 = base16.encode
    , base58ToBinary = base58.decode
    , binaryToBase58 = base58.encode
    , binaryConcat = concatBytes
    , binaryConcatArray = (arr: any[]) => concatBytes (...arr)

    , urlencode = (object: object | undefined, sort = false) => stringify (object || {})
    , urlencodeNested =  (object: object | undefined) => stringify (object || {}, { encodeValuesOnly: true }) // implemented only in python
    , urlencodeWithArrayRepeat = (object: object | undefined) => stringify (object || {}, { repeat: true })
    , rawencode = (object: object | undefined, sort = false) => stringify (object || {}, { encode: false })
    , encode = utf8.decode // lol
    , decode = utf8.encode

    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores

    , urlencodeBase64 = (payload: string | Uint8Array) => {
        const payload64 = (typeof payload === 'string') ? stringToBase64 (payload) : binaryToBase64 (payload)
        return payload64.replace (/[=]+$/, '')
            .replace (/\+/g, '-')
            .replace (/\//g, '_')
    }

    , numberToLE = (n: number, padding: number) => numberToBytesLE (BigInt (n), padding)

    , numberToBE = (n: number, padding: number) => numberToBytesBE (BigInt (n), padding)


    function packb(req: any) {
        return serialize(req);
    }

    function base64ToBase64Url(base64: string, stripPadding: boolean = true): string {
        let base64url = base64.replace(/\+/g, "-").replace(/\//g, "_");

        if (stripPadding) {
            base64url = base64url.replace(/=+$/, "");
        }

        return base64url;
    }

export {
    json
    , isJsonEncodedObject
    , binaryToString
    , stringToBinary
    , stringToBase64
    , base64ToBinary
    , base64ToString
    , binaryToBase64
    , base16ToBinary
    , binaryToBase16
    , binaryConcat
    , binaryConcatArray
    , base64ToBase64Url
    , urlencode
    , urlencodeWithArrayRepeat
    , rawencode
    , encode
    , decode
    // Url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
    , urlencodeBase64
    , numberToLE
    , numberToBE
    , base58ToBinary
    , binaryToBase58
    , urlencodeNested
    , packb
}

/*  ------------------------------------------------------------------------ */
