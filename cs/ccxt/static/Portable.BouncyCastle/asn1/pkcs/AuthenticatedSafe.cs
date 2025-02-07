using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class AuthenticatedSafe
        : Asn1Encodable
    {
        private static ContentInfo[] Copy(ContentInfo[] info)
        {
            return (ContentInfo[])info.Clone();
        }

        public static AuthenticatedSafe GetInstance(object obj)
        {
            if (obj is AuthenticatedSafe)
                return (AuthenticatedSafe)obj;
            if (obj == null)
                return null;
            return new AuthenticatedSafe(Asn1Sequence.GetInstance(obj));
        }

        private readonly ContentInfo[] info;
        private readonly bool isBer;

		private AuthenticatedSafe(Asn1Sequence seq)
        {
            info = new ContentInfo[seq.Count];

            for (int i = 0; i != info.Length; i++)
            {
                info[i] = ContentInfo.GetInstance(seq[i]);
            }

            isBer = seq is BerSequence;
        }

		public AuthenticatedSafe(
            ContentInfo[] info)
        {
            this.info = Copy(info);
            this.isBer = true;
        }

		public ContentInfo[] GetContentInfo()
        {
            return Copy(info);
        }

        public override Asn1Object ToAsn1Object()
        {
            if (isBer)
            {
                return new BerSequence(info);
            }

            // TODO bc-java uses DL sequence
            //return new DLSequence(info);
            return new DerSequence(info);
        }
    }
}
