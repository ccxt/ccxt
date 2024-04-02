using System;
using System.Text;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/// <summary>
	/// Implementation of Daniel J. Bernstein's Salsa20 stream cipher, Snuffle 2005
	/// </summary>
	public class Salsa20Engine
		: IStreamCipher
	{
		public static readonly int DEFAULT_ROUNDS = 20;

		/** Constants */
		private const int StateSize = 16; // 16, 32 bit ints = 64 bytes

        private readonly static uint[] TAU_SIGMA = Pack.LE_To_UInt32(Strings.ToAsciiByteArray("expand 16-byte k" + "expand 32-byte k"), 0, 8);

        internal void PackTauOrSigma(int keyLength, uint[] state, int stateOffset)
        {
            int tsOff = (keyLength - 16) / 4;
            state[stateOffset] = TAU_SIGMA[tsOff];
            state[stateOffset + 1] = TAU_SIGMA[tsOff + 1];
            state[stateOffset + 2] = TAU_SIGMA[tsOff + 2];
            state[stateOffset + 3] = TAU_SIGMA[tsOff + 3];
        }

		protected int rounds;

		/*
		 * variables to hold the state of the engine
		 * during encryption and decryption
		 */
		internal int index = 0;
		internal uint[] engineState = new uint[StateSize]; // state
		internal uint[] x = new uint[StateSize]; // internal buffer
		internal byte[] keyStream = new byte[StateSize * 4]; // expanded state, 64 bytes
		internal bool initialised = false;

		/*
		 * internal counter
		 */
		private uint cW0, cW1, cW2;

		/// <summary>
		/// Creates a 20 round Salsa20 engine.
		/// </summary>
		public Salsa20Engine()
			: this(DEFAULT_ROUNDS)
		{
		}

		/// <summary>
		/// Creates a Salsa20 engine with a specific number of rounds.
		/// </summary>
		/// <param name="rounds">the number of rounds (must be an even number).</param>
		public Salsa20Engine(int rounds)
		{
			if (rounds <= 0 || (rounds & 1) != 0)
			{
				throw new ArgumentException("'rounds' must be a positive, even number");
			}

			this.rounds = rounds;
		}

        public virtual void Init(
			bool				forEncryption, 
			ICipherParameters	parameters)
		{
			/* 
			 * Salsa20 encryption and decryption is completely
			 * symmetrical, so the 'forEncryption' is 
			 * irrelevant. (Like 90% of stream ciphers)
			 */

			ParametersWithIV ivParams = parameters as ParametersWithIV;
			if (ivParams == null)
				throw new ArgumentException(AlgorithmName + " Init requires an IV", "parameters");

			byte[] iv = ivParams.GetIV();
			if (iv == null || iv.Length != NonceSize)
				throw new ArgumentException(AlgorithmName + " requires exactly " + NonceSize + " bytes of IV");

            ICipherParameters keyParam = ivParams.Parameters;
            if (keyParam == null)
            {
                if (!initialised)
                    throw new InvalidOperationException(AlgorithmName + " KeyParameter can not be null for first initialisation");

                SetKey(null, iv);
            }
            else if (keyParam is KeyParameter)
            {
                SetKey(((KeyParameter)keyParam).GetKey(), iv);
            }
            else
            {
                throw new ArgumentException(AlgorithmName + " Init parameters must contain a KeyParameter (or null for re-init)");
            }

            Reset();
			initialised = true;
		}

		protected virtual int NonceSize
		{
			get { return 8; }
		}

		public virtual string AlgorithmName
		{
			get
            { 
				string name = "Salsa20";
				if (rounds != DEFAULT_ROUNDS)
				{
					name += "/" + rounds;
				}
				return name;
			}
		}

        public virtual byte ReturnByte(
			byte input)
		{
			if (LimitExceeded())
			{
				throw new MaxBytesExceededException("2^70 byte limit per IV; Change IV");
			}

			if (index == 0)
			{
				GenerateKeyStream(keyStream);
				AdvanceCounter();
			}

			byte output = (byte)(keyStream[index] ^ input);
			index = (index + 1) & 63;

			return output;
		}

		protected virtual void AdvanceCounter()
		{
			if (++engineState[8] == 0)
			{
				++engineState[9];
			}
		}

        public virtual void ProcessBytes(
			byte[]	inBytes, 
			int		inOff, 
			int		len, 
			byte[]	outBytes, 
			int		outOff)
		{
			if (!initialised)
				throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.DataLength(inBytes, inOff, len, "input buffer too short");
            Check.OutputLength(outBytes, outOff, len, "output buffer too short");

            if (LimitExceeded((uint)len))
				throw new MaxBytesExceededException("2^70 byte limit per IV would be exceeded; Change IV");

            for (int i = 0; i < len; i++)
			{
				if (index == 0)
				{
					GenerateKeyStream(keyStream);
					AdvanceCounter();
				}
				outBytes[i+outOff] = (byte)(keyStream[index]^inBytes[i+inOff]);
				index = (index + 1) & 63;
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (!initialised)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.OutputLength(output, input.Length, "output buffer too short");

            if (LimitExceeded((uint)input.Length))
                throw new MaxBytesExceededException("2^70 byte limit per IV would be exceeded; Change IV");

            for (int i = 0; i < input.Length; i++)
            {
                if (index == 0)
                {
                    GenerateKeyStream(keyStream);
                    AdvanceCounter();
                }
                output[i] = (byte)(keyStream[index++] ^ input[i]);
                index &= 63;
            }
        }
#endif

        public virtual void Reset()
		{
			index = 0;
			ResetLimitCounter();
			ResetCounter();
		}

		protected virtual void ResetCounter()
		{
			engineState[8] = engineState[9] = 0;
		}

		protected virtual void SetKey(byte[] keyBytes, byte[] ivBytes)
		{
            if (keyBytes != null)
            {
                if ((keyBytes.Length != 16) && (keyBytes.Length != 32))
                    throw new ArgumentException(AlgorithmName + " requires 128 bit or 256 bit key");

                int tsOff = (keyBytes.Length - 16) / 4;
                engineState[0] = TAU_SIGMA[tsOff];
                engineState[5] = TAU_SIGMA[tsOff + 1];
                engineState[10] = TAU_SIGMA[tsOff + 2];
                engineState[15] = TAU_SIGMA[tsOff + 3];

                // Key
                Pack.LE_To_UInt32(keyBytes, 0, engineState, 1, 4);
                Pack.LE_To_UInt32(keyBytes, keyBytes.Length - 16, engineState, 11, 4);
            }

            // IV
            Pack.LE_To_UInt32(ivBytes, 0, engineState, 6, 2);
        }

        protected virtual void GenerateKeyStream(byte[] output)
		{
			SalsaCore(rounds, engineState, x);
			Pack.UInt32_To_LE(x, output, 0);
		}

		internal static void SalsaCore(int rounds, uint[] input, uint[] x)
		{
			if (input.Length != 16)
				throw new ArgumentException();
			if (x.Length != 16)
				throw new ArgumentException();
			if (rounds % 2 != 0)
				throw new ArgumentException("Number of rounds must be even");

            uint x00 = input[ 0];
			uint x01 = input[ 1];
			uint x02 = input[ 2];
			uint x03 = input[ 3];
			uint x04 = input[ 4];
			uint x05 = input[ 5];
			uint x06 = input[ 6];
			uint x07 = input[ 7];
			uint x08 = input[ 8];
			uint x09 = input[ 9];
			uint x10 = input[10];
			uint x11 = input[11];
			uint x12 = input[12];
			uint x13 = input[13];
			uint x14 = input[14];
			uint x15 = input[15];

			for (int i = rounds; i > 0; i -= 2)
			{
				x04 ^= Integers.RotateLeft((x00+x12), 7);
				x08 ^= Integers.RotateLeft((x04+x00), 9);
				x12 ^= Integers.RotateLeft((x08+x04),13);
				x00 ^= Integers.RotateLeft((x12+x08),18);
				x09 ^= Integers.RotateLeft((x05+x01), 7);
				x13 ^= Integers.RotateLeft((x09+x05), 9);
				x01 ^= Integers.RotateLeft((x13+x09),13);
				x05 ^= Integers.RotateLeft((x01+x13),18);
				x14 ^= Integers.RotateLeft((x10+x06), 7);
				x02 ^= Integers.RotateLeft((x14+x10), 9);
				x06 ^= Integers.RotateLeft((x02+x14),13);
				x10 ^= Integers.RotateLeft((x06+x02),18);
				x03 ^= Integers.RotateLeft((x15+x11), 7);
				x07 ^= Integers.RotateLeft((x03+x15), 9);
				x11 ^= Integers.RotateLeft((x07+x03),13);
				x15 ^= Integers.RotateLeft((x11+x07),18);

				x01 ^= Integers.RotateLeft((x00+x03), 7);
				x02 ^= Integers.RotateLeft((x01+x00), 9);
				x03 ^= Integers.RotateLeft((x02+x01),13);
				x00 ^= Integers.RotateLeft((x03+x02),18);
				x06 ^= Integers.RotateLeft((x05+x04), 7);
				x07 ^= Integers.RotateLeft((x06+x05), 9);
				x04 ^= Integers.RotateLeft((x07+x06),13);
				x05 ^= Integers.RotateLeft((x04+x07),18);
				x11 ^= Integers.RotateLeft((x10+x09), 7);
				x08 ^= Integers.RotateLeft((x11+x10), 9);
				x09 ^= Integers.RotateLeft((x08+x11),13);
				x10 ^= Integers.RotateLeft((x09+x08),18);
				x12 ^= Integers.RotateLeft((x15+x14), 7);
				x13 ^= Integers.RotateLeft((x12+x15), 9);
				x14 ^= Integers.RotateLeft((x13+x12),13);
				x15 ^= Integers.RotateLeft((x14+x13),18);
			}

			x[ 0] = x00 + input[ 0];
			x[ 1] = x01 + input[ 1];
			x[ 2] = x02 + input[ 2];
			x[ 3] = x03 + input[ 3];
			x[ 4] = x04 + input[ 4];
			x[ 5] = x05 + input[ 5];
			x[ 6] = x06 + input[ 6];
			x[ 7] = x07 + input[ 7];
			x[ 8] = x08 + input[ 8];
			x[ 9] = x09 + input[ 9];
			x[10] = x10 + input[10];
			x[11] = x11 + input[11];
			x[12] = x12 + input[12];
			x[13] = x13 + input[13];
			x[14] = x14 + input[14];
			x[15] = x15 + input[15];
		}

		internal void ResetLimitCounter()
		{
			cW0 = 0;
			cW1 = 0;
			cW2 = 0;
		}

		internal bool LimitExceeded()
		{
			if (++cW0 == 0)
			{
				if (++cW1 == 0)
				{
					return (++cW2 & 0x20) != 0;          // 2^(32 + 32 + 6)
				}
			}

			return false;
		}

		/*
		 * this relies on the fact len will always be positive.
		 */
		internal bool LimitExceeded(
			uint len)
		{
			uint old = cW0;
			cW0 += len;
			if (cW0 < old)
			{
				if (++cW1 == 0)
				{
					return (++cW2 & 0x20) != 0;          // 2^(32 + 32 + 6)
				}
			}

			return false;
		}
	}
}
