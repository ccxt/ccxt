using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Base class for an RSA public key.</remarks>
	public class RsaPublicBcpgKey
		: BcpgObject, IBcpgKey
	{
		private readonly MPInteger n, e;

		/// <summary>Construct an RSA public key from the passed in stream.</summary>
		public RsaPublicBcpgKey(
			BcpgInputStream bcpgIn)
		{
			this.n = new MPInteger(bcpgIn);
			this.e = new MPInteger(bcpgIn);
		}

		/// <param name="n">The modulus.</param>
		/// <param name="e">The public exponent.</param>
		public RsaPublicBcpgKey(
			BigInteger	n,
			BigInteger	e)
		{
			this.n = new MPInteger(n);
			this.e = new MPInteger(e);
		}

		public BigInteger PublicExponent
		{
			get { return e.Value; }
		}

		public BigInteger Modulus
		{
			get { return n.Value; }
		}

		/// <summary>The format, as a string, always "PGP".</summary>
		public string Format
		{
			get { return "PGP"; }
		}

		/// <summary>Return the standard PGP encoding of the key.</summary>
		public override byte[] GetEncoded()
		{
			try
			{
				return base.GetEncoded();
			}
			catch (Exception)
			{
				return null;
			}
		}

		public override void Encode(
			BcpgOutputStream bcpgOut)
		{
			bcpgOut.WriteObjects(n, e);
		}
	}
}
