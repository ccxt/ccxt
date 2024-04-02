using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.CryptoPro
{
    public class ECGost3410ParamSetParameters
        : Asn1Encodable
    {
        internal readonly DerInteger p, q, a, b, x, y;

        public static ECGost3410ParamSetParameters GetInstance(Asn1TaggedObject obj, bool explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

        public static ECGost3410ParamSetParameters GetInstance(object obj)
        {
            if (obj == null || obj is ECGost3410ParamSetParameters)
            {
                return (ECGost3410ParamSetParameters) obj;
            }

            if (obj is Asn1Sequence seq)
                return new ECGost3410ParamSetParameters(seq);

            throw new ArgumentException("Invalid GOST3410Parameter: " + Platform.GetTypeName(obj));
        }

        public ECGost3410ParamSetParameters(
            BigInteger a,
            BigInteger b,
            BigInteger p,
            BigInteger q,
            int        x,
            BigInteger y)
        {
            this.a = new DerInteger(a);
            this.b = new DerInteger(b);
            this.p = new DerInteger(p);
            this.q = new DerInteger(q);
            this.x = new DerInteger(x);
            this.y = new DerInteger(y);
        }

        public ECGost3410ParamSetParameters(
            Asn1Sequence seq)
        {
			if (seq.Count != 6)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			this.a = DerInteger.GetInstance(seq[0]);
			this.b = DerInteger.GetInstance(seq[1]);
			this.p = DerInteger.GetInstance(seq[2]);
			this.q = DerInteger.GetInstance(seq[3]);
			this.x = DerInteger.GetInstance(seq[4]);
			this.y = DerInteger.GetInstance(seq[5]);
        }

		public BigInteger P
		{
			get { return p.PositiveValue; }
		}

		public BigInteger Q
		{
			get { return q.PositiveValue; }
		}

		public BigInteger A
		{
			get { return a.PositiveValue; }
		}

		public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(a, b, p, q, x, y);
        }
    }
}
