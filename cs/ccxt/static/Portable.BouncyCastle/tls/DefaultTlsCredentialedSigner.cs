using System;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Tls.Crypto.Impl;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Container class for generating signatures that carries the signature type, parameters, public key
    /// certificate and public key's associated signer object.</summary>
    public class DefaultTlsCredentialedSigner
        : TlsCredentialedSigner
    {
        protected readonly TlsCryptoParameters m_cryptoParams;
        protected readonly Certificate m_certificate;
        protected readonly SignatureAndHashAlgorithm m_signatureAndHashAlgorithm;
        protected readonly TlsSigner m_signer;

        public DefaultTlsCredentialedSigner(TlsCryptoParameters cryptoParams, TlsSigner signer,
            Certificate certificate, SignatureAndHashAlgorithm signatureAndHashAlgorithm)
        {
            if (certificate == null)
                throw new ArgumentNullException("certificate");
            if (certificate.IsEmpty)
                throw new ArgumentException("cannot be empty", "certificate");
            if (signer == null)
                throw new ArgumentNullException("signer");

            this.m_cryptoParams = cryptoParams;
            this.m_certificate = certificate;
            this.m_signatureAndHashAlgorithm = signatureAndHashAlgorithm;
            this.m_signer = signer;
        }

        public virtual Certificate Certificate
        {
            get { return m_certificate; }
        }

        public virtual byte[] GenerateRawSignature(byte[] hash)
        {
            return m_signer.GenerateRawSignature(GetEffectiveAlgorithm(), hash);
        }

        public virtual SignatureAndHashAlgorithm SignatureAndHashAlgorithm
        {
            get { return m_signatureAndHashAlgorithm; }
        }

        public virtual TlsStreamSigner GetStreamSigner()
        {
            return m_signer.GetStreamSigner(GetEffectiveAlgorithm());
        }

        protected virtual SignatureAndHashAlgorithm GetEffectiveAlgorithm()
        {
            SignatureAndHashAlgorithm algorithm = null;
            if (TlsImplUtilities.IsTlsV12(m_cryptoParams))
            {
                algorithm = SignatureAndHashAlgorithm;
                if (algorithm == null)
                    throw new InvalidOperationException("'signatureAndHashAlgorithm' cannot be null for (D)TLS 1.2+");
            }
            return algorithm;
        }
    }
}
