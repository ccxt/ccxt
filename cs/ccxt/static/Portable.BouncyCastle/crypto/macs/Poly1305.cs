using System;
using System.Diagnostics;
#if NETCOREAPP3_0_OR_GREATER
using System.Runtime.CompilerServices;
#endif

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Crypto.Macs
{

    /// <summary>
    /// Poly1305 message authentication code, designed by D. J. Bernstein.
    /// </summary>
    /// <remarks>
    /// Poly1305 computes a 128-bit (16 bytes) authenticator, using a 128 bit nonce and a 256 bit key
    /// consisting of a 128 bit key applied to an underlying cipher, and a 128 bit key (with 106
    /// effective key bits) used in the authenticator.
    /// 
    /// The polynomial calculation in this implementation is adapted from the public domain <a
    /// href="https://github.com/floodyberry/poly1305-donna">poly1305-donna-unrolled</a> C implementation
    /// by Andrew M (@floodyberry).
    /// </remarks>
    /// <seealso cref="Org.BouncyCastle.Crypto.Generators.Poly1305KeyGenerator"/>
    public class Poly1305
        : IMac
    {
        private const int BlockSize = 16;

        private readonly IBlockCipher cipher;

        // Initialised state

        /** Polynomial key */
        private uint r0, r1, r2, r3, r4;

        /** Precomputed 5 * r[1..4] */
        private uint s1, s2, s3, s4;

        /** Encrypted nonce */
        private uint k0, k1, k2, k3;

        // Accumulating state

        /** Current block of buffered input */
        private byte[] currentBlock = new byte[BlockSize];

        /** Current offset in input buffer */
        private int currentBlockOffset = 0;

        /** Polynomial accumulator */
        private uint h0, h1, h2, h3, h4;

        /**
         * Constructs a Poly1305 MAC, where the key passed to init() will be used directly.
         */
        public Poly1305()
        {
            this.cipher = null;
        }

        /**
         * Constructs a Poly1305 MAC, using a 128 bit block cipher.
         */
        public Poly1305(IBlockCipher cipher)
        {
            if (cipher.GetBlockSize() != BlockSize)
            {
                throw new ArgumentException("Poly1305 requires a 128 bit block cipher.");
            }
            this.cipher = cipher;
        }

        /// <summary>
        /// Initialises the Poly1305 MAC.
        /// </summary>
        /// <param name="parameters">a {@link ParametersWithIV} containing a 128 bit nonce and a {@link KeyParameter} with
        ///          a 256 bit key complying to the {@link Poly1305KeyGenerator Poly1305 key format}.</param>
        public void Init(ICipherParameters parameters)
        {
            byte[] nonce = null;

            if (cipher != null)
            {
                if (!(parameters is ParametersWithIV))
                    throw new ArgumentException("Poly1305 requires an IV when used with a block cipher.", "parameters");

                ParametersWithIV ivParams = (ParametersWithIV)parameters;
                nonce = ivParams.GetIV();
                parameters = ivParams.Parameters;
            }

            if (!(parameters is KeyParameter))
                throw new ArgumentException("Poly1305 requires a key.");

            KeyParameter keyParams = (KeyParameter)parameters;

            SetKey(keyParams.GetKey(), nonce);

            Reset();
        }

        private void SetKey(byte[] key, byte[] nonce)
        {
            if (key.Length != 32)
                throw new ArgumentException("Poly1305 key must be 256 bits.");

            if (cipher != null && (nonce == null || nonce.Length != BlockSize))
                throw new ArgumentException("Poly1305 requires a 128 bit IV.");

            // Extract r portion of key (and "clamp" the values)
            uint t0 = Pack.LE_To_UInt32(key, 0);
            uint t1 = Pack.LE_To_UInt32(key, 4);
            uint t2 = Pack.LE_To_UInt32(key, 8);
            uint t3 = Pack.LE_To_UInt32(key, 12);

            // NOTE: The masks perform the key "clamping" implicitly
            r0 =   t0                      & 0x03FFFFFFU;
            r1 = ((t0 >> 26) | (t1 <<  6)) & 0x03FFFF03U;
            r2 = ((t1 >> 20) | (t2 << 12)) & 0x03FFC0FFU;
            r3 = ((t2 >> 14) | (t3 << 18)) & 0x03F03FFFU;
            r4 =  (t3 >>  8)               & 0x000FFFFFU;

            // Precompute multipliers
            s1 = r1 * 5;
            s2 = r2 * 5;
            s3 = r3 * 5;
            s4 = r4 * 5;

            byte[] kBytes;
            int kOff;

            if (cipher == null)
            {
                kBytes = key;
                kOff = BlockSize;
            }
            else
            {
                // Compute encrypted nonce
                kBytes = new byte[BlockSize];
                kOff = 0;

                cipher.Init(true, new KeyParameter(key, BlockSize, BlockSize));
                cipher.ProcessBlock(nonce, 0, kBytes, 0);
            }

            k0 = Pack.LE_To_UInt32(kBytes, kOff + 0);
            k1 = Pack.LE_To_UInt32(kBytes, kOff + 4);
            k2 = Pack.LE_To_UInt32(kBytes, kOff + 8);
            k3 = Pack.LE_To_UInt32(kBytes, kOff + 12);
        }

        public string AlgorithmName
        {
            get { return cipher == null ? "Poly1305" : "Poly1305-" + cipher.AlgorithmName; }
        }

        public int GetMacSize()
        {
            return BlockSize;
        }

        public void Update(byte input)
        {
            currentBlock[currentBlockOffset++] = input;
            if (currentBlockOffset == BlockSize)
            {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                ProcessBlock(currentBlock);
#else
                ProcessBlock(currentBlock, 0);
#endif
                currentBlockOffset = 0;
            }
        }

        public void BlockUpdate(byte[] input, int inOff, int len)
        {
            Check.DataLength(input, inOff, len, "input buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            BlockUpdate(input.AsSpan(inOff, len));
#else
            int available = BlockSize - currentBlockOffset;
            if (len < available)
            {
                Array.Copy(input, inOff, currentBlock, currentBlockOffset, len);
                currentBlockOffset += len;
                return;
            }

            int pos = 0;
            if (currentBlockOffset > 0)
            {
                Array.Copy(input, inOff, currentBlock, currentBlockOffset, available);
                pos = available;
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                ProcessBlock(currentBlock);
#else
                ProcessBlock(currentBlock, 0);
#endif
            }

            int remaining;
            while ((remaining = len - pos) >= BlockSize)
            {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                ProcessBlock(input.AsSpan(inOff + pos));
#else
                ProcessBlock(input, inOff + pos);
#endif
                pos += BlockSize;
            }

            Array.Copy(input, inOff + pos, currentBlock, 0, remaining);
            currentBlockOffset = remaining;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            int available = BlockSize - currentBlockOffset;
            if (input.Length < available)
            {
                input.CopyTo(currentBlock.AsSpan(currentBlockOffset));
                currentBlockOffset += input.Length;
                return;
            }

            int pos = 0;
            if (currentBlockOffset > 0)
            {
                input[..available].CopyTo(currentBlock.AsSpan(currentBlockOffset));
                pos = available;
                ProcessBlock(currentBlock);
            }

            int remaining;
            while ((remaining = input.Length - pos) >= BlockSize)
            {
                ProcessBlock(input[pos..]);
                pos += BlockSize;
            }

            input[pos..].CopyTo(currentBlock);
            currentBlockOffset = remaining;
        }
#endif

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void ProcessBlock(ReadOnlySpan<byte> block)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (BitConverter.IsLittleEndian)
            {
                Span<uint> t = stackalloc uint[4];
                Unsafe.CopyBlockUnaligned(ref Unsafe.As<uint, byte>(ref t[0]), ref Unsafe.AsRef(block[0]), 16);

                h0 +=   t[0]                        & 0x3ffffffU;
                h1 += ((t[1] <<  6) | (t[0] >> 26)) & 0x3ffffffU;
                h2 += ((t[2] << 12) | (t[1] >> 20)) & 0x3ffffffU;
                h3 += ((t[3] << 18) | (t[2] >> 14)) & 0x3ffffffU;
                h4 += (1 << 24) | (t[3] >> 8);
            }
            else
#endif
            {
                uint t0 = Pack.LE_To_UInt32(block);
                uint t1 = Pack.LE_To_UInt32(block[4..]);
                uint t2 = Pack.LE_To_UInt32(block[8..]);
                uint t3 = Pack.LE_To_UInt32(block[12..]);

                h0 +=   t0                      & 0x3ffffffU;
                h1 += ((t1 <<  6) | (t0 >> 26)) & 0x3ffffffU;
                h2 += ((t2 << 12) | (t1 >> 20)) & 0x3ffffffU;
                h3 += ((t3 << 18) | (t2 >> 14)) & 0x3ffffffU;
                h4 +=  ( 1 << 24) | (t3 >>  8);
            }

            ulong tp0 = (ulong)h0 * r0 + (ulong)h1 * s4 + (ulong)h2 * s3 + (ulong)h3 * s2 + (ulong)h4 * s1;
            ulong tp1 = (ulong)h0 * r1 + (ulong)h1 * r0 + (ulong)h2 * s4 + (ulong)h3 * s3 + (ulong)h4 * s2;
            ulong tp2 = (ulong)h0 * r2 + (ulong)h1 * r1 + (ulong)h2 * r0 + (ulong)h3 * s4 + (ulong)h4 * s3;
            ulong tp3 = (ulong)h0 * r3 + (ulong)h1 * r2 + (ulong)h2 * r1 + (ulong)h3 * r0 + (ulong)h4 * s4;
            ulong tp4 = (ulong)h0 * r4 + (ulong)h1 * r3 + (ulong)h2 * r2 + (ulong)h3 * r1 + (ulong)h4 * r0;

            h0 = (uint)tp0 & 0x3ffffff; tp1 += (tp0 >> 26);
            h1 = (uint)tp1 & 0x3ffffff; tp2 += (tp1 >> 26);
            h2 = (uint)tp2 & 0x3ffffff; tp3 += (tp2 >> 26);
            h3 = (uint)tp3 & 0x3ffffff; tp4 += (tp3 >> 26);
            h4 = (uint)tp4 & 0x3ffffff;
            h0 += (uint)(tp4 >> 26) * 5;
            h1 += h0 >> 26; h0 &= 0x3ffffff;
        }
#else
        private void ProcessBlock(byte[] buf, int off)
        {
            {
                uint t0 = Pack.LE_To_UInt32(buf, off +  0);
                uint t1 = Pack.LE_To_UInt32(buf, off +  4);
                uint t2 = Pack.LE_To_UInt32(buf, off +  8);
                uint t3 = Pack.LE_To_UInt32(buf, off + 12);

                h0 +=   t0                      & 0x3ffffffU;
                h1 += ((t1 <<  6) | (t0 >> 26)) & 0x3ffffffU;
                h2 += ((t2 << 12) | (t1 >> 20)) & 0x3ffffffU;
                h3 += ((t3 << 18) | (t2 >> 14)) & 0x3ffffffU;
                h4 +=  ( 1 << 24) | (t3 >>  8);
            }

            ulong tp0 = (ulong)h0 * r0 + (ulong)h1 * s4 + (ulong)h2 * s3 + (ulong)h3 * s2 + (ulong)h4 * s1;
            ulong tp1 = (ulong)h0 * r1 + (ulong)h1 * r0 + (ulong)h2 * s4 + (ulong)h3 * s3 + (ulong)h4 * s2;
            ulong tp2 = (ulong)h0 * r2 + (ulong)h1 * r1 + (ulong)h2 * r0 + (ulong)h3 * s4 + (ulong)h4 * s3;
            ulong tp3 = (ulong)h0 * r3 + (ulong)h1 * r2 + (ulong)h2 * r1 + (ulong)h3 * r0 + (ulong)h4 * s4;
            ulong tp4 = (ulong)h0 * r4 + (ulong)h1 * r3 + (ulong)h2 * r2 + (ulong)h3 * r1 + (ulong)h4 * r0;

            h0 = (uint)tp0 & 0x3ffffff; tp1 += (tp0 >> 26);
            h1 = (uint)tp1 & 0x3ffffff; tp2 += (tp1 >> 26);
            h2 = (uint)tp2 & 0x3ffffff; tp3 += (tp2 >> 26);
            h3 = (uint)tp3 & 0x3ffffff; tp4 += (tp3 >> 26);
            h4 = (uint)tp4 & 0x3ffffff;
            h0 += (uint)(tp4 >> 26) * 5;
            h1 += h0 >> 26; h0 &= 0x3ffffff;
        }
#endif

        public int DoFinal(byte[] output, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(output.AsSpan(outOff));
#else
            Check.OutputLength(output, outOff, BlockSize, "output buffer is too short.");

            if (currentBlockOffset > 0)
            {
                // Process padded block
                if (currentBlockOffset < BlockSize)
                {
                    currentBlock[currentBlockOffset++] = 1;
                    while (currentBlockOffset < BlockSize)
                    {
                        currentBlock[currentBlockOffset++] = 0;
                    }

                    h4 -= (1 << 24);
                }

                ProcessBlock(currentBlock, 0);
            }

            Debug.Assert(h4 >> 26 == 0);

            //h0 += (h4 >> 26) * 5U + 5U; h4 &= 0x3ffffff;
            h0 += 5U;
            h1 += h0 >> 26; h0 &= 0x3ffffff;
            h2 += h1 >> 26; h1 &= 0x3ffffff;
            h3 += h2 >> 26; h2 &= 0x3ffffff;
            h4 += h3 >> 26; h3 &= 0x3ffffff;

            long c = ((int)(h4 >> 26) - 1) * 5;
            c += (long)k0 + ((h0      ) | (h1 << 26));
            Pack.UInt32_To_LE((uint)c, output, outOff     ); c >>= 32;
            c += (long)k1 + ((h1 >>  6) | (h2 << 20));
            Pack.UInt32_To_LE((uint)c, output, outOff +  4); c >>= 32;
            c += (long)k2 + ((h2 >> 12) | (h3 << 14));
            Pack.UInt32_To_LE((uint)c, output, outOff +  8); c >>= 32;
            c += (long)k3 + ((h3 >> 18) | (h4 << 8));
            Pack.UInt32_To_LE((uint)c, output, outOff + 12);

            Reset();
            return BlockSize;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int DoFinal(Span<byte> output)
        {
            Check.OutputLength(output, BlockSize, "output buffer is too short.");

            if (currentBlockOffset > 0)
            {
                // Process padded block
                if (currentBlockOffset < BlockSize)
                {
                    currentBlock[currentBlockOffset++] = 1;
                    while (currentBlockOffset < BlockSize)
                    {
                        currentBlock[currentBlockOffset++] = 0;
                    }

                    h4 -= (1 << 24);
                }

                ProcessBlock(currentBlock);
            }

            Debug.Assert(h4 >> 26 == 0);

            //h0 += (h4 >> 26) * 5U + 5U; h4 &= 0x3ffffff;
            h0 += 5U;
            h1 += h0 >> 26; h0 &= 0x3ffffff;
            h2 += h1 >> 26; h1 &= 0x3ffffff;
            h3 += h2 >> 26; h2 &= 0x3ffffff;
            h4 += h3 >> 26; h3 &= 0x3ffffff;

            long c = ((int)(h4 >> 26) - 1) * 5;
            c += (long)k0 + ((h0) | (h1 << 26));
            Pack.UInt32_To_LE((uint)c, output); c >>= 32;
            c += (long)k1 + ((h1 >> 6) | (h2 << 20));
            Pack.UInt32_To_LE((uint)c, output[4..]); c >>= 32;
            c += (long)k2 + ((h2 >> 12) | (h3 << 14));
            Pack.UInt32_To_LE((uint)c, output[8..]); c >>= 32;
            c += (long)k3 + ((h3 >> 18) | (h4 << 8));
            Pack.UInt32_To_LE((uint)c, output[12..]);

            Reset();
            return BlockSize;
        }
#endif

        public void Reset()
        {
            currentBlockOffset = 0;

            h0 = h1 = h2 = h3 = h4 = 0;
        }
    }
}
