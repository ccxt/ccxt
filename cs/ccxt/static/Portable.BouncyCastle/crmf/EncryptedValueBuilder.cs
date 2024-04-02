using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Crmf
{
    public class EncryptedValueBuilder
    {
        private readonly IKeyWrapper wrapper;
        private readonly ICipherBuilderWithKey encryptor;
        private readonly IEncryptedValuePadder padder;

        ///
        /// Create a builder that makes EncryptedValue structures.
        ///
        /// <param name="wrapper">wrapper a wrapper for key used to encrypt the actual data contained in the EncryptedValue.</param>
        /// <param name="encryptor">encryptor  an output encryptor to encrypt the actual data contained in the EncryptedValue. </param>
        ///
        public EncryptedValueBuilder(IKeyWrapper wrapper, ICipherBuilderWithKey encryptor)
            : this(wrapper, encryptor, null)
        {
        }

        ///
        /// Create a builder that makes EncryptedValue structures with fixed length blocks padded using the passed in padder.
        ///
        /// <param name="wrapper">a wrapper for key used to encrypt the actual data contained in the EncryptedValue.</param>
        /// <param name="encryptor">encryptor  an output encryptor to encrypt the actual data contained in the EncryptedValue.</param>
        /// <param name="padder">padder a padder to ensure that the EncryptedValue created will always be a constant length.</param>
        ///
        public EncryptedValueBuilder(IKeyWrapper wrapper, ICipherBuilderWithKey encryptor, IEncryptedValuePadder padder)
        {
            this.wrapper = wrapper;
            this.encryptor = encryptor;
            this.padder = padder;
        }

        ///
        /// Build an EncryptedValue structure containing the passed in pass phrase.
        ///
        /// <param name="revocationPassphrase">a revocation pass phrase.</param>
        ///<returns>an EncryptedValue containing the encrypted pass phrase.</returns>       
        ///
        public EncryptedValue Build(char[] revocationPassphrase)
        {
            return EncryptData(PadData(Strings.ToUtf8ByteArray(revocationPassphrase)));
        }

        ///<summary>
        /// Build an EncryptedValue structure containing the certificate contained in
        /// the passed in holder.
        ///</summary>
        /// <param name="holder">a holder containing a certificate.</param>
        ///  <returns>an EncryptedValue containing the encrypted certificate.</returns>
        /// <exception cref="CrmfException">on a failure to encrypt the data, or wrap the symmetric key for this value.</exception>
        ///
        public EncryptedValue Build(X509Certificate holder)
        {
            try
            {
                return EncryptData(PadData(holder.GetEncoded()));
            }
            catch (IOException e)
            {
                throw new CrmfException("cannot encode certificate: " + e.Message, e);
            }
        }

        ///<summary>
        /// Build an EncryptedValue structure containing the private key contained in
        /// the passed info structure.
        ///</summary>
        /// <param name="privateKeyInfo">a PKCS#8 private key info structure.</param>
        /// <returns>an EncryptedValue containing an EncryptedPrivateKeyInfo structure.</returns>
        /// <exception cref="CrmfException">on a failure to encrypt the data, or wrap the symmetric key for this value.</exception>
        ///
        public EncryptedValue Build(PrivateKeyInfo privateKeyInfo)
        {
            Pkcs8EncryptedPrivateKeyInfoBuilder encInfoBldr = new Pkcs8EncryptedPrivateKeyInfoBuilder(privateKeyInfo);

            AlgorithmIdentifier intendedAlg = privateKeyInfo.PrivateKeyAlgorithm;
            AlgorithmIdentifier symmAlg = (AlgorithmIdentifier)encryptor.AlgorithmDetails;
            DerBitString encSymmKey;

            try
            {
                Pkcs8EncryptedPrivateKeyInfo encInfo = encInfoBldr.Build(encryptor);

                encSymmKey = new DerBitString(wrapper.Wrap(((KeyParameter)encryptor.Key).GetKey()).Collect());

                AlgorithmIdentifier keyAlg = (AlgorithmIdentifier)wrapper.AlgorithmDetails;
                Asn1OctetString valueHint = null;

                return new EncryptedValue(intendedAlg, symmAlg, encSymmKey, keyAlg, valueHint, new DerBitString(encInfo.GetEncryptedData()));
            }
            catch (Exception e)
            {
                throw new CrmfException("cannot wrap key: " + e.Message, e);
            }
        }

        private EncryptedValue EncryptData(byte[] data)
        {
            MemoryOutputStream bOut = new MemoryOutputStream();
            Stream eOut = encryptor.BuildCipher(bOut).Stream;

            try
            {
                eOut.Write(data, 0, data.Length);
                Platform.Dispose(eOut);
            }
            catch (IOException e)
            {
                throw new CrmfException("cannot process data: " + e.Message, e);
            }

            AlgorithmIdentifier intendedAlg = null;
            AlgorithmIdentifier symmAlg = (AlgorithmIdentifier)encryptor.AlgorithmDetails;

            DerBitString encSymmKey;
            try
            {
                encSymmKey = new DerBitString(wrapper.Wrap(((KeyParameter)encryptor.Key).GetKey()).Collect());
            }
            catch (Exception e)
            {
                throw new CrmfException("cannot wrap key: " + e.Message, e);
            }

            AlgorithmIdentifier keyAlg = (AlgorithmIdentifier)wrapper.AlgorithmDetails;
            Asn1OctetString valueHint = null;
            DerBitString encValue = new DerBitString(bOut.ToArray());

            return new EncryptedValue(intendedAlg, symmAlg, encSymmKey, keyAlg, valueHint, encValue);
        }

        private byte[] PadData(byte[] data)
        {
            if (padder != null)
            {
                return padder.GetPaddedData(data);
            }

            return data;
        }
    }
}
