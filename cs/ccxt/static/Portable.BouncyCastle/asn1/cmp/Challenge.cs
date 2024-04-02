using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class Challenge
		: Asn1Encodable
	{
		private readonly AlgorithmIdentifier owf;
		private readonly Asn1OctetString witness;
		private readonly Asn1OctetString challenge;

		private Challenge(Asn1Sequence seq)
		{
			int index = 0;

			if (seq.Count == 3)
			{
				owf = AlgorithmIdentifier.GetInstance(seq[index++]);
			}

			witness = Asn1OctetString.GetInstance(seq[index++]);
			challenge = Asn1OctetString.GetInstance(seq[index]);
		}

		public static Challenge GetInstance(object obj)
		{
			if (obj is Challenge)
				return (Challenge)obj;

			if (obj is Asn1Sequence)
				return new Challenge((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual AlgorithmIdentifier Owf
		{
			get { return owf; }
		}

		/**
		 * <pre>
		 * Challenge ::= SEQUENCE {
		 *                 owf                 AlgorithmIdentifier  OPTIONAL,
		 *
		 *                 -- MUST be present in the first Challenge; MAY be omitted in
		 *                 -- any subsequent Challenge in POPODecKeyChallContent (if
		 *                 -- omitted, then the owf used in the immediately preceding
		 *                 -- Challenge is to be used).
		 *
		 *                 witness             OCTET STRING,
		 *                 -- the result of applying the one-way function (owf) to a
		 *                 -- randomly-generated INTEGER, A.  [Note that a different
		 *                 -- INTEGER MUST be used for each Challenge.]
		 *                 challenge           OCTET STRING
		 *                 -- the encryption (under the public key for which the cert.
		 *                 -- request is being made) of Rand, where Rand is specified as
		 *                 --   Rand ::= SEQUENCE {
		 *                 --      int      INTEGER,
		 *                 --       - the randomly-generated INTEGER A (above)
		 *                 --      sender   GeneralName
		 *                 --       - the sender's name (as included in PKIHeader)
		 *                 --   }
		 *      }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();
			v.AddOptional(owf);
			v.Add(witness, challenge);
			return new DerSequence(v);
		}
	}
}
