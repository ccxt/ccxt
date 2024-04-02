using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    /**
     * the infamous Pfx from Pkcs12
     */
    public class Pfx
        : Asn1Encodable
    {
        public static Pfx GetInstance(object obj)
        {
            if (obj is Pfx)
                return (Pfx)obj;
            if (obj == null)
                return null;
            return new Pfx(Asn1Sequence.GetInstance(obj));
        }

        private readonly ContentInfo contentInfo;
        private readonly MacData macData;

		private Pfx(Asn1Sequence seq)
        {
            DerInteger version = DerInteger.GetInstance(seq[0]);
            if (!version.HasValue(3))
                throw new ArgumentException("wrong version for PFX PDU");

            this.contentInfo = ContentInfo.GetInstance(seq[1]);

            if (seq.Count == 3)
            {
                this.macData = MacData.GetInstance(seq[2]);
            }
        }

		public Pfx(ContentInfo contentInfo, MacData macData)
        {
            this.contentInfo = contentInfo;
            this.macData = macData;
        }

		public ContentInfo AuthSafe
		{
			get { return contentInfo; }
		}

		public MacData MacData
		{
			get { return macData; }
		}

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(new DerInteger(3), contentInfo);
            v.AddOptional(macData);
            return new BerSequence(v);
        }
    }
}
