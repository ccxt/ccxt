using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class CertTemplate
        : Asn1Encodable
    {
        private readonly Asn1Sequence seq;

        private readonly DerInteger version;
        private readonly DerInteger serialNumber;
        private readonly AlgorithmIdentifier signingAlg;
        private readonly X509Name issuer;
        private readonly OptionalValidity validity;
        private readonly X509Name subject;
        private readonly SubjectPublicKeyInfo publicKey;
        private readonly DerBitString issuerUID;
        private readonly DerBitString subjectUID;
        private readonly X509Extensions extensions;

        private CertTemplate(Asn1Sequence seq)
        {
            this.seq = seq;

            foreach (Asn1TaggedObject tObj in seq)
            {
                switch (tObj.TagNo)
                {
                case 0:
                    version = DerInteger.GetInstance(tObj, false);
                    break;
                case 1:
                    serialNumber = DerInteger.GetInstance(tObj, false);
                    break;
                case 2:
                    signingAlg = AlgorithmIdentifier.GetInstance(tObj, false);
                    break;
                case 3:
                    issuer = X509Name.GetInstance(tObj, true); // CHOICE
                    break;
                case 4:
                    validity = OptionalValidity.GetInstance(Asn1Sequence.GetInstance(tObj, false));
                    break;
                case 5:
                    subject = X509Name.GetInstance(tObj, true); // CHOICE
                    break;
                case 6:
                    publicKey = SubjectPublicKeyInfo.GetInstance(tObj, false);
                    break;
                case 7:
                    issuerUID = DerBitString.GetInstance(tObj, false);
                    break;
                case 8:
                    subjectUID = DerBitString.GetInstance(tObj, false);
                    break;
                case 9:
                    extensions = X509Extensions.GetInstance(tObj, false);
                    break;
                default:
                    throw new ArgumentException("unknown tag: " + tObj.TagNo, "seq");
                }
            }
        }

        public static CertTemplate GetInstance(object obj)
        {
            if (obj is CertTemplate)
                return (CertTemplate)obj;

            if (obj != null)
                return new CertTemplate(Asn1Sequence.GetInstance(obj));

            return null;
        }

        public virtual int Version
        {
            get { return version.IntValueExact; }
        }

        public virtual DerInteger SerialNumber
        {
            get { return serialNumber; }
        }

        public virtual AlgorithmIdentifier SigningAlg
        {
            get { return signingAlg; }
        }

        public virtual X509Name Issuer
        {
            get { return issuer; }
        }

        public virtual OptionalValidity Validity
        {
            get { return validity; }
        }

        public virtual X509Name Subject
        {
            get { return subject; }
        }

        public virtual SubjectPublicKeyInfo PublicKey
        {
            get { return publicKey; }
        }

        public virtual DerBitString IssuerUID
        {
            get { return issuerUID; }
        }

        public virtual DerBitString SubjectUID
        {
            get { return subjectUID; }
        }

        public virtual X509Extensions Extensions
        {
            get { return extensions; }
        }

        /**
         * <pre>
         *  CertTemplate ::= SEQUENCE {
         *      version      [0] Version               OPTIONAL,
         *      serialNumber [1] INTEGER               OPTIONAL,
         *      signingAlg   [2] AlgorithmIdentifier   OPTIONAL,
         *      issuer       [3] Name                  OPTIONAL,
         *      validity     [4] OptionalValidity      OPTIONAL,
         *      subject      [5] Name                  OPTIONAL,
         *      publicKey    [6] SubjectPublicKeyInfo  OPTIONAL,
         *      issuerUID    [7] UniqueIdentifier      OPTIONAL,
         *      subjectUID   [8] UniqueIdentifier      OPTIONAL,
         *      extensions   [9] Extensions            OPTIONAL }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return seq;
        }
    }
}
