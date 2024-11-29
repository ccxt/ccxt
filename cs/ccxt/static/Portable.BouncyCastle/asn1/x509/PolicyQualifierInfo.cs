using System;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * Policy qualifiers, used in the X509V3 CertificatePolicies
     * extension.
     *
     * <pre>
     *   PolicyQualifierInfo ::= Sequence {
     *       policyQualifierId  PolicyQualifierId,
     *       qualifier          ANY DEFINED BY policyQualifierId }
     * </pre>
     */
    public class PolicyQualifierInfo
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier policyQualifierId;
        private readonly Asn1Encodable qualifier;

        /**
         * Creates a new <code>PolicyQualifierInfo</code> instance.
         *
         * @param policyQualifierId a <code>PolicyQualifierId</code> value
         * @param qualifier the qualifier, defined by the above field.
         */
        public PolicyQualifierInfo(
            DerObjectIdentifier	policyQualifierId,
            Asn1Encodable		qualifier)
        {
            this.policyQualifierId = policyQualifierId;
            this.qualifier = qualifier;
        }

        /**
         * Creates a new <code>PolicyQualifierInfo</code> containing a
         * cPSuri qualifier.
         *
         * @param cps the CPS (certification practice statement) uri as a
         * <code>string</code>.
         */
        public PolicyQualifierInfo(
            string cps)
        {
            policyQualifierId = PolicyQualifierID.IdQtCps;
            qualifier = new DerIA5String(cps);
        }

        /**
         * Creates a new <code>PolicyQualifierInfo</code> instance.
         *
         * @param as <code>PolicyQualifierInfo</code> X509 structure
         * encoded as an Asn1Sequence.
         */
        private PolicyQualifierInfo(
            Asn1Sequence seq)
        {
            if (seq.Count != 2)
                throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

            policyQualifierId = DerObjectIdentifier.GetInstance(seq[0]);
            qualifier = seq[1];
        }

        public static PolicyQualifierInfo GetInstance(
            object obj)
        {
            if (obj is PolicyQualifierInfo)
                return (PolicyQualifierInfo)obj;
            if (obj == null)
                return null;
            return new PolicyQualifierInfo(Asn1Sequence.GetInstance(obj));
        }

        public virtual DerObjectIdentifier PolicyQualifierId
        {
            get { return policyQualifierId; }
        }

        public virtual Asn1Encodable Qualifier
        {
            get { return qualifier; }
        }

        /**
         * Returns a Der-encodable representation of this instance.
         *
         * @return a <code>Asn1Object</code> value
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(policyQualifierId, qualifier);
        }
    }
}
