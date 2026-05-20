using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Pkcs
{
	public class PbeParameter
		: Asn1Encodable
	{
		private readonly Asn1OctetString	salt;
		private readonly DerInteger			iterationCount;

		public static PbeParameter GetInstance(object obj)
		{
			if (obj is PbeParameter || obj == null)
			{
				return (PbeParameter) obj;
			}

			if (obj is Asn1Sequence)
			{
				return new PbeParameter((Asn1Sequence) obj);
			}

			throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		private PbeParameter(Asn1Sequence seq)
		{
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			salt = Asn1OctetString.GetInstance(seq[0]);
			iterationCount = DerInteger.GetInstance(seq[1]);
		}

		public PbeParameter(byte[] salt, int iterationCount)
		{
			this.salt = new DerOctetString(salt);
			this.iterationCount = new DerInteger(iterationCount);
		}

		public byte[] GetSalt()
		{
			return salt.GetOctets();
		}

		public BigInteger IterationCount
		{
			get { return iterationCount.Value; }
		}

		public override Asn1Object ToAsn1Object()
		{
			return new DerSequence(salt, iterationCount);
		}
	}
}
