using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
	/// <summary>
	/// Implementation of the Skein parameterised hash function in 256, 512 and 1024 bit block sizes,
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
	public class SkeinDigest
		: IDigest, IMemoable
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
		/// Constructs a Skein digest with an internal state size and output size.
		/// </summary>
		/// <param name="stateSizeBits">the internal state size in bits - one of <see cref="SKEIN_256"/> <see cref="SKEIN_512"/> or
		///                       <see cref="SKEIN_1024"/>.</param>
		/// <param name="digestSizeBits">the output/digest size to produce in bits, which must be an integral number of
		///                      bytes.</param>
		public SkeinDigest(int stateSizeBits, int digestSizeBits)
		{
			this.engine = new SkeinEngine(stateSizeBits, digestSizeBits);
			Init(null);
		}

		public SkeinDigest(SkeinDigest digest)
		{
			this.engine = new SkeinEngine(digest.engine);
		}

		public void Reset(IMemoable other)
		{
			SkeinDigest d = (SkeinDigest)other;
			engine.Reset(d.engine);
		}

		public IMemoable Copy()
		{
			return new SkeinDigest(this);
		}

		public string AlgorithmName
		{
			get { return "Skein-" + (engine.BlockSize * 8) + "-" + (engine.OutputSize * 8); }
		}

		public int GetDigestSize()
		{
			return engine.OutputSize;
		}

		public int GetByteLength()
		{
			return engine.BlockSize;
		}

		/// <summary>
		/// Optionally initialises the Skein digest with the provided parameters.
		/// </summary>
		/// See <see cref="Org.BouncyCastle.Crypto.Parameters.SkeinParameters"></see> for details on the parameterisation of the Skein hash function.
		/// <param name="parameters">the parameters to apply to this engine, or <code>null</code> to use no parameters.</param>
		public void Init(SkeinParameters parameters)
		{
			engine.Init(parameters);
		}

		public void Reset()
		{
			engine.Reset();
		}

		public void Update(byte inByte)
		{
			engine.Update(inByte);
		}

		public void BlockUpdate(byte[] inBytes, int inOff, int len)
		{
			engine.BlockUpdate(inBytes, inOff, len);
		}

		public int DoFinal(byte[] outBytes, int outOff)
		{
			return engine.DoFinal(outBytes, outOff);
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            engine.BlockUpdate(input);
        }

        public int DoFinal(Span<byte> output)
        {
            return engine.DoFinal(output);
        }
#endif
    }
}
