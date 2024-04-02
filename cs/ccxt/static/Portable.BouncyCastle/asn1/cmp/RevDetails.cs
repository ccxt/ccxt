using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class RevDetails
		: Asn1Encodable
	{
		private readonly CertTemplate certDetails;
		private readonly X509Extensions crlEntryDetails;

        private RevDetails(Asn1Sequence seq)
		{
			certDetails = CertTemplate.GetInstance(seq[0]);
            crlEntryDetails = seq.Count <= 1
                ?   null
                :   X509Extensions.GetInstance(seq[1]);
		}

        public static RevDetails GetInstance(object obj)
		{
			if (obj is RevDetails)
				return (RevDetails)obj;

			if (obj is Asn1Sequence)
				return new RevDetails((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public RevDetails(CertTemplate certDetails)
            :   this(certDetails, null)
		{
		}

        public RevDetails(CertTemplate certDetails, X509Extensions crlEntryDetails)
		{
            this.certDetails = certDetails;
            this.crlEntryDetails = crlEntryDetails;
		}

        public virtual CertTemplate CertDetails
		{
			get { return certDetails; }
		}

        public virtual X509Extensions CrlEntryDetails
		{
			get { return crlEntryDetails; }
		}

		/**
		* <pre>
		* RevDetails ::= SEQUENCE {
		*                  certDetails         CertTemplate,
		*                   -- allows requester to specify as much as they can about
		*                   -- the cert. for which revocation is requested
		*                   -- (e.g., for cases in which serialNumber is not available)
		*                   crlEntryDetails     Extensions       OPTIONAL
		*                   -- requested crlEntryExtensions
		*             }
		* </pre>
		* @return a basic ASN.1 object representation.
		*/
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(certDetails);
			v.AddOptional(crlEntryDetails);
			return new DerSequence(v);
		}
	}
}
