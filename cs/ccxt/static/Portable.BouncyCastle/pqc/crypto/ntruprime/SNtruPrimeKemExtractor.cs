using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class SNtruPrimeKemExtractor : IEncapsulatedSecretExtractor
    {
        private NtruPrimeEngine _primeEngine;
        private readonly SNtruPrimeKeyParameters _primeKey;

        public SNtruPrimeKemExtractor(SNtruPrimeKeyParameters privParams)
        {
            this._primeKey = privParams;
            InitCipher(_primeKey.Parameters);
        }

        private void InitCipher(SNtruPrimeParameters param)
        {
            _primeEngine = param.PrimeEngine;
        }

        public byte[] ExtractSecret(byte[] encapsulation)
        {
            byte[] session_key = new byte[_primeEngine.SessionKeySize];
            _primeEngine.kem_dec(session_key, encapsulation, ((SNtruPrimePrivateKeyParameters)_primeKey).privKey);
            return session_key;
        }

        public int EncapsulationLength => _primeEngine.CipherTextSize;
    }
}
