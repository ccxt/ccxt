using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets
{
    internal class NtruHps4096821 : NtruHpsParameterSet
    {
        internal NtruHps4096821() : base(821, 12, 32, 32, 32)
        {
        }

        internal override Polynomial CreatePolynomial()
        {
            return new Hps4096Polynomial(this);
        }
    }
}