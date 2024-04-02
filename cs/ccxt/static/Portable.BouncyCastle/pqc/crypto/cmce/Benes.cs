
namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    abstract class Benes
    {
        protected int SYS_N;
        protected int SYS_T;
        protected int GFBITS;

        public Benes(int n, int t, int m)
        {
            SYS_N = n;
            SYS_T = t;
            GFBITS = m;
        }

        /* input: in, a 64x64 matrix over GF(2) */
        /* outputput: output, transpose of in */
        internal static void Transpose64x64(ulong[] output, ulong[] input)
        {
            int i, j, s, d;

            ulong x, y;
            ulong[,] masks =
            {
                {0x5555555555555555L, 0xAAAAAAAAAAAAAAAAL},
                {0x3333333333333333L, 0xCCCCCCCCCCCCCCCCL},
                {0x0F0F0F0F0F0F0F0FL, 0xF0F0F0F0F0F0F0F0L},
                {0x00FF00FF00FF00FFL, 0xFF00FF00FF00FF00L},
                {0x0000FFFF0000FFFFL, 0xFFFF0000FFFF0000L},
                {0x00000000FFFFFFFFL, 0xFFFFFFFF00000000L}
            };

            for (i = 0; i < 64; i++)
                output[i] = input[i];

            for (d = 5; d >= 0; d--)
            {
                s = 1 << d;
                for (i = 0; i < 64; i += s * 2)
                {
                    for (j = i; j < i + s; j++)
                    {
                        x = (output[j] & masks[d, 0]) | ((output[j + s] & masks[d, 0]) << s);
                        y = ((output[j] & masks[d, 1]) >> s) | (output[j + s] & masks[d, 1]);

                        output[j + 0] = x;
                        output[j + s] = y;
                    }
                }
            }

        }

        internal static void Transpose64x64(ulong[] output, ulong[] input, int offset)
        {
            int i, j, s, d;

            ulong x, y;
            ulong[,] masks =
            {
                {0x5555555555555555L, 0xAAAAAAAAAAAAAAAAL},
                {0x3333333333333333L, 0xCCCCCCCCCCCCCCCCL},
                {0x0F0F0F0F0F0F0F0FL, 0xF0F0F0F0F0F0F0F0L},
                {0x00FF00FF00FF00FFL, 0xFF00FF00FF00FF00L},
                {0x0000FFFF0000FFFFL, 0xFFFF0000FFFF0000L},
                {0x00000000FFFFFFFFL, 0xFFFFFFFF00000000L}
            };

            for (i = 0; i < 64; i++)
                output[i + offset] = input[i + offset];

            for (d = 5; d >= 0; d--)
            {
                s = 1 << d;
                for (i = 0; i < 64; i += s * 2)
                {
                    for (j = i; j < i + s; j++)
                    {
                        x = (output[j + offset] & masks[d, 0]) | ((output[j + s + offset] & masks[d, 0]) << s);
                        y = ((output[j + offset] & masks[d, 1]) >> s) | (output[j + s + offset] & masks[d, 1]);

                        output[j + 0 + offset] = x;
                        output[j + s + offset] = y;
                    }
                }
            }

        }

        internal abstract protected void SupportGen(ushort[] s, byte[] c);

    }
}