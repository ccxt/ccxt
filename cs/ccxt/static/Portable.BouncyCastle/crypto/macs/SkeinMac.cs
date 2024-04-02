using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Macs
{

	/// <summary>
	/// Implementation of the Skein parameterised MAC function in 256, 512 and 1024 bit block sizes,
	/// based on the <see cref="Org.BouncyCastle.Crypto.Engines.ThreefishEngine">Threefish</see> tweakable block cipher.
	/// </summary>
	/// <remarks>
	/// This is the 1.3 version of Skein defined in the Skein hash function submission to the NIST SHA-3
	/// competition in October 2010.
	/// <p/>
	/// Skein was designed by Niels Ferguson - Stefan Lucks - Bruce Schneier - Doug Whiting - Mihir
	/// Bellare - Tadayoshi Kohno - Jon Callas - Jesse Walker.
	/// </remarks>
	/// <seealso cref="Org.BouncyCastle.Crypto.Digests.SkeinEngine"/>
	/// <seealso cref="Org.BouncyCastle.Crypto.Parameters.SkeinParameters"/>
	public class SkeinMac
		: IMac
	{
		/// <summary>
		/// 256 bit block size - Skein-256
		/// </summary>
		public const int SKEIN_256 = SkeinEngine.SKEIN_256;
		/// <summary>
		/// 512 bit block size - Skein-512
		/// </summary>
		public const int SKEIN_512 = SkeinEngine.SKEIN_512;
		/// <summary>
		/// 1024 bit block size - Skein-1024
		/// </summary>
		public const int SKEIN_1024 = SkeinEngine.SKEIN_1024;

		private readonly SkeinEngine engine;

		/// <summary>
		/// Constructs a Skein MAC with an internal state size and output size.
		/// </summary>
		/// <param name="stateSizeBits">the internal state size in bits - one of <see cref="SKEIN_256"/> <see cref="SKEIN_512"/> or
		///                       <see cref="SKEIN_1024"/>.</param>
		/// <param name="digestSizeBits">the output/MAC size to produce in bits, which must be an integral number of
		///                      bytes.</param>
		public SkeinMac(int stateSizeBits, int digestSizeBits)
		{
			this.engine = new SkeinEngine(stateSizeBits, digestSizeBits);
		}

		public SkeinMac(SkeinMac mac)
		{
			this.engine = new SkeinEngine(mac.engine);
		}

		public string AlgorithmName
		{
			get { return "Skein-MAC-" + (engine.BlockSize * 8) + "-" + (engine.OutputSize * 8); }
		}

		/// <summary>
		/// Optionally initialises the Skein digest with the provided parameters.
		/// </summary>
		/// See <see cref="Org.BouncyCastle.Crypto.Parameters.SkeinParameters"></see> for details on the parameterisation of the Skein hash function.
		/// <param name="parameters">the parameters to apply to this engine, or <code>null</code> to use no parameters.</param>
		public void Init(ICipherParameters parameters)
		{
			SkeinParameters skeinParameters;
			if (parameters is SkeinParameters)
			{
				skeinParameters = (SkeinParameters)parameters;
			}
			else if (parameters is KeyParameter)
			{
				skeinParameters = new SkeinParameters.Builder().SetKey(((KeyParameter)parameters).GetKey()).Build();
			}
			else
			{
				throw new ArgumentException("Invalid parameter passed to Skein MAC init - "
                    + Platform.GetTypeName(parameters));
			}
			if (skeinParameters.GetKey() == null)
			{
				throw new ArgumentException("Skein MAC requires a key parameter.");
			}
			engine.Init(skeinParameters);
		}

		public int GetMacSize()
		{
			return engine.OutputSize;
		}

		public void Reset()
		{
			engine.Reset();
		}

		public void Update(byte inByte)
		{
			engine.Update(inByte);
		}

		public void BlockUpdate(byte[] input, int inOff, int len)
		{
			engine.BlockUpdate(input, inOff, len);
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public void BlockUpdate(ReadOnlySpan<byte> input)
		{
			engine.BlockUpdate(input);
		}
#endif

		public int DoFinal(byte[] output, int outOff)
		{
			return engine.DoFinal(output, outOff);
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public int DoFinal(Span<byte> output)
		{
			return engine.DoFinal(output);
		}
#endif
	}
}
