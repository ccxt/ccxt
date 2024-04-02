using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/// <remarks>
	/// An implementation of the AES Key Wrapper from the NIST Key Wrap
	/// Specification as described in RFC 3394.
	/// <p/>
	/// For further details see: <a href="http://www.ietf.org/rfc/rfc3394.txt">http://www.ietf.org/rfc/rfc3394.txt</a>
	/// and  <a href="http://csrc.nist.gov/encryption/kms/key-wrap.pdf">http://csrc.nist.gov/encryption/kms/key-wrap.pdf</a>.
	/// </remarks>
	public class Rfc3394WrapEngine
		: IWrapper
	{
		private readonly IBlockCipher engine;

		private KeyParameter	param;
		private bool			forWrapping;

		private byte[] iv =
		{
			0xa6, 0xa6, 0xa6, 0xa6,
			0xa6, 0xa6, 0xa6, 0xa6
		};

		public Rfc3394WrapEngine(
			IBlockCipher engine)
		{
			this.engine = engine;
		}

        public virtual void Init(
			bool				forWrapping,
			ICipherParameters	parameters)
		{
			this.forWrapping = forWrapping;

			if (parameters is ParametersWithRandom)
			{
				parameters = ((ParametersWithRandom) parameters).Parameters;
			}

			if (parameters is KeyParameter)
			{
				this.param = (KeyParameter) parameters;
			}
			else if (parameters is ParametersWithIV)
			{
				ParametersWithIV pIV = (ParametersWithIV) parameters;
				byte[] iv = pIV.GetIV();

				if (iv.Length != 8)
					throw new ArgumentException("IV length not equal to 8", "parameters");

				this.iv = iv;
				this.param = (KeyParameter) pIV.Parameters;
			}
			else
			{
				// TODO Throw an exception for bad parameters?
			}
		}

        public virtual string AlgorithmName
		{
			get { return engine.AlgorithmName; }
		}

        public virtual byte[] Wrap(
			byte[]	input,
			int		inOff,
			int		inLen)
		{
			if (!forWrapping)
			{
				throw new InvalidOperationException("not set for wrapping");
			}

			int n = inLen / 8;

			if ((n * 8) != inLen)
			{
				throw new DataLengthException("wrap data must be a multiple of 8 bytes");
			}

			byte[] block = new byte[inLen + iv.Length];
			byte[] buf = new byte[8 + iv.Length];

			Array.Copy(iv, 0, block, 0, iv.Length);
			Array.Copy(input, inOff, block, iv.Length, inLen);

			engine.Init(true, param);

			for (int j = 0; j != 6; j++)
			{
				for (int i = 1; i <= n; i++)
				{
					Array.Copy(block, 0, buf, 0, iv.Length);
					Array.Copy(block, 8 * i, buf, iv.Length, 8);
					engine.ProcessBlock(buf, 0, buf, 0);

					int t = n * j + i;
					for (int k = 1; t != 0; k++)
					{
						byte v = (byte)t;

						buf[iv.Length - k] ^= v;
						t = (int) ((uint)t >> 8);
					}

					Array.Copy(buf, 0, block, 0, 8);
					Array.Copy(buf, 8, block, 8 * i, 8);
				}
			}

			return block;
		}

        public virtual byte[] Unwrap(
			byte[]  input,
			int     inOff,
			int     inLen)
		{
			if (forWrapping)
			{
				throw new InvalidOperationException("not set for unwrapping");
			}

			int n = inLen / 8;

			if ((n * 8) != inLen)
			{
				throw new InvalidCipherTextException("unwrap data must be a multiple of 8 bytes");
			}

			byte[]  block = new byte[inLen - iv.Length];
			byte[]  a = new byte[iv.Length];
			byte[]  buf = new byte[8 + iv.Length];

			Array.Copy(input, inOff, a, 0, iv.Length);
            Array.Copy(input, inOff + iv.Length, block, 0, inLen - iv.Length);

			engine.Init(false, param);

			n = n - 1;

			for (int j = 5; j >= 0; j--)
			{
				for (int i = n; i >= 1; i--)
				{
					Array.Copy(a, 0, buf, 0, iv.Length);
					Array.Copy(block, 8 * (i - 1), buf, iv.Length, 8);

					int t = n * j + i;
					for (int k = 1; t != 0; k++)
					{
						byte v = (byte)t;

						buf[iv.Length - k] ^= v;
						t = (int) ((uint)t >> 8);
					}

					engine.ProcessBlock(buf, 0, buf, 0);
					Array.Copy(buf, 0, a, 0, 8);
					Array.Copy(buf, 8, block, 8 * (i - 1), 8);
				}
			}

			if (!Arrays.ConstantTimeAreEqual(a, iv))
				throw new InvalidCipherTextException("checksum failed");

			return block;
		}
	}
}
