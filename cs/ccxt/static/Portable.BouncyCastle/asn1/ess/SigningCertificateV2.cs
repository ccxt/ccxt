using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ess
{
    public class SigningCertificateV2
        : Asn1Encodable
    {
        private readonly Asn1Sequence certs;
        private readonly Asn1Sequence policies;

        public static SigningCertificateV2 GetInstance(
            object o)
        {
            if (o == null || o is SigningCertificateV2)
                return (SigningCertificateV2) o;

            if (o is Asn1Sequence)
                return new SigningCertificateV2((Asn1Sequence) o);

            throw new ArgumentException(
                "unknown object in 'SigningCertificateV2' factory : "
                + Platform.GetTypeName(o) + ".");
        }

        private SigningCertificateV2(
            Asn1Sequence seq)
        {
            if (seq.Count < 1 || seq.Count > 2)
                throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

            this.certs = Asn1Sequence.GetInstance(seq[0].ToAsn1Object());

            if (seq.Count > 1)
            {
                this.policies = Asn1Sequence.GetInstance(seq[1].ToAsn1Object());
            }
        }

        public SigningCertificateV2(
            EssCertIDv2 cert)
        {
            this.certs = new DerSequence(cert);
        }

        public SigningCertificateV2(
            EssCertIDv2[] certs)
        {
            this.certs = new DerSequence(certs);
        }

        public SigningCertificateV2(
            EssCertIDv2[]		certs,
            PolicyInformation[]	policies)
        {
            this.certs = new DerSequence(certs);

            if (policies != null)
            {
                this.policies = new DerSequence(policies);
            }
        }

        public EssCertIDv2[] GetCerts()
        {
            EssCertIDv2[] certIds = new EssCertIDv2[certs.Count];
            for (int i = 0; i != certs.Count; i++)
            {
                certIds[i] = EssCertIDv2.GetInstance(certs[i]);
            }
            return certIds;
        }

        public PolicyInformation[] GetPolicies()
        {
            if (policies == null)
                return null;

            PolicyInformation[] policyInformations = new PolicyInformation[policies.Count];
            for (int i = 0; i != policies.Count; i++)
            {
                policyInformations[i] = PolicyInformation.GetInstance(policies[i]);
            }
            return policyInformations;
        }

        /**
         * The definition of SigningCertificateV2 is
         * <pre>
         * SigningCertificateV2 ::=  SEQUENCE {
         *      certs        SEQUENCE OF EssCertIDv2,
         *      policies     SEQUENCE OF PolicyInformation OPTIONAL
         * }
         * </pre>
         * id-aa-signingCertificateV2 OBJECT IDENTIFIER ::= { iso(1)
         *    member-body(2) us(840) rsadsi(113549) pkcs(1) pkcs9(9)
         *    smime(16) id-aa(2) 47 }
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(certs);
            v.AddOptional(policies);
            return new DerSequence(v);
        }
    }
}
