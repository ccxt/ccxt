using System;

namespace Org.BouncyCastle.Crypto.Digests
{
    public abstract class HarakaBase : IDigest
    {
        protected static readonly int DIGEST_SIZE = 32;

        protected static readonly byte[,] S = {
        {(byte)0x63, (byte)0x7c, (byte)0x77, (byte)0x7b, (byte)0xf2, (byte)0x6b, (byte)0x6f, (byte)0xc5, (byte)0x30, (byte)0x01, (byte)0x67, (byte)0x2b, (byte)0xfe, (byte)0xd7, (byte)0xab, (byte)0x76},
        {(byte)0xca, (byte)0x82, (byte)0xc9, (byte)0x7d, (byte)0xfa, (byte)0x59, (byte)0x47, (byte)0xf0, (byte)0xad, (byte)0xd4, (byte)0xa2, (byte)0xaf, (byte)0x9c, (byte)0xa4, (byte)0x72, (byte)0xc0},
        {(byte)0xb7, (byte)0xfd, (byte)0x93, (byte)0x26, (byte)0x36, (byte)0x3f, (byte)0xf7, (byte)0xcc, (byte)0x34, (byte)0xa5, (byte)0xe5, (byte)0xf1, (byte)0x71, (byte)0xd8, (byte)0x31, (byte)0x15},
        {(byte)0x04, (byte)0xc7, (byte)0x23, (byte)0xc3, (byte)0x18, (byte)0x96, (byte)0x05, (byte)0x9a, (byte)0x07, (byte)0x12, (byte)0x80, (byte)0xe2, (byte)0xeb, (byte)0x27, (byte)0xb2, (byte)0x75},
        {(byte)0x09, (byte)0x83, (byte)0x2c, (byte)0x1a, (byte)0x1b, (byte)0x6e, (byte)0x5a, (byte)0xa0, (byte)0x52, (byte)0x3b, (byte)0xd6, (byte)0xb3, (byte)0x29, (byte)0xe3, (byte)0x2f, (byte)0x84},
        {(byte)0x53, (byte)0xd1, (byte)0x00, (byte)0xed, (byte)0x20, (byte)0xfc, (byte)0xb1, (byte)0x5b, (byte)0x6a, (byte)0xcb, (byte)0xbe, (byte)0x39, (byte)0x4a, (byte)0x4c, (byte)0x58, (byte)0xcf},
        {(byte)0xd0, (byte)0xef, (byte)0xaa, (byte)0xfb, (byte)0x43, (byte)0x4d, (byte)0x33, (byte)0x85, (byte)0x45, (byte)0xf9, (byte)0x02, (byte)0x7f, (byte)0x50, (byte)0x3c, (byte)0x9f, (byte)0xa8},
        {(byte)0x51, (byte)0xa3, (byte)0x40, (byte)0x8f, (byte)0x92, (byte)0x9d, (byte)0x38, (byte)0xf5, (byte)0xbc, (byte)0xb6, (byte)0xda, (byte)0x21, (byte)0x10, (byte)0xff, (byte)0xf3, (byte)0xd2},
        {(byte)0xcd, (byte)0x0c, (byte)0x13, (byte)0xec, (byte)0x5f, (byte)0x97, (byte)0x44, (byte)0x17, (byte)0xc4, (byte)0xa7, (byte)0x7e, (byte)0x3d, (byte)0x64, (byte)0x5d, (byte)0x19, (byte)0x73},
        {(byte)0x60, (byte)0x81, (byte)0x4f, (byte)0xdc, (byte)0x22, (byte)0x2a, (byte)0x90, (byte)0x88, (byte)0x46, (byte)0xee, (byte)0xb8, (byte)0x14, (byte)0xde, (byte)0x5e, (byte)0x0b, (byte)0xdb},
        {(byte)0xe0, (byte)0x32, (byte)0x3a, (byte)0x0a, (byte)0x49, (byte)0x06, (byte)0x24, (byte)0x5c, (byte)0xc2, (byte)0xd3, (byte)0xac, (byte)0x62, (byte)0x91, (byte)0x95, (byte)0xe4, (byte)0x79},
        {(byte)0xe7, (byte)0xc8, (byte)0x37, (byte)0x6d, (byte)0x8d, (byte)0xd5, (byte)0x4e, (byte)0xa9, (byte)0x6c, (byte)0x56, (byte)0xf4, (byte)0xea, (byte)0x65, (byte)0x7a, (byte)0xae, (byte)0x08},
        {(byte)0xba, (byte)0x78, (byte)0x25, (byte)0x2e, (byte)0x1c, (byte)0xa6, (byte)0xb4, (byte)0xc6, (byte)0xe8, (byte)0xdd, (byte)0x74, (byte)0x1f, (byte)0x4b, (byte)0xbd, (byte)0x8b, (byte)0x8a},
        {(byte)0x70, (byte)0x3e, (byte)0xb5, (byte)0x66, (byte)0x48, (byte)0x03, (byte)0xf6, (byte)0x0e, (byte)0x61, (byte)0x35, (byte)0x57, (byte)0xb9, (byte)0x86, (byte)0xc1, (byte)0x1d, (byte)0x9e},
        {(byte)0xe1, (byte)0xf8, (byte)0x98, (byte)0x11, (byte)0x69, (byte)0xd9, (byte)0x8e, (byte)0x94, (byte)0x9b, (byte)0x1e, (byte)0x87, (byte)0xe9, (byte)0xce, (byte)0x55, (byte)0x28, (byte)0xdf},
        {(byte)0x8c, (byte)0xa1, (byte)0x89, (byte)0x0d, (byte)0xbf, (byte)0xe6, (byte)0x42, (byte)0x68, (byte)0x41, (byte)0x99, (byte)0x2d, (byte)0x0f, (byte)0xb0, (byte)0x54, (byte)0xbb, (byte)0x16}};

        public abstract string AlgorithmName { get; }

        static byte sBox(byte x)
        {
            return S[(uint)(((x & 0xFF) >> 4)),x & 0xF];
        }

        static byte[] subBytes(byte[] s)
        {
            byte[] output = new byte[s.Length];
            for(int i = 0; i < 16; ++i)
            {
                output[i] = sBox(s[i]);
            }
            return output;
        }

        static byte[] shiftRows(byte[] s)
        {
            return new byte[]{
            s[0], s[5], s[10], s[15],
            s[4], s[9], s[14], s[3],
            s[8], s[13], s[2], s[7],
            s[12], s[1], s[6], s[11]
        };
        }

        protected static byte[] aesEnc(byte[] s, byte[] rk)
        {
            s = subBytes(s);
            s = shiftRows(s);
            s = mixColumns(s);
            xorReverse(s, rk);
            return s;
        }

        static byte xTime(byte x)
        {
            if ((x >> 7) > 0)
            {
                return (byte)(((x << 1) ^ 0x1b) & 0xff);
            }
            else
            {
                return (byte)((x << 1) & 0xff);
            }
        }


        static void xorReverse(byte[] x, byte[] y)
        {
            x[0] = (byte)(x[0] ^ y[15]);
            x[1] = (byte)(x[1] ^ y[14]);
            x[2] = (byte)(x[2] ^ y[13]);
            x[3] = (byte)(x[3] ^ y[12]);
            x[4] = (byte)(x[4] ^ y[11]);
            x[5] = (byte)(x[5] ^ y[10]);
            x[6] = (byte)(x[6] ^ y[9]);
            x[7] = (byte)(x[7] ^ y[8]);
            x[8] = (byte)(x[8] ^ y[7]);
            x[9] = (byte)(x[9] ^ y[6]);
            x[10] = (byte)(x[10] ^ y[5]);
            x[11] = (byte)(x[11] ^ y[4]);
            x[12] = (byte)(x[12] ^ y[3]);
            x[13] = (byte)(x[13] ^ y[2]);
            x[14] = (byte)(x[14] ^ y[1]);
            x[15] = (byte)(x[15] ^ y[0]);
        }


        protected static byte[] Xor(byte[] x, byte[] y, int yStart)
        {
            byte[] output = new byte[16];
            for (int i = 0; i < output.Length; i++)
            {
                output[i] = (byte)(x[i] ^ y[yStart++]);
            }
            return output;
        }


        static private byte[] mixColumns(byte[] s)
        {
            byte[] output = new byte[s.Length];
            int j = 0, i4;
            for (int i = 0; i < 4; i++)
            {
                i4 = i << 2;
                output[j++] = (byte)(xTime(s[i4]) ^ xTime(s[i4 + 1]) ^ s[i4 + 1] ^ s[i4 + 2] ^ s[i4 + 3]);
                output[j++] = (byte)(s[i4] ^ xTime(s[i4 + 1]) ^ xTime(s[i4 + 2]) ^ s[i4 + 2] ^ s[i4 + 3]);
                output[j++] = (byte)(s[i4] ^ s[i4 + 1] ^ xTime(s[i4 + 2]) ^ xTime(s[i4 + 3]) ^ s[i4 + 3]);
                output[j++] = (byte)(xTime(s[i4]) ^ s[i4] ^ s[i4 + 1] ^ s[i4 + 2] ^ xTime(s[i4 + 3]));
            }

            return output;
        }

        public int GetDigestSize()
        {
            return DIGEST_SIZE;
        }

        public int GetByteLength()
        {
            throw new NotImplementedException();
        }

        public abstract void Update(byte input);

        public abstract void BlockUpdate(byte[] input, int inOff, int length);

        public abstract int DoFinal(byte[] output, int outOff);

        public abstract void Reset();

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public abstract void BlockUpdate(ReadOnlySpan<byte> input);

        public abstract int DoFinal(Span<byte> output);
#endif
    }
}
