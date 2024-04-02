using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /// <summary>SM4 Block Cipher - SM4 is a 128 bit block cipher with a 128 bit key.</summary>
    /// <remarks>
    /// The implementation here is based on the document <a href="http://eprint.iacr.org/2008/329.pdf">http://eprint.iacr.org/2008/329.pdf</a>
    /// by Whitfield Diffie and George Ledin, which is a translation of Prof. LU Shu-wang's original standard.
    /// </remarks>
    public class SM4Engine
        : IBlockCipher
    {
        private const int BlockSize = 16;

        private static readonly byte[] Sbox =
        {
            0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
            0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
            0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
            0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
            0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
            0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
            0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
            0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
            0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
            0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
            0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
            0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
            0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
            0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
            0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
            0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48
        };

        private static readonly uint[] CK =
        {
            0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
            0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
            0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
            0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
            0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
            0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
            0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
            0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
        };

        private static readonly uint[] FK =
        {
            0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc
        };

        private uint[] rk;

        // non-linear substitution tau.
        private static uint tau(uint A)
        {
            uint b0 = Sbox[A >> 24];
            uint b1 = Sbox[(A >> 16) & 0xFF];
            uint b2 = Sbox[(A >> 8) & 0xFF];
            uint b3 = Sbox[A & 0xFF];

            return (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
        }

        private static uint L_ap(uint B)
        {
            return B ^ Integers.RotateLeft(B, 13) ^ Integers.RotateLeft(B, 23);
        }

        private uint T_ap(uint Z)
        {
            return L_ap(tau(Z));
        }

        // Key expansion
        private void ExpandKey(bool forEncryption, byte[] key)
        {
            uint K0 = Pack.BE_To_UInt32(key,  0) ^ FK[0];
            uint K1 = Pack.BE_To_UInt32(key,  4) ^ FK[1];
            uint K2 = Pack.BE_To_UInt32(key,  8) ^ FK[2];
            uint K3 = Pack.BE_To_UInt32(key, 12) ^ FK[3];

            if (forEncryption)
            {
                rk[0] = K0 ^ T_ap(K1    ^ K2    ^ K3    ^ CK[0]);
                rk[1] = K1 ^ T_ap(K2    ^ K3    ^ rk[0] ^ CK[1]);
                rk[2] = K2 ^ T_ap(K3    ^ rk[0] ^ rk[1] ^ CK[2]);
                rk[3] = K3 ^ T_ap(rk[0] ^ rk[1] ^ rk[2] ^ CK[3]);
                for (int i = 4; i < 32; ++i)
                {
                    rk[i] = rk[i - 4] ^ T_ap(rk[i - 3] ^ rk[i - 2] ^ rk[i - 1] ^ CK[i]);
                }
            }
            else
            {
                rk[31] = K0 ^ T_ap(K1     ^ K2     ^ K3     ^ CK[0]);
                rk[30] = K1 ^ T_ap(K2     ^ K3     ^ rk[31] ^ CK[1]);
                rk[29] = K2 ^ T_ap(K3     ^ rk[31] ^ rk[30] ^ CK[2]);
                rk[28] = K3 ^ T_ap(rk[31] ^ rk[30] ^ rk[29] ^ CK[3]);
                for (int i = 27; i >= 0; --i)
                {
                    rk[i] = rk[i + 4] ^ T_ap(rk[i + 3] ^ rk[i + 2] ^ rk[i + 1] ^ CK[31 - i]);
                }
            }
        }

        // Linear substitution L
        private static uint L(uint B)
        {
            return B ^ Integers.RotateLeft(B, 2) ^ Integers.RotateLeft(B, 10) ^ Integers.RotateLeft(B, 18) ^ Integers.RotateLeft(B, 24);
        }

        // Mixer-substitution T
        private static uint T(uint Z)
        {
            return L(tau(Z));
        }

        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            KeyParameter keyParameter = parameters as KeyParameter;
            if (null == keyParameter)
                throw new ArgumentException("invalid parameter passed to SM4 init - " + Platform.GetTypeName(parameters), "parameters");

            byte[] key = keyParameter.GetKey();
            if (key.Length != 16)
                throw new ArgumentException("SM4 requires a 128 bit key", "parameters");

            if (null == rk)
            {
                rk = new uint[32];
            }

            ExpandKey(forEncryption, key);
        }

        public virtual string AlgorithmName
        {
            get { return "SM4"; }
        }

        public virtual int GetBlockSize()
        {
            return BlockSize;
        }

        public virtual int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {
            if (null == rk)
                throw new InvalidOperationException("SM4 not initialised");

            Check.DataLength(input, inOff, BlockSize, "input buffer too short");
            Check.OutputLength(output, outOff, BlockSize, "output buffer too short");

            uint X0 = Pack.BE_To_UInt32(input, inOff);
            uint X1 = Pack.BE_To_UInt32(input, inOff + 4);
            uint X2 = Pack.BE_To_UInt32(input, inOff + 8);
            uint X3 = Pack.BE_To_UInt32(input, inOff + 12);

            for (int i = 0; i < 32; i += 4)
            {
                X0 ^= T(X1 ^ X2 ^ X3 ^ rk[i    ]);  // F0
                X1 ^= T(X2 ^ X3 ^ X0 ^ rk[i + 1]);  // F1
                X2 ^= T(X3 ^ X0 ^ X1 ^ rk[i + 2]);  // F2
                X3 ^= T(X0 ^ X1 ^ X2 ^ rk[i + 3]);  // F3
            }

            Pack.UInt32_To_BE(X3, output, outOff);
            Pack.UInt32_To_BE(X2, output, outOff + 4);
            Pack.UInt32_To_BE(X1, output, outOff + 8);
            Pack.UInt32_To_BE(X0, output, outOff + 12);

            return BlockSize;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (null == rk)
                throw new InvalidOperationException("SM4 not initialised");

            Check.DataLength(input, BlockSize, "input buffer too short");
            Check.OutputLength(output, BlockSize, "output buffer too short");

            uint X0 = Pack.BE_To_UInt32(input);
            uint X1 = Pack.BE_To_UInt32(input[4..]);
            uint X2 = Pack.BE_To_UInt32(input[8..]);
            uint X3 = Pack.BE_To_UInt32(input[12..]);

            for (int i = 0; i < 32; i += 4)
            {
                X0 ^= T(X1 ^ X2 ^ X3 ^ rk[i    ]);  // F0
                X1 ^= T(X2 ^ X3 ^ X0 ^ rk[i + 1]);  // F1
                X2 ^= T(X3 ^ X0 ^ X1 ^ rk[i + 2]);  // F2
                X3 ^= T(X0 ^ X1 ^ X2 ^ rk[i + 3]);  // F3
            }

            Pack.UInt32_To_BE(X3, output);
            Pack.UInt32_To_BE(X2, output[4..]);
            Pack.UInt32_To_BE(X1, output[8..]);
            Pack.UInt32_To_BE(X0, output[12..]);

            return BlockSize;
        }
#endif
    }
}
