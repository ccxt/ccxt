using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class CertStatus
        : Asn1Encodable, IAsn1Choice
    {
        private readonly int			tagNo;
        private readonly Asn1Encodable	value;

		/**
         * create a CertStatus object with a tag of zero.
         */
        public CertStatus()
        {
            tagNo = 0;
            value = DerNull.Instance;
        }

		public CertStatus(
            RevokedInfo info)
        {
            tagNo = 1;
            value = info;
        }

		public CertStatus(
            int				tagNo,
            Asn1Encodable	value)
        {
            this.tagNo = tagNo;
            this.value = value;
        }

		public CertStatus(Asn1TaggedObject choice)
        {
            this.tagNo = choice.TagNo;

			switch (choice.TagNo)
            {
            case 0:
                value = Asn1Null.GetInstance(choice, false);
                break;
            case 1:
				value = RevokedInfo.GetInstance(choice, false);
				break;
			case 2:
                value = Asn1Null.GetInstance(choice, false);
                break;
			default:
				throw new ArgumentException("Unknown tag encountered: " + Asn1Utilities.GetTagText(choice));
            }
        }

		public static CertStatus GetInstance(
            object obj)
        {
            if (obj == null || obj is CertStatus)
            {
                return (CertStatus)obj;
            }

			if (obj is Asn1TaggedObject)
            {
                return new CertStatus((Asn1TaggedObject)obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
        }

		public int TagNo
		{
			get { return tagNo; }
		}

		public Asn1Encodable Status
		{
			get { return value; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  CertStatus ::= CHOICE {
         *                  good        [0]     IMPLICIT Null,
         *                  revoked     [1]     IMPLICIT RevokedInfo,
         *                  unknown     [2]     IMPLICIT UnknownInfo }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerTaggedObject(false, tagNo, value);
        }
    }
}
