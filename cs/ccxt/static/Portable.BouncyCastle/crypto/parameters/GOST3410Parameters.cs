using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Parameters
{
	public class Gost3410Parameters
		: ICipherParameters
	{
		private readonly BigInteger p, q, a;
		private readonly Gost3410ValidationParameters validation;

		public Gost3410Parameters(
			BigInteger	p,
			BigInteger	q,
			BigInteger	a)
			: this(p, q, a, null)
		{
		}

		public Gost3410Parameters(
			BigInteger						p,
			BigInteger						q,
			BigInteger						a,
			Gost3410ValidationParameters	validation)
		{
			if (p == null)
				throw new ArgumentNullException("p");
			if (q == null)
				throw new ArgumentNullException("q");
			if (a == null)
				throw new ArgumentNullException("a");

			this.p = p;
			this.q = q;
			this.a = a;
			this.validation = validation;
		}

		public BigInteger P
		{
			get { return p; }
		}

		public BigInteger Q
		{
			get { return q; }
		}

		public BigInteger A
		{
			get { return a; }
		}

		public Gost3410ValidationParameters ValidationParameters
		{
			get { return validation; }
		}

		public override bool Equals(
			object obj)
		{
			if (obj == this)
				return true;

			Gost3410Parameters other = obj as Gost3410Parameters;

			if (other == null)
				return false;

			return Equals(other);
		}

		protected bool Equals(
			Gost3410Parameters other)
		{
			return p.Equals(other.p) && q.Equals(other.q) && a.Equals(other.a);
		}

		public override int GetHashCode()
		{
			return p.GetHashCode() ^ q.GetHashCode() ^ a.GetHashCode();
		}
	}
}
