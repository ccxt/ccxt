using System;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class ScvpReqRes
        : Asn1Encodable
    {
        private readonly ContentInfo request;
        private readonly ContentInfo response;

        public static ScvpReqRes GetInstance(object  obj)
        {
            if (obj is ScvpReqRes)
                return (ScvpReqRes)obj;
            if (obj != null)
                return new ScvpReqRes(Asn1Sequence.GetInstance(obj));
            return null;
        }

        private ScvpReqRes(Asn1Sequence seq)
        {
            if (seq[0] is Asn1TaggedObject)
            {
                this.request = ContentInfo.GetInstance(Asn1TaggedObject.GetInstance(seq[0]), true);
                this.response = ContentInfo.GetInstance(seq[1]);
            }
            else
            {
                this.request = null;
                this.response = ContentInfo.GetInstance(seq[0]);
            }
        }

        public ScvpReqRes(ContentInfo response)
            : this(null, response)
        {
        }

        public ScvpReqRes(ContentInfo request, ContentInfo response)
        {
            this.request = request;
            this.response = response;
        }

        public virtual ContentInfo Request
        {
            get { return request; }
        }

        public virtual ContentInfo Response
        {
            get { return response; }
        }

        /**
         * <pre>
         *    ScvpReqRes ::= SEQUENCE {
         *    request  [0] EXPLICIT ContentInfo OPTIONAL,
         *    response     ContentInfo }
         * </pre>
         * @return  the ASN.1 primitive representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, request);
            v.Add(response);
            return new DerSequence(v);
        }
    }
}
