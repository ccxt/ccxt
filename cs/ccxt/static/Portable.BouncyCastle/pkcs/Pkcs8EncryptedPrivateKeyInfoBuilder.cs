using System;
using System.IO;

using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Pkcs
{
    public class Pkcs8EncryptedPrivateKeyInfoBuilder
    {
        private PrivateKeyInfo privateKeyInfo;

        public Pkcs8EncryptedPrivateKeyInfoBuilder(byte[] privateKeyInfo):  this(PrivateKeyInfo.GetInstance(privateKeyInfo))
        {
        }

        public Pkcs8EncryptedPrivateKeyInfoBuilder(PrivateKeyInfo privateKeyInfo)
        {
            this.privateKeyInfo = privateKeyInfo;
        }

        /// <summary>
        /// Create the encrypted private key info using the passed in encryptor.
        /// </summary>
        /// <param name="encryptor">The encryptor to use.</param>
        /// <returns>An encrypted private key info containing the original private key info.</returns>
        public Pkcs8EncryptedPrivateKeyInfo Build(
            ICipherBuilder encryptor)
        {
            try
            {
                MemoryStream bOut = new MemoryOutputStream();
                ICipher cOut = encryptor.BuildCipher(bOut);
                byte[] keyData = privateKeyInfo.GetEncoded();

                Stream str = cOut.Stream;
                str.Write(keyData, 0, keyData.Length);
                Platform.Dispose(str);

                return new Pkcs8EncryptedPrivateKeyInfo(new EncryptedPrivateKeyInfo((AlgorithmIdentifier)encryptor.AlgorithmDetails, bOut.ToArray()));
            }
            catch (IOException)
            {
                throw new InvalidOperationException("cannot encode privateKeyInfo");
            }
        }
    }
}
