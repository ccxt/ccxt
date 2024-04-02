
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Cms
{
    internal class EnvelopedDataHelper
    {
        //private static readonly IDictionary<DerObjectIdentifier, string> BaseCipherNames =
        //    new Dictionary<DerObjectIdentifier, string>();
        //private static readonly IDictionary<DerObjectIdentifier, string> MacAlgNames =
        //    new Dictionary<DerObjectIdentifier, string>();
        //private static readonly IDictionary<DerObjectIdentifier, string> PrfDigests =
        //    new Dictionary<DerObjectIdentifier, string>();

        //static EnvelopedDataHelper()
        //{
        //    PrfDigests.Add(PkcsObjectIdentifiers.IdHmacWithSha1, "SHA-1");
        //    PrfDigests.Add(PkcsObjectIdentifiers.IdHmacWithSha224, "SHA-224");
        //    PrfDigests.Add(PkcsObjectIdentifiers.IdHmacWithSha256, "SHA-256");
        //    PrfDigests.Add(PkcsObjectIdentifiers.IdHmacWithSha384, "SHA-384");
        //    PrfDigests.Add(PkcsObjectIdentifiers.IdHmacWithSha512, "SHA-512");

        //    BaseCipherNames.Add(PkcsObjectIdentifiers.DesEde3Cbc, "DESEDE");
        //    BaseCipherNames.Add(NistObjectIdentifiers.IdAes128Cbc, "AES");
        //    BaseCipherNames.Add(NistObjectIdentifiers.IdAes192Cbc, "AES");
        //    BaseCipherNames.Add(NistObjectIdentifiers.IdAes256Cbc, "AES");

        //    MacAlgNames.Add(PkcsObjectIdentifiers.DesEde3Cbc, "DESEDEMac");
        //    MacAlgNames.Add(NistObjectIdentifiers.IdAes128Cbc, "AESMac");
        //    MacAlgNames.Add(NistObjectIdentifiers.IdAes192Cbc, "AESMac");
        //    MacAlgNames.Add(NistObjectIdentifiers.IdAes256Cbc, "AESMac");
        //    MacAlgNames.Add(PkcsObjectIdentifiers.RC2Cbc, "RC2Mac");
        //}

        //internal static IDigest GetPrf(AlgorithmIdentifier algID)
        //{
        //    string digestName = (string)PrfDigests[algID];

        //    return DigestUtilities.GetDigest(digestName);
        //}

        //internal static IWrapper CreateRfc3211Wrapper(DerObjectIdentifier algorithm)
        //{
        //    if (NistObjectIdentifiers.IdAes128Cbc.Equals(algorithm)
        //        || NistObjectIdentifiers.IdAes192Cbc.Equals(algorithm)
        //        || NistObjectIdentifiers.IdAes256Cbc.Equals(algorithm))
        //    {
        //        return new Rfc3211WrapEngine(AesUtilities.CreateEngine());
        //    }
        //    else if (PkcsObjectIdentifiers.DesEde3Cbc.Equals(algorithm))
        //    {
        //        return new Rfc3211WrapEngine(new DesEdeEngine());
        //    }
        //    else if (OiwObjectIdentifiers.DesCbc.Equals(algorithm))
        //    {
        //        return new Rfc3211WrapEngine(new DesEngine());
        //    }
        //    else if (PkcsObjectIdentifiers.RC2Cbc.Equals(algorithm))
        //    {
        //        return new Rfc3211WrapEngine(new RC2Engine());
        //    }
        //    else
        //    {
        //        throw new CmsException("cannot recognise wrapper: " + algorithm);
        //    }
        //}

        public static object CreateContentCipher(bool forEncryption, ICipherParameters encKey,
             AlgorithmIdentifier encryptionAlgID)
        {
            return CipherFactory.CreateContentCipher(forEncryption, encKey, encryptionAlgID);
        }

        public AlgorithmIdentifier GenerateEncryptionAlgID(DerObjectIdentifier encryptionOID, KeyParameter encKey,
            SecureRandom random)
        {
            return AlgorithmIdentifierFactory.GenerateEncryptionAlgID(encryptionOID, encKey.GetKey().Length * 8, random);
        }

        public CipherKeyGenerator CreateKeyGenerator(DerObjectIdentifier algorithm, SecureRandom random)
        {
            return CipherKeyGeneratorFactory.CreateKeyGenerator(algorithm, random);
        }
    }
}
