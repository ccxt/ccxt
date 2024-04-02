using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    internal class PolynomialPair
    {
        private readonly Polynomial _a;
        private readonly Polynomial _b;

        public PolynomialPair(Polynomial a, Polynomial b)
        {
            _a = a;
            _b = b;
        }

        internal Polynomial F()
        {
            return _a;
        }

        internal Polynomial G()
        {
            return _b;
        }

        internal Polynomial R()
        {
            return _a;
        }

        internal Polynomial M()
        {
            return _b;
        }
    }
}