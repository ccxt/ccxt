using System;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Utilities;

// ASN.1 Encoding for a
// Classic McEliece private key for fully populated:
// <pre>
// McEliecePrivateKey ::= SEQUENCE {
//    Version    INTEGER {v0(0)} -- version (round 3)
//    delta      OCTET STRING,   -- nonce
//    C          OCTET STRING,   -- column selections
//    g          OCTET STRING,   -- monic irreducible polynomial
//    alpha      OCTET STRING,   -- field orderings
//    s          OCTET STRING,   -- random n-bit string
//    PublicKey  [0] IMPLICIT McEliecePublicKey OPTIONAL
//                               -- see next section
//    }
// </pre>
namespace Org.BouncyCastle.Pqc.Asn1
{
    public class CmcePrivateKey
        : Asn1Object
    {
        private int version;
        private byte[] delta;
        private byte[] c;
        private byte[] g;
        private byte[] alpha;
        private byte[] s;
        private CmcePublicKey publicKey;
        
        public CmcePrivateKey(int version, byte[] delta, byte[] c, byte[] g, byte[] alpha, byte[] s, CmcePublicKey pubKey = null)
        {
            this.version = version;
            if (version != 0)
            {
                 throw new Exception("unrecognized version");
            }
            this.delta = Arrays.Clone(delta);
            this.c = Arrays.Clone(c);
            this.g = Arrays.Clone(g);
            this.alpha = Arrays.Clone(alpha);
            this.s = Arrays.Clone(s);
            this.publicKey = pubKey;
        }

        private CmcePrivateKey(Asn1Sequence seq)
        {
            version = DerInteger.GetInstance(seq[0]).Value.IntValue;
            if (version != 0)
            {
                 throw new Exception("unrecognized version");
            }
            delta = Arrays.Clone(Asn1OctetString.GetInstance(seq[1]).GetOctets());

            c = Arrays.Clone(Asn1OctetString.GetInstance(seq[2]).GetOctets());

            g = Arrays.Clone(Asn1OctetString.GetInstance(seq[3]).GetOctets());

            alpha = Arrays.Clone(Asn1OctetString.GetInstance(seq[4]).GetOctets());

            s = Arrays.Clone(Asn1OctetString.GetInstance(seq[5]).GetOctets());

            // todo optional publickey
            if(seq.Count == 7)
            {
                publicKey = CmcePublicKey.GetInstance(seq[6]);
            }
        }

        public int Version => version;

        public byte[] Delta => Arrays.Clone(delta);

        public byte[] C => Arrays.Clone(c);

        public byte[] G => Arrays.Clone(g);

        public byte[] Alpha => Arrays.Clone(alpha);

        public byte[] S => Arrays.Clone(s);

        public CmcePublicKey PublicKey => publicKey;

        public Asn1Object ToAsn1Primitive()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();

            v.Add(new DerInteger(version));
            v.Add(new DerOctetString(delta));
            v.Add(new DerOctetString(c));
            v.Add(new DerOctetString(g));
            v.Add(new DerOctetString(alpha));
            v.Add(new DerOctetString(s));

            // todo optional publickey
            if(PublicKey != null)
            {
                v.Add(new CmcePublicKey(PublicKey.T));
            }

            return new DerSequence(v);
        }

        public static  CmcePrivateKey GetInstance(Object o)
        {
            if (o is CmcePrivateKey)
            {
                return (CmcePrivateKey)o;
            }
            else if (o != null)
            {
                return new CmcePrivateKey(Asn1Sequence.GetInstance(o));
            }

            return null;
        }
        //TODO are these correct tags?
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
            CmcePrivateKey other = asn1Object as CmcePrivateKey;
            if (other == null)
                return false;
            
            return Arrays.AreEqual(this.ToAsn1Primitive().GetEncoded(), other.ToAsn1Primitive().GetEncoded());
        }

        protected override int Asn1GetHashCode()
        {
            return ToAsn1Object().CallAsn1GetHashCode();
        }
    }
}