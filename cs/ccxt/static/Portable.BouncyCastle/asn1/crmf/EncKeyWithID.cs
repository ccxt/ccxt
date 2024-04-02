using System;

using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class EncKeyWithID
        : Asn1Encodable
    {
        private readonly PrivateKeyInfo privKeyInfo;
        private readonly Asn1Encodable identifier;

        public static EncKeyWithID GetInstance(object obj)
        {
            if (obj is EncKeyWithID)
                return (EncKeyWithID)obj;

            if (obj != null)
                return new EncKeyWithID(Asn1Sequence.GetInstance(obj));

            return null;
        }

        private EncKeyWithID(Asn1Sequence seq)
        {
            this.privKeyInfo = PrivateKeyInfo.GetInstance(seq[0]);

            if (seq.Count > 1)
            {
                if (!(seq[1] is DerUtf8String))
                {
                    this.identifier = GeneralName.GetInstance(seq[1]);
                }
                else
                {
                    this.identifier = (Asn1Encodable)seq[1];
                }
            }
            else
            {
                this.identifier = null;
            }
        }

        public EncKeyWithID(PrivateKeyInfo privKeyInfo)
        {
            this.privKeyInfo = privKeyInfo;
            this.identifier = null;
        }

        public EncKeyWithID(PrivateKeyInfo privKeyInfo, DerUtf8String str)
        {
            this.privKeyInfo = privKeyInfo;
            this.identifier = str;
        }

        public EncKeyWithID(PrivateKeyInfo privKeyInfo, GeneralName generalName)
        {
            this.privKeyInfo = privKeyInfo;
            this.identifier = generalName;
        }

        public virtual PrivateKeyInfo PrivateKey
        {
            get { return privKeyInfo; }
        }

        public virtual bool HasIdentifier
        {
            get { return identifier != null; }
        }

        public virtual bool IsIdentifierUtf8String
        {
            get { return identifier is DerUtf8String; }
        }

        public virtual Asn1Encodable Identifier
        {
            get { return identifier; }
        }

        /**
         * <pre>
         * EncKeyWithID ::= SEQUENCE {
         *      privateKey           PrivateKeyInfo,
         *      identifier CHOICE {
         *         string               UTF8String,
         *         generalName          GeneralName
         *     } OPTIONAL
         * }
         * </pre>
         * @return
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(privKeyInfo);
            v.AddOptional(identifier);
            return new DerSequence(v);
        }
    }
}
