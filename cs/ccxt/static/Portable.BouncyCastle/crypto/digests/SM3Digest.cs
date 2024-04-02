using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{

	/// <summary>
	/// Implementation of Chinese SM3 digest as described at
	/// http://tools.ietf.org/html/draft-shen-sm3-hash-00
	/// and at .... ( Chinese PDF )
	/// </summary>
	/// <remarks>
	/// The specification says "process a bit stream",
	/// but this is written to process bytes in blocks of 4,
	/// meaning this will process 32-bit word groups.
	/// But so do also most other digest specifications,
	/// including the SHA-256 which was a origin for
	/// this specification.
	/// </remarks>
	public class SM3Digest
		: GeneralDigest
	{
		private const int DIGEST_LENGTH = 32;   // bytes
		private const int BLOCK_SIZE = 64 / 4; // of 32 bit ints (16 ints)

		private uint[] V = new uint[DIGEST_LENGTH / 4]; // in 32 bit ints (8 ints)
		private uint[] inwords = new uint[BLOCK_SIZE];
		private int xOff;

		// Work-bufs used within processBlock()
		private uint[] W = new uint[68];

        // Round constant T for processBlock() which is 32 bit integer rolled left up to (63 MOD 32) bit positions.
		private static readonly uint[] T = new uint[64];

		static SM3Digest()
		{
			for (int i = 0; i < 16; ++i)
			{
				uint t = 0x79CC4519;
				T[i] = (t << i) | (t >> (32 - i));
			}
			for (int i = 16; i < 64; ++i)
			{
				int n = i % 32;
				uint t = 0x7A879D8A;
				T[i] = (t << n) | (t >> (32 - n));
			}
		}


		/// <summary>
		/// Standard constructor
		/// </summary>
		public SM3Digest()
		{
			Reset();
		}

		/// <summary>
		/// Copy constructor.  This will copy the state of the provided
		/// message digest.
		/// </summary>
		public SM3Digest(SM3Digest t)
			: base(t)
		{
			CopyIn(t);
		}

		private void CopyIn(SM3Digest t)
		{
			Array.Copy(t.V, 0, this.V, 0, this.V.Length);
			Array.Copy(t.inwords, 0, this.inwords, 0, this.inwords.Length);
			xOff = t.xOff;
		}

		public override string AlgorithmName
		{
			get { return "SM3"; }
		}

		public override int GetDigestSize()
		{
			return DIGEST_LENGTH;
		}

		public override IMemoable Copy()
		{
			return new SM3Digest(this);
		}

		public override void Reset(IMemoable other)
		{
			SM3Digest d = (SM3Digest)other;

			base.CopyIn(d);
			CopyIn(d);
		}

		/// <summary>
		/// reset the chaining variables
		/// </summary>
		public override void Reset()
		{
			base.Reset();

			this.V[0] = 0x7380166F;
			this.V[1] = 0x4914B2B9;
			this.V[2] = 0x172442D7;
			this.V[3] = 0xDA8A0600;
			this.V[4] = 0xA96F30BC;
			this.V[5] = 0x163138AA;
			this.V[6] = 0xE38DEE4D;
			this.V[7] = 0xB0FB0E4E;

			this.xOff = 0;
		}

		public override int DoFinal(byte[] output, int outOff)
		{
			Finish();

            Pack.UInt32_To_BE(V, output, outOff);

			Reset();

			return DIGEST_LENGTH;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            Finish();

            Pack.UInt32_To_BE(V, output);

            Reset();

            return DIGEST_LENGTH;
        }
#endif

        internal override void ProcessWord(byte[] input, int inOff)
		{
			inwords[xOff++] = Pack.BE_To_UInt32(input, inOff);

			if (this.xOff >= 16)
			{
				ProcessBlock();
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal override void ProcessWord(ReadOnlySpan<byte> word)
        {
            inwords[xOff++] = Pack.BE_To_UInt32(word);

            if (this.xOff >= 16)
            {
                ProcessBlock();
            }
        }
#endif

        internal override void ProcessLength(long bitLength)
		{
			if (this.xOff > (BLOCK_SIZE - 2))
			{
				// xOff == 15  --> can't fit the 64 bit length field at tail..
				this.inwords[this.xOff] = 0; // fill with zero
				++this.xOff;

				ProcessBlock();
			}
			// Fill with zero words, until reach 2nd to last slot
			while (this.xOff < (BLOCK_SIZE - 2))
			{
				this.inwords[this.xOff] = 0;
				++this.xOff;
			}

			// Store input data length in BITS
			this.inwords[this.xOff++] = (uint)(bitLength >> 32);
			this.inwords[this.xOff++] = (uint)(bitLength);
		}

		/*

	3.4.2.  Constants


	   Tj = 79cc4519        when 0  < = j < = 15
	   Tj = 7a879d8a        when 16 < = j < = 63

	3.4.3.  Boolean function


	   FFj(X;Y;Z) = X XOR Y XOR Z                       when 0  < = j < = 15
	              = (X AND Y) OR (X AND Z) OR (Y AND Z) when 16 < = j < = 63

	   GGj(X;Y;Z) = X XOR Y XOR Z                       when 0  < = j < = 15
	              = (X AND Y) OR (NOT X AND Z)          when 16 < = j < = 63

	   The X, Y, Z in the fomular are words!GBP

	3.4.4.  Permutation function


	   P0(X) = X XOR (X <<<  9) XOR (X <<< 17)   ## ROLL, not SHIFT
	   P1(X) = X XOR (X <<< 15) XOR (X <<< 23)   ## ROLL, not SHIFT

	   The X in the fomular are a word.

	----------

	Each ROLL converted to Java expression:

	ROLL 9  :  ((x <<  9) | (x >> (32-9))))
	ROLL 17 :  ((x << 17) | (x >> (32-17)))
	ROLL 15 :  ((x << 15) | (x >> (32-15)))
	ROLL 23 :  ((x << 23) | (x >> (32-23)))

	 */

		private uint P0(uint x)
		{
			uint r9 = ((x << 9) | (x >> (32 - 9)));
			uint r17 = ((x << 17) | (x >> (32 - 17)));
			return (x ^ r9 ^ r17);
		}

		private uint P1(uint x)
		{
			uint r15 = ((x << 15) | (x >> (32 - 15)));
			uint r23 = ((x << 23) | (x >> (32 - 23)));
			return (x ^ r15 ^ r23);
		}

		private uint FF0(uint x, uint y, uint z)
		{
			return (x ^ y ^ z);
		}

		private uint FF1(uint x, uint y, uint z)
		{
			return ((x & y) | (x & z) | (y & z));
		}

		private uint GG0(uint x, uint y, uint z)
		{
			return (x ^ y ^ z);
		}

		private uint GG1(uint x, uint y, uint z)
		{
			return ((x & y) | ((~x) & z));
		}


		internal override void ProcessBlock()
		{
			for (int j = 0; j < 16; ++j)
			{
				this.W[j] = this.inwords[j];
			}
			for (int j = 16; j < 68; ++j)
			{
				uint wj3 = this.W[j - 3];
				uint r15 = ((wj3 << 15) | (wj3 >> (32 - 15)));
				uint wj13 = this.W[j - 13];
				uint r7 = ((wj13 << 7) | (wj13 >> (32 - 7)));
				this.W[j] = P1(this.W[j - 16] ^ this.W[j - 9] ^ r15) ^ r7 ^ this.W[j - 6];
			}

			uint A = this.V[0];
			uint B = this.V[1];
			uint C = this.V[2];
			uint D = this.V[3];
			uint E = this.V[4];
			uint F = this.V[5];
			uint G = this.V[6];
			uint H = this.V[7];


			for (int j = 0; j < 16; ++j)
			{
				uint a12 = ((A << 12) | (A >> (32 - 12)));
				uint s1_ = a12 + E + T[j];
				uint SS1 = ((s1_ << 7) | (s1_ >> (32 - 7)));
				uint SS2 = SS1 ^ a12;
                uint Wj = W[j];
                uint W1j = Wj ^ W[j + 4];
				uint TT1 = FF0(A, B, C) + D + SS2 + W1j;
				uint TT2 = GG0(E, F, G) + H + SS1 + Wj;
				D = C;
				C = ((B << 9) | (B >> (32 - 9)));
				B = A;
				A = TT1;
				H = G;
				G = ((F << 19) | (F >> (32 - 19)));
				F = E;
				E = P0(TT2);
			}

			// Different FF,GG functions on rounds 16..63
			for (int j = 16; j < 64; ++j)
			{
				uint a12 = ((A << 12) | (A >> (32 - 12)));
				uint s1_ = a12 + E + T[j];
				uint SS1 = ((s1_ << 7) | (s1_ >> (32 - 7)));
				uint SS2 = SS1 ^ a12;
				uint Wj = W[j];
				uint W1j = Wj ^ W[j + 4];
				uint TT1 = FF1(A, B, C) + D + SS2 + W1j;
				uint TT2 = GG1(E, F, G) + H + SS1 + Wj;
				D = C;
				C = ((B << 9) | (B >> (32 - 9)));
				B = A;
				A = TT1;
				H = G;
				G = ((F << 19) | (F >> (32 - 19)));
				F = E;
				E = P0(TT2);
			}

			this.V[0] ^= A;
			this.V[1] ^= B;
			this.V[2] ^= C;
			this.V[3] ^= D;
			this.V[4] ^= E;
			this.V[5] ^= F;
			this.V[6] ^= G;
			this.V[7] ^= H;

			this.xOff = 0;
		}
	}
}
