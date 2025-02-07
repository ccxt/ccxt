// Hex JavaScript decoder
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

let decoder:{ [index:string]:number };
export const Hex = {
    decode(a:string):number[] {
        let i;
        if (decoder === undefined) {
            let hex = "0123456789ABCDEF";
            const ignore = " \f\n\r\t\u00A0\u2028\u2029";
            decoder = {};
            for (i = 0; i < 16; ++i) {
                decoder[hex.charAt(i)] = i;
            }
            hex = hex.toLowerCase();
            for (i = 10; i < 16; ++i) {
                decoder[hex.charAt(i)] = i;
            }
            for (i = 0; i < ignore.length; ++i) {
                decoder[ignore.charAt(i)] = -1;
            }
        }
        const out = [];
        let bits = 0;
        let char_count = 0;
        for (i = 0; i < a.length; ++i) {
            let c:number|string = a.charAt(i);
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
            bits |= c;
            if (++char_count >= 2) {
                out[out.length] = bits;
                bits = 0;
                char_count = 0;
            } else {
                bits <<= 4;
            }
        }
        if (char_count) {
            throw new Error("Hex encoding incomplete: 4 bits missing");
        }
        return out;
    }
};
