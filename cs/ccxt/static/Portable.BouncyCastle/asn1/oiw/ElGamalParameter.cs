using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Asn1.Oiw
{
    public class ElGamalParameter
        : Asn1Encodable
    {
        internal DerInteger p, g;

		public ElGamalParameter(
            BigInteger	p,
            BigInteger	g)
        {
            this.p = new DerInteger(p);
            this.g = new DerInteger(g);
        }

		public ElGamalParameter(
            Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			p = DerInteger.GetInstance(seq[0]);
			g = DerInteger.GetInstance(seq[1]);
        }

		public BigInteger P
		{
			get { return p.PositiveValue; }
		}

		public BigInteger G
		{
			get { return g.PositiveValue; }
		}

		public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(p, g);
        }
    }
}
