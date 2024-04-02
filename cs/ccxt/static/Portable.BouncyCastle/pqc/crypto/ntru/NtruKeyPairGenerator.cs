using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Ntru.Owcpa;
using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    public class NtruKeyPairGenerator : IAsymmetricCipherKeyPairGenerator
    {
        private NtruKeyGenerationParameters _keygenParameters;
        private SecureRandom _random;

        public void Init(KeyGenerationParameters parameters)
        {
            _keygenParameters = (NtruKeyGenerationParameters)parameters;
            _random = parameters.Random;
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            // Debug.Assert(this._random != null);
            NtruParameterSet parameterSet = _keygenParameters.NtruParameters.ParameterSet;

            var seed = new byte[parameterSet.SampleFgBytes()];
            _random.NextBytes(seed);

            NtruOwcpa owcpa = new NtruOwcpa(parameterSet);
            OwcpaKeyPair owcpaKeys = owcpa.KeyPair(seed);

            byte[] publicKey = owcpaKeys.PublicKey;
            byte[] privateKey = new byte[parameterSet.NtruSecretKeyBytes()];
            byte[] owcpaPrivateKey = owcpaKeys.PrivateKey;
            Array.Copy(owcpaPrivateKey, 0, privateKey, 0, owcpaPrivateKey.Length);
            //
            byte[] prfBytes = new byte[parameterSet.PrfKeyBytes];
            _random.NextBytes(prfBytes);
            Array.Copy(prfBytes, 0, privateKey, parameterSet.OwcpaSecretKeyBytes(), prfBytes.Length);

            return new AsymmetricCipherKeyPair(new NtruPublicKeyParameters(_keygenParameters.NtruParameters, publicKey),
                new NtruPrivateKeyParameters(_keygenParameters.NtruParameters, privateKey));
        }
    }
}