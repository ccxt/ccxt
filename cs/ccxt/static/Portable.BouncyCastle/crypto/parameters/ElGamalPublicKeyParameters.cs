using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class ElGamalPublicKeyParameters
		: ElGamalKeyParameters
    {
        private readonly BigInteger y;

		public ElGamalPublicKeyParameters(
            BigInteger			y,
            ElGamalParameters	parameters)
			: base(false, parameters)
        {
			if (y == null)
				throw new ArgumentNullException("y");

			this.y = y;
        }

		public BigInteger Y
        {
            get { return y; }
        }

		public override bool Equals(
            object obj)
        {
			if (obj == this)
				return true;

			ElGamalPublicKeyParameters other = obj as ElGamalPublicKeyParameters;

			if (other == null)
				return false;

			return Equals(other);
        }

		protected bool Equals(
			ElGamalPublicKeyParameters other)
		{
			return y.Equals(other.y) && base.Equals(other);
		}

		public override int GetHashCode()
        {
			return y.GetHashCode() ^ base.GetHashCode();
        }
    }
}
