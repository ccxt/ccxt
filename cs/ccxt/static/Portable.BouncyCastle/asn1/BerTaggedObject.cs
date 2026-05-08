using System;

namespace Org.BouncyCastle.Asn1
{
	/**
	 * BER TaggedObject - in ASN.1 notation this is any object preceded by
	 * a [n] where n is some number - these are assumed to follow the construction
	 * rules (as with sequences).
	 */
	public class BerTaggedObject
		: DerTaggedObject
	{
        /**
		 * @param tagNo the tag number for this object.
		 * @param obj the tagged object.
		 */
        public BerTaggedObject(int tagNo, Asn1Encodable obj)
			: base(true, tagNo, obj)
		{
		}

        public BerTaggedObject(int tagClass, int tagNo, Asn1Encodable obj)
            : base(true, tagClass, tagNo, obj)
        {
        }

        /**
		 * @param isExplicit true if an explicitly tagged object.
		 * @param tagNo the tag number for this object.
		 * @param obj the tagged object.
		 */
        public BerTaggedObject(bool isExplicit, int tagNo, Asn1Encodable obj)
			: base(isExplicit, tagNo, obj)
		{
		}

        public BerTaggedObject(bool isExplicit, int tagClass, int tagNo, Asn1Encodable obj)
            : base(isExplicit, tagClass, tagNo, obj)
        {
        }

        internal BerTaggedObject(int explicitness, int tagClass, int tagNo, Asn1Encodable obj)
            : base(explicitness, tagClass, tagNo, obj)
        {
        }

        internal override string Asn1Encoding
        {
            get { return Ber; }
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncoding(encoding);

            Asn1Object baseObject = GetBaseObject().ToAsn1Object();

            if (!IsExplicit())
                return baseObject.GetEncodingImplicit(encoding, TagClass, TagNo);

            return new ConstructedILEncoding(TagClass, TagNo, new IAsn1Encoding[]{ baseObject.GetEncoding(encoding) });
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncodingImplicit(encoding, tagClass, tagNo);

            Asn1Object baseObject = GetBaseObject().ToAsn1Object();

            if (!IsExplicit())
                return baseObject.GetEncodingImplicit(encoding, tagClass, tagNo);

            return new ConstructedILEncoding(tagClass, tagNo, new IAsn1Encoding[]{ baseObject.GetEncoding(encoding) });
        }

        internal override Asn1Sequence RebuildConstructed(Asn1Object asn1Object)
        {
            return new BerSequence(asn1Object);
        }

        internal override Asn1TaggedObject ReplaceTag(int tagClass, int tagNo)
        {
            return new BerTaggedObject(explicitness, tagClass, tagNo, obj);
        }
    }
}
