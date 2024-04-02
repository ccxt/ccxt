using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Base class for an ElGamal secret key.</remarks>
	public class ElGamalSecretBcpgKey
		: BcpgObject, IBcpgKey
	{
		internal MPInteger x;

		/**
		* @param in
		*/
		public ElGamalSecretBcpgKey(
			BcpgInputStream bcpgIn)
		{
			this.x = new MPInteger(bcpgIn);
		}

		/**
		* @param x
		*/
		public ElGamalSecretBcpgKey(
			BigInteger x)
		{
			this.x = new MPInteger(x);
		}

		/// <summary>The format, as a string, always "PGP".</summary>
		public string Format
		{
			get { return "PGP"; }
		}

		public BigInteger X
		{
			get { return x.Value; }
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
			bcpgOut.WriteObject(x);
		}
	}
}
