using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/**
	* A Noekeon engine, using direct-key mode.
	*/
	public class NoekeonEngine
		: IBlockCipher
	{
		// Block and key size, as well as the amount of rounds.
		private const int Size = 16;

        private static readonly byte[] RoundConstants = { 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e,
			0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4 };

        private readonly uint[] k = new uint[4];

		private bool _initialised, _forEncryption;

		/**
		* Create an instance of the Noekeon encryption algorithm
		* and set some defaults
		*/
		public NoekeonEngine()
		{
			_initialised = false;
		}

		public virtual string AlgorithmName
		{
			get { return "Noekeon"; }
		}

        public virtual int GetBlockSize()
		{
			return Size;
		}

		/**
		* initialise
		*
		* @param forEncryption whether or not we are for encryption.
		* @param params the parameters required to set up the cipher.
		* @exception ArgumentException if the params argument is
		* inappropriate.
		*/
		public virtual void Init(bool forEncryption, ICipherParameters parameters)
		{
			if (!(parameters is KeyParameter))
				throw new ArgumentException("Invalid parameters passed to Noekeon init - "
                    + Platform.GetTypeName(parameters), "parameters");

			KeyParameter p = (KeyParameter) parameters;
            byte[] key = p.GetKey();
            if (key.Length != 16)
                throw new ArgumentException("Key length not 128 bits.");

            Pack.BE_To_UInt32(key, 0, k, 0, 4);

			if (!forEncryption)
			{
				// theta(k, new uint[]{ 0x00, 0x00, 0x00, 0x00 });
				{
					uint a0 = k[0], a1 = k[1], a2 = k[2], a3 = k[3];

					uint t02 = a0 ^ a2;
					t02 ^= Integers.RotateLeft(t02, 8) ^ Integers.RotateLeft(t02, 24);

					uint t13 = a1 ^ a3;
					t13 ^= Integers.RotateLeft(t13, 8) ^ Integers.RotateLeft(t13, 24);

					a0 ^= t13;
                    a1 ^= t02;
                    a2 ^= t13;
                    a3 ^= t02;

                    k[0] = a0; k[1] = a1; k[2] = a2; k[3] = a3;
				}
			}

            this._forEncryption = forEncryption;
            this._initialised = true;
        }

        public virtual int ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
		{
			if (!_initialised)
				throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.DataLength(input, inOff, Size, "input buffer too short");
            Check.OutputLength(output, outOff, Size, "output buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return _forEncryption
				? EncryptBlock(input.AsSpan(inOff), output.AsSpan(outOff))
				: DecryptBlock(input.AsSpan(inOff), output.AsSpan(outOff));
#else
			return _forEncryption
				? EncryptBlock(input, inOff, output, outOff)
				: DecryptBlock(input, inOff, output, outOff);
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public virtual int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
		{
			if (!_initialised)
				throw new InvalidOperationException(AlgorithmName + " not initialised");

			Check.DataLength(input, Size, "input buffer too short");
			Check.OutputLength(output, Size, "output buffer too short");

			return _forEncryption
				? EncryptBlock(input, output)
				: DecryptBlock(input, output);
		}
#endif

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		private int EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
		{
			uint a0 = Pack.BE_To_UInt32(input);
			uint a1 = Pack.BE_To_UInt32(input[4..]);
			uint a2 = Pack.BE_To_UInt32(input[8..]);
			uint a3 = Pack.BE_To_UInt32(input[12..]);

			uint k0 = k[0], k1 = k[1], k2 = k[2], k3 = k[3];

			int round = 0;
			for (;;)
			{
				a0 ^= RoundConstants[round];

				// theta(a, k);
				{
					uint t02 = a0 ^ a2;
					t02 ^= Integers.RotateLeft(t02, 8) ^ Integers.RotateLeft(t02, 24);

					a0 ^= k0;
					a1 ^= k1;
					a2 ^= k2;
					a3 ^= k3;

                    uint t13 = a1 ^ a3;
                    t13 ^= Integers.RotateLeft(t13, 8) ^ Integers.RotateLeft(t13, 24);

                    a0 ^= t13;
                    a1 ^= t02;
                    a2 ^= t13;
                    a3 ^= t02;
				}

				if (++round > Size)
					break;

				// pi1(a);
				{
					a1 = Integers.RotateLeft(a1, 1);
					a2 = Integers.RotateLeft(a2, 5);
					a3 = Integers.RotateLeft(a3, 2);
				}

				// gamma(a);
				{
                    uint t = a3;
                    a1 ^= a3 | a2;
                    a3 = a0 ^ (a2 & ~a1);

                    a2 = t ^ ~a1 ^ a2 ^ a3;

                    a1 ^= a3 | a2;
                    a0 = t ^ (a2 & a1);
				}

				// pi2(a);
				{
					a1 = Integers.RotateLeft(a1, 31);
					a2 = Integers.RotateLeft(a2, 27);
					a3 = Integers.RotateLeft(a3, 30);
				}
			}

			Pack.UInt32_To_BE(a0, output);
			Pack.UInt32_To_BE(a1, output[4..]);
			Pack.UInt32_To_BE(a2, output[8..]);
			Pack.UInt32_To_BE(a3, output[12..]);

			return Size;
		}

		private int DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
		{
			uint a0 = Pack.BE_To_UInt32(input);
			uint a1 = Pack.BE_To_UInt32(input[4..]);
			uint a2 = Pack.BE_To_UInt32(input[8..]);
			uint a3 = Pack.BE_To_UInt32(input[12..]);

			uint k0 = k[0], k1 = k[1], k2 = k[2], k3 = k[3];

			int round = Size;
			for (;;)
			{
				// theta(a, k);
				{
                    uint t02 = a0 ^ a2;
                    t02 ^= Integers.RotateLeft(t02, 8) ^ Integers.RotateLeft(t02, 24);

                    a0 ^= k0;
                    a1 ^= k1;
                    a2 ^= k2;
                    a3 ^= k3;

                    uint t13 = a1 ^ a3;
                    t13 ^= Integers.RotateLeft(t13, 8) ^ Integers.RotateLeft(t13, 24);

                    a0 ^= t13;
                    a1 ^= t02;
                    a2 ^= t13;
                    a3 ^= t02;
                }

                a0 ^= RoundConstants[round];

				if (--round < 0)
					break;

				// pi1(a);
				{
					a1 = Integers.RotateLeft(a1, 1);
					a2 = Integers.RotateLeft(a2, 5);
					a3 = Integers.RotateLeft(a3, 2);
				}

				// gamma(a);
				{
                    uint t = a3;
                    a1 ^= a3 | a2;
                    a3 = a0 ^ (a2 & ~a1);

                    a2 = t ^ ~a1 ^ a2 ^ a3;

                    a1 ^= a3 | a2;
                    a0 = t ^ (a2 & a1);
                }

                // pi2(a);
                {
					a1 = Integers.RotateLeft(a1, 31);
					a2 = Integers.RotateLeft(a2, 27);
					a3 = Integers.RotateLeft(a3, 30);
				}
			}

			Pack.UInt32_To_BE(a0, output);
			Pack.UInt32_To_BE(a1, output[4..]);
			Pack.UInt32_To_BE(a2, output[8..]);
			Pack.UInt32_To_BE(a3, output[12..]);

			return Size;
		}
#else
		private int EncryptBlock(byte[]	input, int inOff, byte[] output, int outOff)
		{
			uint a0 = Pack.BE_To_UInt32(input, inOff);
			uint a1 = Pack.BE_To_UInt32(input, inOff + 4);
			uint a2 = Pack.BE_To_UInt32(input, inOff + 8);
			uint a3 = Pack.BE_To_UInt32(input, inOff + 12);

			uint k0 = k[0], k1 = k[1], k2 = k[2], k3 = k[3];

			int round = 0;
			for (;;)
			{
				a0 ^= RoundConstants[round];

				// theta(a, k);
				{
					uint t02 = a0 ^ a2;
					t02 ^= Integers.RotateLeft(t02, 8) ^ Integers.RotateLeft(t02, 24);

					a0 ^= k0;
					a1 ^= k1;
					a2 ^= k2;
					a3 ^= k3;

                    uint t13 = a1 ^ a3;
                    t13 ^= Integers.RotateLeft(t13, 8) ^ Integers.RotateLeft(t13, 24);

                    a0 ^= t13;
                    a1 ^= t02;
                    a2 ^= t13;
                    a3 ^= t02;
				}

				if (++round > Size)
					break;

				// pi1(a);
				{
					a1 = Integers.RotateLeft(a1, 1);
					a2 = Integers.RotateLeft(a2, 5);
					a3 = Integers.RotateLeft(a3, 2);
				}

				// gamma(a);
				{
                    uint t = a3;
                    a1 ^= a3 | a2;
                    a3 = a0 ^ (a2 & ~a1);

                    a2 = t ^ ~a1 ^ a2 ^ a3;

                    a1 ^= a3 | a2;
                    a0 = t ^ (a2 & a1);
				}

				// pi2(a);
				{
					a1 = Integers.RotateLeft(a1, 31);
					a2 = Integers.RotateLeft(a2, 27);
					a3 = Integers.RotateLeft(a3, 30);
				}
			}

			Pack.UInt32_To_BE(a0, output, outOff);
			Pack.UInt32_To_BE(a1, output, outOff + 4);
			Pack.UInt32_To_BE(a2, output, outOff + 8);
			Pack.UInt32_To_BE(a3, output, outOff + 12);

			return Size;
		}

		private int DecryptBlock(byte[]	input, int inOff, byte[] output, int outOff)
		{
			uint a0 = Pack.BE_To_UInt32(input, inOff);
			uint a1 = Pack.BE_To_UInt32(input, inOff + 4);
			uint a2 = Pack.BE_To_UInt32(input, inOff + 8);
			uint a3 = Pack.BE_To_UInt32(input, inOff + 12);

			uint k0 = k[0], k1 = k[1], k2 = k[2], k3 = k[3];

			int round = Size;
			for (;;)
			{
				// theta(a, k);
				{
                    uint t02 = a0 ^ a2;
                    t02 ^= Integers.RotateLeft(t02, 8) ^ Integers.RotateLeft(t02, 24);

                    a0 ^= k0;
                    a1 ^= k1;
                    a2 ^= k2;
                    a3 ^= k3;

                    uint t13 = a1 ^ a3;
                    t13 ^= Integers.RotateLeft(t13, 8) ^ Integers.RotateLeft(t13, 24);

                    a0 ^= t13;
                    a1 ^= t02;
                    a2 ^= t13;
                    a3 ^= t02;
                }

                a0 ^= RoundConstants[round];

				if (--round < 0)
					break;

				// pi1(a);
				{
					a1 = Integers.RotateLeft(a1, 1);
					a2 = Integers.RotateLeft(a2, 5);
					a3 = Integers.RotateLeft(a3, 2);
				}

				// gamma(a);
				{
                    uint t = a3;
                    a1 ^= a3 | a2;
                    a3 = a0 ^ (a2 & ~a1);

                    a2 = t ^ ~a1 ^ a2 ^ a3;

                    a1 ^= a3 | a2;
                    a0 = t ^ (a2 & a1);
                }

                // pi2(a);
                {
					a1 = Integers.RotateLeft(a1, 31);
					a2 = Integers.RotateLeft(a2, 27);
					a3 = Integers.RotateLeft(a3, 30);
				}
			}

			Pack.UInt32_To_BE(a0, output, outOff);
			Pack.UInt32_To_BE(a1, output, outOff + 4);
			Pack.UInt32_To_BE(a2, output, outOff + 8);
			Pack.UInt32_To_BE(a3, output, outOff + 12);

			return Size;
		}
#endif
	}
}
