using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 7301 Represents a protocol name for use with ALPN.</summary>
    public sealed class ProtocolName
    {
        public static ProtocolName AsRawBytes(byte[] bytes)
        {
            return new ProtocolName(Arrays.Clone(bytes));
        }

        public static ProtocolName AsUtf8Encoding(string name)
        {
            return new ProtocolName(Strings.ToUtf8ByteArray(name));
        }

        public static readonly ProtocolName Http_1_1 = AsUtf8Encoding("http/1.1");
        public static readonly ProtocolName Spdy_1 = AsUtf8Encoding("spdy/1");
        public static readonly ProtocolName Spdy_2 = AsUtf8Encoding("spdy/2");
        public static readonly ProtocolName Spdy_3 = AsUtf8Encoding("spdy/3");
        public static readonly ProtocolName Stun_Turn = AsUtf8Encoding("stun.turn");
        public static readonly ProtocolName Stun_Nat_Discovery = AsUtf8Encoding("stun.nat-discovery");
        public static readonly ProtocolName Http_2_Tls = AsUtf8Encoding("h2");
        public static readonly ProtocolName Http_2_Tcp = AsUtf8Encoding("h2c");
        public static readonly ProtocolName WebRtc = AsUtf8Encoding("webrtc");
        public static readonly ProtocolName WebRtc_Confidential = AsUtf8Encoding("c-webrtc");
        public static readonly ProtocolName Ftp = AsUtf8Encoding("ftp");
        public static readonly ProtocolName Imap = AsUtf8Encoding("imap");
        public static readonly ProtocolName Pop3 = AsUtf8Encoding("pop3");
        public static readonly ProtocolName ManageSieve = AsUtf8Encoding("managesieve");
        public static readonly ProtocolName Coap = AsUtf8Encoding("coap");
        public static readonly ProtocolName Xmpp_Client = AsUtf8Encoding("xmpp-client");
        public static readonly ProtocolName Xmpp_Server = AsUtf8Encoding("xmpp-server");
        public static readonly ProtocolName Acme_Tls_1 = AsUtf8Encoding("acme-tls/1");
        public static readonly ProtocolName Oasis_Mqtt = AsUtf8Encoding("mqtt");
        public static readonly ProtocolName Dns_Over_Tls = AsUtf8Encoding("dot");
        public static readonly ProtocolName Ntske_1 = AsUtf8Encoding("ntske/1");
        public static readonly ProtocolName Sun_Rpc = AsUtf8Encoding("sunrpc");
        public static readonly ProtocolName Http_3 = AsUtf8Encoding("h3");
        public static readonly ProtocolName Smb_2 = AsUtf8Encoding("smb");
        public static readonly ProtocolName Irc = AsUtf8Encoding("irc");
        public static readonly ProtocolName Nntp_Reading = AsUtf8Encoding("nntp");
        public static readonly ProtocolName Nntp_Transit = AsUtf8Encoding("nnsp");
        public static readonly ProtocolName Dns_Over_Quic = AsUtf8Encoding("doq");

        private readonly byte[] m_bytes;

        private ProtocolName(byte[] bytes)
        {
            if (bytes == null)
                throw new ArgumentNullException("bytes");
            if (bytes.Length < 1 || bytes.Length > 255)
                throw new ArgumentException("must have length from 1 to 255", "bytes");

            this.m_bytes = bytes;
        }

        public byte[] GetBytes()
        {
            return Arrays.Clone(m_bytes);
        }

        public string GetUtf8Decoding()
        {
            return Strings.FromUtf8ByteArray(m_bytes);
        }

        /// <summary>Encode this <see cref="ProtocolName"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteOpaque8(m_bytes, output);
        }

        /// <summary>Parse a <see cref="ProtocolName"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="ProtocolName"/> object.</returns>
        /// <exception cref="IOException"/>
        public static ProtocolName Parse(Stream input)
        {
            return new ProtocolName(TlsUtilities.ReadOpaque8(input, 1));
        }

        public override bool Equals(object obj)
        {
            return obj is ProtocolName && Arrays.AreEqual(m_bytes, ((ProtocolName)obj).m_bytes);
        }

        public override int GetHashCode()
        {
            return Arrays.GetHashCode(m_bytes);
        }
    }
}
