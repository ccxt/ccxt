using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class ProofOfPossession
        : Asn1Encodable, IAsn1Choice
    {
        public const int TYPE_RA_VERIFIED = 0;
        public const int TYPE_SIGNING_KEY = 1;
        public const int TYPE_KEY_ENCIPHERMENT = 2;
        public const int TYPE_KEY_AGREEMENT = 3;

        private readonly int tagNo;
        private readonly Asn1Encodable obj;

        private ProofOfPossession(Asn1TaggedObject tagged)
        {
            tagNo = tagged.TagNo;
            switch (tagNo)
            {
            case 0:
                obj = DerNull.Instance;
                break;
            case 1:
                obj = PopoSigningKey.GetInstance(tagged, false);
                break;
            case 2:
            case 3:
                obj = PopoPrivKey.GetInstance(tagged, false);
                break;
            default:
                throw new ArgumentException("unknown tag: " + tagNo, "tagged");
            }
        }

        public static ProofOfPossession GetInstance(object obj)
        {
            if (obj is ProofOfPossession)
                return (ProofOfPossession)obj;

            if (obj is Asn1TaggedObject)
                return new ProofOfPossession((Asn1TaggedObject)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        /** Creates a ProofOfPossession with type raVerified. */
        public ProofOfPossession()
        {
            tagNo = TYPE_RA_VERIFIED;
            obj = DerNull.Instance;
        }

        /** Creates a ProofOfPossession for a signing key. */
        public ProofOfPossession(PopoSigningKey Poposk)
        {
            tagNo = TYPE_SIGNING_KEY;
            obj = Poposk;
        }

        /**
         * Creates a ProofOfPossession for key encipherment or agreement.
         * @param type one of TYPE_KEY_ENCIPHERMENT or TYPE_KEY_AGREEMENT
         */
        public ProofOfPossession(int type, PopoPrivKey privkey)
        {
            tagNo = type;
            obj = privkey;
        }

        public virtual int Type
        {
            get { return tagNo; }
        }

        public virtual Asn1Encodable Object
        {
            get { return obj; }
        }

        /**
         * <pre>
         * ProofOfPossession ::= CHOICE {
         *                           raVerified        [0] NULL,
         *                           -- used if the RA has already verified that the requester is in
         *                           -- possession of the private key
         *                           signature         [1] PopoSigningKey,
         *                           keyEncipherment   [2] PopoPrivKey,
         *                           keyAgreement      [3] PopoPrivKey }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerTaggedObject(false, tagNo, obj);
        }
    }
}
