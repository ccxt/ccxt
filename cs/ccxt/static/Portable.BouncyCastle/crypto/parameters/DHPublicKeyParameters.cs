using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DHPublicKeyParameters
		: DHKeyParameters
    {
        private static BigInteger Validate(BigInteger y, DHParameters dhParams)
        {
            if (y == null)
                throw new ArgumentNullException("y");

            BigInteger p = dhParams.P;

            // TLS check
            if (y.CompareTo(BigInteger.Two) < 0 || y.CompareTo(p.Subtract(BigInteger.Two)) > 0)
                throw new ArgumentException("invalid DH public key", "y");

            BigInteger q = dhParams.Q;

            // We can't validate without Q.
            if (q == null)
                return y;

            if (p.TestBit(0)
                && p.BitLength - 1 == q.BitLength
                && p.ShiftRight(1).Equals(q))
            {
                // Safe prime case
                if (1 == Legendre(y, p))
                    return y;
            }
            else
            {
                if (BigInteger.One.Equals(y.ModPow(q, p)))
                    return y;
            }

            throw new ArgumentException("value does not appear to be in correct group", "y");
        }

        private readonly BigInteger y;

		public DHPublicKeyParameters(
            BigInteger		y,
            DHParameters	parameters)
			: base(false, parameters)
        {
			this.y = Validate(y, parameters);
        }

		public DHPublicKeyParameters(
            BigInteger			y,
            DHParameters		parameters,
		    DerObjectIdentifier	algorithmOid)
			: base(false, parameters, algorithmOid)
        {
            this.y = Validate(y, parameters);
        }

        public virtual BigInteger Y
        {
            get { return y; }
        }

		public override bool Equals(
			object  obj)
        {
			if (obj == this)
				return true;

			DHPublicKeyParameters other = obj as DHPublicKeyParameters;

			if (other == null)
				return false;

			return Equals(other);
        }

		protected bool Equals(
			DHPublicKeyParameters other)
		{
			return y.Equals(other.y) && base.Equals(other);
		}

		public override int GetHashCode()
        {
            return y.GetHashCode() ^ base.GetHashCode();
        }

        private static int Legendre(BigInteger a, BigInteger b)
        {
            //int r = 0, bits = b.IntValue;

            //for (;;)
            //{
            //    int lowestSetBit = a.GetLowestSetBit();
            //    a = a.ShiftRight(lowestSetBit);
            //    r ^= (bits ^ (bits >> 1)) & (lowestSetBit << 1);

            //    int cmp = a.CompareTo(b);
            //    if (cmp == 0)
            //        break;

            //    if (cmp < 0)
            //    {
            //        BigInteger t = a; a = b; b = t;

            //        int oldBits = bits;
            //        bits = b.IntValue;
            //        r ^= oldBits & bits;
            //    }

            //    a = a.Subtract(b);
            //}

            //return BigInteger.One.Equals(b) ? (1 - (r & 2)) : 0;

            int bitLength = b.BitLength;
            uint[] A = Nat.FromBigInteger(bitLength, a);
            uint[] B = Nat.FromBigInteger(bitLength, b);

            int r = 0;

            int len = B.Length;
            for (;;)
            {
                while (A[0] == 0)
                {
                    Nat.ShiftDownWord(len, A, 0);
                }

                int shift = Integers.NumberOfTrailingZeros((int)A[0]);
                if (shift > 0)
                {
                    Nat.ShiftDownBits(len, A, shift, 0);
                    int bits = (int)B[0];
                    r ^= (bits ^ (bits >> 1)) & (shift << 1);
                }

                int cmp = Nat.Compare(len, A, B);
                if (cmp == 0)
                    break;

                if (cmp < 0)
                {
                    r ^= (int)(A[0] & B[0]);
                    uint[] t = A; A = B; B = t;
                }

                while (A[len - 1] == 0)
                {
                    len = len - 1;
                }

                Nat.Sub(len, A, B, A);
            }

            return Nat.IsOne(len, B) ? (1 - (r & 2)) : 0;
        }
    }
}
