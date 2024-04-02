using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    public sealed class LegacyTls13Verifier
        : TlsVerifier
    {
        private readonly int m_signatureScheme;
        private readonly Tls13Verifier m_tls13Verifier;

        public LegacyTls13Verifier(int signatureScheme, Tls13Verifier tls13Verifier)
        {
            if (!TlsUtilities.IsValidUint16(signatureScheme))
                throw new ArgumentException("signatureScheme");
            if (tls13Verifier == null)
                throw new ArgumentNullException("tls13Verifier");

            this.m_signatureScheme = signatureScheme;
            this.m_tls13Verifier = tls13Verifier;
        }

        public TlsStreamVerifier GetStreamVerifier(DigitallySigned digitallySigned)
        {
            SignatureAndHashAlgorithm algorithm = digitallySigned.Algorithm;
            if (algorithm == null || SignatureScheme.From(algorithm) != m_signatureScheme)
                throw new InvalidOperationException("Invalid algorithm: " + algorithm);

            return new TlsStreamVerifierImpl(m_tls13Verifier, digitallySigned.Signature);
        }

        public bool VerifyRawSignature(DigitallySigned digitallySigned, byte[] hash)
        {
            throw new NotSupportedException();
        }

        private class TlsStreamVerifierImpl
            : TlsStreamVerifier
        {
            private readonly Tls13Verifier m_tls13Verifier;
            private readonly byte[] m_signature;

            internal TlsStreamVerifierImpl(Tls13Verifier tls13Verifier, byte[] signature)
            {
                this.m_tls13Verifier = tls13Verifier;
                this.m_signature = signature;
            }

            public Stream Stream
            {
                get { return m_tls13Verifier.Stream; }
            }

            public bool IsVerified()
            {
                return m_tls13Verifier.VerifySignature(m_signature);
            }
        }
    }
}
