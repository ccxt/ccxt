using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    /// <summary>A generic TLS 1.2 AEAD cipher.</summary>
    public class TlsAeadCipher
        : TlsCipher
    {
        public const int AEAD_CCM = 1;
        public const int AEAD_CHACHA20_POLY1305 = 2;
        public const int AEAD_GCM = 3;

        private const int NONCE_RFC5288 = 1;
        private const int NONCE_RFC7905 = 2;

        protected readonly TlsCryptoParameters m_cryptoParams;
        protected readonly int m_keySize;
        protected readonly int m_macSize;
        protected readonly int m_fixed_iv_length;
        protected readonly int m_record_iv_length;

        protected readonly TlsAeadCipherImpl m_decryptCipher, m_encryptCipher;
        protected readonly byte[] m_decryptNonce, m_encryptNonce;

        protected readonly bool m_isTlsV13;
        protected readonly int m_nonceMode;

        /// <exception cref="IOException"/>
        public TlsAeadCipher(TlsCryptoParameters cryptoParams, TlsAeadCipherImpl encryptCipher,
            TlsAeadCipherImpl decryptCipher, int keySize, int macSize, int aeadType)
        {
            SecurityParameters securityParameters = cryptoParams.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (!TlsImplUtilities.IsTlsV12(negotiatedVersion))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            this.m_isTlsV13 = TlsImplUtilities.IsTlsV13(negotiatedVersion);
            this.m_nonceMode = GetNonceMode(m_isTlsV13, aeadType);

            switch (m_nonceMode)
            {
            case NONCE_RFC5288:
                this.m_fixed_iv_length = 4;
                this.m_record_iv_length = 8;
                break;
            case NONCE_RFC7905:
                this.m_fixed_iv_length = 12;
                this.m_record_iv_length = 0;
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            this.m_cryptoParams = cryptoParams;
            this.m_keySize = keySize;
            this.m_macSize = macSize;

            this.m_decryptCipher = decryptCipher;
            this.m_encryptCipher = encryptCipher;

            this.m_decryptNonce = new byte[m_fixed_iv_length];
            this.m_encryptNonce = new byte[m_fixed_iv_length];

            bool isServer = cryptoParams.IsServer;
            if (m_isTlsV13)
            {
                RekeyCipher(securityParameters, decryptCipher, m_decryptNonce, !isServer);
                RekeyCipher(securityParameters, encryptCipher, m_encryptNonce, isServer);
                return;
            }

            int keyBlockSize = (2 * keySize) + (2 * m_fixed_iv_length);
            byte[] keyBlock = TlsImplUtilities.CalculateKeyBlock(cryptoParams, keyBlockSize);
            int pos = 0;

            if (isServer)
            {
                decryptCipher.SetKey(keyBlock, pos, keySize); pos += keySize;
                encryptCipher.SetKey(keyBlock, pos, keySize); pos += keySize;

                Array.Copy(keyBlock, pos, m_decryptNonce, 0, m_fixed_iv_length); pos += m_fixed_iv_length;
                Array.Copy(keyBlock, pos, m_encryptNonce, 0, m_fixed_iv_length); pos += m_fixed_iv_length;
            }
            else
            {
                encryptCipher.SetKey(keyBlock, pos, keySize); pos += keySize;
                decryptCipher.SetKey(keyBlock, pos, keySize); pos += keySize;

                Array.Copy(keyBlock, pos, m_encryptNonce, 0, m_fixed_iv_length); pos += m_fixed_iv_length;
                Array.Copy(keyBlock, pos, m_decryptNonce, 0, m_fixed_iv_length); pos += m_fixed_iv_length;
            }

            if (keyBlockSize != pos)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            int nonceLength = m_fixed_iv_length + m_record_iv_length;

            // NOTE: Ensure dummy nonce is not part of the generated sequence(s)
            byte[] dummyNonce = new byte[nonceLength];
            dummyNonce[0] = (byte)~m_encryptNonce[0];
            dummyNonce[1] = (byte)~m_decryptNonce[1];

            encryptCipher.Init(dummyNonce, macSize, null);
            decryptCipher.Init(dummyNonce, macSize, null);
        }

        public virtual int GetCiphertextDecodeLimit(int plaintextLimit)
        {
            return plaintextLimit + m_macSize + m_record_iv_length + (m_isTlsV13 ? 1 : 0);
        }

        public virtual int GetCiphertextEncodeLimit(int plaintextLength, int plaintextLimit)
        {
            int innerPlaintextLimit = plaintextLength;
            if (m_isTlsV13)
            {
                // TODO[tls13] Add support for padding
                int maxPadding = 0;

                innerPlaintextLimit = 1 + System.Math.Min(plaintextLimit, plaintextLength + maxPadding);
            }

            return innerPlaintextLimit + m_macSize + m_record_iv_length;
        }

        public virtual int GetPlaintextLimit(int ciphertextLimit)
        {
            return ciphertextLimit - m_macSize - m_record_iv_length - (m_isTlsV13 ? 1 : 0);
        }

        public virtual TlsEncodeResult EncodePlaintext(long seqNo, short contentType, ProtocolVersion recordVersion,
            int headerAllocation, byte[] plaintext, int plaintextOffset, int plaintextLength)
        {
            byte[] nonce = new byte[m_encryptNonce.Length + m_record_iv_length];

            switch (m_nonceMode)
            {
            case NONCE_RFC5288:
                Array.Copy(m_encryptNonce, 0, nonce, 0, m_encryptNonce.Length);
                // RFC 5288/6655: The nonce_explicit MAY be the 64-bit sequence number.
                TlsUtilities.WriteUint64(seqNo, nonce, m_encryptNonce.Length);
                break;
            case NONCE_RFC7905:
                TlsUtilities.WriteUint64(seqNo, nonce, nonce.Length - 8);
                for (int i = 0; i < m_encryptNonce.Length; ++i)
                {
                    nonce[i] ^= m_encryptNonce[i];
                }
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            int extraLength = m_isTlsV13 ? 1 : 0;

            // TODO[tls13] If we support adding padding to TLSInnerPlaintext, this will need review
            int encryptionLength = m_encryptCipher.GetOutputSize(plaintextLength + extraLength);
            int ciphertextLength = m_record_iv_length + encryptionLength;

            byte[] output = new byte[headerAllocation + ciphertextLength];
            int outputPos = headerAllocation;

            if (m_record_iv_length != 0)
            {
                Array.Copy(nonce, nonce.Length - m_record_iv_length, output, outputPos, m_record_iv_length);
                outputPos += m_record_iv_length;
            }

            short recordType = m_isTlsV13 ? ContentType.application_data : contentType;

            byte[] additionalData = GetAdditionalData(seqNo, recordType, recordVersion, ciphertextLength,
                plaintextLength);

            try
            {
                Array.Copy(plaintext, plaintextOffset, output, outputPos, plaintextLength);
                if (m_isTlsV13)
                {
                    output[outputPos + plaintextLength] = (byte)contentType;
                }

                m_encryptCipher.Init(nonce, m_macSize, additionalData);
                outputPos += m_encryptCipher.DoFinal(output, outputPos, plaintextLength + extraLength, output,
                    outputPos);
            }
            catch (IOException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new TlsFatalAlert(AlertDescription.internal_error, e);
            }

            if (outputPos != output.Length)
            {
                // NOTE: The additional data mechanism for AEAD ciphers requires exact output size prediction.
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            return new TlsEncodeResult(output, 0, output.Length, recordType);
        }

        public virtual TlsDecodeResult DecodeCiphertext(long seqNo, short recordType, ProtocolVersion recordVersion,
            byte[] ciphertext, int ciphertextOffset, int ciphertextLength)
        {
            if (GetPlaintextLimit(ciphertextLength) < 0)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            byte[] nonce = new byte[m_decryptNonce.Length + m_record_iv_length];

            switch (m_nonceMode)
            {
            case NONCE_RFC5288:
                Array.Copy(m_decryptNonce, 0, nonce, 0, m_decryptNonce.Length);
                Array.Copy(ciphertext, ciphertextOffset, nonce, nonce.Length - m_record_iv_length,
                    m_record_iv_length);
                break;
            case NONCE_RFC7905:
                TlsUtilities.WriteUint64(seqNo, nonce, nonce.Length - 8);
                for (int i = 0; i < m_decryptNonce.Length; ++i)
                {
                    nonce[i] ^= m_decryptNonce[i];
                }
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            int encryptionOffset = ciphertextOffset + m_record_iv_length;
            int encryptionLength = ciphertextLength - m_record_iv_length;
            int plaintextLength = m_decryptCipher.GetOutputSize(encryptionLength);

            byte[] additionalData = GetAdditionalData(seqNo, recordType, recordVersion, ciphertextLength,
                plaintextLength);

            int outputPos;
            try
            {
                m_decryptCipher.Init(nonce, m_macSize, additionalData);
                outputPos = m_decryptCipher.DoFinal(ciphertext, encryptionOffset, encryptionLength, ciphertext,
                    encryptionOffset);
            }
            catch (IOException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new TlsFatalAlert(AlertDescription.bad_record_mac, e);
            }

            if (outputPos != plaintextLength)
            {
                // NOTE: The additional data mechanism for AEAD ciphers requires exact output size prediction.
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            short contentType = recordType;
            if (m_isTlsV13)
            {
                // Strip padding and read true content type from TLSInnerPlaintext
                int pos = plaintextLength;
                for (;;)
                {
                    if (--pos < 0)
                        throw new TlsFatalAlert(AlertDescription.unexpected_message);

                    byte octet = ciphertext[encryptionOffset + pos];
                    if (0 != octet)
                    {
                        contentType = (short)(octet & 0xFF);
                        plaintextLength = pos;
                        break;
                    }
                }
            }

            return new TlsDecodeResult(ciphertext, encryptionOffset, plaintextLength, contentType);
        }

        public virtual void RekeyDecoder()
        {
            RekeyCipher(m_cryptoParams.SecurityParameters, m_decryptCipher, m_decryptNonce, !m_cryptoParams.IsServer);
        }

        public virtual void RekeyEncoder()
        {
            RekeyCipher(m_cryptoParams.SecurityParameters, m_encryptCipher, m_encryptNonce, m_cryptoParams.IsServer);
        }

        public virtual bool UsesOpaqueRecordType
        {
            get { return m_isTlsV13; }
        }

        protected virtual byte[] GetAdditionalData(long seqNo, short recordType, ProtocolVersion recordVersion,
            int ciphertextLength, int plaintextLength)
        {
            if (m_isTlsV13)
            {
                /*
                 * TLSCiphertext.opaque_type || TLSCiphertext.legacy_record_version || TLSCiphertext.length
                 */
                byte[] additional_data = new byte[5];
                TlsUtilities.WriteUint8(recordType, additional_data, 0);
                TlsUtilities.WriteVersion(recordVersion, additional_data, 1);
                TlsUtilities.WriteUint16(ciphertextLength, additional_data, 3);
                return additional_data;
            }
            else
            {
                /*
                 * seq_num + TLSCompressed.type + TLSCompressed.version + TLSCompressed.length
                 */
                byte[] additional_data = new byte[13];
                TlsUtilities.WriteUint64(seqNo, additional_data, 0);
                TlsUtilities.WriteUint8(recordType, additional_data, 8);
                TlsUtilities.WriteVersion(recordVersion, additional_data, 9);
                TlsUtilities.WriteUint16(plaintextLength, additional_data, 11);
                return additional_data;
            }
        }

        protected virtual void RekeyCipher(SecurityParameters securityParameters, TlsAeadCipherImpl cipher,
            byte[] nonce, bool serverSecret)
        {
            if (!m_isTlsV13)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            TlsSecret secret = serverSecret
                ?   securityParameters.TrafficSecretServer
                :   securityParameters.TrafficSecretClient;

            // TODO[tls13] For early data, have to disable server->client
            if (null == secret)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            Setup13Cipher(cipher, nonce, secret, securityParameters.PrfCryptoHashAlgorithm);
        }

        protected virtual void Setup13Cipher(TlsAeadCipherImpl cipher, byte[] nonce, TlsSecret secret,
            int cryptoHashAlgorithm)
        {
            byte[] key = TlsCryptoUtilities.HkdfExpandLabel(secret, cryptoHashAlgorithm, "key",
                TlsUtilities.EmptyBytes, m_keySize).Extract();
            byte[] iv = TlsCryptoUtilities.HkdfExpandLabel(secret, cryptoHashAlgorithm, "iv", TlsUtilities.EmptyBytes,
                m_fixed_iv_length).Extract();

            cipher.SetKey(key, 0, m_keySize);
            Array.Copy(iv, 0, nonce, 0, m_fixed_iv_length);

            // NOTE: Ensure dummy nonce is not part of the generated sequence(s)
            iv[0] ^= 0x80;
            cipher.Init(iv, m_macSize, null);
        }

        private static int GetNonceMode(bool isTLSv13, int aeadType)
        {
            switch (aeadType)
            {
            case AEAD_CCM:
            case AEAD_GCM:
                return isTLSv13 ? NONCE_RFC7905 : NONCE_RFC5288;

            case AEAD_CHACHA20_POLY1305:
                return NONCE_RFC7905;

            default:
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }
    }
}
