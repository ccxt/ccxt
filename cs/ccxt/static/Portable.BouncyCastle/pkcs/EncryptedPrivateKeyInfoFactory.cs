using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pkcs
{
    public sealed class EncryptedPrivateKeyInfoFactory
    {
        private EncryptedPrivateKeyInfoFactory()
        {
        }

        public static EncryptedPrivateKeyInfo CreateEncryptedPrivateKeyInfo(
            DerObjectIdentifier		algorithm,
            char[]					passPhrase,
            byte[]					salt,
            int						iterationCount,
            AsymmetricKeyParameter	key)
        {
            return CreateEncryptedPrivateKeyInfo(
                algorithm.Id, passPhrase, salt, iterationCount,
                PrivateKeyInfoFactory.CreatePrivateKeyInfo(key));
        }

        public static EncryptedPrivateKeyInfo CreateEncryptedPrivateKeyInfo(
            string					algorithm,
            char[]					passPhrase,
            byte[]					salt,
            int						iterationCount,
            AsymmetricKeyParameter	key)
        {
            return CreateEncryptedPrivateKeyInfo(
                algorithm, passPhrase, salt, iterationCount,
                PrivateKeyInfoFactory.CreatePrivateKeyInfo(key));
        }

        public static EncryptedPrivateKeyInfo CreateEncryptedPrivateKeyInfo(
            string			algorithm,
            char[]			passPhrase,
            byte[]			salt,
            int				iterationCount,
            PrivateKeyInfo	keyInfo)
        {
            IBufferedCipher cipher = PbeUtilities.CreateEngine(algorithm) as IBufferedCipher;
            if (cipher == null)
                throw new Exception("Unknown encryption algorithm: " + algorithm);

            Asn1Encodable pbeParameters = PbeUtilities.GenerateAlgorithmParameters(
                algorithm, salt, iterationCount);
            ICipherParameters cipherParameters = PbeUtilities.GenerateCipherParameters(
                algorithm, passPhrase, pbeParameters);
            cipher.Init(true, cipherParameters);
            byte[] encoding = cipher.DoFinal(keyInfo.GetEncoded());

            DerObjectIdentifier oid = PbeUtilities.GetObjectIdentifier(algorithm);
            AlgorithmIdentifier algID = new AlgorithmIdentifier(oid, pbeParameters);
            return new EncryptedPrivateKeyInfo(algID, encoding);
        }

        public static EncryptedPrivateKeyInfo CreateEncryptedPrivateKeyInfo(
            DerObjectIdentifier cipherAlgorithm,
            DerObjectIdentifier prfAlgorithm,
            char[] passPhrase,
            byte[] salt,
            int iterationCount,
            SecureRandom random,
            AsymmetricKeyParameter key)
        {
            return CreateEncryptedPrivateKeyInfo(
                cipherAlgorithm, prfAlgorithm, passPhrase, salt, iterationCount, random,
                PrivateKeyInfoFactory.CreatePrivateKeyInfo(key));
        }

        public static EncryptedPrivateKeyInfo CreateEncryptedPrivateKeyInfo(
            DerObjectIdentifier cipherAlgorithm,
            DerObjectIdentifier prfAlgorithm,
            char[] passPhrase,
            byte[] salt,
            int iterationCount,
            SecureRandom random,
            PrivateKeyInfo keyInfo)
        {
            IBufferedCipher cipher = CipherUtilities.GetCipher(cipherAlgorithm) as IBufferedCipher;
            if (cipher == null)
                throw new Exception("Unknown encryption algorithm: " + cipherAlgorithm);

            Asn1Encodable pbeParameters = PbeUtilities.GenerateAlgorithmParameters(
                cipherAlgorithm, prfAlgorithm, salt, iterationCount, random);
            ICipherParameters cipherParameters = PbeUtilities.GenerateCipherParameters(
                PkcsObjectIdentifiers.IdPbeS2, passPhrase, pbeParameters);
            cipher.Init(true, cipherParameters);
            byte[] encoding = cipher.DoFinal(keyInfo.GetEncoded());

            AlgorithmIdentifier algID = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdPbeS2, pbeParameters);
            return new EncryptedPrivateKeyInfo(algID, encoding);
        }
    }
}
