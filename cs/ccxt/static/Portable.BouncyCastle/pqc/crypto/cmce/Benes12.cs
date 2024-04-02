namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    class Benes12
        : Benes
    {
        public Benes12(int n, int t, int m)
            : base(n, t, m)
        {
        }

        /* one layer of the benes network */
        static void LayerBenes(ulong[] data, ulong[] bits, int lgs)
        {
            int i, j, s;
            int bit_ptr = 0;

            ulong d;

            s = 1 << lgs;

            for (i = 0; i < 64; i += s * 2)
            {
                for (j = i; j < i + s; j++)
                {
                    d = (data[j + 0] ^ data[j + s]);
                    d &= bits[bit_ptr++];
                    data[j + 0] ^= d;
                    data[j + s] ^= d;
                }
            }
        }

        private void ApplyBenes(byte[] r, byte[] bits, int rev)
        {
            int i;

            int cond_ptr;
            int inc, low;

            ulong[] bs = new ulong[64];
            ulong[] cond = new ulong[64];

            //
            for (i = 0; i < 64; i++)
            {
                bs[i] = Utils.Load8(r, i * 8);
            }

            if (rev == 0)
            {
                inc = 256;
                cond_ptr = SYS_T * 2 + 40;
            }
            else
            {
                inc = -256;
                cond_ptr = SYS_T * 2 + 40 + (2 * GFBITS - 2) * 256;
            }

            //

            Transpose64x64(bs, bs);
            for (low = 0; low <= 5; low++)
            {
                for (i = 0; i < 64; i++)
                {
                    cond[i] = Utils.Load4(bits, cond_ptr + i * 4);
                }

                Transpose64x64(cond, cond);
                LayerBenes(bs, cond, low);

                cond_ptr += inc;
            }

            Transpose64x64(bs, bs);

            for (low = 0; low <= 5; low++)
            {
                for (i = 0; i < 32; i++) //DONE use Utils load8
                {
                    cond[i] = Utils.Load8(bits, cond_ptr + i * 8);
                }

                LayerBenes(bs, cond, low);
                cond_ptr += inc;
            }

            for (low = 4; low >= 0; low--)
            {
                for (i = 0; i < 32; i++) //DONE use Utils load8
                {
                    cond[i] = Utils.Load8(bits, cond_ptr + i * 8);
                }

                LayerBenes(bs, cond, low);
                cond_ptr += inc;
            }

            Transpose64x64(bs, bs);

            for (low = 5; low >= 0; low--)
            {
                for (i = 0; i < 64; i++)
                {
                    cond[i] = Utils.Load4(bits, cond_ptr + i * 4);
                }

                Transpose64x64(cond, cond);
                LayerBenes(bs, cond, low);
                cond_ptr += inc;
            }

            Transpose64x64(bs, bs);

            //
            for (i = 0; i < 64; i++)
            {
                Utils.Store8(r, i * 8, bs[i]);

            }
        }

        // from benes network
        protected internal override void SupportGen(ushort[] s, byte[] c)
        {
            ushort a;
            byte[][] L = new byte[GFBITS][]; //(1 << GFBITS)/8

            for (int i = 0; i < GFBITS; i++)
            {
                for (int j = 0; j < (1 << GFBITS) / 8; j++)
                {
                    L[i] = new byte[(1 << GFBITS) / 8];
                }
            }

            for (ushort i = 0; i < (1 << GFBITS); i++)
            {
                a = Utils.Bitrev(i, GFBITS);

                for (int j = 0; j < GFBITS; j++)
                {
                    L[j][i / 8] |= (byte) (((a >> j) & 1) << (i%8));
                }
            }

            for (int j = 0; j < GFBITS; j++)
            {
                ApplyBenes(L[j], c, 0);
            }

            for (int i = 0; i < SYS_N; i++)
            {
                s[i] = 0;
                for (int j = GFBITS - 1; j >= 0; j--)
                {
                    s[i] <<= 1;
                    s[i] |= (ushort) ((L[j][i / 8] >> (i % 8)) & 1);
                }
            }
        }
    }
}