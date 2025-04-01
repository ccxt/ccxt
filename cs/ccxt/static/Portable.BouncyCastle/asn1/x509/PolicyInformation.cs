using System;

namespace Org.BouncyCastle.Asn1.X509
{
    public class PolicyInformation
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier	policyIdentifier;
        private readonly Asn1Sequence			policyQualifiers;

		private PolicyInformation(
            Asn1Sequence seq)
        {
			if (seq.Count < 1 || seq.Count > 2)
			{
				throw new ArgumentException("Bad sequence size: " + seq.Count);
			}

			policyIdentifier = DerObjectIdentifier.GetInstance(seq[0]);

			if (seq.Count > 1)
			{
				policyQualifiers = Asn1Sequence.GetInstance(seq[1]);
			}
        }

		public PolicyInformation(
            DerObjectIdentifier policyIdentifier)
        {
            this.policyIdentifier = policyIdentifier;
        }

		public PolicyInformation(
            DerObjectIdentifier	policyIdentifier,
            Asn1Sequence		policyQualifiers)
        {
            this.policyIdentifier = policyIdentifier;
            this.policyQualifiers = policyQualifiers;
        }

		public static PolicyInformation GetInstance(
            object obj)
        {
            if (obj == null || obj is PolicyInformation)
            {
                return (PolicyInformation) obj;
            }

			return new PolicyInformation(Asn1Sequence.GetInstance(obj));
        }

		public DerObjectIdentifier PolicyIdentifier
		{
			get { return policyIdentifier; }
		}

		public Asn1Sequence PolicyQualifiers
		{
			get { return policyQualifiers; }
		}

		/*
         * PolicyInformation ::= Sequence {
         *      policyIdentifier   CertPolicyId,
         *      policyQualifiers   Sequence SIZE (1..MAX) OF
         *              PolicyQualifierInfo OPTIONAL }
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(policyIdentifier);
            v.AddOptional(policyQualifiers);
            return new DerSequence(v);
        }
    }
}
