using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconRNG
    {
        byte[] bd;
        //ulong bdummy_u64;
        byte[] sd;
        //ulong sdummy_u64;
        //int type;
        int ptr;

        FalconConversions convertor;

        internal FalconRNG() {
            this.bd = new byte[512];
            this.sd = new byte[256];
            this.convertor = new FalconConversions();
        }

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

        internal void prng_init(SHAKE256 src)
        {
            /*
            * To ensure reproducibility for a given seed, we
            * must enforce little-endian interpretation of
            * the state words.
            */
            byte[] tmp = new byte[56];
            ulong th, tl;
            int i;

            src.i_shake256_extract(tmp,0, 56);
            for (i = 0; i < 14; i ++) {
                uint w;

                w = (uint)tmp[(i << 2) + 0]
                    | ((uint)tmp[(i << 2) + 1] << 8)
                    | ((uint)tmp[(i << 2) + 2] << 16)
                    | ((uint)tmp[(i << 2) + 3] << 24);
                //*(uint *)(this.sd + (i << 2)) = w;
                Array.Copy(convertor.int_to_bytes((int)w), 0, this.sd, i << 2, 4);
            }
            //        tl = *(uint32_t *)(p->state.d + 48);
            tl = convertor.bytes_to_uint(this.sd, 48);
            //        th = *(uint32_t *)(p->state.d + 52);
            th = convertor.bytes_to_uint(this.sd, 52);
            Array.Copy(convertor.ulong_to_bytes(tl + (th << 32)), 0, this.sd, 48, 8);
            this.prng_refill();
        }

        /*
        * PRNG based on ChaCha20.
        *
        * State consists in key (32 bytes) then IV (16 bytes) and block counter
        * (8 bytes). Normally, we should not care about local endianness (this
        * is for a PRNG), but for the NIST competition we need reproducible KAT
        * vectors that work across architectures, so we enforce little-endian
        * interpretation where applicable. Moreover, output words are "spread
        * out" over the output buffer with the interleaving pattern that is
        * naturally obtained from the AVX2 implementation that runs eight
        * ChaCha20 instances in parallel.
        *
        * The block counter is XORed into the first 8 bytes of the IV.
        */
        private void QROUND(uint[] state, int a, int b, int c, int d) {
            state[a] += state[b];
            state[d] ^= state[a];
            state[d] = (state[d] << 16) | (state[d] >> 16);
            state[c] += state[d];
            state[b] ^= state[c];
            state[b] = (state[b] << 12) | (state[b] >> 20);
            state[a] += state[b];
            state[d] ^= state[a];
            state[d] = (state[d] <<  8) | (state[d] >> 24);
            state[c] += state[d];
            state[b] ^= state[c];
            state[b] = (state[b] <<  7) | (state[b] >> 25);
        }
        void prng_refill()
        {

            uint[] CW = {
                0x61707865, 0x3320646e, 0x79622d32, 0x6b206574
            };

            ulong cc;
            int u;

            /*
            * State uses local endianness. Only the output bytes must be
            * converted to little endian (if used on a big-endian machine).
            */
            //cc = *(ulong *)(this.sd + 48);
            cc = convertor.bytes_to_ulong(this.sd, 48);
            for (u = 0; u < 8; u ++) {
                uint[] state = new uint[16];
                int v;
                int i;

                // memcpy(&state[0], CW, sizeof CW);
                Array.Copy(CW, 0, state, 0, 4);
                // memcpy(&state[4], this.sd, 48);
                Array.Copy(convertor.bytes_to_uint_array(this.sd, 0, 12), 0, state, 4, 12);

                state[14] ^= (uint)cc;
                state[15] ^= (uint)(cc >> 32);
                for (i = 0; i < 10; i ++) {

                    QROUND(state, 0,  4,  8, 12);
                    QROUND(state, 1,  5,  9, 13);
                    QROUND(state, 2,  6, 10, 14);
                    QROUND(state, 3,  7, 11, 15);
                    QROUND(state, 0,  5, 10, 15);
                    QROUND(state, 1,  6, 11, 12);
                    QROUND(state, 2,  7,  8, 13);
                    QROUND(state, 3,  4,  9, 14);

                }

                for (v = 0; v < 4; v++)
                {
                    state[v] += CW[v];
                }
                for (v = 4; v < 14; v++)
                {
                    //                state[v] += ((uint32_t *)p->state.d)[v - 4];
                    // we multiply the -4 by 4 to account for 4 bytes per int
                    state[v] += convertor.bytes_to_uint(sd, (4 * v) - 16);
                }
                //            state[14] += ((uint32_t *)p->state.d)[10]
                //            ^ (uint32_t)cc;
                state[14] += (uint)(convertor.bytes_to_uint(sd, 40) ^ ((int)cc));
                //            state[15] += ((uint32_t *)p->state.d)[11]
                //            ^ (uint32_t)(cc >> 32);
                state[15] += (uint)(convertor.bytes_to_uint(sd, 44) ^ ((int)(cc >> 32)));
                cc ++;

                /*
                * We mimic the interleaving that is used in the AVX2
                * implementation.
                */
                for (v = 0; v < 16; v ++) {
                    this.bd[(u << 2) + (v << 5) + 0] =
                        (byte)state[v];
                    this.bd[(u << 2) + (v << 5) + 1] =
                        (byte)(state[v] >> 8);
                    this.bd[(u << 2) + (v << 5) + 2] =
                        (byte)(state[v] >> 16);
                    this.bd[(u << 2) + (v << 5) + 3] =
                        (byte)(state[v] >> 24);
                }
            }
            //*(ulong *)(this.sd + 48) = cc;
            Array.Copy(convertor.ulong_to_bytes(cc), 0, sd, 48, 8);


            this.ptr = 0;
        }

        internal void prng_get_bytes( byte[] dstsrc, int dst, int len)
        {
            int buf;

            buf = dst;
            while (len > 0) {
                int clen;

                clen = (this.bd.Length) - this.ptr;
                if (clen > len) {
                    clen = len;
                }
                // memcpy(buf, this.bd, clen);
                Array.Copy(this.bd, 0, dstsrc, buf, clen);
                buf += clen;
                len -= clen;
                this.ptr += clen;
                if (this.ptr == this.bd.Length) {
                    this.prng_refill();
                }
            }
        }

        /*
         * Get a 64-bit random value from a PRNG.
         */
        internal ulong prng_get_u64()
        {
            int u;

            /*
            * If there are less than 9 bytes in the buffer, we refill it.
            * This means that we may drop the last few bytes, but this allows
            * for faster extraction code. Also, it means that we never leave
            * an empty buffer.
            */
            u = this.ptr;
            if (u >= (this.bd.Length) - 9) {
                this.prng_refill();
                u = 0;
            }
            this.ptr = u + 8;

            /*
            * On systems that use little-endian encoding and allow
            * unaligned accesses, we can simply read the data where it is.
            */
            return (ulong)this.bd[u + 0]
                | ((ulong)this.bd[u + 1] << 8)
                | ((ulong)this.bd[u + 2] << 16)
                | ((ulong)this.bd[u + 3] << 24)
                | ((ulong)this.bd[u + 4] << 32)
                | ((ulong)this.bd[u + 5] << 40)
                | ((ulong)this.bd[u + 6] << 48)
                | ((ulong)this.bd[u + 7] << 56);
        }

        /*
        * Get an 8-bit random value from a PRNG.
        */
        internal uint prng_get_u8()
        {
            uint v;

            v = this.bd[this.ptr ++];
            if (this.ptr == this.bd.Length) {
                this.prng_refill();
            }
            return v;
        }
    }
}
