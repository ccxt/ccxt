using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class ClientHello
    {
        private readonly ProtocolVersion m_version;
        private readonly byte[] m_random;
        private readonly byte[] m_sessionID;
        private readonly byte[] m_cookie;
        private readonly int[] m_cipherSuites;
        private readonly IDictionary<int, byte[]> m_extensions;
        private readonly int m_bindersSize;

        public ClientHello(ProtocolVersion version, byte[] random, byte[] sessionID, byte[] cookie,
            int[] cipherSuites, IDictionary<int, byte[]> extensions, int bindersSize)
        {
            this.m_version = version;
            this.m_random = random;
            this.m_sessionID = sessionID;
            this.m_cookie = cookie;
            this.m_cipherSuites = cipherSuites;
            this.m_extensions = extensions;
            this.m_bindersSize = bindersSize;
        }

        public int BindersSize
        {
            get { return m_bindersSize; }
        }

        public int[] CipherSuites
        {
            get { return m_cipherSuites; }
        }

        public byte[] Cookie
        {
            get { return m_cookie; }
        }

        public IDictionary<int, byte[]> Extensions
        {
            get { return m_extensions; }
        }

        public byte[] Random
        {
            get { return m_random; }
        }

        public byte[] SessionID
        {
            get { return m_sessionID; }
        }

        public ProtocolVersion Version
        {
            get { return m_version; }
        }

        /// <summary>Encode this <see cref="ClientHello"/> to a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(TlsContext context, Stream output)
        {
            if (m_bindersSize < 0)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            TlsUtilities.WriteVersion(m_version, output);

            output.Write(m_random, 0, m_random.Length);

            TlsUtilities.WriteOpaque8(m_sessionID, output);

            if (null != m_cookie)
            {
                TlsUtilities.WriteOpaque8(m_cookie, output);
            }

            TlsUtilities.WriteUint16ArrayWithUint16Length(m_cipherSuites, output);

            TlsUtilities.WriteUint8ArrayWithUint8Length(new short[]{ CompressionMethod.cls_null }, output);

            TlsProtocol.WriteExtensions(output, m_extensions, m_bindersSize);
        }

        /// <summary>Parse a <see cref="ClientHello"/> from a <see cref="MemoryStream"/>.</summary>
        /// <param name="messageInput">the <see cref="MemoryStream"/> to parse from.</param>
        /// <param name="dtlsOutput">for DTLS this should be non-null; the input is copied to this
        /// <see cref="Stream"/>, minus the cookie field.</param>
        /// <returns>a <see cref="ClientHello"/> object.</returns>
        /// <exception cref="TlsFatalAlert"/>
        public static ClientHello Parse(MemoryStream messageInput, Stream dtlsOutput)
        {
            try
            {
                return ImplParse(messageInput, dtlsOutput);
            }
            catch (TlsFatalAlert e)
            {
                throw e;
            }
            catch (IOException e)
            {
                throw new TlsFatalAlert(AlertDescription.decode_error, e);
            }
        }

        /// <exception cref="IOException"/>
        private static ClientHello ImplParse(MemoryStream messageInput, Stream dtlsOutput)
        {
            Stream input = messageInput;
            if (null != dtlsOutput)
            {
                input = new TeeInputStream(input, dtlsOutput);
            }

            ProtocolVersion clientVersion = TlsUtilities.ReadVersion(input);

            byte[] random = TlsUtilities.ReadFully(32, input);

            byte[] sessionID = TlsUtilities.ReadOpaque8(input, 0, 32);

            byte[] cookie = null;
            if (null != dtlsOutput)
            {
                /*
                 * RFC 6347 This specification increases the cookie size limit to 255 bytes for greater
                 * future flexibility. The limit remains 32 for previous versions of DTLS.
                 */
                int maxCookieLength = ProtocolVersion.DTLSv12.IsEqualOrEarlierVersionOf(clientVersion) ? 255 : 32;

                cookie = TlsUtilities.ReadOpaque8(messageInput, 0, maxCookieLength);
            }

            int cipher_suites_length = TlsUtilities.ReadUint16(input);
            if (cipher_suites_length < 2 || (cipher_suites_length & 1) != 0
                || Convert.ToInt32(messageInput.Length - messageInput.Position) < cipher_suites_length)
            {
                throw new TlsFatalAlert(AlertDescription.decode_error);
            }

            /*
             * NOTE: "If the session_id field is not empty (implying a session resumption request) this
             * vector must include at least the cipher_suite from that session."
             */
            int[] cipherSuites = TlsUtilities.ReadUint16Array(cipher_suites_length / 2, input);

            short[] compressionMethods = TlsUtilities.ReadUint8ArrayWithUint8Length(input, 1);
            if (!Arrays.Contains(compressionMethods, CompressionMethod.cls_null))
                throw new TlsFatalAlert(AlertDescription.handshake_failure);

            /*
             * NOTE: Can't use TlsProtocol.ReadExtensions directly because TeeInputStream a) won't have
             * 'Length' or 'Position' properties in the FIPS provider, b) isn't a MemoryStream.
             */
            IDictionary<int, byte[]> extensions = null;
            if (messageInput.Position < messageInput.Length)
            {
                byte[] extBytes = TlsUtilities.ReadOpaque16(input);

                TlsProtocol.AssertEmpty(messageInput);

                extensions = TlsProtocol.ReadExtensionsDataClientHello(extBytes);
            }

            return new ClientHello(clientVersion, random, sessionID, cookie, cipherSuites, extensions, -1);
        }
    }
}
