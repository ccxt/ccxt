using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * an implementation of the AES (Rijndael), from FIPS-197.
    * <p>
    * For further details see: <a href="http://csrc.nist.gov/encryption/aes/">http://csrc.nist.gov/encryption/aes/</a>.
    *
    * This implementation is based on optimizations from Dr. Brian Gladman's paper and C code at
    * <a href="http://fp.gladman.plus.com/cryptography_technology/rijndael/">http://fp.gladman.plus.com/cryptography_technology/rijndael/</a>
    *
    * There are three levels of tradeoff of speed vs memory
    * Because java has no preprocessor, they are written as three separate classes from which to choose
    *
    * The fastest uses 8Kbytes of static tables to precompute round calculations, 4 256 word tables for encryption
    * and 4 for decryption.
    *
    * The middle performance version uses only one 256 word table for each, for a total of 2Kbytes,
    * adding 12 rotate operations per round to compute the values contained in the other tables from
    * the contents of the first
    *
    * The slowest version uses no static tables at all and computes the values
    * in each round.
    * </p>
    * <p>
    * This file contains the slowest performance version with no static tables
    * for round precomputation, but it has the smallest foot print.
    * </p>
    */
    public sealed class AesLightEngine
        : IBlockCipher
    {
        // The S box
        private static readonly byte[] S =
        {
            99, 124, 119, 123, 242, 107, 111, 197,
            48,   1, 103,  43, 254, 215, 171, 118,
            202, 130, 201, 125, 250,  89,  71, 240,
            173, 212, 162, 175, 156, 164, 114, 192,
            183, 253, 147,  38,  54,  63, 247, 204,
            52, 165, 229, 241, 113, 216,  49,  21,
            4, 199,  35, 195,  24, 150,   5, 154,
            7,  18, 128, 226, 235,  39, 178, 117,
            9, 131,  44,  26,  27, 110,  90, 160,
            82,  59, 214, 179,  41, 227,  47, 132,
            83, 209,   0, 237,  32, 252, 177,  91,
            106, 203, 190,  57,  74,  76,  88, 207,
            208, 239, 170, 251,  67,  77,  51, 133,
            69, 249,   2, 127,  80,  60, 159, 168,
            81, 163,  64, 143, 146, 157,  56, 245,
            188, 182, 218,  33,  16, 255, 243, 210,
            205,  12,  19, 236,  95, 151,  68,  23,
            196, 167, 126,  61, 100,  93,  25, 115,
            96, 129,  79, 220,  34,  42, 144, 136,
            70, 238, 184,  20, 222,  94,  11, 219,
            224,  50,  58,  10,  73,   6,  36,  92,
            194, 211, 172,  98, 145, 149, 228, 121,
            231, 200,  55, 109, 141, 213,  78, 169,
            108,  86, 244, 234, 101, 122, 174,   8,
            186, 120,  37,  46,  28, 166, 180, 198,
            232, 221, 116,  31,  75, 189, 139, 138,
            112,  62, 181, 102,  72,   3, 246,  14,
            97,  53,  87, 185, 134, 193,  29, 158,
            225, 248, 152,  17, 105, 217, 142, 148,
            155,  30, 135, 233, 206,  85,  40, 223,
            140, 161, 137,  13, 191, 230,  66, 104,
            65, 153,  45,  15, 176,  84, 187,  22,
        };

        // The inverse S-box
        private static readonly byte[] Si =
        {
            82,   9, 106, 213,  48,  54, 165,  56,
            191,  64, 163, 158, 129, 243, 215, 251,
            124, 227,  57, 130, 155,  47, 255, 135,
            52, 142,  67,  68, 196, 222, 233, 203,
            84, 123, 148,  50, 166, 194,  35,  61,
            238,  76, 149,  11,  66, 250, 195,  78,
            8,  46, 161, 102,  40, 217,  36, 178,
            118,  91, 162,  73, 109, 139, 209,  37,
            114, 248, 246, 100, 134, 104, 152,  22,
            212, 164,  92, 204,  93, 101, 182, 146,
            108, 112,  72,  80, 253, 237, 185, 218,
            94,  21,  70,  87, 167, 141, 157, 132,
            144, 216, 171,   0, 140, 188, 211,  10,
            247, 228,  88,   5, 184, 179,  69,   6,
            208,  44,  30, 143, 202,  63,  15,   2,
            193, 175, 189,   3,   1,  19, 138, 107,
            58, 145,  17,  65,  79, 103, 220, 234,
            151, 242, 207, 206, 240, 180, 230, 115,
            150, 172, 116,  34, 231, 173,  53, 133,
            226, 249,  55, 232,  28, 117, 223, 110,
            71, 241,  26, 113,  29,  41, 197, 137,
            111, 183,  98,  14, 170,  24, 190,  27,
            252,  86,  62,  75, 198, 210, 121,  32,
            154, 219, 192, 254, 120, 205,  90, 244,
            31, 221, 168,  51, 136,   7, 199,  49,
            177,  18,  16,  89,  39, 128, 236,  95,
            96,  81, 127, 169,  25, 181,  74,  13,
            45, 229, 122, 159, 147, 201, 156, 239,
            160, 224,  59,  77, 174,  42, 245, 176,
            200, 235, 187,  60, 131,  83, 153,  97,
            23,  43,   4, 126, 186, 119, 214,  38,
            225, 105,  20,  99,  85,  33,  12, 125,
        };

        // vector used in calculating key schedule (powers of x in GF(256))
        private static readonly byte[] rcon =
        {
            0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a,
            0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91
        };

        private static uint Shift(uint r, int shift)
        {
            return (r >> shift) | (r << (32 - shift));
        }

        /* multiply four bytes in GF(2^8) by 'x' {02} in parallel */

        private const uint m1 = 0x80808080;
        private const uint m2 = 0x7f7f7f7f;
        private const uint m3 = 0x0000001b;
        private const uint m4 = 0xC0C0C0C0;
        private const uint m5 = 0x3f3f3f3f;

        private static uint FFmulX(uint x)
        {
            return ((x & m2) << 1) ^ (((x & m1) >> 7) * m3);
        }

        private static uint FFmulX2(uint x)
        {
            uint t0  = (x & m5) << 2;
            uint t1  = (x & m4);
                 t1 ^= (t1 >> 1);
            return t0 ^ (t1 >> 2) ^ (t1 >> 5);
        }

        /*
        The following defines provide alternative definitions of FFmulX that might
        give improved performance if a fast 32-bit multiply is not available.

        private int FFmulX(int x) { int u = x & m1; u |= (u >> 1); return ((x & m2) << 1) ^ ((u >>> 3) | (u >>> 6)); }
        private static final int  m4 = 0x1b1b1b1b;
        private int FFmulX(int x) { int u = x & m1; return ((x & m2) << 1) ^ ((u - (u >>> 7)) & m4); }

        */

        private static uint Mcol(uint x)
        {
            uint t0, t1;
            t0 = Shift(x, 8);
            t1 = x ^ t0;
            return Shift(t1, 16) ^ t0 ^ FFmulX(t1);
        }

        private static uint Inv_Mcol(uint x)
        {
            uint t0, t1;
            t0  = x;
            t1  = t0 ^ Shift(t0, 8);
            t0 ^= FFmulX(t1);
            t1 ^= FFmulX2(t0);
            t0 ^= t1 ^ Shift(t1, 16);
            return t0;
        }

        private static uint SubWord(uint x)
        {
            return (uint)S[x&255]
                | (((uint)S[(x>>8)&255]) << 8)
                | (((uint)S[(x>>16)&255]) << 16)
                | (((uint)S[(x>>24)&255]) << 24);
        }

        /**
        * Calculate the necessary round keys
        * The number of calculations depends on key size and block size
        * AES specified a fixed block size of 128 bits and key sizes 128/192/256 bits
        * This code is written assuming those are the only possible values
        */
        private uint[][] GenerateWorkingKey(byte[] key, bool forEncryption)
        {
            int keyLen = key.Length;
            if (keyLen < 16 || keyLen > 32 || (keyLen & 7) != 0)
                throw new ArgumentException("Key length not 128/192/256 bits.");

            int KC = keyLen >> 2;
            this.ROUNDS = KC + 6;  // This is not always true for the generalized Rijndael that allows larger block sizes

            uint[][] W = new uint[ROUNDS + 1][]; // 4 words in a block
            for (int i = 0; i <= ROUNDS; ++i)
            {
                W[i] = new uint[4];
            }

            switch (KC)
            {
                case 4:
                {
                    uint t0 = Pack.LE_To_UInt32(key,  0); W[0][0] = t0;
                    uint t1 = Pack.LE_To_UInt32(key,  4); W[0][1] = t1;
                    uint t2 = Pack.LE_To_UInt32(key,  8); W[0][2] = t2;
                    uint t3 = Pack.LE_To_UInt32(key, 12); W[0][3] = t3;

                    for (int i = 1; i <= 10; ++i)
                    {
                        uint u = SubWord(Shift(t3, 8)) ^ rcon[i - 1];
                        t0 ^= u;  W[i][0] = t0;
                        t1 ^= t0; W[i][1] = t1;
                        t2 ^= t1; W[i][2] = t2;
                        t3 ^= t2; W[i][3] = t3;
                    }

                    break;
                }
                case 6:
                {
                    uint t0 = Pack.LE_To_UInt32(key,  0); W[0][0] = t0;
                    uint t1 = Pack.LE_To_UInt32(key,  4); W[0][1] = t1;
                    uint t2 = Pack.LE_To_UInt32(key,  8); W[0][2] = t2;
                    uint t3 = Pack.LE_To_UInt32(key, 12); W[0][3] = t3;
                    uint t4 = Pack.LE_To_UInt32(key, 16); W[1][0] = t4;
                    uint t5 = Pack.LE_To_UInt32(key, 20); W[1][1] = t5;

                    uint rcon = 1;
                    uint u = SubWord(Shift(t5, 8)) ^ rcon; rcon <<= 1;
                    t0 ^= u;  W[1][2] = t0;
                    t1 ^= t0; W[1][3] = t1;
                    t2 ^= t1; W[2][0] = t2;
                    t3 ^= t2; W[2][1] = t3;
                    t4 ^= t3; W[2][2] = t4;
                    t5 ^= t4; W[2][3] = t5;

                    for (int i = 3; i < 12; i += 3)
                    {
                        u = SubWord(Shift(t5, 8)) ^ rcon; rcon <<= 1;
                        t0 ^= u;  W[i    ][0] = t0;
                        t1 ^= t0; W[i    ][1] = t1;
                        t2 ^= t1; W[i    ][2] = t2;
                        t3 ^= t2; W[i    ][3] = t3;
                        t4 ^= t3; W[i + 1][0] = t4;
                        t5 ^= t4; W[i + 1][1] = t5;
                        u = SubWord(Shift(t5, 8)) ^ rcon; rcon <<= 1;
                        t0 ^= u;  W[i + 1][2] = t0;
                        t1 ^= t0; W[i + 1][3] = t1;
                        t2 ^= t1; W[i + 2][0] = t2;
                        t3 ^= t2; W[i + 2][1] = t3;
                        t4 ^= t3; W[i + 2][2] = t4;
                        t5 ^= t4; W[i + 2][3] = t5;
                    }

                    u = SubWord(Shift(t5, 8)) ^ rcon;
                    t0 ^= u;  W[12][0] = t0;
                    t1 ^= t0; W[12][1] = t1;
                    t2 ^= t1; W[12][2] = t2;
                    t3 ^= t2; W[12][3] = t3;

                    break;
                }
                case 8:
                {
                    uint t0 = Pack.LE_To_UInt32(key,  0); W[0][0] = t0;
                    uint t1 = Pack.LE_To_UInt32(key,  4); W[0][1] = t1;
                    uint t2 = Pack.LE_To_UInt32(key,  8); W[0][2] = t2;
                    uint t3 = Pack.LE_To_UInt32(key, 12); W[0][3] = t3;
                    uint t4 = Pack.LE_To_UInt32(key, 16); W[1][0] = t4;
                    uint t5 = Pack.LE_To_UInt32(key, 20); W[1][1] = t5;
                    uint t6 = Pack.LE_To_UInt32(key, 24); W[1][2] = t6;
                    uint t7 = Pack.LE_To_UInt32(key, 28); W[1][3] = t7;

                    uint u, rcon = 1;

                    for (int i = 2; i < 14; i += 2)
                    {
                        u = SubWord(Shift(t7, 8)) ^ rcon; rcon <<= 1;
                        t0 ^= u;  W[i    ][0] = t0;
                        t1 ^= t0; W[i    ][1] = t1;
                        t2 ^= t1; W[i    ][2] = t2;
                        t3 ^= t2; W[i    ][3] = t3;
                        u = SubWord(t3);
                        t4 ^= u;  W[i + 1][0] = t4;
                        t5 ^= t4; W[i + 1][1] = t5;
                        t6 ^= t5; W[i + 1][2] = t6;
                        t7 ^= t6; W[i + 1][3] = t7;
                    }

                    u = SubWord(Shift(t7, 8)) ^ rcon;
                    t0 ^= u;  W[14][0] = t0;
                    t1 ^= t0; W[14][1] = t1;
                    t2 ^= t1; W[14][2] = t2;
                    t3 ^= t2; W[14][3] = t3;

                    break;
                }
                default:
                {
                    throw new InvalidOperationException("Should never get here");
                }
            }

            if (!forEncryption)
            {
                for (int j = 1; j < ROUNDS; j++)
                {
                    uint[] w = W[j];
                    for (int i = 0; i < 4; i++)
                    {
                        w[i] = Inv_Mcol(w[i]);
                    }
                }
            }

            return W;
        }

        private int ROUNDS;
        private uint[][] WorkingKey;
        private bool forEncryption;

        private const int BLOCK_SIZE = 16;

        /**
        * default constructor - 128 bit block size.
        */
        public AesLightEngine()
        {
        }

        /**
        * initialise an AES cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param parameters the parameters required to set up the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (!(parameters is KeyParameter keyParameter))
                throw new ArgumentException("invalid parameter passed to AES init - "
                    + Platform.GetTypeName(parameters));

            WorkingKey = GenerateWorkingKey(keyParameter.GetKey(), forEncryption);

            this.forEncryption = forEncryption;
        }

        public string AlgorithmName
        {
            get { return "AES"; }
        }

        public int GetBlockSize()
        {
            return BLOCK_SIZE;
        }

        public int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
            if (WorkingKey == null)
                throw new InvalidOperationException("AES engine not initialised");

            Check.DataLength(input, inOff, 16, "input buffer too short");
            Check.OutputLength(output, outOff, 16, "output buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            if (forEncryption)
            {
                EncryptBlock(input.AsSpan(inOff), output.AsSpan(outOff), WorkingKey);
            }
            else
            {
                DecryptBlock(input.AsSpan(inOff), output.AsSpan(outOff), WorkingKey);
            }
#else
            if (forEncryption)
            {
                EncryptBlock(input, inOff, output, outOff, WorkingKey);
            }
            else
            {
                DecryptBlock(input, inOff, output, outOff, WorkingKey);
            }
#endif

            return BLOCK_SIZE;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (WorkingKey == null)
                throw new InvalidOperationException("AES engine not initialised");

            Check.DataLength(input, 16, "input buffer too short");
            Check.OutputLength(output, 16, "output buffer too short");

            if (forEncryption)
            {
                EncryptBlock(input, output, WorkingKey);
            }
            else
            {
                DecryptBlock(input, output, WorkingKey);
            }

            return BLOCK_SIZE;
        }
#endif

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output, uint[][] KW)
        {
            uint C0 = Pack.LE_To_UInt32(input);
            uint C1 = Pack.LE_To_UInt32(input[4..]);
            uint C2 = Pack.LE_To_UInt32(input[8..]);
            uint C3 = Pack.LE_To_UInt32(input[12..]);

            uint[] kw = KW[0];
            uint t0 = C0 ^ kw[0];
            uint t1 = C1 ^ kw[1];
            uint t2 = C2 ^ kw[2];

            uint r0, r1, r2, r3 = C3 ^ kw[3];
            int r = 1;
            while (r < ROUNDS - 1)
            {
                kw = KW[r++];
                r0 = Mcol((uint)S[t0 & 255] ^ (((uint)S[(t1 >> 8) & 255]) << 8) ^ (((uint)S[(t2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24)) ^ kw[0];
                r1 = Mcol((uint)S[t1 & 255] ^ (((uint)S[(t2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(t0 >> 24) & 255]) << 24)) ^ kw[1];
                r2 = Mcol((uint)S[t2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(t0 >> 16) & 255]) << 16) ^ (((uint)S[(t1 >> 24) & 255]) << 24)) ^ kw[2];
                r3 = Mcol((uint)S[r3 & 255] ^ (((uint)S[(t0 >> 8) & 255]) << 8) ^ (((uint)S[(t1 >> 16) & 255]) << 16) ^ (((uint)S[(t2 >> 24) & 255]) << 24)) ^ kw[3];
                kw = KW[r++];
                t0 = Mcol((uint)S[r0 & 255] ^ (((uint)S[(r1 >> 8) & 255]) << 8) ^ (((uint)S[(r2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24)) ^ kw[0];
                t1 = Mcol((uint)S[r1 & 255] ^ (((uint)S[(r2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(r0 >> 24) & 255]) << 24)) ^ kw[1];
                t2 = Mcol((uint)S[r2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(r0 >> 16) & 255]) << 16) ^ (((uint)S[(r1 >> 24) & 255]) << 24)) ^ kw[2];
                r3 = Mcol((uint)S[r3 & 255] ^ (((uint)S[(r0 >> 8) & 255]) << 8) ^ (((uint)S[(r1 >> 16) & 255]) << 16) ^ (((uint)S[(r2 >> 24) & 255]) << 24)) ^ kw[3];
            }

            kw = KW[r++];
            r0 = Mcol((uint)S[t0 & 255] ^ (((uint)S[(t1 >> 8) & 255]) << 8) ^ (((uint)S[(t2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24)) ^ kw[0];
            r1 = Mcol((uint)S[t1 & 255] ^ (((uint)S[(t2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(t0 >> 24) & 255]) << 24)) ^ kw[1];
            r2 = Mcol((uint)S[t2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(t0 >> 16) & 255]) << 16) ^ (((uint)S[(t1 >> 24) & 255]) << 24)) ^ kw[2];
            r3 = Mcol((uint)S[r3 & 255] ^ (((uint)S[(t0 >> 8) & 255]) << 8) ^ (((uint)S[(t1 >> 16) & 255]) << 16) ^ (((uint)S[(t2 >> 24) & 255]) << 24)) ^ kw[3];

            // the final round is a simple function of S

            kw = KW[r];
            C0 = (uint)S[r0 & 255] ^ (((uint)S[(r1 >> 8) & 255]) << 8) ^ (((uint)S[(r2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)S[r1 & 255] ^ (((uint)S[(r2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(r0 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)S[r2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(r0 >> 16) & 255]) << 16) ^ (((uint)S[(r1 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)S[r3 & 255] ^ (((uint)S[(r0 >> 8) & 255]) << 8) ^ (((uint)S[(r1 >> 16) & 255]) << 16) ^ (((uint)S[(r2 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output);
            Pack.UInt32_To_LE(C1, output[4..]);
            Pack.UInt32_To_LE(C2, output[8..]);
            Pack.UInt32_To_LE(C3, output[12..]);
        }

        private void DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output, uint[][] KW)
        {
            uint C0 = Pack.LE_To_UInt32(input);
            uint C1 = Pack.LE_To_UInt32(input[4..]);
            uint C2 = Pack.LE_To_UInt32(input[8..]);
            uint C3 = Pack.LE_To_UInt32(input[12..]);

            uint[] kw = KW[ROUNDS];
            uint t0 = C0 ^ kw[0];
            uint t1 = C1 ^ kw[1];
            uint t2 = C2 ^ kw[2];

            uint r0, r1, r2, r3 = C3 ^ kw[3];
            int r = ROUNDS - 1;
            while (r > 1)
            {
                kw = KW[r--];
                r0 = Inv_Mcol((uint)Si[t0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(t2 >> 16) & 255]) << 16) ^ ((uint)Si[(t1 >> 24) & 255] << 24)) ^ kw[0];
                r1 = Inv_Mcol((uint)Si[t1 & 255] ^ (((uint)Si[(t0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ ((uint)Si[(t2 >> 24) & 255] << 24)) ^ kw[1];
                r2 = Inv_Mcol((uint)Si[t2 & 255] ^ (((uint)Si[(t1 >> 8) & 255]) << 8) ^ (((uint)Si[(t0 >> 16) & 255]) << 16) ^ ((uint)Si[(r3 >> 24) & 255] << 24)) ^ kw[2];
                r3 = Inv_Mcol((uint)Si[r3 & 255] ^ (((uint)Si[(t2 >> 8) & 255]) << 8) ^ (((uint)Si[(t1 >> 16) & 255]) << 16) ^ ((uint)Si[(t0 >> 24) & 255] << 24)) ^ kw[3];
                kw = KW[r--];
                t0 = Inv_Mcol((uint)Si[r0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(r2 >> 16) & 255]) << 16) ^ ((uint)Si[(r1 >> 24) & 255] << 24)) ^ kw[0];
                t1 = Inv_Mcol((uint)Si[r1 & 255] ^ (((uint)Si[(r0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ ((uint)Si[(r2 >> 24) & 255] << 24)) ^ kw[1];
                t2 = Inv_Mcol((uint)Si[r2 & 255] ^ (((uint)Si[(r1 >> 8) & 255]) << 8) ^ (((uint)Si[(r0 >> 16) & 255]) << 16) ^ ((uint)Si[(r3 >> 24) & 255] << 24)) ^ kw[2];
                r3 = Inv_Mcol((uint)Si[r3 & 255] ^ (((uint)Si[(r2 >> 8) & 255]) << 8) ^ (((uint)Si[(r1 >> 16) & 255]) << 16) ^ ((uint)Si[(r0 >> 24) & 255] << 24)) ^ kw[3];
            }

            kw = KW[1];
            r0 = Inv_Mcol((uint)Si[t0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(t2 >> 16) & 255]) << 16) ^ ((uint)Si[(t1 >> 24) & 255] << 24)) ^ kw[0];
            r1 = Inv_Mcol((uint)Si[t1 & 255] ^ (((uint)Si[(t0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ ((uint)Si[(t2 >> 24) & 255] << 24)) ^ kw[1];
            r2 = Inv_Mcol((uint)Si[t2 & 255] ^ (((uint)Si[(t1 >> 8) & 255]) << 8) ^ (((uint)Si[(t0 >> 16) & 255]) << 16) ^ ((uint)Si[(r3 >> 24) & 255] << 24)) ^ kw[2];
            r3 = Inv_Mcol((uint)Si[r3 & 255] ^ (((uint)Si[(t2 >> 8) & 255]) << 8) ^ (((uint)Si[(t1 >> 16) & 255]) << 16) ^ ((uint)Si[(t0 >> 24) & 255] << 24)) ^ kw[3];

            // the final round's table is a simple function of Si

            kw = KW[0];
            C0 = (uint)Si[r0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(r2 >> 16) & 255]) << 16) ^ (((uint)Si[(r1 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)Si[r1 & 255] ^ (((uint)Si[(r0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ (((uint)Si[(r2 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)Si[r2 & 255] ^ (((uint)Si[(r1 >> 8) & 255]) << 8) ^ (((uint)Si[(r0 >> 16) & 255]) << 16) ^ (((uint)Si[(r3 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)Si[r3 & 255] ^ (((uint)Si[(r2 >> 8) & 255]) << 8) ^ (((uint)Si[(r1 >> 16) & 255]) << 16) ^ (((uint)Si[(r0 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output);
            Pack.UInt32_To_LE(C1, output[4..]);
            Pack.UInt32_To_LE(C2, output[8..]);
            Pack.UInt32_To_LE(C3, output[12..]);
        }
#else
        private void EncryptBlock(byte[] input, int inOff, byte[] output, int outOff, uint[][] KW)
        {
            uint C0 = Pack.LE_To_UInt32(input, inOff + 0);
            uint C1 = Pack.LE_To_UInt32(input, inOff + 4);
            uint C2 = Pack.LE_To_UInt32(input, inOff + 8);
            uint C3 = Pack.LE_To_UInt32(input, inOff + 12);

            uint[] kw = KW[0];
            uint t0 = C0 ^ kw[0];
            uint t1 = C1 ^ kw[1];
            uint t2 = C2 ^ kw[2];

            uint r0, r1, r2, r3 = C3 ^ kw[3];
            int r = 1;
            while (r < ROUNDS - 1)
            {
                kw = KW[r++];
                r0 = Mcol((uint)S[t0 & 255] ^ (((uint)S[(t1 >> 8) & 255]) << 8) ^ (((uint)S[(t2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24)) ^ kw[0];
                r1 = Mcol((uint)S[t1 & 255] ^ (((uint)S[(t2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(t0 >> 24) & 255]) << 24)) ^ kw[1];
                r2 = Mcol((uint)S[t2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(t0 >> 16) & 255]) << 16) ^ (((uint)S[(t1 >> 24) & 255]) << 24)) ^ kw[2];
                r3 = Mcol((uint)S[r3 & 255] ^ (((uint)S[(t0 >> 8) & 255]) << 8) ^ (((uint)S[(t1 >> 16) & 255]) << 16) ^ (((uint)S[(t2 >> 24) & 255]) << 24)) ^ kw[3];
                kw = KW[r++];
                t0 = Mcol((uint)S[r0 & 255] ^ (((uint)S[(r1 >> 8) & 255]) << 8) ^ (((uint)S[(r2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24)) ^ kw[0];
                t1 = Mcol((uint)S[r1 & 255] ^ (((uint)S[(r2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(r0 >> 24) & 255]) << 24)) ^ kw[1];
                t2 = Mcol((uint)S[r2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(r0 >> 16) & 255]) << 16) ^ (((uint)S[(r1 >> 24) & 255]) << 24)) ^ kw[2];
                r3 = Mcol((uint)S[r3 & 255] ^ (((uint)S[(r0 >> 8) & 255]) << 8) ^ (((uint)S[(r1 >> 16) & 255]) << 16) ^ (((uint)S[(r2 >> 24) & 255]) << 24)) ^ kw[3];
            }

            kw = KW[r++];
            r0 = Mcol((uint)S[t0 & 255] ^ (((uint)S[(t1 >> 8) & 255]) << 8) ^ (((uint)S[(t2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24)) ^ kw[0];
            r1 = Mcol((uint)S[t1 & 255] ^ (((uint)S[(t2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(t0 >> 24) & 255]) << 24)) ^ kw[1];
            r2 = Mcol((uint)S[t2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(t0 >> 16) & 255]) << 16) ^ (((uint)S[(t1 >> 24) & 255]) << 24)) ^ kw[2];
            r3 = Mcol((uint)S[r3 & 255] ^ (((uint)S[(t0 >> 8) & 255]) << 8) ^ (((uint)S[(t1 >> 16) & 255]) << 16) ^ (((uint)S[(t2 >> 24) & 255]) << 24)) ^ kw[3];

            // the final round is a simple function of S

            kw = KW[r];
            C0 = (uint)S[r0 & 255] ^ (((uint)S[(r1 >> 8) & 255]) << 8) ^ (((uint)S[(r2 >> 16) & 255]) << 16) ^ (((uint)S[(r3 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)S[r1 & 255] ^ (((uint)S[(r2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)S[(r0 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)S[r2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(r0 >> 16) & 255]) << 16) ^ (((uint)S[(r1 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)S[r3 & 255] ^ (((uint)S[(r0 >> 8) & 255]) << 8) ^ (((uint)S[(r1 >> 16) & 255]) << 16) ^ (((uint)S[(r2 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output, outOff + 0);
            Pack.UInt32_To_LE(C1, output, outOff + 4);
            Pack.UInt32_To_LE(C2, output, outOff + 8);
            Pack.UInt32_To_LE(C3, output, outOff + 12);
        }

        private void DecryptBlock(byte[] input, int inOff, byte[] output, int outOff, uint[][] KW)
        {
            uint C0 = Pack.LE_To_UInt32(input, inOff + 0);
            uint C1 = Pack.LE_To_UInt32(input, inOff + 4);
            uint C2 = Pack.LE_To_UInt32(input, inOff + 8);
            uint C3 = Pack.LE_To_UInt32(input, inOff + 12);

            uint[] kw = KW[ROUNDS];
            uint t0 = C0 ^ kw[0];
            uint t1 = C1 ^ kw[1];
            uint t2 = C2 ^ kw[2];

            uint r0, r1, r2, r3 = C3 ^ kw[3];
            int r = ROUNDS - 1;
            while (r > 1)
            {
                kw = KW[r--];
                r0 = Inv_Mcol((uint)Si[t0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(t2 >> 16) & 255]) << 16) ^ ((uint)Si[(t1 >> 24) & 255] << 24)) ^ kw[0];
                r1 = Inv_Mcol((uint)Si[t1 & 255] ^ (((uint)Si[(t0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ ((uint)Si[(t2 >> 24) & 255] << 24)) ^ kw[1];
                r2 = Inv_Mcol((uint)Si[t2 & 255] ^ (((uint)Si[(t1 >> 8) & 255]) << 8) ^ (((uint)Si[(t0 >> 16) & 255]) << 16) ^ ((uint)Si[(r3 >> 24) & 255] << 24)) ^ kw[2];
                r3 = Inv_Mcol((uint)Si[r3 & 255] ^ (((uint)Si[(t2 >> 8) & 255]) << 8) ^ (((uint)Si[(t1 >> 16) & 255]) << 16) ^ ((uint)Si[(t0 >> 24) & 255] << 24)) ^ kw[3];
                kw = KW[r--];
                t0 = Inv_Mcol((uint)Si[r0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(r2 >> 16) & 255]) << 16) ^ ((uint)Si[(r1 >> 24) & 255] << 24)) ^ kw[0];
                t1 = Inv_Mcol((uint)Si[r1 & 255] ^ (((uint)Si[(r0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ ((uint)Si[(r2 >> 24) & 255] << 24)) ^ kw[1];
                t2 = Inv_Mcol((uint)Si[r2 & 255] ^ (((uint)Si[(r1 >> 8) & 255]) << 8) ^ (((uint)Si[(r0 >> 16) & 255]) << 16) ^ ((uint)Si[(r3 >> 24) & 255] << 24)) ^ kw[2];
                r3 = Inv_Mcol((uint)Si[r3 & 255] ^ (((uint)Si[(r2 >> 8) & 255]) << 8) ^ (((uint)Si[(r1 >> 16) & 255]) << 16) ^ ((uint)Si[(r0 >> 24) & 255] << 24)) ^ kw[3];
            }

            kw = KW[1];
            r0 = Inv_Mcol((uint)Si[t0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(t2 >> 16) & 255]) << 16) ^ ((uint)Si[(t1 >> 24) & 255] << 24)) ^ kw[0];
            r1 = Inv_Mcol((uint)Si[t1 & 255] ^ (((uint)Si[(t0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ ((uint)Si[(t2 >> 24) & 255] << 24)) ^ kw[1];
            r2 = Inv_Mcol((uint)Si[t2 & 255] ^ (((uint)Si[(t1 >> 8) & 255]) << 8) ^ (((uint)Si[(t0 >> 16) & 255]) << 16) ^ ((uint)Si[(r3 >> 24) & 255] << 24)) ^ kw[2];
            r3 = Inv_Mcol((uint)Si[r3 & 255] ^ (((uint)Si[(t2 >> 8) & 255]) << 8) ^ (((uint)Si[(t1 >> 16) & 255]) << 16) ^ ((uint)Si[(t0 >> 24) & 255] << 24)) ^ kw[3];

            // the final round's table is a simple function of Si

            kw = KW[0];
            C0 = (uint)Si[r0 & 255] ^ (((uint)Si[(r3 >> 8) & 255]) << 8) ^ (((uint)Si[(r2 >> 16) & 255]) << 16) ^ (((uint)Si[(r1 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)Si[r1 & 255] ^ (((uint)Si[(r0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ (((uint)Si[(r2 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)Si[r2 & 255] ^ (((uint)Si[(r1 >> 8) & 255]) << 8) ^ (((uint)Si[(r0 >> 16) & 255]) << 16) ^ (((uint)Si[(r3 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)Si[r3 & 255] ^ (((uint)Si[(r2 >> 8) & 255]) << 8) ^ (((uint)Si[(r1 >> 16) & 255]) << 16) ^ (((uint)Si[(r0 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output, outOff + 0);
            Pack.UInt32_To_LE(C1, output, outOff + 4);
            Pack.UInt32_To_LE(C2, output, outOff + 8);
            Pack.UInt32_To_LE(C3, output, outOff + 12);
        }
#endif
    }
}
