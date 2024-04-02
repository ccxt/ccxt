using System;

using Org.BouncyCastle.Asn1.Cms;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class PopoPrivKey
        : Asn1Encodable, IAsn1Choice
    {
        public const int thisMessage = 0;
        public const int subsequentMessage = 1;
        public const int dhMAC = 2;
        public const int agreeMAC = 3;
        public const int encryptedKey = 4;

        private readonly int tagNo;
        private readonly Asn1Encodable obj;

        private PopoPrivKey(Asn1TaggedObject obj)
        {
            this.tagNo = obj.TagNo;

            switch (tagNo)
            {
            case thisMessage:
                this.obj = DerBitString.GetInstance(obj, false);
                break;
            case subsequentMessage:
                this.obj = SubsequentMessage.ValueOf(DerInteger.GetInstance(obj, false).IntValueExact);
                break;
            case dhMAC:
                this.obj = DerBitString.GetInstance(obj, false);
                break;
            case agreeMAC:
                this.obj = PKMacValue.GetInstance(obj, false);
                break;
            case encryptedKey:
                this.obj = EnvelopedData.GetInstance(obj, false);
                break;
            default:
                throw new ArgumentException("unknown tag in PopoPrivKey", "obj");
            }
        }

        public static PopoPrivKey GetInstance(Asn1TaggedObject tagged, bool isExplicit)
        {
            return new PopoPrivKey(Asn1TaggedObject.GetInstance(tagged, true));
        }

        public PopoPrivKey(SubsequentMessage msg)
        {
            this.tagNo = subsequentMessage;
            this.obj = msg;
        }

        public virtual int Type
        {
            get { return tagNo; }
        }

        public virtual Asn1Encodable Value
        {
            get { return obj; }
        }

        /**
         * <pre>
         * PopoPrivKey ::= CHOICE {
         *        thisMessage       [0] BIT STRING,         -- Deprecated
         *         -- possession is proven in this message (which contains the private
         *         -- key itself (encrypted for the CA))
         *        subsequentMessage [1] SubsequentMessage,
         *         -- possession will be proven in a subsequent message
         *        dhMAC             [2] BIT STRING,         -- Deprecated
         *        agreeMAC          [3] PKMACValue,
         *        encryptedKey      [4] EnvelopedData }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerTaggedObject(false, tagNo, obj);
        }
    }
}
