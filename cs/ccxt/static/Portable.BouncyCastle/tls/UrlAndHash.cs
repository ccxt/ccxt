using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 6066 5.</summary>
    public sealed class UrlAndHash
    {
        private readonly string m_url;
        private readonly byte[] m_sha1Hash;

        public UrlAndHash(string url, byte[] sha1Hash)
        {
            if (TlsUtilities.IsNullOrEmpty(url) || url.Length >= (1 << 16))
                throw new ArgumentException("must have length from 1 to (2^16 - 1)", "url");
            if (sha1Hash != null && sha1Hash.Length != 20)
                throw new ArgumentException("must have length == 20, if present", "sha1Hash");

            this.m_url = url;
            this.m_sha1Hash = sha1Hash;
        }

        public string Url
        {
            get { return m_url; }
        }

        public byte[] Sha1Hash
        {
            get { return m_sha1Hash; }
        }

        /// <summary>Encode this <see cref="UrlAndHash"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            byte[] urlEncoding = Strings.ToByteArray(m_url);
            TlsUtilities.WriteOpaque16(urlEncoding, output);

            if (m_sha1Hash == null)
            {
                TlsUtilities.WriteUint8(0, output);
            }
            else
            {
                TlsUtilities.WriteUint8(1, output);
                output.Write(m_sha1Hash, 0, m_sha1Hash.Length);
            }
        }

        /// <summary>Parse a <see cref="UrlAndHash"/> from a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="UrlAndHash"/> object.</returns>
        /// <exception cref="IOException"/>
        public static UrlAndHash Parse(TlsContext context, Stream input)
        {
            byte[] urlEncoding = TlsUtilities.ReadOpaque16(input, 1);
            string url = Strings.FromByteArray(urlEncoding);

            byte[] sha1Hash = null;
            short padding = TlsUtilities.ReadUint8(input);
            switch (padding)
            {
            case 0:
                if (TlsUtilities.IsTlsV12(context))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                break;
            case 1:
                sha1Hash = TlsUtilities.ReadFully(20, input);
                break;
            default:
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            return new UrlAndHash(url, sha1Hash);
        }
    }
}
