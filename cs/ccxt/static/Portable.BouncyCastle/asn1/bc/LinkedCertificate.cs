using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.BC
{
    /**
     * Extension to tie an alternate certificate to the containing certificate.
     * <pre>
     *     LinkedCertificate := SEQUENCE {
     *         digest        DigestInfo,                   -- digest of PQC certificate
     *         certLocation  GeneralName,                  -- location of PQC certificate
     *         certIssuer    [0] Name OPTIONAL,            -- issuer of PQC cert (if different from current certificate)
     *         cACerts       [1] GeneralNames OPTIONAL,    -- CA certificates for PQC cert (one of more locations)
     * }
     * </pre>
     */
    public class LinkedCertificate
        : Asn1Encodable
    {
        private readonly DigestInfo mDigest;
        private readonly GeneralName mCertLocation;

        private X509Name mCertIssuer;
        private GeneralNames mCACerts;

        public LinkedCertificate(DigestInfo digest, GeneralName certLocation)
            : this(digest, certLocation, null, null)
        {
        }

        public LinkedCertificate(DigestInfo digest, GeneralName certLocation, X509Name certIssuer, GeneralNames caCerts)
        {
            this.mDigest = digest;
            this.mCertLocation = certLocation;
            this.mCertIssuer = certIssuer;
            this.mCACerts = caCerts;
        }

        private LinkedCertificate(Asn1Sequence seq)
        {
            this.mDigest = DigestInfo.GetInstance(seq[0]);
            this.mCertLocation = GeneralName.GetInstance(seq[1]);

            for (int i = 2; i < seq.Count; ++i)
            {
                Asn1TaggedObject tagged =  Asn1TaggedObject.GetInstance(seq[i]);

                switch (tagged.TagNo)
                {
                case 0:
                    this.mCertIssuer = X509Name.GetInstance(tagged, false);
                    break;
                case 1:
                    this.mCACerts = GeneralNames.GetInstance(tagged, false);
                    break;
                default:
                    throw new ArgumentException("unknown tag in tagged field");
                }
            }
        }

        public static LinkedCertificate GetInstance(object obj)
        {
            if (obj is LinkedCertificate)
                return (LinkedCertificate)obj;
            if (obj != null)
                return new LinkedCertificate(Asn1Sequence.GetInstance(obj));
            return null;
        }

        public virtual DigestInfo Digest
        {
            get { return mDigest; }
        }

        public virtual GeneralName CertLocation
        {
            get { return mCertLocation; }
        }

        public virtual X509Name CertIssuer
        {
            get { return mCertIssuer; }
        }

        public virtual GeneralNames CACerts
        {
            get { return mCACerts; }
        }

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(mDigest, mCertLocation);
            v.AddOptionalTagged(false, 0, mCertIssuer);
            v.AddOptionalTagged(false, 1, mCACerts);
            return new DerSequence(v);
        }
    }
}
