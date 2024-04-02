using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets
{
    internal class NtruHpsParameterSet : NtruParameterSet
    {
        private protected NtruHpsParameterSet(int n, int logQ, int seedBytes, int prfKeyBytes, int sharedKeyBytes) :
            base(n, logQ, seedBytes, prfKeyBytes, sharedKeyBytes)
        {
        }

        internal override Polynomial CreatePolynomial()
        {
            return new HpsPolynomial(this);
        }

        internal override int SampleFgBytes()
        {
            return SampleIidBytes() + SampleFixedTypeBytes();
        }

        internal override int SampleRmBytes()
        {
            return SampleIidBytes() + SampleFixedTypeBytes();
        }

        internal int Weight()
        {
            return Q() / 8 - 2;
        }
    }
}