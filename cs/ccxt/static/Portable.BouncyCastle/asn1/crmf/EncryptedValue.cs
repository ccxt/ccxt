using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class EncryptedValue
        : Asn1Encodable
    {
        private readonly AlgorithmIdentifier intendedAlg;
        private readonly AlgorithmIdentifier symmAlg;
        private readonly DerBitString encSymmKey;
        private readonly AlgorithmIdentifier keyAlg;
        private readonly Asn1OctetString valueHint;
        private readonly DerBitString encValue;

        private EncryptedValue(Asn1Sequence seq)
        {
            int index = 0;
            while (seq[index] is Asn1TaggedObject)
            {
                Asn1TaggedObject tObj = (Asn1TaggedObject)seq[index];

                switch (tObj.TagNo)
                {
                    case 0:
                        intendedAlg = AlgorithmIdentifier.GetInstance(tObj, false);
                        break;
                    case 1:
                        symmAlg = AlgorithmIdentifier.GetInstance(tObj, false);
                        break;
                    case 2:
                        encSymmKey = DerBitString.GetInstance(tObj, false);
                        break;
                    case 3:
                        keyAlg = AlgorithmIdentifier.GetInstance(tObj, false);
                        break;
                    case 4:
                        valueHint = Asn1OctetString.GetInstance(tObj, false);
                        break;
                }
                ++index;
            }

            encValue = DerBitString.GetInstance(seq[index]);
        }

        public static EncryptedValue GetInstance(object obj)
        {
            if (obj is EncryptedValue)
                return (EncryptedValue)obj;

            if (obj != null)
                return new EncryptedValue(Asn1Sequence.GetInstance(obj));

            return null;
        }

        public EncryptedValue(
            AlgorithmIdentifier intendedAlg,
            AlgorithmIdentifier symmAlg,
            DerBitString encSymmKey,
            AlgorithmIdentifier keyAlg,
            Asn1OctetString valueHint,
            DerBitString encValue)
        {
            if (encValue == null)
            {
                throw new ArgumentNullException("encValue");
            }

            this.intendedAlg = intendedAlg;
            this.symmAlg = symmAlg;
            this.encSymmKey = encSymmKey;
            this.keyAlg = keyAlg;
            this.valueHint = valueHint;
            this.encValue = encValue;
        }

        public virtual AlgorithmIdentifier IntendedAlg
        {
            get { return intendedAlg; }
        }

        public virtual AlgorithmIdentifier SymmAlg
        {
            get { return symmAlg; }
        }

        public virtual DerBitString EncSymmKey
        {
            get { return encSymmKey; }
        }

        public virtual AlgorithmIdentifier KeyAlg
        {
            get { return keyAlg; }
        }

        public virtual Asn1OctetString ValueHint
        {
            get { return valueHint; }
        }

        public virtual DerBitString EncValue
        {
            get { return encValue; }
        }

        /**
         * <pre>
         * EncryptedValue ::= SEQUENCE {
         *                     intendedAlg   [0] AlgorithmIdentifier  OPTIONAL,
         *                     -- the intended algorithm for which the value will be used
         *                     symmAlg       [1] AlgorithmIdentifier  OPTIONAL,
         *                     -- the symmetric algorithm used to encrypt the value
         *                     encSymmKey    [2] BIT STRING           OPTIONAL,
         *                     -- the (encrypted) symmetric key used to encrypt the value
         *                     keyAlg        [3] AlgorithmIdentifier  OPTIONAL,
         *                     -- algorithm used to encrypt the symmetric key
         *                     valueHint     [4] OCTET STRING         OPTIONAL,
         *                     -- a brief description or identifier of the encValue content
         *                     -- (may be meaningful only to the sending entity, and used only
         *                     -- if EncryptedValue might be re-examined by the sending entity
         *                     -- in the future)
         *                     encValue       BIT STRING }
         *                     -- the encrypted value itself
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(false, 0, intendedAlg);
            v.AddOptionalTagged(false, 1, symmAlg);
            v.AddOptionalTagged(false, 2, encSymmKey);
            v.AddOptionalTagged(false, 3, keyAlg);
            v.AddOptionalTagged(false, 4, valueHint);
            v.Add(encValue);
            return new DerSequence(v);
        }
    }
}
