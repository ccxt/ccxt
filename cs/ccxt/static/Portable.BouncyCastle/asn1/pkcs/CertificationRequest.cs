using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    /**
     * Pkcs10 Certfication request object.
     * <pre>
     * CertificationRequest ::= Sequence {
     *   certificationRequestInfo  CertificationRequestInfo,
     *   signatureAlgorithm        AlgorithmIdentifier{{ SignatureAlgorithms }},
     *   signature                 BIT STRING
     * }
     * </pre>
     */
    public class CertificationRequest
        : Asn1Encodable
    {
        protected CertificationRequestInfo	reqInfo;
        protected AlgorithmIdentifier		sigAlgId;
        protected DerBitString				sigBits;

		public static CertificationRequest GetInstance(
			object obj)
		{
            if (obj == null)
                return null;
            if (obj is CertificationRequest)
				return (CertificationRequest)obj;
            return new CertificationRequest(Asn1Sequence.GetInstance(obj));
		}

		protected CertificationRequest()
        {
        }

		public CertificationRequest(
            CertificationRequestInfo	requestInfo,
            AlgorithmIdentifier			algorithm,
            DerBitString				signature)
        {
            this.reqInfo = requestInfo;
            this.sigAlgId = algorithm;
            this.sigBits = signature;
        }

        internal CertificationRequest(Asn1Sequence seq)
        {
			if (seq.Count != 3)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			reqInfo = CertificationRequestInfo.GetInstance(seq[0]);
            sigAlgId = AlgorithmIdentifier.GetInstance(seq[1]);
            sigBits = DerBitString.GetInstance(seq[2]);
        }

		public CertificationRequestInfo GetCertificationRequestInfo()
        {
            return reqInfo;
        }

		public AlgorithmIdentifier SignatureAlgorithm
		{
			get { return sigAlgId; }
		}

		public DerBitString Signature
		{
			get { return sigBits; }
		}

        public byte[] GetSignatureOctets()
        {
            return sigBits.GetOctets();
        }

        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(reqInfo, sigAlgId, sigBits);
        }
    }
}
