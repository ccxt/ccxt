using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class NtruLPRimeKeyParameters : AsymmetricKeyParameter
    {
        private NtruLPRimeParameters _primeParameters;
        
        public NtruLPRimeKeyParameters(bool isPrivate, NtruLPRimeParameters primeParameters) : base(isPrivate)
        {
            this._primeParameters = primeParameters;
        }

        public NtruLPRimeParameters Parameters => _primeParameters;

    }
}
