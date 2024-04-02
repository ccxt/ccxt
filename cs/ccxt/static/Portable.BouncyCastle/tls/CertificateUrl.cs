using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 3546 3.3</summary>
    public sealed class CertificateUrl
    {
        private readonly short m_type;
        private readonly IList<UrlAndHash> m_urlAndHashList;

        /// <param name="type">see <see cref="CertChainType"/> for valid constants.</param>
        /// <param name="urlAndHashList">an <see cref="IList{T}"/> of <see cref="UrlAndHash"/>.</param>
        public CertificateUrl(short type, IList<UrlAndHash> urlAndHashList)
        {
            if (!CertChainType.IsValid(type))
                throw new ArgumentException("not a valid CertChainType value", "type");
            if (urlAndHashList == null || urlAndHashList.Count < 1)
                throw new ArgumentException("must have length > 0", "urlAndHashList");
            if (type == CertChainType.pkipath && urlAndHashList.Count != 1)
                throw new ArgumentException("must contain exactly one entry when type is "
                    + CertChainType.GetText(type), "urlAndHashList");

            this.m_type = type;
            this.m_urlAndHashList = urlAndHashList;
        }

        /// <returns><see cref="CertChainType"/></returns>
        public short Type
        {
            get { return m_type; }
        }

        /// <returns>an <see cref="IList{T}"/> of <see cref="UrlAndHash"/>.</returns>
        public IList<UrlAndHash> UrlAndHashList
        {
            get { return m_urlAndHashList; }
        }

        /// <summary>Encode this <see cref="CertificateUrl"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(m_type, output);

            ListBuffer16 buf = new ListBuffer16();
            foreach (UrlAndHash urlAndHash in m_urlAndHashList)
            {
                urlAndHash.Encode(buf);
            }
            buf.EncodeTo(output);
        }

        /// <summary>Parse a <see cref="CertificateUrl"/> from a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="CertificateUrl"/> object.</returns>
        /// <exception cref="IOException"/>
        public static CertificateUrl Parse(TlsContext context, Stream input)
        {
            short type = TlsUtilities.ReadUint8(input);
            if (!CertChainType.IsValid(type))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int totalLength = TlsUtilities.ReadUint16(input);
            if (totalLength < 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            byte[] urlAndHashListData = TlsUtilities.ReadFully(totalLength, input);

            MemoryStream buf = new MemoryStream(urlAndHashListData, false);

            var url_and_hash_list = new List<UrlAndHash>();
            while (buf.Position < buf.Length)
            {
                UrlAndHash url_and_hash = UrlAndHash.Parse(context, buf);
                url_and_hash_list.Add(url_and_hash);
            }

            if (type == CertChainType.pkipath && url_and_hash_list.Count != 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return new CertificateUrl(type, url_and_hash_list);
        }

        // TODO Could be more generally useful
        internal class ListBuffer16
             : MemoryStream
        {
            internal ListBuffer16()
            {
                // Reserve space for length
                TlsUtilities.WriteUint16(0, this);
            }

            internal void EncodeTo(Stream output)
            {
                // Patch actual length back in
                int length = Convert.ToInt32(Length) - 2;
                TlsUtilities.CheckUint16(length);

                Seek(0L, SeekOrigin.Begin);
                TlsUtilities.WriteUint16(length, this);

                WriteTo(output);

                Platform.Dispose(this);
            }
        }
    }
}
