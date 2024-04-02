using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Base class for an ElGamal public key.</remarks>
	public class ElGamalPublicBcpgKey
		: BcpgObject, IBcpgKey
	{
		internal MPInteger p, g, y;

		public ElGamalPublicBcpgKey(
			BcpgInputStream bcpgIn)
		{
			this.p = new MPInteger(bcpgIn);
			this.g = new MPInteger(bcpgIn);
			this.y = new MPInteger(bcpgIn);
		}

		public ElGamalPublicBcpgKey(
			BigInteger p,
			BigInteger g,
			BigInteger y)
		{
			this.p = new MPInteger(p);
			this.g = new MPInteger(g);
			this.y = new MPInteger(y);
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

		public BigInteger P
		{
			get { return p.Value; }
		}

		public BigInteger G
		{
			get { return g.Value; }
		}

		public BigInteger Y
		{
			get { return y.Value; }
		}

		public override void Encode(
			BcpgOutputStream bcpgOut)
		{
			bcpgOut.WriteObjects(p, g, y);
		}
	}
}
