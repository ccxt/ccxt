using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class DigitallySigned
    {
        private readonly SignatureAndHashAlgorithm m_algorithm;
        private readonly byte[] m_signature;

        public DigitallySigned(SignatureAndHashAlgorithm algorithm, byte[] signature)
        {
            if (signature == null)
                throw new ArgumentNullException("signature");

            this.m_algorithm = algorithm;
            this.m_signature = signature;
        }

        /// <returns>a <see cref="SignatureAndHashAlgorithm"/> (or null before TLS 1.2).</returns>
        public SignatureAndHashAlgorithm Algorithm
        {
            get { return m_algorithm; }
        }

        public byte[] Signature
        {
            get { return m_signature; }
        }

        /// <summary>Encode this <see cref="DigitallySigned"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            if (m_algorithm != null)
            {
                m_algorithm.Encode(output);
            }
            TlsUtilities.WriteOpaque16(m_signature, output);
        }

        /// <summary>Parse a <see cref="DigitallySigned"/> from a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="DigitallySigned"/> object.</returns>
        /// <exception cref="IOException"/>
        public static DigitallySigned Parse(TlsContext context, Stream input)
        {
            SignatureAndHashAlgorithm algorithm = null;
            if (TlsUtilities.IsTlsV12(context))
            {
                algorithm = SignatureAndHashAlgorithm.Parse(input);

                if (SignatureAlgorithm.anonymous == algorithm.Signature)
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }
            byte[] signature = TlsUtilities.ReadOpaque16(input);
            return new DigitallySigned(algorithm, signature);
        }
    }
}
