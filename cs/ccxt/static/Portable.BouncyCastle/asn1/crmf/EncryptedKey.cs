using System;

using Org.BouncyCastle.Asn1.Cms;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class EncryptedKey
        : Asn1Encodable, IAsn1Choice
    {
        private readonly EnvelopedData envelopedData;
        private readonly EncryptedValue encryptedValue;

        public static EncryptedKey GetInstance(object o)
        {
            if (o is EncryptedKey)
            {
                return (EncryptedKey)o;
            }
            else if (o is Asn1TaggedObject)
            {
                return new EncryptedKey(EnvelopedData.GetInstance((Asn1TaggedObject)o, false));
            }
            else if (o is EncryptedValue)
            {
                return new EncryptedKey((EncryptedValue)o);
            }
            else
            {
                return new EncryptedKey(EncryptedValue.GetInstance(o));
            }
        }

        public EncryptedKey(EnvelopedData envelopedData)
        {
            this.envelopedData = envelopedData;
        }

        public EncryptedKey(EncryptedValue encryptedValue)
        {
            this.encryptedValue = encryptedValue;
        }

        public virtual bool IsEncryptedValue
        {
            get { return encryptedValue != null; }
        }

        public virtual Asn1Encodable Value
        {
            get
            {
                if (encryptedValue != null)
                    return encryptedValue;

                return envelopedData;
            }
        }

        /**
         * <pre>
         *    EncryptedKey ::= CHOICE {
         *        encryptedValue        EncryptedValue, -- deprecated
         *        envelopedData     [0] EnvelopedData }
         *        -- The encrypted private key MUST be placed in the envelopedData
         *        -- encryptedContentInfo encryptedContent OCTET STRING.
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            if (encryptedValue != null)
            {
                return encryptedValue.ToAsn1Object();
            }

            return new DerTaggedObject(false, 0, envelopedData);
        }
    }
}
