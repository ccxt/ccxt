using System;

namespace Org.BouncyCastle.Asn1.Cms
{
    /**
     * a signed data object.
     */
    public class SignedData
        : Asn1Encodable
    {
        private static readonly DerInteger Version1 = new DerInteger(1);
        private static readonly DerInteger Version3 = new DerInteger(3);
        private static readonly DerInteger Version4 = new DerInteger(4);
        private static readonly DerInteger Version5 = new DerInteger(5);

        private readonly DerInteger		version;
        private readonly Asn1Set		digestAlgorithms;
        private readonly ContentInfo	contentInfo;
        private readonly Asn1Set		certificates;
        private readonly Asn1Set		crls;
        private readonly Asn1Set		signerInfos;
        private readonly bool			certsBer;
        private readonly bool		    crlsBer;

        public static SignedData GetInstance(object obj)
        {
            if (obj is SignedData)
                return (SignedData)obj;
            if (obj == null)
                return null;
            return new SignedData(Asn1Sequence.GetInstance(obj));
        }

        public SignedData(
            Asn1Set     digestAlgorithms,
            ContentInfo contentInfo,
            Asn1Set     certificates,
            Asn1Set     crls,
            Asn1Set     signerInfos)
        {
            this.version = CalculateVersion(contentInfo.ContentType, certificates, crls, signerInfos);
            this.digestAlgorithms = digestAlgorithms;
            this.contentInfo = contentInfo;
            this.certificates = certificates;
            this.crls = crls;
            this.signerInfos = signerInfos;
            this.crlsBer = crls is BerSet;
            this.certsBer = certificates is BerSet;
        }

        // RFC3852, section 5.1:
        // IF ((certificates is present) AND
        //    (any certificates with a type of other are present)) OR
        //    ((crls is present) AND
        //    (any crls with a type of other are present))
        // THEN version MUST be 5
        // ELSE
        //    IF (certificates is present) AND
        //       (any version 2 attribute certificates are present)
        //    THEN version MUST be 4
        //    ELSE
        //       IF ((certificates is present) AND
        //          (any version 1 attribute certificates are present)) OR
        //          (any SignerInfo structures are version 3) OR
        //          (encapContentInfo eContentType is other than id-data)
        //       THEN version MUST be 3
        //       ELSE version MUST be 1
        //
        private DerInteger CalculateVersion(
            DerObjectIdentifier	contentOid,
            Asn1Set				certs,
            Asn1Set				crls,
            Asn1Set				signerInfs)
        {
            bool otherCert = false;
            bool otherCrl = false;
            bool attrCertV1Found = false;
            bool attrCertV2Found = false;

            if (certs != null)
            {
                foreach (object obj in certs)
                {
                    if (obj is Asn1TaggedObject)
                    {
                        Asn1TaggedObject tagged = (Asn1TaggedObject)obj;

                        if (tagged.TagNo == 1)
                        {
                            attrCertV1Found = true;
                        }
                        else if (tagged.TagNo == 2)
                        {
                            attrCertV2Found = true;
                        }
                        else if (tagged.TagNo == 3)
                        {
                            otherCert = true;
                            break;
                        }
                    }
                }
            }

            if (otherCert)
            {
                return Version5;
            }

            if (crls != null)
            {
                foreach (object obj in crls)
                {
                    if (obj is Asn1TaggedObject)
                    {
                        otherCrl = true;
                        break;
                    }
                }
            }

            if (otherCrl)
            {
                return Version5;
            }

            if (attrCertV2Found)
            {
                return Version4;
            }

            if (attrCertV1Found || !CmsObjectIdentifiers.Data.Equals(contentOid) || CheckForVersion3(signerInfs))
            {
                return Version3;
            }

            return Version1;
        }

        private bool CheckForVersion3(Asn1Set signerInfs)
        {
            foreach (object obj in signerInfs)
            {
                SignerInfo s = SignerInfo.GetInstance(obj);

                if (s.Version.HasValue(3))
                {
                    return true;
                }
            }

            return false;
        }

        private SignedData(Asn1Sequence seq)
        {
            var e = seq.GetEnumerator();

            e.MoveNext();
            version = (DerInteger)e.Current;

            e.MoveNext();
            digestAlgorithms = (Asn1Set)e.Current.ToAsn1Object();

            e.MoveNext();
            contentInfo = ContentInfo.GetInstance(e.Current.ToAsn1Object());

            while (e.MoveNext())
            {
                Asn1Object o = e.Current.ToAsn1Object();

                //
                // an interesting feature of SignedData is that there appear
                // to be varying implementations...
                // for the moment we ignore anything which doesn't fit.
                //
                if (o is Asn1TaggedObject tagged)
                {
                    switch (tagged.TagNo)
                    {
                    case 0:
                        certsBer = tagged is BerTaggedObject;
                        certificates = Asn1Set.GetInstance(tagged, false);
                        break;
                    case 1:
                        crlsBer = tagged is BerTaggedObject;
                        crls = Asn1Set.GetInstance(tagged, false);
                        break;
                    default:
                        throw new ArgumentException("unknown tag value " + tagged.TagNo);
                    }
                }
                else
                {
                    signerInfos = (Asn1Set) o;
                }
            }
        }

        public DerInteger Version
        {
            get { return version; }
        }

        public Asn1Set DigestAlgorithms
        {
            get { return digestAlgorithms; }
        }

        public ContentInfo EncapContentInfo
        {
            get { return contentInfo; }
        }

        public Asn1Set Certificates
        {
            get { return certificates; }
        }

        public Asn1Set CRLs
        {
            get { return crls; }
        }

        public Asn1Set SignerInfos
        {
            get { return signerInfos; }
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * SignedData ::= Sequence {
         *     version CMSVersion,
         *     digestAlgorithms DigestAlgorithmIdentifiers,
         *     encapContentInfo EncapsulatedContentInfo,
         *     certificates [0] IMPLICIT CertificateSet OPTIONAL,
         *     crls [1] IMPLICIT CertificateRevocationLists OPTIONAL,
         *     signerInfos SignerInfos
         *   }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(
                version, digestAlgorithms, contentInfo);

            if (certificates != null)
            {
                if (certsBer)
                {
                    v.Add(new BerTaggedObject(false, 0, certificates));
                }
                else
                {
                    v.Add(new DerTaggedObject(false, 0, certificates));
                }
            }

            if (crls != null)
            {
                if (crlsBer)
                {
                    v.Add(new BerTaggedObject(false, 1, crls));
                }
                else
                {
                    v.Add(new DerTaggedObject(false, 1, crls));
                }
            }

            v.Add(signerInfos);

            return new BerSequence(v);
        }
    }
}
