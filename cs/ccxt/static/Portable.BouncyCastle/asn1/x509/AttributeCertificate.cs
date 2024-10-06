using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.X509
{
    public class AttributeCertificate
        : Asn1Encodable
    {
        private readonly AttributeCertificateInfo	acinfo;
        private readonly AlgorithmIdentifier		signatureAlgorithm;
        private readonly DerBitString				signatureValue;

		/**
         * @param obj
         * @return
         */
        public static AttributeCertificate GetInstance(
			object obj)
        {
            if (obj is AttributeCertificate)
                return (AttributeCertificate) obj;

			if (obj != null)
				return new AttributeCertificate(Asn1Sequence.GetInstance(obj));

			return null;
		}

		public AttributeCertificate(
            AttributeCertificateInfo	acinfo,
            AlgorithmIdentifier			signatureAlgorithm,
            DerBitString				signatureValue)
        {
            this.acinfo = acinfo;
            this.signatureAlgorithm = signatureAlgorithm;
            this.signatureValue = signatureValue;
        }

		private AttributeCertificate(
            Asn1Sequence seq)
        {
			if (seq.Count != 3)
				throw new ArgumentException("Bad sequence size: " + seq.Count);

			this.acinfo = AttributeCertificateInfo.GetInstance(seq[0]);
            this.signatureAlgorithm = AlgorithmIdentifier.GetInstance(seq[1]);
            this.signatureValue = DerBitString.GetInstance(seq[2]);
        }

		public AttributeCertificateInfo ACInfo
		{
			get { return acinfo; }
		}

		public AlgorithmIdentifier SignatureAlgorithm
		{
			get { return signatureAlgorithm; }
		}

		public DerBitString SignatureValue
		{
			get { return signatureValue; }
		}

        public byte[] GetSignatureOctets()
        {
            return signatureValue.GetOctets();
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  AttributeCertificate ::= Sequence {
         *       acinfo               AttributeCertificateInfo,
         *       signatureAlgorithm   AlgorithmIdentifier,
         *       signatureValue       BIT STRING
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(acinfo, signatureAlgorithm, signatureValue);
        }
    }
}
