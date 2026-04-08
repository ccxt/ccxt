using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class SafeBag
        : Asn1Encodable
    {
        public static SafeBag GetInstance(object obj)
        {
            if (obj is SafeBag)
                return (SafeBag)obj;
            if (obj == null)
                return null;
            return new SafeBag(Asn1Sequence.GetInstance(obj));
        }

        private readonly DerObjectIdentifier bagID;
        private readonly Asn1Object bagValue;
        private readonly Asn1Set bagAttributes;

		public SafeBag(
            DerObjectIdentifier	oid,
            Asn1Object			obj)
        {
            this.bagID = oid;
            this.bagValue = obj;
            this.bagAttributes = null;
        }

		public SafeBag(
            DerObjectIdentifier	oid,
            Asn1Object			obj,
            Asn1Set				bagAttributes)
        {
            this.bagID = oid;
            this.bagValue = obj;
            this.bagAttributes = bagAttributes;
        }

		private SafeBag(Asn1Sequence seq)
        {
            this.bagID = (DerObjectIdentifier)seq[0];
            this.bagValue = ((DerTaggedObject)seq[1]).GetObject();
            if (seq.Count == 3)
            {
                this.bagAttributes = (Asn1Set)seq[2];
            }
        }

		public DerObjectIdentifier BagID
		{
			get { return bagID; }
		}

		public Asn1Object BagValue
		{
			get { return bagValue; }
		}

		public Asn1Set BagAttributes
		{
			get { return bagAttributes; }
		}

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(bagID, new DerTaggedObject(0, bagValue));
            v.AddOptional(bagAttributes);
            return new DerSequence(v);
        }
    }
}
