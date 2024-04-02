using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class SNtruPrimeKeyParameters : AsymmetricKeyParameter
    {
        private SNtruPrimeParameters _primeParameters;
        
        public SNtruPrimeKeyParameters(bool isPrivate, SNtruPrimeParameters primeParameters) : base(isPrivate)
        {
            this._primeParameters = primeParameters;
        }

        public SNtruPrimeParameters Parameters => _primeParameters;

    }
}
