using System;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Asn1
{
    public class CmcePublicKey
        : Asn1Object
    {
        private byte[] t;

        public CmcePublicKey(byte[] t)
        {
            this.t = t;
        }

        public CmcePublicKey(Asn1Sequence seq)
        {
            t = Arrays.Clone(Asn1OctetString.GetInstance(seq[0]).GetOctets());
        }

        public byte[] T => Arrays.Clone(t);

        public Asn1Object ToAsn1Primitive()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.Add(new DerOctetString(t));
            return new DerSequence(v);
        }

        public static CmcePublicKey GetInstance(Object o)
        {
            if (o is CmcePrivateKey)
            {
                return (CmcePublicKey) o;
            }
            else if (o != null)
            {
                return new CmcePublicKey(Asn1Sequence.GetInstance(o));
            }

            return null;
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return ToAsn1Primitive().GetEncoding(encoding);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return ToAsn1Primitive().GetEncodingImplicit(encoding, tagClass, tagNo);

        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            if (this.Equals(asn1Object))
            {
                return true;
            }

            if (!(asn1Object is Asn1Encodable))
            {
                return false;
            }

            Asn1Encodable other = (Asn1Encodable) asn1Object;

            return ToAsn1Primitive().Equals(other.ToAsn1Object());
        }

        protected override int Asn1GetHashCode()
        {
            return ToAsn1Primitive().GetHashCode();
        }
    }
}