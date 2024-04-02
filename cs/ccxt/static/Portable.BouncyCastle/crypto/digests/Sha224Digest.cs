using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
    /**
     * SHA-224 as described in RFC 3874
     * <pre>
     *         block  word  digest
     * SHA-1   512    32    160
     * SHA-224 512    32    224
     * SHA-256 512    32    256
     * SHA-384 1024   64    384
     * SHA-512 1024   64    512
     * </pre>
     */
    public class Sha224Digest
        : GeneralDigest
    {
        private const int DigestLength = 28;

		private uint H1, H2, H3, H4, H5, H6, H7, H8;

		private uint[] X = new uint[64];
        private int     xOff;

		/**
         * Standard constructor
         */
        public Sha224Digest()
        {
            Reset();
        }

		/**
         * Copy constructor.  This will copy the state of the provided
         * message digest.
         */
         public Sha224Digest(
			 Sha224Digest t)
			 : base(t)
        {
			CopyIn(t);
		}

		private void CopyIn(Sha224Digest t)
		{
			base.CopyIn(t);

            H1 = t.H1;
            H2 = t.H2;
            H3 = t.H3;
            H4 = t.H4;
            H5 = t.H5;
            H6 = t.H6;
            H7 = t.H7;
            H8 = t.H8;

            Array.Copy(t.X, 0, X, 0, t.X.Length);
            xOff = t.xOff;
        }

		public override string AlgorithmName
		{
			get { return "SHA-224"; }
		}

		public override int GetDigestSize()
		{
			return DigestLength;
		}

		internal override void ProcessWord(byte[] input, int inOff)
        {
			X[xOff] = Pack.BE_To_UInt32(input, inOff);

			if (++xOff == 16)
            {
                ProcessBlock();
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal override void ProcessWord(ReadOnlySpan<byte> word)
        {
            X[xOff] = Pack.BE_To_UInt32(word);

            if (++xOff == 16)
            {
                ProcessBlock();
            }
        }
#endif

        internal override void ProcessLength(
            long bitLength)
        {
            if (xOff > 14)
            {
                ProcessBlock();
            }

            X[14] = (uint)((ulong)bitLength >> 32);
            X[15] = (uint)((ulong)bitLength);
        }

        public override int DoFinal(byte[] output, int outOff)
        {
            Finish();

			Pack.UInt32_To_BE(H1, output, outOff);
            Pack.UInt32_To_BE(H2, output, outOff + 4);
            Pack.UInt32_To_BE(H3, output, outOff + 8);
            Pack.UInt32_To_BE(H4, output, outOff + 12);
            Pack.UInt32_To_BE(H5, output, outOff + 16);
            Pack.UInt32_To_BE(H6, output, outOff + 20);
            Pack.UInt32_To_BE(H7, output, outOff + 24);

			Reset();

			return DigestLength;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            Finish();

            Pack.UInt32_To_BE(H1, output);
            Pack.UInt32_To_BE(H2, output[4..]);
            Pack.UInt32_To_BE(H3, output[8..]);
            Pack.UInt32_To_BE(H4, output[12..]);
            Pack.UInt32_To_BE(H5, output[16..]);
            Pack.UInt32_To_BE(H6, output[20..]);
            Pack.UInt32_To_BE(H7, output[24..]);

            Reset();

            return DigestLength;
        }
#endif

        /**
         * reset the chaining variables
         */
        public override void Reset()
        {
            base.Reset();

            /* SHA-224 initial hash value
             */
            H1 = 0xc1059ed8;
            H2 = 0x367cd507;
            H3 = 0x3070dd17;
            H4 = 0xf70e5939;
            H5 = 0xffc00b31;
            H6 = 0x68581511;
            H7 = 0x64f98fa7;
            H8 = 0xbefa4fa4;

			xOff = 0;
			Array.Clear(X, 0, X.Length);
        }

        internal override void ProcessBlock()
        {
            //
            // expand 16 word block into 64 word blocks.
            //
            for (int ti = 16; ti <= 63; ti++)
            {
                X[ti] = Theta1(X[ti - 2]) + X[ti - 7] + Theta0(X[ti - 15]) + X[ti - 16];
            }

			//
            // set up working variables.
            //
            uint a = H1;
            uint b = H2;
            uint c = H3;
            uint d = H4;
            uint e = H5;
            uint f = H6;
            uint g = H7;
            uint h = H8;

			int t = 0;
			for(int i = 0; i < 8; i ++)
			{
				// t = 8 * i
				h += Sum1(e) + Ch(e, f, g) + K[t] + X[t];
				d += h;
				h += Sum0(a) + Maj(a, b, c);
				++t;

				// t = 8 * i + 1
				g += Sum1(d) + Ch(d, e, f) + K[t] + X[t];
				c += g;
				g += Sum0(h) + Maj(h, a, b);
				++t;

				// t = 8 * i + 2
				f += Sum1(c) + Ch(c, d, e) + K[t] + X[t];
				b += f;
				f += Sum0(g) + Maj(g, h, a);
				++t;

				// t = 8 * i + 3
				e += Sum1(b) + Ch(b, c, d) + K[t] + X[t];
				a += e;
				e += Sum0(f) + Maj(f, g, h);
				++t;

				// t = 8 * i + 4
				d += Sum1(a) + Ch(a, b, c) + K[t] + X[t];
				h += d;
				d += Sum0(e) + Maj(e, f, g);
				++t;

				// t = 8 * i + 5
				c += Sum1(h) + Ch(h, a, b) + K[t] + X[t];
				g += c;
				c += Sum0(d) + Maj(d, e, f);
				++t;

				// t = 8 * i + 6
				b += Sum1(g) + Ch(g, h, a) + K[t] + X[t];
				f += b;
				b += Sum0(c) + Maj(c, d, e);
				++t;

				// t = 8 * i + 7
				a += Sum1(f) + Ch(f, g, h) + K[t] + X[t];
				e += a;
				a += Sum0(b) + Maj(b, c, d);
				++t;
			}

			H1 += a;
            H2 += b;
            H3 += c;
            H4 += d;
            H5 += e;
            H6 += f;
            H7 += g;
            H8 += h;

            //
            // reset the offset and clean out the word buffer.
            //
            xOff = 0;
			Array.Clear(X, 0, 16);
		}

		/* SHA-224 functions */
        private static uint Ch(uint x, uint y, uint z)
        {
            return (x & y) ^ (~x & z);
        }

        private static uint Maj(uint x, uint y, uint z)
        {
            return (x & y) ^ (x & z) ^ (y & z);
        }

        private static uint Sum0(uint x)
        {
	        return ((x >> 2) | (x << 30)) ^ ((x >> 13) | (x << 19)) ^ ((x >> 22) | (x << 10));
        }

        private static uint Sum1(uint x)
        {
			return ((x >> 6) | (x << 26)) ^ ((x >> 11) | (x << 21)) ^ ((x >> 25) | (x << 7));
        }

		private static uint Theta0(uint x)
        {
	        return ((x >> 7) | (x << 25)) ^ ((x >> 18) | (x << 14)) ^ (x >> 3);
        }

        private static uint Theta1(uint x)
        {
	        return ((x >> 17) | (x << 15)) ^ ((x >> 19) | (x << 13)) ^ (x >> 10);
        }

		/* SHA-224 Constants
         * (represent the first 32 bits of the fractional parts of the
         * cube roots of the first sixty-four prime numbers)
         */
        internal static readonly uint[] K = {
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
			0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        };
		
		public override IMemoable Copy()
		{
			return new Sha224Digest(this);
		}

		public override void Reset(IMemoable other)
		{
			Sha224Digest d = (Sha224Digest)other;

			CopyIn(d);
		}
    }
}
