using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public sealed class ServerHello
    {
        private static readonly byte[] HelloRetryRequestMagic = { 0xCF, 0x21, 0xAD, 0x74, 0xE5, 0x9A, 0x61, 0x11, 0xBE,
            0x1D, 0x8C, 0x02, 0x1E, 0x65, 0xB8, 0x91, 0xC2, 0xA2, 0x11, 0x16, 0x7A, 0xBB, 0x8C, 0x5E, 0x07, 0x9E, 0x09,
            0xE2, 0xC8, 0xA8, 0x33, 0x9C };

        private readonly ProtocolVersion m_version;
        private readonly byte[] m_random;
        private readonly byte[] m_sessionID;
        private readonly int m_cipherSuite;
        private readonly IDictionary<int, byte[]> m_extensions;

        public ServerHello(byte[] sessionID, int cipherSuite, IDictionary<int, byte[]> extensions)
            : this(ProtocolVersion.TLSv12, Arrays.Clone(HelloRetryRequestMagic), sessionID, cipherSuite, extensions)
        {
        }

        public ServerHello(ProtocolVersion version, byte[] random, byte[] sessionID, int cipherSuite,
            IDictionary<int, byte[]> extensions)
        {
            this.m_version = version;
            this.m_random = random;
            this.m_sessionID = sessionID;
            this.m_cipherSuite = cipherSuite;
            this.m_extensions = extensions;
        }

        public int CipherSuite
        {
            get { return m_cipherSuite; }
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

        public bool IsHelloRetryRequest()
        {
            return Arrays.AreEqual(HelloRetryRequestMagic, m_random);
        }

        /// <summary>Encode this <see cref="ServerHello"/> to a <see cref="Stream"/>.</summary>
        /// <param name="context">the <see cref="TlsContext"/> of the current connection.</param>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(TlsContext context, Stream output)
        {
            TlsUtilities.WriteVersion(m_version, output);

            output.Write(m_random, 0, m_random.Length);

            TlsUtilities.WriteOpaque8(m_sessionID, output);

            TlsUtilities.WriteUint16(m_cipherSuite, output);

            TlsUtilities.WriteUint8(CompressionMethod.cls_null, output);

            TlsProtocol.WriteExtensions(output, m_extensions);
        }

        /// <summary>Parse a <see cref="ServerHello"/> from a <see cref="MemoryStream"/>.</summary>
        /// <param name="input">the <see cref="MemoryStream"/> to parse from.</param>
        /// <returns>a <see cref="ServerHello"/> object.</returns>
        /// <exception cref="IOException"/>
        public static ServerHello Parse(MemoryStream input)
        {
            ProtocolVersion version = TlsUtilities.ReadVersion(input);

            byte[] random = TlsUtilities.ReadFully(32, input);

            byte[] sessionID = TlsUtilities.ReadOpaque8(input, 0, 32);

            int cipherSuite = TlsUtilities.ReadUint16(input);

            short compressionMethod = TlsUtilities.ReadUint8(input);
            if (CompressionMethod.cls_null != compressionMethod)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            var extensions = TlsProtocol.ReadExtensions(input);

            return new ServerHello(version, random, sessionID, cipherSuite, extensions);
        }
    }
}
