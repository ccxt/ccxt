using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X9
{
	public class DHDomainParameters
		: Asn1Encodable
	{
		private readonly DerInteger p, g, q, j;
		private readonly DHValidationParms validationParms;

		public static DHDomainParameters GetInstance(Asn1TaggedObject obj, bool isExplicit)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
		}

		public static DHDomainParameters GetInstance(object obj)
		{
			if (obj == null || obj is DHDomainParameters)
				return (DHDomainParameters)obj;

			if (obj is Asn1Sequence)
				return new DHDomainParameters((Asn1Sequence)obj);

			throw new ArgumentException("Invalid DHDomainParameters: " + Platform.GetTypeName(obj), "obj");
		}

		public DHDomainParameters(DerInteger p, DerInteger g, DerInteger q, DerInteger j,
			DHValidationParms validationParms)
		{
			if (p == null)
				throw new ArgumentNullException("p");
			if (g == null)
				throw new ArgumentNullException("g");
			if (q == null)
				throw new ArgumentNullException("q");

			this.p = p;
			this.g = g;
			this.q = q;
			this.j = j;
			this.validationParms = validationParms;
		}

		private DHDomainParameters(Asn1Sequence seq)
		{
			if (seq.Count < 3 || seq.Count > 5)
				throw new ArgumentException("Bad sequence size: " + seq.Count, "seq");

			var e = seq.GetEnumerator();
			this.p = DerInteger.GetInstance(GetNext(e));
			this.g = DerInteger.GetInstance(GetNext(e));
			this.q = DerInteger.GetInstance(GetNext(e));

			Asn1Encodable next = GetNext(e);

			if (next != null && next is DerInteger)
			{
				this.j = DerInteger.GetInstance(next);
				next = GetNext(e);
			}

			if (next != null)
			{
				this.validationParms = DHValidationParms.GetInstance(next.ToAsn1Object());
			}
		}

		private static Asn1Encodable GetNext(IEnumerator<Asn1Encodable> e)
		{
			return e.MoveNext() ? (Asn1Encodable)e.Current : null;
		}

		public DerInteger P
		{
			get { return this.p; }
		}

		public DerInteger G
		{
			get { return this.g; }
		}

		public DerInteger Q
		{
			get { return this.q; }
		}

		public DerInteger J
		{
			get { return this.j; }
		}

		public DHValidationParms ValidationParms
		{
			get { return this.validationParms; }
		}

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(p, g, q);
            v.AddOptional(j, validationParms);
            return new DerSequence(v);
        }
	}
}
