using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DsaPublicKeyParameters
		: DsaKeyParameters
    {
        private static BigInteger Validate(BigInteger y, DsaParameters parameters)
        {
            // we can't validate without params, fortunately we can't use the key either...
            if (parameters != null)
            {
                if (y.CompareTo(BigInteger.Two) < 0
                    || y.CompareTo(parameters.P.Subtract(BigInteger.Two)) > 0
                    || !y.ModPow(parameters.Q, parameters.P).Equals(BigInteger.One))
                {
                    throw new ArgumentException("y value does not appear to be in correct group");
                }
            }

            return y;
        }

        private readonly BigInteger y;

		public DsaPublicKeyParameters(
            BigInteger		y,
            DsaParameters	parameters)
			: base(false, parameters)
        {
			if (y == null)
				throw new ArgumentNullException("y");

			this.y = Validate(y, parameters);
        }

		public BigInteger Y
        {
            get { return y; }
        }

		public override bool Equals(object obj)
        {
			if (obj == this)
				return true;

			DsaPublicKeyParameters other = obj as DsaPublicKeyParameters;

			if (other == null)
				return false;

			return Equals(other);
        }

		protected bool Equals(
			DsaPublicKeyParameters other)
		{
			return y.Equals(other.y) && base.Equals(other);
		}

		public override int GetHashCode()
        {
			return y.GetHashCode() ^ base.GetHashCode();
        }
    }
}
