using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /**
   * implementation of Ukrainian DSTU 7564 hash function
   */
    public class Dstu7564Digest
        : IDigest, IMemoable
    {
        private const int NB_512 = 8;  //Number of 8-byte words in state for <=256-bit hash code.
        private const int NB_1024 = 16;  //Number of 8-byte words in state for <=512-bit hash code. 

        private const int NR_512 = 10;  //Number of rounds for 512-bit state.
        private const int NR_1024 = 14;  //Number of rounds for 1024-bit state.

        private int hashSize;
        private int blockSize;

        private int columns;
        private int rounds;

        private ulong[] state;
        private ulong[] tempState1;
        private ulong[] tempState2;

        // TODO Guard against 'inputBlocks' overflow (2^64 blocks)
        private ulong inputBlocks;
        private int bufOff;
        private byte[] buf;

        public Dstu7564Digest(Dstu7564Digest digest)
        {
            CopyIn(digest);
        }

        private void CopyIn(Dstu7564Digest digest)
        {
            this.hashSize = digest.hashSize;
            this.blockSize = digest.blockSize;

            this.rounds = digest.rounds;
            if (columns > 0 && columns == digest.columns)
            {
                Array.Copy(digest.state, 0, state, 0, columns);
                Array.Copy(digest.buf, 0, buf, 0, blockSize);
            }
            else
            {
                this.columns = digest.columns;
                this.state = Arrays.Clone(digest.state);
                this.tempState1 = new ulong[columns];
                this.tempState2 = new ulong[columns];
                this.buf = Arrays.Clone(digest.buf);
            }

            this.inputBlocks = digest.inputBlocks;
            this.bufOff = digest.bufOff;
        }

        public Dstu7564Digest(int hashSizeBits)
        {
            if (hashSizeBits == 256 || hashSizeBits == 384 || hashSizeBits == 512)
            {
                this.hashSize = hashSizeBits / 8;
            }
            else
            {
                throw new ArgumentException("Hash size is not recommended. Use 256/384/512 instead");
            }

            if (hashSizeBits > 256)
            {
                this.columns = NB_1024;
                this.rounds = NR_1024;
            }
            else
            {
                this.columns = NB_512;
                this.rounds = NR_512;
            }

            this.blockSize = columns << 3;

            this.state = new ulong[columns];
            this.state[0] = (ulong)blockSize;

            this.tempState1 = new ulong[columns];
            this.tempState2 = new ulong[columns];

            this.buf = new byte[blockSize];
        }

        public virtual string AlgorithmName
        {
            get { return "DSTU7564"; }
        }

        public virtual int GetDigestSize()
        {
            return hashSize;
        }

        public virtual int GetByteLength()
        {
            return blockSize;
        }

        public virtual void Update(byte input)
        {
            buf[bufOff++] = input;
            if (bufOff == blockSize)
            {
                ProcessBlock(buf, 0);
                bufOff = 0;
                ++inputBlocks;
            }
        }

        public virtual void BlockUpdate(byte[] input, int inOff, int length)
        {
            while (bufOff != 0 && length > 0)
            {
                Update(input[inOff++]);
                --length;
            }

            while (length >= blockSize)
            {
                ProcessBlock(input, inOff);
                inOff += blockSize;
                length -= blockSize;
                ++inputBlocks;
            }

            while (length > 0)
            {
                Update(input[inOff++]);
                --length;
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            while (bufOff != 0 && input.Length > 0)
            {
                Update(input[0]);
                input = input[1..];
            }

            while (input.Length >= blockSize)
            {
                ProcessBlock(input);
                input = input[blockSize..];
                ++inputBlocks;
            }

            while (input.Length > 0)
            {
                Update(input[0]);
                input = input[1..];
            }
        }
#endif

        public virtual int DoFinal(byte[] output, int outOff)
        {
            // Apply padding: terminator byte and 96-bit length field
            {
                int inputBytes = bufOff;
                buf[bufOff++] = (byte)0x80;

                int lenPos = blockSize - 12;
                if (bufOff > lenPos)
                {
                    while (bufOff < blockSize)
                    {
                        buf[bufOff++] = 0;
                    }
                    bufOff = 0;
                    ProcessBlock(buf, 0);
                }

                while (bufOff < lenPos)
                {
                    buf[bufOff++] = 0;
                }

                ulong c = ((inputBlocks & 0xFFFFFFFFUL) * (ulong)blockSize + (uint)inputBytes) << 3;
                Pack.UInt32_To_LE((uint)c, buf, bufOff);
                bufOff += 4;
                c >>= 32;
                c += ((inputBlocks >> 32) * (ulong)blockSize) << 3;
                Pack.UInt64_To_LE(c, buf, bufOff);
                //bufOff += 8;
                ProcessBlock(buf, 0);
            }

            {
                Array.Copy(state, 0, tempState1, 0, columns);

                P(tempState1);

                for (int col = 0; col < columns; ++col)
                {
                    state[col] ^= tempState1[col];
                }
            }

            int neededColumns = hashSize / 8;
            for (int col = columns - neededColumns; col < columns; ++col)
            {
                Pack.UInt64_To_LE(state[col], output, outOff);
                outOff += 8;
            }

            Reset();

            return hashSize;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            // Apply padding: terminator byte and 96-bit length field
            {
                int inputBytes = bufOff;
                buf[bufOff++] = (byte)0x80;

                int lenPos = blockSize - 12;
                if (bufOff > lenPos)
                {
                    while (bufOff < blockSize)
                    {
                        buf[bufOff++] = 0;
                    }
                    bufOff = 0;
                    ProcessBlock(buf, 0);
                }

                while (bufOff < lenPos)
                {
                    buf[bufOff++] = 0;
                }

                ulong c = ((inputBlocks & 0xFFFFFFFFUL) * (ulong)blockSize + (uint)inputBytes) << 3;
                Pack.UInt32_To_LE((uint)c, buf, bufOff);
                bufOff += 4;
                c >>= 32;
                c += ((inputBlocks >> 32) * (ulong)blockSize) << 3;
                Pack.UInt64_To_LE(c, buf, bufOff);
                //bufOff += 8;
                ProcessBlock(buf, 0);
            }

            {
                Array.Copy(state, 0, tempState1, 0, columns);

                P(tempState1);

                for (int col = 0; col < columns; ++col)
                {
                    state[col] ^= tempState1[col];
                }
            }

            int neededColumns = hashSize / 8;
            for (int col = columns - neededColumns; col < columns; ++col)
            {
                Pack.UInt64_To_LE(state[col], output);
                output = output[8..];
            }

            Reset();

            return hashSize;
        }
#endif

        public virtual void Reset()
        {
            Array.Clear(state, 0, state.Length);
            state[0] = (ulong)blockSize;

            inputBlocks = 0;
            bufOff = 0;
        }

        protected virtual void ProcessBlock(byte[] input, int inOff)
        {
            int pos = inOff;
            for (int col = 0; col < columns; ++col)
            {
                ulong word = Pack.LE_To_UInt64(input, pos);
                pos += 8;

                tempState1[col] = state[col] ^ word;
                tempState2[col] = word;
            }

            P(tempState1);
            Q(tempState2);

            for (int col = 0; col < columns; ++col)
            {
                state[col] ^= tempState1[col] ^ tempState2[col];
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        protected virtual void ProcessBlock(ReadOnlySpan<byte> input)
        {
            for (int col = 0; col < columns; ++col)
            {
                ulong word = Pack.LE_To_UInt64(input);
                input = input[8..];

                tempState1[col] = state[col] ^ word;
                tempState2[col] = word;
            }

            P(tempState1);
            Q(tempState2);

            for (int col = 0; col < columns; ++col)
            {
                state[col] ^= tempState1[col] ^ tempState2[col];
            }
        }
#endif

        private void P(ulong[] s)
        {
            for (int round = 0; round < rounds; ++round)
            {
                ulong rc = (ulong)round;

                /* AddRoundConstants */
                for (int col = 0; col < columns; ++col)
                {
                    s[col] ^= rc;
                    rc += 0x10L;
                }

                ShiftRows(s);
                SubBytes(s);
                MixColumns(s);
            }
        }

        private void Q(ulong[] s)
        {
            for (int round = 0; round < rounds; ++round)
            {
                /* AddRoundConstantsQ */
                ulong rc = ((ulong)(((columns - 1) << 4) ^ round) << 56) | 0x00F0F0F0F0F0F0F3UL;

                for (int col = 0; col < columns; ++col)
                {
                    s[col] += rc;
                    rc -= 0x1000000000000000L;
                }

                ShiftRows(s);
                SubBytes(s);
                MixColumns(s);
            }
        }

        private static ulong MixColumn(ulong c)
        {
            //// Calculate column multiplied by powers of 'x'
            //ulong x0 = c;
            //ulong x1 = ((x0 & 0x7F7F7F7F7F7F7F7FUL) << 1) ^ (((x0 & 0x8080808080808080UL) >> 7) * 0x1DUL);
            //ulong x2 = ((x1 & 0x7F7F7F7F7F7F7F7FUL) << 1) ^ (((x1 & 0x8080808080808080UL) >> 7) * 0x1DUL);
            //ulong x3 = ((x2 & 0x7F7F7F7F7F7F7F7FUL) << 1) ^ (((x2 & 0x8080808080808080UL) >> 7) * 0x1DUL);

            //// Calculate products with circulant matrix from (0x01, 0x01, 0x05, 0x01, 0x08, 0x06, 0x07, 0x04)
            //ulong m0 = x0;
            //ulong m1 = x0;
            //ulong m2 = x0 ^ x2;
            //ulong m3 = x0;
            //ulong m4 = x3;
            //ulong m5 = x1 ^ x2;
            //ulong m6 = x0 ^ x1 ^ x2;
            //ulong m7 = x2;

            //// Assemble the rotated products
            //return m0
            //    ^ Rotate(8, m1)
            //    ^ Rotate(16, m2)
            //    ^ Rotate(24, m3)
            //    ^ Rotate(32, m4)
            //    ^ Rotate(40, m5)
            //    ^ Rotate(48, m6)
            //    ^ Rotate(56, m7);

            // Multiply elements by 'x'
            ulong x1 = ((c & 0x7F7F7F7F7F7F7F7FUL) << 1) ^ (((c & 0x8080808080808080UL) >> 7) * 0x1DUL);
            ulong u, v;

            u  = Rotate(8, c) ^ c;
            u ^= Rotate(16, u);
            u ^= Rotate(48, c);

            v  = u ^ c ^ x1;

            // Multiply elements by 'x^2'
            v  = ((v & 0x3F3F3F3F3F3F3F3FUL) << 2) ^ (((v & 0x8080808080808080UL) >> 6) * 0x1DUL) ^ (((v & 0x4040404040404040UL) >> 6) * 0x1DUL);

            return u ^ Rotate(32, v) ^ Rotate(40, x1) ^ Rotate(48, x1);
        }

        private void MixColumns(ulong[] s)
        {
            for (int col = 0; col < columns; ++col)
            {
                s[col] = MixColumn(s[col]);
            }
        }

        private static ulong Rotate(int n, ulong x)
        {
            return (x >> n) | (x << -n);
        }

        private void ShiftRows(ulong[] s)
        {
            switch (columns)
            {
            case NB_512:
            {
                ulong c0 = s[0], c1 = s[1], c2 = s[2], c3 = s[3];
                ulong c4 = s[4], c5 = s[5], c6 = s[6], c7 = s[7];
                ulong d;

                d = (c0 ^ c4) & 0xFFFFFFFF00000000UL; c0 ^= d; c4 ^= d;
                d = (c1 ^ c5) & 0x00FFFFFFFF000000UL; c1 ^= d; c5 ^= d;
                d = (c2 ^ c6) & 0x0000FFFFFFFF0000UL; c2 ^= d; c6 ^= d;
                d = (c3 ^ c7) & 0x000000FFFFFFFF00UL; c3 ^= d; c7 ^= d;

                d = (c0 ^ c2) & 0xFFFF0000FFFF0000UL; c0 ^= d; c2 ^= d;
                d = (c1 ^ c3) & 0x00FFFF0000FFFF00UL; c1 ^= d; c3 ^= d;
                d = (c4 ^ c6) & 0xFFFF0000FFFF0000UL; c4 ^= d; c6 ^= d;
                d = (c5 ^ c7) & 0x00FFFF0000FFFF00UL; c5 ^= d; c7 ^= d;

                d = (c0 ^ c1) & 0xFF00FF00FF00FF00UL; c0 ^= d; c1 ^= d;
                d = (c2 ^ c3) & 0xFF00FF00FF00FF00UL; c2 ^= d; c3 ^= d;
                d = (c4 ^ c5) & 0xFF00FF00FF00FF00UL; c4 ^= d; c5 ^= d;
                d = (c6 ^ c7) & 0xFF00FF00FF00FF00UL; c6 ^= d; c7 ^= d;

                s[0] = c0; s[1] = c1; s[2] = c2; s[3] = c3;
                s[4] = c4; s[5] = c5; s[6] = c6; s[7] = c7;
                break;
            }
            case NB_1024:
            {
                ulong c00 = s[0], c01 = s[1], c02 = s[2], c03 = s[3];
                ulong c04 = s[4], c05 = s[5], c06 = s[6], c07 = s[7];
                ulong c08 = s[8], c09 = s[9], c10 = s[10], c11 = s[11];
                ulong c12 = s[12], c13 = s[13], c14 = s[14], c15 = s[15];
                ulong d;

                // NOTE: Row 7 is shifted by 11

                d = (c00 ^ c08) & 0xFF00000000000000UL; c00 ^= d; c08 ^= d;
                d = (c01 ^ c09) & 0xFF00000000000000UL; c01 ^= d; c09 ^= d;
                d = (c02 ^ c10) & 0xFFFF000000000000UL; c02 ^= d; c10 ^= d;
                d = (c03 ^ c11) & 0xFFFFFF0000000000UL; c03 ^= d; c11 ^= d;
                d = (c04 ^ c12) & 0xFFFFFFFF00000000UL; c04 ^= d; c12 ^= d;
                d = (c05 ^ c13) & 0x00FFFFFFFF000000UL; c05 ^= d; c13 ^= d;
                d = (c06 ^ c14) & 0x00FFFFFFFFFF0000UL; c06 ^= d; c14 ^= d;
                d = (c07 ^ c15) & 0x00FFFFFFFFFFFF00UL; c07 ^= d; c15 ^= d;

                d = (c00 ^ c04) & 0x00FFFFFF00000000UL; c00 ^= d; c04 ^= d;
                d = (c01 ^ c05) & 0xFFFFFFFFFF000000UL; c01 ^= d; c05 ^= d;
                d = (c02 ^ c06) & 0xFF00FFFFFFFF0000UL; c02 ^= d; c06 ^= d;
                d = (c03 ^ c07) & 0xFF0000FFFFFFFF00UL; c03 ^= d; c07 ^= d;
                d = (c08 ^ c12) & 0x00FFFFFF00000000UL; c08 ^= d; c12 ^= d;
                d = (c09 ^ c13) & 0xFFFFFFFFFF000000UL; c09 ^= d; c13 ^= d;
                d = (c10 ^ c14) & 0xFF00FFFFFFFF0000UL; c10 ^= d; c14 ^= d;
                d = (c11 ^ c15) & 0xFF0000FFFFFFFF00UL; c11 ^= d; c15 ^= d;

                d = (c00 ^ c02) & 0xFFFF0000FFFF0000UL; c00 ^= d; c02 ^= d;
                d = (c01 ^ c03) & 0x00FFFF0000FFFF00UL; c01 ^= d; c03 ^= d;
                d = (c04 ^ c06) & 0xFFFF0000FFFF0000UL; c04 ^= d; c06 ^= d;
                d = (c05 ^ c07) & 0x00FFFF0000FFFF00UL; c05 ^= d; c07 ^= d;
                d = (c08 ^ c10) & 0xFFFF0000FFFF0000UL; c08 ^= d; c10 ^= d;
                d = (c09 ^ c11) & 0x00FFFF0000FFFF00UL; c09 ^= d; c11 ^= d;
                d = (c12 ^ c14) & 0xFFFF0000FFFF0000UL; c12 ^= d; c14 ^= d;
                d = (c13 ^ c15) & 0x00FFFF0000FFFF00UL; c13 ^= d; c15 ^= d;

                d = (c00 ^ c01) & 0xFF00FF00FF00FF00UL; c00 ^= d; c01 ^= d;
                d = (c02 ^ c03) & 0xFF00FF00FF00FF00UL; c02 ^= d; c03 ^= d;
                d = (c04 ^ c05) & 0xFF00FF00FF00FF00UL; c04 ^= d; c05 ^= d;
                d = (c06 ^ c07) & 0xFF00FF00FF00FF00UL; c06 ^= d; c07 ^= d;
                d = (c08 ^ c09) & 0xFF00FF00FF00FF00UL; c08 ^= d; c09 ^= d;
                d = (c10 ^ c11) & 0xFF00FF00FF00FF00UL; c10 ^= d; c11 ^= d;
                d = (c12 ^ c13) & 0xFF00FF00FF00FF00UL; c12 ^= d; c13 ^= d;
                d = (c14 ^ c15) & 0xFF00FF00FF00FF00UL; c14 ^= d; c15 ^= d;

                s[0] = c00; s[1] = c01; s[2] = c02; s[3] = c03;
                s[4] = c04; s[5] = c05; s[6] = c06; s[7] = c07;
                s[8] = c08; s[9] = c09; s[10] = c10; s[11] = c11;
                s[12] = c12; s[13] = c13; s[14] = c14; s[15] = c15;
                break;
            }
            default:
            {
                throw new InvalidOperationException("unsupported state size: only 512/1024 are allowed");
            }
            }
        }

        private void SubBytes(ulong[] s)
        {
            for (int i = 0; i < columns; ++i)
            {
                ulong u = s[i];
                uint lo = (uint)u, hi = (uint)(u >> 32);
                byte t0 = S0[lo & 0xFF];
                byte t1 = S1[(lo >> 8) & 0xFF];
                byte t2 = S2[(lo >> 16) & 0xFF];
                byte t3 = S3[lo >> 24];
                lo = (uint)t0 | ((uint)t1 << 8) | ((uint)t2 << 16) | ((uint)t3 << 24);
                byte t4 = S0[hi & 0xFF];
                byte t5 = S1[(hi >> 8) & 0xFF];
                byte t6 = S2[(hi >> 16) & 0xFF];
                byte t7 = S3[hi >> 24];
                hi = (uint)t4 | ((uint)t5 << 8) | ((uint)t6 << 16) | ((uint)t7 << 24);
                s[i] = (ulong)lo | ((ulong)hi << 32);
            }
        }

        private static readonly byte[] S0 = new byte[] {
            0xa8, 0x43, 0x5f, 0x06, 0x6b, 0x75, 0x6c, 0x59, 0x71, 0xdf, 0x87, 0x95, 0x17, 0xf0, 0xd8, 0x09, 
            0x6d, 0xf3, 0x1d, 0xcb, 0xc9, 0x4d, 0x2c, 0xaf, 0x79, 0xe0, 0x97, 0xfd, 0x6f, 0x4b, 0x45, 0x39, 
            0x3e, 0xdd, 0xa3, 0x4f, 0xb4, 0xb6, 0x9a, 0x0e, 0x1f, 0xbf, 0x15, 0xe1, 0x49, 0xd2, 0x93, 0xc6, 
            0x92, 0x72, 0x9e, 0x61, 0xd1, 0x63, 0xfa, 0xee, 0xf4, 0x19, 0xd5, 0xad, 0x58, 0xa4, 0xbb, 0xa1, 
            0xdc, 0xf2, 0x83, 0x37, 0x42, 0xe4, 0x7a, 0x32, 0x9c, 0xcc, 0xab, 0x4a, 0x8f, 0x6e, 0x04, 0x27, 
            0x2e, 0xe7, 0xe2, 0x5a, 0x96, 0x16, 0x23, 0x2b, 0xc2, 0x65, 0x66, 0x0f, 0xbc, 0xa9, 0x47, 0x41, 
            0x34, 0x48, 0xfc, 0xb7, 0x6a, 0x88, 0xa5, 0x53, 0x86, 0xf9, 0x5b, 0xdb, 0x38, 0x7b, 0xc3, 0x1e, 
            0x22, 0x33, 0x24, 0x28, 0x36, 0xc7, 0xb2, 0x3b, 0x8e, 0x77, 0xba, 0xf5, 0x14, 0x9f, 0x08, 0x55, 
            0x9b, 0x4c, 0xfe, 0x60, 0x5c, 0xda, 0x18, 0x46, 0xcd, 0x7d, 0x21, 0xb0, 0x3f, 0x1b, 0x89, 0xff, 
            0xeb, 0x84, 0x69, 0x3a, 0x9d, 0xd7, 0xd3, 0x70, 0x67, 0x40, 0xb5, 0xde, 0x5d, 0x30, 0x91, 0xb1, 
            0x78, 0x11, 0x01, 0xe5, 0x00, 0x68, 0x98, 0xa0, 0xc5, 0x02, 0xa6, 0x74, 0x2d, 0x0b, 0xa2, 0x76, 
            0xb3, 0xbe, 0xce, 0xbd, 0xae, 0xe9, 0x8a, 0x31, 0x1c, 0xec, 0xf1, 0x99, 0x94, 0xaa, 0xf6, 0x26, 
            0x2f, 0xef, 0xe8, 0x8c, 0x35, 0x03, 0xd4, 0x7f, 0xfb, 0x05, 0xc1, 0x5e, 0x90, 0x20, 0x3d, 0x82, 
            0xf7, 0xea, 0x0a, 0x0d, 0x7e, 0xf8, 0x50, 0x1a, 0xc4, 0x07, 0x57, 0xb8, 0x3c, 0x62, 0xe3, 0xc8, 
            0xac, 0x52, 0x64, 0x10, 0xd0, 0xd9, 0x13, 0x0c, 0x12, 0x29, 0x51, 0xb9, 0xcf, 0xd6, 0x73, 0x8d, 
            0x81, 0x54, 0xc0, 0xed, 0x4e, 0x44, 0xa7, 0x2a, 0x85, 0x25, 0xe6, 0xca, 0x7c, 0x8b, 0x56, 0x80
        };

        private static readonly byte[] S1 = new byte[] {
            0xce, 0xbb, 0xeb, 0x92, 0xea, 0xcb, 0x13, 0xc1, 0xe9, 0x3a, 0xd6, 0xb2, 0xd2, 0x90, 0x17, 0xf8, 
            0x42, 0x15, 0x56, 0xb4, 0x65, 0x1c, 0x88, 0x43, 0xc5, 0x5c, 0x36, 0xba, 0xf5, 0x57, 0x67, 0x8d, 
            0x31, 0xf6, 0x64, 0x58, 0x9e, 0xf4, 0x22, 0xaa, 0x75, 0x0f, 0x02, 0xb1, 0xdf, 0x6d, 0x73, 0x4d, 
            0x7c, 0x26, 0x2e, 0xf7, 0x08, 0x5d, 0x44, 0x3e, 0x9f, 0x14, 0xc8, 0xae, 0x54, 0x10, 0xd8, 0xbc, 
            0x1a, 0x6b, 0x69, 0xf3, 0xbd, 0x33, 0xab, 0xfa, 0xd1, 0x9b, 0x68, 0x4e, 0x16, 0x95, 0x91, 0xee, 
            0x4c, 0x63, 0x8e, 0x5b, 0xcc, 0x3c, 0x19, 0xa1, 0x81, 0x49, 0x7b, 0xd9, 0x6f, 0x37, 0x60, 0xca, 
            0xe7, 0x2b, 0x48, 0xfd, 0x96, 0x45, 0xfc, 0x41, 0x12, 0x0d, 0x79, 0xe5, 0x89, 0x8c, 0xe3, 0x20, 
            0x30, 0xdc, 0xb7, 0x6c, 0x4a, 0xb5, 0x3f, 0x97, 0xd4, 0x62, 0x2d, 0x06, 0xa4, 0xa5, 0x83, 0x5f, 
            0x2a, 0xda, 0xc9, 0x00, 0x7e, 0xa2, 0x55, 0xbf, 0x11, 0xd5, 0x9c, 0xcf, 0x0e, 0x0a, 0x3d, 0x51, 
            0x7d, 0x93, 0x1b, 0xfe, 0xc4, 0x47, 0x09, 0x86, 0x0b, 0x8f, 0x9d, 0x6a, 0x07, 0xb9, 0xb0, 0x98, 
            0x18, 0x32, 0x71, 0x4b, 0xef, 0x3b, 0x70, 0xa0, 0xe4, 0x40, 0xff, 0xc3, 0xa9, 0xe6, 0x78, 0xf9, 
            0x8b, 0x46, 0x80, 0x1e, 0x38, 0xe1, 0xb8, 0xa8, 0xe0, 0x0c, 0x23, 0x76, 0x1d, 0x25, 0x24, 0x05, 
            0xf1, 0x6e, 0x94, 0x28, 0x9a, 0x84, 0xe8, 0xa3, 0x4f, 0x77, 0xd3, 0x85, 0xe2, 0x52, 0xf2, 0x82, 
            0x50, 0x7a, 0x2f, 0x74, 0x53, 0xb3, 0x61, 0xaf, 0x39, 0x35, 0xde, 0xcd, 0x1f, 0x99, 0xac, 0xad, 
            0x72, 0x2c, 0xdd, 0xd0, 0x87, 0xbe, 0x5e, 0xa6, 0xec, 0x04, 0xc6, 0x03, 0x34, 0xfb, 0xdb, 0x59, 
            0xb6, 0xc2, 0x01, 0xf0, 0x5a, 0xed, 0xa7, 0x66, 0x21, 0x7f, 0x8a, 0x27, 0xc7, 0xc0, 0x29, 0xd7
        };

        private static readonly byte[] S2 = new byte[] {
            0x93, 0xd9, 0x9a, 0xb5, 0x98, 0x22, 0x45, 0xfc, 0xba, 0x6a, 0xdf, 0x02, 0x9f, 0xdc, 0x51, 0x59, 
            0x4a, 0x17, 0x2b, 0xc2, 0x94, 0xf4, 0xbb, 0xa3, 0x62, 0xe4, 0x71, 0xd4, 0xcd, 0x70, 0x16, 0xe1, 
            0x49, 0x3c, 0xc0, 0xd8, 0x5c, 0x9b, 0xad, 0x85, 0x53, 0xa1, 0x7a, 0xc8, 0x2d, 0xe0, 0xd1, 0x72, 
            0xa6, 0x2c, 0xc4, 0xe3, 0x76, 0x78, 0xb7, 0xb4, 0x09, 0x3b, 0x0e, 0x41, 0x4c, 0xde, 0xb2, 0x90, 
            0x25, 0xa5, 0xd7, 0x03, 0x11, 0x00, 0xc3, 0x2e, 0x92, 0xef, 0x4e, 0x12, 0x9d, 0x7d, 0xcb, 0x35, 
            0x10, 0xd5, 0x4f, 0x9e, 0x4d, 0xa9, 0x55, 0xc6, 0xd0, 0x7b, 0x18, 0x97, 0xd3, 0x36, 0xe6, 0x48, 
            0x56, 0x81, 0x8f, 0x77, 0xcc, 0x9c, 0xb9, 0xe2, 0xac, 0xb8, 0x2f, 0x15, 0xa4, 0x7c, 0xda, 0x38, 
            0x1e, 0x0b, 0x05, 0xd6, 0x14, 0x6e, 0x6c, 0x7e, 0x66, 0xfd, 0xb1, 0xe5, 0x60, 0xaf, 0x5e, 0x33, 
            0x87, 0xc9, 0xf0, 0x5d, 0x6d, 0x3f, 0x88, 0x8d, 0xc7, 0xf7, 0x1d, 0xe9, 0xec, 0xed, 0x80, 0x29, 
            0x27, 0xcf, 0x99, 0xa8, 0x50, 0x0f, 0x37, 0x24, 0x28, 0x30, 0x95, 0xd2, 0x3e, 0x5b, 0x40, 0x83, 
            0xb3, 0x69, 0x57, 0x1f, 0x07, 0x1c, 0x8a, 0xbc, 0x20, 0xeb, 0xce, 0x8e, 0xab, 0xee, 0x31, 0xa2, 
            0x73, 0xf9, 0xca, 0x3a, 0x1a, 0xfb, 0x0d, 0xc1, 0xfe, 0xfa, 0xf2, 0x6f, 0xbd, 0x96, 0xdd, 0x43, 
            0x52, 0xb6, 0x08, 0xf3, 0xae, 0xbe, 0x19, 0x89, 0x32, 0x26, 0xb0, 0xea, 0x4b, 0x64, 0x84, 0x82, 
            0x6b, 0xf5, 0x79, 0xbf, 0x01, 0x5f, 0x75, 0x63, 0x1b, 0x23, 0x3d, 0x68, 0x2a, 0x65, 0xe8, 0x91, 
            0xf6, 0xff, 0x13, 0x58, 0xf1, 0x47, 0x0a, 0x7f, 0xc5, 0xa7, 0xe7, 0x61, 0x5a, 0x06, 0x46, 0x44, 
            0x42, 0x04, 0xa0, 0xdb, 0x39, 0x86, 0x54, 0xaa, 0x8c, 0x34, 0x21, 0x8b, 0xf8, 0x0c, 0x74, 0x67
        };

        private static readonly byte[] S3 = new byte[] {
            0x68, 0x8d, 0xca, 0x4d, 0x73, 0x4b, 0x4e, 0x2a, 0xd4, 0x52, 0x26, 0xb3, 0x54, 0x1e, 0x19, 0x1f, 
            0x22, 0x03, 0x46, 0x3d, 0x2d, 0x4a, 0x53, 0x83, 0x13, 0x8a, 0xb7, 0xd5, 0x25, 0x79, 0xf5, 0xbd, 
            0x58, 0x2f, 0x0d, 0x02, 0xed, 0x51, 0x9e, 0x11, 0xf2, 0x3e, 0x55, 0x5e, 0xd1, 0x16, 0x3c, 0x66, 
            0x70, 0x5d, 0xf3, 0x45, 0x40, 0xcc, 0xe8, 0x94, 0x56, 0x08, 0xce, 0x1a, 0x3a, 0xd2, 0xe1, 0xdf, 
            0xb5, 0x38, 0x6e, 0x0e, 0xe5, 0xf4, 0xf9, 0x86, 0xe9, 0x4f, 0xd6, 0x85, 0x23, 0xcf, 0x32, 0x99, 
            0x31, 0x14, 0xae, 0xee, 0xc8, 0x48, 0xd3, 0x30, 0xa1, 0x92, 0x41, 0xb1, 0x18, 0xc4, 0x2c, 0x71, 
            0x72, 0x44, 0x15, 0xfd, 0x37, 0xbe, 0x5f, 0xaa, 0x9b, 0x88, 0xd8, 0xab, 0x89, 0x9c, 0xfa, 0x60, 
            0xea, 0xbc, 0x62, 0x0c, 0x24, 0xa6, 0xa8, 0xec, 0x67, 0x20, 0xdb, 0x7c, 0x28, 0xdd, 0xac, 0x5b, 
            0x34, 0x7e, 0x10, 0xf1, 0x7b, 0x8f, 0x63, 0xa0, 0x05, 0x9a, 0x43, 0x77, 0x21, 0xbf, 0x27, 0x09, 
            0xc3, 0x9f, 0xb6, 0xd7, 0x29, 0xc2, 0xeb, 0xc0, 0xa4, 0x8b, 0x8c, 0x1d, 0xfb, 0xff, 0xc1, 0xb2, 
            0x97, 0x2e, 0xf8, 0x65, 0xf6, 0x75, 0x07, 0x04, 0x49, 0x33, 0xe4, 0xd9, 0xb9, 0xd0, 0x42, 0xc7, 
            0x6c, 0x90, 0x00, 0x8e, 0x6f, 0x50, 0x01, 0xc5, 0xda, 0x47, 0x3f, 0xcd, 0x69, 0xa2, 0xe2, 0x7a, 
            0xa7, 0xc6, 0x93, 0x0f, 0x0a, 0x06, 0xe6, 0x2b, 0x96, 0xa3, 0x1c, 0xaf, 0x6a, 0x12, 0x84, 0x39, 
            0xe7, 0xb0, 0x82, 0xf7, 0xfe, 0x9d, 0x87, 0x5c, 0x81, 0x35, 0xde, 0xb4, 0xa5, 0xfc, 0x80, 0xef, 
            0xcb, 0xbb, 0x6b, 0x76, 0xba, 0x5a, 0x7d, 0x78, 0x0b, 0x95, 0xe3, 0xad, 0x74, 0x98, 0x3b, 0x36, 
            0x64, 0x6d, 0xdc, 0xf0, 0x59, 0xa9, 0x4c, 0x17, 0x7f, 0x91, 0xb8, 0xc9, 0x57, 0x1b, 0xe0, 0x61
        };

        public virtual IMemoable Copy()
        {
            return new Dstu7564Digest(this);
        }

        public virtual void Reset(IMemoable other)
        {
            Dstu7564Digest d = (Dstu7564Digest)other;

            CopyIn(d);
        }
    }
}
