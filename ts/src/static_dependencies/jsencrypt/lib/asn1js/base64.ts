// Base64 JavaScript decoder
// Copyright (c) 2008-2013 Lapo Luchini <lapo@lapo.it>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

/*jshint browser: true, strict: true, immed: true, latedef: true, undef: true, regexdash: false */
let decoder:{ [index:string]:number | string };
export const Base64 = {
    decode(a:string) {
        let i;
        if (decoder === undefined) {
            const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            const ignore = "= \f\n\r\t\u00A0\u2028\u2029";
            decoder = Object.create(null);
            for (i = 0; i < 64; ++i) {
                decoder[b64.charAt(i)] = i;
            }
            decoder['-'] = 62;//+
            decoder['_'] = 63;//-
            for (i = 0; i < ignore.length; ++i) {
                decoder[ignore.charAt(i)] = -1;
            }
        }
        const out = [];
        let bits = 0;
        let char_count = 0;
        for (i = 0; i < a.length; ++i) {
            let c:string|number = a.charAt(i);
            if (c == "=") {
                break;
            }
            c = decoder[c];
            if (c == -1) {
                continue;
            }
            if (c === undefined) {
                throw new Error("Illegal character at offset " + i);
            }
            bits |= c as number;
            if (++char_count >= 4) {
                out[out.length] = (bits >> 16);
                out[out.length] = (bits >> 8) & 0xFF;
                out[out.length] = bits & 0xFF;
                bits = 0;
                char_count = 0;
            } else {
                bits <<= 6;
            }
        }
        switch (char_count) {
            case 1:
                throw new Error("Base64 encoding incomplete: at least 2 bits missing");
            case 2:
                out[out.length] = (bits >> 10);
                break;
            case 3:
                out[out.length] = (bits >> 16);
                out[out.length] = (bits >> 8) & 0xFF;
                break;
        }
        return out;
    },
    re: /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/,
    unarmor(a:string):number[] {
        const m = Base64.re.exec(a);
        if (m) {
            if (m[1]) {
                a = m[1];
            } else if (m[2]) {
                a = m[2];
            } else {
                throw new Error("RegExp out of sync");
            }
        }
        return Base64.decode(a);
    }
};
