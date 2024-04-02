using System;


namespace Org.BouncyCastle.Crypto.Digests
{
    public class Haraka256Digest : HarakaBase
    {
        private static readonly byte[][] RC = new byte[][]{
        new byte[]{(byte)0x06, (byte)0x84, (byte)0x70, (byte)0x4c, (byte)0xe6, (byte)0x20, (byte)0xc0, (byte)0x0a, (byte)0xb2, (byte)0xc5, (byte)0xfe, (byte)0xf0, (byte)0x75, (byte)0x81, (byte)0x7b, (byte)0x9d},
        new byte[]{(byte)0x8b, (byte)0x66, (byte)0xb4, (byte)0xe1, (byte)0x88, (byte)0xf3, (byte)0xa0, (byte)0x6b, (byte)0x64, (byte)0x0f, (byte)0x6b, (byte)0xa4, (byte)0x2f, (byte)0x08, (byte)0xf7, (byte)0x17},
        new byte[]{(byte)0x34, (byte)0x02, (byte)0xde, (byte)0x2d, (byte)0x53, (byte)0xf2, (byte)0x84, (byte)0x98, (byte)0xcf, (byte)0x02, (byte)0x9d, (byte)0x60, (byte)0x9f, (byte)0x02, (byte)0x91, (byte)0x14},
        new byte[]{(byte)0x0e, (byte)0xd6, (byte)0xea, (byte)0xe6, (byte)0x2e, (byte)0x7b, (byte)0x4f, (byte)0x08, (byte)0xbb, (byte)0xf3, (byte)0xbc, (byte)0xaf, (byte)0xfd, (byte)0x5b, (byte)0x4f, (byte)0x79},
        new byte[]{(byte)0xcb, (byte)0xcf, (byte)0xb0, (byte)0xcb, (byte)0x48, (byte)0x72, (byte)0x44, (byte)0x8b, (byte)0x79, (byte)0xee, (byte)0xcd, (byte)0x1c, (byte)0xbe, (byte)0x39, (byte)0x70, (byte)0x44},
        new byte[]{(byte)0x7e, (byte)0xea, (byte)0xcd, (byte)0xee, (byte)0x6e, (byte)0x90, (byte)0x32, (byte)0xb7, (byte)0x8d, (byte)0x53, (byte)0x35, (byte)0xed, (byte)0x2b, (byte)0x8a, (byte)0x05, (byte)0x7b},
        new byte[]{(byte)0x67, (byte)0xc2, (byte)0x8f, (byte)0x43, (byte)0x5e, (byte)0x2e, (byte)0x7c, (byte)0xd0, (byte)0xe2, (byte)0x41, (byte)0x27, (byte)0x61, (byte)0xda, (byte)0x4f, (byte)0xef, (byte)0x1b},
        new byte[]{(byte)0x29, (byte)0x24, (byte)0xd9, (byte)0xb0, (byte)0xaf, (byte)0xca, (byte)0xcc, (byte)0x07, (byte)0x67, (byte)0x5f, (byte)0xfd, (byte)0xe2, (byte)0x1f, (byte)0xc7, (byte)0x0b, (byte)0x3b},
        new byte[]{(byte)0xab, (byte)0x4d, (byte)0x63, (byte)0xf1, (byte)0xe6, (byte)0x86, (byte)0x7f, (byte)0xe9, (byte)0xec, (byte)0xdb, (byte)0x8f, (byte)0xca, (byte)0xb9, (byte)0xd4, (byte)0x65, (byte)0xee},
        new byte[]{(byte)0x1c, (byte)0x30, (byte)0xbf, (byte)0x84, (byte)0xd4, (byte)0xb7, (byte)0xcd, (byte)0x64, (byte)0x5b, (byte)0x2a, (byte)0x40, (byte)0x4f, (byte)0xad, (byte)0x03, (byte)0x7e, (byte)0x33},
        new byte[]{(byte)0xb2, (byte)0xcc, (byte)0x0b, (byte)0xb9, (byte)0x94, (byte)0x17, (byte)0x23, (byte)0xbf, (byte)0x69, (byte)0x02, (byte)0x8b, (byte)0x2e, (byte)0x8d, (byte)0xf6, (byte)0x98, (byte)0x00},
        new byte[]{(byte)0xfa, (byte)0x04, (byte)0x78, (byte)0xa6, (byte)0xde, (byte)0x6f, (byte)0x55, (byte)0x72, (byte)0x4a, (byte)0xaa, (byte)0x9e, (byte)0xc8, (byte)0x5c, (byte)0x9d, (byte)0x2d, (byte)0x8a},
        new byte[]{(byte)0xdf, (byte)0xb4, (byte)0x9f, (byte)0x2b, (byte)0x6b, (byte)0x77, (byte)0x2a, (byte)0x12, (byte)0x0e, (byte)0xfa, (byte)0x4f, (byte)0x2e, (byte)0x29, (byte)0x12, (byte)0x9f, (byte)0xd4},
        new byte[]{(byte)0x1e, (byte)0xa1, (byte)0x03, (byte)0x44, (byte)0xf4, (byte)0x49, (byte)0xa2, (byte)0x36, (byte)0x32, (byte)0xd6, (byte)0x11, (byte)0xae, (byte)0xbb, (byte)0x6a, (byte)0x12, (byte)0xee},
        new byte[]{(byte)0xaf, (byte)0x04, (byte)0x49, (byte)0x88, (byte)0x4b, (byte)0x05, (byte)0x00, (byte)0x84, (byte)0x5f, (byte)0x96, (byte)0x00, (byte)0xc9, (byte)0x9c, (byte)0xa8, (byte)0xec, (byte)0xa6},
        new byte[]{(byte)0x21, (byte)0x02, (byte)0x5e, (byte)0xd8, (byte)0x9d, (byte)0x19, (byte)0x9c, (byte)0x4f, (byte)0x78, (byte)0xa2, (byte)0xc7, (byte)0xe3, (byte)0x27, (byte)0xe5, (byte)0x93, (byte)0xec},
        new byte[]{(byte)0xbf, (byte)0x3a, (byte)0xaa, (byte)0xf8, (byte)0xa7, (byte)0x59, (byte)0xc9, (byte)0xb7, (byte)0xb9, (byte)0x28, (byte)0x2e, (byte)0xcd, (byte)0x82, (byte)0xd4, (byte)0x01, (byte)0x73},
        new byte[]{(byte)0x62, (byte)0x60, (byte)0x70, (byte)0x0d, (byte)0x61, (byte)0x86, (byte)0xb0, (byte)0x17, (byte)0x37, (byte)0xf2, (byte)0xef, (byte)0xd9, (byte)0x10, (byte)0x30, (byte)0x7d, (byte)0x6b},
        new byte[]{(byte)0x5a, (byte)0xca, (byte)0x45, (byte)0xc2, (byte)0x21, (byte)0x30, (byte)0x04, (byte)0x43, (byte)0x81, (byte)0xc2, (byte)0x91, (byte)0x53, (byte)0xf6, (byte)0xfc, (byte)0x9a, (byte)0xc6},
        new byte[]{(byte)0x92, (byte)0x23, (byte)0x97, (byte)0x3c, (byte)0x22, (byte)0x6b, (byte)0x68, (byte)0xbb, (byte)0x2c, (byte)0xaf, (byte)0x92, (byte)0xe8, (byte)0x36, (byte)0xd1, (byte)0x94, (byte)0x3a}
    };
        private readonly byte[] buffer;
        private int off;
        private void mix256(byte[][] s1, byte[][] s2)
        {
            Array.Copy(s1[0], 0, s2[0], 0, 4);
            Array.Copy(s1[1], 0, s2[0], 4, 4);
            Array.Copy(s1[0], 4, s2[0], 8, 4);
            Array.Copy(s1[1], 4, s2[0], 12, 4);

            Array.Copy(s1[0], 8, s2[1], 0, 4);
            Array.Copy(s1[1], 8, s2[1], 4, 4);
            Array.Copy(s1[0], 12, s2[1], 8, 4);
            Array.Copy(s1[1], 12, s2[1], 12, 4);
        }

        private int haraka256256(byte[] msg, byte[] output, int outOff)
        {
            byte[][] s1 = new byte[2][];
            s1[0] = new byte[16];
            s1[1] = new byte[16];
            byte[][] s2 = new byte[2][];
            s2[0] = new byte[16];
            s2[1] = new byte[16];

            Array.Copy(msg, 0, s1[0], 0, 16);
            Array.Copy(msg, 16, s1[1], 0, 16);

            s1[0] = aesEnc(s1[0], RC[0]);
            s1[1] = aesEnc(s1[1], RC[1]);
            s1[0] = aesEnc(s1[0], RC[2]);
            s1[1] = aesEnc(s1[1], RC[3]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[4]);
            s1[1] = aesEnc(s2[1], RC[5]);
            s1[0] = aesEnc(s1[0], RC[6]);
            s1[1] = aesEnc(s1[1], RC[7]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[8]);
            s1[1] = aesEnc(s2[1], RC[9]);
            s1[0] = aesEnc(s1[0], RC[10]);
            s1[1] = aesEnc(s1[1], RC[11]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[12]);
            s1[1] = aesEnc(s2[1], RC[13]);
            s1[0] = aesEnc(s1[0], RC[14]);
            s1[1] = aesEnc(s1[1], RC[15]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[16]);
            s1[1] = aesEnc(s2[1], RC[17]);
            s1[0] = aesEnc(s1[0], RC[18]);
            s1[1] = aesEnc(s1[1], RC[19]);
            mix256(s1, s2);

            s1[0] = Xor(s2[0], msg, 0);
            s1[1] = Xor(s2[1], msg, 16);

            Array.Copy(s1[0], 0, output, outOff, 16);
            Array.Copy(s1[1], 0, output, outOff + 16, 16);

            return DIGEST_SIZE;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private int haraka256256(byte[] msg, Span<byte> output)
        {
            byte[][] s1 = new byte[2][];
            s1[0] = new byte[16];
            s1[1] = new byte[16];
            byte[][] s2 = new byte[2][];
            s2[0] = new byte[16];
            s2[1] = new byte[16];

            Array.Copy(msg, 0, s1[0], 0, 16);
            Array.Copy(msg, 16, s1[1], 0, 16);

            s1[0] = aesEnc(s1[0], RC[0]);
            s1[1] = aesEnc(s1[1], RC[1]);
            s1[0] = aesEnc(s1[0], RC[2]);
            s1[1] = aesEnc(s1[1], RC[3]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[4]);
            s1[1] = aesEnc(s2[1], RC[5]);
            s1[0] = aesEnc(s1[0], RC[6]);
            s1[1] = aesEnc(s1[1], RC[7]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[8]);
            s1[1] = aesEnc(s2[1], RC[9]);
            s1[0] = aesEnc(s1[0], RC[10]);
            s1[1] = aesEnc(s1[1], RC[11]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[12]);
            s1[1] = aesEnc(s2[1], RC[13]);
            s1[0] = aesEnc(s1[0], RC[14]);
            s1[1] = aesEnc(s1[1], RC[15]);
            mix256(s1, s2);

            s1[0] = aesEnc(s2[0], RC[16]);
            s1[1] = aesEnc(s2[1], RC[17]);
            s1[0] = aesEnc(s1[0], RC[18]);
            s1[1] = aesEnc(s1[1], RC[19]);
            mix256(s1, s2);

            s1[0] = Xor(s2[0], msg, 0);
            s1[1] = Xor(s2[1], msg, 16);

            s1[0].AsSpan(0, 16).CopyTo(output);
            s1[1].AsSpan(0, 16).CopyTo(output[16..]);

            return DIGEST_SIZE;
        }
#endif

        public Haraka256Digest()
        {
            this.buffer = new byte[32];
        }

        public Haraka256Digest(Haraka256Digest digest)
        {
            this.buffer = (byte[]) digest.buffer.Clone();
            this.off = digest.off;
        }

        public override string AlgorithmName => "Haraka-256";

        public override void Update(byte input)
        {
            if (off + 1 > 32)
            {
                throw new ArgumentException("total input cannot be more than 32 bytes");
            }

            buffer[off++] = input;
        }

        public override void BlockUpdate(byte[] input, int inOff, int len)
        {
            if (off + len > 32)
            {
                throw new ArgumentException("total input cannot be more than 32 bytes");
            }

            Array.Copy(input, inOff, buffer, off, len);
            off += len;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void BlockUpdate(ReadOnlySpan<byte> input)
        {
            if (off + input.Length > 32)
            {
                throw new ArgumentException("total input cannot be more than 32 bytes");
            }

            input.CopyTo(buffer.AsSpan(off));
            off += input.Length;
        }
#endif

        public override int DoFinal(byte[] output, int outOff)
        {
            if (off != 32)
            {
                throw new ArgumentException("input must be exactly 32 bytes");
            }

            if (output.Length - outOff < 32)
            {
                throw new ArgumentException("output too short to receive digest");
            }

            int rv = haraka256256(buffer, output, outOff);

            Reset();

            return rv;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            if (off != 32)
            {
                throw new ArgumentException("input must be exactly 32 bytes");
            }

            if (output.Length < 32)
            {
                throw new ArgumentException("output too short to receive digest");
            }

            int rv = haraka256256(buffer, output);

            Reset();

            return rv;
        }
#endif

        public override void Reset()
        {
            off = 0;
            Array.Clear(buffer, 0, 32);
        }
    }
}