using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class RecipientInfo
        : Asn1Encodable, IAsn1Choice
    {
        internal Asn1Encodable info;

		public RecipientInfo(
            KeyTransRecipientInfo info)
        {
            this.info = info;
        }

		public RecipientInfo(
            KeyAgreeRecipientInfo info)
        {
            this.info = new DerTaggedObject(false, 1, info);
        }

		public RecipientInfo(
            KekRecipientInfo info)
        {
            this.info = new DerTaggedObject(false, 2, info);
        }

		public RecipientInfo(
            PasswordRecipientInfo info)
        {
            this.info = new DerTaggedObject(false, 3, info);
        }

		public RecipientInfo(
            OtherRecipientInfo info)
        {
            this.info = new DerTaggedObject(false, 4, info);
        }

		public RecipientInfo(
            Asn1Object   info)
        {
            this.info = info;
        }

		public static RecipientInfo GetInstance(
            object o)
        {
            if (o == null || o is RecipientInfo)
                return (RecipientInfo) o;

			if (o is Asn1Sequence)
                return new RecipientInfo((Asn1Sequence) o);

			if (o is Asn1TaggedObject)
                return new RecipientInfo((Asn1TaggedObject) o);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(o));
        }

		public DerInteger Version
        {
			get
			{
				if (info is Asn1TaggedObject)
				{
					Asn1TaggedObject o = (Asn1TaggedObject) info;

					switch (o.TagNo)
					{
						case 1:
							return KeyAgreeRecipientInfo.GetInstance(o, false).Version;
						case 2:
							return GetKekInfo(o).Version;
						case 3:
							return PasswordRecipientInfo.GetInstance(o, false).Version;
						case 4:
							return new DerInteger(0);    // no syntax version for OtherRecipientInfo
						default:
							throw new InvalidOperationException("unknown tag");
					}
				}

				return KeyTransRecipientInfo.GetInstance(info).Version;
			}
        }

		public bool IsTagged
		{
			get { return info is Asn1TaggedObject; }
		}

		public Asn1Encodable Info
        {
			get
			{
				if (info is Asn1TaggedObject)
				{
					Asn1TaggedObject o = (Asn1TaggedObject) info;

					switch (o.TagNo)
					{
						case 1:
							return KeyAgreeRecipientInfo.GetInstance(o, false);
						case 2:
							return GetKekInfo(o);
						case 3:
							return PasswordRecipientInfo.GetInstance(o, false);
						case 4:
							return OtherRecipientInfo.GetInstance(o, false);
						default:
							throw new InvalidOperationException("unknown tag");
					}
				}

				return KeyTransRecipientInfo.GetInstance(info);
			}
        }

		private KekRecipientInfo GetKekInfo(
			Asn1TaggedObject o)
		{
			// For compatibility with erroneous version, we don't always pass 'false' here
			return KekRecipientInfo.GetInstance(o, o.IsExplicit());
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * RecipientInfo ::= CHOICE {
         *     ktri KeyTransRecipientInfo,
         *     kari [1] KeyAgreeRecipientInfo,
         *     kekri [2] KekRecipientInfo,
         *     pwri [3] PasswordRecipientInfo,
         *     ori [4] OtherRecipientInfo }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return info.ToAsn1Object();
        }
    }
}
