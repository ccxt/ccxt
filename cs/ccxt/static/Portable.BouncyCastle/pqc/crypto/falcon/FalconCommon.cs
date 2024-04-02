using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconCommon
    {
        /* 
        * License from the reference C code (the code was copied then modified
        * to function in C#):
        * ==========================(LICENSE BEGIN)============================
        *
        * Copyright (c) 2017-2019  Falcon Project
        *
        * Permission is hereby granted, free of charge, to any person obtaining
        * a copy of this software and associated documentation files (the
        * "Software"), to deal in the Software without restriction, including
        * without limitation the rights to use, copy, modify, merge, publish,
        * distribute, sublicense, and/or sell copies of the Software, and to
        * permit persons to whom the Software is furnished to do so, subject to
        * the following conditions:
        *
        * The above copyright notice and this permission notice shall be
        * included in all copies or substantial portions of the Software.
        *
        * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        *
        * ===========================(LICENSE END)=============================
        */
        internal void hash_to_point_vartime(
            SHAKE256 sc,
            ushort[] xsrc, int x, uint logn)
        {
            /*
            * This is the straightforward per-the-spec implementation. It
            * is not constant-time, thus it might reveal information on the
            * plaintext (at least, enough to check the plaintext against a
            * list of potential plaintexts) in a scenario where the
            * attacker does not have access to the signature value or to
            * the public key, but knows the nonce (without knowledge of the
            * nonce, the hashed output cannot be matched against potential
            * plaintexts).
            */
            int n;

            n = (int)1 << (int)logn;
            while (n > 0) {
                byte[] buf = new byte[2];
                uint w;
                sc.i_shake256_extract(buf, 0, 2);
                // inner_shake256_extract(sc, (void *)buf, sizeof buf);
                w = ((uint)buf[0] << 8) | (uint)buf[1];
                if (w < 61445) {
                    while (w >= 12289) {
                        w -= 12289;
                    }
                    xsrc[x ++] = (ushort)w;
                    n --;
                }
            }
        }

        // void hash_to_point_ct(
        //     SHAKE256 sc,
        //     ushort[] xsrc, int x, uint logn, byte *tmp)
        // {
        //     /*
        //     * Each 16-bit sample is a value in 0..65535. The value is
        //     * kept if it falls in 0..61444 (because 61445 = 5*12289)
        //     * and rejected otherwise; thus, each sample has probability
        //     * about 0.93758 of being selected.
        //     *
        //     * We want to oversample enough to be sure that we will
        //     * have enough values with probability at least 1 - 2^(-256).
        //     * Depending on degree N, this leads to the following
        //     * required oversampling:
        //     *
        //     *   logn     n  oversampling
        //     *     1      2     65
        //     *     2      4     67
        //     *     3      8     71
        //     *     4     16     77
        //     *     5     32     86
        //     *     6     64    100
        //     *     7    128    122
        //     *     8    256    154
        //     *     9    512    205
        //     *    10   1024    287
        //     *
        //     * If logn >= 7, then the provided temporary buffer is large
        //     * enough. Otherwise, we use a stack buffer of 63 entries
        //     * (i.e. 126 bytes) for the values that do not fit in tmp[].
        //     */

        //     const ushort[] overtab = {
        //         0, /* unused */
        //         65,
        //         67,
        //         71,
        //         77,
        //         86,
        //         100,
        //         122,
        //         154,
        //         205,
        //         287
        //     };

        //     uint n, n2, u, m, p, over;
        //     int tt1;
        //     ushort[] tt2 = new ushort[63];

        //     /*
        //     * We first generate m 16-bit value. Values 0..n-1 go to x[].
        //     * Values n..2*n-1 go to tt1[]. Values 2*n and later go to tt2[].
        //     * We also reduce modulo q the values; rejected values are set
        //     * to 0xFFFF.
        //     */
        //     n = 1U << logn;
        //     n2 = n << 1;
        //     over = overtab[logn];
        //     m = n + over;
        //     tt1 = tmp;
        //     for (u = 0; u < m; u ++) {
        //         byte[] buf = new byte[2];
        //         uint w, wr;

        //         // inner_shake256_extract(sc, buf, sizeof buf);
        //         sc.i_shake256_extract(buf, 2);
        //         w = ((uint)buf[0] << 8) | (uint)buf[1];
        //         wr = w - ((uint)24578 & (((w - 24578) >> 31) - 1));
        //         wr = wr - ((uint)24578 & (((wr - 24578) >> 31) - 1));
        //         wr = wr - ((uint)12289 & (((wr - 12289) >> 31) - 1));
        //         wr |= ((w - 61445) >> 31) - 1;
        //         if (u < n) {
        //             x[u] = (ushort)wr;
        //         } else if (u < n2) {
        //             tt1[u - n] = (ushort)wr;
        //         } else {
        //             tt2[u - n2] = (ushort)wr;
        //         }
        //     }

        //     /*
        //     * Now we must "squeeze out" the invalid values. We do this in
        //     * a logarithmic sequence of passes; each pass computes where a
        //     * value should go, and moves it down by 'p' slots if necessary,
        //     * where 'p' uses an increasing powers-of-two scale. It can be
        //     * shown that in all cases where the loop decides that a value
        //     * has to be moved down by p slots, the destination slot is
        //     * "free" (i.e. contains an invalid value).
        //     */
        //     for (p = 1; p <= over; p <<= 1) {
        //         uint v;

        //         /*
        //         * In the loop below:
        //         *
        //         *   - v contains the index of the final destination of
        //         *     the value; it is recomputed dynamically based on
        //         *     whether values are valid or not.
        //         *
        //         *   - u is the index of the value we consider ("source");
        //         *     its address is s.
        //         *
        //         *   - The loop may swap the value with the one at index
        //         *     u-p. The address of the swap destination is d.
        //         */
        //         v = 0;
        //         for (u = 0; u < m; u ++) {
        //             ushort *s;
        //             ushort *d;
        //             uint j, sv, dv, mk;

        //             if (u < n) {
        //                 s = &x[u];
        //             } else if (u < n2) {
        //                 s = &tt1[u - n];
        //             } else {
        //                 s = &tt2[u - n2];
        //             }
        //             sv = *s;

        //             /*
        //             * The value in sv should ultimately go to
        //             * address v, i.e. jump back by u-v slots.
        //             */
        //             j = u - v;

        //             /*
        //             * We increment v for the next iteration, but
        //             * only if the source value is valid. The mask
        //             * 'mk' is -1 if the value is valid, 0 otherwise,
        //             * so we _subtract_ mk.
        //             */
        //             mk = (sv >> 15) - 1U;
        //             v -= mk;

        //             /*
        //             * In this loop we consider jumps by p slots; if
        //             * u < p then there is nothing more to do.
        //             */
        //             if (u < p) {
        //                 continue;
        //             }

        //             /*
        //             * Destination for the swap: value at address u-p.
        //             */
        //             if ((u - p) < n) {
        //                 d = &x[u - p];
        //             } else if ((u - p) < n2) {
        //                 d = &tt1[(u - p) - n];
        //             } else {
        //                 d = &tt2[(u - p) - n2];
        //             }
        //             dv = *d;

        //             /*
        //             * The swap should be performed only if the source
        //             * is valid AND the jump j has its 'p' bit set.
        //             */
        //             mk &= -(((j & p) + 0x1FF) >> 9);

        //             *s = (ushort)(sv ^ (mk & (sv ^ dv)));
        //             *d = (ushort)(dv ^ (mk & (sv ^ dv)));
        //         }
        //     }
        // }

        /*
        * Acceptance bound for the (squared) l2-norm of the signature depends
        * on the degree. This array is indexed by logn (1 to 10). These bounds
        * are _inclusive_ (they are equal to floor(beta^2)).
        */
        internal uint[] l2bound = {
            0,    /* unused */
            101498,
            208714,
            428865,
            892039,
            1852696,
            3842630,
            7959734,
            16468416,
            34034726,
            70265242
        };

        internal bool is_short(
            short[] s1src, int s1, short[] s2src, int s2, uint logn)
        {
            /*
            * We use the l2-norm. Code below uses only 32-bit operations to
            * compute the square of the norm with saturation to 2^32-1 if
            * the value exceeds 2^31-1.
            */
            int n, u;
            uint s, ng;

            n = (int)1 << (int)logn;
            s = 0;
            ng = 0;
            for (u = 0; u < n; u ++) {
                int z;

                z = s1src[s1+u];
                s += (uint)(z * z);
                ng |= s;
                z = s2src[s2+u];
                s += (uint)(z * z);
                ng |= s;
            }
            s |= (uint)(-(ng >> 31));

            return s <= l2bound[logn];
        }

        internal bool is_short_half(
            uint sqn, short[] s2src, int s2, uint logn)
        {
            int n, u;
            uint ng;

            n = (int)1 << (int)logn;
            ng = (uint)(-(sqn >> 31));
            for (u = 0; u < n; u ++) {
                int z;

                z = s2src[s2 + u];
                sqn += (uint)(z * z);
                ng |= sqn;
            }
            sqn |= (uint)(-(ng >> 31));

            return sqn <= l2bound[logn];
        }
    }
}
