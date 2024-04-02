using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class OptionalValidity
        : Asn1Encodable
    {
        private readonly Time notBefore;
        private readonly Time notAfter;

        private OptionalValidity(Asn1Sequence seq)
        {
            foreach (Asn1TaggedObject tObj in seq)
            {
                if (tObj.TagNo == 0)
                {
                    notBefore = Time.GetInstance(tObj, true);
                }
                else
                {
                    notAfter = Time.GetInstance(tObj, true);
                }
            }
        }

        public static OptionalValidity GetInstance(object obj)
        {
            if (obj == null || obj is OptionalValidity)
                return (OptionalValidity)obj;

            return new OptionalValidity(Asn1Sequence.GetInstance(obj));
        }

        public OptionalValidity(Time notBefore, Time notAfter)
        {
            this.notBefore = notBefore;
            this.notAfter = notAfter;
        }

        public virtual Time NotBefore
        {
            get { return notBefore; }
        }

        public virtual Time NotAfter
        {
            get { return notAfter; }
        }

        /**
         * <pre>
         * OptionalValidity ::= SEQUENCE {
         *                        notBefore  [0] Time OPTIONAL,
         *                        notAfter   [1] Time OPTIONAL } --at least one MUST be present
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(true, 0, notBefore);
            v.AddOptionalTagged(true, 1, notAfter);
            return new DerSequence(v);
        }
    }
}
