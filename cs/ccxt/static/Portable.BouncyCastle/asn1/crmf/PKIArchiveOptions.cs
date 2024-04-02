using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class PkiArchiveOptions
        : Asn1Encodable, IAsn1Choice
    {
        public const int encryptedPrivKey = 0;
        public const int keyGenParameters = 1;
        public const int archiveRemGenPrivKey = 2;

        private readonly Asn1Encodable value;

        public static PkiArchiveOptions GetInstance(object obj)
        {
            if (obj is PkiArchiveOptions)
                return (PkiArchiveOptions)obj;

            if (obj is Asn1TaggedObject)
                return new PkiArchiveOptions((Asn1TaggedObject)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        private PkiArchiveOptions(Asn1TaggedObject tagged)
        {
            switch (tagged.TagNo)
            {
                case encryptedPrivKey:
                    value = EncryptedKey.GetInstance(tagged.GetObject());
                    break;
                case keyGenParameters:
                    value = Asn1OctetString.GetInstance(tagged, false);
                    break;
                case archiveRemGenPrivKey:
                    value = DerBoolean.GetInstance(tagged, false);
                    break;
                default:
                    throw new ArgumentException("unknown tag number: " + tagged.TagNo, "tagged");
            }
        }

        public PkiArchiveOptions(EncryptedKey encKey)
        {
            this.value = encKey;
        }

        public PkiArchiveOptions(Asn1OctetString keyGenParameters)
        {
            this.value = keyGenParameters;
        }

        public PkiArchiveOptions(bool archiveRemGenPrivKey)
        {
            this.value = DerBoolean.GetInstance(archiveRemGenPrivKey);
        }

        public virtual int Type
        {
            get
            {
                if (value is EncryptedKey)
                    return encryptedPrivKey;

                if (value is Asn1OctetString)
                    return keyGenParameters;

                return archiveRemGenPrivKey;
            }
        }

        public virtual Asn1Encodable Value
        {
            get { return value; }
        }

        /**
         * <pre>
         *  PkiArchiveOptions ::= CHOICE {
         *      encryptedPrivKey     [0] EncryptedKey,
         *      -- the actual value of the private key
         *      keyGenParameters     [1] KeyGenParameters,
         *      -- parameters which allow the private key to be re-generated
         *      archiveRemGenPrivKey [2] BOOLEAN }
         *      -- set to TRUE if sender wishes receiver to archive the private
         *      -- key of a key pair that the receiver generates in response to
         *      -- this request; set to FALSE if no archival is desired.
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            if (value is EncryptedKey)
            {
                return new DerTaggedObject(true, encryptedPrivKey, value);  // choice
            }

            if (value is Asn1OctetString)
            {
                return new DerTaggedObject(false, keyGenParameters, value);
            }

            return new DerTaggedObject(false, archiveRemGenPrivKey, value);
        }
    }
}
