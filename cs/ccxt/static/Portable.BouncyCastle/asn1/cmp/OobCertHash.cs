using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class OobCertHash
		: Asn1Encodable
	{
		private readonly AlgorithmIdentifier hashAlg;
		private readonly CertId certId;
		private readonly DerBitString  hashVal;

		private OobCertHash(Asn1Sequence seq)
		{
			int index = seq.Count - 1;

			hashVal = DerBitString.GetInstance(seq[index--]);

			for (int i = index; i >= 0; i--)
			{
				Asn1TaggedObject tObj = (Asn1TaggedObject)seq[i];

				if (tObj.TagNo == 0)
				{
					hashAlg = AlgorithmIdentifier.GetInstance(tObj, true);
				}
				else
				{
					certId = CertId.GetInstance(tObj, true);
				}
			}
		}

		public static OobCertHash GetInstance(object obj)
		{
			if (obj is OobCertHash)
				return (OobCertHash)obj;

			if (obj is Asn1Sequence)
				return new OobCertHash((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}
		
		public virtual AlgorithmIdentifier HashAlg
		{
			get { return hashAlg; }
		}
		
		public virtual CertId CertID
		{
			get { return certId; }
		}
		
		/**
		 * <pre>
		 * OobCertHash ::= SEQUENCE {
		 *                      hashAlg     [0] AlgorithmIdentifier     OPTIONAL,
		 *                      certId      [1] CertId                  OPTIONAL,
		 *                      hashVal         BIT STRING
		 *                      -- hashVal is calculated over the Der encoding of the
		 *                      -- self-signed certificate with the identifier certID.
		 *       }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, hashAlg);
            v.AddOptionalTagged(true, 1, certId);
			v.Add(hashVal);
			return new DerSequence(v);
		}
	}
}
