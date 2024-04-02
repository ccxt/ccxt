using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Crypto.Engines
{
	/// <summary>
	/// Implementation of the Threefish tweakable large block cipher in 256, 512 and 1024 bit block
	/// sizes.
	/// </summary>
	/// <remarks>
	/// This is the 1.3 version of Threefish defined in the Skein hash function submission to the NIST
	/// SHA-3 competition in October 2010.
	/// <p/>
	/// Threefish was designed by Niels Ferguson - Stefan Lucks - Bruce Schneier - Doug Whiting - Mihir
	/// Bellare - Tadayoshi Kohno - Jon Callas - Jesse Walker.
	/// <p/>
	/// This implementation inlines all round functions, unrolls 8 rounds, and uses 1.2k of static tables
	/// to speed up key schedule injection. <br/>
	/// 2 x block size state is retained by each cipher instance.
	/// </remarks>
	public class ThreefishEngine
		: IBlockCipher
	{
		/// <summary>
		/// 256 bit block size - Threefish-256
		/// </summary>
		public const int BLOCKSIZE_256 = 256;
		/// <summary>
		/// 512 bit block size - Threefish-512
		/// </summary>
		public const int BLOCKSIZE_512 = 512;
		/// <summary>
		/// 1024 bit block size - Threefish-1024
		/// </summary>
		public const int BLOCKSIZE_1024 = 1024;

		/**
	     * Size of the tweak in bytes (always 128 bit/16 bytes)
	     */
		private const int TWEAK_SIZE_BYTES = 16;
		private const int TWEAK_SIZE_WORDS = TWEAK_SIZE_BYTES / 8;

		/**
	     * Rounds in Threefish-256
	     */
		private const int ROUNDS_256 = 72;
		/**
	     * Rounds in Threefish-512
	     */
		private const int ROUNDS_512 = 72;
		/**
	     * Rounds in Threefish-1024
	     */
		private const int ROUNDS_1024 = 80;

		/**
	     * Max rounds of any of the variants
	     */
		private const int MAX_ROUNDS = ROUNDS_1024;

		/**
	     * Key schedule parity constant
	     */
		private const ulong C_240 = 0x1BD11BDAA9FC1A22L;

		/* Pre-calculated modulo arithmetic tables for key schedule lookups */
		private static readonly int[] MOD9 = new int[MAX_ROUNDS];
		private static readonly int[] MOD17 = new int[MOD9.Length];
		private static readonly int[] MOD5 = new int[MOD9.Length];
		private static readonly int[] MOD3 = new int[MOD9.Length];

		static ThreefishEngine()
		{
			for (int i = 0; i < MOD9.Length; i++)
			{
				MOD17[i] = i % 17;
				MOD9[i] = i % 9;
				MOD5[i] = i % 5;
				MOD3[i] = i % 3;
			}
		}

		/**
	     * Block size in bytes
	     */
		private readonly int blocksizeBytes;

		/**
	     * Block size in 64 bit words
	     */
		private readonly int blocksizeWords;

		/**
	     * Buffer for byte oriented processBytes to call internal word API
	     */
		private readonly ulong[] currentBlock;

		/**
	     * Tweak bytes (2 byte t1,t2, calculated t3 and repeat of t1,t2 for modulo free lookup
	     */
		private readonly ulong[] t = new ulong[5];

		/**
	     * Key schedule words
	     */
		private readonly ulong[] kw;

		/**
	     * The internal cipher implementation (varies by blocksize)
	     */
		private readonly ThreefishCipher cipher;

		private bool forEncryption;

		/// <summary>
		/// Constructs a new Threefish cipher, with a specified block size.
		/// </summary>
		/// <param name="blocksizeBits">the block size in bits, one of <see cref="BLOCKSIZE_256"/>, <see cref="BLOCKSIZE_512"/>,
		///                      <see cref="BLOCKSIZE_1024"/> .</param>
		public ThreefishEngine(int blocksizeBits)
		{
			this.blocksizeBytes = (blocksizeBits / 8);
			this.blocksizeWords = (this.blocksizeBytes / 8);
			this.currentBlock = new ulong[blocksizeWords];

			/*
	         * Provide room for original key words, extended key word and repeat of key words for modulo
	         * free lookup of key schedule words.
	         */
			this.kw = new ulong[2 * blocksizeWords + 1];

			switch (blocksizeBits)
			{
			case BLOCKSIZE_256:
				cipher = new Threefish256Cipher(kw, t);
				break;
			case BLOCKSIZE_512:
				cipher = new Threefish512Cipher(kw, t);
				break;
			case BLOCKSIZE_1024:
				cipher = new Threefish1024Cipher(kw, t);
				break;
			default:
				throw new ArgumentException("Invalid blocksize - Threefish is defined with block size of 256, 512, or 1024 bits");
			}
		}

		/// <summary>
		/// Initialise the engine.
		/// </summary>
		/// <param name="forEncryption">Initialise for encryption if true, for decryption if false.</param>
		/// <param name="parameters">an instance of <see cref="TweakableBlockCipherParameters"/> or <see cref="KeyParameter"/> (to
		///               use a 0 tweak)</param>
        public virtual void Init(bool forEncryption, ICipherParameters parameters)
		{
			byte[] keyBytes;
			byte[] tweakBytes;

			if (parameters is TweakableBlockCipherParameters)
			{
				TweakableBlockCipherParameters tParams = (TweakableBlockCipherParameters)parameters;
				keyBytes = tParams.Key.GetKey();
				tweakBytes = tParams.Tweak;
			}
			else if (parameters is KeyParameter)
			{
				keyBytes = ((KeyParameter)parameters).GetKey();
				tweakBytes = null;
			}
			else
			{
				throw new ArgumentException("Invalid parameter passed to Threefish init - "
                    + Platform.GetTypeName(parameters));
			}

			ulong[] keyWords = null;
			ulong[] tweakWords = null;

			if (keyBytes != null)
			{
				if (keyBytes.Length != this.blocksizeBytes)
				{
					throw new ArgumentException("Threefish key must be same size as block (" + blocksizeBytes
					                            + " bytes)");
				}
				keyWords = new ulong[blocksizeWords];
				Pack.LE_To_UInt64(keyBytes, 0, keyWords);
			}
			if (tweakBytes != null)
			{
				if (tweakBytes.Length != TWEAK_SIZE_BYTES)
				{
					throw new ArgumentException("Threefish tweak must be " + TWEAK_SIZE_BYTES + " bytes");
				}
				tweakWords = new ulong[2];
				Pack.LE_To_UInt64(tweakBytes, 0, tweakWords);
			}
			Init(forEncryption, keyWords, tweakWords);
		}

		/// <summary>
		/// Initialise the engine, specifying the key and tweak directly.
		/// </summary>
		/// <param name="forEncryption">the cipher mode.</param>
		/// <param name="key">the words of the key, or <code>null</code> to use the current key.</param>
		/// <param name="tweak">the 2 word (128 bit) tweak, or <code>null</code> to use the current tweak.</param>
		internal void Init(bool forEncryption, ulong[] key, ulong[] tweak)
		{
			this.forEncryption = forEncryption;
			if (key != null)
			{
				SetKey(key);
			}
			if (tweak != null)
			{
				SetTweak(tweak);
			}
		}

		private void SetKey(ulong[] key)
		{
			if (key.Length != this.blocksizeWords)
			{
				throw new ArgumentException("Threefish key must be same size as block (" + blocksizeWords
				                            + " words)");
			}

			/*
	         * Full subkey schedule is deferred to execution to avoid per cipher overhead (10k for 512,
	         * 20k for 1024).
	         * 
	         * Key and tweak word sequences are repeated, and static MOD17/MOD9/MOD5/MOD3 calculations
	         * used, to avoid expensive mod computations during cipher operation.
	         */

			ulong knw = C_240;
			for (int i = 0; i < blocksizeWords; i++)
			{
				kw[i] = key[i];
				knw = knw ^ kw[i];
			}
			kw[blocksizeWords] = knw;
			Array.Copy(kw, 0, kw, blocksizeWords + 1, blocksizeWords);
		}

		private void SetTweak(ulong[] tweak)
		{
			if (tweak.Length != TWEAK_SIZE_WORDS)
			{
				throw new ArgumentException("Tweak must be " + TWEAK_SIZE_WORDS + " words.");
			}

			/*
	         * Tweak schedule partially repeated to avoid mod computations during cipher operation
	         */
			t[0] = tweak[0];
			t[1] = tweak[1];
			t[2] = t[0] ^ t[1];
			t[3] = t[0];
			t[4] = t[1];
		}

        public virtual string AlgorithmName
		{
			get { return "Threefish-" + (blocksizeBytes * 8); }
		}

        public virtual int GetBlockSize()
		{
			return blocksizeBytes;
		}

        public virtual int ProcessBlock(byte[] inBytes, int inOff, byte[] outBytes, int outOff)
		{
			Check.DataLength(inBytes, inOff, blocksizeBytes, "input buffer too short");
			Check.OutputLength(outBytes, outOff, blocksizeBytes, "output buffer too short");

			Pack.LE_To_UInt64(inBytes, inOff, currentBlock);
			ProcessBlock(this.currentBlock, this.currentBlock);
			Pack.UInt64_To_LE(currentBlock, outBytes, outOff);
			return blocksizeBytes;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public virtual int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
		{
			Check.DataLength(input, blocksizeBytes, "input buffer too short");
			Check.OutputLength(output, blocksizeBytes, "output buffer too short");

			Pack.LE_To_UInt64(input, currentBlock);
			ProcessBlock(this.currentBlock, this.currentBlock);
			Pack.UInt64_To_LE(currentBlock, output);
			return blocksizeBytes;
		}
#endif

		/// <summary>
		/// Process a block of data represented as 64 bit words.
		/// </summary>
		/// <returns>the number of 8 byte words processed (which will be the same as the block size).</returns>
		/// <param name="inWords">a block sized buffer of words to process.</param>
		/// <param name="outWords">a block sized buffer of words to receive the output of the operation.</param>
		/// <exception cref="DataLengthException">if either the input or output is not block sized</exception>
		/// <exception cref="InvalidOperationException">if this engine is not initialised</exception>
		internal int ProcessBlock(ulong[] inWords, ulong[] outWords)
		{
			if (kw[blocksizeWords] == 0)
			{
				throw new InvalidOperationException("Threefish engine not initialised");
			}

			if (inWords.Length != blocksizeWords)
				throw new DataLengthException("input buffer too short");
			if (outWords.Length != blocksizeWords)
				throw new OutputLengthException("output buffer too short");

			if (forEncryption)
			{
				cipher.EncryptBlock(inWords, outWords);
			}
			else
			{
				cipher.DecryptBlock(inWords, outWords);
			}

			return blocksizeWords;
		}

		/**
	     * Rotate left + xor part of the mix operation.
	     */
		private static ulong RotlXor(ulong x, int n, ulong xor)
		{
			return ((x << n) | (x >> (64 - n))) ^ xor;
		}

		/**
	     * Rotate xor + rotate right part of the unmix operation.
	     */
		private static ulong XorRotr(ulong x, int n, ulong xor)
		{
			ulong xored = x ^ xor;
			return (xored >> n) | (xored << (64 - n));
		}

		private abstract class ThreefishCipher
		{
			/**
	         * The extended + repeated tweak words
	         */
			protected readonly ulong[] t;
			/**
	         * The extended + repeated key words
	         */
			protected readonly ulong[] kw;

			protected ThreefishCipher(ulong[] kw, ulong[] t)
			{
				this.kw = kw;
				this.t = t;
			}

			internal abstract void EncryptBlock(ulong[] block, ulong[] outWords);

			internal abstract void DecryptBlock(ulong[] block, ulong[] outWords);

		}

		private sealed class Threefish256Cipher
			: ThreefishCipher
		{
			/**
	         * Mix rotation constants defined in Skein 1.3 specification
	         */
			private const int ROTATION_0_0 = 14, ROTATION_0_1 = 16;
			private const int ROTATION_1_0 = 52, ROTATION_1_1 = 57;
			private const int ROTATION_2_0 = 23, ROTATION_2_1 = 40;
			private const int ROTATION_3_0 = 5, ROTATION_3_1 = 37;

			private const int ROTATION_4_0 = 25, ROTATION_4_1 = 33;
			private const int ROTATION_5_0 = 46, ROTATION_5_1 = 12;
			private const int ROTATION_6_0 = 58, ROTATION_6_1 = 22;
			private const int ROTATION_7_0 = 32, ROTATION_7_1 = 32;

			public Threefish256Cipher(ulong[] kw, ulong[] t)
				: base(kw, t)
			{
			}

			internal override void EncryptBlock(ulong[] block, ulong[] outWords)
			{
				ulong[] kw = this.kw;
				ulong[] t = this.t;
				int[] mod5 = MOD5;
				int[] mod3 = MOD3;

				/* Help the JIT avoid index bounds checks */
				if (kw.Length != 9)
				{
					throw new ArgumentException();
				}
				if (t.Length != 5)
				{
					throw new ArgumentException();
				}

				/*
	             * Read 4 words of plaintext data, not using arrays for cipher state
	             */
				ulong b0 = block[0];
				ulong b1 = block[1];
				ulong b2 = block[2];
				ulong b3 = block[3];

				/*
	             * First subkey injection.
	             */
				b0 += kw[0];
				b1 += kw[1] + t[0];
				b2 += kw[2] + t[1];
				b3 += kw[3];

				/*
	             * Rounds loop, unrolled to 8 rounds per iteration.
	             * 
	             * Unrolling to multiples of 4 avoids the mod 4 check for key injection, and allows
	             * inlining of the permutations, which cycle every of 2 rounds (avoiding array
	             * index/lookup).
	             * 
	             * Unrolling to multiples of 8 avoids the mod 8 rotation constant lookup, and allows
	             * inlining constant rotation values (avoiding array index/lookup).
	             */

				for (int d = 1; d < (ROUNDS_256 / 4); d += 2)
				{
					int dm5 = mod5[d];
					int dm3 = mod3[d];

					/*
	                 * 4 rounds of mix and permute.
	                 * 
	                 * Permute schedule has a 2 round cycle, so permutes are inlined in the mix
	                 * operations in each 4 round block.
	                 */
					b1 = RotlXor(b1, ROTATION_0_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_0_1, b2 += b3);

					b3 = RotlXor(b3, ROTATION_1_0, b0 += b3);
					b1 = RotlXor(b1, ROTATION_1_1, b2 += b1);

					b1 = RotlXor(b1, ROTATION_2_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_2_1, b2 += b3);

					b3 = RotlXor(b3, ROTATION_3_0, b0 += b3);
					b1 = RotlXor(b1, ROTATION_3_1, b2 += b1);

					/*
	                 * Subkey injection for first 4 rounds.
	                 */
					b0 += kw[dm5];
					b1 += kw[dm5 + 1] + t[dm3];
					b2 += kw[dm5 + 2] + t[dm3 + 1];
					b3 += kw[dm5 + 3] + (uint)d;

					/*
	                 * 4 more rounds of mix/permute
	                 */
					b1 = RotlXor(b1, ROTATION_4_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_4_1, b2 += b3);

					b3 = RotlXor(b3, ROTATION_5_0, b0 += b3);
					b1 = RotlXor(b1, ROTATION_5_1, b2 += b1);

					b1 = RotlXor(b1, ROTATION_6_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_6_1, b2 += b3);

					b3 = RotlXor(b3, ROTATION_7_0, b0 += b3);
					b1 = RotlXor(b1, ROTATION_7_1, b2 += b1);

					/*
	                 * Subkey injection for next 4 rounds.
	                 */
					b0 += kw[dm5 + 1];
					b1 += kw[dm5 + 2] + t[dm3 + 1];
					b2 += kw[dm5 + 3] + t[dm3 + 2];
					b3 += kw[dm5 + 4] + (uint)d + 1;
				}

				/*
	             * Output cipher state.
	             */
				outWords[0] = b0;
				outWords[1] = b1;
				outWords[2] = b2;
				outWords[3] = b3;
			}

			internal override void DecryptBlock(ulong[] block, ulong[] state)
			{
				ulong[] kw = this.kw;
				ulong[] t = this.t;
				int[] mod5 = MOD5;
				int[] mod3 = MOD3;

				/* Help the JIT avoid index bounds checks */
				if (kw.Length != 9)
				{
					throw new ArgumentException();
				}
				if (t.Length != 5)
				{
					throw new ArgumentException();
				}

				ulong b0 = block[0];
				ulong b1 = block[1];
				ulong b2 = block[2];
				ulong b3 = block[3];

				for (int d = (ROUNDS_256 / 4) - 1; d >= 1; d -= 2)
				{
					int dm5 = mod5[d];
					int dm3 = mod3[d];

					/* Reverse key injection for second 4 rounds */
					b0 -= kw[dm5 + 1];
					b1 -= kw[dm5 + 2] + t[dm3 + 1];
					b2 -= kw[dm5 + 3] + t[dm3 + 2];
					b3 -= kw[dm5 + 4] + (uint)d + 1;

					/* Reverse second 4 mix/permute rounds */

					b3 = XorRotr(b3, ROTATION_7_0, b0);
					b0 -= b3;
					b1 = XorRotr(b1, ROTATION_7_1, b2);
					b2 -= b1;

					b1 = XorRotr(b1, ROTATION_6_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_6_1, b2);
					b2 -= b3;

					b3 = XorRotr(b3, ROTATION_5_0, b0);
					b0 -= b3;
					b1 = XorRotr(b1, ROTATION_5_1, b2);
					b2 -= b1;

					b1 = XorRotr(b1, ROTATION_4_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_4_1, b2);
					b2 -= b3;

					/* Reverse key injection for first 4 rounds */
					b0 -= kw[dm5];
					b1 -= kw[dm5 + 1] + t[dm3];
					b2 -= kw[dm5 + 2] + t[dm3 + 1];
					b3 -= kw[dm5 + 3] + (uint)d;

					/* Reverse first 4 mix/permute rounds */
					b3 = XorRotr(b3, ROTATION_3_0, b0);
					b0 -= b3;
					b1 = XorRotr(b1, ROTATION_3_1, b2);
					b2 -= b1;

					b1 = XorRotr(b1, ROTATION_2_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_2_1, b2);
					b2 -= b3;

					b3 = XorRotr(b3, ROTATION_1_0, b0);
					b0 -= b3;
					b1 = XorRotr(b1, ROTATION_1_1, b2);
					b2 -= b1;

					b1 = XorRotr(b1, ROTATION_0_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_0_1, b2);
					b2 -= b3;
				}

				/*
	             * First subkey uninjection.
	             */
				b0 -= kw[0];
				b1 -= kw[1] + t[0];
				b2 -= kw[2] + t[1];
				b3 -= kw[3];

				/*
	             * Output cipher state.
	             */
				state[0] = b0;
				state[1] = b1;
				state[2] = b2;
				state[3] = b3;
			}

		}

		private sealed class Threefish512Cipher
			: ThreefishCipher
		{
			/**
	         * Mix rotation constants defined in Skein 1.3 specification
	         */
			private const int ROTATION_0_0 = 46, ROTATION_0_1 = 36, ROTATION_0_2 = 19, ROTATION_0_3 = 37;
			private const int ROTATION_1_0 = 33, ROTATION_1_1 = 27, ROTATION_1_2 = 14, ROTATION_1_3 = 42;
			private const int ROTATION_2_0 = 17, ROTATION_2_1 = 49, ROTATION_2_2 = 36, ROTATION_2_3 = 39;
			private const int ROTATION_3_0 = 44, ROTATION_3_1 = 9, ROTATION_3_2 = 54, ROTATION_3_3 = 56;

			private const int ROTATION_4_0 = 39, ROTATION_4_1 = 30, ROTATION_4_2 = 34, ROTATION_4_3 = 24;
			private const int ROTATION_5_0 = 13, ROTATION_5_1 = 50, ROTATION_5_2 = 10, ROTATION_5_3 = 17;
			private const int ROTATION_6_0 = 25, ROTATION_6_1 = 29, ROTATION_6_2 = 39, ROTATION_6_3 = 43;
			private const int ROTATION_7_0 = 8, ROTATION_7_1 = 35, ROTATION_7_2 = 56, ROTATION_7_3 = 22;

			internal Threefish512Cipher(ulong[] kw, ulong[] t)
				: base(kw, t)
			{
			}

			internal override void EncryptBlock(ulong[] block, ulong[] outWords)
			{
				ulong[] kw = this.kw;
				ulong[] t = this.t;
				int[] mod9 = MOD9;
				int[] mod3 = MOD3;

				/* Help the JIT avoid index bounds checks */
				if (kw.Length != 17)
				{
					throw new ArgumentException();
				}
				if (t.Length != 5)
				{
					throw new ArgumentException();
				}

				/*
	             * Read 8 words of plaintext data, not using arrays for cipher state
	             */
				ulong b0 = block[0];
				ulong b1 = block[1];
				ulong b2 = block[2];
				ulong b3 = block[3];
				ulong b4 = block[4];
				ulong b5 = block[5];
				ulong b6 = block[6];
				ulong b7 = block[7];

				/*
	             * First subkey injection.
	             */
				b0 += kw[0];
				b1 += kw[1];
				b2 += kw[2];
				b3 += kw[3];
				b4 += kw[4];
				b5 += kw[5] + t[0];
				b6 += kw[6] + t[1];
				b7 += kw[7];

				/*
	             * Rounds loop, unrolled to 8 rounds per iteration.
	             * 
	             * Unrolling to multiples of 4 avoids the mod 4 check for key injection, and allows
	             * inlining of the permutations, which cycle every of 4 rounds (avoiding array
	             * index/lookup).
	             * 
	             * Unrolling to multiples of 8 avoids the mod 8 rotation constant lookup, and allows
	             * inlining constant rotation values (avoiding array index/lookup).
	             */

				for (int d = 1; d < (ROUNDS_512 / 4); d += 2)
				{
					int dm9 = mod9[d];
					int dm3 = mod3[d];

					/*
	                 * 4 rounds of mix and permute.
	                 * 
	                 * Permute schedule has a 4 round cycle, so permutes are inlined in the mix
	                 * operations in each 4 round block.
	                 */
					b1 = RotlXor(b1, ROTATION_0_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_0_1, b2 += b3);
					b5 = RotlXor(b5, ROTATION_0_2, b4 += b5);
					b7 = RotlXor(b7, ROTATION_0_3, b6 += b7);

					b1 = RotlXor(b1, ROTATION_1_0, b2 += b1);
					b7 = RotlXor(b7, ROTATION_1_1, b4 += b7);
					b5 = RotlXor(b5, ROTATION_1_2, b6 += b5);
					b3 = RotlXor(b3, ROTATION_1_3, b0 += b3);

					b1 = RotlXor(b1, ROTATION_2_0, b4 += b1);
					b3 = RotlXor(b3, ROTATION_2_1, b6 += b3);
					b5 = RotlXor(b5, ROTATION_2_2, b0 += b5);
					b7 = RotlXor(b7, ROTATION_2_3, b2 += b7);

					b1 = RotlXor(b1, ROTATION_3_0, b6 += b1);
					b7 = RotlXor(b7, ROTATION_3_1, b0 += b7);
					b5 = RotlXor(b5, ROTATION_3_2, b2 += b5);
					b3 = RotlXor(b3, ROTATION_3_3, b4 += b3);

					/*
	                 * Subkey injection for first 4 rounds.
	                 */
					b0 += kw[dm9];
					b1 += kw[dm9 + 1];
					b2 += kw[dm9 + 2];
					b3 += kw[dm9 + 3];
					b4 += kw[dm9 + 4];
					b5 += kw[dm9 + 5] + t[dm3];
					b6 += kw[dm9 + 6] + t[dm3 + 1];
					b7 += kw[dm9 + 7] + (uint)d;

					/*
	                 * 4 more rounds of mix/permute
	                 */
					b1 = RotlXor(b1, ROTATION_4_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_4_1, b2 += b3);
					b5 = RotlXor(b5, ROTATION_4_2, b4 += b5);
					b7 = RotlXor(b7, ROTATION_4_3, b6 += b7);

					b1 = RotlXor(b1, ROTATION_5_0, b2 += b1);
					b7 = RotlXor(b7, ROTATION_5_1, b4 += b7);
					b5 = RotlXor(b5, ROTATION_5_2, b6 += b5);
					b3 = RotlXor(b3, ROTATION_5_3, b0 += b3);

					b1 = RotlXor(b1, ROTATION_6_0, b4 += b1);
					b3 = RotlXor(b3, ROTATION_6_1, b6 += b3);
					b5 = RotlXor(b5, ROTATION_6_2, b0 += b5);
					b7 = RotlXor(b7, ROTATION_6_3, b2 += b7);

					b1 = RotlXor(b1, ROTATION_7_0, b6 += b1);
					b7 = RotlXor(b7, ROTATION_7_1, b0 += b7);
					b5 = RotlXor(b5, ROTATION_7_2, b2 += b5);
					b3 = RotlXor(b3, ROTATION_7_3, b4 += b3);

					/*
	                 * Subkey injection for next 4 rounds.
	                 */
					b0 += kw[dm9 + 1];
					b1 += kw[dm9 + 2];
					b2 += kw[dm9 + 3];
					b3 += kw[dm9 + 4];
					b4 += kw[dm9 + 5];
					b5 += kw[dm9 + 6] + t[dm3 + 1];
					b6 += kw[dm9 + 7] + t[dm3 + 2];
					b7 += kw[dm9 + 8] + (uint)d + 1;
				}

				/*
	             * Output cipher state.
	             */
				outWords[0] = b0;
				outWords[1] = b1;
				outWords[2] = b2;
				outWords[3] = b3;
				outWords[4] = b4;
				outWords[5] = b5;
				outWords[6] = b6;
				outWords[7] = b7;
			}

			internal override void DecryptBlock(ulong[] block, ulong[] state)
			{
				ulong[] kw = this.kw;
				ulong[] t = this.t;
				int[] mod9 = MOD9;
				int[] mod3 = MOD3;

				/* Help the JIT avoid index bounds checks */
				if (kw.Length != 17)
				{
					throw new ArgumentException();
				}
				if (t.Length != 5)
				{
					throw new ArgumentException();
				}

				ulong b0 = block[0];
				ulong b1 = block[1];
				ulong b2 = block[2];
				ulong b3 = block[3];
				ulong b4 = block[4];
				ulong b5 = block[5];
				ulong b6 = block[6];
				ulong b7 = block[7];

				for (int d = (ROUNDS_512 / 4) - 1; d >= 1; d -= 2)
				{
					int dm9 = mod9[d];
					int dm3 = mod3[d];

					/* Reverse key injection for second 4 rounds */
					b0 -= kw[dm9 + 1];
					b1 -= kw[dm9 + 2];
					b2 -= kw[dm9 + 3];
					b3 -= kw[dm9 + 4];
					b4 -= kw[dm9 + 5];
					b5 -= kw[dm9 + 6] + t[dm3 + 1];
					b6 -= kw[dm9 + 7] + t[dm3 + 2];
					b7 -= kw[dm9 + 8] + (uint)d + 1;

					/* Reverse second 4 mix/permute rounds */

					b1 = XorRotr(b1, ROTATION_7_0, b6);
					b6 -= b1;
					b7 = XorRotr(b7, ROTATION_7_1, b0);
					b0 -= b7;
					b5 = XorRotr(b5, ROTATION_7_2, b2);
					b2 -= b5;
					b3 = XorRotr(b3, ROTATION_7_3, b4);
					b4 -= b3;

					b1 = XorRotr(b1, ROTATION_6_0, b4);
					b4 -= b1;
					b3 = XorRotr(b3, ROTATION_6_1, b6);
					b6 -= b3;
					b5 = XorRotr(b5, ROTATION_6_2, b0);
					b0 -= b5;
					b7 = XorRotr(b7, ROTATION_6_3, b2);
					b2 -= b7;

					b1 = XorRotr(b1, ROTATION_5_0, b2);
					b2 -= b1;
					b7 = XorRotr(b7, ROTATION_5_1, b4);
					b4 -= b7;
					b5 = XorRotr(b5, ROTATION_5_2, b6);
					b6 -= b5;
					b3 = XorRotr(b3, ROTATION_5_3, b0);
					b0 -= b3;

					b1 = XorRotr(b1, ROTATION_4_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_4_1, b2);
					b2 -= b3;
					b5 = XorRotr(b5, ROTATION_4_2, b4);
					b4 -= b5;
					b7 = XorRotr(b7, ROTATION_4_3, b6);
					b6 -= b7;

					/* Reverse key injection for first 4 rounds */
					b0 -= kw[dm9];
					b1 -= kw[dm9 + 1];
					b2 -= kw[dm9 + 2];
					b3 -= kw[dm9 + 3];
					b4 -= kw[dm9 + 4];
					b5 -= kw[dm9 + 5] + t[dm3];
					b6 -= kw[dm9 + 6] + t[dm3 + 1];
					b7 -= kw[dm9 + 7] + (uint)d;

					/* Reverse first 4 mix/permute rounds */
					b1 = XorRotr(b1, ROTATION_3_0, b6);
					b6 -= b1;
					b7 = XorRotr(b7, ROTATION_3_1, b0);
					b0 -= b7;
					b5 = XorRotr(b5, ROTATION_3_2, b2);
					b2 -= b5;
					b3 = XorRotr(b3, ROTATION_3_3, b4);
					b4 -= b3;

					b1 = XorRotr(b1, ROTATION_2_0, b4);
					b4 -= b1;
					b3 = XorRotr(b3, ROTATION_2_1, b6);
					b6 -= b3;
					b5 = XorRotr(b5, ROTATION_2_2, b0);
					b0 -= b5;
					b7 = XorRotr(b7, ROTATION_2_3, b2);
					b2 -= b7;

					b1 = XorRotr(b1, ROTATION_1_0, b2);
					b2 -= b1;
					b7 = XorRotr(b7, ROTATION_1_1, b4);
					b4 -= b7;
					b5 = XorRotr(b5, ROTATION_1_2, b6);
					b6 -= b5;
					b3 = XorRotr(b3, ROTATION_1_3, b0);
					b0 -= b3;

					b1 = XorRotr(b1, ROTATION_0_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_0_1, b2);
					b2 -= b3;
					b5 = XorRotr(b5, ROTATION_0_2, b4);
					b4 -= b5;
					b7 = XorRotr(b7, ROTATION_0_3, b6);
					b6 -= b7;
				}

				/*
	             * First subkey uninjection.
	             */
				b0 -= kw[0];
				b1 -= kw[1];
				b2 -= kw[2];
				b3 -= kw[3];
				b4 -= kw[4];
				b5 -= kw[5] + t[0];
				b6 -= kw[6] + t[1];
				b7 -= kw[7];

				/*
	             * Output cipher state.
	             */
				state[0] = b0;
				state[1] = b1;
				state[2] = b2;
				state[3] = b3;
				state[4] = b4;
				state[5] = b5;
				state[6] = b6;
				state[7] = b7;
			}
		}

		private sealed class Threefish1024Cipher
			: ThreefishCipher
		{
			/**
	         * Mix rotation constants defined in Skein 1.3 specification
	         */
			private const int ROTATION_0_0 = 24, ROTATION_0_1 = 13, ROTATION_0_2 = 8, ROTATION_0_3 = 47;
			private const int ROTATION_0_4 = 8, ROTATION_0_5 = 17, ROTATION_0_6 = 22, ROTATION_0_7 = 37;
			private const int ROTATION_1_0 = 38, ROTATION_1_1 = 19, ROTATION_1_2 = 10, ROTATION_1_3 = 55;
			private const int ROTATION_1_4 = 49, ROTATION_1_5 = 18, ROTATION_1_6 = 23, ROTATION_1_7 = 52;
			private const int ROTATION_2_0 = 33, ROTATION_2_1 = 4, ROTATION_2_2 = 51, ROTATION_2_3 = 13;
			private const int ROTATION_2_4 = 34, ROTATION_2_5 = 41, ROTATION_2_6 = 59, ROTATION_2_7 = 17;
			private const int ROTATION_3_0 = 5, ROTATION_3_1 = 20, ROTATION_3_2 = 48, ROTATION_3_3 = 41;
			private const int ROTATION_3_4 = 47, ROTATION_3_5 = 28, ROTATION_3_6 = 16, ROTATION_3_7 = 25;

			private const int ROTATION_4_0 = 41, ROTATION_4_1 = 9, ROTATION_4_2 = 37, ROTATION_4_3 = 31;
			private const int ROTATION_4_4 = 12, ROTATION_4_5 = 47, ROTATION_4_6 = 44, ROTATION_4_7 = 30;
			private const int ROTATION_5_0 = 16, ROTATION_5_1 = 34, ROTATION_5_2 = 56, ROTATION_5_3 = 51;
			private const int ROTATION_5_4 = 4, ROTATION_5_5 = 53, ROTATION_5_6 = 42, ROTATION_5_7 = 41;
			private const int ROTATION_6_0 = 31, ROTATION_6_1 = 44, ROTATION_6_2 = 47, ROTATION_6_3 = 46;
			private const int ROTATION_6_4 = 19, ROTATION_6_5 = 42, ROTATION_6_6 = 44, ROTATION_6_7 = 25;
			private const int ROTATION_7_0 = 9, ROTATION_7_1 = 48, ROTATION_7_2 = 35, ROTATION_7_3 = 52;
			private const int ROTATION_7_4 = 23, ROTATION_7_5 = 31, ROTATION_7_6 = 37, ROTATION_7_7 = 20;

			public Threefish1024Cipher(ulong[] kw, ulong[] t)
				: base(kw, t)
			{
			}

			internal override void EncryptBlock(ulong[] block, ulong[] outWords)
			{
				ulong[] kw = this.kw;
				ulong[] t = this.t;
				int[] mod17 = MOD17;
				int[] mod3 = MOD3;

				/* Help the JIT avoid index bounds checks */
				if (kw.Length != 33)
				{
					throw new ArgumentException();
				}
				if (t.Length != 5)
				{
					throw new ArgumentException();
				}

				/*
	             * Read 16 words of plaintext data, not using arrays for cipher state
	             */
				ulong b0 = block[0];
				ulong b1 = block[1];
				ulong b2 = block[2];
				ulong b3 = block[3];
				ulong b4 = block[4];
				ulong b5 = block[5];
				ulong b6 = block[6];
				ulong b7 = block[7];
				ulong b8 = block[8];
				ulong b9 = block[9];
				ulong b10 = block[10];
				ulong b11 = block[11];
				ulong b12 = block[12];
				ulong b13 = block[13];
				ulong b14 = block[14];
				ulong b15 = block[15];

				/*
	             * First subkey injection.
	             */
				b0 += kw[0];
				b1 += kw[1];
				b2 += kw[2];
				b3 += kw[3];
				b4 += kw[4];
				b5 += kw[5];
				b6 += kw[6];
				b7 += kw[7];
				b8 += kw[8];
				b9 += kw[9];
				b10 += kw[10];
				b11 += kw[11];
				b12 += kw[12];
				b13 += kw[13] + t[0];
				b14 += kw[14] + t[1];
				b15 += kw[15];

				/*
	             * Rounds loop, unrolled to 8 rounds per iteration.
	             * 
	             * Unrolling to multiples of 4 avoids the mod 4 check for key injection, and allows
	             * inlining of the permutations, which cycle every of 4 rounds (avoiding array
	             * index/lookup).
	             * 
	             * Unrolling to multiples of 8 avoids the mod 8 rotation constant lookup, and allows
	             * inlining constant rotation values (avoiding array index/lookup).
	             */

				for (int d = 1; d < (ROUNDS_1024 / 4); d += 2)
				{
					int dm17 = mod17[d];
					int dm3 = mod3[d];

					/*
	                 * 4 rounds of mix and permute.
	                 * 
	                 * Permute schedule has a 4 round cycle, so permutes are inlined in the mix
	                 * operations in each 4 round block.
	                 */
					b1 = RotlXor(b1, ROTATION_0_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_0_1, b2 += b3);
					b5 = RotlXor(b5, ROTATION_0_2, b4 += b5);
					b7 = RotlXor(b7, ROTATION_0_3, b6 += b7);
					b9 = RotlXor(b9, ROTATION_0_4, b8 += b9);
					b11 = RotlXor(b11, ROTATION_0_5, b10 += b11);
					b13 = RotlXor(b13, ROTATION_0_6, b12 += b13);
					b15 = RotlXor(b15, ROTATION_0_7, b14 += b15);

					b9 = RotlXor(b9, ROTATION_1_0, b0 += b9);
					b13 = RotlXor(b13, ROTATION_1_1, b2 += b13);
					b11 = RotlXor(b11, ROTATION_1_2, b6 += b11);
					b15 = RotlXor(b15, ROTATION_1_3, b4 += b15);
					b7 = RotlXor(b7, ROTATION_1_4, b10 += b7);
					b3 = RotlXor(b3, ROTATION_1_5, b12 += b3);
					b5 = RotlXor(b5, ROTATION_1_6, b14 += b5);
					b1 = RotlXor(b1, ROTATION_1_7, b8 += b1);

					b7 = RotlXor(b7, ROTATION_2_0, b0 += b7);
					b5 = RotlXor(b5, ROTATION_2_1, b2 += b5);
					b3 = RotlXor(b3, ROTATION_2_2, b4 += b3);
					b1 = RotlXor(b1, ROTATION_2_3, b6 += b1);
					b15 = RotlXor(b15, ROTATION_2_4, b12 += b15);
					b13 = RotlXor(b13, ROTATION_2_5, b14 += b13);
					b11 = RotlXor(b11, ROTATION_2_6, b8 += b11);
					b9 = RotlXor(b9, ROTATION_2_7, b10 += b9);

					b15 = RotlXor(b15, ROTATION_3_0, b0 += b15);
					b11 = RotlXor(b11, ROTATION_3_1, b2 += b11);
					b13 = RotlXor(b13, ROTATION_3_2, b6 += b13);
					b9 = RotlXor(b9, ROTATION_3_3, b4 += b9);
					b1 = RotlXor(b1, ROTATION_3_4, b14 += b1);
					b5 = RotlXor(b5, ROTATION_3_5, b8 += b5);
					b3 = RotlXor(b3, ROTATION_3_6, b10 += b3);
					b7 = RotlXor(b7, ROTATION_3_7, b12 += b7);

					/*
	                 * Subkey injection for first 4 rounds.
	                 */
					b0 += kw[dm17];
					b1 += kw[dm17 + 1];
					b2 += kw[dm17 + 2];
					b3 += kw[dm17 + 3];
					b4 += kw[dm17 + 4];
					b5 += kw[dm17 + 5];
					b6 += kw[dm17 + 6];
					b7 += kw[dm17 + 7];
					b8 += kw[dm17 + 8];
					b9 += kw[dm17 + 9];
					b10 += kw[dm17 + 10];
					b11 += kw[dm17 + 11];
					b12 += kw[dm17 + 12];
					b13 += kw[dm17 + 13] + t[dm3];
					b14 += kw[dm17 + 14] + t[dm3 + 1];
					b15 += kw[dm17 + 15] + (uint)d;

					/*
	                 * 4 more rounds of mix/permute
	                 */
					b1 = RotlXor(b1, ROTATION_4_0, b0 += b1);
					b3 = RotlXor(b3, ROTATION_4_1, b2 += b3);
					b5 = RotlXor(b5, ROTATION_4_2, b4 += b5);
					b7 = RotlXor(b7, ROTATION_4_3, b6 += b7);
					b9 = RotlXor(b9, ROTATION_4_4, b8 += b9);
					b11 = RotlXor(b11, ROTATION_4_5, b10 += b11);
					b13 = RotlXor(b13, ROTATION_4_6, b12 += b13);
					b15 = RotlXor(b15, ROTATION_4_7, b14 += b15);

					b9 = RotlXor(b9, ROTATION_5_0, b0 += b9);
					b13 = RotlXor(b13, ROTATION_5_1, b2 += b13);
					b11 = RotlXor(b11, ROTATION_5_2, b6 += b11);
					b15 = RotlXor(b15, ROTATION_5_3, b4 += b15);
					b7 = RotlXor(b7, ROTATION_5_4, b10 += b7);
					b3 = RotlXor(b3, ROTATION_5_5, b12 += b3);
					b5 = RotlXor(b5, ROTATION_5_6, b14 += b5);
					b1 = RotlXor(b1, ROTATION_5_7, b8 += b1);

					b7 = RotlXor(b7, ROTATION_6_0, b0 += b7);
					b5 = RotlXor(b5, ROTATION_6_1, b2 += b5);
					b3 = RotlXor(b3, ROTATION_6_2, b4 += b3);
					b1 = RotlXor(b1, ROTATION_6_3, b6 += b1);
					b15 = RotlXor(b15, ROTATION_6_4, b12 += b15);
					b13 = RotlXor(b13, ROTATION_6_5, b14 += b13);
					b11 = RotlXor(b11, ROTATION_6_6, b8 += b11);
					b9 = RotlXor(b9, ROTATION_6_7, b10 += b9);

					b15 = RotlXor(b15, ROTATION_7_0, b0 += b15);
					b11 = RotlXor(b11, ROTATION_7_1, b2 += b11);
					b13 = RotlXor(b13, ROTATION_7_2, b6 += b13);
					b9 = RotlXor(b9, ROTATION_7_3, b4 += b9);
					b1 = RotlXor(b1, ROTATION_7_4, b14 += b1);
					b5 = RotlXor(b5, ROTATION_7_5, b8 += b5);
					b3 = RotlXor(b3, ROTATION_7_6, b10 += b3);
					b7 = RotlXor(b7, ROTATION_7_7, b12 += b7);

					/*
	                 * Subkey injection for next 4 rounds.
	                 */
					b0 += kw[dm17 + 1];
					b1 += kw[dm17 + 2];
					b2 += kw[dm17 + 3];
					b3 += kw[dm17 + 4];
					b4 += kw[dm17 + 5];
					b5 += kw[dm17 + 6];
					b6 += kw[dm17 + 7];
					b7 += kw[dm17 + 8];
					b8 += kw[dm17 + 9];
					b9 += kw[dm17 + 10];
					b10 += kw[dm17 + 11];
					b11 += kw[dm17 + 12];
					b12 += kw[dm17 + 13];
					b13 += kw[dm17 + 14] + t[dm3 + 1];
					b14 += kw[dm17 + 15] + t[dm3 + 2];
					b15 += kw[dm17 + 16] + (uint)d + 1;

				}

				/*
	             * Output cipher state.
	             */
				outWords[0] = b0;
				outWords[1] = b1;
				outWords[2] = b2;
				outWords[3] = b3;
				outWords[4] = b4;
				outWords[5] = b5;
				outWords[6] = b6;
				outWords[7] = b7;
				outWords[8] = b8;
				outWords[9] = b9;
				outWords[10] = b10;
				outWords[11] = b11;
				outWords[12] = b12;
				outWords[13] = b13;
				outWords[14] = b14;
				outWords[15] = b15;
			}

			internal override void DecryptBlock(ulong[] block, ulong[] state)
			{
				ulong[] kw = this.kw;
				ulong[] t = this.t;
				int[] mod17 = MOD17;
				int[] mod3 = MOD3;

				/* Help the JIT avoid index bounds checks */
				if (kw.Length != 33)
				{
					throw new ArgumentException();
				}
				if (t.Length != 5)
				{
					throw new ArgumentException();
				}

				ulong b0 = block[0];
				ulong b1 = block[1];
				ulong b2 = block[2];
				ulong b3 = block[3];
				ulong b4 = block[4];
				ulong b5 = block[5];
				ulong b6 = block[6];
				ulong b7 = block[7];
				ulong b8 = block[8];
				ulong b9 = block[9];
				ulong b10 = block[10];
				ulong b11 = block[11];
				ulong b12 = block[12];
				ulong b13 = block[13];
				ulong b14 = block[14];
				ulong b15 = block[15];

				for (int d = (ROUNDS_1024 / 4) - 1; d >= 1; d -= 2)
				{
					int dm17 = mod17[d];
					int dm3 = mod3[d];

					/* Reverse key injection for second 4 rounds */
					b0 -= kw[dm17 + 1];
					b1 -= kw[dm17 + 2];
					b2 -= kw[dm17 + 3];
					b3 -= kw[dm17 + 4];
					b4 -= kw[dm17 + 5];
					b5 -= kw[dm17 + 6];
					b6 -= kw[dm17 + 7];
					b7 -= kw[dm17 + 8];
					b8 -= kw[dm17 + 9];
					b9 -= kw[dm17 + 10];
					b10 -= kw[dm17 + 11];
					b11 -= kw[dm17 + 12];
					b12 -= kw[dm17 + 13];
					b13 -= kw[dm17 + 14] + t[dm3 + 1];
					b14 -= kw[dm17 + 15] + t[dm3 + 2];
					b15 -= kw[dm17 + 16] + (uint)d + 1;

					/* Reverse second 4 mix/permute rounds */
					b15 = XorRotr(b15, ROTATION_7_0, b0);
					b0 -= b15;
					b11 = XorRotr(b11, ROTATION_7_1, b2);
					b2 -= b11;
					b13 = XorRotr(b13, ROTATION_7_2, b6);
					b6 -= b13;
					b9 = XorRotr(b9, ROTATION_7_3, b4);
					b4 -= b9;
					b1 = XorRotr(b1, ROTATION_7_4, b14);
					b14 -= b1;
					b5 = XorRotr(b5, ROTATION_7_5, b8);
					b8 -= b5;
					b3 = XorRotr(b3, ROTATION_7_6, b10);
					b10 -= b3;
					b7 = XorRotr(b7, ROTATION_7_7, b12);
					b12 -= b7;

					b7 = XorRotr(b7, ROTATION_6_0, b0);
					b0 -= b7;
					b5 = XorRotr(b5, ROTATION_6_1, b2);
					b2 -= b5;
					b3 = XorRotr(b3, ROTATION_6_2, b4);
					b4 -= b3;
					b1 = XorRotr(b1, ROTATION_6_3, b6);
					b6 -= b1;
					b15 = XorRotr(b15, ROTATION_6_4, b12);
					b12 -= b15;
					b13 = XorRotr(b13, ROTATION_6_5, b14);
					b14 -= b13;
					b11 = XorRotr(b11, ROTATION_6_6, b8);
					b8 -= b11;
					b9 = XorRotr(b9, ROTATION_6_7, b10);
					b10 -= b9;

					b9 = XorRotr(b9, ROTATION_5_0, b0);
					b0 -= b9;
					b13 = XorRotr(b13, ROTATION_5_1, b2);
					b2 -= b13;
					b11 = XorRotr(b11, ROTATION_5_2, b6);
					b6 -= b11;
					b15 = XorRotr(b15, ROTATION_5_3, b4);
					b4 -= b15;
					b7 = XorRotr(b7, ROTATION_5_4, b10);
					b10 -= b7;
					b3 = XorRotr(b3, ROTATION_5_5, b12);
					b12 -= b3;
					b5 = XorRotr(b5, ROTATION_5_6, b14);
					b14 -= b5;
					b1 = XorRotr(b1, ROTATION_5_7, b8);
					b8 -= b1;

					b1 = XorRotr(b1, ROTATION_4_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_4_1, b2);
					b2 -= b3;
					b5 = XorRotr(b5, ROTATION_4_2, b4);
					b4 -= b5;
					b7 = XorRotr(b7, ROTATION_4_3, b6);
					b6 -= b7;
					b9 = XorRotr(b9, ROTATION_4_4, b8);
					b8 -= b9;
					b11 = XorRotr(b11, ROTATION_4_5, b10);
					b10 -= b11;
					b13 = XorRotr(b13, ROTATION_4_6, b12);
					b12 -= b13;
					b15 = XorRotr(b15, ROTATION_4_7, b14);
					b14 -= b15;

					/* Reverse key injection for first 4 rounds */
					b0 -= kw[dm17];
					b1 -= kw[dm17 + 1];
					b2 -= kw[dm17 + 2];
					b3 -= kw[dm17 + 3];
					b4 -= kw[dm17 + 4];
					b5 -= kw[dm17 + 5];
					b6 -= kw[dm17 + 6];
					b7 -= kw[dm17 + 7];
					b8 -= kw[dm17 + 8];
					b9 -= kw[dm17 + 9];
					b10 -= kw[dm17 + 10];
					b11 -= kw[dm17 + 11];
					b12 -= kw[dm17 + 12];
					b13 -= kw[dm17 + 13] + t[dm3];
					b14 -= kw[dm17 + 14] + t[dm3 + 1];
					b15 -= kw[dm17 + 15] + (uint)d;

					/* Reverse first 4 mix/permute rounds */
					b15 = XorRotr(b15, ROTATION_3_0, b0);
					b0 -= b15;
					b11 = XorRotr(b11, ROTATION_3_1, b2);
					b2 -= b11;
					b13 = XorRotr(b13, ROTATION_3_2, b6);
					b6 -= b13;
					b9 = XorRotr(b9, ROTATION_3_3, b4);
					b4 -= b9;
					b1 = XorRotr(b1, ROTATION_3_4, b14);
					b14 -= b1;
					b5 = XorRotr(b5, ROTATION_3_5, b8);
					b8 -= b5;
					b3 = XorRotr(b3, ROTATION_3_6, b10);
					b10 -= b3;
					b7 = XorRotr(b7, ROTATION_3_7, b12);
					b12 -= b7;

					b7 = XorRotr(b7, ROTATION_2_0, b0);
					b0 -= b7;
					b5 = XorRotr(b5, ROTATION_2_1, b2);
					b2 -= b5;
					b3 = XorRotr(b3, ROTATION_2_2, b4);
					b4 -= b3;
					b1 = XorRotr(b1, ROTATION_2_3, b6);
					b6 -= b1;
					b15 = XorRotr(b15, ROTATION_2_4, b12);
					b12 -= b15;
					b13 = XorRotr(b13, ROTATION_2_5, b14);
					b14 -= b13;
					b11 = XorRotr(b11, ROTATION_2_6, b8);
					b8 -= b11;
					b9 = XorRotr(b9, ROTATION_2_7, b10);
					b10 -= b9;

					b9 = XorRotr(b9, ROTATION_1_0, b0);
					b0 -= b9;
					b13 = XorRotr(b13, ROTATION_1_1, b2);
					b2 -= b13;
					b11 = XorRotr(b11, ROTATION_1_2, b6);
					b6 -= b11;
					b15 = XorRotr(b15, ROTATION_1_3, b4);
					b4 -= b15;
					b7 = XorRotr(b7, ROTATION_1_4, b10);
					b10 -= b7;
					b3 = XorRotr(b3, ROTATION_1_5, b12);
					b12 -= b3;
					b5 = XorRotr(b5, ROTATION_1_6, b14);
					b14 -= b5;
					b1 = XorRotr(b1, ROTATION_1_7, b8);
					b8 -= b1;

					b1 = XorRotr(b1, ROTATION_0_0, b0);
					b0 -= b1;
					b3 = XorRotr(b3, ROTATION_0_1, b2);
					b2 -= b3;
					b5 = XorRotr(b5, ROTATION_0_2, b4);
					b4 -= b5;
					b7 = XorRotr(b7, ROTATION_0_3, b6);
					b6 -= b7;
					b9 = XorRotr(b9, ROTATION_0_4, b8);
					b8 -= b9;
					b11 = XorRotr(b11, ROTATION_0_5, b10);
					b10 -= b11;
					b13 = XorRotr(b13, ROTATION_0_6, b12);
					b12 -= b13;
					b15 = XorRotr(b15, ROTATION_0_7, b14);
					b14 -= b15;
				}

				/*
	             * First subkey uninjection.
	             */
				b0 -= kw[0];
				b1 -= kw[1];
				b2 -= kw[2];
				b3 -= kw[3];
				b4 -= kw[4];
				b5 -= kw[5];
				b6 -= kw[6];
				b7 -= kw[7];
				b8 -= kw[8];
				b9 -= kw[9];
				b10 -= kw[10];
				b11 -= kw[11];
				b12 -= kw[12];
				b13 -= kw[13] + t[0];
				b14 -= kw[14] + t[1];
				b15 -= kw[15];

				/*
	             * Output cipher state.
	             */
				state[0] = b0;
				state[1] = b1;
				state[2] = b2;
				state[3] = b3;
				state[4] = b4;
				state[5] = b5;
				state[6] = b6;
				state[7] = b7;
				state[8] = b8;
				state[9] = b9;
				state[10] = b10;
				state[11] = b11;
				state[12] = b12;
				state[13] = b13;
				state[14] = b14;
				state[15] = b15;
			}

		}

	}
}