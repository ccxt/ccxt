using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets
{
    internal class NtruHrssParameterSet : NtruParameterSet
    {
        private protected NtruHrssParameterSet(int n, int logQ, int seedBytes, int prfKeyBytes, int sharedKeyBytes) :
            base(n, logQ, seedBytes, prfKeyBytes, sharedKeyBytes)
        {
        }

        internal override Polynomial CreatePolynomial()
        {
            return new HrssPolynomial(this);
        }

        internal override int SampleFgBytes()
        {
            return 2 * SampleIidBytes();
        }

        internal override int SampleRmBytes()
        {
            return 2 * SampleIidBytes();
        }
    }
}