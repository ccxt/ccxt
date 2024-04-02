using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class NtruLPRimeKemExtractor : IEncapsulatedSecretExtractor
    {
        private NtruPrimeEngine _primeEngine;
        private readonly NtruLPRimeKeyParameters _primeKey;

        public NtruLPRimeKemExtractor(NtruLPRimeKeyParameters privParams)
        {
            this._primeKey = privParams;
            InitCipher(_primeKey.Parameters);
        }

        private void InitCipher(NtruLPRimeParameters param)
        {
            _primeEngine = param.PrimeEngine;
        }

        public byte[] ExtractSecret(byte[] encapsulation)
        {
            byte[] session_key = new byte[_primeEngine.SessionKeySize];
            _primeEngine.kem_dec(session_key, encapsulation, ((NtruLPRimePrivateKeyParameters)_primeKey).privKey);
            return session_key;
        }

        public int EncapsulationLength => _primeEngine.CipherTextSize;
    }
}
