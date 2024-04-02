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
    * the contents of the first.
    *
    * The slowest version uses no static tables at all and computes the values in each round.
    * </p>
    * <p>
    * This file contains the middle performance version with 2Kbytes of static tables for round precomputation.
    * </p>
    */
    public sealed class AesEngine
        : IBlockCipher
    {
        // The S box
        private static readonly byte[] S =
        {
            99,	124, 119, 123, 242, 107, 111, 197,
            48, 1, 103, 43, 254, 215, 171, 118,
            202, 130, 201, 125, 250, 89, 71, 240,
            173, 212, 162, 175, 156, 164, 114, 192,
            183, 253, 147, 38, 54, 63, 247, 204,
            52, 165, 229, 241, 113, 216, 49, 21,
            4, 199, 35, 195, 24, 150, 5, 154,
            7, 18, 128, 226, 235, 39, 178, 117,
            9, 131, 44, 26, 27, 110, 90, 160,
            82, 59, 214, 179, 41, 227, 47, 132,
            83, 209, 0, 237, 32, 252, 177, 91,
            106, 203, 190, 57, 74, 76, 88, 207,
            208, 239, 170, 251, 67, 77, 51, 133,
            69, 249, 2, 127, 80, 60, 159, 168,
            81, 163, 64, 143, 146, 157, 56, 245,
            188, 182, 218, 33, 16, 255, 243, 210,
            205, 12, 19, 236, 95, 151, 68, 23,
            196, 167, 126, 61, 100, 93, 25, 115,
            96, 129, 79, 220, 34, 42, 144, 136,
            70, 238, 184, 20, 222, 94, 11, 219,
            224, 50, 58, 10, 73, 6, 36, 92,
            194, 211, 172, 98, 145, 149, 228, 121,
            231, 200, 55, 109, 141, 213, 78, 169,
            108, 86, 244, 234, 101, 122, 174, 8,
            186, 120, 37, 46, 28, 166, 180, 198,
            232, 221, 116, 31, 75, 189, 139, 138,
            112, 62, 181, 102, 72, 3, 246, 14,
            97, 53, 87, 185, 134, 193, 29, 158,
            225, 248, 152, 17, 105, 217, 142, 148,
            155, 30, 135, 233, 206, 85, 40, 223,
            140, 161, 137, 13, 191, 230, 66, 104,
            65, 153, 45, 15, 176, 84, 187, 22,
        };

        // The inverse S-box
        private static readonly byte[] Si =
        {
            82, 9, 106, 213, 48, 54, 165, 56,
            191, 64, 163, 158, 129, 243, 215, 251,
            124, 227, 57, 130, 155, 47, 255, 135,
            52, 142, 67, 68, 196, 222, 233, 203,
            84, 123, 148, 50, 166, 194, 35, 61,
            238, 76, 149, 11, 66, 250, 195, 78,
            8, 46, 161, 102, 40, 217, 36, 178,
            118, 91, 162, 73, 109, 139, 209, 37,
            114, 248, 246, 100, 134, 104, 152, 22,
            212, 164, 92, 204, 93, 101, 182, 146,
            108, 112, 72, 80, 253, 237, 185, 218,
            94, 21, 70, 87, 167, 141, 157, 132,
            144, 216, 171, 0, 140, 188, 211, 10,
            247, 228, 88, 5, 184, 179, 69, 6,
            208, 44, 30, 143, 202, 63, 15, 2,
            193, 175, 189, 3, 1, 19, 138, 107,
            58, 145, 17, 65, 79, 103, 220, 234,
            151, 242, 207, 206, 240, 180, 230, 115,
            150, 172, 116, 34, 231, 173, 53, 133,
            226, 249, 55, 232, 28, 117, 223, 110,
            71, 241, 26, 113, 29, 41, 197, 137,
            111, 183, 98, 14, 170, 24, 190, 27,
            252, 86, 62, 75, 198, 210, 121, 32,
            154, 219, 192, 254, 120, 205, 90, 244,
            31, 221, 168, 51, 136, 7, 199, 49,
            177, 18, 16, 89, 39, 128, 236, 95,
            96, 81, 127, 169, 25, 181, 74, 13,
            45, 229, 122, 159, 147, 201, 156, 239,
            160, 224, 59, 77, 174, 42, 245, 176,
            200, 235, 187, 60, 131, 83, 153, 97,
            23, 43, 4, 126, 186, 119, 214, 38,
            225, 105, 20, 99, 85, 33, 12, 125,
        };

        // vector used in calculating key schedule (powers of x in GF(256))
        private static readonly byte[] rcon =
        {
            0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a,
            0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91
        };

        // precomputation tables of calculations for rounds
        private static readonly uint[] T0 =
        {
            0xa56363c6, 0x847c7cf8, 0x997777ee, 0x8d7b7bf6, 0x0df2f2ff,
            0xbd6b6bd6, 0xb16f6fde, 0x54c5c591, 0x50303060, 0x03010102,
            0xa96767ce, 0x7d2b2b56, 0x19fefee7, 0x62d7d7b5, 0xe6abab4d,
            0x9a7676ec, 0x45caca8f, 0x9d82821f, 0x40c9c989, 0x877d7dfa,
            0x15fafaef, 0xeb5959b2, 0xc947478e, 0x0bf0f0fb, 0xecadad41,
            0x67d4d4b3, 0xfda2a25f, 0xeaafaf45, 0xbf9c9c23, 0xf7a4a453,
            0x967272e4, 0x5bc0c09b, 0xc2b7b775, 0x1cfdfde1, 0xae93933d,
            0x6a26264c, 0x5a36366c, 0x413f3f7e, 0x02f7f7f5, 0x4fcccc83,
            0x5c343468, 0xf4a5a551, 0x34e5e5d1, 0x08f1f1f9, 0x937171e2,
            0x73d8d8ab, 0x53313162, 0x3f15152a, 0x0c040408, 0x52c7c795,
            0x65232346, 0x5ec3c39d, 0x28181830, 0xa1969637, 0x0f05050a,
            0xb59a9a2f, 0x0907070e, 0x36121224, 0x9b80801b, 0x3de2e2df,
            0x26ebebcd, 0x6927274e, 0xcdb2b27f, 0x9f7575ea, 0x1b090912,
            0x9e83831d, 0x742c2c58, 0x2e1a1a34, 0x2d1b1b36, 0xb26e6edc,
            0xee5a5ab4, 0xfba0a05b, 0xf65252a4, 0x4d3b3b76, 0x61d6d6b7,
            0xceb3b37d, 0x7b292952, 0x3ee3e3dd, 0x712f2f5e, 0x97848413,
            0xf55353a6, 0x68d1d1b9, 0x00000000, 0x2cededc1, 0x60202040,
            0x1ffcfce3, 0xc8b1b179, 0xed5b5bb6, 0xbe6a6ad4, 0x46cbcb8d,
            0xd9bebe67, 0x4b393972, 0xde4a4a94, 0xd44c4c98, 0xe85858b0,
            0x4acfcf85, 0x6bd0d0bb, 0x2aefefc5, 0xe5aaaa4f, 0x16fbfbed,
            0xc5434386, 0xd74d4d9a, 0x55333366, 0x94858511, 0xcf45458a,
            0x10f9f9e9, 0x06020204, 0x817f7ffe, 0xf05050a0, 0x443c3c78,
            0xba9f9f25, 0xe3a8a84b, 0xf35151a2, 0xfea3a35d, 0xc0404080,
            0x8a8f8f05, 0xad92923f, 0xbc9d9d21, 0x48383870, 0x04f5f5f1,
            0xdfbcbc63, 0xc1b6b677, 0x75dadaaf, 0x63212142, 0x30101020,
            0x1affffe5, 0x0ef3f3fd, 0x6dd2d2bf, 0x4ccdcd81, 0x140c0c18,
            0x35131326, 0x2fececc3, 0xe15f5fbe, 0xa2979735, 0xcc444488,
            0x3917172e, 0x57c4c493, 0xf2a7a755, 0x827e7efc, 0x473d3d7a,
            0xac6464c8, 0xe75d5dba, 0x2b191932, 0x957373e6, 0xa06060c0,
            0x98818119, 0xd14f4f9e, 0x7fdcdca3, 0x66222244, 0x7e2a2a54,
            0xab90903b, 0x8388880b, 0xca46468c, 0x29eeeec7, 0xd3b8b86b,
            0x3c141428, 0x79dedea7, 0xe25e5ebc, 0x1d0b0b16, 0x76dbdbad,
            0x3be0e0db, 0x56323264, 0x4e3a3a74, 0x1e0a0a14, 0xdb494992,
            0x0a06060c, 0x6c242448, 0xe45c5cb8, 0x5dc2c29f, 0x6ed3d3bd,
            0xefacac43, 0xa66262c4, 0xa8919139, 0xa4959531, 0x37e4e4d3,
            0x8b7979f2, 0x32e7e7d5, 0x43c8c88b, 0x5937376e, 0xb76d6dda,
            0x8c8d8d01, 0x64d5d5b1, 0xd24e4e9c, 0xe0a9a949, 0xb46c6cd8,
            0xfa5656ac, 0x07f4f4f3, 0x25eaeacf, 0xaf6565ca, 0x8e7a7af4,
            0xe9aeae47, 0x18080810, 0xd5baba6f, 0x887878f0, 0x6f25254a,
            0x722e2e5c, 0x241c1c38, 0xf1a6a657, 0xc7b4b473, 0x51c6c697,
            0x23e8e8cb, 0x7cdddda1, 0x9c7474e8, 0x211f1f3e, 0xdd4b4b96,
            0xdcbdbd61, 0x868b8b0d, 0x858a8a0f, 0x907070e0, 0x423e3e7c,
            0xc4b5b571, 0xaa6666cc, 0xd8484890, 0x05030306, 0x01f6f6f7,
            0x120e0e1c, 0xa36161c2, 0x5f35356a, 0xf95757ae, 0xd0b9b969,
            0x91868617, 0x58c1c199, 0x271d1d3a, 0xb99e9e27, 0x38e1e1d9,
            0x13f8f8eb, 0xb398982b, 0x33111122, 0xbb6969d2, 0x70d9d9a9,
            0x898e8e07, 0xa7949433, 0xb69b9b2d, 0x221e1e3c, 0x92878715,
            0x20e9e9c9, 0x49cece87, 0xff5555aa, 0x78282850, 0x7adfdfa5,
            0x8f8c8c03, 0xf8a1a159, 0x80898909, 0x170d0d1a, 0xdabfbf65,
            0x31e6e6d7, 0xc6424284, 0xb86868d0, 0xc3414182, 0xb0999929,
            0x772d2d5a, 0x110f0f1e, 0xcbb0b07b, 0xfc5454a8, 0xd6bbbb6d,
            0x3a16162c
        };

        private static readonly uint[] Tinv0 =
        {
            0x50a7f451, 0x5365417e, 0xc3a4171a, 0x965e273a, 0xcb6bab3b,
            0xf1459d1f, 0xab58faac, 0x9303e34b, 0x55fa3020, 0xf66d76ad,
            0x9176cc88, 0x254c02f5, 0xfcd7e54f, 0xd7cb2ac5, 0x80443526,
            0x8fa362b5, 0x495ab1de, 0x671bba25, 0x980eea45, 0xe1c0fe5d,
            0x02752fc3, 0x12f04c81, 0xa397468d, 0xc6f9d36b, 0xe75f8f03,
            0x959c9215, 0xeb7a6dbf, 0xda595295, 0x2d83bed4, 0xd3217458,
            0x2969e049, 0x44c8c98e, 0x6a89c275, 0x78798ef4, 0x6b3e5899,
            0xdd71b927, 0xb64fe1be, 0x17ad88f0, 0x66ac20c9, 0xb43ace7d,
            0x184adf63, 0x82311ae5, 0x60335197, 0x457f5362, 0xe07764b1,
            0x84ae6bbb, 0x1ca081fe, 0x942b08f9, 0x58684870, 0x19fd458f,
            0x876cde94, 0xb7f87b52, 0x23d373ab, 0xe2024b72, 0x578f1fe3,
            0x2aab5566, 0x0728ebb2, 0x03c2b52f, 0x9a7bc586, 0xa50837d3,
            0xf2872830, 0xb2a5bf23, 0xba6a0302, 0x5c8216ed, 0x2b1ccf8a,
            0x92b479a7, 0xf0f207f3, 0xa1e2694e, 0xcdf4da65, 0xd5be0506,
            0x1f6234d1, 0x8afea6c4, 0x9d532e34, 0xa055f3a2, 0x32e18a05,
            0x75ebf6a4, 0x39ec830b, 0xaaef6040, 0x069f715e, 0x51106ebd,
            0xf98a213e, 0x3d06dd96, 0xae053edd, 0x46bde64d, 0xb58d5491,
            0x055dc471, 0x6fd40604, 0xff155060, 0x24fb9819, 0x97e9bdd6,
            0xcc434089, 0x779ed967, 0xbd42e8b0, 0x888b8907, 0x385b19e7,
            0xdbeec879, 0x470a7ca1, 0xe90f427c, 0xc91e84f8, 0x00000000,
            0x83868009, 0x48ed2b32, 0xac70111e, 0x4e725a6c, 0xfbff0efd,
            0x5638850f, 0x1ed5ae3d, 0x27392d36, 0x64d90f0a, 0x21a65c68,
            0xd1545b9b, 0x3a2e3624, 0xb1670a0c, 0x0fe75793, 0xd296eeb4,
            0x9e919b1b, 0x4fc5c080, 0xa220dc61, 0x694b775a, 0x161a121c,
            0x0aba93e2, 0xe52aa0c0, 0x43e0223c, 0x1d171b12, 0x0b0d090e,
            0xadc78bf2, 0xb9a8b62d, 0xc8a91e14, 0x8519f157, 0x4c0775af,
            0xbbdd99ee, 0xfd607fa3, 0x9f2601f7, 0xbcf5725c, 0xc53b6644,
            0x347efb5b, 0x7629438b, 0xdcc623cb, 0x68fcedb6, 0x63f1e4b8,
            0xcadc31d7, 0x10856342, 0x40229713, 0x2011c684, 0x7d244a85,
            0xf83dbbd2, 0x1132f9ae, 0x6da129c7, 0x4b2f9e1d, 0xf330b2dc,
            0xec52860d, 0xd0e3c177, 0x6c16b32b, 0x99b970a9, 0xfa489411,
            0x2264e947, 0xc48cfca8, 0x1a3ff0a0, 0xd82c7d56, 0xef903322,
            0xc74e4987, 0xc1d138d9, 0xfea2ca8c, 0x360bd498, 0xcf81f5a6,
            0x28de7aa5, 0x268eb7da, 0xa4bfad3f, 0xe49d3a2c, 0x0d927850,
            0x9bcc5f6a, 0x62467e54, 0xc2138df6, 0xe8b8d890, 0x5ef7392e,
            0xf5afc382, 0xbe805d9f, 0x7c93d069, 0xa92dd56f, 0xb31225cf,
            0x3b99acc8, 0xa77d1810, 0x6e639ce8, 0x7bbb3bdb, 0x097826cd,
            0xf418596e, 0x01b79aec, 0xa89a4f83, 0x656e95e6, 0x7ee6ffaa,
            0x08cfbc21, 0xe6e815ef, 0xd99be7ba, 0xce366f4a, 0xd4099fea,
            0xd67cb029, 0xafb2a431, 0x31233f2a, 0x3094a5c6, 0xc066a235,
            0x37bc4e74, 0xa6ca82fc, 0xb0d090e0, 0x15d8a733, 0x4a9804f1,
            0xf7daec41, 0x0e50cd7f, 0x2ff69117, 0x8dd64d76, 0x4db0ef43,
            0x544daacc, 0xdf0496e4, 0xe3b5d19e, 0x1b886a4c, 0xb81f2cc1,
            0x7f516546, 0x04ea5e9d, 0x5d358c01, 0x737487fa, 0x2e410bfb,
            0x5a1d67b3, 0x52d2db92, 0x335610e9, 0x1347d66d, 0x8c61d79a,
            0x7a0ca137, 0x8e14f859, 0x893c13eb, 0xee27a9ce, 0x35c961b7,
            0xede51ce1, 0x3cb1477a, 0x59dfd29c, 0x3f73f255, 0x79ce1418,
            0xbf37c773, 0xeacdf753, 0x5baafd5f, 0x146f3ddf, 0x86db4478,
            0x81f3afca, 0x3ec468b9, 0x2c342438, 0x5f40a3c2, 0x72c31d16,
            0x0c25e2bc, 0x8b493c28, 0x41950dff, 0x7101a839, 0xdeb30c08,
            0x9ce4b4d8, 0x90c15664, 0x6184cb7b, 0x70b632d5, 0x745c6c48,
            0x4257b8d0
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

        private byte[] s;

        private const int BLOCK_SIZE = 16;

        /**
        * default constructor - 128 bit block size.
        */
        public AesEngine()
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
            this.s = Arrays.Clone(forEncryption ? S : Si);
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
                r0 = T0[t0 & 255] ^ Shift(T0[(t1 >> 8) & 255], 24) ^ Shift(T0[(t2 >> 16) & 255], 16) ^ Shift(T0[(r3 >> 24) & 255], 8) ^ kw[0];
                r1 = T0[t1 & 255] ^ Shift(T0[(t2 >> 8) & 255], 24) ^ Shift(T0[(r3 >> 16) & 255], 16) ^ Shift(T0[(t0 >> 24) & 255], 8) ^ kw[1];
                r2 = T0[t2 & 255] ^ Shift(T0[(r3 >> 8) & 255], 24) ^ Shift(T0[(t0 >> 16) & 255], 16) ^ Shift(T0[(t1 >> 24) & 255], 8) ^ kw[2];
                r3 = T0[r3 & 255] ^ Shift(T0[(t0 >> 8) & 255], 24) ^ Shift(T0[(t1 >> 16) & 255], 16) ^ Shift(T0[(t2 >> 24) & 255], 8) ^ kw[3];
                kw = KW[r++];
                t0 = T0[r0 & 255] ^ Shift(T0[(r1 >> 8) & 255], 24) ^ Shift(T0[(r2 >> 16) & 255], 16) ^ Shift(T0[(r3 >> 24) & 255], 8) ^ kw[0];
                t1 = T0[r1 & 255] ^ Shift(T0[(r2 >> 8) & 255], 24) ^ Shift(T0[(r3 >> 16) & 255], 16) ^ Shift(T0[(r0 >> 24) & 255], 8) ^ kw[1];
                t2 = T0[r2 & 255] ^ Shift(T0[(r3 >> 8) & 255], 24) ^ Shift(T0[(r0 >> 16) & 255], 16) ^ Shift(T0[(r1 >> 24) & 255], 8) ^ kw[2];
                r3 = T0[r3 & 255] ^ Shift(T0[(r0 >> 8) & 255], 24) ^ Shift(T0[(r1 >> 16) & 255], 16) ^ Shift(T0[(r2 >> 24) & 255], 8) ^ kw[3];
            }

            kw = KW[r++];
            r0 = T0[t0 & 255] ^ Shift(T0[(t1 >> 8) & 255], 24) ^ Shift(T0[(t2 >> 16) & 255], 16) ^ Shift(T0[(r3 >> 24) & 255], 8) ^ kw[0];
            r1 = T0[t1 & 255] ^ Shift(T0[(t2 >> 8) & 255], 24) ^ Shift(T0[(r3 >> 16) & 255], 16) ^ Shift(T0[(t0 >> 24) & 255], 8) ^ kw[1];
            r2 = T0[t2 & 255] ^ Shift(T0[(r3 >> 8) & 255], 24) ^ Shift(T0[(t0 >> 16) & 255], 16) ^ Shift(T0[(t1 >> 24) & 255], 8) ^ kw[2];
            r3 = T0[r3 & 255] ^ Shift(T0[(t0 >> 8) & 255], 24) ^ Shift(T0[(t1 >> 16) & 255], 16) ^ Shift(T0[(t2 >> 24) & 255], 8) ^ kw[3];

            // the final round's table is a simple function of S so we don't use a whole other four tables for it

            kw = KW[r];
            C0 = (uint)S[r0 & 255] ^ (((uint)S[(r1 >> 8) & 255]) << 8) ^ (((uint)s[(r2 >> 16) & 255]) << 16) ^ (((uint)s[(r3 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)s[r1 & 255] ^ (((uint)S[(r2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)s[(r0 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)s[r2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(r0 >> 16) & 255]) << 16) ^ (((uint)S[(r1 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)s[r3 & 255] ^ (((uint)s[(r0 >> 8) & 255]) << 8) ^ (((uint)s[(r1 >> 16) & 255]) << 16) ^ (((uint)S[(r2 >> 24) & 255]) << 24) ^ kw[3];

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
                r0 = Tinv0[t0 & 255] ^ Shift(Tinv0[(r3 >> 8) & 255], 24) ^ Shift(Tinv0[(t2 >> 16) & 255], 16) ^ Shift(Tinv0[(t1 >> 24) & 255], 8) ^ kw[0];
                r1 = Tinv0[t1 & 255] ^ Shift(Tinv0[(t0 >> 8) & 255], 24) ^ Shift(Tinv0[(r3 >> 16) & 255], 16) ^ Shift(Tinv0[(t2 >> 24) & 255], 8) ^ kw[1];
                r2 = Tinv0[t2 & 255] ^ Shift(Tinv0[(t1 >> 8) & 255], 24) ^ Shift(Tinv0[(t0 >> 16) & 255], 16) ^ Shift(Tinv0[(r3 >> 24) & 255], 8) ^ kw[2];
                r3 = Tinv0[r3 & 255] ^ Shift(Tinv0[(t2 >> 8) & 255], 24) ^ Shift(Tinv0[(t1 >> 16) & 255], 16) ^ Shift(Tinv0[(t0 >> 24) & 255], 8) ^ kw[3];
                kw = KW[r--];
                t0 = Tinv0[r0 & 255] ^ Shift(Tinv0[(r3 >> 8) & 255], 24) ^ Shift(Tinv0[(r2 >> 16) & 255], 16) ^ Shift(Tinv0[(r1 >> 24) & 255], 8) ^ kw[0];
                t1 = Tinv0[r1 & 255] ^ Shift(Tinv0[(r0 >> 8) & 255], 24) ^ Shift(Tinv0[(r3 >> 16) & 255], 16) ^ Shift(Tinv0[(r2 >> 24) & 255], 8) ^ kw[1];
                t2 = Tinv0[r2 & 255] ^ Shift(Tinv0[(r1 >> 8) & 255], 24) ^ Shift(Tinv0[(r0 >> 16) & 255], 16) ^ Shift(Tinv0[(r3 >> 24) & 255], 8) ^ kw[2];
                r3 = Tinv0[r3 & 255] ^ Shift(Tinv0[(r2 >> 8) & 255], 24) ^ Shift(Tinv0[(r1 >> 16) & 255], 16) ^ Shift(Tinv0[(r0 >> 24) & 255], 8) ^ kw[3];
            }

            kw = KW[1];
            r0 = Tinv0[t0 & 255] ^ Shift(Tinv0[(r3 >> 8) & 255], 24) ^ Shift(Tinv0[(t2 >> 16) & 255], 16) ^ Shift(Tinv0[(t1 >> 24) & 255], 8) ^ kw[0];
            r1 = Tinv0[t1 & 255] ^ Shift(Tinv0[(t0 >> 8) & 255], 24) ^ Shift(Tinv0[(r3 >> 16) & 255], 16) ^ Shift(Tinv0[(t2 >> 24) & 255], 8) ^ kw[1];
            r2 = Tinv0[t2 & 255] ^ Shift(Tinv0[(t1 >> 8) & 255], 24) ^ Shift(Tinv0[(t0 >> 16) & 255], 16) ^ Shift(Tinv0[(r3 >> 24) & 255], 8) ^ kw[2];
            r3 = Tinv0[r3 & 255] ^ Shift(Tinv0[(t2 >> 8) & 255], 24) ^ Shift(Tinv0[(t1 >> 16) & 255], 16) ^ Shift(Tinv0[(t0 >> 24) & 255], 8) ^ kw[3];

            // the final round's table is a simple function of Si so we don't use a whole other four tables for it

            kw = KW[0];
            C0 = (uint)Si[r0 & 255] ^ (((uint)s[(r3 >> 8) & 255]) << 8) ^ (((uint)s[(r2 >> 16) & 255]) << 16) ^ (((uint)Si[(r1 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)s[r1 & 255] ^ (((uint)s[(r0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ (((uint)s[(r2 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)s[r2 & 255] ^ (((uint)Si[(r1 >> 8) & 255]) << 8) ^ (((uint)Si[(r0 >> 16) & 255]) << 16) ^ (((uint)s[(r3 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)Si[r3 & 255] ^ (((uint)s[(r2 >> 8) & 255]) << 8) ^ (((uint)s[(r1 >> 16) & 255]) << 16) ^ (((uint)s[(r0 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output);
            Pack.UInt32_To_LE(C1, output[4..]);
            Pack.UInt32_To_LE(C2, output[8..]);
            Pack.UInt32_To_LE(C3, output[12..]);
        }
#else
        private void EncryptBlock(byte[] input, int inOff, byte[] output, int outOff, uint[][] KW)
        {
            uint C0 = Pack.LE_To_UInt32(input, inOff +  0);
            uint C1 = Pack.LE_To_UInt32(input, inOff +  4);
            uint C2 = Pack.LE_To_UInt32(input, inOff +  8);
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
                r0 = T0[t0 & 255] ^ Shift(T0[(t1 >> 8) & 255], 24) ^ Shift(T0[(t2 >> 16) & 255], 16) ^ Shift(T0[(r3 >> 24) & 255], 8) ^ kw[0];
                r1 = T0[t1 & 255] ^ Shift(T0[(t2 >> 8) & 255], 24) ^ Shift(T0[(r3 >> 16) & 255], 16) ^ Shift(T0[(t0 >> 24) & 255], 8) ^ kw[1];
                r2 = T0[t2 & 255] ^ Shift(T0[(r3 >> 8) & 255], 24) ^ Shift(T0[(t0 >> 16) & 255], 16) ^ Shift(T0[(t1 >> 24) & 255], 8) ^ kw[2];
                r3 = T0[r3 & 255] ^ Shift(T0[(t0 >> 8) & 255], 24) ^ Shift(T0[(t1 >> 16) & 255], 16) ^ Shift(T0[(t2 >> 24) & 255], 8) ^ kw[3];
                kw = KW[r++];
                t0 = T0[r0 & 255] ^ Shift(T0[(r1 >> 8) & 255], 24) ^ Shift(T0[(r2 >> 16) & 255], 16) ^ Shift(T0[(r3 >> 24) & 255], 8) ^ kw[0];
                t1 = T0[r1 & 255] ^ Shift(T0[(r2 >> 8) & 255], 24) ^ Shift(T0[(r3 >> 16) & 255], 16) ^ Shift(T0[(r0 >> 24) & 255], 8) ^ kw[1];
                t2 = T0[r2 & 255] ^ Shift(T0[(r3 >> 8) & 255], 24) ^ Shift(T0[(r0 >> 16) & 255], 16) ^ Shift(T0[(r1 >> 24) & 255], 8) ^ kw[2];
                r3 = T0[r3 & 255] ^ Shift(T0[(r0 >> 8) & 255], 24) ^ Shift(T0[(r1 >> 16) & 255], 16) ^ Shift(T0[(r2 >> 24) & 255], 8) ^ kw[3];
            }

            kw = KW[r++];
            r0 = T0[t0 & 255] ^ Shift(T0[(t1 >> 8) & 255], 24) ^ Shift(T0[(t2 >> 16) & 255], 16) ^ Shift(T0[(r3 >> 24) & 255], 8) ^ kw[0];
            r1 = T0[t1 & 255] ^ Shift(T0[(t2 >> 8) & 255], 24) ^ Shift(T0[(r3 >> 16) & 255], 16) ^ Shift(T0[(t0 >> 24) & 255], 8) ^ kw[1];
            r2 = T0[t2 & 255] ^ Shift(T0[(r3 >> 8) & 255], 24) ^ Shift(T0[(t0 >> 16) & 255], 16) ^ Shift(T0[(t1 >> 24) & 255], 8) ^ kw[2];
            r3 = T0[r3 & 255] ^ Shift(T0[(t0 >> 8) & 255], 24) ^ Shift(T0[(t1 >> 16) & 255], 16) ^ Shift(T0[(t2 >> 24) & 255], 8) ^ kw[3];

            // the final round's table is a simple function of S so we don't use a whole other four tables for it

            kw = KW[r];
            C0 = (uint)S[r0 & 255] ^ (((uint)S[(r1 >> 8) & 255]) << 8) ^ (((uint)s[(r2 >> 16) & 255]) << 16) ^ (((uint)s[(r3 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)s[r1 & 255] ^ (((uint)S[(r2 >> 8) & 255]) << 8) ^ (((uint)S[(r3 >> 16) & 255]) << 16) ^ (((uint)s[(r0 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)s[r2 & 255] ^ (((uint)S[(r3 >> 8) & 255]) << 8) ^ (((uint)S[(r0 >> 16) & 255]) << 16) ^ (((uint)S[(r1 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)s[r3 & 255] ^ (((uint)s[(r0 >> 8) & 255]) << 8) ^ (((uint)s[(r1 >> 16) & 255]) << 16) ^ (((uint)S[(r2 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output, outOff +  0);
            Pack.UInt32_To_LE(C1, output, outOff +  4);
            Pack.UInt32_To_LE(C2, output, outOff +  8);
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
                r0 = Tinv0[t0 & 255] ^ Shift(Tinv0[(r3 >> 8) & 255], 24) ^ Shift(Tinv0[(t2 >> 16) & 255], 16) ^ Shift(Tinv0[(t1 >> 24) & 255], 8) ^ kw[0];
                r1 = Tinv0[t1 & 255] ^ Shift(Tinv0[(t0 >> 8) & 255], 24) ^ Shift(Tinv0[(r3 >> 16) & 255], 16) ^ Shift(Tinv0[(t2 >> 24) & 255], 8) ^ kw[1];
                r2 = Tinv0[t2 & 255] ^ Shift(Tinv0[(t1 >> 8) & 255], 24) ^ Shift(Tinv0[(t0 >> 16) & 255], 16) ^ Shift(Tinv0[(r3 >> 24) & 255], 8) ^ kw[2];
                r3 = Tinv0[r3 & 255] ^ Shift(Tinv0[(t2 >> 8) & 255], 24) ^ Shift(Tinv0[(t1 >> 16) & 255], 16) ^ Shift(Tinv0[(t0 >> 24) & 255], 8) ^ kw[3];
                kw = KW[r--];
                t0 = Tinv0[r0 & 255] ^ Shift(Tinv0[(r3 >> 8) & 255], 24) ^ Shift(Tinv0[(r2 >> 16) & 255], 16) ^ Shift(Tinv0[(r1 >> 24) & 255], 8) ^ kw[0];
                t1 = Tinv0[r1 & 255] ^ Shift(Tinv0[(r0 >> 8) & 255], 24) ^ Shift(Tinv0[(r3 >> 16) & 255], 16) ^ Shift(Tinv0[(r2 >> 24) & 255], 8) ^ kw[1];
                t2 = Tinv0[r2 & 255] ^ Shift(Tinv0[(r1 >> 8) & 255], 24) ^ Shift(Tinv0[(r0 >> 16) & 255], 16) ^ Shift(Tinv0[(r3 >> 24) & 255], 8) ^ kw[2];
                r3 = Tinv0[r3 & 255] ^ Shift(Tinv0[(r2 >> 8) & 255], 24) ^ Shift(Tinv0[(r1 >> 16) & 255], 16) ^ Shift(Tinv0[(r0 >> 24) & 255], 8) ^ kw[3];
            }

            kw = KW[1];
            r0 = Tinv0[t0 & 255] ^ Shift(Tinv0[(r3 >> 8) & 255], 24) ^ Shift(Tinv0[(t2 >> 16) & 255], 16) ^ Shift(Tinv0[(t1 >> 24) & 255], 8) ^ kw[0];
            r1 = Tinv0[t1 & 255] ^ Shift(Tinv0[(t0 >> 8) & 255], 24) ^ Shift(Tinv0[(r3 >> 16) & 255], 16) ^ Shift(Tinv0[(t2 >> 24) & 255], 8) ^ kw[1];
            r2 = Tinv0[t2 & 255] ^ Shift(Tinv0[(t1 >> 8) & 255], 24) ^ Shift(Tinv0[(t0 >> 16) & 255], 16) ^ Shift(Tinv0[(r3 >> 24) & 255], 8) ^ kw[2];
            r3 = Tinv0[r3 & 255] ^ Shift(Tinv0[(t2 >> 8) & 255], 24) ^ Shift(Tinv0[(t1 >> 16) & 255], 16) ^ Shift(Tinv0[(t0 >> 24) & 255], 8) ^ kw[3];

            // the final round's table is a simple function of Si so we don't use a whole other four tables for it

            kw = KW[0];
            C0 = (uint)Si[r0 & 255] ^ (((uint)s[(r3 >> 8) & 255]) << 8) ^ (((uint)s[(r2 >> 16) & 255]) << 16) ^ (((uint)Si[(r1 >> 24) & 255]) << 24) ^ kw[0];
            C1 = (uint)s[r1 & 255] ^ (((uint)s[(r0 >> 8) & 255]) << 8) ^ (((uint)Si[(r3 >> 16) & 255]) << 16) ^ (((uint)s[(r2 >> 24) & 255]) << 24) ^ kw[1];
            C2 = (uint)s[r2 & 255] ^ (((uint)Si[(r1 >> 8) & 255]) << 8) ^ (((uint)Si[(r0 >> 16) & 255]) << 16) ^ (((uint)s[(r3 >> 24) & 255]) << 24) ^ kw[2];
            C3 = (uint)Si[r3 & 255] ^ (((uint)s[(r2 >> 8) & 255]) << 8) ^ (((uint)s[(r1 >> 16) & 255]) << 16) ^ (((uint)s[(r0 >> 24) & 255]) << 24) ^ kw[3];

            Pack.UInt32_To_LE(C0, output, outOff + 0);
            Pack.UInt32_To_LE(C1, output, outOff + 4);
            Pack.UInt32_To_LE(C2, output, outOff + 8);
            Pack.UInt32_To_LE(C3, output, outOff + 12);
        }
#endif
    }
}
