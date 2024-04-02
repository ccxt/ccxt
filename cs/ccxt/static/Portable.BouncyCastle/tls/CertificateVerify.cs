using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class CertificateVerify
    {
        private readonly int m_algorithm;
        private readonly byte[] m_signature;

        public CertificateVerify(int algorithm, byte[] signature)
        {
            if (!TlsUtilities.IsValidUint16(algorithm))
                throw new ArgumentException("algorithm");
            if (signature == null)
                throw new ArgumentNullException("signature");

            this.m_algorithm = algorithm;
            this.m_signature = signature;
        }

        /// <returns>a <see cref="SignatureScheme"/> value.</returns>
        public int Algorithm
        {
            get { return m_algorithm; }
        }

        public byte[] Signature
        {
            get { return m_signature; }
        }

        /// <summary>Encode this <see cref="CertificateVerify"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint16(m_algorithm, output);
            TlsUtilities.WriteOpaque16(m_signature, output);
        }

        /// <summary>Parse a <see cref="CertificateVerify"/> from a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="CertificateVerify"/> object.</returns>
        /// <exception cref="IOException"/>
        public static CertificateVerify Parse(TlsContext context, Stream input)
        {
            if (!TlsUtilities.IsTlsV13(context))
                throw new InvalidOperationException();

            int algorithm = TlsUtilities.ReadUint16(input);
            byte[] signature = TlsUtilities.ReadOpaque16(input);
            return new CertificateVerify(algorithm, signature);
        }
    }
}
