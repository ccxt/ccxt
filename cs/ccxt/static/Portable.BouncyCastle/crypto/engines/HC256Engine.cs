using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/**
	* HC-256 is a software-efficient stream cipher created by Hongjun Wu. It 
	* generates keystream from a 256-bit secret key and a 256-bit initialization 
	* vector.
	* <p>
	* http://www.ecrypt.eu.org/stream/p3ciphers/hc/hc256_p3.pdf
	* </p><p>
	* Its brother, HC-128, is a third phase candidate in the eStream contest.
	* The algorithm is patent-free. No attacks are known as of today (April 2007). 
	* See
	* 
	* http://www.ecrypt.eu.org/stream/hcp3.html
	* </p>
	*/
	public class HC256Engine
		: IStreamCipher
	{
		private uint[] p = new uint[1024];
		private uint[] q = new uint[1024];
		private uint cnt = 0;

		private uint Step()
		{
			uint j = cnt & 0x3FF;
			uint ret;
			if (cnt < 1024)
			{
				uint x = p[(j - 3 & 0x3FF)];
				uint y = p[(j - 1023 & 0x3FF)];
				p[j] += p[(j - 10 & 0x3FF)]
					+ (RotateRight(x, 10) ^ RotateRight(y, 23))
					+ q[((x ^ y) & 0x3FF)];

				x = p[(j - 12 & 0x3FF)];
				ret = (q[x & 0xFF] + q[((x >> 8) & 0xFF) + 256]
					+ q[((x >> 16) & 0xFF) + 512] + q[((x >> 24) & 0xFF) + 768])
					^ p[j];
			}
			else
			{
				uint x = q[(j - 3 & 0x3FF)];
				uint y = q[(j - 1023 & 0x3FF)];
				q[j] += q[(j - 10 & 0x3FF)]
					+ (RotateRight(x, 10) ^ RotateRight(y, 23))
					+ p[((x ^ y) & 0x3FF)];

				x = q[(j - 12 & 0x3FF)];
				ret = (p[x & 0xFF] + p[((x >> 8) & 0xFF) + 256]
					+ p[((x >> 16) & 0xFF) + 512] + p[((x >> 24) & 0xFF) + 768])
					^ q[j];
			}
			cnt = cnt + 1 & 0x7FF;
			return ret;
		}

		private byte[] key, iv;
		private bool initialised;

		private void Init()
		{
			if (key.Length != 32 && key.Length != 16)
				throw new ArgumentException("The key must be 128/256 bits long");

			if (iv.Length < 16)
				throw new ArgumentException("The IV must be at least 128 bits long");

			if (key.Length != 32)
	        {
				byte[] k = new byte[32];

				Array.Copy(key, 0, k, 0, key.Length);
				Array.Copy(key, 0, k, 16, key.Length);

				key = k;
			}

			if (iv.Length < 32)
			{
				byte[] newIV = new byte[32];

				Array.Copy(iv, 0, newIV, 0, iv.Length);
				Array.Copy(iv, 0, newIV, iv.Length, newIV.Length - iv.Length);

				iv = newIV;
			}

            idx = 0;
			cnt = 0;

			uint[] w = new uint[2560];

			for (int i = 0; i < 32; i++)
			{
				w[i >> 2] |= ((uint)key[i] << (8 * (i & 0x3)));
			}

			for (int i = 0; i < 32; i++)
			{
				w[(i >> 2) + 8] |= ((uint)iv[i] << (8 * (i & 0x3)));
			}

			for (uint i = 16; i < 2560; i++)
			{
				uint x = w[i - 2];
				uint y = w[i - 15];
				w[i] = (RotateRight(x, 17) ^ RotateRight(x, 19) ^ (x >> 10))
					+ w[i - 7]
					+ (RotateRight(y, 7) ^ RotateRight(y, 18) ^ (y >> 3))
					+ w[i - 16] + i;
			}

			Array.Copy(w, 512, p, 0, 1024);
			Array.Copy(w, 1536, q, 0, 1024);

			for (int i = 0; i < 4096; i++)
			{
				Step();
			}

			cnt = 0;
		}

        public virtual string AlgorithmName
		{
			get { return "HC-256"; }
		}

		/**
		* Initialise a HC-256 cipher.
		*
		* @param forEncryption whether or not we are for encryption. Irrelevant, as
		*                      encryption and decryption are the same.
		* @param params        the parameters required to set up the cipher.
		* @throws ArgumentException if the params argument is
		*                                  inappropriate (ie. the key is not 256 bit long).
		*/
        public virtual void Init(
			bool				forEncryption,
			ICipherParameters	parameters)
		{
			ICipherParameters keyParam = parameters;

			if (parameters is ParametersWithIV)
			{
				iv = ((ParametersWithIV)parameters).GetIV();
				keyParam = ((ParametersWithIV)parameters).Parameters;
			}
			else
			{
				iv = new byte[0];
			}

			if (keyParam is KeyParameter)
			{
				key = ((KeyParameter)keyParam).GetKey();
				Init();
			}
			else
			{
				throw new ArgumentException(
					"Invalid parameter passed to HC256 init - " + Platform.GetTypeName(parameters),
					"parameters");
			}

			initialised = true;
		}

		private byte[] buf = new byte[4];
		private int idx = 0;

		private byte GetByte()
		{
			if (idx == 0)
			{
				Pack.UInt32_To_LE(Step(), buf);
			}
			byte ret = buf[idx];
			idx = idx + 1 & 0x3;
			return ret;
		}

        public virtual void ProcessBytes(
			byte[]	input,
			int		inOff,
			int		len,
			byte[]	output,
			int		outOff)
		{
			if (!initialised)
				throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.DataLength(input, inOff, len, "input buffer too short");
            Check.OutputLength(output, outOff, len, "output buffer too short");

            for (int i = 0; i < len; i++)
			{
				output[outOff + i] = (byte)(input[inOff + i] ^ GetByte());
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            if (!initialised)
                throw new InvalidOperationException(AlgorithmName + " not initialised");

            Check.OutputLength(output, input.Length, "output buffer too short");

            for (int i = 0; i < input.Length; i++)
            {
                output[i] = (byte)(input[i] ^ GetByte());
            }
        }
#endif

        public virtual void Reset()
		{
			Init();
		}

        public virtual byte ReturnByte(byte input)
		{
			return (byte)(input ^ GetByte());
		}

		private static uint RotateRight(uint x, int bits)
		{
			return (x >> bits) | (x << -bits);
		}
	}
}
