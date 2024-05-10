// Big integer base-10 printing library
// Copyright (c) 2014 Lapo Luchini <lapo@lapo.it>

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


const max = 10000000000000; // biggest integer that can still fit 2^53 when multiplied by 256

export class Int10 {
    constructor(value?:string | number) {
        this.buf = [+value || 0];
    }


    public mulAdd(m:number, c:number) {
        // assert(m <= 256)
        const b = this.buf;
        const l = b.length;
        let i;
        let t;
        for (i = 0; i < l; ++i) {
            t = b[i] * m + c;
            if (t < max) {
                c = 0;
            } else {
                c = 0 | (t / max);
                t -= c * max;
            }
            b[i] = t;
        }
        if (c > 0) {
            b[i] = c;
        }
    }

    public sub(c:number) {
        // assert(m <= 256)
        const b = this.buf;
        const l = b.length;
        let i;
        let t;
        for (i = 0; i < l; ++i) {
            t = b[i] - c;
            if (t < 0) {
                t += max;
                c = 1;
            } else {
                c = 0;
            }
            b[i] = t;
        }
        while (b[b.length - 1] === 0) {
            b.pop();
        }
    }

    public toString(base?:number) {
        if ((base || 10) != 10) {
            throw new Error("only base 10 is supported");
        }
        const b = this.buf;
        let s = b[b.length - 1].toString();
        for (let i = b.length - 2; i >= 0; --i) {
            s += (max + b[i]).toString().substring(1);
        }
        return s;
    }

    public valueOf() {
        const b = this.buf;
        let v = 0;
        for (let i = b.length - 1; i >= 0; --i) {
            v = v * max + b[i];
        }
        return v;
    }

    public simplify() {
        const b = this.buf;
        return (b.length == 1) ? b[0] : this;
    }

    private buf:number[];
}

