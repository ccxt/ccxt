using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Kisa;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Ntt;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Utilities
{
    public class CipherKeyGeneratorFactory
    {
        private CipherKeyGeneratorFactory()
        {
        }

        /**
         * Create a key generator for the passed in Object Identifier.
         *
         * @param algorithm the Object Identifier indicating the algorithn the generator is for.
         * @param random a source of random to initialise the generator with.
         * @return an initialised CipherKeyGenerator.
         * @throws IllegalArgumentException if the algorithm cannot be identified.
         */
        public static CipherKeyGenerator CreateKeyGenerator(DerObjectIdentifier algorithm, SecureRandom random)
        {
            if (NistObjectIdentifiers.IdAes128Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 128);
            }
            else if (NistObjectIdentifiers.IdAes192Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 192);
            }
            else if (NistObjectIdentifiers.IdAes256Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 256);
            }
            else if (PkcsObjectIdentifiers.DesEde3Cbc.Equals(algorithm))
            {
                DesEdeKeyGenerator keyGen = new DesEdeKeyGenerator();
                keyGen.Init(new KeyGenerationParameters(random, 192));
                return keyGen;
            }
            else if (NttObjectIdentifiers.IdCamellia128Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 128);
            }
            else if (NttObjectIdentifiers.IdCamellia192Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 192);
            }
            else if (NttObjectIdentifiers.IdCamellia256Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 256);
            }
            else if (KisaObjectIdentifiers.IdSeedCbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 128);
            }
            else if (AlgorithmIdentifierFactory.CAST5_CBC.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 128);
            }
            else if (OiwObjectIdentifiers.DesCbc.Equals(algorithm))
            {
                DesKeyGenerator keyGen = new DesKeyGenerator();
                keyGen.Init(new KeyGenerationParameters(random, 64));
                return keyGen;
            }
            else if (PkcsObjectIdentifiers.rc4.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 128);
            }
            else if (PkcsObjectIdentifiers.RC2Cbc.Equals(algorithm))
            {
                return CreateCipherKeyGenerator(random, 128);
            }
            else
            {
                throw new InvalidOperationException("cannot recognise cipher: " + algorithm);
            }
        }

        private static CipherKeyGenerator CreateCipherKeyGenerator(SecureRandom random, int keySize)
        {
            CipherKeyGenerator keyGen = new CipherKeyGenerator();
            keyGen.Init(new KeyGenerationParameters(random, keySize));
            return keyGen;
        }
    }
}