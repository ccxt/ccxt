using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class ContentInfo
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier	contentType;
        private readonly Asn1Encodable			content;

        public static ContentInfo GetInstance(
            object obj)
        {
            if (obj == null || obj is ContentInfo)
                return (ContentInfo) obj;

            if (obj is Asn1Sequence)
                return new ContentInfo((Asn1Sequence) obj);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj));
        }

        public static ContentInfo GetInstance(Asn1TaggedObject obj, bool isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

        private ContentInfo(
            Asn1Sequence seq)
        {
            if (seq.Count < 1 || seq.Count > 2)
                throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

            contentType = (DerObjectIdentifier) seq[0];

            if (seq.Count > 1)
            {
                Asn1TaggedObject tagged = (Asn1TaggedObject) seq[1];
                if (!tagged.IsExplicit() || tagged.TagNo != 0)
                    throw new ArgumentException("Bad tag for 'content'", "seq");

                content = tagged.GetObject();
            }
        }

        public ContentInfo(
            DerObjectIdentifier	contentType,
            Asn1Encodable		content)
        {
            this.contentType = contentType;
            this.content = content;
        }

        public DerObjectIdentifier ContentType
        {
            get { return contentType; }
        }

        public Asn1Encodable Content
        {
            get { return content; }
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * ContentInfo ::= Sequence {
         *          contentType ContentType,
         *          content
         *          [0] EXPLICIT ANY DEFINED BY contentType OPTIONAL }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(contentType);

            if (content != null)
            {
                v.Add(new BerTaggedObject(0, content));
            }

            return new BerSequence(v);
        }
    }
}
