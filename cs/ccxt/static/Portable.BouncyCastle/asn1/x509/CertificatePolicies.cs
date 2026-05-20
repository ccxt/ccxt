using System;
using System.Text;

namespace Org.BouncyCastle.Asn1.X509
{
    public class CertificatePolicies
        : Asn1Encodable
    {
        private static PolicyInformation[] Copy(PolicyInformation[] policyInfo)
        {
            return (PolicyInformation[])policyInfo.Clone();
        }

        public static CertificatePolicies GetInstance(object obj)
        {
            if (obj is CertificatePolicies)
                return (CertificatePolicies)obj;
            if (obj == null)
                return null;
            return new CertificatePolicies(Asn1Sequence.GetInstance(obj));
        }

        public static CertificatePolicies GetInstance(Asn1TaggedObject obj, bool isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

        public static CertificatePolicies FromExtensions(X509Extensions extensions)
        {
            return GetInstance(X509Extensions.GetExtensionParsedValue(extensions, X509Extensions.CertificatePolicies));
        }

        private readonly PolicyInformation[] policyInformation;

        /**
         * Construct a CertificatePolicies object containing one PolicyInformation.
         * 
         * @param name the name to be contained.
         */
        public CertificatePolicies(PolicyInformation name)
        {
            this.policyInformation = new PolicyInformation[] { name };
        }

        public CertificatePolicies(PolicyInformation[] policyInformation)
        {
            this.policyInformation = Copy(policyInformation);
        }

        private CertificatePolicies(Asn1Sequence seq)
        {
            this.policyInformation = new PolicyInformation[seq.Count];

            for (int i = 0; i < seq.Count; ++i)
            {
                policyInformation[i] = PolicyInformation.GetInstance(seq[i]);
            }
        }

        public virtual PolicyInformation[] GetPolicyInformation()
        {
            return Copy(policyInformation);
        }

        public virtual PolicyInformation GetPolicyInformation(DerObjectIdentifier policyIdentifier)
        {
            for (int i = 0; i != policyInformation.Length; i++)
            {
                if (policyIdentifier.Equals(policyInformation[i].PolicyIdentifier))
                {
                    return policyInformation[i];
                }
            }

            return null;
        }

        /**
         * Produce an object suitable for an ASN1OutputStream.
         * <pre>
         * CertificatePolicies ::= SEQUENCE SIZE {1..MAX} OF PolicyInformation
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(policyInformation);
        }

        public override string ToString()
        {
            StringBuilder sb = new StringBuilder("CertificatePolicies:");
            if (policyInformation != null && policyInformation.Length > 0)
            {
                sb.Append(' ');
                sb.Append(policyInformation[0]);
                for (int i = 1; i < policyInformation.Length; ++i)
                {
                    sb.Append(", ");
                    sb.Append(policyInformation[i]);
                }
            }
            return sb.ToString();
        }
    }
}
