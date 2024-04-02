using System;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    /**
     * a Pkcs#7 signed data object.
     */
    public class SignedData
        : Asn1Encodable
    {
        private readonly DerInteger		version;
        private readonly Asn1Set		digestAlgorithms;
        private readonly ContentInfo	contentInfo;
        private readonly Asn1Set		certificates;
        private readonly Asn1Set		crls;
        private readonly Asn1Set		signerInfos;

        public static SignedData GetInstance(object obj)
        {
            if (obj == null)
                return null;
            SignedData existing = obj as SignedData;
            if (existing != null)
                return existing;
            return new SignedData(Asn1Sequence.GetInstance(obj));
        }

        public SignedData(
            DerInteger        _version,
            Asn1Set           _digestAlgorithms,
            ContentInfo       _contentInfo,
            Asn1Set           _certificates,
            Asn1Set           _crls,
            Asn1Set           _signerInfos)
        {
            version          = _version;
            digestAlgorithms = _digestAlgorithms;
            contentInfo      = _contentInfo;
            certificates     = _certificates;
            crls             = _crls;
            signerInfos      = _signerInfos;
        }

        private SignedData(
            Asn1Sequence seq)
        {
            var e = seq.GetEnumerator();

            e.MoveNext();
            version = (DerInteger) e.Current;

            e.MoveNext();
            digestAlgorithms = (Asn1Set) e.Current;

            e.MoveNext();
            contentInfo = ContentInfo.GetInstance(e.Current);

            while (e.MoveNext())
            {
                Asn1Object o = e.Current.ToAsn1Object();

                //
                // an interesting feature of SignedData is that there appear to be varying implementations...
                // for the moment we ignore anything which doesn't fit.
                //
                if (o is Asn1TaggedObject tagged)
                {
                    switch (tagged.TagNo)
                    {
                    case 0:
                        certificates = Asn1Set.GetInstance(tagged, false);
                        break;
                    case 1:
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

        public ContentInfo ContentInfo
        {
            get { return contentInfo; }
        }

        public Asn1Set Certificates
        {
            get { return certificates; }
        }

        public Asn1Set Crls
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
         *  SignedData ::= Sequence {
         *      version Version,
         *      digestAlgorithms DigestAlgorithmIdentifiers,
         *      contentInfo ContentInfo,
         *      certificates
         *          [0] IMPLICIT ExtendedCertificatesAndCertificates
         *                   OPTIONAL,
         *      crls
         *          [1] IMPLICIT CertificateRevocationLists OPTIONAL,
         *      signerInfos SignerInfos }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(version, digestAlgorithms, contentInfo);
            v.AddOptionalTagged(false, 0, certificates);
            v.AddOptionalTagged(false, 1, crls);
            v.Add(signerInfos);
            return new BerSequence(v);
        }
    }
}
